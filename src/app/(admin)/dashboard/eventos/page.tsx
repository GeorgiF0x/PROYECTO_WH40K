'use client'

import * as React from 'react'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  ExternalLink,
  Trophy,
  Palette,
  Gamepad2,
  Swords,
  Gift,
  UsersRound,
  Star,
} from 'lucide-react'
import { DataTable, StatusBadge, FilterTabs, type Column, type Action } from '../components/ui/data-table'
import { Modal, ConfirmDialog } from '../components/ui/modal'
import { Button } from '../components/ui/button'
import { createClient } from '@/lib/supabase/client'

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

interface EventItem {
  [key: string]: unknown
  id: string
  name: string
  slug: string
  description: string | null
  event_type: 'tournament' | 'painting_workshop' | 'casual_play' | 'campaign' | 'release_event' | 'meetup' | 'other'
  status: 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  start_date: string
  end_date: string | null
  city: string
  address: string
  venue_name: string | null
  max_participants: number | null
  current_participants: number | null
  entry_fee: number | null
  is_featured: boolean | null
  created_at: string | null
  organizer_id: string
  organizer?: {
    username: string
    display_name: string | null
  }
}

type EventStatus = 'all' | 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

const eventTypeLabels: Record<string, string> = {
  tournament: 'Torneo',
  painting_workshop: 'Taller de Pintura',
  casual_play: 'Partidas Casuales',
  campaign: 'Campaña',
  release_event: 'Lanzamiento',
  meetup: 'Quedada',
  other: 'Otro',
}

const eventTypeIcons: Record<string, React.ReactNode> = {
  tournament: <Trophy className="w-3.5 h-3.5" />,
  painting_workshop: <Palette className="w-3.5 h-3.5" />,
  casual_play: <Gamepad2 className="w-3.5 h-3.5" />,
  campaign: <Swords className="w-3.5 h-3.5" />,
  release_event: <Gift className="w-3.5 h-3.5" />,
  meetup: <UsersRound className="w-3.5 h-3.5" />,
  other: <Calendar className="w-3.5 h-3.5" />,
}

const eventTypeColors: Record<string, string> = {
  tournament: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  painting_workshop: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  casual_play: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  campaign: 'bg-red-500/10 text-red-400 border-red-500/20',
  release_event: 'bg-green-500/10 text-green-400 border-green-500/20',
  meetup: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  other: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
}

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  upcoming: 'Próximo',
  ongoing: 'En Curso',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

// ══════════════════════════════════════════════════════════════
// EVENTOS PAGE
// ══════════════════════════════════════════════════════════════

