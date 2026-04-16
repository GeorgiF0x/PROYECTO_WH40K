'use client'

import dynamic from 'next/dynamic'
import { Package } from 'lucide-react'
import type { ListingWithSeller } from './ListingCard'

// Dynamic import to reduce initial bundle size (bundle-dynamic-imports best practice)
const ListingCard = dynamic(() => import('./ListingCard'), {
  loading: () => <ListingCardSkeleton />,
})

function ListingCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl bg-void-light">
      <div className="aspect-[4/3] bg-void" />
      <div className="space-y-3 p-4">
        <div className="h-6 w-3/4 rounded bg-void" />
        <div className="h-4 w-full rounded bg-void" />
        <div className="h-4 w-2/3 rounded bg-void" />
        <div className="flex items-center gap-2 border-t border-bone/10 pt-4">
          <div className="h-6 w-6 rounded-full bg-void" />
          <div className="h-4 w-20 rounded bg-void" />
        </div>
      </div>
    </div>
  )
}

interface ListingGridProps {
  listings: ListingWithSeller[]
  isLoading?: boolean
  emptyMessage?: string
}

export default function ListingGrid({
  listings,
  isLoading = false,
  emptyMessage = 'No hay anuncios disponibles',
}: ListingGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse overflow-hidden rounded-xl bg-void-light">
            <div className="aspect-[4/3] bg-void" />
            <div className="space-y-3 p-4">
              <div className="h-6 w-3/4 rounded bg-void" />
              <div className="h-4 w-full rounded bg-void" />
              <div className="h-4 w-2/3 rounded bg-void" />
              <div className="flex items-center gap-2 border-t border-bone/10 pt-4">
                <div className="h-6 w-6 rounded-full bg-void" />
                <div className="h-4 w-20 rounded bg-void" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="flex animate-fadeIn flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-void-light">
          <Package className="h-10 w-10 text-bone/30" />
        </div>
        <h3 className="mb-2 font-display text-xl font-semibold text-bone/60">Sin resultados</h3>
        <p className="max-w-md font-body text-bone/40">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing, index) => (
        <ListingCard key={listing.id} listing={listing} index={index} />
      ))}
    </div>
  )
}
