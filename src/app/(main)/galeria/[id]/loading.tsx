export default function MiniatureDetailLoading() {
  return (
    <div className="min-h-screen pb-16 pt-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Back button skeleton */}
        <div className="mb-8 h-6 w-32 animate-pulse rounded bg-void-light" />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image Skeleton */}
          <div className="animate-pulse">
            <div className="aspect-square rounded-2xl bg-void-light" />
          </div>

          {/* Info Skeleton */}
          <div className="animate-pulse space-y-6">
            {/* Title and stats */}
            <div>
              <div className="mb-3 h-10 w-3/4 rounded bg-void-light" />
              <div className="flex gap-6">
                <div className="h-6 w-20 rounded bg-void-light" />
                <div className="h-6 w-20 rounded bg-void-light" />
                <div className="h-6 w-20 rounded bg-void-light" />
              </div>
            </div>

            {/* Tags */}
            <div className="flex gap-2">
              <div className="h-8 w-20 rounded-full bg-void-light" />
              <div className="h-8 w-24 rounded-full bg-void-light" />
              <div className="h-8 w-16 rounded-full bg-void-light" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="h-6 w-32 rounded bg-void-light" />
              <div className="h-4 w-full rounded bg-void-light" />
              <div className="h-4 w-full rounded bg-void-light" />
              <div className="h-4 w-2/3 rounded bg-void-light" />
            </div>

            {/* Author card */}
            <div className="h-24 rounded-xl bg-void-light p-5" />

            {/* Action buttons */}
            <div className="flex gap-4">
              <div className="h-12 flex-1 rounded-xl bg-void-light" />
              <div className="h-12 w-12 rounded-xl bg-void-light" />
              <div className="h-12 w-12 rounded-xl bg-void-light" />
            </div>
          </div>
        </div>

        {/* Comments section skeleton */}
        <div className="mt-16 animate-pulse">
          <div className="mb-6 h-8 w-40 rounded bg-void-light" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-void-light p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-void" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-void" />
                    <div className="h-4 w-full rounded bg-void" />
                    <div className="h-4 w-2/3 rounded bg-void" />
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
