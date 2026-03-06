"""
Anreicherung: spezialgebiete + boolean-Felder + KI-generierte Beschreibung
Crawlt jede Website einmal (5 parallel), matcht Keywords und generiert
via Google Gemini Flash einen Beschreibungs-Absatz.

Usage:
    python scripts/enrich_spezialgebiete.py --limit 5    # Testlauf
    python scripts/enrich_spezialgebiete.py               # Alle Eintraege
    python scripts/enrich_spezialgebiete.py --resume      # Fortsetzen

Voraussetzung:
    GEMINI_API_KEY=... in .env.local eintragen
    (kostenlos: https://aistudio.google.com/apikey)

Limits Gemini Free Tier:
    15 Req/Min, 1.500 Req/Tag
    -> 3.000 Eintraege benoetigen 2 Laeufe (jeweils ~2h), --resume fuer Tag 2

Output:
    scripts/ksw_mit_spezialgebiete.csv
"""

import asyncio
import csv
import os
import re
import sys
import time
import argparse
import datetime
from pathlib import Path

os.environ["PYTHONIOENCODING"] = "utf-8"
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

# .env.local laden
_env = Path(__file__).parent.parent / ".env.local"
if _env.exists():
    for _line in _env.read_text(encoding="utf-8").splitlines():
        _line = _line.strip()
        if _line and not _line.startswith("#") and "=" in _line:
            _k, _v = _line.split("=", 1)
            os.environ.setdefault(_k.strip(), _v.strip().strip('"').strip("'"))

from google import genai
from google.genai import types as genai_types
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig

# ── Konfiguration ──────────────────────────────────────────────────────────────

INPUT_FILE    = Path(__file__).parent / "ksw_mit_website.csv"
OUTPUT_FILE   = Path(__file__).parent / "ksw_mit_spezialgebiete.csv"
PROGRESS_FILE = Path(__file__).parent / "enrich_progress.txt"
MAX_WORKERS   = 5          # parallele Crawls
PAGE_TIMEOUT  = 10_000     # ms
GEMINI_MODEL  = "gemini-2.5-flash-lite"  # schnell + guenstig, Free-Tier verfuegbar
GEMINI_RPM    = 28         # Free-Tier: 30 RPM
MAX_MD_CHARS  = 8_000      # Zeichen Markdown -> Gemini

# ── Spezialgebiete ─────────────────────────────────────────────────────────────

SPEZIALGEBIETE = [
    ("Einkommensteuer",             ["einkommensteuer", "arbeitnehmerveranlagung", "steuererklärung", "lohnsteuer"]),
    ("Körperschaftsteuer",          ["körperschaftsteuer", "kapitalgesellschaft", "gmbh-steuer", "körperschaft"]),
    ("Umsatzsteuer",                ["umsatzsteuer", "mehrwertsteuer", "vorsteuer", "ust-voranmeldung"]),
    ("Lohnverrechnung",             ["lohnverrechnung", "lohnabrechnung", "personalverrechnung", "dienstnehmermeldung", "sozialversicherung"]),
    ("Jahresabschluss",             ["jahresabschluss", "bilanzierung", "bilanz", "gewinn- und verlustrechnung"]),
    ("Buchhaltung",                 ["buchhaltung", "buchführung", "finanzbuchhaltung", "belegverarbeitung", "kontierung"]),
    ("Unternehmensberatung",        ["unternehmensberatung", "betriebsberatung", "controlling", "unternehmensstrategie", "businessplan"]),
    ("Steuerplanung",               ["steuerplanung", "steuergestaltung", "steueroptimierung", "steuerstrategie"]),
    ("Internationales Steuerrecht", ["internationales steuerrecht", "doppelbesteuerung", "transfer pricing", "auslandsbesteuerung", "eu-steuerrecht"]),
    ("Immobiliensteuer",            ["immobilien", "grunderwerbsteuer", "vermietung und verpachtung", "immobilienbesteuerung", "grundsteuer"]),
    ("Kryptosteuer",                ["krypto", "bitcoin", "blockchain", "kryptowährung", "nft"]),
    ("Erbschaft & Schenkung",       ["erbschaft", "schenkung", "vermögensnachfolge", "übergabe", "nachlassplanung"]),
    ("Gemeinnützigkeit",            ["gemeinnützig", "ngo", "non-profit", "vereine", "stiftung", "wohltätig"]),
    ("Insolvenzrecht",              ["insolvenz", "sanierung", "restrukturierung", "konkurs", "schuldenregulierung"]),
    ("Landwirtschaft",              ["landwirtschaft", "agrar", "forstwirtschaft", "weinbau", "landwirt", "bäuerlich"]),
    ("Ärzte & Freie Berufe",        ["arzt", "ärzte", "freie berufe", "mediziner", "zahnarzt", "apotheker", "notar", "rechtsanwalt"]),
    ("Start-ups & Gründung",        ["gründung", "startup", "start-up", "jungunternehmer", "neugründung", "gründungsberatung"]),
]

