"use client";
import { useState } from "react";

export default function KontaktSEOPage() {
  const [email, setEmail] = useState("");
  const [nachricht, setNachricht] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/seo-anfrage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kontaktEmail: email, nachricht }),
    });
    setSent(true);
  }

  if (sent) return (
    <main className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="text-center animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-forest-100 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-forest-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-semibold text-forest-900 mb-2">Vielen Dank!</h1>
        <p className="text-forest-500">Wir melden uns innerhalb von 24 Stunden bei Ihnen.</p>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen">
      <div className="max-w-xl mx-auto px-6 py-16">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-forest-900 mb-2">
            SEO & Sichtbarkeit
          </h1>
          <p className="text-forest-500">
            Ab €299/Monat. Individuelles Angebot nach kostenlosem Erstgespräch.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-forest-100 p-8 shadow-sm space-y-5">
          <div>
            <label className="block text-sm font-medium text-forest-700 mb-1.5">E-Mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-forest-200 rounded-lg px-4 py-2.5 text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400 transition-shadow"
              required placeholder="ihre@email.at" />
          </div>
          <div>
            <label className="block text-sm font-medium text-forest-700 mb-1.5">Nachricht</label>
            <textarea value={nachricht} onChange={(e) => setNachricht(e.target.value)} rows={5}
              className="w-full border border-forest-200 rounded-lg px-4 py-2.5 text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400 transition-shadow resize-none"
              required minLength={10}
              placeholder="Beschreiben Sie kurz Ihre aktuelle Situation und Ziele..." />
          </div>
          <button type="submit"
            className="w-full bg-forest-900 text-cream-100 py-2.5 rounded-lg font-medium hover:bg-forest-700 transition-colors"
          >
            Angebot anfragen
          </button>
        </form>
      </div>
    </main>
  );
}
