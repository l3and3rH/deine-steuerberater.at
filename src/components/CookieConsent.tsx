"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[9998] p-4">
      <div className="max-w-3xl mx-auto bg-forest-900 text-cream-100 rounded-xl shadow-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-cream-300 flex-1">
          Wir verwenden Cookies, um die Funktionalität unserer Website zu gewährleisten.
          Mehr dazu in unserer{" "}
          <Link href="/datenschutz" className="text-gold-400 underline hover:text-gold-300">
            Datenschutzerklärung
          </Link>.
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={decline}
            className="text-sm text-cream-400 hover:text-cream-100 px-4 py-2 transition-colors"
          >
            Ablehnen
          </button>
          <button
            onClick={accept}
            className="text-sm font-semibold bg-gold-500 hover:bg-gold-600 text-forest-950 px-5 py-2 rounded-lg transition-colors"
          >
            Akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
}
