export default function GaleriaLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero Skeleton */}
      <section className="relative px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-pulse">
            <div className="inline-block w-48 h-8 bg-void-light rounded-full mb-6" />
            <div className="h-16 w-96 bg-void-light rounded-lg mx-auto mb-4" />
            <div className="h-6 w-[500px] max-w-full bg-void-light rounded mx-auto" />
          </div>
        </div>
      </section>

      {/* Filters Skeleton */}
      <section className="relative px-6 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-void-light/50 backdrop-blur-xl rounded-2xl border border-bone/10 p-4 md:p-6 animate-pulse">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 h-12 bg-void rounded-xl" />
              <div className="flex gap-2">
                <div className="w-24 h-12 bg-void rounded-xl" />
                <div className="w-24 h-12 bg-void rounded-xl" />
                <div className="w-24 h-12 bg-void rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Skeleton */}
      <section className="px-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-6 w-48 bg-void-light rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-void-light rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-void" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-void rounded w-3/4" />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-void rounded-full" />
                      <div className="h-4 w-20 bg-void rounded" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-4 w-12 bg-void rounded" />
                      <div className="h-4 w-12 bg-void rounded" />
                    </div>
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
