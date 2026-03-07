import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import BeraterListFilter from "@/components/BeraterListFilter";

export const revalidate = 21600;
export const dynamicParams = false;

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
    openGraph: {
      title: `Steuerberater in ${stadt.name}`,
      description: `Alle Steuerberater in ${stadt.name} im Überblick. Kanzleien vergleichen und Kontakt aufnehmen.`,
      images: [{ url: "/og-default.png", width: 1200, height: 630 }],
    },
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

  const profiles = stadt.steuerberater.map((sb: any) => sb.steuerberater);

  // Fetch review stats for all profiles in one query
  const profileIds = profiles.map((b: any) => b.id);
  const reviewStats = await prisma.review.groupBy({
    by: ["profileId"],
    where: { profileId: { in: profileIds } },
    _avg: { rating: true },
    _count: { rating: true },
  });
  const statsMap = new Map(
    reviewStats.map((s: any) => [s.profileId, { avg: s._avg.rating, count: s._count.rating }])
  );

  const berater = profiles.map((b: any) => {
    const stats = statsMap.get(b.id);
    return {
      id: b.id,
      name: b.name,
      kanzleiname: b.kanzleiname ?? null,
      adresse: b.adresse,
      telefon: b.telefon,
      email: b.email ?? null,
      website: b.website,
      logo: b.logo,
      beschreibung: b.beschreibung,
      tags: b.tags ?? [],
      languages: b.languages ?? [],
      paket: b.paket,
      slug: b.slug,
      avgRating: stats?.avg ?? null,
      reviewCount: stats?.count ?? 0,
      createdAt: b.createdAt.toISOString(),
      verified: b.verified ?? false,
      berufsbezeichnung: b.berufsbezeichnung ?? null,
      experienceYears: b.experienceYears ?? null,
      kswMitglied: b.kswMitglied ?? false,
      gratisErstgespraech: b.gratisErstgespraech ?? false,
      onlineBeratung: b.onlineBeratung ?? false,
      beratungVorOrt: b.beratungVorOrt ?? true,
      schnellantwort: b.schnellantwort ?? false,
      abendtermine: b.abendtermine ?? false,
      mandantengruppen: b.mandantengruppen ?? [],
      ausbildung: b.ausbildung ?? null,
      zulassungsjahr: b.zulassungsjahr ?? null,
      auszeichnungen: b.auszeichnungen ?? [],
      mitgliedschaften: b.mitgliedschaften ?? [],
      videoUrl: b.videoUrl ?? null,
    };
  });

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

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Header */}
      <section className="bg-forest-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <nav className="flex items-center gap-2 text-sm text-cream-400 mb-6">
            <Link href="/" className="hover:text-cream-100 transition-colors">Startseite</Link>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <span className="text-cream-200">{stadt.name}</span>
          </nav>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-cream-100 mb-3">
            Steuerberater in {stadt.name}
          </h1>
          {stadt.einleitungstext && (
            <p className="text-cream-300 max-w-2xl leading-relaxed">{stadt.einleitungstext}</p>
          )}
          <div className="mt-6 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-sm text-cream-400 bg-cream-100/10 px-3 py-1.5 rounded-full">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-1.053M18 7.5a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm-2.25 0a1.125 1.125 0 11-2.25 0 1.125 1.125 0 012.25 0z" />
              </svg>
              {berater.length} {berater.length === 1 ? "Steuerberater" : "Steuerberater"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-cream-400 bg-cream-100/10 px-3 py-1.5 rounded-full">
              {stadt.bundesland}
            </span>
          </div>
        </div>
      </section>

      {/* Listings with filter */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
        <BeraterListFilter berater={berater} stadtSlug={params.stadt} stadtName={stadt.name} />
      </section>
    </main>
  );
}
