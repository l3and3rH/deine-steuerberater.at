"""
Apify Google Maps Scraper – Vorbereitung

Liest die CSV-Eingabe und erzeugt zwei Dateien:
  1. apify_input.json   → direkt in den Apify Actor laden
  2. apify_queries_meta.json → internes Mapping für den Merge-Schritt

Verwendeter Apify Actor:
    compass/crawler-google-places
    https://apify.com/compass/crawler-google-places

Workflow:
    1. python scripts/apify_prepare.py
    2. apify_input.json in Apify hochladen und Actor starten
    3. Ergebnis-JSON von Apify herunterladen (Dataset → Export → JSON)
    4. python scripts/apify_merge.py --results apify_results.json

Usage:
    python scripts/apify_prepare.py
    python scripts/apify_prepare.py --input scripts/ksw_mit_mandanten.csv
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
APIFY_INPUT   = Path(__file__).parent / "apify_input.json"

# Apify Actor-Einstellungen
MAX_RESULTS_PER_QUERY = 1   # Nur den ersten Treffer je Kanzlei
LANGUAGE              = "de"
COUNTRY_CODE          = "at"

# ── Hilfsfunktionen ───────────────────────────────────────────────────────────

# Klammern und Rechtsformen kürzen um bessere Google-Treffer zu erzielen
RE_RECHTSFORM = re.compile(
    r'\b(?:GmbH|AG|KG|OG|KEG|e\.U\.|eU|GesbR|GmbH\s*&\s*Co\s*KG|'
    r'Steuerberatungsgesellschaft|Wirtschaftstreuhand|Wirtschaftsprüfungs-\s*und\s*Steuerberatungsgesellschaft)\b',
    re.IGNORECASE,
)

def clean_name(name: str) -> str:
    """Kürzt den Kanzleinamen auf das für Google relevante Kern-Stichwort."""
    name = RE_RECHTSFORM.sub("", name).strip(" ,.-&")
    name = re.sub(r'\s{2,}', ' ', name)
    return name.strip()

def build_query(row: dict) -> str:
    """Erzeugt den Google-Suchstring: '<Name> <Ort>'."""
    name = clean_name(row.get("name", ""))
    ort  = row.get("ort", row.get("gemeinde", "")).strip()
    return f"{name} {ort}".strip()

def row_key(row: dict) -> str:
    return f"{row.get('name', '')}|{row.get('plz', '')}"

# ── Hauptprogramm ──────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Apify-Queries vorbereiten")
    parser.add_argument("--input", default=str(DEFAULT_INPUT), help="Eingabe-CSV")
    args = parser.parse_args()

    input_file = Path(args.input)
    if not input_file.exists():
        print(f"[FEHLER] Eingabedatei nicht gefunden: {input_file}")
        sys.exit(1)

    with open(input_file, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))

    aktiv = [r for r in rows if r.get("status", "").lower() != "ruhend"]
    print(f"Eintraege: {len(rows)} gesamt | {len(aktiv)} aktiv")

    queries   = []   # Für Apify: [{searchString, ...}]
    meta      = {}   # Mapping: searchString → row_key

    seen_queries: set[str] = set()

    for row in aktiv:
        query = build_query(row)
        if not query.strip():
            continue

        # Doppelte Queries verhindern (gleicher Name, gleicher Ort)
        if query in seen_queries:
            query = f"{query} {row.get('plz', '')}".strip()
        seen_queries.add(query)

        queries.append({"searchString": query})
        meta[query] = row_key(row)

    # ── Apify Actor Input ──────────────────────────────────────────────────────
    apify_input = {
        "searchStringsArray":       [q["searchString"] for q in queries],
        "maxCrawledPlacesPerSearch": MAX_RESULTS_PER_QUERY,
        "language":                  LANGUAGE,
        "countryCode":               COUNTRY_CODE,
        "includeHistogram":          False,
        "includeOpeningHours":       True,
        "includePeopleAlsoSearch":   False,
        "maxImages":                 0,
        "maxReviews":                0,
    }

    APIFY_INPUT.write_text(json.dumps(apify_input, ensure_ascii=False, indent=2), encoding="utf-8")
    QUERIES_META.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\nErzeugt:")
    print(f"  {APIFY_INPUT}   ({len(queries)} Queries)")
    print(f"  {QUERIES_META}")
    print(f"\nNaechste Schritte:")
    print(f"  1. Apify Actor oeffnen: https://apify.com/compass/crawler-google-places")
    print(f"  2. Input → 'Input JSON' → Inhalt von apify_input.json einfuegen")
    print(f"  3. Actor starten und warten (~{len(queries)//60 + 1} Minuten)")
    print(f"  4. Dataset → Export → JSON herunterladen als 'apify_results.json'")
    print(f"  5. python scripts/apify_merge.py --results scripts/apify_results.json")
    print(f"\nGeschaetzte Kosten: ~${len(queries) * 0.002:.2f} USD ({len(queries)} Queries × $0.002)")


if __name__ == "__main__":
    main()
