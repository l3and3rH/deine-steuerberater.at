# Frontend SEO & UX Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement Phase 1 (SEO/Legal) + Phase 2 (Core Directory UX) from frontend.md audit

**Architecture:** Next.js App Router with Prisma ORM, Tailwind CSS, server components + client islands

**Tech Stack:** Next.js 14, Prisma 5, Tailwind 3, TypeScript, next-auth

---

### Task 1: robots.txt + OG Meta Tags

**Files:**
- Create: `src/app/robots.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/steuerberater/[stadt]/page.tsx`
- Modify: `src/app/steuerberater/[stadt]/[slug]/page.tsx`

### Task 2: Legal Pages + Footer Links

**Files:**
- Create: `src/app/impressum/page.tsx`
- Create: `src/app/datenschutz/page.tsx`
- Create: `src/app/agb/page.tsx`
- Modify: `src/components/Footer.tsx`

### Task 3: Cookie Consent Banner

**Files:**
- Create: `src/components/CookieConsent.tsx`
- Modify: `src/app/layout.tsx`

### Task 4: Enhanced JSON-LD Schemas

**Files:**
- Modify: `src/app/steuerberater/[stadt]/[slug]/page.tsx` (LocalBusiness)
- Modify: `src/app/steuerberater/[stadt]/page.tsx` (ItemList + BreadcrumbList)
- Modify: `src/app/page.tsx` (Organization)

### Task 5: Review/Rating System (DB + API)

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/app/api/reviews/route.ts`

### Task 6: Review UI + Star Component

**Files:**
- Create: `src/components/StarRating.tsx`
- Create: `src/components/ReviewSection.tsx`
- Modify: `src/app/steuerberater/[stadt]/[slug]/page.tsx`
- Modify: `src/components/SteuerberaterCard.tsx`

### Task 7: Tag Filter + Sort on City Pages

**Files:**
- Create: `src/components/ListingFilters.tsx`
- Modify: `src/app/steuerberater/[stadt]/page.tsx`

### Task 8: Contact Form on Profile Pages

**Files:**
- Create: `src/components/ContactForm.tsx`
- Create: `src/app/api/contact/route.ts`
- Modify: `src/app/steuerberater/[stadt]/[slug]/page.tsx`

### Task 9: FAQ Page

**Files:**
- Create: `src/app/faq/page.tsx`
- Modify: `src/components/Footer.tsx`

### Task 10: Claim Profile CTA

**Files:**
- Create: `src/components/ClaimProfileCTA.tsx`
- Modify: `src/app/steuerberater/[stadt]/[slug]/page.tsx`

### Task 11: ARIA & Keyboard Accessibility

**Files:**
- Modify: `src/components/CitySearch.tsx`
- Modify: `src/components/Navbar.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

### Task 12: Mobile Hamburger Menu

**Files:**
- Modify: `src/components/Navbar.tsx`
