import { prisma } from "@/lib/prisma";
import CitySearch from "@/components/CitySearch";
import StarRating from "@/components/StarRating";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 3600;

export default async function HomePage() {
  const staedte = await prisma.stadt.findMany({
    orderBy: { name: "asc" },
    select: { name: true, slug: true, bundesland: true },
  });

  const bundeslaender = Array.from(new Set(staedte.map((s) => s.bundesland))).sort();

  // Featured premium advisors
  const featuredProfiles = await prisma.steuerberaterProfile.findMany({
    where: { paket: { in: ["GOLD", "SEO"] } },
    take: 6,
    orderBy: { createdAt: "desc" },
    include: {
      staedte: { include: { stadt: { select: { name: true, slug: true } } }, take: 1 },
      reviews: { select: { rating: true } },
    },
  });

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Steuerberater.at",
    url: "https://steuerberater-verzeichnis.at",
    logo: "https://steuerberater-verzeichnis.at/og-default.png",
    description: "Das führende Steuerberater-Verzeichnis für Österreich.",
    areaServed: { "@type": "Country", name: "Österreich" },
  };

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-32">
          <p className="animate-fade-up text-gold-400 font-medium text-sm tracking-widest uppercase mb-6">
            Das Verzeichnis für Österreich
          </p>
          <h1 className="animate-fade-up stagger-1 font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-cream-100 leading-[1.1] mb-6 max-w-3xl">
            Finden Sie den passenden
            <br />
            <span className="text-gold-400">Steuerberater</span> in Ihrer Stadt
          </h1>
          <p className="animate-fade-up stagger-2 text-cream-300 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
            Vergleichen Sie qualifizierte Steuerberater in ganz Österreich
            und nehmen Sie direkt Kontakt auf.
          </p>
          <div className="animate-fade-up stagger-3 max-w-lg">
            <CitySearch staedte={staedte} />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-forest-200/60">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-wrap items-center justify-center gap-x-16 gap-y-4">
          <div className="text-center">
            <p className="font-display text-2xl font-semibold text-forest-900">{staedte.length}</p>
            <p className="text-sm text-forest-600">Städte</p>
          </div>
          <div className="w-px h-8 bg-forest-200 hidden sm:block" />
          <div className="text-center">
            <p className="font-display text-2xl font-semibold text-forest-900">9</p>
            <p className="text-sm text-forest-600">Bundesländer</p>
          </div>
          <div className="w-px h-8 bg-forest-200 hidden sm:block" />
          <div className="text-center">
            <p className="font-display text-2xl font-semibold text-forest-900">100%</p>
            <p className="text-sm text-forest-600">Kostenlos suchen</p>
          </div>
        </div>
      </section>

      {/* Featured Premium Advisors */}
      {featuredProfiles.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 py-20">
          <div className="mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-forest-900 mb-3">
              Premium Steuerberater
            </h2>
            <p className="text-forest-600 max-w-lg">
              Ausgewählte Steuerberater mit erweitertem Profil und Premium-Service.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredProfiles.map((p: any) => {
              const stadt = p.staedte[0]?.stadt;
              const avgRating = p.reviews.length > 0
                ? p.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / p.reviews.length
                : null;
              return (
                <Link
                  key={p.id}
                  href={stadt ? `/steuerberater/${stadt.slug}/${p.slug}` : "#"}
                  className="group bg-white rounded-xl border border-gold-500/30 ring-1 ring-gold-500/10 p-5 hover:shadow-lg hover:shadow-gold-500/5 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {p.logo ? (
                      <Image src={p.logo} alt={p.name} width={48} height={48} className="rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-forest-50 flex items-center justify-center">
                        <span className="font-display text-lg font-semibold text-forest-300">{p.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-forest-900 group-hover:text-forest-700 transition-colors truncate">
                        {p.name}
                      </p>
                      {stadt && (
                        <p className="text-xs text-forest-500">{stadt.name}</p>
                      )}
                    </div>
                  </div>
                  {avgRating !== null && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <StarRating rating={avgRating} size="xs" />
                      <span className="text-xs text-forest-500">({p.reviews.length})</span>
                    </div>
                  )}
                  {p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {p.tags.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="text-xs bg-forest-50 text-forest-600 px-2 py-0.5 rounded-md">{tag}</span>
                      ))}
                    </div>
                  )}
                  <span className="gold-shine text-xs text-forest-950 px-2 py-0.5 rounded-full font-semibold mt-3 inline-block">
                    Premium
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="bg-forest-50/50 border-y border-forest-200/40">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-forest-900 mb-3">
              Das sagen unsere Nutzer
            </h2>
            <p className="text-forest-600 max-w-md mx-auto">
              Erfahrungen von Mandanten und Steuerberatern auf unserer Plattform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "Innerhalb weniger Minuten habe ich den perfekten Steuerberater für meine Immobiliengesellschaft gefunden. Die Filterfunktion nach Fachgebiet war besonders hilfreich.",
                name: "Maria K.",
                role: "Unternehmerin, Wien",
              },
              {
                quote: "Seit wir unser Premium-Profil haben, erhalten wir regelmäßig qualifizierte Anfragen über die Plattform. Die Investition hat sich bereits im ersten Monat gelohnt.",
                name: "Mag. Thomas R.",
                role: "Steuerberater, Graz",
              },
              {
                quote: "Endlich eine übersichtliche Plattform, auf der man Steuerberater vergleichen kann. Die Bewertungen anderer Mandanten haben mir die Entscheidung sehr erleichtert.",
                name: "Stefan L.",
                role: "Freiberufler, Salzburg",
              },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-xl border border-forest-100 p-6">
                <svg className="w-8 h-8 text-gold-400/60 mb-3" fill="currentColor" viewBox="0 0 24 24">
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

      {/* Cities by Bundesland */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-forest-900 mb-3">
            Alle Städte nach Bundesland
          </h2>
          <p className="text-forest-600 max-w-lg">
            Wählen Sie Ihre Stadt, um Steuerberater in Ihrer Nähe zu finden.
          </p>
        </div>

        <div className="space-y-10">
          {bundeslaender.map((bl) => {
            const cities = staedte.filter((s) => s.bundesland === bl);
            return (
              <div key={bl}>
                <h3 className="font-display text-lg font-semibold text-forest-800 mb-3 flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                  {bl}
                  <span className="text-sm font-body font-normal text-forest-500">
                    ({cities.length})
                  </span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {cities.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/steuerberater/${s.slug}`}
                      className="group px-3.5 py-2.5 bg-white rounded-lg border border-forest-100 hover:border-forest-400 hover:bg-forest-50 transition-all text-sm text-forest-800 hover:text-forest-900"
                    >
                      <span className="group-hover:translate-x-0.5 inline-block transition-transform">
                        {s.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA for Steuerberater */}
      <section className="bg-forest-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, theme('colors.gold.500') 0%, transparent 50%), radial-gradient(circle at 80% 50%, theme('colors.forest.500') 0%, transparent 50%)`,
        }} />
        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-cream-100 mb-4">
            Sie sind Steuerberater?
          </h2>
          <p className="text-cream-300 mb-8 max-w-md mx-auto">
            Tragen Sie sich kostenlos ein und werden Sie von potenziellen Mandanten gefunden.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-forest-950 font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Jetzt kostenlos eintragen
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  );
}
