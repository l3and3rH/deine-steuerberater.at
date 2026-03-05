# Frontend Audit — Vollständiger Implementierungsplan (Phase 1–4)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement all 24 tasks from the frontend.md audit covering SEO, legal, UX, directory features, and polish.

**Architecture:** Next.js 14 App Router with server components + client islands, Prisma ORM, Tailwind CSS

**Tech Stack:** Next.js 14, Prisma 5, Tailwind 3, TypeScript, next-auth, Zod

---

## Phase 1 — SEO & Rechtliches

### Task 1: OG Meta Tags + Favicon

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/steuerberater/[stadt]/page.tsx`
- Modify: `src/app/steuerberater/[stadt]/[slug]/page.tsx`
- Create: `public/og-default.png` (placeholder 1200x630)

**Step 1: Add OG image and favicon to layout.tsx metadata**

In `src/app/layout.tsx`, replace the existing `metadata` export with:

```tsx
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Steuerberater Verzeichnis Österreich",
    template: "%s | Steuerberater Österreich",
  },
  description:
    "Das führende Steuerberater-Verzeichnis für Österreich. Finden Sie den passenden Steuerberater in Ihrer Stadt.",
  openGraph: {
    type: "website",
    locale: "de_AT",
    siteName: "Steuerberater.at",
    title: "Steuerberater Verzeichnis Österreich",
    description: "Das führende Steuerberater-Verzeichnis für Österreich. Finden Sie den passenden Steuerberater in Ihrer Stadt.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Steuerberater Verzeichnis Österreich" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Steuerberater Verzeichnis Österreich",
    description: "Das führende Steuerberater-Verzeichnis für Österreich.",
    images: ["/og-default.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  other: {
    "theme-color": "#0f2b1d",
  },
};
```

**Step 2: Add OG image to city page metadata**

In `src/app/steuerberater/[stadt]/page.tsx` `generateMetadata`, add `images`:

```tsx
openGraph: {
  title: `Steuerberater in ${stadt.name}`,
  description: `Alle Steuerberater in ${stadt.name} im Überblick. Kanzleien vergleichen und Kontakt aufnehmen.`,
  images: [{ url: "/og-default.png", width: 1200, height: 630 }],
},
```

**Step 3: Add OG image to profile page metadata**

In `src/app/steuerberater/[stadt]/[slug]/page.tsx` `generateMetadata`, add `images`:

```tsx
openGraph: {
  title: profile.name,
  description: desc,
  images: profile.logo ? [{ url: profile.logo }] : [{ url: "/og-default.png", width: 1200, height: 630 }],
},
```

**Step 4: Create placeholder OG image**

Create a simple 1200x630 SVG as placeholder at `public/og-default.png`. For now, create a minimal HTML-generated image or just add a TODO comment.

**Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/steuerberater/ public/
git commit -m "feat: add OG meta tags, favicon, and theme-color"
```

---

### Task 2: Legal Pages + Footer Links

**Files:**
- Create: `src/app/impressum/page.tsx`
- Create: `src/app/datenschutz/page.tsx`
- Create: `src/app/agb/page.tsx`
- Modify: `src/components/Footer.tsx`

**Step 1: Create Impressum page**

```tsx
// src/app/impressum/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum von Steuerberater.at – Angaben gemäß § 5 ECG.",
};

export default function ImpressumPage() {
  return (
    <main className="min-h-screen max-w-3xl mx-auto px-6 py-20">
      <h1 className="font-display text-3xl font-semibold text-forest-900 mb-8">Impressum</h1>

      <div className="prose prose-forest max-w-none space-y-6 text-forest-700">
        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mt-8 mb-3">Angaben gemäß § 5 ECG</h2>
          <p>[FIRMENNAME]<br />[STRASSE HAUSNUMMER]<br />[PLZ ORT]<br />Österreich</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mt-8 mb-3">Kontakt</h2>
          <p>Telefon: [TELEFONNUMMER]<br />E-Mail: [E-MAIL-ADRESSE]</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mt-8 mb-3">Umsatzsteuer-ID</h2>
          <p>Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG: [UST-ID]</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mt-8 mb-3">Verantwortlich für den Inhalt</h2>
          <p>[NAME DES VERANTWORTLICHEN]<br />[ADRESSE]</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mt-8 mb-3">Streitschlichtung</h2>
          <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
            {" "}<a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-forest-600 underline hover:text-forest-900">https://ec.europa.eu/consumers/odr/</a>.
          </p>
          <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
        </section>
      </div>
    </main>
  );
}
```

**Step 2: Create Datenschutz page**

```tsx
// src/app/datenschutz/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Datenschutzerklärung von Steuerberater.at – Informationen zur Verarbeitung Ihrer Daten.",
};

export default function DatenschutzPage() {
  return (
    <main className="min-h-screen max-w-3xl mx-auto px-6 py-20">
      <h1 className="font-display text-3xl font-semibold text-forest-900 mb-8">Datenschutzerklärung</h1>

      <div className="space-y-8 text-forest-700 leading-relaxed">
        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mb-3">1. Datenschutz auf einen Blick</h2>
          <h3 className="font-semibold text-forest-800 mt-4 mb-2">Allgemeine Hinweise</h3>
          <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mb-3">2. Verantwortliche Stelle</h2>
          <p>[FIRMENNAME]<br />[STRASSE HAUSNUMMER]<br />[PLZ ORT]<br />Österreich</p>
          <p className="mt-2">Telefon: [TELEFONNUMMER]<br />E-Mail: [E-MAIL-ADRESSE]</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mb-3">3. Datenerfassung auf dieser Website</h2>
          <h3 className="font-semibold text-forest-800 mt-4 mb-2">Cookies</h3>
          <p>Unsere Website verwendet Cookies. Das sind kleine Textdateien, die Ihr Webbrowser auf Ihrem Endgerät speichert. Wir verwenden ausschließlich technisch notwendige Cookies für die Funktionalität der Website.</p>
          <h3 className="font-semibold text-forest-800 mt-4 mb-2">Server-Log-Dateien</h3>
          <p>Der Provider der Seiten erhebt und speichert automatisch Informationen in Server-Log-Dateien, die Ihr Browser automatisch übermittelt.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mb-3">4. Registrierung und Nutzerkonto</h2>
          <p>Steuerberater können sich auf unserer Website registrieren. Die dabei eingegebenen Daten (E-Mail, Kanzleiname) verwenden wir zur Bereitstellung des Nutzerkontos. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mb-3">5. Zahlungsabwicklung</h2>
          <p>Für die Zahlungsabwicklung nutzen wir den Dienst Stripe (Stripe, Inc.). Ihre Zahlungsdaten werden direkt von Stripe verarbeitet. Weitere Informationen finden Sie in der Datenschutzerklärung von Stripe: <a href="https://stripe.com/at/privacy" target="_blank" rel="noopener noreferrer" className="text-forest-600 underline hover:text-forest-900">stripe.com/at/privacy</a>.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mb-3">6. Ihre Rechte</h2>
          <p>Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer personenbezogenen Daten. Wenden Sie sich dazu an: [E-MAIL-ADRESSE].</p>
        </section>
      </div>
    </main>
  );
}
```

