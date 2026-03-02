# Steuerberater-Verzeichnis Österreich — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an SEO-driven Austrian tax advisor directory where city pages rank on Google for "[Stadt] + Steuerberater" queries, with tiered paid premium listings and Stripe subscriptions.

**Architecture:** Next.js 14 App Router with hybrid SSG + ISR for city pages, PostgreSQL via Supabase for persistence, NextAuth for steuerberater authentication. City pages are statically generated at build time and revalidated every 6 hours plus on-demand via Stripe webhooks.

**Tech Stack:** Next.js 14, TypeScript, Prisma, Supabase (PostgreSQL), NextAuth.js, Stripe, Tailwind CSS, Zod, Jest, Playwright

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json` (auto-generated)
- Create: `tsconfig.json` (auto-generated)
- Create: `.env.local`
- Create: `.gitignore`

**Step 1: Scaffold Next.js project**

Run in `C:\Users\leand\Documents\coding\Testing`:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```
Answer prompts: Yes to all defaults.

**Step 2: Install dependencies**

```bash
npm install prisma @prisma/client next-auth @auth/prisma-adapter stripe zod
npm install -D @types/node jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom ts-jest @playwright/test
```

**Step 3: Create `.env.local`**

```env
DATABASE_URL="postgresql://..."       # From Supabase: Settings > Database > Connection string (URI)
DIRECT_URL="postgresql://..."         # From Supabase: same page, Direct connection
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..."       # From Stripe Dashboard > Developers > API keys
STRIPE_WEBHOOK_SECRET="whsec_..."     # From Stripe Dashboard > Webhooks (fill in after Task 12)
STRIPE_PRICE_GOLD="price_..."         # From Stripe Dashboard (fill in after Task 11)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project with dependencies"
```

---

## Task 2: Prisma Schema & Database Connection

**Files:**
- Create: `prisma/schema.prisma`
- Modify: `.env.local` (DATABASE_URL already set)

**Step 1: Initialize Prisma**

```bash
npx prisma init
```

