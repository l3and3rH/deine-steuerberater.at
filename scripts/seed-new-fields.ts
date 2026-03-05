/**
 * Befüllt alle bestehenden SteuerberaterProfile mit realistischen Daten
 * für die neuen Felder aus der Schema-Erweiterung.
 *
 * Ausführen: npx tsx scripts/seed-new-fields.ts
 */

import { PrismaClient, Berufsbezeichnung } from "@prisma/client";

const prisma = new PrismaClient();

// ── Daten-Pools ────────────────────────────────────────────────────────────────

const BERUFSBEZEICHNUNGEN: Berufsbezeichnung[] = [
  "STEUERBERATER",
  "WIRTSCHAFTSPRUEFER",
  "BEIDES",
  "STEUERBERATER",
  "STEUERBERATER",
  "WIRTSCHAFTSPRUEFER",
  "STEUERBERATER",
  "BEIDES",
  "STEUERBERATER",
  "BUCHHALTER",
  "STEUERBERATER",
  "BILANZBUCHHALTER",
  "STEUERBERATER",
  "WIRTSCHAFTSPRUEFER",
  "STEUERBERATER",
  "STEUERBERATER",
  "BEIDES",
];

const KANZLEINAMEN = [
  "Mustermann Steuerberatung GmbH",
  "Gruber Wirtschaftstreuhand",
  "Dr. Schneider & Partner Steuerberatung GmbH",
  "Wagner Steuerberatung KG",
  "Hofer Steuerberatung GmbH",
  "Berger Wirtschaftstreuhand KG",
  "Müller & Söhne Steuerberatung OG",
  "Mag. Huber Steuerberatung",
  "Pichler Steuerberatungs OG",
  "Wirtschaftskanzlei Fischer GmbH",
  "Dr. Maier Steuerberatung GmbH",
  "Eder & Partner Steuerberatung KG",
  "Winkler Steuerberatung GmbH",
  "Reiter Wirtschaftstreuhand GmbH",
  "Bauer & Kollegen Steuerberatung OG",
  "Mag. Koller Steuerberatung",
  "Wirtschaftskanzlei Steiner GmbH",
];

const BEZIRKE = [
  "1010 Wien – Innere Stadt",
  "8010 Graz – Innenstadt",
  "1010 Wien – Innere Stadt",
  "1070 Wien – Neubau",
  "1040 Wien – Wieden",
  "1010 Wien – Innere Stadt",
  "1100 Wien – Favoriten",
  "1030 Wien – Landstraße",
  "1090 Wien – Alsergrund",
  "1080 Wien – Josefstadt",
  "8010 Graz – Innenstadt",
  "8020 Graz – Gries",
  "8010 Graz – Innenstadt",
  "8010 Graz – Innenstadt",
  "8010 Graz – Innenstadt",
  "8010 Graz – Innenstadt",
  "8010 Graz – Innenstadt",
];

const ERFAHRUNGSJAHRE = [18, 12, 22, 9, 15, 27, 14, 8, 11, 20, 16, 10, 13, 19, 7, 11, 24];

const ZULASSUNGSJAHRE = [2007, 2013, 2003, 2016, 2010, 1998, 2011, 2017, 2014, 2005, 2009, 2015, 2012, 2006, 2018, 2014, 2001];

const AUSBILDUNGEN = [
  "WU Wien – Betriebswirtschaft (Mag.)",
  "Universität Graz – Rechtswissenschaften (Dr.iur.)",
  "WU Wien – Wirtschaftsrecht (Mag.)",
  "WU Wien – Betriebswirtschaftslehre (Mag.)",
  "Universität Wien – Betriebswirtschaft (Mag.)",
  "WU Wien – Steuerwissenschaften (Dr.rer.soc.oec.)",
  "Universität Linz – Sozial- und Wirtschaftswissenschaften (Mag.)",
  "WU Wien – Wirtschaft und Recht (Mag.)",
  "Universität Graz – Betriebswirtschaft (Mag.)",
  "WU Wien – Betriebswirtschaft (Mag.)",
  "Universität Graz – Wirtschaftswissenschaften (Dr.)",
  "KFU Graz – Betriebswirtschaft (Mag.)",
  "WU Wien – Rechnungswesen und Steuern (Mag.)",
  "Universität Graz – Rechtswissenschaften (Dr.iur.)",
  "WU Wien – Betriebswirtschaft (Mag.)",
  "Universität Innsbruck – Betriebswirtschaft (Mag.)",
  "WU Wien – Wirtschaftswissenschaften (Dr.rer.soc.oec.)",
];

