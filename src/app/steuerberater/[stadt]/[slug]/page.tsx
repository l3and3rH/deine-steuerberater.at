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
