import Link from "next/link";
import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  return (
    <footer aria-label="Fußbereich" className="bg-forest-900 text-cream-300 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-md bg-cream-100 flex items-center justify-center">
                <span className="text-forest-900 font-display font-semibold text-xs">S</span>
              </div>
              <span className="font-display font-semibold text-cream-100 text-base">
                Steuerberater<span className="text-gold-400">.</span>at
              </span>
            </div>
            <p className="text-sm text-cream-400 leading-relaxed max-w-xs">
              Das führende Verzeichnis für Steuerberater in Österreich.
              Finden Sie den passenden Experten in Ihrer Stadt.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-cream-400 mb-4">
              Für Klienten
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-sm text-cream-300 hover:text-cream-100 transition-colors">
                  Steuerberater finden
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-cream-300 hover:text-cream-100 transition-colors">
                  Häufige Fragen
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-cream-400 mb-4">
              Für Steuerberater
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/auth/register" className="text-sm text-cream-300 hover:text-cream-100 transition-colors">
                  Kostenlos eintragen
                </Link>
              </li>
              <li>
                <Link href="/dashboard/upgrade" className="text-sm text-cream-300 hover:text-cream-100 transition-colors">
                  Premium-Pakete
                </Link>
              </li>
              <li>
                <Link href="/kontakt-seo" className="text-sm text-cream-300 hover:text-cream-100 transition-colors">
                  SEO-Paket anfragen
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-cream-400 mb-4">
              Rechtliches
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/impressum" className="text-sm text-cream-300 hover:text-cream-100 transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="text-sm text-cream-300 hover:text-cream-100 transition-colors">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link href="/agb" className="text-sm text-cream-300 hover:text-cream-100 transition-colors">
                  AGB
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="pt-8 mb-8 border-t border-forest-700/50">
          <div className="max-w-md">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-cream-400 mb-2">
              Newsletter
            </h4>
            <p className="text-sm text-cream-400 mb-3">
              Erhalten Sie Updates zu neuen Steuerberatern und Tipps.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="pt-8 border-t border-forest-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cream-400">
            © {new Date().getFullYear()} Steuerberater.at — Alle Rechte vorbehalten.
          </p>
          <p className="text-xs text-cream-400">
            Made in Austria
          </p>
        </div>
      </div>
    </footer>
  );
}
