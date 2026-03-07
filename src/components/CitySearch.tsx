"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  staedte: { name: string; slug: string; bundesland: string }[];
}

export default function CitySearch({ staedte }: Props) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  const filtered = staedte.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  const showDropdown = focused && query.length > 0;

  const handleSearch = () => {
    const match = staedte.find((s) =>
      s.name.toLowerCase() === query.trim().toLowerCase()
    ) ?? filtered[0];
    if (match) router.push(`/steuerberater/${match.slug}`);
  };

  return (
    <div className="relative">
      <div className="relative flex gap-2 flex-wrap sm:flex-nowrap">
        <div className="relative w-full sm:flex-1">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-400"
            fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Stadt suchen, z.B. Wien, Graz, Linz..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            aria-label="Stadt suchen"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            role="combobox"
            className="w-full bg-white/95 backdrop-blur border-0 rounded-xl pl-12 pr-4 py-4 text-base text-forest-900 placeholder:text-forest-400 shadow-lg shadow-forest-950/10 focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-shadow"
          />
        </div>
        <button
          onClick={handleSearch}
          aria-label="Suchen"
          className="flex-shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 text-forest-950 font-semibold px-5 py-3.5 sm:py-4 rounded-xl shadow-lg shadow-forest-950/10 transition-colors text-sm"
        >
          Suchen
        </button>
      </div>
      {showDropdown && (
        <ul role="listbox" aria-label="Städte-Vorschläge" className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl shadow-forest-950/10 border border-forest-100 max-h-72 overflow-y-auto z-50">
          {filtered.slice(0, 8).map((s) => (
            <li key={s.slug}>
              <button
                role="option"
                onClick={() => router.push(`/steuerberater/${s.slug}`)}
                className="w-full text-left px-5 py-3.5 hover:bg-forest-50 flex items-center justify-between transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                <span className="font-medium text-forest-900">{s.name}</span>
                <span className="text-xs text-forest-500 bg-forest-50 px-2 py-0.5 rounded-full">{s.bundesland}</span>
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-5 py-4 text-forest-400 text-sm">Keine Stadt gefunden</li>
          )}
        </ul>
      )}
    </div>
  );
}