const BESCHREIBUNGEN = [
  "Als langjährig erfahrene Steuerberatungskanzlei in Wien unterstützen wir Privatpersonen und Unternehmen aller Größen in allen steuerlichen und wirtschaftlichen Angelegenheiten. Unser Fokus liegt auf persönlicher Beratung und maßgeschneiderten Lösungen. Wir begleiten Sie verlässlich durch komplexe steuerrechtliche Fragestellungen.",
  "Ihre Steuerberatung in Graz – kompetent, persönlich und effizient. Wir betreuen KMU, Freiberufler und Privatpersonen mit langjähriger Erfahrung im österreichischen Steuerrecht. Flexibles Terminangebot auch nach Geschäftszeiten.",
  "Mit über zwei Jahrzehnten Erfahrung in der Wirtschaftstreuhandberatung bieten wir umfassende Leistungen von der Jahresabschlusserstellung bis zur Unternehmensbesteuerung. Unsere Kanzlei verbindet höchste fachliche Kompetenz mit persönlichem Service.",
  "Ich begleite meine Mandanten als verlässliche Partnerin in allen Steuerfragen – von der Einkommensteuererklärung bis zur Unternehmenssteuerplanung. Schnelle Reaktionszeiten und digitaler Workflow sind bei mir selbstverständlich.",
  "Steuerberatung mit Weitblick: Wir entwickeln individuelle Steuerstrategien für Unternehmen aus allen Branchen. Unser Team verbindet fundiertes Fachwissen mit modernen Beratungstools und ist immer erreichbar.",
  "Als Wirtschaftstreuhänder mit Schwerpunkt auf internationales Steuerrecht und Konzernbesteuerung bin ich der richtige Ansprechpartner für Unternehmen mit grenzüberschreitender Tätigkeit. Persönliche und direkte Beratung auf höchstem Niveau.",
  "Unsere Kanzlei betreut Familienbetriebe und KMU in Wien seit über 14 Jahren. Wir verstehen die Herausforderungen mittelständischer Unternehmen und bieten praxisnahe Lösungen in Steuer- und Sozialversicherungsfragen.",
  "Als Steuerberaterin mit Leidenschaft für meinen Beruf stehe ich für transparente Kommunikation und termingerechte Leistungserbringung. Mein Schwerpunkt liegt auf Privatpersonen und Einzelunternehmern in Wien.",
  "Wir unterstützen unsere Mandanten ganzheitlich – von der laufenden Buchhaltung über die Lohnverrechnung bis zur Steuererklärung. Zuverlässigkeit und Qualität sind die Grundpfeiler unserer täglichen Arbeit.",
  "Als erfahrene Wirtschaftskanzlei in Wien sind wir auf die Beratung von Kapitalgesellschaften und Konzernen spezialisiert. Unsere Stärken liegen in der Steueroptimierung und der begleitenden Betriebsprüfungsvertretung.",
  "Steuerberatung in Graz mit persönlicher Note – seit über 16 Jahren bin ich der verlässliche Ansprechpartner für kleine und mittlere Unternehmen in der Steiermark. Praxisnah, kompetent und stets auf dem neuesten Stand des Steuerrechts.",
  "Meine Kanzlei in Graz bietet umfassende Steuer- und Unternehmensberatung. Vom Start-up bis zum etablierten KMU – wir begleiten Sie in jeder Phase Ihrer unternehmerischen Entwicklung mit maßgeschneiderten Lösungen.",
  "Steuerberatung Winkler – Ihr Partner für Steuer- und Unternehmensrecht in Graz. Wir beraten KMU, GmbHs und Einzelunternehmer mit höchster Fachkompetenz und persönlichem Engagement.",
  "Als Wirtschaftstreuhänderin mit Schwerpunkt Kapitalgesellschaften und Unternehmensrecht begleite ich meine Mandanten durch komplexe steuerrechtliche Fragestellungen. Verlässlich, diskret und stets auf dem neuesten Stand der Rechtsprechung.",
  "Unsere Kanzlei in Graz steht für Teamarbeit und individuelle Betreuung. Wir haben uns auf KMU, Freiberufler und Non-Profit-Organisationen spezialisiert und bieten ein breites Spektrum an Steuerberatungsleistungen.",
  "Als spezialisierter Steuerberater in Graz fokussiere ich mich auf die Optimierung der Steuerbelastung für Privatpersonen und Einzelunternehmer. Klare Kommunikation und schnelle Verfügbarkeit zeichnen meine Arbeit aus.",
  "Die Wirtschaftskanzlei Steiner blickt auf mehr als zwei Jahrzehnte Erfahrung in der Steiermark zurück. Wir betreuen Mandanten von der Unternehmensgründung bis zur Unternehmensübergabe – kompetent, diskret und verlässlich.",
];