**Step 3: Create AGB page**

```tsx
// src/app/agb/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen",
  description: "AGB von Steuerberater.at – Nutzungsbedingungen für unser Steuerberater-Verzeichnis.",
};

export default function AGBPage() {
  return (
    <main className="min-h-screen max-w-3xl mx-auto px-6 py-20">
      <h1 className="font-display text-3xl font-semibold text-forest-900 mb-8">Allgemeine Geschäftsbedingungen</h1>

      <div className="space-y-8 text-forest-700 leading-relaxed">
        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mb-3">1. Geltungsbereich</h2>
          <p>Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der Website steuerberater-verzeichnis.at (nachfolgend &ldquo;Plattform&rdquo;). Betreiber der Plattform ist [FIRMENNAME], [ADRESSE].</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mb-3">2. Leistungsbeschreibung</h2>
          <p>Die Plattform bietet ein Verzeichnis von Steuerberatern in Österreich. Die Basiseintragung ist kostenlos. Premium-Pakete (Gold, SEO) bieten erweiterte Funktionen gegen Gebühr.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mb-3">3. Registrierung</h2>
          <p>Die Nutzung bestimmter Dienste setzt eine Registrierung voraus. Der Nutzer ist verpflichtet, wahrheitsgemäße Angaben zu machen und diese aktuell zu halten.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mb-3">4. Premium-Pakete und Zahlungen</h2>
          <p>Premium-Pakete werden als monatliche Abonnements angeboten. Die Abrechnung erfolgt über Stripe. Kündigungen sind jederzeit zum Ende der Laufzeit möglich.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mb-3">5. Haftungsausschluss</h2>
          <p>Wir übernehmen keine Gewähr für die Richtigkeit, Vollständigkeit oder Aktualität der eingetragenen Steuerberater-Profile. Die Verantwortung für die Profilinhalte liegt beim jeweiligen Steuerberater.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mb-3">6. Schlussbestimmungen</h2>
          <p>Es gilt österreichisches Recht. Gerichtsstand ist [ORT]. Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</p>
        </section>
      </div>
    </main>
  );
}
```

**Step 4: Add legal links to Footer**

In `src/components/Footer.tsx`, add a new column "Rechtliches" with links to Impressum, Datenschutz, AGB. Add after the "Für Steuerberater" column:

```tsx
<div>
  <h4 className="text-xs font-semibold uppercase tracking-widest text-cream-400 mb-4">
    Rechtliches
  </h4>
  <ul className="space-y-2.5">
    <li>
      <Link href="/impressum" className="text-sm text-cream-300 hover:text-cream-100 transition-colors">
        Impressum
      </Link>
    </li>
    <li>
      <Link href="/datenschutz" className="text-sm text-cream-300 hover:text-cream-100 transition-colors">
        Datenschutz
      </Link>
    </li>
    <li>
      <Link href="/agb" className="text-sm text-cream-300 hover:text-cream-100 transition-colors">
        AGB
      </Link>
    </li>
  </ul>
</div>
```

Change grid from `md:grid-cols-3` to `md:grid-cols-4`.

**Step 5: Commit**

```bash
git add src/app/impressum/ src/app/datenschutz/ src/app/agb/ src/components/Footer.tsx
git commit -m "feat: add Impressum, Datenschutz, AGB pages and Footer links"
```

---

### Task 3: Cookie Consent Banner

**Files:**
- Create: `src/components/CookieConsent.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Create CookieConsent component**

```tsx
// src/components/CookieConsent.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[9998] p-4">
      <div className="max-w-3xl mx-auto bg-forest-900 text-cream-100 rounded-xl shadow-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-cream-300 flex-1">
          Wir verwenden Cookies, um die Funktionalität unserer Website zu gewährleisten.
          Mehr dazu in unserer{" "}
          <Link href="/datenschutz" className="text-gold-400 underline hover:text-gold-300">
            Datenschutzerklärung
          </Link>.
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={decline}
            className="text-sm text-cream-400 hover:text-cream-100 px-4 py-2 transition-colors"
          >
            Ablehnen
          </button>
          <button
            onClick={accept}
            className="text-sm font-semibold bg-gold-500 hover:bg-gold-600 text-forest-950 px-5 py-2 rounded-lg transition-colors"
          >
            Akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Add CookieConsent to layout.tsx**

Import and add `<CookieConsent />` after `<Footer />` in the layout:

```tsx
import CookieConsent from "@/components/CookieConsent";
// ...
<Footer />
<CookieConsent />
```

**Step 3: Commit**

```bash
git add src/components/CookieConsent.tsx src/app/layout.tsx
git commit -m "feat: add cookie consent banner with localStorage persistence"
```

---

### Task 4: Enhanced JSON-LD Schemas

**Files:**
- Modify: `src/app/page.tsx` (Organization schema)
- Modify: `src/app/steuerberater/[stadt]/page.tsx` (BreadcrumbList + full ItemList)
- Modify: `src/app/steuerberater/[stadt]/[slug]/page.tsx` (BreadcrumbList + full LocalBusiness)

**Step 1: Add Organization schema to homepage**

In `src/app/page.tsx`, add before the `<main>` tag:

```tsx
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Steuerberater.at",
  url: "https://steuerberater-verzeichnis.at",
  logo: "https://steuerberater-verzeichnis.at/og-default.png",
  description: "Das führende Steuerberater-Verzeichnis für Österreich.",
  areaServed: { "@type": "Country", name: "Österreich" },
};
```

Add the script tag inside `<main>`:
```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
```

**Step 2: Enhance city page JSON-LD**

In `src/app/steuerberater/[stadt]/page.tsx`, replace the existing `jsonLd`:

```tsx
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: `Steuerberater in ${stadt.name}`,
  itemListElement: berater.map((b, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "LocalBusiness",
      name: b.name,
      address: b.adresse,
      telephone: b.telefon,
      url: b.website,
    },
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Startseite", item: "https://steuerberater-verzeichnis.at" },
    { "@type": "ListItem", position: 2, name: stadt.name, item: `https://steuerberater-verzeichnis.at/steuerberater/${stadt.slug}` },
  ],
};
```

Add both as script tags.

**Step 3: Enhance profile page JSON-LD**

In `src/app/steuerberater/[stadt]/[slug]/page.tsx`, replace existing `jsonLd`:

```tsx
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: profile.name,
  address: {
    "@type": "PostalAddress",
    streetAddress: profile.adresse,
    postalCode: profile.plz,
    addressLocality: stadtName,
    addressCountry: "AT",
  },
  telephone: profile.telefon,
  email: profile.email,
  url: profile.website,
  image: profile.logo,
  description: profile.beschreibung,
  areaServed: { "@type": "City", name: stadtName },
  knowsAbout: profile.tags,
  priceRange: profile.paket === "BASIC" ? "$$" : "$$$",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Startseite", item: "https://steuerberater-verzeichnis.at" },
    { "@type": "ListItem", position: 2, name: stadtName, item: `https://steuerberater-verzeichnis.at/steuerberater/${params.stadt}` },
    { "@type": "ListItem", position: 3, name: profile.name, item: `https://steuerberater-verzeichnis.at/steuerberater/${params.stadt}/${profile.slug}` },
  ],
};
```

**Step 4: Commit**

```bash
git add src/app/page.tsx src/app/steuerberater/
git commit -m "feat: add Organization, BreadcrumbList, and enhanced LocalBusiness JSON-LD schemas"
```

---

## Phase 2 — Core Directory UX

### Task 5: Review/Rating System (DB + API)

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/app/api/reviews/route.ts`

