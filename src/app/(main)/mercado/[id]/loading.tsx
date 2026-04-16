export default function ListingDetailLoading() {
  return (
    <div className="min-h-screen pb-16 pt-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Back button skeleton */}
        <div className="mb-8 h-6 w-32 animate-pulse rounded bg-void-light" />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image Gallery Skeleton */}
          <div className="animate-pulse">
            <div className="aspect-square rounded-2xl bg-void-light" />
            <div className="mt-4 flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 w-20 flex-shrink-0 rounded-lg bg-void-light" />
              ))}
            </div>
          </div>

          {/* Info Skeleton */}
          <div className="animate-pulse space-y-6">
            {/* Title */}
            <div>
              <div className="mb-3 h-10 w-3/4 rounded bg-void-light" />
              <div className="flex gap-4">
                <div className="h-5 w-32 rounded bg-void-light" />
                <div className="h-5 w-24 rounded bg-void-light" />
              </div>
            </div>

            {/* Badges */}
            <div className="flex gap-3">
              <div className="h-10 w-28 rounded-lg bg-void-light" />
              <div className="h-10 w-24 rounded-lg bg-void-light" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="h-6 w-32 rounded bg-void-light" />
              <div className="h-4 w-full rounded bg-void-light" />
              <div className="h-4 w-full rounded bg-void-light" />
              <div className="h-4 w-2/3 rounded bg-void-light" />
            </div>

            {/* Condition box */}
            <div className="h-20 rounded-xl bg-void-light p-4" />

            {/* Location */}
            <div className="h-6 w-40 rounded bg-void-light" />

            {/* Seller card */}
            <div className="h-24 rounded-xl bg-void-light p-5" />

            {/* Contact button */}
            <div className="h-14 rounded-xl bg-void-light" />
          </div>
        </div>
      </div>
    </div>
  )
}
