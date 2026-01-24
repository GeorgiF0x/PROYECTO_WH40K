export default function MercadoLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero Skeleton */}
      <section className="relative px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-pulse">
            <div className="inline-block w-48 h-8 bg-void-light rounded-full mb-6" />
            <div className="h-16 w-80 bg-void-light rounded-lg mx-auto mb-4" />
            <div className="h-6 w-96 bg-void-light rounded mx-auto" />
          </div>
        </div>
      </section>

      {/* Filters Skeleton */}
      <section className="relative px-6 -mt-8 z-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-void-light/50 backdrop-blur-xl rounded-2xl border border-bone/10 p-4 md:p-6 animate-pulse">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 h-12 bg-void rounded-xl" />
              <div className="flex gap-2">
                <div className="w-24 h-12 bg-void rounded-xl" />
                <div className="w-24 h-12 bg-void rounded-xl" />
                <div className="w-24 h-12 bg-void rounded-xl" />
              </div>
              <div className="w-32 h-12 bg-void rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Grid Skeleton */}
      <section className="px-6 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="h-6 w-40 bg-void-light rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-void-light rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-void" />
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-void rounded w-3/4" />
                  <div className="h-4 bg-void rounded w-full" />
                  <div className="h-4 bg-void rounded w-1/2" />
                  <div className="pt-4 border-t border-bone/10 flex justify-between">
                    <div className="h-8 w-20 bg-void rounded" />
                    <div className="h-8 w-16 bg-void rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