export default function EventosPage() {
  const searchParams = useSearchParams()
  const initialStatus = (searchParams.get('status') as EventStatus) || 'all'

  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<EventStatus>(initialStatus)
  const [counts, setCounts] = useState({
    all: 0,
    draft: 0,
    upcoming: 0,
    ongoing: 0,
    completed: 0,
    cancelled: 0,
  })

  // Modal states
  const [viewEvent, setViewEvent] = useState<EventItem | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    event: EventItem
    action: 'feature' | 'unfeature' | 'cancel' | 'delete'
  } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Fetch events
  const fetchEvents = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          organizer:profiles!events_organizer_id_fkey(username, display_name)
        `)
        .order('start_date', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setEvents(data || [])

      // Get counts
      const [
        { count: allCount },
        { count: draftCount },
        { count: upcomingCount },
        { count: ongoingCount },
        { count: completedCount },
        { count: cancelledCount },
      ] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'upcoming'),
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'ongoing'),
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
      ])

      setCounts({
        all: allCount || 0,
        draft: draftCount || 0,
        upcoming: upcomingCount || 0,
        ongoing: ongoingCount || 0,
        completed: completedCount || 0,
        cancelled: cancelledCount || 0,
      })
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Handle actions
  const handleAction = async () => {
    if (!confirmAction) return

    setActionLoading(true)
    const supabase = createClient()

    try {
      if (confirmAction.action === 'delete') {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', confirmAction.event.id)
        if (error) throw error
      } else if (confirmAction.action === 'cancel') {
        const { error } = await supabase
          .from('events')
          .update({ status: 'cancelled' })
          .eq('id', confirmAction.event.id)
        if (error) throw error
      } else if (confirmAction.action === 'feature' || confirmAction.action === 'unfeature') {
        const { error } = await supabase
          .from('events')
          .update({ is_featured: confirmAction.action === 'feature' })
          .eq('id', confirmAction.event.id)
        if (error) throw error
      }

      setConfirmAction(null)
      fetchEvents()
    } catch (error) {
      console.error('Error performing action:', error)
    } finally {
      setActionLoading(false)
    }
  }

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Table columns
  const columns: Column<EventItem>[] = [
    {
      key: 'name',
      header: 'Evento',
      sortable: true,
      render: (event) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-zinc-800 rounded-lg flex items-center justify-center">
            {eventTypeIcons[event.event_type] || <Calendar className="w-4 h-4 text-zinc-400" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-white">{event.name}</p>
              {event.is_featured && (
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              )}
            </div>
            <p className="text-xs text-zinc-500">
              {event.organizer?.display_name || event.organizer?.username || 'Sin organizador'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'event_type',
      header: 'Tipo',
      sortable: true,
      width: '140px',
      render: (event) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border ${
            eventTypeColors[event.event_type] || 'bg-zinc-800 text-zinc-400'
          }`}
        >
          {eventTypeIcons[event.event_type]}
          {eventTypeLabels[event.event_type] || event.event_type}
        </span>
      ),
    },
    {
      key: 'start_date',
      header: 'Fecha',
      sortable: true,
      width: '120px',
      render: (event) => (
        <div className="flex items-center gap-2 text-zinc-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatDate(event.start_date)}</span>
        </div>
      ),
    },
    {
      key: 'city',
      header: 'Ubicación',
      sortable: true,
      render: (event) => (
        <div className="flex items-center gap-2 text-zinc-400">
          <MapPin className="w-3.5 h-3.5" />
          <span>{event.city}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      width: '120px',
      render: (event) => (
        <StatusBadge
          status={event.status === 'upcoming' ? 'pending' : event.status === 'ongoing' ? 'active' : event.status === 'completed' ? 'approved' : event.status === 'cancelled' ? 'rejected' : 'inactive'}
          labels={statusLabels}
        />
      ),
    },
  ]

  // Table actions
  const actions: Action<EventItem>[] = [
    {
      label: 'Ver detalles',
      icon: <Eye className="w-4 h-4" />,
      onClick: (event) => setViewEvent(event),
    },
    {
      label: (event) => event.is_featured ? 'Quitar destacado' : 'Destacar',
      icon: <Star className="w-4 h-4" />,
      onClick: (event) => setConfirmAction({
        event,
        action: event.is_featured ? 'unfeature' : 'feature',
      }),
    },
    {
      label: 'Cancelar evento',
      icon: <XCircle className="w-4 h-4" />,
      onClick: (event) => setConfirmAction({ event, action: 'cancel' }),
      show: (event) => event.status !== 'cancelled' && event.status !== 'completed',
    },
    {
      label: 'Eliminar',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (event) => setConfirmAction({ event, action: 'delete' }),
      variant: 'danger',
    },
  ]

  // Filter tabs
  const filterTabs = [
    { key: 'all', label: 'Todos', count: counts.all },
    { key: 'upcoming', label: 'Próximos', count: counts.upcoming },
    { key: 'ongoing', label: 'En Curso', count: counts.ongoing },
    { key: 'draft', label: 'Borradores', count: counts.draft },
    { key: 'completed', label: 'Completados', count: counts.completed },
    { key: 'cancelled', label: 'Cancelados', count: counts.cancelled },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Eventos</h1>
          <p className="text-sm text-zinc-400">Gestiona los eventos de la comunidad</p>
        </div>
      </div>

      {/* Filters */}
      <FilterTabs
        tabs={filterTabs}
        activeTab={statusFilter}
        onChange={(key) => setStatusFilter(key as EventStatus)}
      />

      {/* Table */}
      <DataTable
        data={events}
        columns={columns}
        actions={actions}
        keyField="id"
        searchPlaceholder="Buscar por nombre, ciudad..."
        searchFields={['name', 'city', 'description']}
        loading={loading}
        emptyMessage="No hay eventos"
        emptyIcon={<Calendar className="w-8 h-8 text-zinc-600 mx-auto" />}
        pageSize={10}
      />

      {/* View Modal */}
      <Modal
        open={!!viewEvent}
        onClose={() => setViewEvent(null)}
        title={viewEvent?.name || 'Detalles del evento'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setViewEvent(null)}>
              Cerrar
            </Button>
            {viewEvent && (
              <Button asChild>
                <Link
                  href={`/comunidad/eventos/${viewEvent.slug}`}
                  target="_blank"
                >
                  Ver página
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </Button>
            )}
          </>
        }
      >
        {viewEvent && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge
                status={viewEvent.status === 'upcoming' ? 'pending' : viewEvent.status === 'ongoing' ? 'active' : viewEvent.status === 'completed' ? 'approved' : viewEvent.status === 'cancelled' ? 'rejected' : 'inactive'}
                labels={statusLabels}
              />
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border ${
                  eventTypeColors[viewEvent.event_type]
                }`}
              >
                {eventTypeIcons[viewEvent.event_type]}
                {eventTypeLabels[viewEvent.event_type]}
              </span>
              {viewEvent.is_featured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Star className="w-3 h-3 fill-current" />
                  Destacado
                </span>
              )}
            </div>

            {viewEvent.description && (
              <p className="text-sm text-zinc-300">{viewEvent.description}</p>
            )}

            <div className="grid gap-3 pt-2">
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-zinc-500" />
                <div>
                  <p className="text-zinc-300">{formatDateTime(viewEvent.start_date)}</p>
                  {viewEvent.end_date && (
                    <p className="text-zinc-500">hasta {formatDateTime(viewEvent.end_date)}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-zinc-500 mt-0.5" />
                <div>
                  {viewEvent.venue_name && (
                    <p className="text-zinc-300">{viewEvent.venue_name}</p>
                  )}
                  <p className="text-zinc-400">{viewEvent.address}</p>
                  <p className="text-zinc-500">{viewEvent.city}</p>
                </div>
              </div>

              {viewEvent.max_participants && (
                <div className="flex items-center gap-3 text-sm">
                  <Users className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-300">
                    {viewEvent.current_participants ?? 0} / {viewEvent.max_participants} participantes
                  </span>
                </div>
              )}

              {viewEvent.entry_fee !== null && viewEvent.entry_fee > 0 && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-zinc-500">Precio:</span>
                  <span className="text-zinc-300">{viewEvent.entry_fee}€</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-800">
              <p className="text-xs text-zinc-500">Organizador</p>
              <p className="text-sm text-zinc-300">
                {viewEvent.organizer?.display_name || viewEvent.organizer?.username || 'Desconocido'}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleAction}
        title={
          confirmAction?.action === 'feature'
            ? 'Destacar evento'
            : confirmAction?.action === 'unfeature'
            ? 'Quitar destacado'
            : confirmAction?.action === 'cancel'
            ? 'Cancelar evento'
            : 'Eliminar evento'
        }
        description={
          confirmAction?.action === 'feature'
            ? `¿Destacar "${confirmAction?.event.name}"? Aparecerá en la portada.`
            : confirmAction?.action === 'unfeature'
            ? `¿Quitar el destacado de "${confirmAction?.event.name}"?`
            : confirmAction?.action === 'cancel'
            ? `¿Cancelar "${confirmAction?.event.name}"? Los participantes serán notificados.`
            : `¿Eliminar "${confirmAction?.event.name}"? Esta acción no se puede deshacer.`
        }
        confirmLabel={
          confirmAction?.action === 'feature'
            ? 'Destacar'
            : confirmAction?.action === 'unfeature'
            ? 'Quitar'
            : confirmAction?.action === 'cancel'
            ? 'Cancelar evento'
            : 'Eliminar'
        }
        variant={confirmAction?.action === 'delete' || confirmAction?.action === 'cancel' ? 'danger' : 'default'}
        loading={actionLoading}
      />
    </div>
  )
}
