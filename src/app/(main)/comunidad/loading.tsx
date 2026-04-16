import { MapPin } from 'lucide-react'

export default function ComunidadLoading() {
  return (
    <div className="min-h-screen pb-16 pt-20">
      {/* Hero skeleton */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mb-6 inline-block h-8 w-48 animate-pulse rounded-full bg-void-light" />
          <div className="mx-auto mb-4 h-12 w-80 animate-pulse rounded-lg bg-void-light" />
          <div className="mx-auto h-6 w-96 animate-pulse rounded-lg bg-void-light" />
        </div>
      </section>

      {/* Map skeleton */}
      <section className="mx-auto mb-16 max-w-7xl px-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded bg-void-light" />
          <div className="h-6 w-24 animate-pulse rounded bg-void-light" />
        </div>
        <div className="flex h-[500px] w-full animate-pulse items-center justify-center rounded-xl border border-bone/10 bg-void-light">
          <MapPin className="h-12 w-12 text-bone/10" />
        </div>
      </section>

      {/* Store grid skeleton */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="mb-6 h-8 w-48 animate-pulse rounded bg-void-light" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse overflow-hidden rounded-xl bg-void-light">
              <div className="aspect-[16/9] bg-void" />
              <div className="space-y-3 p-4">
                <div className="h-6 w-3/4 rounded bg-void" />
                <div className="h-4 w-full rounded bg-void" />
                <div className="h-4 w-2/3 rounded bg-void" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
