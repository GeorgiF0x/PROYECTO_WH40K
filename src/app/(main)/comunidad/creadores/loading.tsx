import { Sparkles } from 'lucide-react'

export default function CreatorsLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="from-void-900 via-void-950 to-void-950 absolute inset-0 bg-gradient-to-b" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.15),transparent_60%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/20 px-4 py-1.5">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">Creadores Verificados</span>
            </div>

            <div className="bg-void-800 mx-auto mb-4 h-14 w-80 animate-pulse rounded-lg" />
            <div className="bg-void-800 mx-auto mb-8 h-6 w-96 animate-pulse rounded" />
            <div className="mx-auto h-12 w-52 animate-pulse rounded-lg bg-purple-600/30" />
          </div>
        </div>
      </section>

      {/* Content skeleton */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Filters skeleton */}
          <div className="bg-void-800 mb-8 h-12 animate-pulse rounded-lg" />

          {/* Results count skeleton */}
          <div className="bg-void-800 mb-6 h-5 w-40 animate-pulse rounded" />

          {/* Grid skeleton */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="bg-void-950/80 border-void-700/50 animate-pulse overflow-hidden rounded-lg border"
              >
                <div className="p-4 pb-0">
                  <div className="bg-void-800 mx-auto h-20 w-20 rounded-full sm:h-24 sm:w-24" />
                </div>
                <div className="p-4 text-center">
                  <div className="bg-void-800 mx-auto mb-2 h-5 w-24 rounded" />
                  <div className="bg-void-800 mx-auto mb-3 h-4 w-16 rounded" />
                  <div className="bg-void-800 mx-auto mb-3 h-5 w-20 rounded-full" />
                  <div className="flex justify-center gap-4">
                    <div className="bg-void-800 h-4 w-10 rounded" />
                    <div className="bg-void-800 h-4 w-10 rounded" />
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
