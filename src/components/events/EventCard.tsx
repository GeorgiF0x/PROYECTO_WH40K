'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Trophy,
  Paintbrush,
  Swords,
  BookOpen,
  PartyPopper,
  Users2,
  Sparkles,
  Store,
  Shield,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EventWithOrganizer, EventType } from '@/lib/types/database.types'

interface EventCardProps {
  event: EventWithOrganizer
  index?: number
  variant?: 'default' | 'compact'
}

// Event type configurations
export const eventTypeConfig: Record<EventType, {
  label: string
  icon: typeof Trophy
  color: string
  colorHex: string
  bgColor: string
}> = {
  tournament: {
    label: 'Torneo',
    icon: Trophy,
    color: 'text-amber-400',
    colorHex: '#fbbf24',
    bgColor: 'bg-amber-500/20',
  },
  painting_workshop: {
    label: 'Taller de Pintura',
    icon: Paintbrush,
    color: 'text-purple-400',
    colorHex: '#c084fc',
    bgColor: 'bg-purple-500/20',
  },
  casual_play: {
    label: 'Partidas Casuales',
    icon: Swords,
    color: 'text-blue-400',
    colorHex: '#60a5fa',
    bgColor: 'bg-blue-500/20',
  },
  campaign: {
    label: 'Campaña',
    icon: BookOpen,
    color: 'text-emerald-400',
    colorHex: '#34d399',
    bgColor: 'bg-emerald-500/20',
  },
  release_event: {
    label: 'Lanzamiento',
    icon: PartyPopper,
    color: 'text-red-400',
    colorHex: '#f87171',
    bgColor: 'bg-red-500/20',
  },
  meetup: {
    label: 'Quedada',
    icon: Users2,
    color: 'text-cyan-400',
    colorHex: '#22d3ee',
    bgColor: 'bg-cyan-500/20',
  },
  other: {
    label: 'Otro',
    icon: Calendar,
    color: 'text-bone/60',
    colorHex: '#a8a29e',
    bgColor: 'bg-bone/10',
  },
}

function formatEventDate(startDate: string, endDate?: string | null): string {
  const start = new Date(startDate)
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
  }

  if (!endDate) {
    return start.toLocaleDateString('es-ES', { ...options, year: 'numeric' })
  }

  const end = new Date(endDate)
  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString('es-ES', { ...options, year: 'numeric' })
  }

  return `${start.toLocaleDateString('es-ES', options)} - ${end.toLocaleDateString('es-ES', { ...options, year: 'numeric' })}`
}

