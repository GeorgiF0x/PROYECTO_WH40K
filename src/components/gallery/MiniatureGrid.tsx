'use client'

import dynamic from 'next/dynamic'
import { VirtualGrid } from '@/components/ui/VirtualGrid'
import type { MiniatureWithStats } from './MiniatureCard'

// Dynamic import to reduce initial bundle size (bundle-dynamic-imports best practice)
const MiniatureCard = dynamic(() => import('./MiniatureCard'), {
  loading: () => <SkeletonCard />,
})

interface MiniatureGridProps {
  miniatures: MiniatureWithStats[]
  isLoading?: boolean
  emptyMessage?: string
  viewMode?: 'grid' | 'list'
}

// Loading skeleton card
function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl bg-void-light">
      <div className="aspect-[4/5] bg-void">
        <div className="h-full w-full bg-gradient-to-br from-bone/5 to-transparent" />
      </div>
      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 rounded bg-bone/10" />
        <div className="h-4 w-full rounded bg-bone/5" />
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-bone/10" />
            <div className="h-3 w-16 rounded bg-bone/5" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-3 w-8 rounded bg-bone/5" />
            <div className="h-3 w-8 rounded bg-bone/5" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MiniatureGrid({
  miniatures,
  isLoading = false,
  emptyMessage = 'No hay miniaturas para mostrar',
  viewMode = 'grid',
}: MiniatureGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (miniatures.length === 0) {
    return (
      <div className="flex animate-fadeIn flex-col items-center justify-center py-20">
        <div className="relative mb-6 h-32 w-32">
          {/* Empty state illustration with CSS animation */}
          <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-necron-teal/5 to-transparent" />
          <div className="absolute inset-4 flex items-center justify-center rounded-full border-2 border-dashed border-necron-teal/20">
            <div className="animate-spin-slow">
              {/* Tesseract cube SVG */}
              <svg
                className="h-12 w-12 text-necron-dark/20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 200 200"
              >
                <rect x="30" y="30" width="100" height="100" strokeWidth="6" />
                <rect x="70" y="70" width="100" height="100" strokeWidth="6" />
                <line x1="30" y1="30" x2="70" y2="70" strokeWidth="4" />
                <line x1="130" y1="30" x2="170" y2="70" strokeWidth="4" />
                <line x1="30" y1="130" x2="70" y2="170" strokeWidth="4" />
                <line x1="130" y1="130" x2="170" y2="170" strokeWidth="4" />
              </svg>
            </div>
          </div>
        </div>
        <h3 className="mb-2 font-display text-xl font-bold text-necron-dark/40">Galería Vacía</h3>
        <p className="max-w-sm text-center font-body text-bone/40">{emptyMessage}</p>
      </div>
    )
  }

  // List mode: no virtualization needed (different layout)
  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-4">
        {miniatures.map((miniature, index) => (
          <MiniatureCard key={miniature.id} miniature={miniature} index={index} variant="list" />
        ))}
      </div>
    )
  }

  return (
    <VirtualGrid
      items={miniatures}
      columns={{ base: 1, sm: 2, lg: 3, xl: 4 }}
      estimatedRowHeight={480}
      gap={24}
      keyExtractor={(m) => m.id}
      renderItem={(miniature, index) => (
        <MiniatureCard key={miniature.id} miniature={miniature} index={index} variant="card" />
      )}
    />
  )
}
