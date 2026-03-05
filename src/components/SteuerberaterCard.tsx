import Image from "next/image";
import Link from "next/link";
import { Paket } from "@prisma/client";
import StarRating from "./StarRating";

const BEZEICHNUNG_LABEL: Record<string, string> = {
  STEUERBERATER: "Steuerberater",
  WIRTSCHAFTSPRUEFER: "Wirtschaftsprüfer",
  BEIDES: "Steuerberater & Wirtschaftsprüfer",
  BUCHHALTER: "Buchhalter",
  BILANZBUCHHALTER: "Bilanzbuchhalter",
};

// Deterministic gradient per name initial
const AVATAR_GRADIENTS = [
  ["#1e3a2c", "#0f2b1d"],
  ["#2c503e", "#1e3a2c"],
  ["#36644c", "#2c503e"],
  ["#0f2b1d", "#36644c"],
];

interface Props {
  name: string;
  kanzleiname?: string | null;
  adresse?: string | null;
  telefon?: string | null;
  email?: string | null;
  website?: string | null;
  logo?: string | null;
  beschreibung?: string | null;
  tags: string[];
  languages?: string[];
  paket: Paket;
  slug: string;
  stadtSlug: string;
  avgRating?: number | null;
  reviewCount?: number;
  verified?: boolean;
  berufsbezeichnung?: string | null;
  experienceYears?: number | null;
  kswMitglied?: boolean;
  gratisErstgespraech?: boolean;
  onlineBeratung?: boolean;
  beratungVorOrt?: boolean;
  schnellantwort?: boolean;
  abendtermine?: boolean;
  mandantengruppen?: string[];
  ausbildung?: string | null;
  zulassungsjahr?: number | null;
  auszeichnungen?: string[];
  mitgliedschaften?: string[];
  videoUrl?: string | null;
}

