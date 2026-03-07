"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useClickOutside } from "@/hooks/useClickOutside";

interface Stadt {
  name: string;
  slug: string;
  bundesland: string;
}

interface Profile {
  name: string;
  slug: string;
  plz: string | null;
  tags: string[];
  paket: string;
  stadtSlug: string | null;
  stadtName: string | null;
}

interface SearchResults {
  cities: Stadt[];
  profiles: Profile[];
}

export default function NavbarSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ cities: [], profiles: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const router = useRouter();

  const abortRef = useRef<AbortController>();

  const closeDropdown = useCallback(() => setOpen(false), []);
  useClickOutside(containerRef, open, closeDropdown);

  const search = useCallback((q: string) => {
    if (q.length < 2) {
      setResults({ cities: [], profiles: [] });
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => setResults(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 250);
  };

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navigate = (path: string) => {
    router.push(path);
    setOpen(false);
    setQuery("");
    setResults({ cities: [], profiles: [] });
  };

  const hasResults = results.cities.length > 0 || results.profiles.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(true)}
        aria-label="Suche öffnen"
        className="flex items-center gap-2.5 text-sm text-forest-400 hover:text-forest-600 transition-colors pl-3 pr-2.5 py-1.5 rounded-lg border border-forest-200 hover:border-forest-300 bg-white/50 w-44 lg:w-64"
      >
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <span className="flex-1 text-left truncate">Stadt, Name, Fachgebiet…</span>
        <kbd className="flex-shrink-0 text-xs text-forest-400 bg-forest-50 px-1.5 py-0.5 rounded font-mono">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl shadow-forest-950/10 border border-forest-100 z-50 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-forest-100">
            <svg className="w-4 h-4 text-forest-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Stadt, Name, PLZ oder Fachgebiet..."
              aria-label="Erweiterte Suche"
              className="flex-1 text-sm text-forest-900 placeholder:text-forest-400 bg-transparent focus:outline-none"
            />
            {loading && (
              <div className="w-4 h-4 border-2 border-forest-200 border-t-forest-500 rounded-full animate-spin" />
            )}
            <button onClick={() => setOpen(false)} className="text-xs text-forest-400 hover:text-forest-600">
              <kbd className="bg-forest-50 px-1.5 py-0.5 rounded font-mono">Esc</kbd>
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {/* Cities */}
            {results.cities.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-widest text-forest-400">Städte</p>
                <ul role="listbox">
                  {results.cities.map((s) => (
                    <li key={s.slug}>
                      <button
                        role="option"
                        onClick={() => navigate(`/steuerberater/${s.slug}`)}
                        className="w-full text-left px-4 py-2.5 hover:bg-forest-50 flex items-center justify-between transition-colors text-sm"
                      >
                        <span className="flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 text-forest-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          <span className="font-medium text-forest-900">{s.name}</span>
                        </span>
                        <span className="text-xs text-forest-500 bg-forest-50 px-2 py-0.5 rounded-full">{s.bundesland}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Profiles */}
            {results.profiles.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-widest text-forest-400">Steuerberater</p>
                <ul role="listbox">
                  {results.profiles.map((p) => (
                    <li key={p.slug}>
                      <button
                        role="option"
                        onClick={() => navigate(p.stadtSlug ? `/steuerberater/${p.stadtSlug}/${p.slug}` : "#")}
                        className="w-full text-left px-4 py-2.5 hover:bg-forest-50 transition-colors text-sm"
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-medium text-forest-900">{p.name}</span>
                          {p.paket !== "BASIC" && (
                            <span className="text-xs text-gold-600 font-medium">Premium</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-forest-500">
                          {p.stadtName && <span>{p.stadtName}</span>}
                          {p.plz && <span>PLZ {p.plz}</span>}
                          {p.tags.length > 0 && (
                            <span className="truncate">{p.tags.join(", ")}</span>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Empty / hint states */}
            {query.length >= 2 && !loading && !hasResults && (
              <p className="px-4 py-4 text-sm text-forest-400 text-center">Keine Ergebnisse gefunden</p>
            )}
            {query.length < 2 && (
              <p className="px-4 py-4 text-sm text-forest-400 text-center">
                Stadt, Name, PLZ oder Fachgebiet eingeben...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
