"use client";
import { useState } from "react";

// ── Option lists ─────────────────────────────────────────────────────────────

const BERUFSBEZEICHNUNG_OPTIONS = [
  { value: "STEUERBERATER", label: "Steuerberater" },
  { value: "WIRTSCHAFTSPRUEFER", label: "Wirtschaftsprüfer" },
  { value: "BEIDES", label: "Stb. & Wirtschaftsprüfer" },
  { value: "BUCHHALTER", label: "Buchhalter" },
  { value: "BILANZBUCHHALTER", label: "Bilanzbuchhalter" },
];

const MANDANTENGRUPPEN_OPTIONS = [
  "Privatpersonen",
  "KMU",
  "Konzerne",
  "Start-ups",
  "Freiberufler",
  "Vereine",
  "Landwirtschaft",
];

const SERVICE_OPTIONS = [
  { key: "gratisErstgespraech", label: "Gratis Erstgespräch" },
  { key: "onlineBeratung", label: "Online-Beratung" },
  { key: "schnellantwort", label: "Schnellantwort" },
  { key: "abendtermine", label: "Abendtermine" },
];

const RATING_OPTIONS = [
  { val: 3, label: "★★★ & besser" },
  { val: 4, label: "★★★★ & besser" },
  { val: 5, label: "Nur ★★★★★" },
];

const BEZEICHNUNG_LABEL: Record<string, string> = {
  STEUERBERATER: "Steuerberater",
  WIRTSCHAFTSPRUEFER: "Wirtschaftsprüfer",
  BEIDES: "Stb. & Wirtschaftsprüfer",
  BUCHHALTER: "Buchhalter",
  BILANZBUCHHALTER: "Bilanzbuchhalter",
};

const SERVICE_LABEL: Record<string, string> = {
  gratisErstgespraech: "Gratis Erstgespräch",
  onlineBeratung: "Online-Beratung",
  schnellantwort: "Schnellantwort",
  abendtermine: "Abendtermine",
};

// ── Types ────────────────────────────────────────────────────────────────────

export interface FilterState {
  nameSearch: string;
  spezialisierung: string[];
  mandantengruppen: string[];
  berufsbezeichnungen: string[];
  sprachen: string[];
  serviceOptionen: string[];
  minRating: number;
}

interface Props {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  allTags: string[];
  allSprachen: string[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-forest-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function FilterSection({
  id,
  label,
  activeCount,
  isOpen,
  onToggle,
  children,
}: {
  id: string;
  label: string;
  activeCount: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-forest-100 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 group"
        aria-expanded={isOpen}
        aria-controls={`filter-${id}`}
      >
        <span className="text-xs font-semibold text-forest-700 uppercase tracking-[0.1em] group-hover:text-forest-900 transition-colors">
          {label}
        </span>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <span className="text-[10px] font-bold bg-forest-900 text-cream-100 px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center leading-none">
              {activeCount}
            </span>
          )}
          <ChevronIcon open={isOpen} />
        </div>
      </button>
      <div
        id={`filter-${id}`}
        className="filter-section-body"
        data-open={String(isOpen)}
        style={{ maxHeight: isOpen ? "24rem" : "0px" }}
      >
        <div className="pb-3 space-y-1.5">{children}</div>
      </div>
    </div>
  );
}

function CheckItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group py-0.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="filter-checkbox"
      />
      <span
        className={`text-sm leading-snug transition-colors ${
          checked ? "text-forest-900 font-medium" : "text-forest-600 group-hover:text-forest-900"
        }`}
      >
        {label}
      </span>
    </label>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function FilterSidebar({ filters, onChange, allTags, allSprachen }: Props) {
  // All sections open by default
  const [open, setOpen] = useState<Record<string, boolean>>({
    bezeichnung: true,
    spezialisierung: true,
    mandanten: true,
    sprachen: false,
    services: true,
    bewertung: true,
  });

  const toggleSection = (key: string) =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  const update = <K extends keyof FilterState>(key: K, val: FilterState[K]) =>
    onChange({ ...filters, [key]: val });

  // Build active filter chips for summary
  const activeChips: { label: string; remove: () => void }[] = [
    ...(filters.nameSearch.trim()
      ? [{ label: `„${filters.nameSearch.trim()}"`, remove: () => update("nameSearch", "") }]
      : []),
    ...filters.berufsbezeichnungen.map((b) => ({
      label: BEZEICHNUNG_LABEL[b] ?? b,
      remove: () => update("berufsbezeichnungen", toggle(filters.berufsbezeichnungen, b)),
    })),
    ...filters.spezialisierung.map((t) => ({
      label: t,
      remove: () => update("spezialisierung", toggle(filters.spezialisierung, t)),
    })),
    ...filters.mandantengruppen.map((m) => ({
      label: m,
      remove: () => update("mandantengruppen", toggle(filters.mandantengruppen, m)),
    })),
    ...filters.sprachen.map((s) => ({
      label: s,
      remove: () => update("sprachen", toggle(filters.sprachen, s)),
    })),
    ...filters.serviceOptionen.map((o) => ({
      label: SERVICE_LABEL[o] ?? o,
      remove: () => update("serviceOptionen", toggle(filters.serviceOptionen, o)),
    })),
    ...(filters.minRating > 0
      ? [
          {
            label: `Min. ${filters.minRating}★`,
            remove: () => update("minRating", 0),
          },
        ]
      : []),
  ];

  const hasFilters = activeChips.length > 0;

  const resetAll = () =>
    onChange({
      nameSearch: "",
      spezialisierung: [],
      mandantengruppen: [],
      berufsbezeichnungen: [],
      sprachen: [],
      serviceOptionen: [],
      minRating: 0,
    });

  return (
    <aside className="sticky top-4 bg-white rounded-xl border border-forest-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-forest-100 bg-forest-50/50">
        <h3 className="font-display font-semibold text-forest-900 text-sm">
          Filter
        </h3>
        {hasFilters && (
          <button
            type="button"
            onClick={resetAll}
            className="text-xs text-forest-400 hover:text-forest-700 transition-colors font-medium"
          >
            Alle zurücksetzen
          </button>
        )}
      </div>

      {/* Name search */}
      <div className="px-5 py-3.5 border-b border-forest-100">
        <label htmlFor="name-search" className="text-[10px] font-semibold text-forest-400 uppercase tracking-[0.1em] block mb-2">
          Name suchen
        </label>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-forest-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            id="name-search"
            type="search"
            value={filters.nameSearch}
            onChange={(e) => update("nameSearch", e.target.value)}
            placeholder="z.B. Mustermann…"
            className="w-full pl-8 pr-8 py-2 text-sm border border-forest-200 rounded-lg bg-white text-forest-900 placeholder-forest-300 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-400 transition-shadow"
          />
          {filters.nameSearch && (
            <button
              type="button"
              onClick={() => update("nameSearch", "")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-forest-300 hover:text-forest-600 transition-colors"
              aria-label="Suche löschen"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="px-5 pt-3 pb-1 border-b border-forest-100">
          <p className="text-[10px] font-semibold text-forest-400 uppercase tracking-[0.1em] mb-2">
            Aktive Filter
          </p>
          <div className="flex flex-wrap gap-1.5 pb-2">
            {activeChips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={chip.remove}
                className="active-chip"
              >
                {chip.label}
                <svg
                  className="w-2.5 h-2.5 opacity-70"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter sections */}
      <div className="px-5">
        {/* Berufsbezeichnung */}
        <FilterSection
          id="bezeichnung"
          label="Berufsbezeichnung"
          activeCount={filters.berufsbezeichnungen.length}
          isOpen={open.bezeichnung}
          onToggle={() => toggleSection("bezeichnung")}
        >
          {BERUFSBEZEICHNUNG_OPTIONS.map((opt) => (
            <CheckItem
              key={opt.value}
              label={opt.label}
              checked={filters.berufsbezeichnungen.includes(opt.value)}
              onChange={() =>
                update("berufsbezeichnungen", toggle(filters.berufsbezeichnungen, opt.value))
              }
            />
          ))}
        </FilterSection>

        {/* Spezialisierung */}
        {allTags.length > 0 && (
          <FilterSection
            id="spezialisierung"
            label="Spezialisierung"
            activeCount={filters.spezialisierung.length}
            isOpen={open.spezialisierung}
            onToggle={() => toggleSection("spezialisierung")}
          >
            {allTags.map((tag) => (
              <CheckItem
                key={tag}
                label={tag}
                checked={filters.spezialisierung.includes(tag)}
                onChange={() =>
                  update("spezialisierung", toggle(filters.spezialisierung, tag))
                }
              />
            ))}
          </FilterSection>
        )}

        {/* Mandantengruppe */}
        <FilterSection
          id="mandanten"
          label="Mandantengruppe"
          activeCount={filters.mandantengruppen.length}
          isOpen={open.mandanten}
          onToggle={() => toggleSection("mandanten")}
        >
          {MANDANTENGRUPPEN_OPTIONS.map((m) => (
            <CheckItem
              key={m}
              label={m}
              checked={filters.mandantengruppen.includes(m)}
              onChange={() =>
                update("mandantengruppen", toggle(filters.mandantengruppen, m))
              }
            />
          ))}
        </FilterSection>

        {/* Sprachen */}
        {allSprachen.length > 0 && (
          <FilterSection
            id="sprachen"
            label="Sprachen"
            activeCount={filters.sprachen.length}
            isOpen={open.sprachen}
            onToggle={() => toggleSection("sprachen")}
          >
            {allSprachen.map((s) => (
              <CheckItem
                key={s}
                label={s}
                checked={filters.sprachen.includes(s)}
                onChange={() =>
                  update("sprachen", toggle(filters.sprachen, s))
                }
              />
            ))}
          </FilterSection>
        )}

        {/* Serviceangebote */}
        <FilterSection
          id="services"
          label="Serviceangebote"
          activeCount={filters.serviceOptionen.length}
          isOpen={open.services}
          onToggle={() => toggleSection("services")}
        >
          {SERVICE_OPTIONS.map(({ key, label }) => (
            <CheckItem
              key={key}
              label={label}
              checked={filters.serviceOptionen.includes(key)}
              onChange={() =>
                update("serviceOptionen", toggle(filters.serviceOptionen, key))
              }
            />
          ))}
        </FilterSection>

        {/* Mindestbewertung */}
        <FilterSection
          id="bewertung"
          label="Mindestbewertung"
          activeCount={filters.minRating > 0 ? 1 : 0}
          isOpen={open.bewertung}
          onToggle={() => toggleSection("bewertung")}
        >
          {/* "Alle" reset option */}
          <label className="flex items-center gap-2.5 cursor-pointer group py-0.5">
            <input
              type="radio"
              name="minRating"
              checked={filters.minRating === 0}
              onChange={() => update("minRating", 0)}
              className="filter-checkbox"
            />
            <span
              className={`text-sm transition-colors ${
                filters.minRating === 0
                  ? "text-forest-900 font-medium"
                  : "text-forest-600 group-hover:text-forest-900"
              }`}
            >
              Alle anzeigen
            </span>
          </label>
          {RATING_OPTIONS.map(({ val, label }) => (
            <label key={val} className="flex items-center gap-2.5 cursor-pointer group py-0.5">
              <input
                type="radio"
                name="minRating"
                checked={filters.minRating === val}
                onChange={() => update("minRating", val)}
                className="filter-checkbox"
              />
              <span
                className={`text-sm transition-colors ${
                  filters.minRating === val
                    ? "text-forest-900 font-medium"
                    : "text-forest-600 group-hover:text-forest-900"
                }`}
              >
                {label}
              </span>
            </label>
          ))}
        </FilterSection>
      </div>
    </aside>
  );
}
