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
    <div className="bg-void-light rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-void" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-void rounded w-3/4" />
        <div className="h-4 bg-void rounded w-full" />
        <div className="h-4 bg-void rounded w-2/3" />
        <div className="pt-4 border-t border-bone/10 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-void" />
          <div className="h-4 bg-void rounded w-20" />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-void-light rounded-xl overflow-hidden animate-pulse"
          >
            <div className="aspect-[4/3] bg-void" />
            <div className="p-4 space-y-3">
              <div className="h-6 bg-void rounded w-3/4" />
              <div className="h-4 bg-void rounded w-full" />
              <div className="h-4 bg-void rounded w-2/3" />
              <div className="pt-4 border-t border-bone/10 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-void" />
                <div className="h-4 bg-void rounded w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-void-light flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-bone/30" />
        </div>
        <h3 className="text-xl font-display font-semibold text-bone/60 mb-2">
          Sin resultados
        </h3>
        <p className="text-bone/40 font-body max-w-md">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing, index) => (
        <ListingCard key={listing.id} listing={listing} index={index} />
      ))}
    </div>
  )
}
