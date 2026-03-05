export default function ProfileLoading() {
  return (
    <main className="min-h-screen">
      {/* Breadcrumb skeleton */}
      <section className="bg-forest-900">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="h-4 w-48 bg-cream-100/10 rounded animate-pulse" />
        </div>
      </section>

      {/* Profile skeleton */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl border border-forest-100 p-8 md:p-10">
          <div className="flex flex-col sm:flex-row gap-6 mb-8">
            <div className="w-24 h-24 rounded-xl bg-forest-100 animate-pulse flex-shrink-0" />
            <div className="space-y-3 flex-1">
              <div className="h-7 w-64 bg-forest-100 rounded animate-pulse" />
              <div className="h-4 w-48 bg-forest-50 rounded animate-pulse" />
            </div>
          </div>

          <div className="mb-8 space-y-3">
            <div className="h-3 w-24 bg-forest-100 rounded animate-pulse" />
            <div className="h-4 w-full bg-forest-50 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-forest-50 rounded animate-pulse" />
          </div>

          <div className="mb-8 space-y-3">
            <div className="h-3 w-24 bg-forest-100 rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-8 w-24 bg-forest-50 rounded-lg animate-pulse" />
              <div className="h-8 w-28 bg-forest-50 rounded-lg animate-pulse" />
              <div className="h-8 w-20 bg-forest-50 rounded-lg animate-pulse" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="h-3 w-16 bg-forest-100 rounded animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="h-12 bg-forest-50 rounded-lg animate-pulse" />
              <div className="h-12 bg-forest-50 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
