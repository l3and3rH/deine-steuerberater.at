import { prisma } from "@/lib/prisma";
import CitySearch from "@/components/CitySearch";

export const revalidate = 3600;

export default async function HomePage() {
  const staedte = await prisma.stadt.findMany({
    orderBy: { name: "asc" },
    select: { name: true, slug: true, bundesland: true },
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">
          Steuerberater in Österreich finden
        </h1>
        <p className="text-center text-gray-500 mb-10">
          Vergleichen Sie Steuerberater in Ihrer Stadt und nehmen Sie direkt Kontakt auf.
        </p>
        <CitySearch staedte={staedte} />
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Alle Städte</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {staedte.map((s) => (
              <a
                key={s.slug}
                href={`/steuerberater/${s.slug}`}
                className="px-3 py-2 bg-white border border-gray-200 rounded hover:border-blue-400 hover:text-blue-600 text-sm"
              >
                {s.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
