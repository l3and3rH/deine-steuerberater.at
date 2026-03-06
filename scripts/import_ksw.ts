/**
 * KSW-Mitglieder Import
 *
 * Liest ksw_mit_spezialgebiete.csv und spielt alle aktiven Einträge
 * in die Datenbank ein (User + SteuerberaterProfile + Stadt-Verknüpfung).
 *
 * Usage:
 *   npx tsx scripts/import_ksw.ts             # Vollimport
 *   npx tsx scripts/import_ksw.ts --dry-run   # Vorschau, keine DB-Änderungen
 *   npx tsx scripts/import_ksw.ts --resume    # Bereits importierte überspringen
 *   npx tsx scripts/import_ksw.ts --limit 10  # Nur N Einträge (Test)
 */

import { PrismaClient, Berufsbezeichnung } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

const prisma = new PrismaClient();

// ── CLI-Args ──────────────────────────────────────────────────────────────────
const args    = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const RESUME  = args.includes("--resume");
const LIMIT   = (() => {
  const i = args.indexOf("--limit");
  return i >= 0 ? parseInt(args[i + 1], 10) : 0;
})();

const CSV_FILE = path.join(__dirname, "ksw_mit_spezialgebiete.csv");

// ── PLZ → Bundesland (Österreich) ────────────────────────────────────────────
function bundeslandFromPlz(plz: string): string {
  const n = parseInt(plz, 10);
  if (n >= 1000 && n <= 1999) return "Wien";
  if (n >= 2000 && n <= 3999) return "Niederösterreich";
  if (n >= 4000 && n <= 4999) return "Oberösterreich";
  if (n >= 5000 && n <= 5999) return "Salzburg";
  if (n >= 6700 && n <= 6999) return "Vorarlberg";
  if (n >= 6000 && n <= 6699) return "Tirol";
  if (n >= 7000 && n <= 7999) return "Burgenland";
  if (n >= 8000 && n <= 8999) return "Steiermark";
  if (n >= 9000 && n <= 9999) return "Kärnten";
  return "Österreich";
}

// ── Slugify ───────────────────────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// ── Berufsbezeichnung mapping ─────────────────────────────────────────────────
function mapBezeichnung(raw: string): Berufsbezeichnung {
  const v = raw.trim();
  if (v === "WP")       return "WIRTSCHAFTSPRUEFER";
  if (v === "StB & WP") return "BEIDES";
  return "STEUERBERATER"; // StB (default)
}

// ── CSV Parser (RFC 4180 State Machine) ───────────────────────────────────────
function parseCsv(content: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch   = content[i];
    const next = content[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(field);
        field = "";
      } else if (ch === "\n") {
        row.push(field);
        field = "";
        if (row.some((f) => f.trim())) rows.push(row);
        row = [];
      } else if (ch === "\r") {
        // CRLF: skip bare CR
      } else {
        field += ch;
      }
    }
  }
  // letztes Feld / letzte Zeile
  row.push(field);
  if (row.some((f) => f.trim())) rows.push(row);

  if (rows.length < 2) return [];

  // BOM aus erstem Header-Feld entfernen
  const headers = rows[0].map((h, idx) =>
    idx === 0 ? h.replace(/^\uFEFF/, "").trim() : h.trim()
  );

  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = (r[i] ?? "").trim();
    });
    return obj;
  });
}

// ── Eindeutiger Slug Generator ────────────────────────────────────────────────
function makeSlugGenerator(existingSlugs: Set<string>) {
  const used = new Set(existingSlugs);

  return function generate(name: string, ort: string): string {
    // Versuch 1: nur Name
    const base = slugify(name);
    if (!used.has(base)) {
      used.add(base);
      return base;
    }
    // Versuch 2: Name + Ort
    const withOrt = slugify(`${name}-${ort}`);
    if (!used.has(withOrt)) {
      used.add(withOrt);
      return withOrt;
    }
    // Versuch 3: Name + Ort + Zähler
    for (let n = 2; n <= 99; n++) {
      const candidate = `${withOrt}-${n}`;
      if (!used.has(candidate)) {
        used.add(candidate);
        return candidate;
      }
    }
    // Fallback: MD5-Hash
    const hash = crypto
      .createHash("md5")
      .update(`${name}|${ort}`)
      .digest("hex")
      .slice(0, 6);
    const fallback = `${base}-${hash}`;
    used.add(fallback);
    return fallback;
  };
}