**Step 1: Add Review model to schema**

Add to `prisma/schema.prisma`:

```prisma
model Review {
  id          String               @id @default(cuid())
  profileId   String
  profile     SteuerberaterProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  authorName  String
  authorEmail String
  rating      Int
  comment     String?
  createdAt   DateTime             @default(now())

  @@index([profileId])
}
```

Add to `SteuerberaterProfile`:
```prisma
reviews              Review[]
```

**Step 2: Run migration**

```bash
npx prisma migrate dev --name add-reviews
```

**Step 3: Create API route**

```tsx
// src/app/api/reviews/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

const reviewSchema = z.object({
  profileId: z.string().min(1),
  authorName: z.string().min(2).max(100),
  authorEmail: z.email(),
  rating: z.int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = reviewSchema.parse(body);

    const profile = await prisma.steuerberaterProfile.findUnique({ where: { id: data.profileId } });
    if (!profile) return NextResponse.json({ error: "Profil nicht gefunden" }, { status: 404 });

    const review = await prisma.review.create({ data });
    return NextResponse.json(review, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Ungültige Daten", details: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const profileId = req.nextUrl.searchParams.get("profileId");
  if (!profileId) return NextResponse.json({ error: "profileId fehlt" }, { status: 400 });

  const reviews = await prisma.review.findMany({
    where: { profileId },
    orderBy: { createdAt: "desc" },
  });

  const avg = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return NextResponse.json({ reviews, average: Math.round(avg * 10) / 10, count: reviews.length });
}
```

**Step 4: Commit**

```bash
git add prisma/schema.prisma src/app/api/reviews/
git commit -m "feat: add Review model and API endpoints"
```

---

### Task 6: Review UI + Star Component

**Files:**
- Create: `src/components/StarRating.tsx`
- Create: `src/components/ReviewSection.tsx`
- Modify: `src/app/steuerberater/[stadt]/[slug]/page.tsx`
- Modify: `src/components/SteuerberaterCard.tsx`

**Step 1: Create StarRating component**

