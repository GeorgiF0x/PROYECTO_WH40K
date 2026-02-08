'use client'

import dynamic from 'next/dynamic'
import { Store as StoreIcon } from 'lucide-react'
import { VirtualGrid } from '@/components/ui/VirtualGrid'
import type { StoreWithSubmitter } from './StoreCard'

const StoreCard = dynamic(() => import('./StoreCard'), {
  loading: () => <StoreCardSkeleton />,
})

function StoreCardSkeleton() {
  return (
    <div className="bg-void-light rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-[16/9] bg-void" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-void rounded w-3/4" />
        <div className="h-4 bg-void rounded w-full" />
        <div className="h-4 bg-void rounded w-2/3" />
        <div className="flex gap-2 mt-3">
          <div className="h-6 bg-void rounded w-16" />
          <div className="h-6 bg-void rounded w-16" />
        </div>
      </div>
    </div>
  )
}

interface StoreGridProps {
  stores: StoreWithSubmitter[]
  isLoading?: boolean
  emptyMessage?: string
}

export default function StoreGrid({
  stores,
  isLoading = false,
  emptyMessage = 'No hay tiendas disponibles',
}: StoreGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <StoreCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (stores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-void-light flex items-center justify-center mb-6">
          <StoreIcon className="w-10 h-10 text-bone/30" />
        </div>
        <h3 className="text-xl font-display font-semibold text-bone/60 mb-2">
          Sin resultados
        </h3>
        <p className="text-bone/40 font-body max-w-md">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <VirtualGrid
      items={stores}
      columns={{ base: 1, sm: 2, lg: 3 }}
      estimatedRowHeight={380}
      gap={24}
      keyExtractor={(s) => s.id}
      renderItem={(store, index) => (
        <StoreCard key={store.id} store={store} index={index} />
      )}
    />
  )
}