# ── Boolean-Felder ─────────────────────────────────────────────────────────────

KW_GRATIS = [
    "gratis erstgespräch", "kostenloses erstgespräch", "kostenlose erstberatung",
    "unverbindliches erstgespräch", "kostenfreie erstberatung",
    "erstes gespräch kostenlos", "erstgespräch ohne kosten",
    "unverbindliche erstberatung", "kostenfrei kennenlernen",
]
KW_ONLINE = [
    "online-beratung", "online beratung", "videoberatung", "video-beratung",
    "zoom", "microsoft teams", "skype", "webex", "fernberatung",
    "digitale beratung", "remote beratung", "videokonferenz",
]
KW_ABEND = [
    "abendtermine", "abend termine", "nach 18 uhr", "auch abends",
    "außerhalb der bürozeiten", "abendstunden", "nach feierabend",
    "flexible termine",
]
KW_SCHNELL = [
    "24h", "24 stunden", "schnelle antwort", "innerhalb eines tages",
    "kurzfristig", "sofortige rückmeldung", "antwort innerhalb", "1 werktag",
]

# ── Gemini Prompt ──────────────────────────────────────────────────────────────

BESCHREIBUNG_PROMPT = """\
Du bist Texter fuer eine oesterreichische Steuerberater-Suchplattform.

Schreibe einen informativen Absatz (5-8 Saetze) ueber diese Steuerberatungskanzlei \
basierend auf dem Website-Inhalt unten.

Der Absatz soll abdecken:
- Welche Leistungen und Spezialisierungen die Kanzlei anbietet
- Fuer wen (Zielgruppe: Privatpersonen, KMU, Aerzte, Start-ups etc.)
- Besondere Staerken, Alleinstellungsmerkmale oder Besonderheiten
- Falls erkennbar: Erfahrung, Teamgroesse, Standort oder Sprachen

Regeln:
- Sachlich und professionell auf Deutsch
- Keine Werbeklischees wie "kompetent und zuverlaessig", "Ihr Partner fuer alle Belange"
- Direkt mit der Beschreibung beginnen, keine Einleitung wie "Diese Kanzlei..."
- Maximal 150 Woerter

Website-Inhalt:
"""

# ── Hilfsfunktionen ───────────────────────────────────────────────────────────

def normalize(text: str) -> str:
    return re.sub(r'\s+', ' ', text.lower()).strip()

def extract_keywords(text: str) -> dict:
    t = normalize(text)
    return {
        "spezialgebiete":       "|".join(n for n, kws in SPEZIALGEBIETE if any(kw in t for kw in kws)),
        "gratis_erstgespraech": "true" if any(kw in t for kw in KW_GRATIS)  else "false",
        "online_beratung":      "true" if any(kw in t for kw in KW_ONLINE)  else "false",
        "abendtermine":         "true" if any(kw in t for kw in KW_ABEND)   else "false",
        "schnellantwort":       "true" if any(kw in t for kw in KW_SCHNELL) else "false",
    }

EMPTY_FIELDS = {
    "beschreibung": "", "spezialgebiete": "",
    "gratis_erstgespraech": "false", "online_beratung": "false",
    "abendtermine": "false", "schnellantwort": "false",
}