export default function SteuerberaterCard(props: Props) {
  const {
    name, kanzleiname, adresse, telefon, email, website, logo, beschreibung,
    tags, paket, slug, stadtSlug, avgRating, reviewCount, verified,
    berufsbezeichnung, experienceYears, kswMitglied, gratisErstgespraech,
    onlineBeratung, beratungVorOrt, schnellantwort, abendtermine,
    mandantengruppen = [], ausbildung, zulassungsjahr, auszeichnungen = [],
    videoUrl,
  } = props;

  const isPremium = paket === "GOLD" || paket === "SEO";
  const profileUrl = `/steuerberater/${stadtSlug}/${slug}`;

  // Avatar gradient from name
  const gradIdx = (name.charCodeAt(0) || 0) % AVATAR_GRADIENTS.length;
  const [fromColor, toColor] = AVATAR_GRADIENTS[gradIdx];

  // Service flags
  const services = [
    { label: "Gratis Erstgespräch", active: !!gratisErstgespraech },
    { label: "Online-Beratung", active: !!onlineBeratung },
    { label: "Beratung vor Ort", active: !!beratungVorOrt },
    { label: "Schnellantwort", active: !!schnellantwort },
    { label: "Abendtermine", active: !!abendtermine },
  ].filter((s) => s.active);

  // Tags: show max 4, then "+N"
  const visibleTags = tags.slice(0, 4);
  const extraTags = Math.max(0, tags.length - 4);

  // Accent color: gold for premium, forest-500 for verified, muted for basic
  const accentClass = isPremium
    ? "bg-gold-500"
    : verified
    ? "bg-forest-500"
    : "bg-forest-100";

  return (
    <article
      className={`relative bg-white rounded-xl border overflow-hidden card-hover ${
        isPremium
          ? "border-gold-300/60 shadow-md shadow-gold-500/8"
          : "border-forest-100 shadow-sm"
      }`}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 inset-y-0 w-[3px] ${accentClass}`} />

      <div className="flex gap-5 px-6 py-5 pl-7">
        {/* ── Avatar column ── */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2 pt-0.5">
          {logo ? (
            <Image
              src={logo}
              alt={name}
              width={80}
              height={80}
              className="w-20 h-20 rounded-xl object-cover"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(145deg, ${fromColor}, ${toColor})`,
              }}
            >
              <span className="font-display text-2xl font-semibold text-white/90 select-none">
                {name.charAt(0)}
              </span>
            </div>
          )}
          {isPremium && (
            <span className="gold-shine text-[10px] text-forest-950 px-2 py-0.5 rounded-full font-bold tracking-wide whitespace-nowrap">
              PREMIUM
            </span>
          )}
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">

          {/* ── ZONE 1: Identity ── */}
          <div className="mb-2">
            {berufsbezeichnung && BEZEICHNUNG_LABEL[berufsbezeichnung] && (
              <p className="text-[10px] font-semibold text-forest-400 uppercase tracking-[0.12em] mb-0.5">
                {BEZEICHNUNG_LABEL[berufsbezeichnung]}
              </p>
            )}
            <div className="flex items-start justify-between gap-3">
              <Link
                href={profileUrl}
                className="font-display font-semibold text-forest-900 hover:text-forest-600 text-[1.15rem] leading-tight transition-colors"
              >
                {name}
              </Link>
              {/* Badges top-right */}
              <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                {verified && (
                  <span
                    title="Verifiziertes Profil"
                    className="inline-flex items-center gap-1 text-[10px] text-forest-600 bg-forest-50 border border-forest-100 px-1.5 py-0.5 rounded-full font-semibold whitespace-nowrap"
                  >
                    <svg className="w-2.5 h-2.5 text-forest-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verifiziert
                  </span>
                )}
              </div>
            </div>
            {kanzleiname && (
              <p className="text-sm text-forest-500 mt-0.5 leading-snug">{kanzleiname}</p>
            )}
          </div>

          {/* ── ZONE 2: Trust bar ── */}
          <div className="flex items-center gap-3 flex-wrap mb-2.5">
            {avgRating != null && avgRating > 0 ? (
              <div className="flex items-center gap-1.5">
                <StarRating rating={avgRating} size="xs" />
                <span className="text-sm font-semibold text-forest-800 tabular-nums">
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-xs text-forest-400">
                  · {reviewCount} Bewertung{reviewCount !== 1 ? "en" : ""}
                </span>
              </div>
            ) : (
              <span className="text-xs text-forest-300 italic">Noch keine Bewertungen</span>
            )}
            {kswMitglied && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-100/80 px-2 py-0.5 rounded-full whitespace-nowrap">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                KSW-Mitglied geprüft
              </span>
            )}
            {experienceYears != null && experienceYears > 0 && (
              <span className="text-[10px] font-semibold text-forest-500 bg-forest-50 border border-forest-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                {experienceYears} J. Erfahrung
              </span>
            )}
          </div>

          {/* Adresse */}
          {adresse && (
            <p className="flex items-center gap-1.5 text-xs text-forest-500 mb-3">
              <svg className="w-3 h-3 flex-shrink-0 text-forest-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {adresse}
            </p>
          )}

          {/* ── ZONE 3: Content ── */}

          {/* Kurzbiografie */}
          {beschreibung && (
            <div className="mb-3">
              <p className="text-sm text-forest-600 leading-relaxed line-clamp-2 inline">
                {beschreibung}
              </p>
              {" "}
              <Link
                href={profileUrl}
                className="text-xs text-forest-400 hover:text-forest-700 transition-colors whitespace-nowrap"
              >
                Mehr lesen »
              </Link>
            </div>
          )}

          {/* Spezialisierungen */}
          {visibleTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {visibleTags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-forest-50 text-forest-600 border border-forest-100 px-2.5 py-0.5 rounded-md"
                >
                  {tag}
                </span>
              ))}
              {extraTags > 0 && (
                <span className="text-xs text-forest-400 px-1.5 py-0.5 self-center">
                  +{extraTags} weitere
                </span>
              )}
            </div>
          )}

          {/* Service-Flags */}
          {services.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
              {services.map(({ label }) => (
                <span key={label} className="service-badge">
                  <svg className="w-3.5 h-3.5 text-forest-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Meta line: Mandanten · Ausbildung · Zulassung · Auszeichnung */}
          {(mandantengruppen.length > 0 || ausbildung || zulassungsjahr || auszeichnungen.length > 0) && (
            <p className="text-xs text-forest-400 flex flex-wrap items-center gap-x-3 gap-y-0.5 mb-1">
              {mandantengruppen.length > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                  {mandantengruppen.slice(0, 3).join(" · ")}
                </span>
              )}
              {ausbildung && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                  {ausbildung}
                </span>
              )}
              {zulassungsjahr && (
                <span>Zugelassen seit {zulassungsjahr}</span>
              )}
              {auszeichnungen[0] && (
                <span className="flex items-center gap-0.5 text-gold-600">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {auszeichnungen[0]}
                </span>
              )}
            </p>
          )}

          {/* ── ZONE 4: Actions ── */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-forest-50">
            {/* Primary CTA */}
            {telefon && (
              <a
                href={`tel:${telefon}`}
                className="inline-flex items-center gap-1.5 bg-forest-900 text-cream-100 hover:bg-forest-700 px-4 py-2 rounded-lg font-semibold text-xs transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                Jetzt anrufen
              </a>
            )}
            {/* Secondary CTA */}
            {email && (
              <a
                href={`mailto:${email}?subject=Terminanfrage`}
                className="inline-flex items-center gap-1.5 border border-forest-200 text-forest-700 hover:bg-forest-50 px-4 py-2 rounded-lg font-semibold text-xs transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                </svg>
                Termin anfragen
              </a>
            )}
            {/* Tertiary text links */}
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-forest-500 hover:text-forest-800 transition-colors font-medium"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                Website
              </a>
            )}
            {isPremium && videoUrl && (
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-forest-500 hover:text-forest-800 transition-colors font-medium"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                </svg>
                Video
              </a>
            )}
            {isPremium && (
              <Link
                href={`${profileUrl}#bewertung`}
                className="inline-flex items-center gap-1 text-xs text-forest-500 hover:text-forest-800 transition-colors font-medium"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
                Bewertung
              </Link>
            )}
            {/* Always last: Profil-Link */}
            <Link
              href={profileUrl}
              className="ml-auto inline-flex items-center gap-1 text-xs text-forest-500 hover:text-forest-900 transition-colors font-semibold"
            >
              Profil ansehen
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
