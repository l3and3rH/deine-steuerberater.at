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
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Vielen Dank!</h1>
        <p className="text-gray-600">Wir melden uns innerhalb von 24 Stunden bei Ihnen.</p>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-2">SEO & Sichtbarkeit — Angebot anfragen</h1>
        <p className="text-gray-600 mb-8">Ab €299/Monat. Individuelles Angebot nach kostenlosem Erstgespräch.</p>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col gap-4">
          <input type="email" placeholder="Ihre E-Mail" value={email} onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2" required />
          <textarea placeholder="Beschreiben Sie kurz Ihre aktuelle Situation und Ziele..." value={nachricht}
            onChange={(e) => setNachricht(e.target.value)} rows={5}
            className="border border-gray-300 rounded px-3 py-2" required minLength={10} />
          <button type="submit" className="bg-gray-800 text-white py-2 rounded hover:bg-gray-900">
            Angebot anfragen
          </button>
        </form>
      </div>
    </main>
  );
}
