"""
KSW Mitgliederverzeichnis Crawler
Crawlt alle österreichischen Steuerberater/Wirtschaftsprüfer vom KSW-Mitgliederverzeichnis
und folgt dabei dem "nächste Seite"-Link (TYPO3 cHash-Pagination).

Usage:
    python scripts/crawl_ksw.py

Output:
    scripts/ksw_mitglieder.csv
"""

import asyncio
import csv
import os
import re
import sys
from pathlib import Path
from urllib.parse import urljoin, unquote

# Windows UTF-8 Fix
os.environ["PYTHONIOENCODING"] = "utf-8"
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

from crawl4ai import AsyncWebCrawler, CrawlerRunConfig

# ── Konfiguration ─────────────────────────────────────────────────────────────

START_URL = (
    "https://ksw.or.at/mitgliederverzeichnis/"
    "?tx_kswmembers_memberdirectory%5BmemberWho%5D="
    "&tx_kswmembers_memberdirectory%5BmemberWhere%5D="
    "&tx_kswmembers_memberdirectory%5BmemberCountry%5D=A"
    "&tx_kswmembers_memberdirectory%5BmemberAuthorityAccountant%5D="
    "&tx_kswmembers_memberdirectory%5BmemberAuthorityAuditor%5D="
)
BASE_DOMAIN   = "https://ksw.or.at"
DELAY_SECONDS = 1.5    # Pause zwischen Anfragen (Server schonen)
MAX_PAGES     = 600    # Sicherheits-Limit
OUTPUT_FILE   = Path(__file__).parent / "ksw_mitglieder.csv"

CSV_FIELDS = [
    "name",
    "berufsbezeichnung",   # StB | WP | StB & WP
    "status",              # aktiv | ruhend
    "strasse",
    "plz",
    "ort",
    "gemeinde",
    "bezirk",
    "telefon_1",
    "telefon_2",
    "telefon_3",
    "fax",
    "email",
    "website",
    "seite",
]

# ── Regex-Muster ──────────────────────────────────────────────────────────────

RE_TEL     = re.compile(r'\[([^\]]+)\]\(tel:([^\)]+)\)')
RE_FAX     = re.compile(r'\[([^\]]+)\]\(fax:([^\)]+)\)')
RE_EMAIL   = re.compile(r'\[([a-zA-Z0-9._%+\-]+\(at\)[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})\]')
RE_WEBSITE = re.compile(r'<(https?://[^>]+)>')
RE_PLZ_ORT = re.compile(r'^(\d{4})\s+(.+)$')
RE_MEMBER  = re.compile(r'#{3,4}\s+(.+?)(?=\n#{3,4}\s|\Z)', re.DOTALL)
RE_NEXT    = re.compile(r'href=["\']([^"\']*currentPage[^"\']*)["\']')


# ── Parsing ───────────────────────────────────────────────────────────────────

def extract_next_url(html: str) -> str | None:
    """Sucht den 'nächste'-Paginierungslink im HTML."""
    # Suche Link der auf 'nächste' oder 'naechste' zeigt
    pattern = re.compile(
        r'<a[^>]+href=["\']([^"\']*(?:currentPage)[^"\']*)["\'][^>]*>\s*(?:n[äa]chste|weiter|next)',
        re.IGNORECASE
    )
    m = pattern.search(html)
    if m:
        href = m.group(1).replace("&amp;", "&")
        if href.startswith("http"):
            return href
        return BASE_DOMAIN + href

    # Fallback: alle currentPage-Links suchen und den mit höchster Seitenzahl nehmen
    all_links = RE_NEXT.findall(html)
    if not all_links:
        return None

    # Dekodiere und extrahiere Seitenzahl
    candidates = []
    for link in all_links:
        link = link.replace("&amp;", "&")
        page_m = re.search(r'membersdirectory%5BcurrentPage%5D=(\d+)|membersdirectory\[currentPage\]=(\d+)', link)
        if page_m:
            pg = int(page_m.group(1) or page_m.group(2))
            full = link if link.startswith("http") else BASE_DOMAIN + link
            candidates.append((pg, full))

    if not candidates:
        return None

    # Nimm den Link mit der höchsten Seitenzahl (= "nächste Seite")
    candidates.sort(key=lambda x: x[0])
    return candidates[-1][1]


