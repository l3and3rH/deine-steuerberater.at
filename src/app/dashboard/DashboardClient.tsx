"use client";
import { useState } from "react";

export default function DashboardClient({ profile }: { profile: any }) {
  const [beschreibung, setBeschreibung] = useState(profile.beschreibung ?? "");
  const [telefon, setTelefon] = useState(profile.telefon ?? "");
  const [website, setWebsite] = useState(profile.website ?? "");
  const [tags, setTags] = useState((profile.tags ?? []).join(", "));
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/dashboard/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        beschreibung,
        telefon,
        website,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-2">Mein Dashboard</h1>
        <p className="text-sm text-gray-500 mb-8">
          Aktuelles Paket: <span className="font-semibold text-blue-600">{profile.paket}</span>
          {profile.paketAktivBis && ` · Aktiv bis ${new Date(profile.paketAktivBis).toLocaleDateString("de-AT")}`}
        </p>
        <form onSubmit={handleSave} className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input type="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          {profile.paket !== "BASIC" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung (max 500 Zeichen)</label>
                <textarea value={beschreibung} onChange={(e) => setBeschreibung(e.target.value)}
                  maxLength={500} rows={4}
                  className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spezialgebiete (kommagetrennt, max 10)</label>
                <input type="text" value={tags} onChange={(e) => setTags(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="z.B. Einkommensteuer, GmbH-Gründung" />
              </div>
            </>
          )}
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 self-start">
            {saved ? "Gespeichert ✓" : "Speichern"}
          </button>
        </form>
        {profile.paket === "BASIC" && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium">Upgrade auf Gold für mehr Sichtbarkeit</p>
            <p className="text-blue-600 text-sm mb-3">Logo, Beschreibung, Spezialgebiete und Top-Platzierung</p>
            <a href="/dashboard/upgrade" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 inline-block">
              Jetzt upgraden →
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
