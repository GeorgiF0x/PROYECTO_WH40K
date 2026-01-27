import { MapPin } from 'lucide-react'

export default function ComunidadLoading() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero skeleton */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block w-48 h-8 bg-void-light rounded-full animate-pulse mb-6" />
          <div className="w-80 h-12 bg-void-light rounded-lg animate-pulse mx-auto mb-4" />
          <div className="w-96 h-6 bg-void-light rounded-lg animate-pulse mx-auto" />
        </div>
      </section>

      {/* Map skeleton */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-48 bg-void-light rounded animate-pulse" />
          <div className="h-6 w-24 bg-void-light rounded animate-pulse" />
        </div>
        <div className="w-full h-[500px] bg-void-light rounded-xl animate-pulse border border-bone/10 flex items-center justify-center">
          <MapPin className="w-12 h-12 text-bone/10" />
        </div>
      </section>

      {/* Store grid skeleton */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="h-8 w-48 bg-void-light rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-void-light rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-[16/9] bg-void" />
              <div className="p-4 space-y-3">
                <div className="h-6 bg-void rounded w-3/4" />
                <div className="h-4 bg-void rounded w-full" />
                <div className="h-4 bg-void rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
