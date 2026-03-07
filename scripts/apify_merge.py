"""
Apify Google Maps Scraper – Merge

Liest die Apify-Ergebnisse (JSON) und mergt Google-Rating + Öffnungszeiten
in die bestehende CSV.

Usage:
    python scripts/apify_merge.py --results scripts/apify_results.json
    python scripts/apify_merge.py --results scripts/apify_results.json --input scripts/ksw_mit_mandanten.csv

Neue Spalten im Output:
    google_bewertung          # 4.8
    google_bewertung_anzahl   # 127
    google_oeffnungszeiten    # Mo–Fr 09:00–17:00, Sa 09:00–12:00
    google_maps_url           # https://maps.google.com/...
    google_match_status       # ok | kein_treffer | niedrige_konfidenz

Output:
    scripts/ksw_mit_google.csv
"""

import csv
import json
import re
import sys
import os
import argparse
from pathlib import Path

os.environ["PYTHONIOENCODING"] = "utf-8"
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

# ── Konfiguration ──────────────────────────────────────────────────────────────

DEFAULT_INPUT = Path(__file__).parent / "ksw_mit_website.csv"
QUERIES_META  = Path(__file__).parent / "apify_queries_meta.json"
OUTPUT_FILE   = Path(__file__).parent / "ksw_mit_google.csv"

# Mindestanzahl Reviews damit ein Match als verlässlich gilt
MIN_REVIEWS_FOR_CONFIDENCE = 2

# ── Öffnungszeiten: Englisch → Deutsch ────────────────────────────────────────

_EN_TO_DE = {
    "monday":    "Mo", "tuesday":  "Di", "wednesday": "Mi",
    "thursday":  "Do", "friday":   "Fr", "saturday":  "Sa", "sunday": "So",
    "mon": "Mo", "tue": "Di", "wed": "Mi", "thu": "Do",
    "fri": "Fr", "sat": "Sa", "sun": "So",
}

def _ampm_to_24h(time_str: str) -> str:
    """'9:00 AM' → '09:00', '5:00 PM' → '17:00'"""
    m = re.match(r'(\d{1,2}):(\d{2})\s*(AM|PM)', time_str.strip(), re.IGNORECASE)
    if not m:
        return time_str.strip()
    h, mi, period = int(m.group(1)), m.group(2), m.group(3).upper()
    if period == "PM" and h != 12:
        h += 12
    if period == "AM" and h == 12:
        h = 0
    return f"{h:02d}:{mi}"

def format_opening_hours(apify_hours: list) -> str:
    """
    Konvertiert Apify-Öffnungszeiten (englische Tage, AM/PM) ins deutsche Format.

    Apify-Format:
        [{"day": "Monday", "hours": "9:00 AM – 5:00 PM"}, ...]

    Output:
        "Mo–Fr 09:00–17:00, Sa 09:00–12:00"
    """
    if not apify_hours:
        return ""

    parts = []
    prev_hours = None
    range_start = None

    days_order = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    # Nach Wochentag sortieren
    sorted_hours = sorted(
        apify_hours,
        key=lambda x: days_order.index(x.get("day", "").lower()) if x.get("day", "").lower() in days_order else 99
    )

    def flush_range(start_day, end_day, hours_str):
        start_abbr = _EN_TO_DE.get(start_day.lower(), start_day[:2])
        end_abbr   = _EN_TO_DE.get(end_day.lower(),   end_day[:2])
        # Zeitformat konvertieren
        time_match = re.search(r'([\d:]+\s*(?:AM|PM)?)\s*[–\-]\s*([\d:]+\s*(?:AM|PM)?)', hours_str, re.IGNORECASE)
        if time_match:
            t1 = _ampm_to_24h(time_match.group(1))
            t2 = _ampm_to_24h(time_match.group(2))
            if start_day.lower() == end_day.lower():
                return f"{start_abbr} {t1}–{t2}"
            return f"{start_abbr}–{end_abbr} {t1}–{t2}"
        return ""

    for entry in sorted_hours:
        day   = entry.get("day", "")
        hours = entry.get("hours", "Closed").strip()

        if hours.lower() in ("closed", "geschlossen", ""):
            if range_start is not None:
                r = flush_range(range_start, prev_day, prev_hours)
                if r:
                    parts.append(r)
                range_start = None
            prev_hours = None
            prev_day   = day
            continue

        if hours == prev_hours and range_start is not None:
            # Gleiche Zeiten: Range erweitern
            prev_day = day
        else:
            # Vorherige Range abschließen
            if range_start is not None:
                r = flush_range(range_start, prev_day, prev_hours)
                if r:
                    parts.append(r)
            range_start = day
            prev_day    = day
            prev_hours  = hours

    # Letzte Range abschließen
    if range_start is not None and prev_hours:
        r = flush_range(range_start, prev_day, prev_hours)
        if r:
            parts.append(r)

    return ", ".join(parts)

# ── Match-Konfidenz ────────────────────────────────────────────────────────────

def normalize_name(name: str) -> str:
    """Normalisiert einen Namen für den Vergleich."""
    name = re.sub(r'\b(?:GmbH|AG|KG|OG|KEG|eU|e\.U\.|Mag\.|Dr\.|Ing\.)\b', '', name, flags=re.IGNORECASE)
    name = re.sub(r'[^a-z0-9äöü]', ' ', name.lower())
    return re.sub(r'\s+', ' ', name).strip()