# ── Gemini Rate-Limiter ────────────────────────────────────────────────────────

class RateLimiter:
    """Stellt sicher dass max. GEMINI_RPM Gemini-Calls pro Minute gemacht werden."""
    def __init__(self, rpm: int):
        self._interval = 60.0 / rpm
        self._lock     = asyncio.Lock()
        self._last     = 0.0

    async def wait(self):
        async with self._lock:
            now  = asyncio.get_event_loop().time()
            wait = self._interval - (now - self._last)
            if wait > 0:
                await asyncio.sleep(wait)
            self._last = asyncio.get_event_loop().time()


async def generate_beschreibung(
    client:     genai.Client,
    limiter:    RateLimiter,
    markdown:   str,
) -> str:
    """Generiert einen Beschreibungs-Absatz via Gemini mit Retry bei 429."""
    content = markdown[:MAX_MD_CHARS].strip()
    if not content:
        return ""

    for attempt in range(1, 4):
        try:
            await limiter.wait()
            response = await client.aio.models.generate_content(
                model=GEMINI_MODEL,
                contents=BESCHREIBUNG_PROMPT + content,
                config=genai_types.GenerateContentConfig(
                    temperature=0.4,
                    max_output_tokens=300,
                ),
            )
            return response.text.strip()
        except Exception as e:
            err = str(e)
            if "429" in err or "quota" in err.lower() or "resource_exhausted" in err.lower():
                wait = attempt * 30
                print(f"    [Gemini 429] Warte {wait}s...", flush=True)
                await asyncio.sleep(wait)
            else:
                print(f"    [Gemini Fehler] {err[:120]}", flush=True)
                return ""
    return ""

# ── Parallel Worker ───────────────────────────────────────────────────────────

