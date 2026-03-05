"use client";
import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    if (res.ok) {
      setStatus("success");
      setMessage(data.message || "Erfolgreich angemeldet!");
      setEmail("");
    } else {
      setStatus("error");
      setMessage(data.error || "Fehler beim Anmelden.");
    }
  };

  if (status === "success") {
    return (
      <p className="text-sm text-gold-400 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        {message}
      </p>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ihre E-Mail..."
          aria-label="E-Mail für Newsletter"
          className="flex-1 text-sm bg-forest-800 border border-forest-700 rounded-lg px-3 py-2 text-cream-100 placeholder:text-cream-500 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="text-sm font-medium bg-gold-500 hover:bg-gold-600 text-forest-950 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {status === "loading" ? "..." : "Anmelden"}
        </button>
      </form>
      {status === "error" && (
        <p className="text-xs text-red-400 mt-2">{message}</p>
      )}
    </div>
  );
}
