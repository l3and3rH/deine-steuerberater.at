"""
Mandantengruppen & Öffnungszeiten Anreicherung (kein LLM!)

Crawlt jede Website (25 parallel), matcht Mandantengruppen via Keyword-Matching
und extrahiert Öffnungszeiten via Regex + Schema.org – ohne externe API.

Usage:
    python scripts/enrich_mandanten.py --limit 5    # Testlauf
    python scripts/enrich_mandanten.py               # Alle Eintraege
    python scripts/enrich_mandanten.py --resume      # Fortsetzen ab letztem Stand

Output:
    scripts/ksw_mit_mandanten.csv
"""

import asyncio
import csv
import re
import sys
import os
import time
import argparse
import datetime
from pathlib import Path

os.environ["PYTHONIOENCODING"] = "utf-8"
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

from crawl4ai import AsyncWebCrawler, CrawlerRunConfig

# ── Konfiguration ──────────────────────────────────────────────────────────────

INPUT_FILE    = Path(__file__).parent / "ksw_mit_website.csv"
OUTPUT_FILE   = Path(__file__).parent / "ksw_mit_mandanten.csv"
PROGRESS_FILE = Path(__file__).parent / "mandanten_progress.txt"
MAX_WORKERS   = 25
PAGE_TIMEOUT  = 7_000   # ms – unique domains, kein Rate-Limit-Risiko

# ── Mandantengruppen Keywords ──────────────────────────────────────────────────

MANDANTEN = [
    ("KMU", [
        "kmu", "kleinunternehmen", "mittelstand", "klein- und mittelunternehmen",
        "kleine und mittlere unternehmen", "gewerbetreibende", "kmb",
        "klein- und mittelbetriebe", "gewerbe", "handel",
    ]),
    ("Privatpersonen", [
        "privatpersonen", "privatperson", "privatkunden", "privatmandanten",
        "privatbereich", "arbeitnehmer", "angestellte",
        "arbeitnehmerveranlagung", "privathaushalt", "privat",
    ]),
    ("Freiberufler", [
        "freiberufler", "freiberufliche", "selbständige", "freie berufe",
        "ärzte", "arzt", "mediziner", "zahnarzt", "apotheker", "notar",
        "rechtsanwalt", "architekten", "ingenieure", "therapeuten",
        "künstler", "journalisten", "freischaffende",
    ]),
    ("Vereine", [
        "vereine", "vereinsberatung", "nonprofit", "non-profit", "npo", "ngo",
        "gemeinnützig", "stiftungen", "soziale einrichtungen",
    ]),
    ("Konzerne", [
        "konzerne", "großunternehmen", "großbetriebe", "corporate", "holding",
        "unternehmensgruppen", "kapitalgesellschaften", "konzernberatung",
    ]),
    ("Start-ups", [
        "start-up", "startup", "start up", "gründer", "gründung", "neugründung",
        "jungunternehmer", "gründungsberatung",
    ]),
    ("Landwirtschaft", [
        "landwirtschaft", "landwirtschaftliche", "agrar", "bauern", "bäuerlich",
        "forstwirtschaft", "weinbau", "weinbauer", "landwirt",
    ]),
]

# ── Öffnungszeiten Regex ───────────────────────────────────────────────────────

_DAY  = r'(?:Mo(?:ntag)?|Di(?:enstag)?|Mi(?:ttwoch)?|Do(?:nnerstag)?|Fr(?:eitag)?|Sa(?:mstag)?|So(?:nntag)?)'
_TIME = r'\d{1,2}[:.]\d{2}(?:\s*Uhr)?'

# "Mo–Fr 09:00–17:00" oder "Mo - Fr: 09:00 - 17:00"
RE_RANGE = re.compile(
    rf'({_DAY})\s*[-–bis\s]+({_DAY})\s*:?\s*({_TIME})\s*[-–]\s*({_TIME})',
    re.IGNORECASE,
)
# "Mo: 09:00–13:00" (einzelner Tag)
RE_SINGLE = re.compile(
    rf'({_DAY})\s*:?\s*({_TIME})\s*[-–]\s*({_TIME})',
    re.IGNORECASE,
)
# Schema.org JSON-LD: "openingHours": "Mo-Fr 09:00-17:00"
RE_SCHEMA_JSON = re.compile(r'"openingHours"\s*:\s*"([^"]+)"', re.IGNORECASE)
# HTML-Attribut: openingHours="Mo-Fr 09:00-17:00"
RE_SCHEMA_ATTR = re.compile(r'openingHours\s*=\s*"([^"]+)"',  re.IGNORECASE)

