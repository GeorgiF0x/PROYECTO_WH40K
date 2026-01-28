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
  featuredIds = []
}: CreatorGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
        className="text-center py-16"
      >
        {/* Empty state - manuscript style */}
        <div className="relative inline-block">
          {/* Decorative frame */}
          <div className="absolute -inset-4 border border-imperial-gold/10 rounded-lg" />
          <div className="absolute -inset-6 border border-imperial-gold/5 rounded-lg" />

          <div className="relative p-8 bg-void-light/50 rounded-lg border border-imperial-gold/20">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-void border border-imperial-gold/30 flex items-center justify-center">
              <ScrollText className="w-8 h-8 text-imperial-gold/40" />
            </div>

            {/* Message */}
            <p className="text-bone/60 font-body max-w-sm mx-auto mb-4">
              {emptyMessage}
            </p>

            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-imperial-gold/30" />
              <Feather className="w-3 h-3 text-imperial-gold/30" />
              <div className="w-8 h-px bg-gradient-to-l from-transparent to-imperial-gold/30" />
            </div>

            {/* Archive notation */}
            <p className="text-[10px] font-mono text-bone/30 mt-4 tracking-wider uppercase">
              Archivo sin registros
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {creators.map((creator, index) => (
        <CreatorCard
          key={creator.id}
          creator={creator}
          index={index}
          featured={featuredIds.includes(creator.id)}
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
      className="relative rounded-lg border bg-gradient-to-b from-void-light/90 to-void/95 border-imperial-gold/10 overflow-hidden"
    >
      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-5 h-5 border-t border-l border-imperial-gold/20" />
      <div className="absolute top-0 right-0 w-5 h-5 border-t border-r border-imperial-gold/20" />
      <div className="absolute bottom-0 left-0 w-5 h-5 border-b border-l border-imperial-gold/20" />
      <div className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-imperial-gold/20" />

      {/* Avatar */}
      <div className="p-4 pb-2 pt-6">
        <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-void/80 border border-imperial-gold/20 animate-pulse" />
      </div>

      {/* Content */}
      <div className="p-4 text-center">
        {/* Name */}
        <div className="h-5 w-28 mx-auto bg-void/60 rounded animate-pulse mb-2" />
        {/* Username */}
        <div className="h-3 w-20 mx-auto bg-void/40 rounded animate-pulse mb-3" />

        {/* Divider */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-px bg-imperial-gold/10" />
          <div className="w-2 h-2 bg-imperial-gold/10 rounded-full animate-pulse" />
          <div className="w-6 h-px bg-imperial-gold/10" />
        </div>

        {/* Badge */}
        <div className="h-6 w-24 mx-auto bg-void/50 rounded-lg animate-pulse mb-3" />

        {/* Bio */}
        <div className="space-y-1.5 mb-3 px-2">
          <div className="h-2.5 w-full bg-void/40 rounded animate-pulse" />
          <div className="h-2.5 w-3/4 mx-auto bg-void/30 rounded animate-pulse" />
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-4 py-2 border-t border-b border-imperial-gold/5">
          <div className="h-4 w-12 bg-void/40 rounded animate-pulse" />
          <div className="w-px h-3 bg-imperial-gold/10" />
          <div className="h-4 w-12 bg-void/40 rounded animate-pulse" />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-imperial-gold/10 to-transparent" />
    </motion.div>
  )
}
