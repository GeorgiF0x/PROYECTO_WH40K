'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Users,
  Star,
  StarOff,
  ChevronDown,
  ChevronUp,
  Eye,
  AlertTriangle,
  RefreshCw,
  Trophy,
  Palette,
  Gamepad2,
  Tent,
  Package,
  Coffee,
  HelpCircle,
  ExternalLink,
  DollarSign,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui'
import type { Event, EventStatus, EventType, Profile } from '@/lib/types/database.types'

type EventWithOrganizer = Event & {
  organizer: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'> | null
}

const STATUS_LABELS: Record<EventStatus, { label: string; color: string; icon: typeof Clock }> = {
  draft: { label: 'Borrador', color: 'text-bone/50 bg-bone/5 border-bone/10', icon: Clock },
  upcoming: { label: 'Próximo', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: Calendar },
  ongoing: { label: 'En Curso', color: 'text-green-500 bg-green-500/10 border-green-500/20', icon: CheckCircle },
  completed: { label: 'Completado', color: 'text-bone/50 bg-bone/5 border-bone/10', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'text-red-500 bg-red-500/10 border-red-500/20', icon: XCircle },
}

const EVENT_TYPE_LABELS: Record<EventType, { label: string; icon: typeof Trophy; color: string }> = {
  tournament: { label: 'Torneo', icon: Trophy, color: 'text-gold' },
  painting_workshop: { label: 'Taller de Pintura', icon: Palette, color: 'text-purple-400' },
  casual_play: { label: 'Partidas Casuales', icon: Gamepad2, color: 'text-green-400' },
  campaign: { label: 'Campaña', icon: Tent, color: 'text-amber-400' },
  release_event: { label: 'Evento de Lanzamiento', icon: Package, color: 'text-blue-400' },
  meetup: { label: 'Quedada', icon: Coffee, color: 'text-pink-400' },
  other: { label: 'Otro', icon: HelpCircle, color: 'text-bone/50' },
}