async def process_row(
    crawler:    AsyncWebCrawler,
    config:     CrawlerRunConfig,
    semaphore:  asyncio.Semaphore,
    write_lock: asyncio.Lock,
    writer:     csv.DictWriter,
    out_f,
    counter:    list,
    client:     genai.Client,
    limiter:    RateLimiter,
    row:        dict,
) -> None:
    async with semaphore:
        website = row.get("website", "").strip()

        if not website:
            result = dict(EMPTY_FIELDS)
            status = "keine_website"
        else:
            if not website.startswith("http"):
                website = "https://" + website
            try:
                res = await crawler.arun(url=website, config=config)
                if not res.success:
                    result, status = dict(EMPTY_FIELDS), "fehler"
                else:
                    md     = res.markdown or ""
                    result = extract_keywords(md)
                    result["beschreibung"] = await generate_beschreibung(client, limiter, md)
                    status = "ok"
            except Exception as e:
                result, status = dict(EMPTY_FIELDS), f"fehler: {str(e)[:80]}"

        out_row = {**row, **result}

        async with write_lock:
            writer.writerow(out_row)
            out_f.flush()

            counter[0] += 1
            if status == "ok":                counter[2] += 1
            elif status != "keine_website":   counter[3] += 1

            done    = counter[0]
            total   = counter[1]
            elapsed = time.time() - counter[4]
            pct     = done / total * 100
            rate    = done / elapsed if elapsed > 0 else 0
            eta_s   = (total - done) / rate if rate > 0 else 0
            eta_str = str(datetime.timedelta(seconds=int(eta_s)))
            ela_str = str(datetime.timedelta(seconds=int(elapsed)))

            symbol = "+" if status == "ok" else "o" if status == "keine_website" else "!"
            name   = row.get("name", "")[:38]
            flags  = (
                ("G" if result.get("gratis_erstgespraech") == "true" else ".")
                + ("O" if result.get("online_beratung")    == "true" else ".")
                + ("A" if result.get("abendtermine")       == "true" else ".")
                + ("S" if result.get("schnellantwort")     == "true" else ".")
            )
            desc_prev = result.get("beschreibung", "")[:50].replace("\n", " ")
            line = (
                f"  {symbol} {done:>4}/{total} [{flags}] {pct:>5.1f}%"
                f" | ela {ela_str} | eta {eta_str}"
                f" | {name:<35} | {desc_prev}"
            )
            print(line, flush=True)

            # Progress-Datei aktualisieren (jederzeit lesbar)
            with open(PROGRESS_FILE, "w", encoding="utf-8") as pf:
                pf.write(f"Stand:    {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                pf.write(f"Gesamt:   {done}/{total} ({pct:.1f}%)\n")
                pf.write(f"OK:       {counter[2]} | Fehler: {counter[3]}\n")
                pf.write(f"Laufzeit: {ela_str} | ETA: {eta_str}\n")
                pf.write(f"Zuletzt:  {row.get('name','')[:60]}\n")

# ── Hauptprogramm ─────────────────────────────────────────────────────────────

async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit",  type=int, default=0)
    parser.add_argument("--resume", action="store_true")
    args = parser.parse_args()

    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        print("[FEHLER] GEMINI_API_KEY nicht gesetzt.")
        print("  Kostenlos holen: https://aistudio.google.com/apikey")
        print("  Dann in .env.local eintragen: GEMINI_API_KEY=dein-key")
        sys.exit(1)

    client  = genai.Client(api_key=api_key)
    limiter = RateLimiter(rpm=GEMINI_RPM)

    with open(INPUT_FILE, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))

    aktiv = [r for r in rows if r.get("status", "").lower() != "ruhend"]
    print(f"Eingabe: {len(rows)} | Aktiv: {len(aktiv)} | Ruhend: {len(rows)-len(aktiv)}")

    done_keys: set[str] = set()
    if args.resume and OUTPUT_FILE.exists():
        with open(OUTPUT_FILE, newline="", encoding="utf-8-sig") as f:
            for r in csv.DictReader(f):
                done_keys.add(f"{r.get('name','')}|{r.get('plz','')}")
        print(f"Resume:  {len(done_keys)} bereits verarbeitet")

    todo = [r for r in aktiv if f"{r.get('name','')}|{r.get('plz','')}" not in done_keys]
    if args.limit:
        todo = todo[:args.limit]

    print(f"Zu verarbeiten: {len(todo)} | Workers: {MAX_WORKERS} | Gemini: {GEMINI_MODEL} ({GEMINI_RPM} RPM)")
    print(f"Hinweis: Free-Tier-Limit = 1.500 Req/Tag -> ggf. 2 Laeufe mit --resume noetig")
    print(f"\n  Legende: G=Gratis O=Online A=Abend S=Schnell\n")

    if not todo:
        print("Nichts zu tun.")
        return

    new_cols     = ["beschreibung", "spezialgebiete", "gratis_erstgespraech",
                    "online_beratung", "abendtermine", "schnellantwort"]
    input_fields = list(rows[0].keys())
    out_fields   = input_fields + [c for c in new_cols if c not in input_fields]

    write_header = not (args.resume and OUTPUT_FILE.exists())
    out_f  = open(OUTPUT_FILE, "a" if args.resume else "w", newline="", encoding="utf-8-sig")
    writer = csv.DictWriter(out_f, fieldnames=out_fields, extrasaction="ignore")
    if write_header:
        writer.writeheader()

    config     = CrawlerRunConfig(word_count_threshold=5, verbose=False, page_timeout=PAGE_TIMEOUT)
    semaphore  = asyncio.Semaphore(MAX_WORKERS)
    write_lock = asyncio.Lock()
    counter    = [0, len(todo), 0, 0, time.time()]  # done, total, ok, fehler, start_time

    async with AsyncWebCrawler(headless=True, verbose=False) as crawler:
        await asyncio.gather(*[
            process_row(crawler, config, semaphore, write_lock, writer,
                        out_f, counter, client, limiter, row)
            for row in todo
        ])

    out_f.close()
    print(f"\n{'='*60}")
    print(f"Fertig: {counter[0]} | OK: {counter[2]} | Fehler: {counter[3]}")
    print(f"Output: {OUTPUT_FILE}")


if __name__ == "__main__":
    asyncio.run(main())
