"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) { const d = await res.json(); setError(d.error); return; }
    router.push("/auth/login?registered=1");
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-semibold text-forest-900 mb-2">Kanzlei eintragen</h1>
          <p className="text-forest-500 text-sm">Erstellen Sie Ihr kostenloses Profil im Verzeichnis</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-forest-100 p-8 shadow-sm">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-forest-700 mb-1.5">Kanzleiname</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full border border-forest-200 rounded-lg px-4 py-2.5 text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400 transition-shadow"
              required placeholder="z.B. Steuerberatung Müller" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-forest-700 mb-1.5">E-Mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-forest-200 rounded-lg px-4 py-2.5 text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400 transition-shadow" required />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-forest-700 mb-1.5">Passwort</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-forest-200 rounded-lg px-4 py-2.5 text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400 transition-shadow"
              required minLength={8} placeholder="Mindestens 8 Zeichen" />
          </div>
          <button type="submit" className="w-full bg-forest-900 text-cream-100 py-2.5 rounded-lg font-medium hover:bg-forest-700 transition-colors">
            Kostenlos registrieren
          </button>
        </form>
        <p className="text-sm text-center mt-5 text-forest-500">
          Bereits registriert?{" "}
          <Link href="/auth/login" className="text-forest-900 font-medium hover:underline">Anmelden</Link>
        </p>
      </div>
    </main>
  );
}
