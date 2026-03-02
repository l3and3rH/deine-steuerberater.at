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
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>

        <section className="mb-12">
          <h2 className="text-lg font-semibold mb-4">Profile ({profiles.length})</h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Paket</th>
                  <th className="text-left px-4 py-3">Verifiziert</th>
                  <th className="text-left px-4 py-3">Erstellt</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{p.name}<br /><span className="text-gray-400">{p.email}</span></td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${p.paket === "GOLD" ? "bg-yellow-100 text-yellow-700" : p.paket === "SEO" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                        {p.paket}
                      </span>
                    </td>
                    <td className="px-4 py-3">{p.verified ? "✓" : "—"}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(p.createdAt).toLocaleDateString("de-AT")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">SEO-Anfragen ({seoAnfragen.length})</h2>
          <div className="flex flex-col gap-3">
            {seoAnfragen.map((a) => (
              <div key={a.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="font-medium">{a.kontaktEmail}</p>
                <p className="text-sm text-gray-600 mt-1">{a.nachricht}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(a.createdAt).toLocaleDateString("de-AT")}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
