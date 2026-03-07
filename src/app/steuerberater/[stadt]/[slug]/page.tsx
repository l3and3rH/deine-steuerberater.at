import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReviewSection from "@/components/ReviewSection";
import ContactForm from "@/components/ContactForm";
import ClaimProfileCTA from "@/components/ClaimProfileCTA";
import MapEmbed from "@/components/MapEmbed";

export const revalidate = 21600;
export const dynamicParams = false;

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
  const desc = profile.beschreibung?.slice(0, 160) ?? `Steuerberater ${profile.name} – Kontakt und Informationen.`;
  return {
    title: `${profile.name} – Steuerberater`,
    description: desc,
    openGraph: {
      title: profile.name,
      description: desc,
      images: profile.logo ? [{ url: profile.logo }] : [{ url: "/og-default.png", width: 1200, height: 630 }],
    },
  };
}

export default async function ProfilePage({ params }: { params: { slug: string; stadt: string } }) {
  const profile = await prisma.steuerberaterProfile.findUnique({
    where: { slug: params.slug },
    include: { staedte: { include: { stadt: true } } },
  });

  if (!profile) notFound();

  const isLinkedToStadt = profile.staedte.some((s: any) => s.stadt.slug === params.stadt);
  if (!isLinkedToStadt) notFound();

  const currentStadt = profile.staedte.find((s: any) => s.stadt.slug === params.stadt)?.stadt;
  const stadtName = currentStadt?.name ?? params.stadt;
  const isPremium = profile.paket === "GOLD" || profile.paket === "SEO";

  // Geocode via Nominatim: exact address first, then city fallback
  let mapLat: number | null = currentStadt?.lat ?? null;
  let mapLng: number | null = currentStadt?.lng ?? null;

  const nominatimFetch = async (q: string) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
      { headers: { "User-Agent": "steuerberater-verzeichnis.at/1.0" }, next: { revalidate: 86400 } }
    );
    const data = await res.json();
    return data?.[0] ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } : null;
  };

  try {
    // adresse already contains full address incl. PLZ + city (e.g. "Musterstr. 1, 1010 Wien")
    const result = profile.adresse
      ? await nominatimFetch(`${profile.adresse}, Österreich`) ?? await nominatimFetch(`${stadtName}, Österreich`)
      : await nominatimFetch(`${stadtName}, Österreich`);
    if (result) { mapLat = result.lat; mapLng = result.lng; }
  } catch {
    // keep city coords if available
  }

  const [reviews, similarProfiles] = await Promise.all([
    prisma.review.findMany({ where: { profileId: profile.id } }),
    prisma.steuerberaterProfile.findMany({
      where: {
        id: { not: profile.id },
        staedte: { some: { stadt: { slug: params.stadt } } },
      },
      take: 3,
      orderBy: { paket: "desc" },
      select: { name: true, slug: true, logo: true, tags: true, paket: true },
    }),
  ]);
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    : null;

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
    ...(profile.openingHours && { openingHours: profile.openingHours }),
    ...(profile.languages && profile.languages.length > 0 && { knowsLanguage: profile.languages }),
    ...(avgRating !== null && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: reviews.length,
      },
    }),
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

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <section className="bg-forest-900">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <nav className="flex items-center gap-2 text-sm text-cream-400">
            <Link href="/" className="hover:text-cream-100 transition-colors">Startseite</Link>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <Link href={`/steuerberater/${params.stadt}`} className="hover:text-cream-100 transition-colors capitalize">
              {stadtName}
            </Link>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <span className="text-cream-200">{profile.name}</span>
          </nav>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className={`bg-white rounded-xl border p-8 md:p-10 ${
          isPremium ? "border-gold-500/30 ring-1 ring-gold-500/10" : "border-forest-100"
        }`}>
            <div className="flex flex-col sm:flex-row gap-6 mb-8">
              {profile.logo ? (
                <Image
                  src={profile.logo}
                  alt={profile.name}
                  width={96}
                  height={96}
                  className="rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-forest-50 flex-shrink-0 flex items-center justify-center">
                  <span className="font-display text-3xl font-semibold text-forest-300">
                    {profile.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-display text-2xl md:text-3xl font-semibold text-forest-900">
                    {profile.name}
                  </h1>
                  {isPremium && (
                    <span className="gold-shine text-xs text-forest-950 px-3 py-1 rounded-full font-semibold">
                      Premium
                    </span>
                  )}
                  {profile.verified && (
                    <span className="inline-flex items-center gap-1 text-xs text-forest-600 bg-forest-50 px-2.5 py-1 rounded-full font-medium">
                      <svg className="w-3.5 h-3.5 text-forest-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                      </svg>
                      Verifiziert
                    </span>
                  )}
                </div>
                {profile.adresse && (
                  <p className="text-forest-500 flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {profile.adresse}{profile.plz ? `, ${profile.plz}` : ""}
                  </p>
                )}
              </div>
            </div>

            {!isPremium && (
              <ClaimProfileCTA profileName={profile.name} className="mb-6" />
            )}

            {profile.beschreibung && (
              <div className="mb-8">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-forest-400 mb-3">Über die Kanzlei</h2>
                <div className="relative pl-4 border-l-2 border-forest-200">
                  <p className="text-[0.9375rem] text-forest-700 leading-[1.75] tracking-[0.01em]">
                    {profile.beschreibung}
                  </p>
                </div>
              </div>
            )}

            {/* Sprachen + Erfahrung (Öffnungszeiten is in sidebar) */}
            {((profile.languages && profile.languages.length > 0) || profile.experienceYears) && (
              <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.languages && profile.languages.length > 0 && (
                  <div className="bg-forest-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <svg className="w-4 h-4 text-forest-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                      </svg>
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-forest-400">Sprachen</h3>
                    </div>
                    <p className="text-sm text-forest-700">{profile.languages.join(", ")}</p>
                  </div>
                )}
                {profile.experienceYears && (
                  <div className="bg-forest-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <svg className="w-4 h-4 text-forest-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                      </svg>
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-forest-400">Erfahrung</h3>
                    </div>
                    <p className="text-sm text-forest-700">{profile.experienceYears} Jahre Berufserfahrung</p>
                  </div>
                )}
              </div>
            )}

            {profile.tags.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-forest-400 mb-3">Spezialgebiete</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.tags.map((tag) => (
                    <span key={tag} className="bg-forest-50 text-forest-700 px-3.5 py-1.5 rounded-lg text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div id="kontakt">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-forest-400 mb-3">Kontakt</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.telefon && (
                  <a href={`tel:${profile.telefon}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-forest-50 hover:bg-forest-100 transition-colors group"
                  >
                    <svg className="w-5 h-5 text-forest-500 group-hover:text-forest-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    <span className="text-forest-700 font-medium">{profile.telefon}</span>
                  </a>
                )}
                {profile.email && (
                  <a href={`mailto:${profile.email}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-forest-50 hover:bg-forest-100 transition-colors group"
                  >
                    <svg className="w-5 h-5 text-forest-500 group-hover:text-forest-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    <span className="text-forest-700 font-medium">{profile.email}</span>
                  </a>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-forest-50 hover:bg-forest-100 transition-colors group"
                  >
                    <svg className="w-5 h-5 text-forest-500 group-hover:text-forest-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                    <span className="text-forest-700 font-medium truncate">{profile.website.replace(/^https?:\/\//, "")}</span>
                  </a>
                )}
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-forest-100">
              <ReviewSection profileId={profile.id} />
            </div>

            <div className="mt-8 pt-8 border-t border-forest-100">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-forest-400 mb-4">Nachricht senden</h2>
              <ContactForm profileId={profile.id} profileName={profile.name} />
            </div>


            {/* Öffnungszeiten */}
            {profile.openingHours && (
              <div className="mt-8 pt-8 border-t border-forest-100">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-forest-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-forest-400">Öffnungszeiten</h2>
                </div>
                <p className="text-sm text-forest-700 leading-relaxed">{profile.openingHours}</p>
              </div>
            )}

            {/* Map */}
            {mapLat !== null && mapLng !== null && (
              <div className="mt-8 pt-8 border-t border-forest-100">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-forest-400 mb-4">Standort</h2>
                <MapEmbed lat={mapLat} lng={mapLng} name={profile.name} />
              </div>
            )}

            {/* Disclaimer for unclaimed profiles */}
            {!isPremium && (
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex gap-2.5">
                  <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Dieses Profil wurde noch nicht vom Kanzleiinhaber beansprucht. Angaben können unvollständig oder veraltet sein.
                  </p>
                </div>
              </div>
            )}
        </div>
      </section>

      {/* Similar Advisors */}
      {similarProfiles.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-12">
          <h2 className="font-display text-xl font-semibold text-forest-900 mb-4">
            Weitere Steuerberater in {stadtName}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {similarProfiles.map((sp: any) => (
              <Link
                key={sp.slug}
                href={`/steuerberater/${params.stadt}/${sp.slug}`}
                className="group bg-white rounded-xl border border-forest-100 hover:border-forest-300 p-4 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  {sp.logo ? (
                    <Image src={sp.logo} alt={sp.name} width={40} height={40} className="rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-forest-50 flex items-center justify-center">
                      <span className="font-display text-sm font-semibold text-forest-300">{sp.name.charAt(0)}</span>
                    </div>
                  )}
                  <p className="font-medium text-forest-900 group-hover:text-forest-700 transition-colors text-sm truncate">
                    {sp.name}
                  </p>
                </div>
                {sp.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {sp.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="text-xs bg-forest-50 text-forest-600 px-2 py-0.5 rounded-md">{tag}</span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
