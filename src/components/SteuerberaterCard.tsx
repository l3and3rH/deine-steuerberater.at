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
    mitgliedschaften = [], videoUrl,
  } = props;

  const isPremium = paket === "GOLD" || paket === "SEO";

  const serviceBadges: { label: string; show: boolean }[] = [
    { label: "Gratis Erstgespräch", show: !!gratisErstgespraech },
    { label: "Online-Beratung", show: !!onlineBeratung },
    { label: "Beratung vor Ort", show: !!beratungVorOrt },
    { label: "Schnellantwort", show: !!schnellantwort },
    { label: "Abendtermine", show: !!abendtermine },
  ].filter((b) => b.show);

  const profileUrl = `/steuerberater/${stadtSlug}/${slug}`;

  return (
    <div className={`group bg-white rounded-xl border p-6 flex gap-5 card-hover ${
      isPremium
        ? "border-gold-500/30 shadow-md shadow-gold-500/5 ring-1 ring-gold-500/10"
        : "border-forest-100"
    }`}>
      {/* Logo */}
      {logo ? (
        <Image
          src={logo}
          alt={name}
          width={72}
          height={72}
          className="rounded-lg object-cover flex-shrink-0 bg-forest-50"
        />
      ) : (
        <div className="w-[72px] h-[72px] rounded-lg bg-forest-50 flex-shrink-0 flex items-center justify-center">
          <span className="font-display text-xl font-semibold text-forest-300">
            {name.charAt(0)}
          </span>
        </div>
      )}

      <div className="flex-1 min-w-0">

        {/* 4.1 – Berufsbezeichnung */}
        {berufsbezeichnung && BEZEICHNUNG_LABEL[berufsbezeichnung] && (
          <p className="text-xs text-forest-400 font-medium mb-1">
            {BEZEICHNUNG_LABEL[berufsbezeichnung]}
          </p>
        )}

        {/* 4.1 – Name + Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <Link
            href={profileUrl}
            className="font-display font-semibold text-forest-900 group-hover:text-forest-700 text-lg transition-colors"
          >
            {name}
          </Link>
          {isPremium && (
            <span className="gold-shine text-xs text-forest-950 px-2.5 py-0.5 rounded-full font-semibold">
              Premium
            </span>
          )}
          {verified && (
            <span className="inline-flex items-center gap-1 text-xs text-forest-600 bg-forest-50 px-2 py-0.5 rounded-full font-medium" title="Verifiziertes Profil">
              <svg className="w-3 h-3 text-forest-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
              Verifiziert
            </span>
          )}
          {/* 4.1 – KSW-Mitglied geprüft */}
          {kswMitglied && (
            <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full font-medium">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              KSW-Mitglied geprüft
            </span>
          )}
          {/* 4.2 – Erfahrung */}
          {experienceYears != null && experienceYears > 0 && (
            <span className="text-xs text-forest-500 bg-forest-50 px-2 py-0.5 rounded-full">
              {experienceYears} J. Erfahrung
            </span>
          )}
        </div>

        {/* 4.2 – Kanzleiname */}
        {kanzleiname && (
          <p className="text-sm text-forest-500 mb-1">{kanzleiname}</p>
        )}

        {/* 4.2 – Adresse */}
        {adresse && (
          <p className="text-sm text-forest-500 mb-1.5 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {adresse}
          </p>
        )}

        {/* 4.1 – Bewertung */}
        {avgRating != null && avgRating > 0 && (
          <div className="flex items-center gap-1.5 mt-0.5 mb-2">
            <StarRating rating={avgRating} size="xs" />
            <span className="text-xs font-medium text-forest-700">{avgRating.toFixed(1)}</span>
            <span className="text-xs text-forest-400">/ {reviewCount} Bewertung{reviewCount !== 1 ? "en" : ""}</span>
          </div>
        )}

        {/* 4.1 – Service-Badges */}
        {serviceBadges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {serviceBadges.map(({ label }) => (
              <span key={label} className="text-xs text-forest-700 bg-forest-50 border border-forest-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <svg className="w-2.5 h-2.5 text-forest-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {label}
              </span>
            ))}
          </div>
        )}

        {/* 4.3 – Spezialisierungen */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.slice(0, 5).map((tag) => (
              <span key={tag} className="text-xs bg-forest-50 text-forest-600 px-2.5 py-1 rounded-md">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Mandantengruppen */}
        {mandantengruppen.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {mandantengruppen.slice(0, 3).map((mg) => (
              <span key={mg} className="text-xs bg-cream-100 text-forest-600 border border-forest-100 px-2.5 py-1 rounded-md">
                {mg}
              </span>
            ))}
          </div>
        )}

        {/* 4.4 – Kurzbiografie + "Mehr lesen"-Link */}
        {beschreibung && (
          <div className="mb-2">
            <p className="text-sm text-forest-600 line-clamp-3 leading-relaxed inline">
              {beschreibung}
            </p>
            {" "}
            <Link href={profileUrl} className="text-xs text-forest-500 hover:text-forest-900 transition-colors whitespace-nowrap">
              Mehr lesen »
            </Link>
          </div>
        )}

        {/* 4.5 – Ausbildung & Zulassung */}
        {(ausbildung || zulassungsjahr) && (
          <div className="flex items-center gap-3 text-xs text-forest-500 mb-2 flex-wrap">
            {ausbildung && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                </svg>
                {ausbildung}
              </span>
            )}
            {zulassungsjahr && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                Zugelassen seit {zulassungsjahr}
              </span>
            )}
          </div>
        )}

        {/* 4.6 – Auszeichnungen & Mitgliedschaften */}
        {(auszeichnungen.length > 0 || mitgliedschaften.length > 0) && (
          <div className="text-xs text-forest-500 mb-2 space-y-0.5">
            {auszeichnungen.slice(0, 2).map((a) => (
              <p key={a} className="flex items-center gap-1">
                <svg className="w-3 h-3 text-gold-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {a}
              </p>
            ))}
            {mitgliedschaften.slice(0, 2).map((m) => (
              <p key={m} className="flex items-center gap-1">
                <svg className="w-3 h-3 text-forest-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                {m}
              </p>
            ))}
          </div>
        )}

        {/* 6.1 / 6.2 / 6.3 – Aktionsbuttons */}
        <div className="flex flex-wrap gap-2 mt-3">
          {/* Primär */}
          {telefon && (
            <a
              href={`tel:${telefon}`}
              className="inline-flex items-center gap-1.5 bg-forest-900 text-cream-100 hover:bg-forest-700 px-3.5 py-1.5 rounded-lg font-medium transition-colors text-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              Jetzt anrufen
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}?subject=Terminanfrage`}
              className="inline-flex items-center gap-1.5 bg-forest-900 text-cream-100 hover:bg-forest-700 px-3.5 py-1.5 rounded-lg font-medium transition-colors text-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
              </svg>
              Termin anfragen
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="inline-flex items-center gap-1.5 bg-forest-50 text-forest-700 hover:bg-forest-100 border border-forest-200 px-3.5 py-1.5 rounded-lg font-medium transition-colors text-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              E-Mail senden
            </a>
          )}

          {/* Sekundär */}
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-forest-50 text-forest-700 hover:bg-forest-100 border border-forest-200 px-3.5 py-1.5 rounded-lg font-medium transition-colors text-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
              Website besuchen
            </a>
          )}
          <Link
            href={profileUrl}
            className="inline-flex items-center gap-1.5 text-forest-600 hover:text-forest-900 transition-colors text-xs font-medium"
          >
            Profil ansehen
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>

          {/* 6.3 – Premium-only Buttons */}
          {isPremium && videoUrl && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-forest-600 hover:text-forest-900 transition-colors text-xs font-medium"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
              </svg>
              Video ansehen
            </a>
          )}
          {isPremium && (
            <Link
              href={`${profileUrl}#bewertung`}
              className="inline-flex items-center gap-1.5 text-forest-600 hover:text-forest-900 transition-colors text-xs font-medium"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              Bewertung schreiben
            </Link>
          )}
          {isPremium && onlineBeratung && (
            <Link
              href={`${profileUrl}#online-beratung`}
              className="inline-flex items-center gap-1.5 text-forest-600 hover:text-forest-900 transition-colors text-xs font-medium"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Jetzt online beraten lassen
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
