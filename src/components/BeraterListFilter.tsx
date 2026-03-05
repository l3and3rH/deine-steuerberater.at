"use client";
import { useState, useMemo } from "react";
import { Paket } from "@prisma/client";
import SteuerberaterCard from "./SteuerberaterCard";
import FilterSidebar, { FilterState } from "./FilterSidebar";

interface Berater {
  id: string;
  name: string;
  kanzleiname: string | null;
  adresse: string | null;
  telefon: string | null;
  email: string | null;
  website: string | null;
  logo: string | null;
  beschreibung: string | null;
  tags: string[];
  languages: string[];
  paket: Paket;
  slug: string;
  avgRating: number | null;
  reviewCount: number;
  createdAt: string;
  verified: boolean;
  berufsbezeichnung: string | null;
  experienceYears: number | null;
  kswMitglied: boolean;
  gratisErstgespraech: boolean;
  onlineBeratung: boolean;
  beratungVorOrt: boolean;
  schnellantwort: boolean;
  abendtermine: boolean;
  mandantengruppen: string[];
  ausbildung: string | null;
  zulassungsjahr: number | null;
  auszeichnungen: string[];
  mitgliedschaften: string[];
  videoUrl: string | null;
}

interface Props {
  berater: Berater[];
  stadtSlug: string;
  stadtName: string;
}

type SortOption = "standard" | "name" | "rating" | "erfahrung" | "newest";

const PAGE_SIZE = 10;
const PAKET_ORDER: Record<Paket, number> = { SEO: 0, GOLD: 1, BASIC: 2 };

const EMPTY_FILTERS: FilterState = {
  spezialisierung: [],
  mandantengruppen: [],
  berufsbezeichnungen: [],
  sprachen: [],
  serviceOptionen: [],
  minRating: 0,
};

