"use client";

const BERUFSBEZEICHNUNG_OPTIONS = [
  { value: "STEUERBERATER", label: "Steuerberater" },
  { value: "WIRTSCHAFTSPRUEFER", label: "Wirtschaftsprüfer" },
  { value: "BEIDES", label: "Steuerberater & Wirtschaftsprüfer" },
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

export interface FilterState {
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

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

function CheckboxGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (val: string) => void;
}) {
  return (
    <div className="border-b border-forest-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <p className="text-xs font-semibold text-forest-700 uppercase tracking-wider mb-2.5">{label}</p>
      <div className="space-y-1.5">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={() => onToggle(opt.value)}
              className="w-3.5 h-3.5 rounded border-forest-300 text-forest-900 accent-forest-900"
            />
            <span className="text-sm text-forest-600 group-hover:text-forest-900 transition-colors leading-tight">
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function FilterSidebar({ filters, onChange, allTags, allSprachen }: Props) {
  const update = (key: keyof FilterState, val: unknown) =>
    onChange({ ...filters, [key]: val });

  const hasActiveFilters =
    filters.spezialisierung.length > 0 ||
    filters.mandantengruppen.length > 0 ||
    filters.berufsbezeichnungen.length > 0 ||
    filters.sprachen.length > 0 ||
    filters.serviceOptionen.length > 0 ||
    filters.minRating > 0;

  return (
    <aside className="sticky top-4 bg-white rounded-xl border border-forest-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-forest-900 text-sm">Filter</h3>
        {hasActiveFilters && (
          <button
            onClick={() =>
              onChange({
                spezialisierung: [],
                mandantengruppen: [],
                berufsbezeichnungen: [],
                sprachen: [],
                serviceOptionen: [],
                minRating: 0,
              })
            }
            className="text-xs text-forest-400 hover:text-forest-700 transition-colors"
          >
            Zurücksetzen
          </button>
        )}
      </div>

      {/* Berufsbezeichnung */}
      <CheckboxGroup
        label="Berufsbezeichnung"
        options={BERUFSBEZEICHNUNG_OPTIONS}
        selected={filters.berufsbezeichnungen}
        onToggle={(val) => update("berufsbezeichnungen", toggle(filters.berufsbezeichnungen, val))}
      />

      {/* Spezialisierung (from tags) */}
      {allTags.length > 0 && (
        <CheckboxGroup
          label="Spezialisierung"
          options={allTags.map((t) => ({ value: t, label: t }))}
          selected={filters.spezialisierung}
          onToggle={(val) => update("spezialisierung", toggle(filters.spezialisierung, val))}
        />
      )}

      {/* Mandantengruppe */}
      <CheckboxGroup
        label="Mandantengruppe"
        options={MANDANTENGRUPPEN_OPTIONS.map((m) => ({ value: m, label: m }))}
        selected={filters.mandantengruppen}
        onToggle={(val) => update("mandantengruppen", toggle(filters.mandantengruppen, val))}
      />

      {/* Sprachen */}
      {allSprachen.length > 0 && (
        <CheckboxGroup
          label="Sprachen"
          options={allSprachen.map((s) => ({ value: s, label: s }))}
          selected={filters.sprachen}
          onToggle={(val) => update("sprachen", toggle(filters.sprachen, val))}
        />
      )}

      {/* Serviceangebote */}
      <CheckboxGroup
        label="Serviceangebote"
        options={SERVICE_OPTIONS.map((s) => ({ value: s.key, label: s.label }))}
        selected={filters.serviceOptionen}
        onToggle={(val) => update("serviceOptionen", toggle(filters.serviceOptionen, val))}
      />

      {/* Mindestbewertung */}
      <div>
        <p className="text-xs font-semibold text-forest-700 uppercase tracking-wider mb-2.5">
          Mindestbewertung
        </p>
        <div className="space-y-1.5">
          {[
            { val: 0, label: "Alle" },
            { val: 3, label: "★★★ & besser" },
            { val: 4, label: "★★★★ & besser" },
            { val: 5, label: "★★★★★ Nur Top" },
          ].map(({ val, label }) => (
            <label key={val} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="minRating"
                checked={filters.minRating === val}
                onChange={() => update("minRating", val)}
                className="w-3.5 h-3.5 border-forest-300 text-forest-900 accent-forest-900"
              />
              <span className="text-sm text-forest-600 group-hover:text-forest-900 transition-colors">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
