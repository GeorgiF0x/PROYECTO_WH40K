export default function GaleriaLoading() {
  return (
    <div className="min-h-screen pb-16 pt-24">
      {/* Hero Skeleton */}
      <section className="relative px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse text-center">
            <div className="mb-6 inline-block h-8 w-48 rounded-full bg-void-light" />
            <div className="mx-auto mb-4 h-16 w-96 rounded-lg bg-void-light" />
            <div className="mx-auto h-6 w-[500px] max-w-full rounded bg-void-light" />
          </div>
        </div>
      </section>

      {/* Filters Skeleton */}
      <section className="relative mb-8 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse rounded-2xl border border-bone/10 bg-void-light/50 p-4 backdrop-blur-xl md:p-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="h-12 flex-1 rounded-xl bg-void" />
              <div className="flex gap-2">
                <div className="h-12 w-24 rounded-xl bg-void" />
                <div className="h-12 w-24 rounded-xl bg-void" />
                <div className="h-12 w-24 rounded-xl bg-void" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Skeleton */}
      <section className="px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 h-6 w-48 animate-pulse rounded bg-void-light" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-xl bg-void-light">
                <div className="aspect-square bg-void" />
                <div className="space-y-3 p-4">
                  <div className="h-5 w-3/4 rounded bg-void" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-void" />
                      <div className="h-4 w-20 rounded bg-void" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-4 w-12 rounded bg-void" />
                      <div className="h-4 w-12 rounded bg-void" />
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