const TAGS_POOL = [
  ["Einkommensteuer", "Umsatzsteuer", "GmbH-Gründung", "Jahresabschluss"],
  ["Lohnverrechnung", "KMU-Beratung", "Sozialversicherung", "Jahresabschluss"],
  ["Körperschaftsteuer", "Internationales Steuerrecht", "Betriebsprüfung", "Konzerne"],
  ["Einkommensteuer", "Immobiliensteuer", "Erbschaftssteuer", "Privatpersonen"],
  ["Kryptosteuer", "Start-up-Beratung", "Umsatzsteuer", "GmbH-Gründung"],
  ["Jahresabschluss", "Bilanzierung", "Konzernsteuerrecht", "Transferpreise"],
  ["GmbH-Gründung", "Unternehmensgründung", "Steueroptimierung", "KMU"],
  ["Einkommensteuer", "Privatpersonen", "Freiberufler", "Umsatzsteuer"],
  ["Lohnverrechnung", "Buchhaltung", "Jahresabschluss", "KMU"],
  ["Körperschaftsteuer", "Betriebsprüfung", "Steueroptimierung", "Jahresabschluss"],
  ["Einkommensteuer", "KMU", "Umsatzsteuer", "Steiermark"],
  ["GmbH-Gründung", "Start-ups", "Unternehmensgründung", "Finanzierung"],
  ["Körperschaftsteuer", "Jahresabschluss", "Lohnverrechnung", "KMU"],
  ["Internationales Steuerrecht", "Konzernbesteuerung", "Kapitalgesellschaften"],
  ["KMU", "Non-Profit", "Vereine", "Jahresabschluss"],
  ["Einkommensteuer", "Privatpersonen", "Freiberufler", "Steuererklärung"],
  ["Jahresabschluss", "Unternehmensgründung", "Steiermark", "KMU"],
];

const AUSZEICHNUNGEN_POOL = [
  ["Top-Steuerberater 2024 – trend Magazin"],
  [],
  ["Beste Kanzlei Österreich 2023 – WKÖ", "Top-Wirtschaftsprüfer 2022"],
  [],
  ["Ausgezeichneter Arbeitgeber 2023 – Great Place to Work"],
  ["Top-Wirtschaftsprüfer 2024 – trend Magazin", "Kanzlei des Jahres 2022"],
  [],
  [],
  ["Bestes Preis-Leistungs-Verhältnis 2023"],
  ["Top-Steuerberater 2023 – trend Magazin"],
  [],
  ["Junge Kanzlei des Jahres 2022 – WKÖ Steiermark"],
  [],
  ["Top-Wirtschaftsprüferin 2024 – trend Magazin"],
  [],
  [],
  ["Top-Steuerberater 2023 – trend Magazin"],
];

const MITGLIEDSCHAFTEN_POOL = [
  ["Kammer der Steuerberater und Wirtschaftsprüfer (KSW)", "WKÖ"],
  ["KSW", "Wirtschaftskammer Steiermark"],
  ["KSW", "IFA Austria", "Österreichische Steuerwissenschaftliche Gesellschaft"],
  ["KSW", "WKÖ"],
  ["KSW", "Junge Wirtschaft Wien"],
  ["KSW", "IFA Austria", "WKÖ"],
  ["KSW", "Wirtschaftskammer Wien"],
  ["KSW"],
  ["KSW", "WKÖ"],
  ["KSW", "Österreichischer Steuerberaterverband"],
  ["KSW", "Wirtschaftskammer Steiermark"],
  ["KSW", "Junge Wirtschaft Graz"],
  ["KSW", "WKÖ"],
  ["KSW", "IFA Austria"],
  ["KSW", "Steuerberaterverband Steiermark"],
  ["KSW"],
  ["KSW", "WKÖ", "Wirtschaftskammer Steiermark"],
];