export default function BeraterListFilter({ berater, stadtSlug, stadtName }: Props) {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortOption>("standard");
  const [page, setPage] = useState(1);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    berater.forEach((b) => b.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [berater]);

  const allSprachen = useMemo(() => {
    const set = new Set<string>();
    berater.forEach((b) => b.languages.forEach((l) => set.add(l)));
    return Array.from(set).sort();
  }, [berater]);

  const filtered = useMemo(() => {
    let list = berater;

    if (filters.spezialisierung.length > 0) {
      list = list.filter((b) => filters.spezialisierung.some((t) => b.tags.includes(t)));
    }
    if (filters.mandantengruppen.length > 0) {
      list = list.filter((b) => filters.mandantengruppen.some((m) => b.mandantengruppen.includes(m)));
    }
    if (filters.berufsbezeichnungen.length > 0) {
      list = list.filter((b) => b.berufsbezeichnung && filters.berufsbezeichnungen.includes(b.berufsbezeichnung));
    }
    if (filters.sprachen.length > 0) {
      list = list.filter((b) => filters.sprachen.some((l) => b.languages.includes(l)));
    }
    if (filters.serviceOptionen.length > 0) {
      list = list.filter((b) =>
        filters.serviceOptionen.every((opt) => {
          if (opt === "gratisErstgespraech") return b.gratisErstgespraech;
          if (opt === "onlineBeratung") return b.onlineBeratung;
          if (opt === "schnellantwort") return b.schnellantwort;
          if (opt === "abendtermine") return b.abendtermine;
          return true;
        })
      );
    }
    if (filters.minRating > 0) {
      list = list.filter((b) => b.avgRating != null && b.avgRating >= filters.minRating);
    }

    const sorted = [...list];
    switch (sort) {
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name, "de"));
        break;
      case "rating":
        sorted.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
        break;
      case "erfahrung":
        sorted.sort((a, b) => (b.experienceYears ?? 0) - (a.experienceYears ?? 0));
        break;
      case "newest":
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        sorted.sort((a, b) => {
          const diff = PAKET_ORDER[a.paket] - PAKET_ORDER[b.paket];
          if (diff !== 0) return diff;
          return a.name.localeCompare(b.name, "de");
        });
    }
    return sorted;
  }, [berater, filters, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFiltersChange = (next: FilterState) => {
    setFilters(next);
    setPage(1);
  };

  return (
    <div className="flex gap-8 items-start">
      {/* Sidebar – 28% */}
      <div className="w-72 flex-shrink-0">
        <FilterSidebar
          filters={filters}
          onChange={handleFiltersChange}
          allTags={allTags}
          allSprachen={allSprachen}
        />
      </div>

      {/* Results – remaining space */}
      <div className="flex-1 min-w-0">
        {/* Results header */}
        <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
          <p className="text-sm text-forest-500">
            <span className="font-semibold text-forest-900">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "Steuerberater" : "Steuerberater"} gefunden
            {stadtName && ` in ${stadtName}`}
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-sm text-forest-500 whitespace-nowrap">
              Sortierung:
            </label>
            <select
              id="sort-select"
              value={sort}
              onChange={(e) => { setSort(e.target.value as SortOption); setPage(1); }}
              aria-label="Sortierung wählen"
              className="text-sm border border-forest-200 rounded-lg px-3 py-1.5 bg-white text-forest-700 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
            >
              <option value="standard">Relevanz</option>
              <option value="rating">Beste Bewertung</option>
              <option value="erfahrung">Erfahrung</option>
              <option value="name">Alphabetisch</option>
              <option value="newest">Neueste</option>
            </select>
          </div>
        </div>

        {/* Listings */}
        <div className="flex flex-col gap-4">
          {paginated.map((b) => (
            <SteuerberaterCard
              key={b.id}
              name={b.name}
              kanzleiname={b.kanzleiname}
              adresse={b.adresse}
              telefon={b.telefon}
              email={b.email}
              website={b.website}
              logo={b.logo}
              beschreibung={b.beschreibung}
              tags={b.tags}
              paket={b.paket}
              slug={b.slug}
              stadtSlug={stadtSlug}
              avgRating={b.avgRating}
              reviewCount={b.reviewCount}
              verified={b.verified}
              berufsbezeichnung={b.berufsbezeichnung}
              experienceYears={b.experienceYears}
              kswMitglied={b.kswMitglied}
              gratisErstgespraech={b.gratisErstgespraech}
              onlineBeratung={b.onlineBeratung}
              beratungVorOrt={b.beratungVorOrt}
              schnellantwort={b.schnellantwort}
              abendtermine={b.abendtermine}
              mandantengruppen={b.mandantengruppen}
              ausbildung={b.ausbildung}
              zulassungsjahr={b.zulassungsjahr}
              auszeichnungen={b.auszeichnungen}
              mitgliedschaften={b.mitgliedschaften}
              videoUrl={b.videoUrl}
            />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-forest-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-forest-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-1.053M18 7.5a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm-2.25 0a1.125 1.125 0 11-2.25 0 1.125 1.125 0 012.25 0z" />
                </svg>
              </div>
              <p className="text-forest-500 font-medium mb-1">Keine Ergebnisse</p>
              <p className="text-forest-400 text-sm">
                Keine Steuerberater für die gewählten Filter in {stadtName} gefunden.
              </p>
              <button
                onClick={() => handleFiltersChange(EMPTY_FILTERS)}
                className="mt-3 text-sm text-forest-600 hover:text-forest-900 underline transition-colors"
              >
                Filter zurücksetzen
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Vorherige Seite"
              className="px-3 py-2 text-sm rounded-lg border border-forest-200 text-forest-700 hover:bg-forest-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Zurück
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                aria-current={p === page ? "page" : undefined}
                className={`w-9 h-9 text-sm rounded-lg font-medium transition-colors ${
                  p === page
                    ? "bg-forest-900 text-cream-100"
                    : "border border-forest-200 text-forest-700 hover:bg-forest-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Nächste Seite"
              className="px-3 py-2 text-sm rounded-lg border border-forest-200 text-forest-700 hover:bg-forest-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Weiter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
