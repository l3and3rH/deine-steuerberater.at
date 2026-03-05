# Frontend Audit: SEO & UX für Steuerberater-Verzeichnis

> Stand: 2026-03-04 (aktualisiert) | Bewertung als Directory/Listing-Website | Alle Phasen (1–4) abgeschlossen

---

## Status-Legende

- ✅ Vorhanden & gut umgesetzt
- ⚠️ Teilweise vorhanden, Verbesserung nötig
- ❌ Fehlt komplett

---

## 1. SEO — Kritische Lücken

### Indexierung & Crawling

| Feature | Status | Notizen |
|---------|--------|---------|
| Sitemap (dynamisch) | ✅ | `src/app/sitemap.ts` mit Prioritäten, changeFrequency |
| robots.txt | ✅ | `src/app/robots.ts` — erlaubt `/`, blockiert `/api/`, `/dashboard/`, `/admin/`, `/auth/` |
| URL-Struktur | ✅ | Sauber: `/steuerberater/[stadt]/[slug]` |
| lastmod in Sitemap | ❌ | Keine Timestamps — Crawler erkennen keine Aktualität |

### Meta-Tags & Social Sharing

| Feature | Status | Notizen |
|---------|--------|---------|
| Title-Tags | ✅ | Template-System in `layout.tsx`, dynamisch pro Seite |
| Meta Descriptions | ✅ | Auf allen Seiten vorhanden |
| Open Graph Tags | ✅ | og:title, og:description, og:image (`/og-default.png` 1200x630), locale `de_AT` |
| Twitter Card | ✅ | `summary_large_image` konfiguriert |
| Favicon / Theme-Color | ✅ | favicon.ico, apple-touch-icon.png, theme-color `#0f2b1d` |
| lang-Attribut | ✅ | `lang="de"` korrekt gesetzt |

### Structured Data (JSON-LD)

| Feature | Status | Notizen |
|---------|--------|---------|
| LocalBusiness (Profilseiten) | ✅ | Erweitert: name, address, tel, email, image/logo, areaServed, knowsAbout, AggregateRating (wenn Reviews vorhanden) |
| ItemList (Stadtseiten) | ⚠️ | Nur erste 10 Einträge, sollte alle enthalten |
| BreadcrumbList Schema | ✅ | Auf Stadt- und Profilseiten implementiert |
| Organization Schema | ✅ | Auf der Homepage implementiert |
| AggregateRating Schema | ✅ | In LocalBusiness integriert, wenn Reviews vorhanden |
| FAQPage Schema | ✅ | Auf `/faq` mit korrektem JSON-LD |

### Heading-Hierarchie & Content

| Feature | Status | Notizen |
|---------|--------|---------|
| H1 pro Seite | ✅ | Korrekt auf allen Seiten |
| H2/H3 Hierarchie | ⚠️ | H2 vorhanden, aber Profilseiten nutzen styled Labels statt semantischer H3 |
| Alt-Texte für Bilder | ✅ | Profilbilder haben alt-Text |
| Interne Verlinkung | ✅ | Home→Stadt→Profil, "Weitere Steuerberater in [Stadt]" auf Profilseiten |

---

## 2. UX — Fehlende Elemente

### Navigation & Orientierung

| Feature | Status | Notizen |
|---------|--------|---------|
| Sticky Navbar | ✅ | Persistente Navigation mit `Navbar.tsx` |
| Footer | ✅ | `Footer.tsx` mit Links zu Impressum, Datenschutz, AGB, FAQ, Register |
| Breadcrumbs | ✅ | Auf Stadt- und Profilseiten |
| Mobile Hamburger-Menü | ✅ | Responsive Hamburger-Menü mit Links zu Verzeichnis, FAQ, Auth/Dashboard |
| Bundesland-Navigation | ✅ | `BundeslandDropdown.tsx` — Dropdown gruppiert nach Bundesland mit allen Städten |
| Skip-Links (Accessibility) | ❌ | Kein "Zum Inhalt springen"-Link |
| Suche in Navbar | ✅ | `NavbarSearch.tsx` — Globale Stadtsuche mit ⌘K Shortcut, Dropdown |

### Suche, Filter & Sortierung

| Feature | Status | Notizen |
|---------|--------|---------|
| Stadtsuche mit Autocomplete | ✅ | `CitySearch.tsx` mit Live-Filterung, max 8 Ergebnisse |
| Filter nach Fachgebiet/Tags | ✅ | `BeraterListFilter.tsx` — Klickbare Tag-Chips mit Mehrfachauswahl |
| Filter nach Paket (Premium/Basic) | ❌ | Kein UI-Filter |
| Sortierung (Name, Rating, Neu) | ✅ | Dropdown: Premium zuerst, Name A–Z, Beste Bewertung, Neueste zuerst |
| Pagination | ✅ | Client-seitige Pagination mit 10 Einträgen pro Seite, Zurück/Weiter-Buttons |
| Erweiterte Suche | ✅ | `/api/search` — Suche nach Stadt, Name, PLZ und Fachgebiet mit Debouncing |

### Ladezustände & Fehlerbehandlung

