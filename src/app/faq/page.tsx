import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Häufig gestellte Fragen (FAQ)",
  description: "Antworten auf häufig gestellte Fragen rund um das Steuerberater-Verzeichnis Österreich.",
};

const faqs = [
  {
    q: "Ist die Suche nach einem Steuerberater kostenlos?",
    a: "Ja, die Nutzung des Verzeichnisses ist für Klienten vollkommen kostenlos. Sie können unbegrenzt Steuerberater suchen, vergleichen und kontaktieren.",
  },
  {
    q: "Wie kann ich mich als Steuerberater eintragen?",
    a: "Klicken Sie auf 'Kostenlos eintragen' und erstellen Sie ein Konto. Die Basiseintragung ist kostenlos. Für erweiterte Funktionen stehen Premium-Pakete zur Verfügung.",
  },
  {
    q: "Was sind die Vorteile des Premium-Pakets?",
    a: "Mit dem Gold-Paket (€79/Monat) erhalten Sie eine bevorzugte Platzierung, ein Premium-Badge, eine ausführliche Beschreibung und bis zu 10 Spezialgebiet-Tags.",
  },
  {
    q: "Kann ich mein bestehendes Profil beanspruchen?",
    a: "Ja! Wenn Sie Ihr Profil bereits im Verzeichnis finden, können Sie es beanspruchen. Registrieren Sie sich und kontaktieren Sie uns zur Verifizierung.",
  },
  {
    q: "Wie werden die Steuerberater sortiert?",
    a: "Standardmäßig werden Premium-Berater zuerst angezeigt. Sie können die Sortierung auch nach Name, Bewertung oder Datum ändern.",
  },
  {
    q: "Kann ich Bewertungen für einen Steuerberater abgeben?",
    a: "Ja, auf der Profilseite jedes Steuerberaters können Sie eine Bewertung mit Sternen und einem optionalen Kommentar hinterlassen.",
  },
  {
    q: "In welchen Städten sind Steuerberater gelistet?",
    a: "Unser Verzeichnis deckt alle größeren Städte in allen 9 Bundesländern Österreichs ab. Die vollständige Liste finden Sie auf der Startseite.",
  },
  {
    q: "Wie kann ich mein Profil bearbeiten?",
    a: "Melden Sie sich in Ihrem Dashboard an. Dort können Sie Ihre Kontaktdaten, Beschreibung und Spezialgebiete jederzeit aktualisieren.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export default function FAQPage() {
  return (
    <main className="min-h-screen max-w-3xl mx-auto px-6 py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <h1 className="font-display text-3xl font-semibold text-forest-900 mb-3">Häufig gestellte Fragen</h1>
      <p className="text-forest-600 mb-10">Hier finden Sie Antworten auf die wichtigsten Fragen.</p>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details key={i} className="group bg-white border border-forest-100 rounded-xl">
            <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-forest-900 font-medium text-sm hover:bg-forest-50 rounded-xl transition-colors">
              {faq.q}
              <svg className="w-5 h-5 text-forest-400 flex-shrink-0 ml-4 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </summary>
            <div className="px-6 pb-4 text-sm text-forest-600 leading-relaxed">{faq.a}</div>
          </details>
        ))}
      </div>
    </main>
  );
}
