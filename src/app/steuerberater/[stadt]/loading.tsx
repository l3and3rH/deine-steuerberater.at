export default function StadtLoading() {
  return (
    <main className="min-h-screen">
      {/* Header skeleton */}
      <section className="bg-forest-900">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="h-4 w-32 bg-cream-100/10 rounded mb-6 animate-pulse" />
          <div className="h-10 w-80 bg-cream-100/10 rounded mb-3 animate-pulse" />
          <div className="h-5 w-64 bg-cream-100/10 rounded animate-pulse" />
          <div className="mt-6 flex gap-3">
            <div className="h-8 w-32 bg-cream-100/10 rounded-full animate-pulse" />
            <div className="h-8 w-24 bg-cream-100/10 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Listings skeleton */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-5 w-20 bg-forest-100 rounded animate-pulse" />
          <div className="h-8 w-40 bg-forest-100 rounded-lg animate-pulse" />
        </div>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-forest-100 p-6 flex gap-5">
              <div className="w-[72px] h-[72px] rounded-lg bg-forest-100 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-48 bg-forest-100 rounded animate-pulse" />
                <div className="h-4 w-64 bg-forest-50 rounded animate-pulse" />
                <div className="h-4 w-full bg-forest-50 rounded animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-forest-50 rounded-md animate-pulse" />
                  <div className="h-6 w-20 bg-forest-50 rounded-md animate-pulse" />
                  <div className="h-6 w-14 bg-forest-50 rounded-md animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
