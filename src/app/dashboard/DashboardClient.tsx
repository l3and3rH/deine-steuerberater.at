"use client";
import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

const BERUFSBEZEICHNUNG_OPTIONS = [
  { value: "STEUERBERATER", label: "Steuerberater" },
  { value: "WIRTSCHAFTSPRUEFER", label: "Wirtschaftsprüfer" },
  { value: "BEIDES", label: "Steuerberater & Wirtschaftsprüfer" },
  { value: "BUCHHALTER", label: "Buchhalter" },
  { value: "BILANZBUCHHALTER", label: "Bilanzbuchhalter" },
];

const MANDANTENGRUPPEN_OPTIONS = [
  "Privatpersonen",
  "KMU",
  "Konzerne",
  "Start-ups",
  "Freiberufler",
  "Vereine",
  "Landwirtschaft",
];

const inputClass =
  "w-full border border-forest-200 rounded-lg px-4 py-2.5 text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400 transition-shadow";

export default function DashboardClient({ profile }: { profile: any }) {
  const [beschreibung, setBeschreibung] = useState(profile.beschreibung ?? "");
  const [telefon, setTelefon] = useState(profile.telefon ?? "");
  const [website, setWebsite] = useState(profile.website ?? "");
  const [tags, setTags] = useState((profile.tags ?? []).join(", "));

  // New fields
  const [berufsbezeichnung, setBerufsbezeichnung] = useState(
    profile.berufsbezeichnung ?? "STEUERBERATER"
  );
  const [kanzleiname, setKanzleiname] = useState(profile.kanzleiname ?? "");
  const [bezirk, setBezirk] = useState(profile.bezirk ?? "");
  const [kswMitglied, setKswMitglied] = useState(profile.kswMitglied ?? false);
  const [kswMitgliedsnummer, setKswMitgliedsnummer] = useState(
    profile.kswMitgliedsnummer ?? ""
  );
  const [zulassungsjahr, setZulassungsjahr] = useState(
    profile.zulassungsjahr?.toString() ?? ""
  );
  const [ausbildung, setAusbildung] = useState(profile.ausbildung ?? "");
  const [auszeichnungen, setAuszeichnungen] = useState(
    (profile.auszeichnungen ?? []).join(", ")
  );
  const [mitgliedschaften, setMitgliedschaften] = useState(
    (profile.mitgliedschaften ?? []).join(", ")
  );
  const [mandantengruppen, setMandantengruppen] = useState<string[]>(
    profile.mandantengruppen ?? []
  );
  const [gratisErstgespraech, setGratisErstgespraech] = useState(
    profile.gratisErstgespraech ?? false
  );
  const [onlineBeratung, setOnlineBeratung] = useState(
    profile.onlineBeratung ?? false
  );
  const [schnellantwort, setSchnellantwort] = useState(
    profile.schnellantwort ?? false
  );
  const [abendtermine, setAbendtermine] = useState(profile.abendtermine ?? false);
  const [videoUrl, setVideoUrl] = useState(profile.videoUrl ?? "");

  const [saved, setSaved] = useState(false);

  const toggleMandantengruppe = (val: string) => {
    setMandantengruppen((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const body: Record<string, unknown> = {
      beschreibung,
      telefon,
      website,
      tags: tags.split(",").map((t: string) => t.trim()).filter(Boolean),
      berufsbezeichnung,
      kanzleiname,
      bezirk,
      kswMitglied,
      kswMitgliedsnummer: kswMitglied ? kswMitgliedsnummer : "",
      zulassungsjahr: zulassungsjahr ? parseInt(zulassungsjahr, 10) : null,
      ausbildung,
      auszeichnungen: auszeichnungen.split(",").map((t: string) => t.trim()).filter(Boolean),
      mitgliedschaften: mitgliedschaften.split(",").map((t: string) => t.trim()).filter(Boolean),
      mandantengruppen,
      gratisErstgespraech,
      onlineBeratung,
      schnellantwort,
      abendtermine,
    };
    if (profile.paket === "SEO") {
      body.videoUrl = videoUrl;
    }
    await fetch("/api/dashboard/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-semibold text-forest-900 mb-1">Dashboard</h1>
            <p className="text-sm text-forest-500">
              Paket:{" "}
              <span className={`font-semibold ${
                profile.paket === "GOLD" ? "text-gold-600" :
                profile.paket === "SEO" ? "text-purple-600" :
                "text-forest-600"
              }`}>{profile.paket}</span>
              {profile.paketAktivBis && (
                <span className="text-forest-400">
                  {" "}· Aktiv bis {new Date(profile.paketAktivBis).toLocaleDateString("de-AT")}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-forest-500 hover:text-forest-900 transition-colors"
          >
            Abmelden
          </button>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-xl border border-forest-100 p-8 shadow-sm space-y-6">

          {/* === Basis-Informationen === */}
          <div>
            <h2 className="font-display font-semibold text-forest-900 mb-4 pb-2 border-b border-forest-100">
              Basis-Informationen
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1.5">Berufsbezeichnung</label>
                <select
                  value={berufsbezeichnung}
                  onChange={(e) => setBerufsbezeichnung(e.target.value)}
                  className={inputClass}
                >
                  {BERUFSBEZEICHNUNG_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1.5">Kanzleiname</label>
                <input
                  type="text"
                  value={kanzleiname}
                  onChange={(e) => setKanzleiname(e.target.value)}
                  placeholder="z.B. Kanzlei Müller & Partner"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1.5">Bezirk</label>
                <input
                  type="text"
                  value={bezirk}
                  onChange={(e) => setBezirk(e.target.value)}
                  placeholder="z.B. 1010 Wien Innere Stadt"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1.5">Telefon</label>
                <input type="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1.5">Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* === KSW-Mitgliedschaft === */}
          <div>
            <h2 className="font-display font-semibold text-forest-900 mb-4 pb-2 border-b border-forest-100">
              KSW-Mitgliedschaft
            </h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={kswMitglied}
                  onChange={(e) => setKswMitglied(e.target.checked)}
                  className="w-4 h-4 rounded border-forest-300 accent-forest-900"
                />
                <span className="text-sm font-medium text-forest-700">KSW-Mitglied</span>
              </label>
              {kswMitglied && (
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1.5">KSW-Mitgliedsnummer</label>
                  <input
                    type="text"
                    value={kswMitgliedsnummer}
                    onChange={(e) => setKswMitgliedsnummer(e.target.value)}
                    className={inputClass}
                  />
                </div>
              )}
            </div>
          </div>

          {/* === Qualifikation === */}
          <div>
            <h2 className="font-display font-semibold text-forest-900 mb-4 pb-2 border-b border-forest-100">
              Qualifikation
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1.5">Zulassungsjahr</label>
                <input
                  type="number"
                  value={zulassungsjahr}
                  onChange={(e) => setZulassungsjahr(e.target.value)}
                  placeholder="z.B. 2005"
                  min="1950"
                  max={new Date().getFullYear()}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1.5">Ausbildung</label>
                <textarea
                  value={ausbildung}
                  onChange={(e) => setAusbildung(e.target.value)}
                  rows={3}
                  placeholder="z.B. Studium der Betriebswirtschaft, Universität Wien"
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1.5">
                  Auszeichnungen
                  <span className="font-normal text-forest-400 ml-1">(kommagetrennt)</span>
                </label>
                <input
                  type="text"
                  value={auszeichnungen}
                  onChange={(e) => setAuszeichnungen(e.target.value)}
                  placeholder="z.B. Steuerberater des Jahres 2022"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1.5">
                  Mitgliedschaften
                  <span className="font-normal text-forest-400 ml-1">(kommagetrennt)</span>
                </label>
                <input
                  type="text"
                  value={mitgliedschaften}
                  onChange={(e) => setMitgliedschaften(e.target.value)}
                  placeholder="z.B. Wirtschaftskammer Österreich, KSW"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* === Mandantengruppen === */}
          <div>
            <h2 className="font-display font-semibold text-forest-900 mb-4 pb-2 border-b border-forest-100">
              Mandantengruppen
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {MANDANTENGRUPPEN_OPTIONS.map((mg) => (
                <label key={mg} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mandantengruppen.includes(mg)}
                    onChange={() => toggleMandantengruppe(mg)}
                    className="w-4 h-4 rounded border-forest-300 accent-forest-900"
                  />
                  <span className="text-sm text-forest-700">{mg}</span>
                </label>
              ))}
            </div>
          </div>

          {/* === Serviceangebote === */}
          <div>
            <h2 className="font-display font-semibold text-forest-900 mb-4 pb-2 border-b border-forest-100">
              Serviceangebote
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "gratisErstgespraech", label: "Gratis Erstgespräch", state: gratisErstgespraech, set: setGratisErstgespraech },
                { key: "onlineBeratung", label: "Online-Beratung", state: onlineBeratung, set: setOnlineBeratung },
                { key: "schnellantwort", label: "Schnellantwort", state: schnellantwort, set: setSchnellantwort },
                { key: "abendtermine", label: "Abendtermine", state: abendtermine, set: setAbendtermine },
              ].map(({ key, label, state, set }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state}
                    onChange={(e) => set(e.target.checked)}
                    className="w-4 h-4 rounded border-forest-300 accent-forest-900"
                  />
                  <span className="text-sm text-forest-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* === Premium-Felder === */}
          {profile.paket !== "BASIC" && (
            <div>
              <h2 className="font-display font-semibold text-forest-900 mb-4 pb-2 border-b border-forest-100">
                Profil-Inhalte
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1.5">
                    Beschreibung
                    <span className="font-normal text-forest-400 ml-1">(max 500 Zeichen)</span>
                  </label>
                  <textarea
                    value={beschreibung}
                    onChange={(e) => setBeschreibung(e.target.value)}
                    maxLength={500}
                    rows={4}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1.5">
                    Spezialgebiete
                    <span className="font-normal text-forest-400 ml-1">(kommagetrennt, max 10)</span>
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="z.B. Einkommensteuer, GmbH-Gründung"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* === SEO-Only: Video URL === */}
          {profile.paket === "SEO" && (
            <div>
              <h2 className="font-display font-semibold text-forest-900 mb-4 pb-2 border-b border-forest-100">
                Video-Profil
                <span className="ml-2 text-xs text-purple-600 font-normal">SEO</span>
              </h2>
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1.5">Video-URL</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className={inputClass}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className={`w-full px-6 py-2.5 rounded-lg font-medium transition-all ${
              saved
                ? "bg-forest-100 text-forest-600"
                : "bg-forest-900 text-cream-100 hover:bg-forest-700"
            }`}
          >
            {saved ? "Gespeichert ✓" : "Änderungen speichern"}
          </button>
        </form>

        {profile.paket === "BASIC" && (
          <div className="mt-8 bg-gradient-to-br from-forest-900 to-forest-800 rounded-xl p-8 text-cream-100">
            <h2 className="font-display text-xl font-semibold mb-2">Mehr Sichtbarkeit mit Gold</h2>
            <p className="text-cream-300 text-sm mb-5">
              Logo, Beschreibung, Spezialgebiete und Top-Platzierung in den Suchergebnissen.
            </p>
            <Link
              href="/dashboard/upgrade"
              className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-forest-950 font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
            >
              Jetzt upgraden
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
