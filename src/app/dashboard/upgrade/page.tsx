"use client";
import { useState } from "react";
import Link from "next/link";

const tiers = [
  {
    name: "Basic",
    price: "Gratis",
    period: "",
    features: ["Basisprofil", "Website-Link", "Listung in einer Stadt"],
    current: true,
  },
  {
    name: "Gold",
    price: "€79",
    period: "/Monat",
    recommended: true,
    features: [
      "Top-Platzierung",
      "Logo & Beschreibung",
      "10 Spezialgebiete",
      "Kontaktformular",
      "Bis zu 3 Städte",
      "Premium-Badge",
    ],
  },
  {
    name: "SEO & Sichtbarkeit",
    price: "ab €299",
    period: "/Monat",
    features: [
      "Alles aus Gold",
      "On-Page SEO",
      "Google Business",
      "Backlink-Aufbau",
      "Monatliches Reporting",
      "Persönlicher Ansprechpartner",
    ],
  },
];

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
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl font-semibold text-forest-900 mb-3">
            Wählen Sie Ihr Paket
          </h1>
          <p className="text-forest-500 max-w-md mx-auto">
            Steigern Sie Ihre Sichtbarkeit und erreichen Sie mehr potenzielle Mandanten.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div key={tier.name}
              className={`bg-white rounded-xl border p-7 relative flex flex-col ${
                tier.recommended
                  ? "border-gold-500/40 ring-2 ring-gold-500/20 shadow-lg shadow-gold-500/5"
                  : "border-forest-100"
              }`}
            >
              {tier.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 gold-shine text-xs text-forest-950 px-4 py-1 rounded-full font-semibold">
                  Empfohlen
                </span>
              )}
              <h2 className="font-display text-lg font-semibold text-forest-900 mb-1">{tier.name}</h2>
              <p className="mb-5">
                <span className="text-3xl font-display font-bold text-forest-900">{tier.price}</span>
                {tier.period && <span className="text-forest-500">{tier.period}</span>}
              </p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-forest-700">
                    <svg className="w-4 h-4 text-forest-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              {tier.current ? (
                <button disabled className="w-full bg-forest-50 text-forest-400 py-2.5 rounded-lg text-sm font-medium cursor-not-allowed">
                  Aktuelles Paket
                </button>
              ) : tier.recommended ? (
                <button onClick={handleGold} disabled={loading}
                  className="w-full bg-forest-900 text-cream-100 py-2.5 rounded-lg text-sm font-medium hover:bg-forest-700 transition-colors disabled:opacity-60"
                >
                  {loading ? "Wird geladen..." : "Gold wählen"}
                </button>
              ) : (
                <Link href="/kontakt-seo"
                  className="block w-full text-center bg-forest-50 text-forest-800 py-2.5 rounded-lg text-sm font-medium hover:bg-forest-100 transition-colors"
                >
                  Angebot anfragen
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
