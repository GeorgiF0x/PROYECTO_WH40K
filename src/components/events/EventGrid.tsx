'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock } from 'lucide-react'
import { EventCard } from './EventCard'
import { VirtualGrid } from '@/components/ui/VirtualGrid'
import type { EventWithOrganizer } from '@/lib/types/database.types'

interface EventGridProps {
  events: EventWithOrganizer[]
  loading?: boolean
  emptyMessage?: string
  variant?: 'grid' | 'list'
}

export function EventGrid({
  events,
  loading = false,
  emptyMessage = 'No hay eventos programados',
  variant = 'grid'
}: EventGridProps) {
  if (loading) {
    return (
      <div className={variant === 'grid'
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
        : 'space-y-4'
      }>
        {Array.from({ length: 6 }).map((_, i) => (
          <EventCardSkeleton key={i} index={i} variant={variant === 'list' ? 'compact' : 'default'} />
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="relative inline-block">
          {/* Decorative frame */}
          <div className="absolute -inset-4 border border-amber-500/10 rounded-lg" />
          <div className="absolute -inset-6 border border-amber-500/5 rounded-lg" />

          <div className="relative p-8 bg-void-light/50 rounded-lg border border-amber-500/20">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-void border border-amber-500/30 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-amber-500/40" />
            </div>

            {/* Message */}
            <p className="text-bone/60 font-body max-w-sm mx-auto mb-4">
              {emptyMessage}
            </p>

            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-amber-500/30" />
              <Clock className="w-3 h-3 text-amber-500/30" />
              <div className="w-8 h-px bg-gradient-to-l from-transparent to-amber-500/30" />
            </div>

            {/* Archive notation */}
            <p className="text-[10px] font-mono text-bone/30 mt-4 tracking-wider uppercase">
              Chronus sin registros
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  if (variant === 'list') {
    return (
      <div className="space-y-3">
        {events.map((event, index) => (
          <EventCard
            key={event.id}
            event={event}
            index={index}
            variant="compact"
          />
        ))}
      </div>
    )
  }

  return (
    <VirtualGrid
      items={events}
      columns={{ base: 1, sm: 2, lg: 3 }}
      estimatedRowHeight={420}
      gap={24}
      keyExtractor={(e) => e.id}
      renderItem={(event, index) => (
        <EventCard
          key={event.id}
          event={event}
          index={index}
        />
      )}
    />
  )
}

function EventCardSkeleton({ index = 0, variant = 'default' }: { index?: number; variant?: 'default' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.05 }}
        className="flex items-center gap-4 p-3 rounded-xl bg-void-light/60 border border-bone/10"
      >
        <div className="w-10 h-10 rounded-lg bg-void/50 animate-pulse" />
        <div className="flex-1">
          <div className="h-4 w-32 bg-void/40 rounded animate-pulse mb-2" />
          <div className="h-3 w-24 bg-void/30 rounded animate-pulse" />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border bg-gradient-to-b from-void-light/90 to-void/95 border-bone/10 overflow-hidden"
    >
      {/* Cover */}
      <div className="h-36 bg-void/50 animate-pulse" />

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <div className="h-6 w-3/4 bg-void/40 rounded animate-pulse mb-3" />

        {/* Date */}
        <div className="flex items-center gap-4 mb-3">
          <div className="h-4 w-24 bg-void/30 rounded animate-pulse" />
          <div className="h-4 w-16 bg-void/30 rounded animate-pulse" />
        </div>

        {/* Location */}
        <div className="h-4 w-32 bg-void/30 rounded animate-pulse mb-3" />

        {/* Organizer */}
        <div className="h-10 bg-void/20 rounded-lg animate-pulse mb-3" />

        {/* Bottom */}
        <div className="flex items-center justify-between pt-3 border-t border-bone/5">
          <div className="h-4 w-16 bg-void/30 rounded animate-pulse" />
          <div className="h-4 w-20 bg-void/30 rounded animate-pulse" />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-amber-500/10 to-transparent" />
    </motion.div>
  )
}
