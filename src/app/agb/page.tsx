import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen",
  description: "AGB von Steuerberater.at – Nutzungsbedingungen für unser Steuerberater-Verzeichnis.",
};

export default function AGBPage() {
  return (
    <main className="min-h-screen max-w-3xl mx-auto px-6 py-20">
      <h1 className="font-display text-3xl font-semibold text-forest-900 mb-8">Allgemeine Geschäftsbedingungen</h1>
      <div className="space-y-8 text-forest-700 leading-relaxed">
        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mb-3">1. Geltungsbereich</h2>
          <p>Diese AGB gelten für die Nutzung der Website steuerberater-verzeichnis.at. Betreiber: [FIRMENNAME], [ADRESSE].</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mb-3">2. Leistungsbeschreibung</h2>
          <p>Die Plattform bietet ein Verzeichnis von Steuerberatern in Österreich. Die Basiseintragung ist kostenlos. Premium-Pakete bieten erweiterte Funktionen gegen Gebühr.</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mb-3">3. Registrierung</h2>
          <p>Die Nutzung bestimmter Dienste setzt eine Registrierung voraus. Der Nutzer ist verpflichtet, wahrheitsgemäße Angaben zu machen.</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mb-3">4. Premium-Pakete und Zahlungen</h2>
          <p>Premium-Pakete werden als monatliche Abonnements angeboten. Die Abrechnung erfolgt über Stripe. Kündigungen sind jederzeit zum Ende der Laufzeit möglich.</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mb-3">5. Haftungsausschluss</h2>
          <p>Wir übernehmen keine Gewähr für die Richtigkeit der eingetragenen Profile. Die Verantwortung liegt beim jeweiligen Steuerberater.</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-forest-900 mb-3">6. Schlussbestimmungen</h2>
          <p>Es gilt österreichisches Recht. Gerichtsstand ist [ORT].</p>
        </section>
      </div>
    </main>
  );
}
