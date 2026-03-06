"""
Website-Anreicherungs-Crawler v2 (Claude-powered)
Besucht die Website jedes KSW-Eintrags, sendet den Inhalt an Claude Haiku
und extrahiert alle relevanten Felder strukturiert als JSON.

Usage:
    python scripts/enrich_websites.py
    python scripts/enrich_websites.py --limit 5      # Testlauf
    python scripts/enrich_websites.py --resume       # Fortsetzen
"""

import asyncio
import csv
import json
import os
import re
import sys
import argparse
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

# Windows UTF-8 Fix
os.environ["PYTHONIOENCODING"] = "utf-8"
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

# .env.local laden (für ANTHROPIC_API_KEY)
_env_file = Path(__file__).parent.parent / ".env.local"
if _env_file.exists():
    for _line in _env_file.read_text(encoding="utf-8").splitlines():
        _line = _line.strip()
        if _line and not _line.startswith("#") and "=" in _line:
            _k, _v = _line.split("=", 1)
            os.environ.setdefault(_k.strip(), _v.strip().strip('"').strip("'"))

import anthropic
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig

# ── Konfiguration ──────────────────────────────────────────────────────────────

INPUT_FILE           = Path(__file__).parent / "ksw_mit_website.csv"
OUTPUT_FILE          = Path(__file__).parent / "ksw_angereichert.csv"
DELAY_BETWEEN_SITES  = 2.0
PAGE_TIMEOUT_SECONDS = 15
MAX_CONTENT_LENGTH   = 10_000   # Zeichen Markdown → Claude
CLAUDE_MODEL         = "claude-haiku-4-5-20251001"

# ── Felder ────────────────────────────────────────────────────────────────────

INPUT_FIELDS = [
    "name", "berufsbezeichnung", "status", "strasse", "plz", "ort",
    "gemeinde", "bezirk", "telefon_1", "telefon_2", "telefon_3",
    "fax", "email", "website", "seite",
]

ENRICHED_FIELDS = [
    "ksw_mitglied",           # immer "true" – alle Einträge sind KSW-Mitglieder
    "berufsbezeichnung_db",   # Enum: STEUERBERATER | WIRTSCHAFTSPRUEFER | BEIDES | …
    "beschreibung",           # Claude-generiert: 2–3 sachliche Sätze
    "tags",                   # Pipe-separiert: Einkommensteuer|Lohnverrechnung|…
    "mandantengruppen",       # Pipe-separiert: KMU|Privatpersonen|…
    "languages",              # Pipe-separiert: Deutsch|Englisch|…
    "gratis_erstgespraech",   # "true" / "false"
    "online_beratung",        # "true" / "false"
    "schnellantwort",         # "true" / "false"
    "oeffnungszeiten",        # Freitext, z.B. "Mo–Fr 09:00–17:00"
    "video_url",              # YouTube / Vimeo (Regex)
    "terminbuchung_url",      # Calendly / Timify etc. (Regex)
    "email_website",          # Email von Website wenn KSW-Email fehlt (Regex)
    "anreicherung_status",    # ok | fehler | timeout | keine_website
    "anreicherung_fehler",
    "anreicherung_datum",
]

ALL_FIELDS = INPUT_FIELDS + ENRICHED_FIELDS

# ── Claude Prompt ──────────────────────────────────────────────────────────────

