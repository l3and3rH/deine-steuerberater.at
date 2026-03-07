"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import NavbarSearch from "./NavbarSearch";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-cream-100/80 backdrop-blur-md border-b border-forest-200/40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-forest-900 flex items-center justify-center group-hover:bg-forest-700 transition-colors">
            <span className="text-cream-100 font-display font-semibold text-sm">S</span>
          </div>
          <span className="font-display font-semibold text-forest-900 text-lg tracking-tight hidden sm:block">
            Steuerberater<span className="text-gold-500">.</span>at
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm text-forest-700 hover:text-forest-900 transition-colors">
            Verzeichnis
          </Link>
          <Link href="/faq" className="text-sm text-forest-700 hover:text-forest-900 transition-colors">
            FAQ
          </Link>
          <NavbarSearch />
          {session ? (
            <Link
              href="/dashboard"
              className="text-sm font-medium bg-forest-900 text-cream-100 px-4 py-2 rounded-lg hover:bg-forest-700 transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm font-medium bg-forest-900 text-cream-100 px-4 py-2 rounded-lg hover:bg-forest-700 transition-colors"
            >
              Für Steuerberater
            </Link>
          )}
        </div>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 -mr-2 text-forest-700 hover:text-forest-900 transition-colors"
          aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-forest-200/40 bg-cream-100/95 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-3">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="text-sm text-forest-700 hover:text-forest-900 transition-colors py-2"
            >
              Verzeichnis
            </Link>
            <Link
              href="/faq"
              onClick={() => setMenuOpen(false)}
              className="text-sm text-forest-700 hover:text-forest-900 transition-colors py-2"
            >
              FAQ
            </Link>
            {session ? (
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium bg-forest-900 text-cream-100 px-4 py-2.5 rounded-lg hover:bg-forest-700 transition-colors text-center"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium bg-forest-900 text-cream-100 px-4 py-2.5 rounded-lg hover:bg-forest-700 transition-colors text-center"
              >
                Für Steuerberater
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
