# Frontend Audit — Vollständiges Design (Phase 1–4)

> Stand: 2026-03-03 | Erweiterung des bestehenden Phase 1+2 Plans

## Scope

Alle 4 Phasen aus `frontend.md` umsetzen:
- Phase 1: SEO-Blocker & Rechtliches (Tasks 1–4)
- Phase 2: Core Directory UX (Tasks 5–12)
- Phase 3: Wachstum & Polish (Tasks 13–19)
- Phase 4: Nice-to-have (Tasks 20–24)

## Ansatz

- Inkrementell, Task für Task
- Hybrid: Einfache Features voll funktional, externe APIs als UI-Platzhalter
- Rechtliche Seiten mit Platzhalter-Templates

---

## Phase 1 — SEO & Rechtliches

### Task 1: OG Meta Tags + Favicon
- Globale OG-Defaults in `layout.tsx` mit og:image Platzhalter
- Seitenspezifische OG-Tags via `generateMetadata` auf Stadt-/Profilseiten
- Favicon + theme-color in Metadata

### Task 2: Legal Pages + Footer Links
- `src/app/impressum/page.tsx` — Platzhalter-Template
- `src/app/datenschutz/page.tsx` — DSGVO-Struktur mit [PLATZHALTER]
- `src/app/agb/page.tsx` — Nutzungsbedingungen Template
- Footer.tsx: Links zu allen 3 Seiten

### Task 3: Cookie Consent Banner
- `src/components/CookieConsent.tsx` — Client Component
- localStorage-basiert, kein externes Package
- Einbindung in `layout.tsx`

### Task 4: Enhanced JSON-LD Schemas
- Organization Schema auf Homepage
- BreadcrumbList Schema auf Stadt-/Profilseiten
- LocalBusiness erweitern: image, areaServed, knowsAbout, priceRange
- ItemList: alle Einträge statt nur 10

---

## Phase 2 — Core Directory UX

### Task 5: Review/Rating System (DB + API)
- Prisma Model: Review (id, profileId, authorName, authorEmail, rating 1-5, comment, createdAt)
- API: POST + GET `/api/reviews`
- Validierung mit Zod

### Task 6: Review UI + Star Component
- `src/components/StarRating.tsx` — Interaktive Sterne (1-5)
- `src/components/ReviewSection.tsx` — Liste + Formular
- Durchschnittsbewertung auf SteuerberaterCard
- AggregateRating Schema in JSON-LD

### Task 7: Tag Filter + Sort auf Stadtseiten
- `src/components/ListingFilters.tsx` — Client Component
- Klickbare Tag-Chips zum Filtern
- Sortierung: Premium zuerst, Name A-Z, Bewertung, Neueste
- URL-Params: `?tag=X&sort=Y`

### Task 8: Kontaktformular auf Profilseiten
- `src/components/ContactForm.tsx` — Validiertes Formular
- API Route `/api/contact` — speichert Anfrage
- Felder: Name, Email, Nachricht, Datenschutz-Checkbox

### Task 9: FAQ-Seite
- `src/app/faq/page.tsx` — Accordion-UI
- FAQPage JSON-LD Schema
- Footer-Link

### Task 10: Claim Profile CTA
- `src/components/ClaimProfileCTA.tsx`
- Banner auf nicht-verifizierten Profilen
- Link zur Registrierung

### Task 11: ARIA & Keyboard Accessibility
- aria-labels auf CitySearch, Navbar, Buttons
- Skip-Link in layout.tsx
- focus-visible Styles in globals.css
- aria-expanded auf Dropdowns

### Task 12: Mobile Hamburger Menu
- State-basiert in Navbar.tsx
- Slide-in Animation
- Schließt bei Route-Wechsel

---

## Phase 3 — Wachstum & Polish

### Task 13: Kartenansicht (UI-Platzhalter)
- `src/components/MapPlaceholder.tsx` — Styled Platzhalter-Box
- Auf Profilseiten unterhalb Kontaktdaten
- Vorbereitet für Google Maps / Leaflet

### Task 14: Globale Suche in Navbar
- Suchicon → expandierender Input
- Gleiche Autocomplete wie CitySearch (kompakte Variante)
- Mobile: Vollbreite unter Navbar

### Task 15: Featured-Berater auf Homepage
- Neuer Abschnitt zwischen Stats und Städte-Grid
- Bis zu 6 GOLD/SEO-Profile
- Prisma Query mit paket-Filter

### Task 16: Loading Skeletons
- `src/components/Skeleton.tsx` — Card, Text, Avatar Primitives
- `loading.tsx` in Route-Segmenten

### Task 17: Pagination für Stadtseiten
- `src/components/Pagination.tsx` — URL-basiert `?page=N`
- 20 pro Seite, Server-Side Prisma skip/take

### Task 18: Verifiziertes Profil-Badge
- Grünes Häkchen auf Card + Profilseite
- Basiert auf `verified` Boolean

### Task 19: Analytics-Platzhalter
- `src/components/Analytics.tsx` — Conditional Script
- ENV: `NEXT_PUBLIC_ANALYTICS_ID`
- Plausible-kompatibel

---

## Phase 4 — Nice-to-have

### Task 20: Erweiterte Suche
- CitySearch erweitern um Name/PLZ
- API Route `/api/search` mit OR-Queries

### Task 21: Zusätzliche Profilfelder (UI)
- Öffnungszeiten, Sprachen, Berufserfahrung
- Anzeige wenn vorhanden, sonst ausgeblendet

### Task 22: Newsletter-Platzhalter
- `src/components/NewsletterSignup.tsx` im Footer
- Nur UI, localStorage "subscribed"

### Task 23: Testimonials auf Homepage
- Statische Testimonials (hardcoded)
- 3 Cards: Zitat, Name, Rolle

### Task 24: prefers-reduced-motion Support
- CSS Media Query in globals.css
- Deaktiviert Animationen: gold-shine, card-hover, fade-up, slide-in