EXTRACTION_PROMPT = """\
Du bist ein Datenextraktions-Assistent für österreichische Steuerberater-Profile.

Analysiere den Website-Inhalt unten und extrahiere die Informationen als JSON.

Regeln:
- Antworte NUR mit validem JSON, keine Erklärungen davor oder danach.
- Leere Felder: "" oder [].
- beschreibung: 2–3 sachliche, professionelle Sätze auf Deutsch über die Kanzlei \
(Leistungsschwerpunkte, Zielgruppe, besondere Stärken). \
Keine Werbeklischees wie "kompetent und zuverlässig" oder "Ihr Partner".
- tags: Nur Werte aus dieser Liste wählen – Einkommensteuer, Körperschaftsteuer, \
Umsatzsteuer, Lohnverrechnung, Jahresabschluss, Buchhaltung, Unternehmensberatung, \
Steuerplanung, Internationales Steuerrecht, Immobiliensteuer, Kryptosteuer, \
Erbschaftssteuer, Gemeinnützigkeit, Insolvenzrecht, Landwirtschaft.
- mandantengruppen: Nur Werte aus dieser Liste – Privatpersonen, KMU, Konzerne, \
Start-ups, Freiberufler, Vereine, Landwirtschaft.
- languages: Nur Sprachen ZUSÄTZLICH zu Deutsch (Englisch, Kroatisch, Türkisch, \
Rumänisch, Polnisch, Ungarisch, Slowakisch, Tschechisch, Italienisch, Französisch, \
Spanisch, Serbisch, Bosnisch). Leeres Array wenn nur Deutsch.
- oeffnungszeiten: Kompakter Text, z.B. "Mo–Fr 09:00–17:00, Sa 09:00–12:00", \
oder "" wenn nicht gefunden.
- gratis_erstgespraech: true nur wenn ein kostenloses/unverbindliches Erstgespräch \
klar erwähnt wird.
- online_beratung: true wenn Video- oder Online-Beratung angeboten wird.
- schnellantwort: true wenn Antwort innerhalb 24 h oder ähnliches versprochen wird.

Antworte mit exakt diesem JSON-Schema:
{
  "beschreibung": "",
  "tags": [],
  "mandantengruppen": [],
  "languages": [],
  "oeffnungszeiten": "",
  "gratis_erstgespraech": false,
  "online_beratung": false,
  "schnellantwort": false
}

Website-Inhalt:
"""

# ── Regex ──────────────────────────────────────────────────────────────────────

RE_EMAIL      = re.compile(r'[\w.+\-]+@[\w\-]+\.[a-z]{2,}', re.IGNORECASE)
RE_YOUTUBE    = re.compile(r'https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[\w\-]+')
RE_VIMEO      = re.compile(r'https?://(?:www\.)?vimeo\.com/\d+')
RE_BOOKING    = re.compile(
    r'https?://[^\s"\'<>]*(?:calendly|timifyme|appointlet|doodle|bookings\.microsoft|acuity)[^\s"\'<>]*',
    re.IGNORECASE,
)
RE_STRIP_TAGS = re.compile(r'<[^>]+>')

# ── Hilfsfunktionen ───────────────────────────────────────────────────────────

def strip_tags(html: str) -> str:
    return RE_STRIP_TAGS.sub(' ', html).strip()

def map_berufsbezeichnung(ksw_value: str) -> str:
    v = ksw_value.strip().upper()
    if "WP" in v and ("STB" in v or "STEUER" in v):
        return "BEIDES"
    if "WP" in v or "WIRTSCHAFTSPRÜFER" in v:
        return "WIRTSCHAFTSPRUEFER"
    if "BILANZBUCHHALTER" in v:
        return "BILANZBUCHHALTER"
    if "BUCHHALTER" in v:
        return "BUCHHALTER"
    return "STEUERBERATER"

def extract_email_from_website(full_text: str, ksw_email: str) -> str:
    if ksw_email.strip():
        return ""
    SKIP = ["example.", "test@", "@sentry.", "@google.", "@w3.", "noreply", "no-reply"]
    for em in RE_EMAIL.findall(full_text):
        if not any(s in em.lower() for s in SKIP):
            return em
    return ""

def extract_video_url(html: str) -> str:
    m = RE_YOUTUBE.search(html) or RE_VIMEO.search(html)
    return m.group(0) if m else ""

def extract_booking_url(html: str) -> str:
    m = RE_BOOKING.search(html)
    return m.group(0) if m else ""

def fmt_list(val) -> str:
    if isinstance(val, list):
        return "|".join(str(v).strip() for v in val if v)
    return str(val).strip() if val else ""

