import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum von Steuerberater.at – Angaben gemäß § 5 ECG.",
};

export default function ImpressumPage() {
  return (
    <main className="min-h-screen max-w-3xl mx-auto px-6 py-20">
      <h1 className="font-display text-3xl font-semibold text-forest-900 mb-8">Impressum</h1>
      <div className="space-y-6 text-forest-700">
        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mt-8 mb-3">Angaben gemäß § 5 ECG</h2>
          <p>[FIRMENNAME]<br />[STRASSE HAUSNUMMER]<br />[PLZ ORT]<br />Österreich</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mt-8 mb-3">Kontakt</h2>
          <p>Telefon: [TELEFONNUMMER]<br />E-Mail: [E-MAIL-ADRESSE]</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mt-8 mb-3">Umsatzsteuer-ID</h2>
          <p>Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG: [UST-ID]</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mt-8 mb-3">Verantwortlich für den Inhalt</h2>
          <p>[NAME DES VERANTWORTLICHEN]<br />[ADRESSE]</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mt-8 mb-3">Streitschlichtung</h2>
          <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
            <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-forest-600 underline hover:text-forest-900">https://ec.europa.eu/consumers/odr/</a>.
          </p>
          <p className="mt-2">Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
        </section>
      </div>
    </main>
  );
}
