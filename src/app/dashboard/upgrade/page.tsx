"use client";
import { useState } from "react";

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);

  async function handleGold() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-8">Paket upgraden</h1>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Basic */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-bold text-lg mb-1">Basic</h2>
            <p className="text-2xl font-bold mb-4">Gratis</p>
            <ul className="text-sm text-gray-600 space-y-2 mb-6">
              <li>✓ Basisprofil</li>
              <li>✓ Website-Link</li>
              <li>✓ Listung in einer Stadt</li>
            </ul>
            <button disabled className="w-full bg-gray-100 text-gray-400 py-2 rounded cursor-not-allowed">
              Aktuelles Paket
            </button>
          </div>
          {/* Gold */}
          <div className="bg-white rounded-lg border-2 border-blue-500 p-6 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full">Empfohlen</span>
            <h2 className="font-bold text-lg mb-1">Gold</h2>
            <p className="text-2xl font-bold mb-1">€79 <span className="text-base font-normal text-gray-500">/Monat</span></p>
            <ul className="text-sm text-gray-600 space-y-2 mb-6 mt-4">
              <li>✓ Top-Platzierung</li>
              <li>✓ Logo & Beschreibung</li>
              <li>✓ 10 Spezialgebiete</li>
              <li>✓ Kontaktformular</li>
              <li>✓ Bis zu 3 Städte</li>
              <li>✓ Premium-Badge</li>
            </ul>
            <button onClick={handleGold} disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60">
              {loading ? "Wird geladen..." : "Gold wählen"}
            </button>
          </div>
          {/* SEO */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-bold text-lg mb-1">SEO & Sichtbarkeit</h2>
            <p className="text-2xl font-bold mb-1">ab €299 <span className="text-base font-normal text-gray-500">/Monat</span></p>
            <ul className="text-sm text-gray-600 space-y-2 mb-6 mt-4">
              <li>✓ Alles aus Gold</li>
              <li>✓ On-Page SEO</li>
              <li>✓ Google Business</li>
              <li>✓ Backlink-Aufbau</li>
              <li>✓ Monatliches Reporting</li>
              <li>✓ Persönlicher Ansprechpartner</li>
            </ul>
            <a href="/kontakt-seo" className="block w-full text-center bg-gray-800 text-white py-2 rounded hover:bg-gray-900">
              Angebot anfragen
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
