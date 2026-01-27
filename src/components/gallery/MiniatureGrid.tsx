'use client'

import dynamic from 'next/dynamic'
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
    <div className="bg-void-light rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-[4/5] bg-void">
        <div className="w-full h-full bg-gradient-to-br from-bone/5 to-transparent" />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-5 bg-bone/10 rounded w-3/4" />
        <div className="h-4 bg-bone/5 rounded w-full" />
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-bone/10" />
            <div className="h-3 bg-bone/5 rounded w-16" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-3 bg-bone/5 rounded w-8" />
            <div className="h-3 bg-bone/5 rounded w-8" />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (miniatures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
        <div className="relative w-32 h-32 mb-6">
          {/* Empty state illustration with CSS animation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-necron-teal/5 to-transparent animate-pulse" />
          <div className="absolute inset-4 rounded-full border-2 border-dashed border-necron-teal/20 flex items-center justify-center">
            <div className="animate-spin-slow">
              {/* Tesseract cube SVG */}
              <svg
                className="w-12 h-12 text-necron-dark/20"
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
        <h3 className="text-xl font-display font-bold text-necron-dark/40 mb-2">
          Galería Vacía
        </h3>
        <p className="text-bone/40 text-center max-w-sm font-body">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className={
      viewMode === 'list'
        ? 'flex flex-col gap-4'
        : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
    }>
      {miniatures.map((miniature, index) => (
        <MiniatureCard
          key={miniature.id}
          miniature={miniature}
          index={index}
          variant={viewMode === 'list' ? 'list' : 'card'}
        />
      ))}
    </div>
  )
}
