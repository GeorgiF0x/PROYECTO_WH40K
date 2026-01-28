import { Suspense } from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import {
  Calendar,
  Plus,
  ChevronRight,
  Clock,
  MapPin,
  Shield,
  Users,
  Sparkles,
  Trophy
} from 'lucide-react'
import { EventGrid, EventFilters } from '@/components/events'
import EventsMapWrapper from '@/components/events/EventsMapWrapper'
import type { EventWithOrganizer, EventType } from '@/lib/types/database.types'

export const metadata: Metadata = {
  title: 'Eventos | Chronus Eventus',
  description: 'Calendario de eventos de Warhammer 40K. Torneos, talleres de pintura, campañas y quedadas de la comunidad.'
}

interface SearchParams {
  type?: string
  tier?: string
  past?: string
  q?: string
}

async function getEvents(searchParams: SearchParams): Promise<EventWithOrganizer[]> {
  const supabase = await createClient()

  let query = supabase
    .from('events')
    .select(`
      *,
      organizer:organizer_id(id, username, display_name, avatar_url, creator_status),
      store:store_id(id, name, slug)
    `)
    .in('status', ['upcoming', 'ongoing'])
    .order('start_date', { ascending: true })

  // Include past events if requested
  if (searchParams.past === 'true') {
    query = supabase
      .from('events')
      .select(`
        *,
        organizer:organizer_id(id, username, display_name, avatar_url, creator_status),
        store:store_id(id, name, slug)
      `)
      .in('status', ['upcoming', 'ongoing', 'completed'])
      .order('start_date', { ascending: false })
  }

  // Filter by event type
  if (searchParams.type && searchParams.type !== 'all') {
    query = query.eq('event_type', searchParams.type as EventType)
  }

  // Filter by tier (official/community)
  if (searchParams.tier === 'official') {
    query = query.eq('is_official', true)
  } else if (searchParams.tier === 'community') {
    query = query.eq('is_official', false)
  }

  // Search by name
  if (searchParams.q) {
    query = query.ilike('name', `%${searchParams.q}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching events:', error)
    return []
  }

  return (data as unknown as EventWithOrganizer[]) || []
}

async function getEventStats() {
  const supabase = await createClient()

  const [upcomingResult, officialResult] = await Promise.all([
    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .in('status', ['upcoming', 'ongoing']),
    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .in('status', ['upcoming', 'ongoing'])
      .eq('is_official', true)
  ])

  return {
    upcoming: upcomingResult.count || 0,
    official: officialResult.count || 0
  }
}

// Hourglass SVG decoration
function Hourglass({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 4h14M5 20h14M7 4v2a5 5 0 005 5 5 5 0 005-5V4M7 20v-2a5 5 0 015-5 5 5 0 015 5v2" />
      <path d="M12 11v2" strokeLinecap="round" />
    </svg>
  )
}

export default async function EventosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const [events, stats] = await Promise.all([
    getEvents(params),
    getEventStats()
  ])

  // Get events with coordinates for the map
  const mapEvents = events.filter(e => e.latitude && e.longitude)

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section - Chronus Eventus Theme */}
      <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-void via-void-light/30 to-void" />

        {/* Clock/time pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.3) 0%, transparent 50%)
            `,
          }}
        />

        {/* Animated hourglass decorations */}
        <div className="absolute top-12 left-12 text-amber-500/10 hidden lg:block">
          <Hourglass className="w-20 h-20" />
        </div>
        <div className="absolute bottom-12 right-12 text-amber-500/10 hidden lg:block rotate-180">
          <Hourglass className="w-16 h-16" />
        </div>

        {/* Time markers */}
        <div className="absolute top-20 right-1/4 text-[10px] font-mono text-amber-500/20 tracking-wider hidden md:block">
          M41.126
        </div>
        <div className="absolute bottom-20 left-1/4 text-[10px] font-mono text-amber-500/20 tracking-wider hidden md:block">
          ++CHRONUS ACTIVE++
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-void-light/80 border border-amber-500/30 mb-6">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-mono text-amber-500/80 tracking-[0.2em] uppercase">
              Chronus Eventus
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-bone mb-4 tracking-wide">
            Calendario Imperial
          </h1>
          <p className="text-bone/60 font-body text-lg max-w-2xl mx-auto mb-8">
            Registro temporal de acontecimientos. Torneos, talleres de pintura,
            campañas narrativas y encuentros de la comunidad del Imperium.
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 mb-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-3xl font-display font-bold text-amber-400">
                <Calendar className="w-6 h-6" />
                {stats.upcoming}
              </div>
              <div className="text-xs font-mono text-bone/50 tracking-wider uppercase mt-1">Proximos</div>
            </div>
            <div className="w-px h-12 bg-amber-500/20" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-3xl font-display font-bold text-imperial-gold">
                <Shield className="w-6 h-6" />
                {stats.official}
              </div>
              <div className="text-xs font-mono text-bone/50 tracking-wider uppercase mt-1">Oficiales</div>
            </div>
            <div className="w-px h-12 bg-amber-500/20" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-400">
                <Sparkles className="w-5 h-5" />
                <Trophy className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono text-bone/50 tracking-wider uppercase mt-1">En Vivo</div>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/comunidad/eventos/nuevo"
            className="group inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-b from-amber-500/20 to-amber-500/10 border border-amber-500/40 hover:border-amber-500/60 hover:from-amber-500/30 hover:to-amber-500/15 transition-all duration-300"
          >
            <Plus className="w-5 h-5 text-amber-400" />
            <span className="font-display font-semibold text-amber-400 tracking-wide">
              Crear Evento
            </span>
            <ChevronRight className="w-4 h-4 text-amber-400/60 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4 max-w-7xl mx-auto px-6">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rotate-45 bg-amber-500/40" />
          <Clock className="w-4 h-4 text-amber-500/40" />
          <div className="w-1.5 h-1.5 rotate-45 bg-amber-500/40" />
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
      </div>

      {/* Map Section */}
      {mapEvents.length > 0 && (
        <section className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <MapPin className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h2 className="font-display font-bold text-bone text-lg">Mapa de Eventos</h2>
                <p className="text-xs font-mono text-bone/40 tracking-wider">LOCALIZACION TEMPORAL</p>
              </div>
            </div>

            <Suspense fallback={<MapSkeleton />}>
              <EventsMapWrapper
                events={mapEvents}
                className="h-[400px] rounded-2xl border border-amber-500/20"
              />
            </Suspense>

            {/* Map legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 p-3 rounded-lg bg-void-light/50 border border-bone/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-xs text-bone/50 font-mono">Torneo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-400" />
                <span className="text-xs text-bone/50 font-mono">Taller</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <span className="text-xs text-bone/50 font-mono">Casual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs text-bone/50 font-mono">Campaña</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-xs text-bone/50 font-mono">Lanzamiento</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400" />
                <span className="text-xs text-bone/50 font-mono">Quedada</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <Calendar className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h2 className="font-display font-bold text-bone text-lg">Proximos Eventos</h2>
                <p className="text-xs font-mono text-bone/40 tracking-wider">REGISTRO CHRONUS</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Suspense fallback={<FiltersSkeleton />}>
            <EventFilters className="mb-8" />
          </Suspense>

          {/* Results indicator */}
          <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-void-light/50 border border-bone/10">
            <Clock className="w-4 h-4 text-amber-500/60" />
            <p className="text-sm text-bone/60 font-mono">
              <span className="text-amber-400 font-semibold">{events.length}</span>
              {' '}{events.length === 1 ? 'evento registrado' : 'eventos registrados'} en el Chronus
            </p>
          </div>

          {/* Event grid */}
          <EventGrid
            events={events}
            emptyMessage="No se hallaron eventos con los criterios especificados en el registro temporal"
          />

          {/* Bottom decoration */}
          <div className="mt-12 flex items-center justify-center">
            <div className="flex items-center gap-4 px-6 py-3 rounded-lg bg-void-light/30 border border-bone/10">
              <Clock className="w-4 h-4 text-amber-500/40" />
              <span className="text-xs font-mono text-bone/40 tracking-wider">
                CHRONUS EVENTUS • REGISTRO TEMPORAL • ADMINISTRATUM
              </span>
              <Clock className="w-4 h-4 text-amber-500/40 scale-x-[-1]" />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile CTA */}
      <div className="sm:hidden fixed bottom-6 right-6 z-40">
        <Link
          href="/comunidad/eventos/nuevo"
          className="flex items-center justify-center w-14 h-14 bg-amber-500 text-void rounded-full shadow-lg shadow-amber-500/30 hover:scale-105 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </div>
    </div>
  )
}

function MapSkeleton() {
  return (
    <div className="w-full h-[400px] bg-void-light rounded-2xl animate-pulse border border-amber-500/20 flex items-center justify-center">
      <MapPin className="w-12 h-12 text-bone/20" />
    </div>
  )
}

function FiltersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-12 bg-void-light/50 rounded-xl animate-pulse" />
        <div className="w-28 h-12 bg-void-light/30 rounded-xl animate-pulse" />
      </div>
    </div>
  )
}