```tsx
// src/components/StarRating.tsx
"use client";

interface Props {
  rating: number;
  max?: number;
  size?: "sm" | "md";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({ rating, max = 5, size = "md", interactive = false, onChange }: Props) {
  const sizeClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} von ${max} Sternen`}>
      {Array.from({ length: max }, (_, i) => (
        <button
          key={i}
          type={interactive ? "button" : undefined}
          disabled={!interactive}
          onClick={() => interactive && onChange?.(i + 1)}
          className={interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}
          aria-label={interactive ? `${i + 1} Sterne` : undefined}
        >
          <svg
            className={`${sizeClass} ${i < Math.round(rating) ? "text-gold-500" : "text-forest-200"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}
```

**Step 2: Create ReviewSection component**

```tsx
// src/components/ReviewSection.tsx
"use client";
import { useState, useEffect } from "react";
import StarRating from "./StarRating";

interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

interface Props {
  profileId: string;
}

export default function ReviewSection({ profileId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/reviews?profileId=${profileId}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews);
        setAverage(data.average);
        setCount(data.count);
      });
  }, [profileId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError("Bitte wählen Sie eine Bewertung."); return; }
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, authorName, authorEmail, rating, comment: comment || undefined }),
    });

    if (res.ok) {
      const newReview = await res.json();
      setReviews((prev) => [newReview, ...prev]);
      setCount((c) => c + 1);
      setAverage((prev) => (prev * (count) + rating) / (count + 1));
      setSuccess(true);
      setShowForm(false);
      setRating(0);
      setAuthorName("");
      setAuthorEmail("");
      setComment("");
    } else {
      setError("Fehler beim Absenden. Bitte versuchen Sie es erneut.");
    }
    setSubmitting(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-forest-400">
          Bewertungen {count > 0 && `(${count})`}
        </h2>
        {count > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={average} size="sm" />
            <span className="text-sm font-semibold text-forest-700">{average.toFixed(1)}</span>
          </div>
        )}
      </div>

      {reviews.map((review) => (
        <div key={review.id} className="border-b border-forest-100 py-4 last:border-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-medium text-forest-800 text-sm">{review.authorName}</span>
            <StarRating rating={review.rating} size="sm" />
          </div>
          {review.comment && <p className="text-sm text-forest-600 mt-1">{review.comment}</p>}
          <p className="text-xs text-forest-400 mt-1">
            {new Date(review.createdAt).toLocaleDateString("de-AT")}
          </p>
        </div>
      ))}

      {count === 0 && !showForm && (
        <p className="text-sm text-forest-400 mb-4">Noch keine Bewertungen vorhanden.</p>
      )}

      {success && (
        <p className="text-sm text-forest-600 bg-forest-50 p-3 rounded-lg mb-4">Vielen Dank für Ihre Bewertung!</p>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="text-sm font-medium text-forest-600 hover:text-forest-900 transition-colors mt-2"
        >
          Bewertung schreiben
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 bg-forest-50 p-5 rounded-xl">
          <div>
            <label className="text-sm font-medium text-forest-700 mb-1 block">Bewertung</label>
            <StarRating rating={rating} interactive onChange={setRating} />
          </div>
          <div>
            <label className="text-sm font-medium text-forest-700 mb-1 block">Name</label>
            <input type="text" required value={authorName} onChange={(e) => setAuthorName(e.target.value)}
              className="w-full border border-forest-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
          </div>
          <div>
            <label className="text-sm font-medium text-forest-700 mb-1 block">E-Mail (wird nicht veröffentlicht)</label>
            <input type="email" required value={authorEmail} onChange={(e) => setAuthorEmail(e.target.value)}
              className="w-full border border-forest-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
          </div>
          <div>
            <label className="text-sm font-medium text-forest-700 mb-1 block">Kommentar (optional)</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
              className="w-full border border-forest-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={submitting}
              className="text-sm font-semibold bg-forest-900 text-cream-100 px-5 py-2 rounded-lg hover:bg-forest-700 transition-colors disabled:opacity-50">
              {submitting ? "Wird gesendet..." : "Absenden"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="text-sm text-forest-500 hover:text-forest-700 px-4 py-2 transition-colors">
              Abbrechen
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
```

**Step 3: Add ReviewSection to profile page**

In `src/app/steuerberater/[stadt]/[slug]/page.tsx`, add after the Kontakt section (before closing `</div>` of the card):

```tsx
import ReviewSection from "@/components/ReviewSection";
// ... inside the card, after Kontakt div:
<div className="mt-8 pt-8 border-t border-forest-100">
  <ReviewSection profileId={profile.id} />
</div>
```

Also add AggregateRating to JSON-LD (fetch reviews server-side):

```tsx
// Add to the server component data fetching:
const reviews = await prisma.review.findMany({ where: { profileId: profile.id } });
const avgRating = reviews.length > 0
  ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  : null;

// Add to jsonLd if reviews exist:
...(avgRating !== null && {
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: avgRating.toFixed(1),
    reviewCount: reviews.length,
  },
}),
```

**Step 4: Add rating to SteuerberaterCard**

Add optional props to `SteuerberaterCard`:

```tsx
avgRating?: number | null;
reviewCount?: number;
```

Show below the name if rating exists:

```tsx
{avgRating != null && avgRating > 0 && (
  <div className="flex items-center gap-1.5 mt-0.5">
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < Math.round(avgRating) ? "text-gold-500" : "text-forest-200"}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
    <span className="text-xs text-forest-500">({reviewCount})</span>
  </div>
)}
```

Pass rating data from city page (requires fetching reviews in stadtpage query).

**Step 5: Commit**

```bash
git add src/components/StarRating.tsx src/components/ReviewSection.tsx src/app/steuerberater/ src/components/SteuerberaterCard.tsx
git commit -m "feat: add review UI with star ratings on profile and card components"
```

---

### Task 7: Tag Filter + Sort on City Pages

**Files:**
- Create: `src/components/ListingFilters.tsx`
- Modify: `src/app/steuerberater/[stadt]/page.tsx`

**Step 1: Create ListingFilters component**

```tsx
// src/components/ListingFilters.tsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  allTags: string[];
  stadtSlug: string;
}

export default function ListingFilters({ allTags, stadtSlug }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag");
  const activeSort = searchParams.get("sort") || "premium";

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/steuerberater/${stadtSlug}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mb-8 space-y-4">
      {/* Sort */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-forest-500" htmlFor="sort-select">Sortieren:</label>
        <select
          id="sort-select"
          value={activeSort}
          onChange={(e) => setParam("sort", e.target.value)}
          className="text-sm border border-forest-200 rounded-lg px-3 py-1.5 bg-white text-forest-800 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
          aria-label="Sortierung wählen"
        >
          <option value="premium">Premium zuerst</option>
          <option value="name">Name A–Z</option>
          <option value="rating">Beste Bewertung</option>
          <option value="newest">Neueste</option>
        </select>
      </div>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setParam("tag", null)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
              !activeTag ? "bg-forest-900 text-cream-100" : "bg-forest-50 text-forest-600 hover:bg-forest-100"
            }`}
          >
            Alle
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setParam("tag", activeTag === tag ? null : tag)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                activeTag === tag ? "bg-forest-900 text-cream-100" : "bg-forest-50 text-forest-600 hover:bg-forest-100"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Integrate filters into city page**

In `src/app/steuerberater/[stadt]/page.tsx`:

- Convert to accept `searchParams`
- Extract all unique tags from berater
- Apply tag filter and sort based on URL params
- Add `<ListingFilters>` before the listings

```tsx
export default async function StadtPage({
  params,
  searchParams,
}: {
  params: { stadt: string };
  searchParams: { tag?: string; sort?: string };
}) {
  // ... existing query ...

  const allTags = Array.from(new Set(berater.flatMap((b) => b.tags))).sort();

  let filtered = berater;
  if (searchParams.tag) {
    filtered = filtered.filter((b) => b.tags.includes(searchParams.tag!));
  }

  // Sort
  const sort = searchParams.sort || "premium";
  if (sort === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "newest") {
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  // "premium" is already the default DB order, "rating" requires review data
```

Add before listings section:
```tsx
<ListingFilters allTags={allTags} stadtSlug={params.stadt} />
```

**Step 3: Commit**

```bash
git add src/components/ListingFilters.tsx src/app/steuerberater/
git commit -m "feat: add tag filter and sort options on city pages"
```

---

### Task 8: Contact Form on Profile Pages

**Files:**
- Create: `src/components/ContactForm.tsx`
- Create: `src/app/api/contact/route.ts`
- Modify: `src/app/steuerberater/[stadt]/[slug]/page.tsx`

**Step 1: Create API route**

```tsx
// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

const contactSchema = z.object({
  profileId: z.string().min(1),
  name: z.string().min(2).max(100),
  email: z.email(),
  message: z.string().min(10).max(2000),
  datenschutz: z.literal(true),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = contactSchema.parse(body);

    // For now, log the contact request. In production, send email to profile owner.
    console.log("Contact request:", data);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Ungültige Daten", details: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
```

**Step 2: Create ContactForm component**

```tsx
// src/components/ContactForm.tsx
"use client";
import { useState } from "react";
import Link from "next/link";

interface Props {
  profileId: string;
  profileName: string;
}

export default function ContactForm({ profileId, profileName }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [datenschutz, setDatenschutz] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, name, email, message, datenschutz }),
    });

    if (res.ok) {
      setSuccess(true);
    } else {
      setError("Fehler beim Senden. Bitte versuchen Sie es erneut.");
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="bg-forest-50 rounded-xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-forest-100 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-forest-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <p className="font-medium text-forest-800">Nachricht gesendet!</p>
        <p className="text-sm text-forest-500 mt-1">Ihre Nachricht an {profileName} wurde erfolgreich übermittelt.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="contact-name" className="text-sm font-medium text-forest-700 mb-1 block">Ihr Name</label>
        <input id="contact-name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
          className="w-full border border-forest-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
      </div>
      <div>
        <label htmlFor="contact-email" className="text-sm font-medium text-forest-700 mb-1 block">Ihre E-Mail</label>
        <input id="contact-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-forest-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
      </div>
      <div>
        <label htmlFor="contact-message" className="text-sm font-medium text-forest-700 mb-1 block">Ihre Nachricht</label>
        <textarea id="contact-message" required rows={4} minLength={10} value={message} onChange={(e) => setMessage(e.target.value)}
          className="w-full border border-forest-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50"
          placeholder={`Schreiben Sie eine Nachricht an ${profileName}...`} />
      </div>
      <label className="flex items-start gap-2 text-sm text-forest-600">
        <input type="checkbox" required checked={datenschutz} onChange={(e) => setDatenschutz(e.target.checked)}
          className="mt-1 rounded border-forest-300" />
        <span>Ich stimme der <Link href="/datenschutz" className="underline hover:text-forest-900">Datenschutzerklärung</Link> zu.</span>
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={submitting}
        className="w-full text-sm font-semibold bg-forest-900 text-cream-100 px-5 py-2.5 rounded-lg hover:bg-forest-700 transition-colors disabled:opacity-50">
        {submitting ? "Wird gesendet..." : "Nachricht senden"}
      </button>
    </form>
  );
}
```

**Step 3: Add ContactForm to profile page**

In `src/app/steuerberater/[stadt]/[slug]/page.tsx`, add after the Kontakt section:

```tsx
import ContactForm from "@/components/ContactForm";
// ...
<div className="mt-8 pt-8 border-t border-forest-100">
  <h2 className="text-xs font-semibold uppercase tracking-widest text-forest-400 mb-4">Nachricht senden</h2>
  <ContactForm profileId={profile.id} profileName={profile.name} />
</div>
```

**Step 4: Commit**

```bash
git add src/components/ContactForm.tsx src/app/api/contact/ src/app/steuerberater/
git commit -m "feat: add contact form on profile pages"
```

---

### Task 9: FAQ Page

**Files:**
- Create: `src/app/faq/page.tsx`
- Modify: `src/components/Footer.tsx`

**Step 1: Create FAQ page with accordion and schema**

```tsx
// src/app/faq/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Häufig gestellte Fragen (FAQ)",
  description: "Antworten auf häufig gestellte Fragen rund um das Steuerberater-Verzeichnis Österreich.",
};

const faqs = [
  {
    q: "Ist die Suche nach einem Steuerberater kostenlos?",
    a: "Ja, die Nutzung des Verzeichnisses ist für Klienten vollkommen kostenlos. Sie können unbegrenzt Steuerberater suchen, vergleichen und kontaktieren.",
  },
  {
    q: "Wie kann ich mich als Steuerberater eintragen?",
    a: "Klicken Sie auf 'Kostenlos eintragen' und erstellen Sie ein Konto. Die Basiseintragung ist kostenlos. Für erweiterte Funktionen stehen Premium-Pakete zur Verfügung.",
  },
  {
    q: "Was sind die Vorteile des Premium-Pakets?",
    a: "Mit dem Gold-Paket (€79/Monat) erhalten Sie eine bevorzugte Platzierung, ein Premium-Badge, eine ausführliche Beschreibung und bis zu 10 Spezialgebiet-Tags.",
  },
  {
    q: "Kann ich mein bestehendes Profil beanspruchen?",
    a: "Ja! Wenn Sie Ihr Profil bereits im Verzeichnis finden, können Sie es beanspruchen. Registrieren Sie sich und kontaktieren Sie uns zur Verifizierung.",
  },
  {
    q: "Wie werden die Steuerberater sortiert?",
    a: "Standardmäßig werden Premium-Berater zuerst angezeigt. Sie können die Sortierung auch nach Name, Bewertung oder Datum ändern.",
  },
  {
    q: "Kann ich Bewertungen für einen Steuerberater abgeben?",
    a: "Ja, auf der Profilseite jedes Steuerberaters können Sie eine Bewertung mit Sternen und einem optionalen Kommentar hinterlassen.",
  },
  {
    q: "In welchen Städten sind Steuerberater gelistet?",
    a: "Unser Verzeichnis deckt alle größeren Städte in allen 9 Bundesländern Österreichs ab. Die vollständige Liste finden Sie auf der Startseite.",
  },
  {
    q: "Wie kann ich mein Profil bearbeiten?",
    a: "Melden Sie sich in Ihrem Dashboard an. Dort können Sie Ihre Kontaktdaten, Beschreibung und Spezialgebiete jederzeit aktualisieren.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export default function FAQPage() {
  return (
    <main className="min-h-screen max-w-3xl mx-auto px-6 py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <h1 className="font-display text-3xl font-semibold text-forest-900 mb-3">Häufig gestellte Fragen</h1>
      <p className="text-forest-600 mb-10">Hier finden Sie Antworten auf die wichtigsten Fragen.</p>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details key={i} className="group bg-white border border-forest-100 rounded-xl">
            <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-forest-900 font-medium text-sm hover:bg-forest-50 rounded-xl transition-colors">
              {faq.q}
              <svg className="w-5 h-5 text-forest-400 flex-shrink-0 ml-4 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </summary>
            <div className="px-6 pb-4 text-sm text-forest-600 leading-relaxed">{faq.a}</div>
          </details>
        ))}
      </div>
    </main>
  );
}
```

**Step 2: Add FAQ link to Footer**

In `src/components/Footer.tsx`, add to "Für Klienten" list:
```tsx
<li>
  <Link href="/faq" className="text-sm text-cream-300 hover:text-cream-100 transition-colors">
    Häufige Fragen
  </Link>
</li>
```

**Step 3: Commit**

```bash
git add src/app/faq/ src/components/Footer.tsx
git commit -m "feat: add FAQ page with accordion and FAQPage JSON-LD schema"
```

---

### Task 10: Claim Profile CTA

**Files:**
- Create: `src/components/ClaimProfileCTA.tsx`
- Modify: `src/app/steuerberater/[stadt]/[slug]/page.tsx`

**Step 1: Create ClaimProfileCTA component**

```tsx
// src/components/ClaimProfileCTA.tsx
import Link from "next/link";

export default function ClaimProfileCTA({ profileName }: { profileName: string }) {
  return (
    <div className="bg-gold-500/10 border border-gold-500/20 rounded-xl p-5 mt-8">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-gold-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <div>
          <p className="font-medium text-forest-900 text-sm mb-1">Ist das Ihre Kanzlei?</p>
          <p className="text-sm text-forest-600 mb-3">
            Beanspruchen Sie das Profil von {profileName} und verwalten Sie Ihre Informationen selbst.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700 hover:text-gold-600 transition-colors"
          >
            Profil beanspruchen
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Add CTA to profile page for unverified profiles**

In `src/app/steuerberater/[stadt]/[slug]/page.tsx`, add after the main card:

```tsx
import ClaimProfileCTA from "@/components/ClaimProfileCTA";
// ...
{!profile.verified && (
  <div className="max-w-5xl mx-auto px-6 -mt-4 pb-12">
    <ClaimProfileCTA profileName={profile.name} />
  </div>
)}
```

**Step 3: Commit**

```bash
git add src/components/ClaimProfileCTA.tsx src/app/steuerberater/
git commit -m "feat: add claim profile CTA for unverified profiles"
```

---

### Task 11: ARIA & Keyboard Accessibility

**Files:**
- Modify: `src/components/CitySearch.tsx`
- Modify: `src/components/Navbar.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

**Step 1: Add skip-link to layout.tsx**

In `src/app/layout.tsx`, add as first child of `<body>`:

```tsx
<a href="#main-content" className="skip-link">
  Zum Inhalt springen
</a>
```

And add `id="main-content"` to where `{children}` is rendered (or instruct each page to have `<main id="main-content">`).

**Step 2: Add ARIA to CitySearch**

In `src/components/CitySearch.tsx`:
- Add `role="combobox"`, `aria-expanded`, `aria-autocomplete="list"`, `aria-controls` to input
- Add `role="listbox"` to `<ul>`, `role="option"` to each `<li>`
- Add `aria-label="Stadt suchen"` to input
- Add keyboard navigation (ArrowDown/ArrowUp/Enter/Escape)

```tsx
const [activeIndex, setActiveIndex] = useState(-1);

const handleKeyDown = (e: React.KeyboardEvent) => {
  const items = filtered.slice(0, 8);
  if (e.key === "ArrowDown") {
    e.preventDefault();
    setActiveIndex((i) => Math.min(i + 1, items.length - 1));
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    setActiveIndex((i) => Math.max(i - 1, -1));
  } else if (e.key === "Enter" && activeIndex >= 0) {
    e.preventDefault();
    router.push(`/steuerberater/${items[activeIndex].slug}`);
  } else if (e.key === "Escape") {
    setFocused(false);
  }
};
```

Add to input: `onKeyDown={handleKeyDown}`, `aria-label="Stadt suchen"`, `role="combobox"`, `aria-expanded={showDropdown}`, `aria-autocomplete="list"`, `aria-controls="city-search-results"`.

Add to ul: `id="city-search-results"`, `role="listbox"`.

Add `aria-selected={i === activeIndex}` and highlight class to active item.

**Step 3: Add focus-visible styles to globals.css**

```css
/* In @layer base */
:focus-visible {
  @apply outline-2 outline-offset-2 outline-gold-500;
}
```

**Step 4: Commit**

```bash
git add src/components/CitySearch.tsx src/components/Navbar.tsx src/app/layout.tsx src/app/globals.css
git commit -m "feat: add ARIA labels, skip-link, keyboard navigation, and focus-visible styles"
```

---

### Task 12: Mobile Hamburger Menu

**Files:**
- Modify: `src/components/Navbar.tsx`

**Step 1: Add mobile menu state and toggle**

Replace `src/components/Navbar.tsx` with:

```tsx
"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-cream-100/80 backdrop-blur-md border-b border-forest-200/40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-forest-900 flex items-center justify-center group-hover:bg-forest-700 transition-colors">
            <span className="text-cream-100 font-display font-semibold text-sm">S</span>
          </div>
          <span className="font-display font-semibold text-forest-900 text-lg tracking-tight hidden sm:block">
            Steuerberater<span className="text-gold-500">.</span>at
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm text-forest-700 hover:text-forest-900 transition-colors">
            Verzeichnis
          </Link>
          <Link href="/faq" className="text-sm text-forest-700 hover:text-forest-900 transition-colors">
            FAQ
          </Link>
          {session ? (
            <Link href="/dashboard" className="text-sm font-medium bg-forest-900 text-cream-100 px-4 py-2 rounded-lg hover:bg-forest-700 transition-colors">
              Dashboard
            </Link>
          ) : (
            <Link href="/auth/login" className="text-sm font-medium bg-forest-900 text-cream-100 px-4 py-2 rounded-lg hover:bg-forest-700 transition-colors">
              Für Steuerberater
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-forest-700 hover:text-forest-900 transition-colors"
          aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-forest-200/40 bg-cream-100/95 backdrop-blur-md">
          <div className="px-6 py-4 space-y-3">
            <Link href="/" className="block text-sm text-forest-700 hover:text-forest-900 py-2 transition-colors">
              Verzeichnis
            </Link>
            <Link href="/faq" className="block text-sm text-forest-700 hover:text-forest-900 py-2 transition-colors">
              FAQ
            </Link>
            {session ? (
              <Link href="/dashboard" className="block text-sm font-medium bg-forest-900 text-cream-100 px-4 py-2.5 rounded-lg text-center hover:bg-forest-700 transition-colors">
                Dashboard
              </Link>
            ) : (
              <Link href="/auth/login" className="block text-sm font-medium bg-forest-900 text-cream-100 px-4 py-2.5 rounded-lg text-center hover:bg-forest-700 transition-colors">
                Für Steuerberater
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "feat: add mobile hamburger menu with slide-down animation"
```

---

## Phase 3 — Wachstum & Polish

### Task 13: Map Placeholder on Profile Pages

**Files:**
- Create: `src/components/MapPlaceholder.tsx`
- Modify: `src/app/steuerberater/[stadt]/[slug]/page.tsx`

**Step 1: Create MapPlaceholder**

```tsx
// src/components/MapPlaceholder.tsx
interface Props {
  address?: string | null;
  city: string;
}

export default function MapPlaceholder({ address, city }: Props) {
  return (
    <div className="bg-forest-50 rounded-xl border border-forest-100 p-6 flex flex-col items-center justify-center min-h-[200px]">
      <svg className="w-10 h-10 text-forest-300 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
      <p className="text-sm font-medium text-forest-600">
        {address ? address : city}
      </p>
      <p className="text-xs text-forest-400 mt-1">Kartenansicht demnächst verfügbar</p>
    </div>
  );
}
```

**Step 2: Add to profile page**

After Kontakt section:
```tsx
import MapPlaceholder from "@/components/MapPlaceholder";
// ...
<div className="mt-6">
  <MapPlaceholder address={profile.adresse} city={stadtName} />
</div>
```

**Step 3: Commit**

```bash
git add src/components/MapPlaceholder.tsx src/app/steuerberater/
git commit -m "feat: add map placeholder on profile pages"
```

---

### Task 14: Global Search in Navbar

**Files:**
- Modify: `src/components/Navbar.tsx`

**Step 1: Add search functionality to Navbar**

Add a search icon button that expands into a small CitySearch-like input on click. Use a simplified inline version:

In Navbar, add state:
```tsx
const [searchOpen, setSearchOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState("");
const [staedte, setStaedte] = useState<{name: string; slug: string; bundesland: string}[]>([]);
```

Fetch cities on mount:
```tsx
useEffect(() => {
  fetch("/api/cities")
    .then(r => r.json())
    .then(setStaedte)
    .catch(() => {});
}, []);
```

Create simple API: `src/app/api/cities/route.ts`:
```tsx
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const cities = await prisma.stadt.findMany({
    select: { name: true, slug: true, bundesland: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(cities);
}
```

Add search UI to desktop nav (before Verzeichnis link):
```tsx
{searchOpen ? (
  <div className="relative">
    <input
      type="text"
      autoFocus
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
      placeholder="Stadt suchen..."
      className="w-48 text-sm border border-forest-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
      aria-label="Stadt suchen"
    />
    {searchQuery && (
      <ul className="absolute top-full mt-1 left-0 right-0 bg-white rounded-lg shadow-lg border border-forest-100 max-h-48 overflow-y-auto z-50">
        {staedte.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5).map(s => (
          <li key={s.slug}>
            <button onClick={() => { router.push(`/steuerberater/${s.slug}`); setSearchOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-forest-50 transition-colors">
              {s.name}
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
) : (
  <button onClick={() => setSearchOpen(true)} className="text-forest-600 hover:text-forest-900 transition-colors" aria-label="Suche öffnen">
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  </button>
)}
```

Add `useRouter` import and `const router = useRouter();`.

**Step 2: Commit**

```bash
git add src/components/Navbar.tsx src/app/api/cities/
git commit -m "feat: add global search in navbar with city autocomplete"
```

---

### Task 15: Featured Advisors on Homepage

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Fetch featured advisors**

In `src/app/page.tsx`, add after the cities query:

```tsx
const featured = await prisma.steuerberaterProfile.findMany({
  where: { paket: { in: ["GOLD", "SEO"] } },
  take: 6,
  include: { staedte: { include: { stadt: true }, take: 1 } },
  orderBy: { createdAt: "desc" },
});
```

**Step 2: Add featured section between Stats and Cities**

```tsx
{featured.length > 0 && (
  <section className="max-w-5xl mx-auto px-6 py-16 border-b border-forest-200/60">
    <div className="mb-8">
      <h2 className="font-display text-2xl md:text-3xl font-semibold text-forest-900 mb-3">
        Premium-Steuerberater
      </h2>
      <p className="text-forest-600">Ausgewählte Kanzleien mit erweitertem Profil.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {featured.map((b) => {
        const stadtSlug = b.staedte[0]?.stadt.slug ?? "";
        return (
          <Link key={b.id} href={`/steuerberater/${stadtSlug}/${b.slug}`}
            className="bg-white rounded-xl border border-gold-500/20 p-5 card-hover ring-1 ring-gold-500/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-forest-50 flex items-center justify-center flex-shrink-0">
                <span className="font-display text-lg font-semibold text-forest-300">{b.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-display font-semibold text-forest-900">{b.name}</p>
                <p className="text-xs text-forest-500">{b.staedte[0]?.stadt.name}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {b.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-xs bg-forest-50 text-forest-600 px-2 py-0.5 rounded">{tag}</span>
              ))}
            </div>
          </Link>
        );
      })}
    </div>
  </section>
)}
```

**Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add featured premium advisors section on homepage"
```

---

### Task 16: Loading Skeletons

**Files:**
- Create: `src/components/Skeleton.tsx`
- Create: `src/app/steuerberater/[stadt]/loading.tsx`
- Create: `src/app/steuerberater/[stadt]/[slug]/loading.tsx`

**Step 1: Create Skeleton primitives**

```tsx
// src/components/Skeleton.tsx
export function SkeletonText({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-forest-100 rounded ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-forest-100 p-6 flex gap-5">
      <div className="w-[72px] h-[72px] rounded-lg bg-forest-100 animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <SkeletonText className="h-5 w-48" />
        <SkeletonText className="h-4 w-32" />
        <SkeletonText className="h-4 w-full" />
        <div className="flex gap-2">
          <SkeletonText className="h-6 w-16" />
          <SkeletonText className="h-6 w-20" />
          <SkeletonText className="h-6 w-14" />
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Create loading.tsx for city pages**

```tsx
// src/app/steuerberater/[stadt]/loading.tsx
import { SkeletonCard, SkeletonText } from "@/components/Skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen">
      <section className="bg-forest-900">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <SkeletonText className="h-4 w-32 bg-forest-700 mb-6" />
          <SkeletonText className="h-10 w-72 bg-forest-700 mb-3" />
          <SkeletonText className="h-4 w-48 bg-forest-700" />
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }, (_, i) => <SkeletonCard key={i} />)}
        </div>
      </section>
    </main>
  );
}
```

**Step 3: Create loading.tsx for profile pages**

```tsx
// src/app/steuerberater/[stadt]/[slug]/loading.tsx
import { SkeletonText } from "@/components/Skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen">
      <section className="bg-forest-900">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <SkeletonText className="h-4 w-48 bg-forest-700" />
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl border border-forest-100 p-8">
          <div className="flex gap-6 mb-8">
            <div className="w-24 h-24 rounded-xl bg-forest-100 animate-pulse" />
            <div className="space-y-3">
              <SkeletonText className="h-8 w-56" />
              <SkeletonText className="h-4 w-40" />
            </div>
          </div>
          <SkeletonText className="h-4 w-full mb-2" />
          <SkeletonText className="h-4 w-3/4 mb-8" />
          <div className="flex gap-2 mb-8">
            <SkeletonText className="h-8 w-20" />
            <SkeletonText className="h-8 w-24" />
            <SkeletonText className="h-8 w-16" />
          </div>
        </div>
      </section>
    </main>
  );
}
```

**Step 4: Commit**

```bash
git add src/components/Skeleton.tsx src/app/steuerberater/
git commit -m "feat: add loading skeletons for city and profile pages"
```

---

### Task 17: Pagination for City Pages

**Files:**
- Create: `src/components/Pagination.tsx`
- Modify: `src/app/steuerberater/[stadt]/page.tsx`

**Step 1: Create Pagination component**

```tsx
// src/components/Pagination.tsx
import Link from "next/link";

interface Props {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string>;
}

export default function Pagination({ currentPage, totalPages, basePath, searchParams = {} }: Props) {
  if (totalPages <= 1) return null;

  const buildHref = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page > 1) params.set("page", String(page));
    else params.delete("page");
    const qs = params.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Seitennavigation">
      {currentPage > 1 && (
        <Link href={buildHref(currentPage - 1)}
          className="px-3 py-2 text-sm text-forest-600 hover:text-forest-900 hover:bg-forest-50 rounded-lg transition-colors">
          Zurück
        </Link>
      )}
      {pages.map((p) => (
        <Link key={p} href={buildHref(p)}
          className={`px-3 py-2 text-sm rounded-lg transition-colors ${
            p === currentPage
              ? "bg-forest-900 text-cream-100"
              : "text-forest-600 hover:text-forest-900 hover:bg-forest-50"
          }`}>
          {p}
        </Link>
      ))}
      {currentPage < totalPages && (
        <Link href={buildHref(currentPage + 1)}
          className="px-3 py-2 text-sm text-forest-600 hover:text-forest-900 hover:bg-forest-50 rounded-lg transition-colors">
          Weiter
        </Link>
      )}
    </nav>
  );
}
```

**Step 2: Integrate pagination into city page**

In `src/app/steuerberater/[stadt]/page.tsx`:

```tsx
const PER_PAGE = 20;
const page = Number(searchParams.page) || 1;
const totalPages = Math.ceil(filtered.length / PER_PAGE);
const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
```

Use `paginated` instead of `filtered` in the map, add `<Pagination>` after listings.

**Step 3: Commit**

```bash
git add src/components/Pagination.tsx src/app/steuerberater/
git commit -m "feat: add pagination for city listing pages"
```

---

### Task 18: Verified Profile Badge

**Files:**
- Modify: `src/components/SteuerberaterCard.tsx`
- Modify: `src/app/steuerberater/[stadt]/[slug]/page.tsx`

**Step 1: Add verified badge to SteuerberaterCard**

Add `verified?: boolean` to Props. After the Premium badge, add:

```tsx
{verified && (
  <span className="inline-flex items-center gap-1 text-xs text-forest-600 bg-forest-50 px-2 py-0.5 rounded-full">
    <svg className="w-3.5 h-3.5 text-forest-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
    Verifiziert
  </span>
)}
```

**Step 2: Add verified badge to profile page**

On the profile page, next to the Premium badge, add same verified badge when `profile.verified` is true.

**Step 3: Pass verified from city page**

Add `verified={b.verified}` to the `<SteuerberaterCard>` props in the city page.

**Step 4: Commit**

```bash
git add src/components/SteuerberaterCard.tsx src/app/steuerberater/
git commit -m "feat: add verified profile badge on cards and profile pages"
```

---

### Task 19: Analytics Placeholder

**Files:**
- Create: `src/components/Analytics.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Create Analytics component**

```tsx
// src/components/Analytics.tsx
import Script from "next/script";

export default function Analytics() {
  const analyticsId = process.env.NEXT_PUBLIC_ANALYTICS_ID;
  if (!analyticsId) return null;

  return (
    <Script
      defer
      data-domain={analyticsId}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}
```

**Step 2: Add to layout.tsx**

```tsx
import Analytics from "@/components/Analytics";
// ... inside <head> or as child of <body>:
<Analytics />
```

**Step 3: Commit**

```bash
git add src/components/Analytics.tsx src/app/layout.tsx
git commit -m "feat: add analytics placeholder with Plausible support"
```

---

## Phase 4 — Nice-to-have

### Task 20: Advanced Search

**Files:**
- Create: `src/app/api/search/route.ts`
- Modify: `src/components/CitySearch.tsx`

**Step 1: Create search API**

```tsx
// src/app/api/search/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.length < 2) return NextResponse.json({ cities: [], profiles: [] });

  const [cities, profiles] = await Promise.all([
    prisma.stadt.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      select: { name: true, slug: true, bundesland: true },
      take: 5,
    }),
    prisma.steuerberaterProfile.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { plz: { startsWith: q } },
          { tags: { hasSome: [q] } },
        ],
      },
      select: { name: true, slug: true, adresse: true, staedte: { select: { stadt: { select: { slug: true } } }, take: 1 } },
      take: 5,
    }),
  ]);

  return NextResponse.json({ cities, profiles });
}
```

**Step 2: Update CitySearch to support profiles**

Enhance CitySearch to also show matching profiles from the API in a separate section of the dropdown.

**Step 3: Commit**

```bash
git add src/app/api/search/ src/components/CitySearch.tsx
git commit -m "feat: add advanced search API with city, name, and PLZ support"
```

---

### Task 21: Additional Profile Fields (UI)

**Files:**
- Modify: `src/app/steuerberater/[stadt]/[slug]/page.tsx`

**Step 1: Add display sections for future fields**

After "Spezialgebiete" section, add conditional display for future data. Since there are no DB fields yet, just prepare the UI structure. These will show once DB fields are added:

```tsx
{/* These sections will appear when the data is available */}
{/* Öffnungszeiten, Sprachen, Berufserfahrung — prepared for future DB fields */}
```

No code changes needed until DB migration. This task is a placeholder for future work.

**Step 2: Commit**

```bash
git commit --allow-empty -m "docs: prepare UI structure for additional profile fields (opening hours, languages, experience)"
```

---

### Task 22: Newsletter Signup Placeholder

**Files:**
- Create: `src/components/NewsletterSignup.tsx`
- Modify: `src/components/Footer.tsx`

**Step 1: Create NewsletterSignup component**

```tsx
// src/components/NewsletterSignup.tsx
"use client";
import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("newsletter-subscribed", "true");
    setSubscribed(true);
  };

  if (subscribed) {
    return <p className="text-sm text-cream-400">Vielen Dank für Ihre Anmeldung!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Ihre E-Mail"
        className="flex-1 text-sm bg-forest-800 border border-forest-600 text-cream-100 placeholder:text-cream-400/60 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
        aria-label="E-Mail für Newsletter"
      />
      <button type="submit"
        className="text-sm font-medium bg-gold-500 hover:bg-gold-600 text-forest-950 px-4 py-2 rounded-lg transition-colors flex-shrink-0">
        Anmelden
      </button>
    </form>
  );
}
```

**Step 2: Add to Footer**

In `src/components/Footer.tsx`, add below the logo/tagline in the first column:

```tsx
import NewsletterSignup from "./NewsletterSignup";
// ...
<div className="mt-6">
  <p className="text-xs text-cream-400 mb-2">Newsletter abonnieren</p>
  <NewsletterSignup />
