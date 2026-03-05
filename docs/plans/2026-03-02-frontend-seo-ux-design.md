# Frontend SEO & UX Verbesserungen — Design

## Scope: Phase 1 (Kritisch) + Phase 2 (Core Directory UX)

### Phase 1 — SEO & Rechtliches

1. **robots.txt** — `src/app/robots.ts` via Next.js Route Handler
2. **Open Graph & Twitter Cards** — Globale OG-Defaults in `layout.tsx`, seitenspezifisch via `generateMetadata`
3. **Impressum / Datenschutz / AGB** — Statische Seiten, verlinkt im Footer
4. **Cookie-Consent-Banner** — Client-Component, localStorage, kein externes Package
5. **LocalBusiness Schema** — Erweitern um image, areaServed, knowsAbout, priceRange
6. **BreadcrumbList Schema** — JSON-LD auf Stadt- und Profilseiten

### Phase 2 — Core Directory UX

7. **Bewertungssystem** — Prisma Review-Model, POST/GET API, Sterne-UI
8. **Tag-Filter** — Query-Param-basiert auf Stadtseiten, klickbare Tag-Chips
9. **Sortierung** — Dropdown-Komponente, URL-Params für sort={premium|name|rating}
10. **Kontaktformular** — Formular-Component auf Profilseiten mit Validierung
11. **FAQ-Seite** — `/faq` mit Accordion + FAQPage Schema
12. **Profil beanspruchen** — CTA auf Profilseiten + Link zur Registrierung
13. **ARIA & Keyboard** — Labels, focus-visible, aria-expanded, skip-links
14. **Mobile Hamburger-Menü** — State-basiert in Navbar, Slide-Animation