def check_confidence(row: dict, apify_result: dict) -> str:
    """
    Prüft ob der Google-Treffer zur gesuchten Kanzlei passt.
    Gibt 'ok' oder 'niedrige_konfidenz' zurück.
    """
    our_name    = normalize_name(row.get("name", ""))
    google_name = normalize_name(apify_result.get("title", ""))

    # Mindestens 2 gemeinsame Token
    our_tokens    = set(our_name.split())
    google_tokens = set(google_name.split())
    common        = our_tokens & google_tokens

    if len(common) < 2 and len(our_tokens) > 1:
        return "niedrige_konfidenz"

    # Plausibilitätscheck: PLZ in der Google-Adresse
    our_plz    = row.get("plz", "").strip()
    google_adr = apify_result.get("address", "")
    if our_plz and our_plz not in google_adr:
        return "niedrige_konfidenz"

    return "ok"

# ── Hauptprogramm ──────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Apify-Ergebnisse in CSV mergen")
    parser.add_argument("--results", required=True, help="Apify-Ergebnis-JSON (heruntergeladen von Apify)")
    parser.add_argument("--input",   default=str(DEFAULT_INPUT), help="Eingabe-CSV")
    args = parser.parse_args()

    results_file = Path(args.results)
    input_file   = Path(args.input)

    if not results_file.exists():
        print(f"[FEHLER] Ergebnisdatei nicht gefunden: {results_file}")
        sys.exit(1)
    if not input_file.exists():
        print(f"[FEHLER] Eingabedatei nicht gefunden: {input_file}")
        sys.exit(1)
    if not QUERIES_META.exists():
        print(f"[FEHLER] Meta-Datei nicht gefunden: {QUERIES_META}")
        print(f"  Zuerst python scripts/apify_prepare.py ausfuehren!")
        sys.exit(1)

    # ── Daten laden ───────────────────────────────────────────────────────────
    with open(results_file, encoding="utf-8") as f:
        apify_results = json.load(f)

    with open(QUERIES_META, encoding="utf-8") as f:
        meta = json.load(f)  # searchString → "name|plz"

    with open(input_file, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))

    print(f"Apify-Ergebnisse: {len(apify_results)}")
    print(f"CSV-Eintraege:    {len(rows)}")

    # ── Apify-Ergebnisse indexieren ───────────────────────────────────────────
    # Mapping: row_key (name|plz) → apify_result
    google_by_key: dict[str, dict] = {}

    stats = {"ok": 0, "niedrige_konfidenz": 0, "kein_treffer": 0}

    for result in apify_results:
        search_string = result.get("searchString", "")
        row_key = meta.get(search_string)
        if row_key:
            google_by_key[row_key] = result

    # ── CSV schreiben ─────────────────────────────────────────────────────────
    new_cols     = ["google_bewertung", "google_bewertung_anzahl",
                    "google_oeffnungszeiten", "google_maps_url", "google_match_status"]
    input_fields = list(rows[0].keys())
    out_fields   = input_fields + [c for c in new_cols if c not in input_fields]

    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8-sig") as out_f:
        writer = csv.DictWriter(out_f, fieldnames=out_fields, extrasaction="ignore")
        writer.writeheader()

        for row in rows:
            key    = f"{row.get('name', '')}|{row.get('plz', '')}"
            result = google_by_key.get(key)

            if result is None:
                google_data = {
                    "google_bewertung":         "",
                    "google_bewertung_anzahl":   "",
                    "google_oeffnungszeiten":    "",
                    "google_maps_url":           "",
                    "google_match_status":       "kein_treffer",
                }
                stats["kein_treffer"] += 1
            else:
                confidence = check_confidence(row, result)
                reviews    = result.get("reviewsCount", 0) or 0
                rating     = result.get("totalScore",   "")

                # Bei sehr niedrigem Review-Counts: Konfidenz senken
                if reviews < MIN_REVIEWS_FOR_CONFIDENCE and confidence == "ok":
                    confidence = "niedrige_konfidenz"

                hours = format_opening_hours(result.get("openingHours") or [])

                google_data = {
                    "google_bewertung":        str(rating) if rating else "",
                    "google_bewertung_anzahl":  str(reviews) if reviews else "",
                    "google_oeffnungszeiten":   hours,
                    "google_maps_url":          result.get("url", ""),
                    "google_match_status":      confidence,
                }
                stats[confidence] = stats.get(confidence, 0) + 1

                # Konsolenausgabe
                symbol  = "+" if confidence == "ok" else "~"
                name    = row.get("name", "")[:40]
                g_name  = result.get("title", "")[:30]
                print(
                    f"  {symbol} {name:<40} → {g_name:<30}"
                    f" | ★ {rating or '–'} ({reviews}) | {confidence}",
                    flush=True,
                )

            writer.writerow({**row, **google_data})

    print(f"\n{'='*60}")
    print(f"Fertig: {len(rows)} Eintraege")
    print(f"  OK:                  {stats.get('ok', 0)}")
    print(f"  Niedrige Konfidenz:  {stats.get('niedrige_konfidenz', 0)}  ← manuell pruefen!")
    print(f"  Kein Treffer:        {stats.get('kein_treffer', 0)}")
    print(f"\nOutput: {OUTPUT_FILE}")
    print(f"\nTipp: Eintraege mit google_match_status='niedrige_konfidenz' manuell validieren.")


if __name__ == "__main__":
    main()