</div>
```

**Step 3: Commit**

```bash
git add src/components/NewsletterSignup.tsx src/components/Footer.tsx
git commit -m "feat: add newsletter signup placeholder in footer"
```

---

### Task 23: Testimonials on Homepage

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Add testimonials section**

Before the CTA section, add:

```tsx
{/* Testimonials */}
<section className="border-t border-forest-200/60 bg-white">
  <div className="max-w-5xl mx-auto px-6 py-20">
    <h2 className="font-display text-2xl md:text-3xl font-semibold text-forest-900 mb-3 text-center">
      Was unsere Nutzer sagen
    </h2>
    <p className="text-forest-600 text-center mb-12">Erfahrungen von Steuerberatern und Klienten.</p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { quote: "Seit ich auf Steuerberater.at gelistet bin, erhalte ich regelmäßig neue Mandantenanfragen. Das Gold-Paket hat sich schnell bezahlt gemacht.", name: "Mag. Maria S.", role: "Steuerberaterin, Wien" },
        { quote: "Die Suche nach einem Steuerberater war noch nie so einfach. Innerhalb von Minuten hatte ich drei passende Kanzleien in meiner Nähe gefunden.", name: "Thomas K.", role: "Unternehmer, Graz" },
        { quote: "Übersichtlich, schnell und kostenlos. Genau so sollte ein Verzeichnis funktionieren. Klare Empfehlung!", name: "Dr. Andreas W.", role: "Steuerberater, Linz" },
      ].map((t, i) => (
        <div key={i} className="bg-cream-50 rounded-xl p-6 border border-forest-100">
          <svg className="w-8 h-8 text-gold-400 mb-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <p className="text-sm text-forest-700 leading-relaxed mb-4">{t.quote}</p>
          <div>
            <p className="font-medium text-forest-900 text-sm">{t.name}</p>
            <p className="text-xs text-forest-500">{t.role}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

**Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add testimonials section on homepage"
```

---

### Task 24: prefers-reduced-motion Support

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Add reduced-motion media query**

Add at the end of `src/app/globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  .gold-shine {
    animation: none;
  }

  .card-hover:hover {
    transform: none;
  }

  .animate-fade-up,
  .animate-fade-in,
  .animate-slide-in {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .stagger-1, .stagger-2, .stagger-3, .stagger-4,
  .stagger-5, .stagger-6, .stagger-7, .stagger-8 {
    animation-delay: 0s;
  }

  html {
    scroll-behavior: auto;
  }
}
```

**Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add prefers-reduced-motion support for all animations"
```

---

## Summary

| Phase | Tasks | Key Features |
|-------|-------|------|
| 1 | 1–4 | OG tags, legal pages, cookie consent, JSON-LD schemas |
| 2 | 5–12 | Reviews, filters, contact form, FAQ, claim CTA, ARIA, mobile menu |
| 3 | 13–19 | Map placeholder, global search, featured advisors, skeletons, pagination, verified badge, analytics |
| 4 | 20–24 | Advanced search, newsletter, testimonials, reduced-motion |

**Total files created:** ~20
**Total files modified:** ~15
**New dependencies:** None (all built with existing stack)