function formatEventTime(startDate: string): string {
  const date = new Date(startDate)
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function isEventSoon(startDate: string): boolean {
  const now = new Date()
  const start = new Date(startDate)
  const diffDays = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays >= 0 && diffDays <= 7
}

export function EventCard({ event, index = 0, variant = 'default' }: EventCardProps) {
  const config = eventTypeConfig[event.event_type]
  const Icon = config.icon
  const isSoon = isEventSoon(event.start_date)
  const isFull = event.max_participants && (event.current_participants ?? 0) >= event.max_participants

  if (variant === 'compact') {
    return (
      <Link href={`/comunidad/eventos/${event.slug}`}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            'group flex items-center gap-4 p-3 rounded-xl border transition-all',
            'bg-void-light/60 border-bone/10',
            'hover:border-imperial-gold/30 hover:bg-void-light'
          )}
        >
          {/* Type indicator */}
          <div
            className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', config.bgColor)}
            style={{ borderLeft: `3px solid ${config.colorHex}` }}
          >
            <Icon className={cn('w-5 h-5', config.color)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-bone text-sm truncate group-hover:text-imperial-gold transition-colors">
              {event.name}
            </h3>
            <div className="flex items-center gap-3 text-xs text-bone/50">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatEventDate(event.start_date)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {event.city}
              </span>
            </div>
          </div>

          {/* Official badge */}
          {event.is_official && (
            <Shield className="w-4 h-4 text-imperial-gold/60 flex-shrink-0" />
          )}
        </motion.div>
      </Link>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative"
    >
      <Link href={`/comunidad/eventos/${event.slug}`}>
        <div className={cn(
          'relative overflow-hidden rounded-xl border transition-all duration-300',
          'bg-gradient-to-b from-void-light/90 to-void/95',
          'border-bone/10 hover:border-imperial-gold/40',
          'hover:shadow-lg hover:shadow-imperial-gold/10 hover:-translate-y-1'
        )}>
          {/* Cover image or gradient */}
          <div className="relative h-36 overflow-hidden">
            {event.cover_image ? (
              <Image
                src={event.cover_image}
                alt={event.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${config.colorHex}30 0%, transparent 50%, ${config.colorHex}10 100%)`,
                }}
              />
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-transparent" />

            {/* Top badges */}
            <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
              {/* Event type badge */}
              <div
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-lg backdrop-blur-sm',
                  config.bgColor
                )}
                style={{ border: `1px solid ${config.colorHex}40` }}
              >
                <Icon className={cn('w-3.5 h-3.5', config.color)} />
                <span className={cn('text-xs font-mono', config.color)}>{config.label}</span>
              </div>

              {/* Official badge */}
              {event.is_official && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-imperial-gold/20 backdrop-blur-sm border border-imperial-gold/40">
                  <Shield className="w-3.5 h-3.5 text-imperial-gold" />
                  <span className="text-xs font-mono text-imperial-gold">Oficial</span>
                </div>
              )}
            </div>

            {/* Soon badge */}
            {isSoon && (
              <div className="absolute bottom-3 right-3">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/40">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs font-mono text-emerald-400">Pronto</span>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Title */}
            <h3 className="font-display font-bold text-bone text-lg mb-2 line-clamp-2 group-hover:text-imperial-gold transition-colors">
              {event.name}
            </h3>

            {/* Date & Time */}
            <div className="flex items-center gap-4 mb-3 text-sm">
              <div className="flex items-center gap-1.5 text-imperial-gold/80">
                <Calendar className="w-4 h-4" />
                <span className="font-mono">{formatEventDate(event.start_date, event.end_date)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-bone/50">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatEventTime(event.start_date)}</span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-sm text-bone/60 mb-3">
              <MapPin className="w-4 h-4 text-imperial-gold/50" />
              <span className="truncate">
                {event.venue_name ? `${event.venue_name}, ` : ''}{event.city}
              </span>
            </div>

            {/* Organizer */}
            {(event.store || event.organizer) && (
              <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-void/50">
                {event.store ? (
                  <>
                    <Store className="w-4 h-4 text-imperial-gold/60" />
                    <span className="text-xs text-bone/60 font-mono">{event.store.name}</span>
                  </>
                ) : event.organizer && (
                  <>
                    <div className="w-5 h-5 rounded-full bg-void-light overflow-hidden">
                      {event.organizer.avatar_url ? (
                        <Image
                          src={event.organizer.avatar_url}
                          alt={event.organizer.display_name || event.organizer.username}
                          width={20}
                          height={20}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-bone/60">
                          {(event.organizer.display_name || event.organizer.username).charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-bone/60 font-mono">
                      {event.organizer.display_name || event.organizer.username}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Bottom row: participants & game system */}
            <div className="flex items-center justify-between pt-3 border-t border-bone/10">
              {/* Participants */}
              {event.max_participants ? (
                <div className="flex items-center gap-2">
                  <Users className={cn('w-4 h-4', isFull ? 'text-red-400' : 'text-bone/50')} />
                  <span className={cn('text-sm font-mono', isFull ? 'text-red-400' : 'text-bone/60')}>
                    {event.current_participants}/{event.max_participants}
                  </span>
                  {isFull && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-mono">
                      COMPLETO
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-bone/40">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-mono">Libre</span>
                </div>
              )}

              {/* Game system */}
              {event.game_system && (
                <span className="text-xs text-bone/40 font-mono truncate max-w-[120px]">
                  {event.game_system}
                </span>
              )}
            </div>

            {/* Entry fee */}
            {event.entry_fee && event.entry_fee > 0 && (
              <div className="mt-3 text-right">
                <span className="text-sm font-display font-bold text-imperial-gold">
                  {event.entry_fee.toFixed(2)}€
                </span>
              </div>
            )}
          </div>

          {/* Bottom color bar */}
          <div
            className="h-1 w-full"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${config.colorHex}60 50%, transparent 100%)`
            }}
          />
        </div>
      </Link>
    </motion.div>
  )
}
