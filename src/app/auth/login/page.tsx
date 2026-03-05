"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) { setError("Ungültige Anmeldedaten"); return; }
    router.push("/dashboard");
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-semibold text-forest-900 mb-2">Willkommen zurück</h1>
          <p className="text-forest-500 text-sm">Melden Sie sich in Ihrem Kanzlei-Dashboard an</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-forest-100 p-8 shadow-sm">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-forest-700 mb-1.5">E-Mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-forest-200 rounded-lg px-4 py-2.5 text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400 transition-shadow" required />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-forest-700 mb-1.5">Passwort</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-forest-200 rounded-lg px-4 py-2.5 text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400 transition-shadow" required />
          </div>
          <button type="submit" className="w-full bg-forest-900 text-cream-100 py-2.5 rounded-lg font-medium hover:bg-forest-700 transition-colors">
            Anmelden
          </button>
        </form>
        <p className="text-sm text-center mt-5 text-forest-500">
          Noch kein Konto?{" "}
          <Link href="/auth/register" className="text-forest-900 font-medium hover:underline">Kostenlos registrieren</Link>
        </p>
      </div>
    </main>
  );
}
