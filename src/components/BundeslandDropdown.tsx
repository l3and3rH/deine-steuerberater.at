"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useClickOutside } from "@/hooks/useClickOutside";

interface Stadt {
  name: string;
  slug: string;
  bundesland: string;
}

export default function BundeslandDropdown() {
  const [open, setOpen] = useState(false);
  const [staedte, setStaedte] = useState<Stadt[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeDropdown = useCallback(() => setOpen(false), []);
  useClickOutside(containerRef, open, closeDropdown);

  useEffect(() => {
    if (open && staedte.length === 0) {
      fetch("/api/cities")
        .then((r) => r.json())
        .then(setStaedte)
        .catch(() => {});
    }
  }, [open, staedte.length]);

  const bundeslaender = Array.from(new Set(staedte.map((s) => s.bundesland))).sort();

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Bundesländer anzeigen"
        className="text-sm text-forest-700 hover:text-forest-900 transition-colors flex items-center gap-1"
      >
        Bundesländer
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-[480px] bg-white rounded-xl shadow-xl shadow-forest-950/10 border border-forest-100 z-50 overflow-hidden">
          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              {bundeslaender.map((bl) => {
                const cities = staedte.filter((s) => s.bundesland === bl);
                return (
                  <div key={bl}>
                    <p className="text-xs font-semibold uppercase tracking-widest text-forest-400 mb-2 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-gold-500" />
                      {bl}
                    </p>
                    <ul className="space-y-0.5">
                      {cities.map((s) => (
                        <li key={s.slug}>
                          <Link
                            href={`/steuerberater/${s.slug}`}
                            onClick={() => setOpen(false)}
                            className="text-sm text-forest-700 hover:text-forest-900 hover:bg-forest-50 block px-2 py-1 rounded transition-colors"
                          >
                            {s.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
