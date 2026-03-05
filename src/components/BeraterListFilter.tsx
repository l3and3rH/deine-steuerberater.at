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
  nameSearch: "",
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

    if (filters.nameSearch.trim()) {
      const q = filters.nameSearch.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          (b.kanzleiname ?? "").toLowerCase().includes(q)
      );
    }
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
        <div className="flex items-center justify-between mb-5 gap-4 flex-wrap bg-white border border-forest-100 rounded-xl px-5 py-3.5 shadow-sm">
          <div>
            <span className="font-display font-semibold text-forest-900 text-lg tabular-nums">
              {filtered.length}
            </span>
            <span className="text-sm text-forest-500 ml-1.5">
              Steuerberater{stadtName && (
                <> gefunden in <span className="text-forest-700 font-medium">{stadtName}</span></>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs font-medium text-forest-400 whitespace-nowrap uppercase tracking-wide">
              Sortierung
            </label>
            <select
              id="sort-select"
              value={sort}
              onChange={(e) => { setSort(e.target.value as SortOption); setPage(1); }}
              aria-label="Sortierung wählen"
              className="text-sm border border-forest-200 rounded-lg px-3 py-1.5 bg-white text-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-400 transition-shadow"
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
            <div className="text-center py-20 bg-white rounded-xl border border-forest-100">
              <div className="w-14 h-14 rounded-full bg-forest-50 border border-forest-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-forest-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <p className="font-display font-semibold text-forest-700 mb-1">Keine Treffer</p>
              <p className="text-forest-400 text-sm max-w-xs mx-auto">
                Für die gewählten Filter wurden keine Steuerberater{stadtName && ` in ${stadtName}`} gefunden.
              </p>
              <button
                onClick={() => handleFiltersChange(EMPTY_FILTERS)}
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-forest-600 hover:text-forest-900 font-medium transition-colors border border-forest-200 rounded-lg px-4 py-2 hover:bg-forest-50"
              >
                Filter zurücksetzen
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 bg-white border border-forest-100 rounded-xl px-5 py-3.5 shadow-sm">
            <p className="text-xs text-forest-400">
              Seite <span className="font-semibold text-forest-700">{page}</span> von{" "}
              <span className="font-semibold text-forest-700">{totalPages}</span>
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Vorherige Seite"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-forest-200 text-forest-600 hover:bg-forest-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-medium"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Zurück
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    aria-current={p === page ? "page" : undefined}
                    className={`w-8 h-8 text-xs rounded-lg font-medium transition-colors ${
                      p === page
                        ? "bg-forest-900 text-cream-100 shadow-sm"
                        : "border border-forest-200 text-forest-600 hover:bg-forest-50"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Nächste Seite"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-forest-200 text-forest-600 hover:bg-forest-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-medium"
              >
                Weiter
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
