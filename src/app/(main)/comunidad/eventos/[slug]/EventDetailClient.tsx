'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  Paintbrush,
  Swords,
  BookOpen,
  PartyPopper,
  Users2,
  Shield,
  Store,
  ExternalLink,
  Share2,
  Banknote,
  Gamepad2,
  Mail,
  Phone,
  Copy,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EventWithOrganizer, EventType } from '@/lib/types/database.types'

interface EventDetailClientProps {
  event: EventWithOrganizer
}

const eventTypeConfig: Record<EventType, {
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
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }

  if (!endDate) {
    return start.toLocaleDateString('es-ES', options)
  }

  const end = new Date(endDate)
  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString('es-ES', options)
  }

  const startStr = start.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
  const endStr = end.toLocaleDateString('es-ES', options)
  return `${startStr} - ${endStr}`
}

function formatEventTime(startDate: string, endDate?: string | null): string {
  const start = new Date(startDate)
  const startTime = start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

  if (endDate) {
    const end = new Date(endDate)
    const endTime = end.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    return `${startTime} - ${endTime}`
  }

  return startTime
}

function getEventStatus(event: EventWithOrganizer): { label: string; color: string } {
  const now = new Date()
  const start = new Date(event.start_date)
  const end = event.end_date ? new Date(event.end_date) : null

  if (event.status === 'cancelled') {
    return { label: 'Cancelado', color: 'bg-red-500/20 text-red-400 border-red-500/40' }
  }
  if (event.status === 'completed' || (end && now > end)) {
    return { label: 'Finalizado', color: 'bg-bone/10 text-bone/60 border-bone/20' }
  }
  if (now >= start && (!end || now <= end)) {
    return { label: 'En curso', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' }
  }

  const diffDays = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays <= 7) {
    return { label: `En ${diffDays} días`, color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' }
  }

  return { label: 'Próximamente', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40' }
}

export default function EventDetailClient({ event }: EventDetailClientProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const config = eventTypeConfig[event.event_type]
  const Icon = config.icon
  const status = getEventStatus(event)
  const isFull = event.max_participants && event.current_participants >= event.max_participants

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({
        title: event.name,
        text: `${event.name} - ${formatEventDate(event.start_date)}`,
        url
      })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero/Cover */}
      <section className="relative">
        {/* Cover image or gradient */}
        <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
          {event.cover_image ? (
            <Image
              src={event.cover_image}
              alt={event.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${config.colorHex}40 0%, rgba(10,10,15,0.9) 50%, ${config.colorHex}20 100%)`,
              }}
            />
          )}

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-void/40 to-transparent" />

          {/* Scanlines */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(251, 191, 36, 0.1) 2px, rgba(251, 191, 36, 0.1) 4px)',
            }}
          />
        </div>

        {/* Back button */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-void/80 backdrop-blur-sm border border-bone/20 rounded-lg text-bone/80 hover:text-bone hover:border-bone/40 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-mono">Volver</span>
          </button>
        </div>

        {/* Badges */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {/* Status */}
          <span className={cn('px-3 py-1.5 rounded-lg text-xs font-mono border backdrop-blur-sm', status.color)}>
            {status.label}
          </span>

          {/* Official */}
          {event.is_official && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-imperial-gold/20 border border-imperial-gold/40 text-imperial-gold text-xs font-mono backdrop-blur-sm">
              <Shield className="w-3.5 h-3.5" />
              Oficial
            </span>
          )}
        </div>

        {/* Title section */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Event type badge */}
            <div
              className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-4', config.bgColor)}
              style={{ border: `1px solid ${config.colorHex}40` }}
            >
              <Icon className={cn('w-4 h-4', config.color)} />
              <span className={cn('text-sm font-mono', config.color)}>{config.label}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-bone mb-2">
              {event.name}
            </h1>

            {/* Quick info */}
            <div className="flex flex-wrap items-center gap-4 text-bone/60">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500/60" />
                {formatEventDate(event.start_date, event.end_date)}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500/60" />
                {event.city}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {event.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-void-light/50 border border-bone/10"
              >
                <h2 className="text-lg font-display font-bold text-bone mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                  Descripción
                </h2>
                <p className="text-bone/70 font-body whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              </motion.div>
            )}

            {/* Event details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-void-light/50 border border-bone/10"
            >
              <h2 className="text-lg font-display font-bold text-bone mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                Detalles del Evento
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date */}
                <div className="p-4 rounded-xl bg-void/50 border border-bone/5">
                  <div className="flex items-center gap-2 text-amber-500/60 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-wider">Fecha</span>
                  </div>
                  <p className="text-bone font-body capitalize">
                    {formatEventDate(event.start_date, event.end_date)}
                  </p>
                </div>

                {/* Time */}
                <div className="p-4 rounded-xl bg-void/50 border border-bone/5">
                  <div className="flex items-center gap-2 text-amber-500/60 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-wider">Hora</span>
                  </div>
                  <p className="text-bone font-body">
                    {formatEventTime(event.start_date, event.end_date)}
                  </p>
                </div>

                {/* Game system */}
                {event.game_system && (
                  <div className="p-4 rounded-xl bg-void/50 border border-bone/5">
                    <div className="flex items-center gap-2 text-amber-500/60 mb-2">
                      <Gamepad2 className="w-4 h-4" />
                      <span className="text-xs font-mono uppercase tracking-wider">Sistema</span>
                    </div>
                    <p className="text-bone font-body">{event.game_system}</p>
                  </div>
                )}

                {/* Format */}
                {event.format && (
                  <div className="p-4 rounded-xl bg-void/50 border border-bone/5">
                    <div className="flex items-center gap-2 text-amber-500/60 mb-2">
                      <Trophy className="w-4 h-4" />
                      <span className="text-xs font-mono uppercase tracking-wider">Formato</span>
                    </div>
                    <p className="text-bone font-body">{event.format}</p>
                  </div>
                )}

                {/* Participants */}
                {event.max_participants && (
                  <div className="p-4 rounded-xl bg-void/50 border border-bone/5">
                    <div className="flex items-center gap-2 text-amber-500/60 mb-2">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-mono uppercase tracking-wider">Plazas</span>
                    </div>
                    <p className={cn('font-body', isFull ? 'text-red-400' : 'text-bone')}>
                      {event.current_participants} / {event.max_participants}
                      {isFull && <span className="ml-2 text-xs">(COMPLETO)</span>}
                    </p>
                  </div>
                )}

                {/* Entry fee */}
                <div className="p-4 rounded-xl bg-void/50 border border-bone/5">
                  <div className="flex items-center gap-2 text-amber-500/60 mb-2">
                    <Banknote className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-wider">Entrada</span>
                  </div>
                  <p className="text-bone font-body">
                    {event.entry_fee ? `${event.entry_fee.toFixed(2)}€` : 'Gratis'}
                  </p>
                </div>
              </div>

              {/* Prizes */}
              {event.prizes && (
                <div className="mt-4 p-4 rounded-xl bg-imperial-gold/5 border border-imperial-gold/20">
                  <div className="flex items-center gap-2 text-imperial-gold/80 mb-2">
                    <Trophy className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-wider">Premios</span>
                  </div>
                  <p className="text-bone/80 font-body">{event.prizes}</p>
                </div>
              )}
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl bg-void-light/50 border border-bone/10"
            >
              <h2 className="text-lg font-display font-bold text-bone mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                Ubicación
              </h2>

              <div className="space-y-3">
                {event.venue_name && (
                  <p className="text-bone font-display font-semibold">{event.venue_name}</p>
                )}
                <p className="text-bone/70 font-body">{event.address}</p>
                <p className="text-bone/50 font-body">
                  {event.postal_code && `${event.postal_code} `}{event.city}
                  {event.province && `, ${event.province}`}
                </p>

                {/* Map link */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver en Google Maps
                </a>
              </div>
            </motion.div>
          </div>

          {/* Right column - Sidebar */}
          <div className="space-y-6">
            {/* Organizer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-void-light/50 border border-bone/10"
            >
              <h3 className="text-sm font-mono text-amber-500/60 uppercase tracking-wider mb-4">
                Organizado por
              </h3>

              {event.store ? (
                <Link
                  href={`/comunidad/tiendas/${event.store.slug}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-void/50 border border-bone/10 hover:border-imperial-gold/30 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg bg-imperial-gold/10 border border-imperial-gold/20 flex items-center justify-center">
                    <Store className="w-6 h-6 text-imperial-gold" />
                  </div>
                  <div>
                    <p className="text-bone font-display font-semibold group-hover:text-imperial-gold transition-colors">
                      {event.store.name}
                    </p>
                    <p className="text-xs text-bone/50 font-mono">Tienda verificada</p>
                  </div>
                </Link>
              ) : event.organizer && (
                <Link
                  href={`/usuarios/${event.organizer.username}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-void/50 border border-bone/10 hover:border-amber-500/30 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-void-light overflow-hidden border border-bone/20">
                    {event.organizer.avatar_url ? (
                      <Image
                        src={event.organizer.avatar_url}
                        alt={event.organizer.display_name || event.organizer.username}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg text-bone/60">
                        {(event.organizer.display_name || event.organizer.username).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-bone font-display font-semibold group-hover:text-amber-400 transition-colors">
                      {event.organizer.display_name || event.organizer.username}
                    </p>
                    <p className="text-xs text-bone/50 font-mono">@{event.organizer.username}</p>
                  </div>
                </Link>
              )}
            </motion.div>

            {/* Contact */}
            {(event.contact_email || event.contact_phone || event.external_url) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-2xl bg-void-light/50 border border-bone/10"
              >
                <h3 className="text-sm font-mono text-amber-500/60 uppercase tracking-wider mb-4">
                  Contacto
                </h3>

                <div className="space-y-3">
                  {event.contact_email && (
                    <a
                      href={`mailto:${event.contact_email}`}
                      className="flex items-center gap-3 text-bone/70 hover:text-amber-400 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="text-sm font-body">{event.contact_email}</span>
                    </a>
                  )}
                  {event.contact_phone && (
                    <a
                      href={`tel:${event.contact_phone}`}
                      className="flex items-center gap-3 text-bone/70 hover:text-amber-400 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span className="text-sm font-body">{event.contact_phone}</span>
                    </a>
                  )}
                  {event.external_url && (
                    <a
                      href={event.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="text-sm font-body">Más información</span>
                    </a>
                  )}
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              {/* Share button */}
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-void-light border border-bone/20 rounded-xl text-bone hover:border-bone/40 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span className="font-display">Enlace copiado</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-5 h-5" />
                    <span className="font-display">Compartir evento</span>
                  </>
                )}
              </button>

              {/* Back to events */}
              <Link
                href="/comunidad/eventos"
                className="block w-full text-center px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 hover:bg-amber-500/20 transition-colors font-display"
              >
                Ver todos los eventos
              </Link>
            </motion.div>

            {/* Chronus footer */}
            <div className="text-center pt-4">
              <p className="text-[10px] font-mono text-bone/30 tracking-wider">
                CHRONUS EVENTUS<br />
                REGISTRO TEMPORAL
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