// ── Hauptprogramm ─────────────────────────────────────────────────────────────
async function main() {
  console.log("═".repeat(60));
  console.log("  KSW-Mitglieder Import");
  console.log("═".repeat(60));
  if (DRY_RUN) console.log("  [DRY RUN – keine Datenbankänderungen]\n");

  // CSV laden
  if (!fs.existsSync(CSV_FILE)) {
    console.error(`[FEHLER] Datei nicht gefunden: ${CSV_FILE}`);
    process.exit(1);
  }
  const raw  = fs.readFileSync(CSV_FILE, "utf-8");
  const rows = parseCsv(raw);
  console.log(`CSV geladen:   ${rows.length} Zeilen`);

  // Nur aktive Einträge
  const aktiv = rows.filter(
    (r) => (r["status"] ?? "").toLowerCase() !== "ruhend"
  );
  console.log(`Aktiv:         ${aktiv.length} | Ruhend: ${rows.length - aktiv.length}`);

  // Resume: bereits importierte KSW-Profile überspringen
  let todo = aktiv;
  if (RESUME) {
    const already = await prisma.steuerberaterProfile.findMany({
      where:  { kswMitglied: true },
      select: { name: true, plz: true },
    });
    const doneKeys = new Set(already.map((p) => `${p.name}|${p.plz ?? ""}`));
    todo = aktiv.filter((r) => !doneKeys.has(`${r["name"]}|${r["plz"]}`));
    console.log(`Resume:        ${doneKeys.size} übersprungen, ${todo.length} verbleiben`);
  }

  if (LIMIT > 0) {
    todo = todo.slice(0, LIMIT);
    console.log(`Limit:         ${LIMIT} Einträge`);
  }

  if (todo.length === 0) {
    console.log("\nNichts zu importieren.");
    return;
  }

  const BATCH_SIZE = 25;

  // Bestehende Slugs laden (für Deduplikation)
  const existingProfiles = await prisma.steuerberaterProfile.findMany({
    select: { slug: true },
  });
  const generateSlug = makeSlugGenerator(
    new Set(existingProfiles.map((p) => p.slug))
  );

  // ── Schritt 1: Alle Felder vorberechnen + Slugs sequenziell vergeben ──────
  type PreparedRow = {
    idx:               number;
    name:              string;
    plz:               string;
    ort:               string;
    slug:              string;
    stadtSlug:         string;
    bundesland:        string;
    userEmail:         string;
    adresse:           string | null;
    bezirk:            string | null;
    telefon:           string | null;
    email:             string | null;
    website:           string | null;
    beschreibung:      string | null;
    tags:              string[];
    bezeichnung:       ReturnType<typeof mapBezeichnung>;
    gratisErstgespraech: boolean;
    onlineBeratung:    boolean;
    abendtermine:      boolean;
    schnellantwort:    boolean;
  };

  const prepared: PreparedRow[] = [];
  let skipped = 0;

  for (let idx = 0; idx < todo.length; idx++) {
    const row  = todo[idx];
    const name = row["name"]?.trim();
    const plz  = row["plz"]?.trim();
    const ort  = row["ort"]?.trim();

    if (!name || !ort || !plz) {
      console.log(`  [SKIP] Zeile ${idx + 1}: Pflichtfeld fehlt`);
      skipped++;
      continue;
    }

    const spezRaw = row["spezialgebiete"]?.trim();
    prepared.push({
      idx,
      name,
      plz,
      ort,
      slug:              generateSlug(name, ort),
      stadtSlug:         slugify(ort),
      bundesland:        bundeslandFromPlz(plz),
      userEmail:         `${slugify(name)}-${plz}@ksw-import.local`,
      adresse:           row["strasse"]?.trim() ? `${row["strasse"].trim()}, ${plz} ${ort}` : null,
      bezirk:            row["bezirk"]?.trim()    || null,
      telefon:           row["telefon_1"]?.trim() || null,
      email:             row["email"]?.trim()     || null,
      website:           row["website"]?.trim()   || null,
      beschreibung:      row["beschreibung"]?.trim() || null,
      tags:              spezRaw ? spezRaw.split("|").map((s: string) => s.trim()).filter(Boolean) : [],
      bezeichnung:       mapBezeichnung(row["berufsbezeichnung"] || "StB"),
      gratisErstgespraech: row["gratis_erstgespraech"] === "true",
      onlineBeratung:      row["online_beratung"]      === "true",
      abendtermine:        row["abendtermine"]         === "true",
      schnellantwort:      row["schnellantwort"]       === "true",
    });
  }

  // ── Schritt 2: Alle Städte vorab parallel upserten ────────────────────────
  const stadtCache = new Map<string, string>(); // stadtSlug → stadtId

  if (!DRY_RUN) {
    const uniqueStaedte = new Map<string, { name: string; bundesland: string }>();
    for (const r of prepared) {
      if (!uniqueStaedte.has(r.stadtSlug)) {
        uniqueStaedte.set(r.stadtSlug, { name: r.ort, bundesland: r.bundesland });
      }
    }
    console.log(`Städte:        ${uniqueStaedte.size} unique Orte werden angelegt…`);

    const stadtEntries = Array.from(uniqueStaedte.entries());
    // Städte in Batches von 50 parallel upserten
    for (let i = 0; i < stadtEntries.length; i += 50) {
      const batch = stadtEntries.slice(i, i + 50);
      const results = await Promise.all(
        batch.map(([slug, { name, bundesland }]) =>
          prisma.stadt.upsert({
            where:  { slug },
            update: {},
            create: {
              name,
              slug,
              bundesland,
              einleitungstext: `Finden Sie den passenden Steuerberater in ${name}. ` +
                               `Vergleichen Sie lokale Kanzleien und nehmen Sie direkt Kontakt auf.`,
            },
          })
        )
      );
      for (const stadt of results) stadtCache.set(stadt.slug, stadt.id);
    }
    console.log(`Städte:        ✓ fertig\n`);
  }

  // ── Schritt 3: Profile in parallelen Batches importieren ──────────────────
  let imported = 0;
  let errors   = 0;

  console.log(`Importiere ${prepared.length} Profile in Batches à ${BATCH_SIZE}...\n`);

  for (let i = 0; i < prepared.length; i += BATCH_SIZE) {
    const batch     = prepared.slice(i, i + BATCH_SIZE);
    const batchNum  = Math.floor(i / BATCH_SIZE) + 1;
    const batchTotal = Math.ceil(prepared.length / BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map(async (r) => {
        if (DRY_RUN) return r;

        const stadtId = stadtCache.get(r.stadtSlug)!;

        // User + Profile + Junction in einer Transaction pro Profil
        await prisma.$transaction(async (tx) => {
          const user = await tx.user.upsert({
            where:  { email: r.userEmail },
            update: {},
            create: { email: r.userEmail, role: "STEUERBERATER" },
          });

          const profile = await tx.steuerberaterProfile.upsert({
            where:  { slug: r.slug },
            update: {
              beschreibung: r.beschreibung,
              tags:         r.tags,
              telefon:      r.telefon,
              email:        r.email,
              website:      r.website,
              adresse:      r.adresse,
              bezirk:       r.bezirk,
              gratisErstgespraech: r.gratisErstgespraech,
              onlineBeratung:      r.onlineBeratung,
              abendtermine:        r.abendtermine,
              schnellantwort:      r.schnellantwort,
            },
            create: {
              userId:            user.id,
              name:              r.name,
              slug:              r.slug,
              adresse:           r.adresse,
              plz:               r.plz,
              telefon:           r.telefon,
              email:             r.email,
              website:           r.website,
              beschreibung:      r.beschreibung,
              tags:              r.tags,
              bezirk:            r.bezirk,
              berufsbezeichnung: r.bezeichnung,
              kswMitglied:       true,
              verified:          false,
              paket:             "BASIC",
              beratungVorOrt:    true,
              gratisErstgespraech: r.gratisErstgespraech,
              onlineBeratung:      r.onlineBeratung,
              abendtermine:        r.abendtermine,
              schnellantwort:      r.schnellantwort,
            },
          });

          await tx.steuerberaterStadt.upsert({
            where:  { steuerberaterId_stadtId: { steuerberaterId: profile.id, stadtId } },
            update: {},
            create: { steuerberaterId: profile.id, stadtId },
          });
        });

        return r;
      })
    );

    let batchOk = 0;
    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      const r = batch[j];
      if (result.status === "fulfilled") {
        batchOk++;
        imported++;
      } else {
        console.error(`  ✗ ${r.name.slice(0, 50)} → ${result.reason?.message?.slice(0, 80)}`);
        errors++;
      }
    }

    const done = Math.min(i + BATCH_SIZE, prepared.length);
    console.log(`  Batch ${String(batchNum).padStart(3)}/${batchTotal}  [${done.toString().padStart(4)}/${prepared.length}]  ✓ ${batchOk}/${batch.length}`);
  }

  // ── Abschlussbericht ───────────────────────────────────────────────────────
  console.log(`\n${"═".repeat(60)}`);
  console.log(`Importiert:    ${imported}`);
  console.log(`Übersprungen:  ${skipped}`);
  console.log(`Fehler:        ${errors}`);
  if (DRY_RUN) {
    console.log("\n[DRY RUN – keine Änderungen gespeichert]");
  } else {
    console.log(`\nStädte im Cache: ${stadtCache.size} unique Orte verarbeitet`);
    console.log(
      "\n⚠  WICHTIG: Nach dem Import muss die App neu gebaut werden,\n" +
      "   damit neue Stadtseiten statisch generiert werden:\n" +
      "   → npm run build"
    );
  }
}

main()
  .catch((err) => {
    console.error("\n[FATAL]", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
