import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") redirect("/");

  const profiles = await prisma.steuerberaterProfile.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, paket: true, verified: true, createdAt: true, email: true },
  });

  const seoAnfragen = await prisma.sEOAnfrage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="font-display text-2xl font-semibold text-forest-900 mb-8">Admin Panel</h1>

        <section className="mb-12">
          <h2 className="font-display text-lg font-semibold text-forest-800 mb-4 flex items-center gap-2">
            Profile
            <span className="text-sm font-body font-normal text-forest-500 bg-forest-50 px-2.5 py-0.5 rounded-full">
              {profiles.length}
            </span>
          </h2>
          <div className="bg-white rounded-xl border border-forest-100 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-forest-50/50">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-forest-500">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-forest-500">Paket</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-forest-500">Verifiziert</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-forest-500">Erstellt</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} className="border-t border-forest-50 hover:bg-forest-50/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-forest-900">{p.name}</span>
                      <br />
                      <span className="text-forest-400 text-xs">{p.email}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        p.paket === "GOLD"
                          ? "bg-gold-300/30 text-gold-700"
                          : p.paket === "SEO"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-forest-50 text-forest-500"
                      }`}>
                        {p.paket}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {p.verified ? (
                        <span className="text-forest-600 font-medium">Ja</span>
                      ) : (
                        <span className="text-forest-300">Nein</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-forest-400 text-xs">
                      {new Date(p.createdAt).toLocaleDateString("de-AT")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-forest-800 mb-4 flex items-center gap-2">
            SEO-Anfragen
            <span className="text-sm font-body font-normal text-forest-500 bg-forest-50 px-2.5 py-0.5 rounded-full">
              {seoAnfragen.length}
            </span>
          </h2>
          <div className="flex flex-col gap-3">
            {seoAnfragen.map((a) => (
              <div key={a.id} className="bg-white rounded-xl border border-forest-100 p-5 shadow-sm">
                <p className="font-medium text-forest-900">{a.kontaktEmail}</p>
                <p className="text-sm text-forest-600 mt-1 leading-relaxed">{a.nachricht}</p>
                <p className="text-xs text-forest-400 mt-2">{new Date(a.createdAt).toLocaleDateString("de-AT")}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