**Step 2: Replace `prisma/schema.prisma` entirely**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id            String                @id @default(cuid())
  email         String                @unique
  passwordHash  String?
  role          Role                  @default(STEUERBERATER)
  createdAt     DateTime              @default(now())
  profile       SteuerberaterProfile?
  sessions      Session[]
  accounts      Account[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model SteuerberaterProfile {
  id                     String               @id @default(cuid())
  userId                 String               @unique
  user                   User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  name                   String
  slug                   String               @unique
  adresse                String?
  plz                    String?
  telefon                String?
  email                  String?
  website                String?
  logo                   String?
  beschreibung           String?
  tags                   String[]
  paket                  Paket                @default(BASIC)
  paketAktivBis          DateTime?
  stripeCustomerId       String?
  stripeSubscriptionId   String?
  verified               Boolean              @default(false)
  createdAt              DateTime             @default(now())
  staedte                SteuerberaterStadt[]
}

model Stadt {
  id              String               @id @default(cuid())
  name            String
  slug            String               @unique
  bundesland      String
  einleitungstext String?
  lat             Float?
  lng             Float?
  steuerberater   SteuerberaterStadt[]
}

model SteuerberaterStadt {
  steuerberaterId String
  stadtId         String
  steuerberater   SteuerberaterProfile @relation(fields: [steuerberaterId], references: [id], onDelete: Cascade)
  stadt           Stadt                @relation(fields: [stadtId], references: [id], onDelete: Cascade)

  @@id([steuerberaterId, stadtId])
}

model SEOAnfrage {
  id                String   @id @default(cuid())
  kontaktEmail      String
  nachricht         String
  createdAt         DateTime @default(now())
}

enum Role {
  STEUERBERATER
  ADMIN
}

enum Paket {
  BASIC
  GOLD
  SEO
}
```

**Step 3: Push schema to Supabase**

```bash
npx prisma db push
```
Expected output: `Your database is now in sync with your Prisma schema.`

**Step 4: Generate Prisma client**

```bash
npx prisma generate
```

**Step 5: Create Prisma singleton**

Create `src/lib/prisma.ts`:
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Step 6: Commit**

```bash
git add prisma/ src/lib/prisma.ts
git commit -m "feat: add Prisma schema and database connection"
```

---

## Task 3: Seed Austrian District Cities

**Files:**
- Create: `prisma/seed-staedte.ts`
- Create: `prisma/staedte.json`

**Step 1: Create city data file `prisma/staedte.json`**

```json
[
  { "name": "Wien", "slug": "wien", "bundesland": "Wien" },
  { "name": "Graz", "slug": "graz", "bundesland": "Steiermark" },
  { "name": "Linz", "slug": "linz", "bundesland": "Oberösterreich" },
  { "name": "Salzburg", "slug": "salzburg", "bundesland": "Salzburg" },
  { "name": "Innsbruck", "slug": "innsbruck", "bundesland": "Tirol" },
  { "name": "Klagenfurt", "slug": "klagenfurt", "bundesland": "Kärnten" },
  { "name": "St. Pölten", "slug": "st-poelten", "bundesland": "Niederösterreich" },
  { "name": "Eisenstadt", "slug": "eisenstadt", "bundesland": "Burgenland" },
  { "name": "Bregenz", "slug": "bregenz", "bundesland": "Vorarlberg" },
  { "name": "Wels", "slug": "wels", "bundesland": "Oberösterreich" },
  { "name": "Steyr", "slug": "steyr", "bundesland": "Oberösterreich" },
  { "name": "Villach", "slug": "villach", "bundesland": "Kärnten" },
  { "name": "Wiener Neustadt", "slug": "wiener-neustadt", "bundesland": "Niederösterreich" },
  { "name": "Wolfsberg", "slug": "wolfsberg", "bundesland": "Kärnten" },
  { "name": "Baden", "slug": "baden", "bundesland": "Niederösterreich" },
  { "name": "Leoben", "slug": "leoben", "bundesland": "Steiermark" },
  { "name": "Krems an der Donau", "slug": "krems-an-der-donau", "bundesland": "Niederösterreich" },
  { "name": "Traun", "slug": "traun", "bundesland": "Oberösterreich" },
  { "name": "Leonding", "slug": "leonding", "bundesland": "Oberösterreich" },
  { "name": "Klosterneuburg", "slug": "klosterneuburg", "bundesland": "Niederösterreich" },
  { "name": "Kapfenberg", "slug": "kapfenberg", "bundesland": "Steiermark" },
  { "name": "Mödling", "slug": "moedling", "bundesland": "Niederösterreich" },
  { "name": "Hallein", "slug": "hallein", "bundesland": "Salzburg" },
  { "name": "Kufstein", "slug": "kufstein", "bundesland": "Tirol" },
  { "name": "Traiskirchen", "slug": "traiskirchen", "bundesland": "Niederösterreich" },
  { "name": "Schwechat", "slug": "schwechat", "bundesland": "Niederösterreich" },
  { "name": "Braunau am Inn", "slug": "braunau-am-inn", "bundesland": "Oberösterreich" },
  { "name": "Stockerau", "slug": "stockerau", "bundesland": "Niederösterreich" },
  { "name": "Saalfelden", "slug": "saalfelden", "bundesland": "Salzburg" },
  { "name": "Ansfelden", "slug": "ansfelden", "bundesland": "Oberösterreich" },
  { "name": "Lustenau", "slug": "lustenau", "bundesland": "Vorarlberg" },
  { "name": "Dornbirn", "slug": "dornbirn", "bundesland": "Vorarlberg" },
  { "name": "Feldkirch", "slug": "feldkirch", "bundesland": "Vorarlberg" },
  { "name": "Wörgl", "slug": "woergl", "bundesland": "Tirol" },
  { "name": "Telfs", "slug": "telfs", "bundesland": "Tirol" },
  { "name": "Bludenz", "slug": "bludenz", "bundesland": "Vorarlberg" },
  { "name": "Hard", "slug": "hard", "bundesland": "Vorarlberg" },
  { "name": "Rankweil", "slug": "rankweil", "bundesland": "Vorarlberg" },
  { "name": "Hörsching", "slug": "hoersching", "bundesland": "Oberösterreich" },
  { "name": "Ternitz", "slug": "ternitz", "bundesland": "Niederösterreich" },
  { "name": "Perchtoldsdorf", "slug": "perchtoldsdorf", "bundesland": "Niederösterreich" },
  { "name": "Waidhofen an der Ybbs", "slug": "waidhofen-an-der-ybbs", "bundesland": "Niederösterreich" },
  { "name": "Amstetten", "slug": "amstetten", "bundesland": "Niederösterreich" },
  { "name": "Mistelbach", "slug": "mistelbach", "bundesland": "Niederösterreich" },
  { "name": "Korneuburg", "slug": "korneuburg", "bundesland": "Niederösterreich" },
  { "name": "Tulln an der Donau", "slug": "tulln-an-der-donau", "bundesland": "Niederösterreich" },
  { "name": "Hollabrunn", "slug": "hollabrunn", "bundesland": "Niederösterreich" },
  { "name": "Zwettl", "slug": "zwettl", "bundesland": "Niederösterreich" },
  { "name": "Horn", "slug": "horn", "bundesland": "Niederösterreich" },
  { "name": "Gmünd", "slug": "gmuend", "bundesland": "Niederösterreich" },
  { "name": "Waidhofen an der Thaya", "slug": "waidhofen-an-der-thaya", "bundesland": "Niederösterreich" },
  { "name": "Scheibbs", "slug": "scheibbs", "bundesland": "Niederösterreich" },
  { "name": "Lilienfeld", "slug": "lilienfeld", "bundesland": "Niederösterreich" },
  { "name": "Neunkirchen", "slug": "neunkirchen", "bundesland": "Niederösterreich" },
  { "name": "Mank", "slug": "mank", "bundesland": "Niederösterreich" },
  { "name": "Perg", "slug": "perg", "bundesland": "Oberösterreich" },
  { "name": "Freistadt", "slug": "freistadt", "bundesland": "Oberösterreich" },
  { "name": "Rohrbach", "slug": "rohrbach", "bundesland": "Oberösterreich" },
  { "name": "Schärding", "slug": "schaerding", "bundesland": "Oberösterreich" },
  { "name": "Ried im Innkreis", "slug": "ried-im-innkreis", "bundesland": "Oberösterreich" },
  { "name": "Grieskirchen", "slug": "grieskirchen", "bundesland": "Oberösterreich" },
  { "name": "Vöcklabruck", "slug": "voecklabruck", "bundesland": "Oberösterreich" },
  { "name": "Gmunden", "slug": "gmunden", "bundesland": "Oberösterreich" },
  { "name": "Kirchdorf an der Krems", "slug": "kirchdorf-an-der-krems", "bundesland": "Oberösterreich" },
  { "name": "Freistadt", "slug": "freistadt-ooe", "bundesland": "Oberösterreich" },
  { "name": "Feldbach", "slug": "feldbach", "bundesland": "Steiermark" },
  { "name": "Hartberg", "slug": "hartberg", "bundesland": "Steiermark" },
  { "name": "Fürstenfeld", "slug": "fuerstenfeld", "bundesland": "Steiermark" },
  { "name": "Radkersburg", "slug": "radkersburg", "bundesland": "Steiermark" },
  { "name": "Deutschlandsberg", "slug": "deutschlandsberg", "bundesland": "Steiermark" },
  { "name": "Voitsberg", "slug": "voitsberg", "bundesland": "Steiermark" },
  { "name": "Judenburg", "slug": "judenburg", "bundesland": "Steiermark" },
  { "name": "Knittelfeld", "slug": "knittelfeld", "bundesland": "Steiermark" },
  { "name": "Mürzzuschlag", "slug": "muerzzuschlag", "bundesland": "Steiermark" },
  { "name": "Bruck an der Mur", "slug": "bruck-an-der-mur", "bundesland": "Steiermark" },
  { "name": "Leibnitz", "slug": "leibnitz", "bundesland": "Steiermark" },
  { "name": "Weiz", "slug": "weiz", "bundesland": "Steiermark" },
  { "name": "Oberwart", "slug": "oberwart", "bundesland": "Burgenland" },
  { "name": "Güssing", "slug": "guessing", "bundesland": "Burgenland" },
  { "name": "Jennersdorf", "slug": "jennersdorf", "bundesland": "Burgenland" },
  { "name": "Mattersburg", "slug": "mattersburg", "bundesland": "Burgenland" },
  { "name": "Neusiedl am See", "slug": "neusiedl-am-see", "bundesland": "Burgenland" },
  { "name": "Rust", "slug": "rust", "bundesland": "Burgenland" },
  { "name": "Spittal an der Drau", "slug": "spittal-an-der-drau", "bundesland": "Kärnten" },
  { "name": "St. Veit an der Glan", "slug": "st-veit-an-der-glan", "bundesland": "Kärnten" },
  { "name": "Feldkirchen", "slug": "feldkirchen", "bundesland": "Kärnten" },
  { "name": "Völkermarkt", "slug": "voelkermarkt", "bundesland": "Kärnten" },
  { "name": "Hermagor", "slug": "hermagor", "bundesland": "Kärnten" },
  { "name": "Lienz", "slug": "lienz", "bundesland": "Tirol" },
  { "name": "Kitzbühel", "slug": "kitzbuehel", "bundesland": "Tirol" },
  { "name": "Schwaz", "slug": "schwaz", "bundesland": "Tirol" },
  { "name": "Imst", "slug": "imst", "bundesland": "Tirol" },
  { "name": "Landeck", "slug": "landeck", "bundesland": "Tirol" },
  { "name": "Reutte", "slug": "reutte", "bundesland": "Tirol" },
  { "name": "Zell am See", "slug": "zell-am-see", "bundesland": "Salzburg" },
  { "name": "St. Johann im Pongau", "slug": "st-johann-im-pongau", "bundesland": "Salzburg" },
  { "name": "Tamsweg", "slug": "tamsweg", "bundesland": "Salzburg" }
]
```

**Step 2: Create seed script `prisma/seed-staedte.ts`**

```typescript
import { PrismaClient } from "@prisma/client";
import staedte from "./staedte.json";

const prisma = new PrismaClient();

async function main() {
  console.log(`Seeding ${staedte.length} cities...`);
  for (const stadt of staedte) {
    await prisma.stadt.upsert({
      where: { slug: stadt.slug },
      update: {},
      create: {
        name: stadt.name,
        slug: stadt.slug,
        bundesland: stadt.bundesland,
        einleitungstext: `Finden Sie den passenden Steuerberater in ${stadt.name}. Vergleichen Sie lokale Kanzleien und nehmen Sie direkt Kontakt auf.`,
      },
    });
  }
  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Step 3: Add seed script to `package.json`**

In `package.json`, add inside `"scripts"`:
```json
"seed:staedte": "npx ts-node --compiler-options '{\"module\":\"CommonJS\"}' prisma/seed-staedte.ts"
```

**Step 4: Run seed**

```bash
npm run seed:staedte
```
Expected: `Seeding 100 cities... Done.`

**Step 5: Commit**

```bash
git add prisma/seed-staedte.ts prisma/staedte.json package.json
git commit -m "feat: seed ~100 Austrian district cities"
```

---

## Task 4: Import Script (Base Steuerberater Data)

**Files:**
- Create: `scripts/import-steuerberater.ts`

**Step 1: Create import script**

This script reads a CSV file (exported from WKO register or manually created) and upserts profiles into the database.

Create `scripts/import-steuerberater.ts`:
```typescript
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

interface RawEntry {
  name: string;
  adresse: string;
  plz: string;
  stadtSlug: string;
  telefon: string;
  email: string;
  website: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  const csvPath = path.join(process.cwd(), "scripts", "steuerberater.csv");
  if (!fs.existsSync(csvPath)) {
    console.error("Missing scripts/steuerberater.csv — create it first.");
    process.exit(1);
  }

  const raw = fs.readFileSync(csvPath, "utf-8");
  const lines = raw.split("\n").filter(Boolean);
  const errors: string[] = [];

  for (const line of lines.slice(1)) { // skip header
    const [name, adresse, plz, stadtSlug, telefon, email, website] = line.split(";").map(s => s.trim());
    const entry: RawEntry = { name, adresse, plz, stadtSlug, telefon, email, website };

    try {
      const stadt = await prisma.stadt.findUnique({ where: { slug: stadtSlug } });
      if (!stadt) {
        errors.push(`Unknown stadtSlug: ${stadtSlug} for ${name}`);
        continue;
      }

      const slug = slugify(name) + "-" + slugify(stadtSlug);

      // Create a placeholder user for imported profiles
      const user = await prisma.user.upsert({
        where: { email: email || `import+${slug}@steuerberater-verzeichnis.at` },
        update: {},
        create: {
          email: email || `import+${slug}@steuerberater-verzeichnis.at`,
          role: "STEUERBERATER",
        },
      });

      const profile = await prisma.steuerberaterProfile.upsert({
        where: { slug },
        update: { adresse, plz, telefon, email, website },
        create: {
          userId: user.id,
          name,
          slug,
          adresse,
          plz,
          telefon,
          email,
          website,
          paket: "BASIC",
        },
      });

      // Link to city
      await prisma.steuerberaterStadt.upsert({
        where: { steuerberaterId_stadtId: { steuerberaterId: profile.id, stadtId: stadt.id } },
        update: {},
        create: { steuerberaterId: profile.id, stadtId: stadt.id },
      });
    } catch (e) {
      errors.push(`Error on ${name}: ${e}`);
    }
  }

  if (errors.length) {
    fs.writeFileSync("import_errors.log", errors.join("\n"));
    console.log(`Done with ${errors.length} errors. See import_errors.log`);
  } else {
    console.log("Import complete, no errors.");
  }
}

main().finally(() => prisma.$disconnect());
```

**Step 2: Create sample CSV for testing**

Create `scripts/steuerberater.csv`:
```
name;adresse;plz;stadtSlug;telefon;email;website
Mustermann Steuerberatung GmbH;Hauptstraße 1;1010;wien;+43 1 123 456;office@mustermann.at;https://mustermann.at
Steuerberater Gruber;Herrengasse 5;8010;graz;+43 316 789 012;gruber@stb-graz.at;
```

**Step 3: Add script to `package.json`**

```json
"import:steuerberater": "npx ts-node --compiler-options '{\"module\":\"CommonJS\"}' scripts/import-steuerberater.ts"
```

**Step 4: Test import**

```bash
npm run import:steuerberater
```
Expected: `Import complete, no errors.`

**Step 5: Commit**

```bash
git add scripts/
git commit -m "feat: add Steuerberater import script with CSV support"
```

---

## Task 5: Homepage — City Search

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/CitySearch.tsx`

**Step 1: Create `src/components/CitySearch.tsx`**

```tsx
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  staedte: { name: string; slug: string; bundesland: string }[];
}

export default function CitySearch({ staedte }: Props) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filtered = staedte.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-xl mx-auto">
      <input
        type="text"
        placeholder="Stadt suchen..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {query && (
        <ul className="mt-2 border border-gray-200 rounded-lg bg-white shadow-lg max-h-64 overflow-y-auto">
          {filtered.slice(0, 8).map((s) => (
            <li key={s.slug}>
              <button
                onClick={() => router.push(`/steuerberater/${s.slug}`)}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 flex justify-between"
              >
                <span className="font-medium">{s.name}</span>
                <span className="text-gray-400 text-sm">{s.bundesland}</span>
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-4 py-3 text-gray-400">Keine Stadt gefunden</li>
          )}
        </ul>
      )}
    </div>
  );
}
```

**Step 2: Replace `src/app/page.tsx`**

```tsx
import { prisma } from "@/lib/prisma";
import CitySearch from "@/components/CitySearch";