# ── Claude Extraktion ──────────────────────────────────────────────────────────

async def extract_with_claude(client: anthropic.AsyncAnthropic, markdown: str) -> dict:
    """Sendet Website-Markdown an Claude Haiku und gibt extrahierte Felder zurück."""
    try:
        msg = await client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=1024,
            messages=[{
                "role": "user",
                "content": EXTRACTION_PROMPT + markdown[:MAX_CONTENT_LENGTH],
            }],
        )
        text = msg.content[0].text.strip()
        m = re.search(r'\{[\s\S]*\}', text)
        if m:
            return json.loads(m.group(0))
        return {"_error": "Kein JSON im Claude-Output"}
    except json.JSONDecodeError as e:
        return {"_error": f"JSON-Fehler: {e}"}
    except Exception as e:
        return {"_error": str(e)[:150]}

# ── Leeres Ergebnis ────────────────────────────────────────────────────────────

def empty_enriched(status: str, error: str = "") -> dict:
    return {
        "beschreibung": "", "tags": "", "mandantengruppen": "",
        "languages": "Deutsch", "gratis_erstgespraech": "false",
        "online_beratung": "false", "schnellantwort": "false",
        "oeffnungszeiten": "", "video_url": "", "terminbuchung_url": "",
        "email_website": "",
        "anreicherung_status":  status,
        "anreicherung_fehler":  error[:200] if error else "",
        "anreicherung_datum":   date.today().isoformat(),
    }

# ── Anreicherung pro Eintrag ──────────────────────────────────────────────────

async def enrich_entry(
    crawler:      AsyncWebCrawler,
    crawl_config: CrawlerRunConfig,
    claude:       anthropic.AsyncAnthropic,
    row:          dict,
) -> dict:
    website   = row.get("website", "").strip()
    ksw_email = row.get("email",   "").strip()

    if not website:
        return empty_enriched("keine_website")

    if not website.startswith("http"):
        website = "https://" + website

    try:
        res = await crawler.arun(url=website, config=crawl_config)
        if not res.success:
            return empty_enriched("fehler", res.error_message or "")

        html      = res.html     or ""
        markdown  = res.markdown or ""
        full_text = markdown + " " + strip_tags(html)

        # Regex-Felder (schnell, kein Claude nötig)
        video_url     = extract_video_url(html)
        terminbuchung = extract_booking_url(html)
        email_web     = extract_email_from_website(full_text, ksw_email)

        # Claude-Extraktion
        data = await extract_with_claude(claude, markdown)
        if "_error" in data:
            return empty_enriched("fehler", data["_error"])

        langs = data.get("languages") or []
        if not isinstance(langs, list):
            langs = []
        if "Deutsch" not in langs:
            langs = ["Deutsch"] + langs

        return {
            "beschreibung":         data.get("beschreibung", ""),
            "tags":                 fmt_list(data.get("tags",           [])),
            "mandantengruppen":     fmt_list(data.get("mandantengruppen", [])),
            "languages":            fmt_list(sorted(langs)),
            "gratis_erstgespraech": "true" if data.get("gratis_erstgespraech") else "false",
            "online_beratung":      "true" if data.get("online_beratung")      else "false",
            "schnellantwort":       "true" if data.get("schnellantwort")        else "false",
            "oeffnungszeiten":      data.get("oeffnungszeiten", ""),
            "video_url":            video_url,
            "terminbuchung_url":    terminbuchung,
            "email_website":        email_web,
            "anreicherung_status":  "ok",
            "anreicherung_fehler":  "",
            "anreicherung_datum":   date.today().isoformat(),
        }

    except asyncio.TimeoutError:
        return empty_enriched("timeout", "Timeout nach 15s")
    except Exception as e:
        err = str(e)
        status = "geblockt" if any(x in err.lower() for x in ["cloudflare", "403", "captcha"]) else "fehler"
        return empty_enriched(status, err[:200])


# ── Hauptprogramm ─────────────────────────────────────────────────────────────