_DAY_MAP = {
    "montag": "Mo", "dienstag": "Di", "mittwoch": "Mi", "donnerstag": "Do",
    "freitag": "Fr", "samstag": "Sa", "sonntag": "So",
    "mo": "Mo", "di": "Di", "mi": "Mi", "do": "Do",
    "fr": "Fr", "sa": "Sa", "so": "So",
}

def _abbrev(day: str) -> str:
    return _DAY_MAP.get(day.lower(), day[:2].title())

def _fmt_time(t: str) -> str:
    return t.strip().rstrip("Uurhr ").strip().replace(".", ":")

def normalize(text: str) -> str:
    return re.sub(r'\s+', ' ', text.lower()).strip()

def extract_mandantengruppen(text: str) -> str:
    t = normalize(text)
    return "|".join(name for name, kws in MANDANTEN if any(kw in t for kw in kws))

def extract_oeffnungszeiten(markdown: str, html: str) -> str:
    # 1. Schema.org (zuverlässigste Quelle)
    for pattern in (RE_SCHEMA_JSON, RE_SCHEMA_ATTR):
        m = pattern.search(html)
        if m:
            return m.group(1).strip()

    # 2. Regex auf Markdown-Text
    parts = []

    for m in RE_RANGE.finditer(markdown):
        d1, d2, t1, t2 = m.group(1), m.group(2), m.group(3), m.group(4)
        parts.append(f"{_abbrev(d1)}–{_abbrev(d2)} {_fmt_time(t1)}–{_fmt_time(t2)}")

    if not parts:
        for m in RE_SINGLE.finditer(markdown):
            d, t1, t2 = m.group(1), m.group(2), m.group(3)
            parts.append(f"{_abbrev(d)} {_fmt_time(t1)}–{_fmt_time(t2)}")

    # Deduplizieren, Reihenfolge beibehalten
    return ", ".join(dict.fromkeys(parts))

# ── Worker ─────────────────────────────────────────────────────────────────────

EMPTY = {"mandantengruppen": "", "oeffnungszeiten": ""}

