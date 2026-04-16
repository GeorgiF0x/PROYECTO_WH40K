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
  variant = 'grid',
}: EventGridProps) {
  if (loading) {
    return (
      <div
        className={
          variant === 'grid' ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4'
        }
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <EventCardSkeleton
            key={i}
            index={i}
            variant={variant === 'list' ? 'compact' : 'default'}
          />
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-16 text-center"
      >
        <div className="relative inline-block">
          {/* Decorative frame */}
          <div className="absolute -inset-4 rounded-lg border border-amber-500/10" />
          <div className="absolute -inset-6 rounded-lg border border-amber-500/5" />

          <div className="relative rounded-lg border border-amber-500/20 bg-void-light/50 p-8">
            {/* Icon */}
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/30 bg-void">
              <Calendar className="h-8 w-8 text-amber-500/40" />
            </div>

            {/* Message */}
            <p className="mx-auto mb-4 max-w-sm font-body text-bone/60">{emptyMessage}</p>

            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-500/30" />
              <Clock className="h-3 w-3 text-amber-500/30" />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-500/30" />
            </div>

            {/* Archive notation */}
            <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-bone/30">
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
          <EventCard key={event.id} event={event} index={index} variant="compact" />
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
      renderItem={(event, index) => <EventCard key={event.id} event={event} index={index} />}
    />
  )
}

function EventCardSkeleton({
  index = 0,
  variant = 'default',
}: {
  index?: number
  variant?: 'default' | 'compact'
}) {
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.05 }}
        className="flex items-center gap-4 rounded-xl border border-bone/10 bg-void-light/60 p-3"
      >
        <div className="h-10 w-10 animate-pulse rounded-lg bg-void/50" />
        <div className="flex-1">
          <div className="mb-2 h-4 w-32 animate-pulse rounded bg-void/40" />
          <div className="h-3 w-24 animate-pulse rounded bg-void/30" />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="overflow-hidden rounded-xl border border-bone/10 bg-gradient-to-b from-void-light/90 to-void/95"
    >
      {/* Cover */}
      <div className="h-36 animate-pulse bg-void/50" />

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <div className="mb-3 h-6 w-3/4 animate-pulse rounded bg-void/40" />

        {/* Date */}
        <div className="mb-3 flex items-center gap-4">
          <div className="h-4 w-24 animate-pulse rounded bg-void/30" />
          <div className="h-4 w-16 animate-pulse rounded bg-void/30" />
        </div>

        {/* Location */}
        <div className="mb-3 h-4 w-32 animate-pulse rounded bg-void/30" />

        {/* Organizer */}
        <div className="mb-3 h-10 animate-pulse rounded-lg bg-void/20" />

        {/* Bottom */}
        <div className="flex items-center justify-between border-t border-bone/5 pt-3">
          <div className="h-4 w-16 animate-pulse rounded bg-void/30" />
          <div className="h-4 w-20 animate-pulse rounded bg-void/30" />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-amber-500/10 to-transparent" />
    </motion.div>
  )
}