def parse_members(markdown: str, page_num: int) -> list[dict]:
    """Parst alle Mitglieder-Blöcke aus dem Markdown einer KSW-Seite."""
    start = markdown.find("#### ")
    if start == -1:
        return []
    relevant = markdown[start:]

    members = []

    for match in RE_MEMBER.finditer(relevant):
        block = match.group(0)
        lines = [l.strip() for l in block.split("\n") if l.strip()]
        if not lines:
            continue

        name = re.sub(r'^#{3,4}\s+', '', lines[0]).strip()
        if not name or len(name) > 200:
            continue

        m: dict = {f: "" for f in CSV_FIELDS}
        m["name"]   = name
        m["seite"]  = str(page_num)
        m["status"] = "aktiv"

        # Berufsbezeichnung + Status
        bez_parts = []
        for line in lines[1:6]:
            if "Ruhende Befugnisse" in line:
                m["status"] = "ruhend"
            if "StB" in line:
                bez_parts.append("StB")
            if re.search(r'\bWP\b', line):
                bez_parts.append("WP")
            if bez_parts:
                break
        m["berufsbezeichnung"] = " & ".join(dict.fromkeys(bez_parts)) or "StB"

        # Telefon (tel: Links)
        tel_nums = RE_TEL.findall(block)
        for i, (display, _) in enumerate(tel_nums[:3]):
            m[f"telefon_{i+1}"] = display.strip()

        # Fax (fax: Links)
        fax_matches = RE_FAX.findall(block)
        if fax_matches:
            m["fax"] = fax_matches[0][0].strip()

        # E-Mail
        email_matches = RE_EMAIL.findall(block)
        if email_matches:
            m["email"] = email_matches[0].replace("(at)", "@")

        # Website
        web_matches = RE_WEBSITE.findall(block)
        if web_matches:
            m["website"] = web_matches[0].strip()

        # Adresse: Markdown-Links entfernen, dann parsen
        clean = re.sub(r'\[([^\]]*)\]\([^\)]*\)', r'\1', block)
        clean = re.sub(r'<https?://[^>]+>', '', clean)
        clean_lines = [l.strip() for l in clean.split("\n") if l.strip()]

        adresse_started = False
        for line in clean_lines[1:]:
            if any(kw in line for kw in [
                "StB", "WP", "Zweigstellen", "Hauptstelle", "Ruhende",
                "Befugnisse", "Austria", "####", "###"
            ]):
                if m["strasse"]:
                    break
                continue

            plz_m = RE_PLZ_ORT.match(line)
            if plz_m and not m["plz"]:
                m["plz"] = plz_m.group(1)
                m["ort"] = plz_m.group(2).strip()
                adresse_started = True
                continue

            if line.startswith("Gemeinde:"):
                m["gemeinde"] = line.replace("Gemeinde:", "").strip()
                continue

            if line.startswith("Bezirk"):
                m["bezirk"] = line.replace("Bezirk", "").strip().strip("()")
                continue

            if re.match(r'^[+\d\s\-/\(\)]{5,}$', line):
                continue

            if "@" in line or line.startswith("http") or line.startswith("www"):
                continue

            if not m["strasse"] and not adresse_started and len(line) > 3:
                m["strasse"] = line

        if m["name"] and (m["plz"] or m["telefon_1"] or m["email"]):
            members.append(m)

    return members


# ── Crawler ───────────────────────────────────────────────────────────────────

async def main():
    all_members: list[dict] = []
    errors: list[tuple]     = []
    current_url = START_URL
    page_num    = 1

    print("KSW-Crawler gestartet", flush=True)
    print(f"Output: {OUTPUT_FILE}\n", flush=True)

    config = CrawlerRunConfig(word_count_threshold=3, verbose=False)

    async with AsyncWebCrawler(headless=True, verbose=False) as crawler:
        while current_url and page_num <= MAX_PAGES:
            try:
                # Bis zu 4 Versuche bei Netzwerkfehlern
                result = None
                for attempt in range(1, 5):
                    result = await crawler.arun(url=current_url, config=config)
                    if result.success:
                        break
                    wait = attempt * 8
                    print(f"  [RETRY {attempt}/4] Seite {page_num}: {str(result.error_message)[:80]} – warte {wait}s", flush=True)
                    await asyncio.sleep(wait)

                if not result.success:
                    print(f"  [FEHLER] Seite {page_num}: aufgegeben nach 4 Versuchen", flush=True)
                    errors.append((page_num, current_url))
                    break

                members = parse_members(result.markdown, page_num)
                all_members.extend(members)

                # Nächste Seite ermitteln
                next_url = extract_next_url(result.html)

                # Fortschritt – jede Seite ausgeben
                print(f"  Seite {page_num:>3} | +{len(members):>2} | Gesamt: {len(all_members):>5} | {'weiter...' if next_url else 'LETZTE SEITE'}", flush=True)

                if not next_url:
                    print(f"  Seite {page_num}: Keine naechste Seite – fertig.", flush=True)
                    break

                current_url = next_url
                page_num   += 1

                await asyncio.sleep(DELAY_SECONDS)

            except Exception as e:
                print(f"  [FEHLER] Seite {page_num}: {e}", flush=True)
                errors.append((page_num, current_url))
                await asyncio.sleep(5)
                page_num += 1

    # Duplikate entfernen
    seen    = set()
    deduped = []
    for m in all_members:
        key = (m["name"], m["plz"])
        if key not in seen:
            seen.add(key)
            deduped.append(m)

    print(f"\nGesamt gecrawlt: {len(all_members)} | Nach Deduplizierung: {len(deduped)}", flush=True)

    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDS)
        writer.writeheader()
        writer.writerows(deduped)

    print(f"Fertig! -> {OUTPUT_FILE}")

    if errors:
        print(f"\nFehler auf {len(errors)} Seiten:")
        for pg, url in errors:
            print(f"  Seite {pg}: {url[:80]}")


if __name__ == "__main__":
    asyncio.run(main())
