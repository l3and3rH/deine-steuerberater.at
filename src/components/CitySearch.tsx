"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  staedte: { name: string; slug: string; bundesland: string }[];
}

export default function CitySearch({ staedte }: Props) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filtered = staedte.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-xl mx-auto">
      <input
        type="text"
        placeholder="Stadt suchen..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {query && (
        <ul className="mt-2 border border-gray-200 rounded-lg bg-white shadow-lg max-h-64 overflow-y-auto">
          {filtered.slice(0, 8).map((s) => (
            <li key={s.slug}>
              <button
                onClick={() => router.push(`/steuerberater/${s.slug}`)}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 flex justify-between"
              >
                <span className="font-medium">{s.name}</span>
                <span className="text-gray-400 text-sm">{s.bundesland}</span>
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-4 py-3 text-gray-400">Keine Stadt gefunden</li>
          )}
        </ul>
      )}
    </div>
  );
}
