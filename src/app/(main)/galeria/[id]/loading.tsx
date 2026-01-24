export default function MiniatureDetailLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Back button skeleton */}
        <div className="h-6 w-32 bg-void-light rounded mb-8 animate-pulse" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Skeleton */}
          <div className="animate-pulse">
            <div className="aspect-square bg-void-light rounded-2xl" />
          </div>

          {/* Info Skeleton */}
          <div className="space-y-6 animate-pulse">
            {/* Title and stats */}
            <div>
              <div className="h-10 bg-void-light rounded w-3/4 mb-3" />
              <div className="flex gap-6">
                <div className="h-6 w-20 bg-void-light rounded" />
                <div className="h-6 w-20 bg-void-light rounded" />
                <div className="h-6 w-20 bg-void-light rounded" />
              </div>
            </div>

            {/* Tags */}
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-void-light rounded-full" />
              <div className="h-8 w-24 bg-void-light rounded-full" />
              <div className="h-8 w-16 bg-void-light rounded-full" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="h-6 w-32 bg-void-light rounded" />
              <div className="h-4 bg-void-light rounded w-full" />
              <div className="h-4 bg-void-light rounded w-full" />
              <div className="h-4 bg-void-light rounded w-2/3" />
            </div>

            {/* Author card */}
            <div className="p-5 bg-void-light rounded-xl h-24" />

            {/* Action buttons */}
            <div className="flex gap-4">
              <div className="h-12 flex-1 bg-void-light rounded-xl" />
              <div className="h-12 w-12 bg-void-light rounded-xl" />
              <div className="h-12 w-12 bg-void-light rounded-xl" />
            </div>
          </div>
        </div>

        {/* Comments section skeleton */}
        <div className="mt-16 animate-pulse">
          <div className="h-8 w-40 bg-void-light rounded mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 bg-void-light rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-void rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-void rounded" />
                    <div className="h-4 w-full bg-void rounded" />
                    <div className="h-4 w-2/3 bg-void rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
