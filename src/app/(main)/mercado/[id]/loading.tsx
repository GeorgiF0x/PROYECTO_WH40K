export default function ListingDetailLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Back button skeleton */}
        <div className="h-6 w-32 bg-void-light rounded mb-8 animate-pulse" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery Skeleton */}
          <div className="animate-pulse">
            <div className="aspect-square bg-void-light rounded-2xl" />
            <div className="flex gap-2 mt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-20 h-20 bg-void-light rounded-lg flex-shrink-0" />
              ))}
            </div>
          </div>

          {/* Info Skeleton */}
          <div className="space-y-6 animate-pulse">
            {/* Title */}
            <div>
              <div className="h-10 bg-void-light rounded w-3/4 mb-3" />
              <div className="flex gap-4">
                <div className="h-5 w-32 bg-void-light rounded" />
                <div className="h-5 w-24 bg-void-light rounded" />
              </div>
            </div>

            {/* Badges */}
            <div className="flex gap-3">
              <div className="h-10 w-28 bg-void-light rounded-lg" />
              <div className="h-10 w-24 bg-void-light rounded-lg" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="h-6 w-32 bg-void-light rounded" />
              <div className="h-4 bg-void-light rounded w-full" />
              <div className="h-4 bg-void-light rounded w-full" />
              <div className="h-4 bg-void-light rounded w-2/3" />
            </div>

            {/* Condition box */}
            <div className="p-4 bg-void-light rounded-xl h-20" />

            {/* Location */}
            <div className="h-6 w-40 bg-void-light rounded" />

            {/* Seller card */}
            <div className="p-5 bg-void-light rounded-xl h-24" />

            {/* Contact button */}
            <div className="h-14 bg-void-light rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