export default function EventsManagementPage() {
  const [events, setEvents] = useState<EventWithOrganizer[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('upcoming')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const supabase = createClient()

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('events')
      .select(`
        *,
        organizer:profiles!events_organizer_id_fkey(
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .order('start_date', { ascending: true })

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching events:', error)
    } else {
      setEvents(data as EventWithOrganizer[])
    }
    setLoading(false)
  }, [supabase, statusFilter, searchQuery])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleToggleFeatured = async (eventId: string, currentFeatured: boolean) => {
    setActionLoading(eventId)

    const { error } = await supabase
      .from('events')
      .update({ is_featured: !currentFeatured })
      .eq('id', eventId)

    if (error) {
      console.error('Error updating featured status:', error)
      alert('Error al actualizar el estado destacado')
    } else {
      fetchEvents()
    }
    setActionLoading(null)
  }

  const handleChangeStatus = async (eventId: string, newStatus: EventStatus) => {
    setActionLoading(eventId)

    const { error } = await supabase
      .from('events')
      .update({ status: newStatus })
      .eq('id', eventId)

    if (error) {
      console.error('Error updating status:', error)
      alert('Error al cambiar el estado')
    } else {
      fetchEvents()
    }
    setActionLoading(null)
  }

  const toggleExpanded = (eventId: string) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId)
  }

  const upcomingCount = events.filter(e => e.status === 'upcoming').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bone flex items-center gap-3">
            <Calendar className="w-7 h-7 text-amber-400" />
            Gestión de Eventos
          </h1>
          <p className="text-bone/50 mt-1">
            Administra los eventos de la comunidad
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone/70">
            {events.length} eventos
          </span>
          {upcomingCount > 0 && (
            <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-400">
              {upcomingCount} próximos
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bone/40" />
          <input
            type="text"
            placeholder="Buscar por nombre o ciudad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone placeholder:text-bone/40 focus:outline-none focus:border-gold/30"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'upcoming', 'ongoing', 'completed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                statusFilter === status
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-bone/5 text-bone/70 border border-bone/10 hover:bg-bone/10'
              )}
            >
              {status === 'all' ? 'Todos' : STATUS_LABELS[status].label}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={fetchEvents}
          disabled={loading}
          className="p-2.5 bg-bone/5 border border-bone/10 rounded-lg text-bone/70 hover:text-bone hover:bg-bone/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-bone/5 border border-bone/10 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-bone/5 border border-bone/10 rounded-lg">
            <Calendar className="w-12 h-12 text-bone/30 mx-auto mb-4" />
            <p className="text-bone/50">No hay eventos {statusFilter !== 'all' ? STATUS_LABELS[statusFilter].label.toLowerCase() + 's' : ''}</p>
          </div>
        ) : (
          <AnimatePresence>
            {events.map((event) => {
              const statusInfo = STATUS_LABELS[event.status]
              const StatusIcon = statusInfo.icon
              const typeInfo = EVENT_TYPE_LABELS[event.event_type]
              const TypeIcon = typeInfo.icon
              const isExpanded = expandedEvent === event.id
              const startDate = new Date(event.start_date)
              const isPast = startDate < new Date()

              return (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={cn(
                    'bg-void-light border rounded-lg overflow-hidden',
                    event.is_featured ? 'border-gold/30' : 'border-bone/10'
                  )}
                >
                  {/* Featured Badge */}
                  {event.is_featured && (
                    <div className="bg-gradient-to-r from-gold/20 to-transparent px-4 py-1 text-xs text-gold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-gold" />
                      Evento Destacado
                    </div>
                  )}

                  {/* Main Row */}
                  <div
                    className="p-4 cursor-pointer hover:bg-bone/5 transition-colors"
                    onClick={() => toggleExpanded(event.id)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Event Image */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-bone/10 flex-shrink-0">
                        {event.cover_image ? (
                          <Image
                            src={event.cover_image}
                            alt={event.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <TypeIcon className={cn('w-8 h-8', typeInfo.color)} />
                          </div>
                        )}
                      </div>

                      {/* Event Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-bone truncate">{event.name}</h3>
                          <span className={cn('px-2 py-0.5 rounded text-xs border flex items-center gap-1', statusInfo.color)}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </span>
                          <span className={cn('px-2 py-0.5 rounded text-xs flex items-center gap-1', typeInfo.color, 'bg-current/10')}>
                            <TypeIcon className="w-3 h-3" />
                            {typeInfo.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-bone/50 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.city}
                          </span>
                          {event.max_participants && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {event.current_participants}/{event.max_participants}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-bone/40 mt-1">
                          Por @{event.organizer?.username || 'desconocido'}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleFeatured(event.id, event.is_featured)
                          }}
                          disabled={actionLoading === event.id}
                          className={cn(
                            'p-2 rounded-lg transition-colors disabled:opacity-50',
                            event.is_featured
                              ? 'bg-gold/10 border border-gold/20 text-gold'
                              : 'bg-bone/5 border border-bone/10 text-bone/50 hover:text-gold hover:border-gold/20'
                          )}
                          title={event.is_featured ? 'Quitar destacado' : 'Destacar'}
                        >
                          {event.is_featured ? <Star className="w-5 h-5 fill-gold" /> : <StarOff className="w-5 h-5" />}
                        </button>
                        <Link
                          href={`/comunidad/eventos/${event.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 bg-bone/5 border border-bone/10 rounded-lg text-bone/50 hover:text-bone hover:bg-bone/10 transition-colors"
                          title="Ver evento"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-bone/30" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-bone/30" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-2 border-t border-bone/10 space-y-4">
                          {/* Description */}
                          {event.description && (
                            <div>
                              <h4 className="text-xs font-medium text-bone/50 uppercase tracking-wider mb-1">Descripción</h4>
                              <p className="text-sm text-bone/70">{event.description}</p>
                            </div>
                          )}

                          {/* Event Details Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-3 bg-bone/5 rounded-lg">
                              <h4 className="text-xs text-bone/50 mb-1">Fecha</h4>
                              <p className="text-sm font-medium text-bone">
                                {startDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                              </p>
                            </div>
                            <div className="p-3 bg-bone/5 rounded-lg">
                              <h4 className="text-xs text-bone/50 mb-1">Ubicación</h4>
                              <p className="text-sm font-medium text-bone truncate">
                                {event.venue_name || event.address}
                              </p>
                            </div>
                            {event.entry_fee !== null && (
                              <div className="p-3 bg-bone/5 rounded-lg">
                                <h4 className="text-xs text-bone/50 mb-1">Entrada</h4>
                                <p className="text-sm font-medium text-bone flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  {event.entry_fee === 0 ? 'Gratis' : `${event.entry_fee}€`}
                                </p>
                              </div>
                            )}
                            {event.game_system && (
                              <div className="p-3 bg-bone/5 rounded-lg">
                                <h4 className="text-xs text-bone/50 mb-1">Sistema</h4>
                                <p className="text-sm font-medium text-bone">{event.game_system}</p>
                              </div>
                            )}
                          </div>

                          {/* Organizer */}
                          <div className="flex items-center gap-3 p-3 bg-bone/5 rounded-lg">
                            <Avatar
                              src={event.organizer?.avatar_url}
                              alt={event.organizer?.username || 'Organizador'}
                              size="sm"
                            />
                            <div>
                              <p className="text-sm font-medium text-bone">
                                {event.organizer?.display_name || event.organizer?.username || 'Organizador'}
                              </p>
                              <p className="text-xs text-bone/50">Organizador</p>
                            </div>
                            {event.organizer && (
                              <Link
                                href={`/usuarios/${event.organizer.username}`}
                                className="ml-auto p-1.5 bg-bone/10 rounded hover:bg-bone/20 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4 text-bone/50" />
                              </Link>
                            )}
                          </div>

                          {/* Status Change Buttons */}
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-bone/10">
                            <span className="text-xs text-bone/50 self-center mr-2">Cambiar estado:</span>
                            {(['upcoming', 'ongoing', 'completed', 'cancelled'] as const).map((status) => (
                              <button
                                key={status}
                                onClick={() => handleChangeStatus(event.id, status)}
                                disabled={actionLoading === event.id || event.status === status}
                                className={cn(
                                  'px-3 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50',
                                  event.status === status
                                    ? STATUS_LABELS[status].color
                                    : 'bg-bone/5 border border-bone/10 text-bone/70 hover:bg-bone/10'
                                )}
                              >
                                {STATUS_LABELS[status].label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
