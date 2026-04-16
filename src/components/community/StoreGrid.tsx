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
    <div className="animate-pulse overflow-hidden rounded-xl bg-void-light">
      <div className="aspect-[16/9] bg-void" />
      <div className="space-y-3 p-4">
        <div className="h-6 w-3/4 rounded bg-void" />
        <div className="h-4 w-full rounded bg-void" />
        <div className="h-4 w-2/3 rounded bg-void" />
        <div className="mt-3 flex gap-2">
          <div className="h-6 w-16 rounded bg-void" />
          <div className="h-6 w-16 rounded bg-void" />
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <StoreCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (stores.length === 0) {
    return (
      <div className="flex animate-fadeIn flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-void-light">
          <StoreIcon className="h-10 w-10 text-bone/30" />
        </div>
        <h3 className="mb-2 font-display text-xl font-semibold text-bone/60">Sin resultados</h3>
        <p className="max-w-md font-body text-bone/40">{emptyMessage}</p>
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
      renderItem={(store, index) => <StoreCard key={store.id} store={store} index={index} />}
    />
  )
}
