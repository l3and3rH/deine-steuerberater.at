import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Datenschutzerklärung von Steuerberater.at – Informationen zur Verarbeitung Ihrer Daten.",
};

export default function DatenschutzPage() {
  return (
    <main className="min-h-screen max-w-3xl mx-auto px-6 py-20">
      <h1 className="font-display text-3xl font-semibold text-forest-900 mb-8">Datenschutzerklärung</h1>
      <div className="space-y-8 text-forest-700 leading-relaxed">
        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mb-3">1. Datenschutz auf einen Blick</h2>
          <h3 className="font-semibold text-forest-800 mt-4 mb-2">Allgemeine Hinweise</h3>
          <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mb-3">2. Verantwortliche Stelle</h2>
          <p>[FIRMENNAME]<br />[STRASSE HAUSNUMMER]<br />[PLZ ORT]<br />Österreich</p>
          <p className="mt-2">Telefon: [TELEFONNUMMER]<br />E-Mail: [E-MAIL-ADRESSE]</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mb-3">3. Datenerfassung auf dieser Website</h2>
          <h3 className="font-semibold text-forest-800 mt-4 mb-2">Cookies</h3>
          <p>Unsere Website verwendet Cookies. Wir verwenden ausschließlich technisch notwendige Cookies für die Funktionalität der Website.</p>
          <h3 className="font-semibold text-forest-800 mt-4 mb-2">Server-Log-Dateien</h3>
          <p>Der Provider der Seiten erhebt und speichert automatisch Informationen in Server-Log-Dateien, die Ihr Browser automatisch übermittelt.</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mb-3">4. Registrierung und Nutzerkonto</h2>
          <p>Steuerberater können sich auf unserer Website registrieren. Die dabei eingegebenen Daten verwenden wir zur Bereitstellung des Nutzerkontos. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mb-3">5. Zahlungsabwicklung</h2>
          <p>Für die Zahlungsabwicklung nutzen wir Stripe. Weitere Informationen: <a href="https://stripe.com/at/privacy" target="_blank" rel="noopener noreferrer" className="text-forest-600 underline hover:text-forest-900">stripe.com/at/privacy</a>.</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mb-3">6. Ihre Rechte</h2>
          <p>Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung. Kontakt: [E-MAIL-ADRESSE].</p>
        </section>
      </div>
    </main>
  );
}
