'use client'

import { motion } from 'framer-motion'
import MiniatureCard, { type MiniatureWithStats } from './MiniatureCard'

interface MiniatureGridProps {
  miniatures: MiniatureWithStats[]
  isLoading?: boolean
  emptyMessage?: string
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <div className="relative w-32 h-32 mb-6">
          {/* Empty state illustration */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-bone/5 to-transparent"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <div className="absolute inset-4 rounded-full border-2 border-dashed border-bone/20 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <svg
                className="w-12 h-12 text-bone/20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </motion.div>
          </div>
        </div>
        <h3 className="text-xl font-display font-bold text-bone/60 mb-2">
          Sin Miniaturas
        </h3>
        <p className="text-bone/40 text-center max-w-sm font-body">
          {emptyMessage}
        </p>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {miniatures.map((miniature, index) => (
        <MiniatureCard
          key={miniature.id}
          miniature={miniature}
          index={index}
        />
      ))}
    </div>
  )
}
