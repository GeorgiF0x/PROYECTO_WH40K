import { Sparkles } from 'lucide-react'

export default function CreatorsLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-void-900 via-void-950 to-void-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.15),transparent_60%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 mb-6">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300 font-medium">
                Creadores Verificados
              </span>
            </div>

            <div className="h-14 w-80 mx-auto bg-void-800 rounded-lg animate-pulse mb-4" />
            <div className="h-6 w-96 mx-auto bg-void-800 rounded animate-pulse mb-8" />
            <div className="h-12 w-52 mx-auto bg-purple-600/30 rounded-lg animate-pulse" />
          </div>
        </div>
      </section>

      {/* Content skeleton */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters skeleton */}
          <div className="h-12 bg-void-800 rounded-lg animate-pulse mb-8" />

          {/* Results count skeleton */}
          <div className="h-5 w-40 bg-void-800 rounded animate-pulse mb-6" />

          {/* Grid skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border bg-void-950/80 border-void-700/50 overflow-hidden animate-pulse"
              >
                <div className="p-4 pb-0">
                  <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-void-800" />
                </div>
                <div className="p-4 text-center">
                  <div className="h-5 w-24 mx-auto bg-void-800 rounded mb-2" />
                  <div className="h-4 w-16 mx-auto bg-void-800 rounded mb-3" />
                  <div className="h-5 w-20 mx-auto bg-void-800 rounded-full mb-3" />
                  <div className="flex justify-center gap-4">
                    <div className="h-4 w-10 bg-void-800 rounded" />
                    <div className="h-4 w-10 bg-void-800 rounded" />
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