async def process_row(
    crawler:    AsyncWebCrawler,
    config:     CrawlerRunConfig,
    semaphore:  asyncio.Semaphore,
    write_lock: asyncio.Lock,
    writer:     csv.DictWriter,
    out_f,
    counter:    list,
    row:        dict,
) -> None:
    async with semaphore:
        website = row.get("website", "").strip()

        if not website:
            result, status = dict(EMPTY), "keine_website"
        else:
            if not website.startswith("http"):
                website = "https://" + website
            try:
                res = await crawler.arun(url=website, config=config)
                if not res.success:
                    result, status = dict(EMPTY), "fehler"
                else:
                    md   = res.markdown or ""
                    html = res.html     or ""
                    result = {
                        "mandantengruppen": extract_mandantengruppen(md),
                        "oeffnungszeiten":  extract_oeffnungszeiten(md, html),
                    }
                    status = "ok"
            except Exception as e:
                result, status = dict(EMPTY), f"fehler: {str(e)[:80]}"

        out_row = {**row, **result}

        async with write_lock:
            writer.writerow(out_row)
            out_f.flush()

            counter[0] += 1
            if status == "ok":               counter[2] += 1
            elif status != "keine_website":  counter[3] += 1

            done    = counter[0]
            total   = counter[1]
            elapsed = time.time() - counter[4]
            pct     = done / total * 100
            rate    = done / elapsed if elapsed > 0 else 0
            eta_s   = (total - done) / rate if rate > 0 else 0
            eta_str = str(datetime.timedelta(seconds=int(eta_s)))
            ela_str = str(datetime.timedelta(seconds=int(elapsed)))

            symbol   = "+" if status == "ok" else "o" if status == "keine_website" else "!"
            name     = row.get("name", "")[:38]
            mandaten = result.get("mandantengruppen", "")[:28]
            oeffnung = result.get("oeffnungszeiten",  "")[:28]
            print(
                f"  {symbol} {done:>4}/{total} {pct:>5.1f}%"
                f" | ela {ela_str} | eta {eta_str}"
                f" | {name:<38} | {mandaten:<28} | {oeffnung}",
                flush=True,
            )

            with open(PROGRESS_FILE, "w", encoding="utf-8") as pf:
                pf.write(f"Stand:    {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                pf.write(f"Gesamt:   {done}/{total} ({pct:.1f}%)\n")
                pf.write(f"OK:       {counter[2]} | Fehler: {counter[3]}\n")
                pf.write(f"Laufzeit: {ela_str} | ETA: {eta_str}\n")
                pf.write(f"Zuletzt:  {row.get('name', '')[:60]}\n")

# ── Hauptprogramm ──────────────────────────────────────────────────────────────

async def main():
    parser = argparse.ArgumentParser(description="Mandantengruppen & Öffnungszeiten (kein LLM)")
    parser.add_argument("--limit",  type=int, default=0, help="Nur erste N Eintraege")
    parser.add_argument("--resume", action="store_true",  help="Fortsetzen ab letztem Stand")
    args = parser.parse_args()

    with open(INPUT_FILE, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))

    aktiv = [r for r in rows if r.get("status", "").lower() != "ruhend"]
    print(f"Eingabe: {len(rows)} | Aktiv: {len(aktiv)} | Ruhend: {len(rows) - len(aktiv)}")

    done_keys: set[str] = set()
    if args.resume and OUTPUT_FILE.exists():
        with open(OUTPUT_FILE, newline="", encoding="utf-8-sig") as f:
            for r in csv.DictReader(f):
                done_keys.add(f"{r.get('name', '')}|{r.get('plz', '')}")
        print(f"Resume:  {len(done_keys)} bereits verarbeitet")

    todo = [r for r in aktiv if f"{r.get('name','')}|{r.get('plz','')}" not in done_keys]
    if args.limit:
        todo = todo[:args.limit]

    print(f"Zu verarbeiten: {len(todo)} | Workers: {MAX_WORKERS}")
    if not todo:
        print("Nichts zu tun.")
        return

    input_fields = list(rows[0].keys())
    new_cols     = ["mandantengruppen", "oeffnungszeiten"]
    out_fields   = input_fields + [c for c in new_cols if c not in input_fields]

    write_header = not (args.resume and OUTPUT_FILE.exists())
    out_f  = open(OUTPUT_FILE, "a" if args.resume else "w", newline="", encoding="utf-8-sig")
    writer = csv.DictWriter(out_f, fieldnames=out_fields, extrasaction="ignore")
    if write_header:
        writer.writeheader()

    config     = CrawlerRunConfig(
        word_count_threshold=5,
        verbose=False,
        page_timeout=PAGE_TIMEOUT,
        wait_until="domcontentloaded",   # nicht auf Fonts/Ads/Analytics warten
        remove_overlay_elements=True,    # Cookie-Banner etc. sofort entfernen
    )
    semaphore  = asyncio.Semaphore(MAX_WORKERS)
    write_lock = asyncio.Lock()
    counter    = [0, len(todo), 0, 0, time.time()]  # done, total, ok, fehler, start_time

    print(f"\n  Legende: + OK  o keine Website  ! Fehler\n")

    async with AsyncWebCrawler(headless=True, verbose=False) as crawler:
        await asyncio.gather(*[
            process_row(crawler, config, semaphore, write_lock, writer, out_f, counter, row)
            for row in todo
        ])

    out_f.close()
    print(f"\n{'='*60}")
    print(f"Fertig: {counter[0]} | OK: {counter[2]} | Fehler: {counter[3]}")
    print(f"Output: {OUTPUT_FILE}")


if __name__ == "__main__":
    asyncio.run(main())