| Feature | Status | Notizen |
|---------|--------|---------|
| Loading Skeletons | ✅ | `loading.tsx` für Stadt- und Profilseiten mit animierten Skeleton-Platzhaltern |
| Leerer Zustand (keine Ergebnisse) | ✅ | Gute Empty-State-UI auf Stadtseiten |
| Fehlerzustände bei API-Calls | ❌ | Keine Fehlerbehandlung sichtbar |
| Formular-Validierung | ✅ | SEO-Kontaktformular hat Pflichtfeld- und minLength-Validierung |
| 404-Handling | ✅ | `notFound()` für fehlende Profile |

### Accessibility (A11y)

| Feature | Status | Notizen |
|---------|--------|---------|
| Semantisches HTML | ✅ | nav, main, section, footer korrekt |
| aria-hidden für Deko-Elemente | ✅ | Grain-Overlay, SVG-Icons |
| ARIA-Labels für Interaktionen | ✅ | Suchfeld (aria-label, role=combobox), Navbar-Hamburger (aria-expanded), Filter-Buttons (aria-pressed), Sort-Select, Footer |

---

## 3. Directory-spezifische Features

### Bewertungen & Vertrauen

| Feature | Status | Priorität | Notizen |
|---------|--------|-----------|---------|
| Sterne-Bewertungen | ✅ | HOCH | `StarRating.tsx` — interaktiv & Display-Modus, auf Profilseiten integriert |
| Textuelle Reviews | ✅ | HOCH | `ReviewSection.tsx` — Reviews mit Name, Rating, Kommentar, Datum |
| Review-API | ✅ | HOCH | `/api/reviews` — GET/POST mit Zod-Validierung, Prisma-Persistierung |
| Verifiziertes Profil-Badge | ✅ | HOCH | Badge auf Cards und Profilseiten, wenn `verified === true` |
| Testimonials | ✅ | MITTEL | 3 Testimonials auf Homepage (Mandanten und Steuerberater) |
| Anzahl Bewertungen auf Cards | ✅ | HOCH | Sterne + Anzahl auf Cards via `avgRating`/`reviewCount` Props |

### Profil-Features

| Feature | Status | Priorität | Notizen |
|---------|--------|-----------|---------|
| Öffnungszeiten | ✅ | MITTEL | `openingHours` Feld in Schema, Anzeige auf Profilseite + JSON-LD |
| Gesprochene Sprachen | ✅ | MITTEL | `languages[]` Feld in Schema, Anzeige auf Profilseite + JSON-LD `knowsLanguage` |
| Berufserfahrung (Jahre) | ✅ | MITTEL | `experienceYears` Feld in Schema, Anzeige auf Profilseite |
| Kanzleigröße / Mitarbeiter | ❌ | NIEDRIG | Firmengrößen-Indikator |
| Einzugsgebiet / Serviceregion | ❌ | MITTEL | Über Stadtgrenzen hinaus |
| Direktes Kontaktformular | ✅ | HOCH | `ContactForm.tsx` auf Profilseiten eingebunden, mit Name/Email/Nachricht/Datenschutz |
| "Profil beanspruchen" Flow | ✅ | HOCH | `ClaimProfileCTA.tsx` auf Profilseiten (nur bei nicht-Premium Profilen) |
| Kartenansicht (OpenStreetMap) | ✅ | MITTEL | `MapEmbed.tsx` — OSM-Embed auf Profilseiten mit Stadt-Koordinaten |

### Vergleich & Entscheidungshilfe

| Feature | Status | Priorität | Notizen |
|---------|--------|-----------|---------|
| Vergleichstool | ❌ | MITTEL | Berater nebeneinander vergleichen |
| "Ähnliche Berater" | ✅ | MITTEL | "Weitere Steuerberater in [Stadt]" mit bis zu 3 Empfehlungen auf Profilseiten |
| FAQ-Seite | ✅ | HOCH | `/faq` mit 8 FAQs, Accordion-UI, FAQPage Schema |
| Blog / Ratgeber | ❌ | MITTEL | Organischen Traffic aufbauen |

### Featured / Premium Listings

| Feature | Status | Notizen |
|---------|--------|---------|
| Premium-Badge auf Cards | ✅ | Gold-Badge für GOLD/SEO-Tier |
| Premium zuerst sortiert | ✅ | Hard-coded Sortierung |
| Featured-Bereich auf Homepage | ✅ | Bis zu 6 Premium-Berater mit Bild, Rating, Tags als Cards |
| Rotation / Randomisierung | ❌ | Immer gleiche Reihenfolge |
| "Neu auf der Plattform" | ❌ | Keine Hervorhebung neuer Profile |

---

## 4. Rechtliche Pflicht-Seiten (Österreich)

| Feature | Status | Priorität |
|---------|--------|-----------|
| Impressum | ✅ | **PFLICHT** — `src/app/impressum/page.tsx` |
| Datenschutzerklärung | ✅ | **PFLICHT** — `src/app/datenschutz/page.tsx` mit DSGVO/Stripe-Infos |
| AGB / Nutzungsbedingungen | ✅ | **PFLICHT** — `src/app/agb/page.tsx` |
| Cookie-Consent-Banner | ✅ | **PFLICHT** — `src/components/CookieConsent.tsx` mit Accept/Decline, localStorage |