export const revalidate = 3600;

export default async function HomePage() {
  const staedte = await prisma.stadt.findMany({
    orderBy: { name: "asc" },
    select: { name: true, slug: true, bundesland: true },
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">
          Steuerberater in Österreich finden
        </h1>
        <p className="text-center text-gray-500 mb-10">
          Vergleichen Sie Steuerberater in Ihrer Stadt und nehmen Sie direkt Kontakt auf.
        </p>
        <CitySearch staedte={staedte} />
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Alle Städte</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {staedte.map((s) => (
              <a
                key={s.slug}
                href={`/steuerberater/${s.slug}`}
                className="px-3 py-2 bg-white border border-gray-200 rounded hover:border-blue-400 hover:text-blue-600 text-sm"
              >
                {s.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
```

**Step 3: Start dev server and verify**

```bash
npm run dev
```
Open http://localhost:3000 — you should see the homepage with city search and city grid.

**Step 4: Commit**

```bash
git add src/app/page.tsx src/components/CitySearch.tsx
git commit -m "feat: add homepage with city search"
```

---

## Task 6: City Pages (SSG + ISR)

**Files:**
- Create: `src/app/steuerberater/[stadt]/page.tsx`
- Create: `src/components/SteuerberaterCard.tsx`

**Step 1: Create `src/components/SteuerberaterCard.tsx`**

```tsx
import { Paket } from "@prisma/client";

interface Props {
  name: string;
  adresse?: string | null;
  telefon?: string | null;
  website?: string | null;
  logo?: string | null;
  beschreibung?: string | null;
  tags: string[];
  paket: Paket;
  slug: string;
  stadtSlug: string;
}

export default function SteuerberaterCard(props: Props) {
  const { name, adresse, telefon, website, logo, beschreibung, tags, paket, slug, stadtSlug } = props;
  const isPremium = paket === "GOLD" || paket === "SEO";

  return (
    <div className={`bg-white rounded-lg border p-5 flex gap-4 ${isPremium ? "border-blue-400 shadow-md" : "border-gray-200"}`}>
      {logo && (
        <img src={logo} alt={name} className="w-16 h-16 rounded object-cover flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <a href={`/steuerberater/${stadtSlug}/${slug}`} className="font-semibold text-gray-900 hover:text-blue-600 text-lg">
            {name}
          </a>
          {isPremium && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Premium</span>
          )}
        </div>
        {adresse && <p className="text-sm text-gray-500 mb-1">{adresse}</p>}
        {beschreibung && <p className="text-sm text-gray-600 mb-2 line-clamp-2">{beschreibung}</p>}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.slice(0, 5).map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{tag}</span>
            ))}
          </div>
        )}
        <div className="flex gap-4 text-sm">
          {telefon && <a href={`tel:${telefon}`} className="text-blue-600 hover:underline">{telefon}</a>}
          {website && (
            <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-xs">
              Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Create `src/app/steuerberater/[stadt]/page.tsx`**

```tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SteuerberaterCard from "@/components/SteuerberaterCard";

export const revalidate = 21600; // 6 hours

export async function generateStaticParams() {
  const staedte = await prisma.stadt.findMany({ select: { slug: true } });
  return staedte.map((s) => ({ stadt: s.slug }));
}

export async function generateMetadata({ params }: { params: { stadt: string } }): Promise<Metadata> {
  const stadt = await prisma.stadt.findUnique({ where: { slug: params.stadt } });
  if (!stadt) return {};
  return {
    title: `Steuerberater ${stadt.name} – Jetzt Vergleichen & Kontakt aufnehmen`,
    description: `Alle Steuerberater in ${stadt.name} im Überblick. Kanzleien vergleichen, Kontakt aufnehmen, Premium-Berater finden.`,
  };
}

export default async function StadtPage({ params }: { params: { stadt: string } }) {
  const stadt = await prisma.stadt.findUnique({
    where: { slug: params.stadt },
    include: {
      steuerberater: {
        include: { steuerberater: true },
        orderBy: [
          { steuerberater: { paket: "desc" } },
          { steuerberater: { name: "asc" } },
        ],
      },
    },
  });

  if (!stadt) notFound();

  const berater = stadt.steuerberater.map((sb) => sb.steuerberater);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Steuerberater in ${stadt.name}`,
    itemListElement: berater.slice(0, 10).map((b, i) => ({
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

  return (
    <main className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <nav className="text-sm text-gray-400 mb-4">
          <a href="/" className="hover:text-blue-600">Startseite</a>
          {" / "}
          <span>{stadt.name}</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Steuerberater in {stadt.name}</h1>
        {stadt.einleitungstext && (
          <p className="text-gray-600 mb-8">{stadt.einleitungstext}</p>
        )}
        <p className="text-sm text-gray-400 mb-6">{berater.length} Steuerberater gefunden</p>
        <div className="flex flex-col gap-4">
          {berater.map((b) => (
            <SteuerberaterCard
              key={b.id}
              name={b.name}
              adresse={b.adresse}
              telefon={b.telefon}
              website={b.website}
              logo={b.logo}
              beschreibung={b.beschreibung}
              tags={b.tags}
              paket={b.paket}
              slug={b.slug}
              stadtSlug={params.stadt}
            />
          ))}
          {berater.length === 0 && (
            <p className="text-gray-400 text-center py-12">Noch keine Steuerberater für diese Stadt eingetragen.</p>
          )}
        </div>
      </div>
    </main>
  );
}
```

**Step 3: Verify in browser**

Open http://localhost:3000/steuerberater/wien — should show the Wien city page.

**Step 4: Commit**

```bash
git add src/app/steuerberater/ src/components/SteuerberaterCard.tsx
git commit -m "feat: add city pages with SSG+ISR and schema.org markup"
```

---

## Task 7: Individual Profile Pages

**Files:**
- Create: `src/app/steuerberater/[stadt]/[slug]/page.tsx`

**Step 1: Create `src/app/steuerberater/[stadt]/[slug]/page.tsx`**

```tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 21600;

export async function generateStaticParams() {
  const profiles = await prisma.steuerberaterProfile.findMany({
    select: { slug: true, staedte: { select: { stadt: { select: { slug: true } } } } },
  });
  return profiles.flatMap((p) =>
    p.staedte.map((s) => ({ slug: p.slug, stadt: s.stadt.slug }))
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const profile = await prisma.steuerberaterProfile.findUnique({ where: { slug: params.slug } });
  if (!profile) return {};
  return {
    title: `${profile.name} – Steuerberater`,
    description: profile.beschreibung?.slice(0, 160) ?? `Steuerberater ${profile.name} – Kontakt und Informationen.`,
  };
}

export default async function ProfilePage({ params }: { params: { slug: string; stadt: string } }) {
  const profile = await prisma.steuerberaterProfile.findUnique({
    where: { slug: params.slug },
    include: { staedte: { include: { stadt: true } } },
  });

  if (!profile) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: profile.name,
    address: profile.adresse,
    telephone: profile.telefon,
    email: profile.email,
    url: profile.website,
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <nav className="text-sm text-gray-400 mb-4">
          <a href="/" className="hover:text-blue-600">Startseite</a>
          {" / "}
          <a href={`/steuerberater/${params.stadt}`} className="hover:text-blue-600">{params.stadt}</a>
          {" / "}
          <span>{profile.name}</span>
        </nav>
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex gap-4 mb-6">
            {profile.logo && (
              <img src={profile.logo} alt={profile.name} className="w-20 h-20 rounded object-cover" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              {profile.adresse && <p className="text-gray-500 mt-1">{profile.adresse}, {profile.plz}</p>}
            </div>
          </div>
          {profile.beschreibung && <p className="text-gray-700 mb-6">{profile.beschreibung}</p>}
          {profile.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {profile.tags.map((tag) => (
                <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">{tag}</span>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-2">
            {profile.telefon && (
              <a href={`tel:${profile.telefon}`} className="text-blue-600 hover:underline">{profile.telefon}</a>
            )}
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="text-blue-600 hover:underline">{profile.email}</a>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {profile.website}
              </a>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
```

**Step 2: Verify**

Open http://localhost:3000/steuerberater/wien/mustermann-steuerberatung-gmbh-wien

**Step 3: Commit**

```bash
git add src/app/steuerberater/
git commit -m "feat: add individual profile pages"
```

---

## Task 8: Sitemap & SEO Metadata

**Files:**
- Create: `src/app/sitemap.ts`
- Modify: `src/app/layout.tsx`

**Step 1: Create `src/app/sitemap.ts`**

```typescript
import { prisma } from "@/lib/prisma";
import { MetadataRoute } from "next";

const BASE_URL = "https://steuerberater-verzeichnis.at";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staedte = await prisma.stadt.findMany({ select: { slug: true } });
  const profiles = await prisma.steuerberaterProfile.findMany({
    select: { slug: true, staedte: { select: { stadt: { select: { slug: true } } } } },
  });

  const stadtUrls = staedte.map((s) => ({
    url: `${BASE_URL}/steuerberater/${s.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const profileUrls = profiles.flatMap((p) =>
    p.staedte.map((s) => ({
      url: `${BASE_URL}/steuerberater/${s.stadt.slug}/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))
  );

  return [
    { url: BASE_URL, changeFrequency: "daily", priority: 1.0 },
    ...stadtUrls,
    ...profileUrls,
  ];
}
```

**Step 2: Update `src/app/layout.tsx` metadata**

Add to the existing `metadata` export:
```typescript
export const metadata: Metadata = {
  title: {
    default: "Steuerberater Verzeichnis Österreich",
    template: "%s | Steuerberater Österreich",
  },
  description: "Das führende Steuerberater-Verzeichnis für Österreich. Finden Sie den passenden Steuerberater in Ihrer Stadt.",
};
```

**Step 3: Verify sitemap**

Start dev server, open http://localhost:3000/sitemap.xml

**Step 4: Commit**

```bash
git add src/app/sitemap.ts src/app/layout.tsx
git commit -m "feat: add sitemap and global SEO metadata"
```

---

## Task 9: NextAuth Setup

**Files:**
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/lib/auth.ts`

**Step 1: Create `src/lib/auth.ts`**

```typescript
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.passwordHash) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; token.role = (user as any).role; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) { (session.user as any).id = token.id; (session.user as any).role = token.role; }
      return session;
    },
  },
  pages: { signIn: "/auth/login" },
};
```

**Step 2: Install bcryptjs**

```bash
npm install bcryptjs @types/bcryptjs
```

**Step 3: Create `src/app/api/auth/[...nextauth]/route.ts`**

```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**Step 4: Create registration API `src/app/api/auth/register/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ungültige Eingabe" }, { status: 400 });

  const { email, password, name } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "E-Mail bereits registriert" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      profile: {
        create: { name, slug, paket: "BASIC" },
      },
    },
  });

  return NextResponse.json({ id: user.id }, { status: 201 });
}
```

**Step 5: Create login page `src/app/auth/login/page.tsx`**

```tsx
"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) { setError("Ungültige Anmeldedaten"); return; }
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg border border-gray-200 w-full max-w-sm">
        <h1 className="text-xl font-bold mb-6">Steuerberater Login</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <input type="email" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-3" required />
        <input type="password" placeholder="Passwort" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-6" required />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Anmelden
        </button>
        <p className="text-sm text-center mt-4 text-gray-500">
          Noch kein Konto? <a href="/auth/register" className="text-blue-600 hover:underline">Registrieren</a>
        </p>
      </form>
    </main>
  );
}
```

**Step 6: Create registration page `src/app/auth/register/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) { const d = await res.json(); setError(d.error); return; }
    router.push("/auth/login?registered=1");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg border border-gray-200 w-full max-w-sm">
        <h1 className="text-xl font-bold mb-6">Steuerberater registrieren</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <input type="text" placeholder="Kanzleiname" value={name} onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-3" required />
        <input type="email" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-3" required />
        <input type="password" placeholder="Passwort (min. 8 Zeichen)" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-6" required minLength={8} />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Registrieren
        </button>
      </form>
    </main>
  );
}
```

**Step 7: Add SessionProvider to `src/app/layout.tsx`**

Wrap children with `<SessionProvider>` from `next-auth/react`. Add `"use client"` to layout or create a separate `src/components/Providers.tsx`:
```tsx
"use client";
import { SessionProvider } from "next-auth/react";
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```
Then in `layout.tsx`: `<Providers>{children}</Providers>`

**Step 8: Commit**

```bash
git add src/app/api/auth/ src/lib/auth.ts src/app/auth/ src/components/Providers.tsx
git commit -m "feat: add NextAuth with credentials provider, register/login pages"
```

---

## Task 10: Steuerberater Dashboard — Profile Editing

**Files:**
- Create: `src/app/dashboard/page.tsx`
- Create: `src/app/api/dashboard/profile/route.ts`

**Step 1: Create profile update API `src/app/api/dashboard/profile/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  beschreibung: z.string().max(500).optional(),
  telefon: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).max(10),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ungültige Eingabe" }, { status: 400 });

  const userId = (session.user as any).id;
  await prisma.steuerberaterProfile.update({
    where: { userId },
    data: parsed.data,
  });

  return NextResponse.json({ ok: true });
}
```

**Step 2: Create `src/app/dashboard/page.tsx`**

```tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const profile = await prisma.steuerberaterProfile.findUnique({
    where: { userId: (session.user as any).id },
    include: { staedte: { include: { stadt: true } } },
  });

  if (!profile) redirect("/auth/login");

  return <DashboardClient profile={JSON.parse(JSON.stringify(profile))} />;
}
```

**Step 3: Create `src/app/dashboard/DashboardClient.tsx`**

```tsx
"use client";
import { useState } from "react";

export default function DashboardClient({ profile }: { profile: any }) {
  const [beschreibung, setBeschreibung] = useState(profile.beschreibung ?? "");
  const [telefon, setTelefon] = useState(profile.telefon ?? "");
  const [website, setWebsite] = useState(profile.website ?? "");
  const [tags, setTags] = useState((profile.tags ?? []).join(", "));
  const [saved, setSaved] = useState(false);

  const maxBeschreibung = profile.paket === "BASIC" ? 0 : 500;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/dashboard/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        beschreibung,
        telefon,
        website,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-2">Mein Dashboard</h1>
        <p className="text-sm text-gray-500 mb-8">
          Aktuelles Paket: <span className="font-semibold text-blue-600">{profile.paket}</span>
          {profile.paketAktivBis && ` · Aktiv bis ${new Date(profile.paketAktivBis).toLocaleDateString("de-AT")}`}
        </p>
        <form onSubmit={handleSave} className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input type="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          {profile.paket !== "BASIC" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung (max 500 Zeichen)</label>
                <textarea value={beschreibung} onChange={(e) => setBeschreibung(e.target.value)}
                  maxLength={500} rows={4}
                  className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spezialgebiete (kommagetrennt, max 10)</label>
                <input type="text" value={tags} onChange={(e) => setTags(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="z.B. Einkommensteuer, GmbH-Gründung" />
              </div>
            </>
          )}
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 self-start">
            {saved ? "Gespeichert ✓" : "Speichern"}
          </button>
        </form>
        {profile.paket === "BASIC" && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium">Upgrade auf Gold für mehr Sichtbarkeit</p>
            <p className="text-blue-600 text-sm mb-3">Logo, Beschreibung, Spezialgebiete und Top-Platzierung</p>
            <a href="/dashboard/upgrade" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 inline-block">
              Jetzt upgraden →
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
```

**Step 4: Commit**

```bash
git add src/app/dashboard/ src/app/api/dashboard/
git commit -m "feat: add steuerberater dashboard with profile editing"
```

---

## Task 11: Stripe — Create Products & Upgrade Page

**Files:**
- Create: `src/app/dashboard/upgrade/page.tsx`
- Create: `src/app/api/stripe/checkout/route.ts`

**Step 1: Create Stripe products in Dashboard**

1. Go to https://dashboard.stripe.com/products
2. Create product **"Gold Paket"**, price €79/month recurring → copy Price ID to `STRIPE_PRICE_GOLD` in `.env.local`
3. Note: SEO-Paket has no Stripe product (manual invoicing)

**Step 2: Create checkout API `src/app/api/stripe/checkout/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const userId = (session.user as any).id;
  const profile = await prisma.steuerberaterProfile.findUnique({ where: { userId } });
  if (!profile) return NextResponse.json({ error: "Profil nicht gefunden" }, { status: 404 });

  // Create or retrieve Stripe customer
  let customerId = profile.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user?.email!,
      metadata: { profileId: profile.id },
    });
    customerId = customer.id;
    await prisma.steuerberaterProfile.update({
      where: { id: profile.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_GOLD!, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?upgraded=1`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/upgrade`,
    metadata: { profileId: profile.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
```

**Step 3: Create `src/app/dashboard/upgrade/page.tsx`**

```tsx
"use client";
import { useState } from "react";

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);

  async function handleGold() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-8">Paket upgraden</h1>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Basic */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-bold text-lg mb-1">Basic</h2>
            <p className="text-2xl font-bold mb-4">Gratis</p>
            <ul className="text-sm text-gray-600 space-y-2 mb-6">
              <li>✓ Basisprofil</li>
              <li>✓ Website-Link</li>
              <li>✓ Listung in einer Stadt</li>
            </ul>
            <button disabled className="w-full bg-gray-100 text-gray-400 py-2 rounded cursor-not-allowed">
              Aktuelles Paket
            </button>
          </div>
          {/* Gold */}
          <div className="bg-white rounded-lg border-2 border-blue-500 p-6 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full">Empfohlen</span>
            <h2 className="font-bold text-lg mb-1">Gold</h2>
            <p className="text-2xl font-bold mb-1">€79 <span className="text-base font-normal text-gray-500">/Monat</span></p>
            <ul className="text-sm text-gray-600 space-y-2 mb-6 mt-4">
              <li>✓ Top-Platzierung</li>
              <li>✓ Logo & Beschreibung</li>
              <li>✓ 10 Spezialgebiete</li>
              <li>✓ Kontaktformular</li>
              <li>✓ Bis zu 3 Städte</li>
              <li>✓ Premium-Badge</li>
            </ul>
            <button onClick={handleGold} disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60">
              {loading ? "Wird geladen..." : "Gold wählen"}
            </button>
          </div>
          {/* SEO */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-bold text-lg mb-1">SEO & Sichtbarkeit</h2>
            <p className="text-2xl font-bold mb-1">ab €299 <span className="text-base font-normal text-gray-500">/Monat</span></p>
            <ul className="text-sm text-gray-600 space-y-2 mb-6 mt-4">
              <li>✓ Alles aus Gold</li>
              <li>✓ On-Page SEO</li>
              <li>✓ Google Business</li>
              <li>✓ Backlink-Aufbau</li>
              <li>✓ Monatliches Reporting</li>
              <li>✓ Persönlicher Ansprechpartner</li>
            </ul>
            <a href="/kontakt-seo" className="block w-full text-center bg-gray-800 text-white py-2 rounded hover:bg-gray-900">
              Angebot anfragen
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
```

**Step 4: Commit**

```bash
git add src/app/dashboard/upgrade/ src/app/api/stripe/
git commit -m "feat: add Stripe checkout and upgrade page"
```

---

## Task 12: Stripe Webhook Handler

**Files:**
- Create: `src/app/api/stripe/webhook/route.ts`

**Step 1: Create webhook handler**

```typescript
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  async function updateProfile(subscriptionId: string, paket: "GOLD" | "BASIC", aktivBis?: Date) {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    const customerId = sub.customer as string;
    const profile = await prisma.steuerberaterProfile.findFirst({ where: { stripeCustomerId: customerId } });
    if (!profile) return;

    await prisma.steuerberaterProfile.update({
      where: { id: profile.id },
      data: {
        paket,
        paketAktivBis: aktivBis,
        stripeSubscriptionId: paket === "BASIC" ? null : subscriptionId,
      },
    });

    // Revalidate all city pages for this profile
    const staedte = await prisma.steuerberaterStadt.findMany({
      where: { steuerberaterId: profile.id },
      include: { stadt: true },
    });
    for (const s of staedte) {
      await fetch(`${process.env.NEXTAUTH_URL}/api/revalidate?path=/steuerberater/${s.stadt.slug}&secret=${process.env.NEXTAUTH_SECRET}`);
    }
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      if (sub.status === "active") {
        const aktivBis = new Date(sub.current_period_end * 1000);
        await updateProfile(sub.id, "GOLD", aktivBis);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await updateProfile(sub.id, "BASIC");
      break;
    }
    case "invoice.payment_failed": {
      // Grace period: don't downgrade immediately, Stripe retries
      break;
    }
  }

  return NextResponse.json({ received: true });
}

export const config = { api: { bodyParser: false } };
```

**Step 2: Create revalidation API `src/app/api/revalidate/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const path = req.nextUrl.searchParams.get("path");

  if (secret !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }
  if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });

  revalidatePath(path);
  return NextResponse.json({ revalidated: true, path });
}
```

**Step 3: Register webhook in Stripe Dashboard**

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain.at/api/stripe/webhook`
3. Select events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Copy signing secret → add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

**Step 4: Test locally with Stripe CLI**

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Step 5: Commit**

```bash
git add src/app/api/stripe/webhook/ src/app/api/revalidate/
git commit -m "feat: add Stripe webhook handler with ISR revalidation"
```

---

## Task 13: SEO Anfrage Contact Form

**Files:**
- Create: `src/app/kontakt-seo/page.tsx`
- Create: `src/app/api/seo-anfrage/route.ts`

**Step 1: Create API `src/app/api/seo-anfrage/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  kontaktEmail: z.string().email(),
  nachricht: z.string().min(10).max(2000),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ungültige Eingabe" }, { status: 400 });

  await prisma.sEOAnfrage.create({ data: parsed.data });
  return NextResponse.json({ ok: true });
}
```

**Step 2: Create `src/app/kontakt-seo/page.tsx`**

```tsx
"use client";
import { useState } from "react";

export default function KontaktSEOPage() {
  const [email, setEmail] = useState("");
  const [nachricht, setNachricht] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/seo-anfrage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kontaktEmail: email, nachricht }),
    });
    setSent(true);
  }

  if (sent) return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Vielen Dank!</h1>
        <p className="text-gray-600">Wir melden uns innerhalb von 24 Stunden bei Ihnen.</p>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-2">SEO & Sichtbarkeit — Angebot anfragen</h1>
        <p className="text-gray-600 mb-8">Ab €299/Monat. Individuelles Angebot nach kostenlosem Erstgespräch.</p>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col gap-4">
          <input type="email" placeholder="Ihre E-Mail" value={email} onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2" required />
          <textarea placeholder="Beschreiben Sie kurz Ihre aktuelle Situation und Ziele..." value={nachricht}
            onChange={(e) => setNachricht(e.target.value)} rows={5}
            className="border border-gray-300 rounded px-3 py-2" required minLength={10} />
          <button type="submit" className="bg-gray-800 text-white py-2 rounded hover:bg-gray-900">
            Angebot anfragen
          </button>
        </form>
      </div>
    </main>
  );
}
```

**Step 3: Commit**

```bash
git add src/app/kontakt-seo/ src/app/api/seo-anfrage/
git commit -m "feat: add SEO package contact form"
```

---

## Task 14: Admin Panel

**Files:**
- Create: `src/app/admin/page.tsx`
- Create: `src/app/api/admin/profiles/route.ts`
- Create: `src/middleware.ts`

**Step 1: Create middleware to protect /admin `src/middleware.ts`**

```typescript
import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ token }) {
      return token?.role === "ADMIN";
    },
  },
});

export const config = { matcher: ["/admin/:path*"] };
```

**Step 2: Create admin profiles API `src/app/api/admin/profiles/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const profiles = await prisma.steuerberaterProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: { staedte: { include: { stadt: true } } },
  });
  return NextResponse.json(profiles);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, verified } = await req.json();
  await prisma.steuerberaterProfile.update({ where: { id }, data: { verified } });
  return NextResponse.json({ ok: true });
}
```

**Step 3: Create `src/app/admin/page.tsx`**

```tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") redirect("/");

  const profiles = await prisma.steuerberaterProfile.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, paket: true, verified: true, createdAt: true, email: true },
  });

  const seoAnfragen = await prisma.sEOAnfrage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>

        <section className="mb-12">
          <h2 className="text-lg font-semibold mb-4">Profile ({profiles.length})</h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Paket</th>
                  <th className="text-left px-4 py-3">Verifiziert</th>
                  <th className="text-left px-4 py-3">Erstellt</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{p.name}<br /><span className="text-gray-400">{p.email}</span></td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${p.paket === "GOLD" ? "bg-yellow-100 text-yellow-700" : p.paket === "SEO" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                        {p.paket}
                      </span>
                    </td>
                    <td className="px-4 py-3">{p.verified ? "✓" : "—"}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(p.createdAt).toLocaleDateString("de-AT")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">SEO-Anfragen ({seoAnfragen.length})</h2>
          <div className="flex flex-col gap-3">
            {seoAnfragen.map((a) => (
              <div key={a.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="font-medium">{a.kontaktEmail}</p>
                <p className="text-sm text-gray-600 mt-1">{a.nachricht}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(a.createdAt).toLocaleDateString("de-AT")}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
```

**Step 4: Commit**

```bash
git add src/app/admin/ src/app/api/admin/ src/middleware.ts
git commit -m "feat: add admin panel with profile and SEO request management"
```

---

## Task 15: E2E Tests (Playwright)

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/homepage.spec.ts`
- Create: `tests/e2e/stadtseite.spec.ts`

**Step 1: Initialize Playwright**

```bash
npx playwright install chromium
```

**Step 2: Create `playwright.config.ts`**

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:3000",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
});
```

**Step 3: Create `tests/e2e/homepage.spec.ts`**

```typescript
import { test, expect } from "@playwright/test";

test("homepage loads and shows city search", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Steuerberater in Österreich/ })).toBeVisible();
  await expect(page.getByPlaceholder("Stadt suchen...")).toBeVisible();
});

test("city search filters results", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("Stadt suchen...").fill("Wien");
  await expect(page.getByText("Wien")).toBeVisible();
});
```

**Step 4: Create `tests/e2e/stadtseite.spec.ts`**

```typescript
import { test, expect } from "@playwright/test";

test("city page loads with correct heading", async ({ page }) => {
  await page.goto("/steuerberater/wien");
  await expect(page.getByRole("heading", { name: "Steuerberater in Wien" })).toBeVisible();
});

test("city page shows steuerberater listing", async ({ page }) => {
  await page.goto("/steuerberater/wien");
  // At least no error page
  await expect(page).not.toHaveTitle(/Error/);
});
```

**Step 5: Run E2E tests**

```bash
npx playwright test
```
Expected: All tests pass.

**Step 6: Add test script to `package.json`**

```json
"test:e2e": "playwright test"
```

**Step 7: Commit**

```bash
git add playwright.config.ts tests/ package.json
git commit -m "test: add Playwright E2E tests for homepage and city pages"
```

---

## Task 16: Final Launch Checklist

**Step 1: Build production bundle**

```bash
npm run build
```
Expected: No errors, all ~100 city pages generated.

**Step 2: Check sitemap**

Start production server: `npm start`, visit `/sitemap.xml` — verify all city pages and profiles are listed.

**Step 3: Stripe live mode**

- Switch Stripe to live mode
- Update `.env.local` with live keys (`sk_live_...`, `pk_live_...`)
- Create production webhook endpoint in Stripe Dashboard

**Step 4: Deploy to Vercel**

```bash
npx vercel --prod
```
Add all `.env.local` variables to Vercel Environment Variables.

**Step 5: Google Search Console**

1. Verify domain ownership at https://search.google.com/search-console
2. Submit `https://steuerberater-verzeichnis.at/sitemap.xml`

**Step 6: Final commit**

```bash
git add -A
git commit -m "chore: production ready — launch checklist complete"
```

---

## Summary

| Task | Description |
|---|---|
| 1 | Project scaffold (Next.js, deps) |
| 2 | Prisma schema + Supabase |
| 3 | Seed ~100 Austrian cities |
| 4 | Import script (CSV → DB) |
| 5 | Homepage + city search |
| 6 | City pages SSG + ISR |
| 7 | Individual profile pages |
| 8 | Sitemap + global metadata |
| 9 | NextAuth (login/register) |
| 10 | Dashboard profile editing |
| 11 | Stripe checkout + upgrade page |
| 12 | Stripe webhook + ISR revalidation |
| 13 | SEO package contact form |
| 14 | Admin panel |
| 15 | Playwright E2E tests |
| 16 | Launch checklist |