const MANDANTENGRUPPEN_POOL = [
  ["Privatpersonen", "KMU", "Freiberufler"],
  ["KMU", "Freiberufler", "Privatpersonen"],
  ["Konzerne", "KMU", "Start-ups"],
  ["Privatpersonen", "Freiberufler"],
  ["KMU", "Start-ups", "Freiberufler"],
  ["Konzerne", "KMU"],
  ["KMU", "Privatpersonen"],
  ["Privatpersonen", "Freiberufler"],
  ["KMU", "Privatpersonen", "Vereine"],
  ["Konzerne", "KMU"],
  ["KMU", "Privatpersonen", "Freiberufler"],
  ["Start-ups", "KMU", "Freiberufler"],
  ["KMU", "Privatpersonen"],
  ["Konzerne", "KMU", "Kapitalgesellschaften"],
  ["KMU", "Vereine", "Non-Profit"],
  ["Privatpersonen", "Freiberufler"],
  ["KMU", "Privatpersonen", "Landwirtschaft"],
];

// Welche Profile KSW-Mitglied sind (Index-basiert)
const KSW_MITGLIEDER = [true, false, true, true, true, true, false, true, true, true, true, false, true, true, false, true, true];

// KSW-Mitgliedsnummern
const KSW_NUMMERN = [
  "100234", "", "100891", "101456", "100677", "99821", "", "101234",
  "100543", "100987", "100123", "", "100765", "100432", "", "101098", "99654",
];

// Service-Flags
const GRATIS_ERSTGESPRAECHE = [true, false, true, true, false, false, true, true, false, false, true, true, false, false, true, true, false];
const ONLINE_BERATUNGEN = [true, true, true, true, false, true, false, true, true, false, true, true, true, true, false, true, true];
const BERATUNG_VOR_ORT = [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true];
const SCHNELLANTWORTEN = [true, false, false, true, false, true, false, false, true, true, false, true, false, false, false, true, false];
const ABENDTERMINE = [false, true, false, true, false, false, true, true, false, false, true, false, true, false, true, false, false];

// LANGUAGES
const SPRACHEN_POOL = [
  ["Deutsch", "Englisch"],
  ["Deutsch", "Englisch", "Kroatisch"],
  ["Deutsch", "Englisch", "Französisch"],
  ["Deutsch"],
  ["Deutsch", "Englisch"],
  ["Deutsch", "Englisch", "Russisch"],
  ["Deutsch"],
  ["Deutsch", "Englisch"],
  ["Deutsch", "Tschechisch"],
  ["Deutsch", "Englisch"],
  ["Deutsch", "Englisch"],
  ["Deutsch", "Slowenisch"],
  ["Deutsch"],
  ["Deutsch", "Englisch"],
  ["Deutsch", "Ungarisch"],
  ["Deutsch"],
  ["Deutsch", "Englisch"],
];

// ── Haupt-Script ───────────────────────────────────────────────────────────────

async function main() {
  const profiles = await prisma.steuerberaterProfile.findMany({
    orderBy: { createdAt: "asc" },
  });

  console.log(`Updating ${profiles.length} profiles with new fields...`);

  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    const idx = i % BERUFSBEZEICHNUNGEN.length;

    await prisma.steuerberaterProfile.update({
      where: { id: profile.id },
      data: {
        berufsbezeichnung: BERUFSBEZEICHNUNGEN[idx],
        kanzleiname: KANZLEINAMEN[idx] ?? profile.name,
        bezirk: BEZIRKE[idx] ?? null,
        experienceYears: ERFAHRUNGSJAHRE[idx] ?? null,
        zulassungsjahr: ZULASSUNGSJAHRE[idx] ?? null,
        ausbildung: AUSBILDUNGEN[idx] ?? null,
        beschreibung: BESCHREIBUNGEN[idx] ?? null,
        tags: TAGS_POOL[idx] ?? [],
        languages: SPRACHEN_POOL[idx] ?? ["Deutsch"],
        kswMitglied: KSW_MITGLIEDER[idx] ?? false,
        kswMitgliedsnummer: KSW_NUMMERN[idx] || null,
        auszeichnungen: AUSZEICHNUNGEN_POOL[idx] ?? [],
        mitgliedschaften: MITGLIEDSCHAFTEN_POOL[idx] ?? [],
        mandantengruppen: MANDANTENGRUPPEN_POOL[idx] ?? [],
        gratisErstgespraech: GRATIS_ERSTGESPRAECHE[idx] ?? false,
        onlineBeratung: ONLINE_BERATUNGEN[idx] ?? false,
        beratungVorOrt: BERATUNG_VOR_ORT[idx] ?? true,
        schnellantwort: SCHNELLANTWORTEN[idx] ?? false,
        abendtermine: ABENDTERMINE[idx] ?? false,
      },
    });

    console.log(`  [${i + 1}/${profiles.length}] ${profile.name}`);
  }

  console.log("\nFertig! Alle Profile aktualisiert.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
