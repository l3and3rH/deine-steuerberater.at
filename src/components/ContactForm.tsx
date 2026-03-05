"use client";
import { useState } from "react";
import Link from "next/link";

interface Props {
  profileId: string;
  profileName: string;
}

export default function ContactForm({ profileId, profileName }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [datenschutz, setDatenschutz] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, name, email, message, datenschutz }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        setError("Fehler beim Senden. Bitte versuchen Sie es erneut.");
      }
    } catch {
      setError("Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-forest-50 rounded-xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-forest-100 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-forest-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <p className="font-medium text-forest-800">Nachricht gesendet!</p>
        <p className="text-sm text-forest-500 mt-1">Ihre Nachricht an {profileName} wurde erfolgreich übermittelt.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="contact-name" className="text-sm font-medium text-forest-700 mb-1 block">Ihr Name</label>
        <input id="contact-name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
          className="w-full border border-forest-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
      </div>
      <div>
        <label htmlFor="contact-email" className="text-sm font-medium text-forest-700 mb-1 block">Ihre E-Mail</label>
        <input id="contact-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-forest-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
      </div>
      <div>
        <label htmlFor="contact-message" className="text-sm font-medium text-forest-700 mb-1 block">Ihre Nachricht</label>
        <textarea id="contact-message" required rows={4} minLength={10} value={message} onChange={(e) => setMessage(e.target.value)}
          className="w-full border border-forest-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50"
          placeholder={`Schreiben Sie eine Nachricht an ${profileName}...`} />
      </div>
      <label className="flex items-start gap-2 text-sm text-forest-600">
        <input type="checkbox" required checked={datenschutz} onChange={(e) => setDatenschutz(e.target.checked)}
          className="mt-1 rounded border-forest-300" />
        <span>Ich stimme der <Link href="/datenschutz" className="underline hover:text-forest-900">Datenschutzerklärung</Link> zu.</span>
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={submitting}
        className="w-full text-sm font-semibold bg-forest-900 text-cream-100 px-5 py-2.5 rounded-lg hover:bg-forest-700 transition-colors disabled:opacity-50">
        {submitting ? "Wird gesendet..." : "Nachricht senden"}
      </button>
    </form>
  );
}
