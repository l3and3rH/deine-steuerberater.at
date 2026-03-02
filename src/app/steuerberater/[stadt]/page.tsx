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
