'use client'

import { motion } from 'framer-motion'
import { ScrollText, Feather } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CreatorCard } from './CreatorCard'
import type { PublicCreator } from '@/lib/types/database.types'

interface CreatorGridProps {
  creators: PublicCreator[]
  loading?: boolean
  emptyMessage?: string
  featuredIds?: string[]
}

export function CreatorGrid({
  creators,
  loading = false,
  emptyMessage = 'No hay creadores disponibles',
  featuredIds = [],
}: CreatorGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CreatorCardSkeleton key={i} index={i} />
        ))}
      </div>
    )
  }

  if (creators.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-16 text-center"
      >
        {/* Empty state - manuscript style */}
        <div className="relative inline-block">
          {/* Decorative frame */}
          <div className="absolute -inset-4 rounded-lg border border-imperial-gold/10" />
          <div className="absolute -inset-6 rounded-lg border border-imperial-gold/5" />

          <div className="relative rounded-lg border border-imperial-gold/20 bg-void-light/50 p-8">
            {/* Icon */}
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-imperial-gold/30 bg-void">
              <ScrollText className="h-8 w-8 text-imperial-gold/40" />
            </div>

            {/* Message */}
            <p className="mx-auto mb-4 max-w-sm font-body text-bone/60">{emptyMessage}</p>

            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-imperial-gold/30" />
              <Feather className="h-3 w-3 text-imperial-gold/30" />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-imperial-gold/30" />
            </div>

            {/* Archive notation */}
            <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-bone/30">
              Archivo sin registros
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {creators.map((creator, index) => (
        <CreatorCard
          key={creator.id || index}
          creator={creator}
          index={index}
          featured={creator.id ? featuredIds.includes(creator.id) : false}
        />
      ))}
    </div>
  )
}

function CreatorCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="relative overflow-hidden rounded-lg border border-imperial-gold/10 bg-gradient-to-b from-void-light/90 to-void/95"
    >
      {/* Corner brackets */}
      <div className="absolute left-0 top-0 h-5 w-5 border-l border-t border-imperial-gold/20" />
      <div className="absolute right-0 top-0 h-5 w-5 border-r border-t border-imperial-gold/20" />
      <div className="absolute bottom-0 left-0 h-5 w-5 border-b border-l border-imperial-gold/20" />
      <div className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-imperial-gold/20" />

      {/* Avatar */}
      <div className="p-4 pb-2 pt-6">
        <div className="mx-auto h-20 w-20 animate-pulse rounded-full border border-imperial-gold/20 bg-void/80 sm:h-24 sm:w-24" />
      </div>

      {/* Content */}
      <div className="p-4 text-center">
        {/* Name */}
        <div className="mx-auto mb-2 h-5 w-28 animate-pulse rounded bg-void/60" />
        {/* Username */}
        <div className="mx-auto mb-3 h-3 w-20 animate-pulse rounded bg-void/40" />

        {/* Divider */}
        <div className="mb-3 flex items-center justify-center gap-2">
          <div className="h-px w-6 bg-imperial-gold/10" />
          <div className="h-2 w-2 animate-pulse rounded-full bg-imperial-gold/10" />
          <div className="h-px w-6 bg-imperial-gold/10" />
        </div>

        {/* Badge */}
        <div className="mx-auto mb-3 h-6 w-24 animate-pulse rounded-lg bg-void/50" />

        {/* Bio */}
        <div className="mb-3 space-y-1.5 px-2">
          <div className="h-2.5 w-full animate-pulse rounded bg-void/40" />
          <div className="mx-auto h-2.5 w-3/4 animate-pulse rounded bg-void/30" />
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-4 border-b border-t border-imperial-gold/5 py-2">
          <div className="h-4 w-12 animate-pulse rounded bg-void/40" />
          <div className="h-3 w-px bg-imperial-gold/10" />
          <div className="h-4 w-12 animate-pulse rounded bg-void/40" />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-imperial-gold/10 to-transparent" />
    </motion.div>
  )
}
