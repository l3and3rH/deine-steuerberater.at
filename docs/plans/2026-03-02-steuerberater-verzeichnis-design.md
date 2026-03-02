# Steuerberater-Verzeichnis Österreich — Design Dokument

**Datum:** 2026-03-02
**Status:** Approved

---

## Überblick

Ein SEO-fokussiertes Steuerberater-Verzeichnis für Österreich mit dem Ziel, auf Google für Suchanfragen der Form „[Stadt] + Steuerberater" zu ranken. Steuerberater können kostenlos gelistet werden und optional auf bezahlte Premium-Pakete upgraden.

---

## 1. Architektur & Tech-Stack

**Stack:**
- **Frontend/Backend:** Next.js 14 (App Router), TypeScript
- **Datenbank:** PostgreSQL via Supabase
- **ORM:** Prisma
- **Payments:** Stripe (Subscriptions + Webhooks)
- **Hosting:** Vercel (native Next.js, ISR out-of-the-box)
- **Auth:** NextAuth.js

**Architektur-Ansatz:** Hybrid SSG + ISR + API Routes

- Stadtseiten werden statisch generiert (perfektes SEO)
- ISR revalidiert alle 6 Stunden automatisch
- Stripe Webhook triggert sofortige Revalidation bei Premium-Änderungen
- Premium-Logik, Kontaktformulare und Dashboard laufen über Next.js API Routes

**Seitenstruktur:**
```
/                             → Homepage (Suche nach Stadt)
/steuerberater/[stadt]        → Stadtseite (~100+ Seiten, SSG + ISR)
/steuerberater/[stadt]/[slug] → Einzelprofil
/dashboard                    → Steuerberater-Login & Profilverwaltung
/dashboard/upgrade            → Pakete & Stripe Checkout
/admin                        → Internes Admin-Panel
```

---

## 2. SEO-Strategie

**URL-Struktur:** `/steuerberater/[stadt]` für alle ~100 österreichischen Bezirksstädte

**Jede Stadtseite enthält:**
- H1: `Steuerberater in [Stadt]`
- Meta Title: `Steuerberater [Stadt] – Jetzt Vergleichen & Kontakt aufnehmen`
- Meta Description: individuell pro Stadt generiert
- Liste aller Steuerberater (Premium oben, dann alphabetisch)
- Einzigartiger Stadt-spezifischer Einleitungstext (~100 Wörter)
- Schema.org Markup (`LocalBusiness` + `Breadcrumb`)
- Interne Verlinkung zu Nachbarstädten
- Automatische `sitemap.xml` (alle Stadtseiten + Profile)

**ISR-Revalidierung:** alle 6 Stunden + sofort bei Premium-Änderungen via Stripe Webhook

---

## 3. Pakete & Monetarisierung

| Feature | Basic (gratis) | Gold (€79/Monat) | SEO & Sichtbarkeit (ab €299/Monat) |
|---|---|---|---|
| Basisprofil (Name, Adresse, Tel.) | ✓ | ✓ | ✓ |
| Website-Link | ✓ | ✓ | ✓ |
| Listung auf Stadtseite | unten | ganz oben | ganz oben |
| Eigenes Profil-Logo | — | ✓ | ✓ |
| Beschreibungstext | — | 500 Wörter | 500 Wörter |
| Spezialgebiete (Tags) | — | 10 | 10 |
| Kontaktformular | — | ✓ | ✓ |
| "Premium"-Badge | — | ✓ | ✓ |
| Mehrere Städte | — | bis zu 3 | bis zu 3 |
| On-Page SEO Optimierung | — | — | ✓ |
| Google Business Optimierung | — | — | ✓ |
| Monatliches SEO-Reporting | — | — | ✓ |
| Backlink-Aufbau | — | — | ✓ |
| Persönlicher Ansprechpartner | — | — | ✓ |

**Zahlungsflow:**
1. Steuerberater wählt Paket im Dashboard → Stripe Checkout
2. Nach Zahlung: Stripe Webhook → DB update → ISR revalidiert Stadtseite sofort
3. Kündigung via Stripe Customer Portal
4. SEO-Paket: individuelles Angebot per Kontaktformular, Stripe erst nach Auftragsabschluss

---

## 4. Datenmodell

```
User
├── id, email, passwordHash
├── role: STEUERBERATER | ADMIN
└── createdAt

SteuerberaterProfile
├── id, userId (FK)
├── name, slug
├── adresse, plz, stadt, bundesland
├── telefon, email, website
├── logo, beschreibung, tags
├── paket: BASIC | GOLD | SEO
├── paketAktivBis (Datum)
├── stripeCustomerId, stripeSubscriptionId
└── verified (bool)

Stadt
├── id, name, slug
├── bundesland
├── einleitungstext
└── lat, lng

SteuerberaterStadt               (many-to-many, Gold/SEO: bis zu 3 Städte)
├── steuerberaterId (FK)
└── stadtId (FK)

SEOAnfrage
├── id, steuerberaterId (FK)
├── nachricht, kontaktEmail
└── createdAt
```

**Datenbefüllung:** Import-Script liest WKO-Registerdaten und befüllt alle Profile mit `paket: BASIC` als Default.

---

## 5. Dashboard & Admin

**Steuerberater-Dashboard (`/dashboard`):**
- Aktuelles Paket + Laufzeit + Stripe Customer Portal Link
- Profil bearbeiten (Logo, Beschreibung, Tags, Website, Telefon)
- Städte verwalten (Gold/SEO: bis zu 3)
- Paket upgraden → Stripe Checkout
- SEO-Paket anfragen → Kontaktformular
- Registrierung: E-Mail + Passwort via NextAuth, Profil aus Import-Daten vorausgefüllt

**Admin-Panel (`/admin`):**
- Profile einsehen, bearbeiten, verifizieren
- Import-Script manuell triggern
- SEO-Anfragen verwalten
- Stadtseiten manuell revalidieren
- Neue Städte anlegen + Einleitungstext pflegen

---

## 6. Error Handling & Testing

**Error Handling:**
- Stripe Webhooks: Idempotenz via `stripeSubscriptionId`
- Fehlgeschlagene Zahlung: Grace Period 3 Tage, dann Downgrade auf BASIC
- ISR Fehler: zuletzt gecachte Seite bleibt aktiv (kein Ausfall)
- Import-Script: fehlerhafte Einträge → `import_errors.log`
- Formular-Validierung: Zod-Schema serverseitig auf allen API Routes

**Testing:**
- Unit Tests: Paket-Logik, Stripe-Webhook-Handler (Jest)
- E2E Tests: Registrierung → Upgrade → Premium-Badge auf Stadtseite (Playwright)
- Manuell: Import-Script mit echten WKO-Daten vor Launch

**Launch-Checkliste:**
- Alle ~100 Stadtseiten generiert & indexierbar
- `sitemap.xml` bei Google Search Console eingereicht
- Stripe Live-Modus aktiviert
- Admin-Panel zugänglich