---

## 5. Performance & Technisches

### Was gut läuft

- ISR konfiguriert (Homepage 1h, Stadtseiten 6h, Profile 6h)
- Next.js Image-Optimierung aktiv
- Font-Optimierung mit `font-display: swap`
- Static Generation mit `generateStaticParams`
- Saubere Tailwind-Responsive-Klassen

### Was fehlt

| Feature | Priorität | Notizen |
|---------|-----------|---------|
| Redirects / Rewrites in next.config | NIEDRIG | Für URL-Migrationen |
| Middleware für SEO | NIEDRIG | z.B. Trailing-Slash-Normalisierung |
| Analytics-Integration | ✅ | Plausible Analytics via `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` Env-Variable |
| Error Boundary (React) | MITTEL | Für graceful Degradation |

---

## 6. Priorisierte Umsetzungsreihenfolge

### Phase 1 — Kritisch (SEO-Blocker & Rechtliches) — ✅ ABGESCHLOSSEN

~~2. Open Graph Meta-Tags hinzufügen~~
~~3. Impressum, Datenschutz, AGB Seiten anlegen~~
~~4. Cookie-Consent-Banner~~
~~5. LocalBusiness Schema vervollständigen (image, areaServed, knowsAbout)~~
~~6. BreadcrumbList Schema hinzufügen~~

### Phase 2 — Hoch (Core Directory UX) — ✅ ABGESCHLOSSEN

~~7. Bewertungs-/Rating-System implementieren~~ ✅
~~8. Tag-Filter auf Stadtseiten~~ ✅
~~9. Sortieroptionen (Name, Bewertung, Neu)~~ ✅
~~10. Direktes Kontaktformular auf Profilseiten~~ ✅
~~11. FAQ-Seite mit FAQPage Schema~~ ✅
~~12. "Profil beanspruchen"-Flow~~ ✅
~~13. ARIA-Labels & Keyboard-Navigation fixen~~ ✅
~~14. Mobile Hamburger-Menü~~ ✅

### Phase 3 — Mittel (Wachstum & Polish) — ✅ GRÖSSTENTEILS ABGESCHLOSSEN

~~15. Kartenansicht (OpenStreetMap Integration)~~ ✅
~~16. Globale Suche in Navbar~~ ✅
~~17. Featured-Berater auf Homepage~~ ✅
18. Blog/Ratgeber-Bereich ❌
19. Vergleichstool ❌
~~20. "Ähnliche Berater"-Empfehlungen~~ ✅
~~21. Loading Skeletons~~ ✅
~~22. Pagination für große Stadtseiten~~ ✅
~~23. Verifiziertes Profil-Badge~~ ✅
~~24. Analytics-Integration~~ ✅

### Phase 4 — Nice-to-have — ✅ ABGESCHLOSSEN

~~25. Erweiterte Suche (nach Name, PLZ, Fachgebiet)~~ ✅
~~26. Öffnungszeiten, Sprachen, Berufserfahrung auf Profilen~~ ✅
~~27. Bundesland-Dropdown in Navigation~~ ✅
~~28. Newsletter-Anmeldung~~ ✅
~~29. Testimonials von Premium-Kunden~~ ✅
~~30. prefers-reduced-motion Support~~ ✅

---

## Positiv-Highlights (was bereits gut ist)

- Sauberes, modernes Design mit klarer visueller Hierarchie
- Professionelles Farbschema (Forest, Cream, Gold)
- Gute Typografie (Fraunces Display + Outfit Body)
- Saubere URL-Struktur und Slugs
- Dynamische Sitemap mit Prioritäten
- JSON-LD umfassend implementiert (LocalBusiness, ItemList, BreadcrumbList, Organization, FAQPage, AggregateRating)
- Responsive Design mit Tailwind
- Gute Empty-States
- Premium-Differenzierung erkennbar
- ISR für Performance korrekt konfiguriert
- Alle rechtlichen Pflichtseiten vorhanden (Impressum, Datenschutz, AGB, Cookie-Consent)
- Bewertungssystem mit Reviews und Sterne-Rating implementiert
- Footer mit vollständiger Navigation zu allen relevanten Seiten
- Globale Suche mit ⌘K Shortcut
- Featured Premium-Berater auf Homepage
- "Ähnliche Berater"-Empfehlungen auf Profilseiten
- OpenStreetMap-Kartenansicht auf Profilseiten
- Loading Skeletons für bessere UX
- Client-seitige Pagination auf Stadtseiten
- Verifiziertes-Profil-Badge
- Plausible Analytics vorbereitet
- Erweiterte Suche nach Name, PLZ, Fachgebiet mit Debouncing
- Bundesland-Dropdown in Navbar
- Newsletter-Anmeldung im Footer
- Testimonials auf Homepage
- prefers-reduced-motion Support für barrierefreie Nutzung
- Profil-Details: Öffnungszeiten, Sprachen, Berufserfahrung (Schema + UI)