async def main():
    parser = argparse.ArgumentParser(description="KSW Website-Anreicherung (Claude-powered)")
    parser.add_argument("--limit",  type=int, default=0, help="Nur erste N Einträge verarbeiten")
    parser.add_argument("--resume", action="store_true",  help="Fortsetzen ab letztem Stand")
    args = parser.parse_args()

    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("[FEHLER] ANTHROPIC_API_KEY nicht gesetzt.")
        print("  Füge ANTHROPIC_API_KEY=sk-ant-... in .env.local ein.")
        sys.exit(1)

    if not INPUT_FILE.exists():
        print(f"[FEHLER] Eingabedatei nicht gefunden: {INPUT_FILE}")
        sys.exit(1)

    with open(INPUT_FILE, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))

    aktiv = [r for r in rows if r.get("status", "").lower() != "ruhend"]
    print(f"Eingabe:  {len(rows)} Einträge | Aktiv: {len(aktiv)} | Ruhend: {len(rows)-len(aktiv)}")

    if args.limit > 0:
        aktiv = aktiv[:args.limit]
        print(f"Limit:    {args.limit}")

    # Resume: bereits verarbeitete Keys laden
    done_keys: set[str] = set()
    if args.resume and OUTPUT_FILE.exists():
        with open(OUTPUT_FILE, newline="", encoding="utf-8-sig") as f:
            for existing in csv.DictReader(f):
                done_keys.add(f"{existing.get('name','')}|{existing.get('plz','')}")
        print(f"Resume:   {len(done_keys)} bereits verarbeitet → werden übersprungen")

    write_header = not (args.resume and OUTPUT_FILE.exists())
    out_f  = open(OUTPUT_FILE, "a" if args.resume else "w", newline="", encoding="utf-8-sig")
    writer = csv.DictWriter(out_f, fieldnames=ALL_FIELDS)
    if write_header:
        writer.writeheader()

    crawl_config = CrawlerRunConfig(
        word_count_threshold=3,
        verbose=False,
        page_timeout=PAGE_TIMEOUT_SECONDS * 1000,
    )

    claude = anthropic.AsyncAnthropic()
    stats  = {"ok": 0, "fehler": 0, "timeout": 0, "keine_website": 0, "geblockt": 0}

    print(f"\nStarte Anreicherung mit {CLAUDE_MODEL}…\n")

    async with AsyncWebCrawler(headless=True, verbose=False) as crawler:
        for i, row in enumerate(aktiv):
            key = f"{row.get('name','')}|{row.get('plz','')}"
            if args.resume and key in done_keys:
                continue

            name    = row.get("name",    "")[:45]
            website = row.get("website", "").strip()

            enriched = await enrich_entry(crawler, crawl_config, claude, row)
            enriched["ksw_mitglied"]        = "true"
            enriched["berufsbezeichnung_db"] = map_berufsbezeichnung(row.get("berufsbezeichnung", ""))

            out_row = {f: row.get(f, "") for f in INPUT_FIELDS}
            out_row.update(enriched)
            writer.writerow(out_row)
            out_f.flush()

            status = enriched["anreicherung_status"]
            stats[status] = stats.get(status, 0) + 1

            symbol = "✓" if status == "ok" else ("○" if status == "keine_website" else "✗")
            desc_preview = enriched.get("beschreibung", "")[:60].replace("\n", " ")
            print(
                f"  {symbol} {i+1:>4}/{len(aktiv)} | {status:<10} | {name:<45} | {desc_preview}",
                flush=True,
            )

            if website:
                await asyncio.sleep(DELAY_BETWEEN_SITES)

    out_f.close()

    print(f"\n{'='*60}")
    print(f"Fertig: {sum(stats.values())} verarbeitet")
    for k, v in stats.items():
        if v:
            print(f"  {k}: {v}")
    print(f"\nOutput: {OUTPUT_FILE}")


if __name__ == "__main__":
    asyncio.run(main())
