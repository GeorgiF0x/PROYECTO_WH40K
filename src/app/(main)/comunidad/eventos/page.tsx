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
  Trophy,
} from 'lucide-react'
import { EventGrid, EventFilters } from '@/components/events'
import EventsMapWrapper from '@/components/events/EventsMapWrapper'
import type { EventWithOrganizer, EventType } from '@/lib/types/database.types'

export const metadata: Metadata = {
  title: 'Eventos | Chronus Eventus',
  description:
    'Calendario de eventos de Warhammer 40K. Torneos, talleres de pintura, campañas y quedadas de la comunidad.',
}

// Events change a few times a day. 5 minutes keeps the CDN warm without
// holding onto stale data when an event is added or cancelled.
export const revalidate = 300

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
    .select(
      `
      *,
      organizer:organizer_id(id, username, display_name, avatar_url, creator_status),
      store:store_id(id, name, slug)
    `
    )
    .in('status', ['upcoming', 'ongoing'])
    .order('start_date', { ascending: true })

  // Include past events if requested
  if (searchParams.past === 'true') {
    query = supabase
      .from('events')
      .select(
        `
        *,
        organizer:organizer_id(id, username, display_name, avatar_url, creator_status),
        store:store_id(id, name, slug)
      `
      )
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

  const { data, error } = await query.limit(12)

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
      .eq('is_official', true),
  ])

  return {
    upcoming: upcomingResult.count || 0,
    official: officialResult.count || 0,
  }
}

// Hourglass SVG decoration
function Hourglass({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
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
  const [events, stats] = await Promise.all([getEvents(params), getEventStats()])

  // Get events with coordinates for the map
  const mapEvents = events.filter((e) => e.latitude && e.longitude)

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section - Chronus Eventus Theme */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-32">
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
        <div className="absolute left-12 top-12 hidden text-amber-500/10 lg:block">
          <Hourglass className="h-20 w-20" />
        </div>
        <div className="absolute bottom-12 right-12 hidden rotate-180 text-amber-500/10 lg:block">
          <Hourglass className="h-16 w-16" />
        </div>

        {/* Time markers */}
        <div className="absolute right-1/4 top-20 hidden font-mono text-[10px] tracking-wider text-amber-500/20 md:block">
          M41.126
        </div>
        <div className="absolute bottom-20 left-1/4 hidden font-mono text-[10px] tracking-wider text-amber-500/20 md:block">
          ++CHRONUS ACTIVE++
        </div>

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-3 rounded-lg border border-amber-500/30 bg-void-light/80 px-4 py-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-amber-500/80">
              Chronus Eventus
            </span>
          </div>

          {/* Title */}
          <h1 className="mb-4 font-display text-4xl font-bold tracking-wide text-bone sm:text-5xl lg:text-6xl">
            Calendario Imperial
          </h1>
          <p className="mx-auto mb-8 max-w-2xl font-body text-lg text-bone/60">
            Registro temporal de acontecimientos. Torneos, talleres de pintura, campañas narrativas
            y encuentros de la comunidad del Imperium.
          </p>

          {/* Stats row */}
          <div className="mb-8 flex items-center justify-center gap-6 sm:gap-10">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 font-display text-3xl font-bold text-amber-400">
                <Calendar className="h-6 w-6" />
                {stats.upcoming}
              </div>
              <div className="mt-1 font-mono text-xs uppercase tracking-wider text-bone/50">
                Proximos
              </div>
            </div>
            <div className="h-12 w-px bg-amber-500/20" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 font-display text-3xl font-bold text-imperial-gold">
                <Shield className="h-6 w-6" />
                {stats.official}
              </div>
              <div className="mt-1 font-mono text-xs uppercase tracking-wider text-bone/50">
                Oficiales
              </div>
            </div>
            <div className="h-12 w-px bg-amber-500/20" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-400">
                <Sparkles className="h-5 w-5" />
                <Trophy className="h-5 w-5" />
              </div>
              <div className="mt-1 font-mono text-xs uppercase tracking-wider text-bone/50">
                En Vivo
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/comunidad/eventos/nuevo"
            className="group inline-flex items-center gap-3 rounded-xl border border-amber-500/40 bg-gradient-to-b from-amber-500/20 to-amber-500/10 px-6 py-3 transition-all duration-300 hover:border-amber-500/60 hover:from-amber-500/30 hover:to-amber-500/15"
          >
            <Plus className="h-5 w-5 text-amber-400" />
            <span className="font-display font-semibold tracking-wide text-amber-400">
              Crear Evento
            </span>
            <ChevronRight className="h-4 w-4 text-amber-400/60 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rotate-45 bg-amber-500/40" />
          <Clock className="h-4 w-4 text-amber-500/40" />
          <div className="h-1.5 w-1.5 rotate-45 bg-amber-500/40" />
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
      </div>

      {/* Map Section */}
      {mapEvents.length > 0 && (
        <section className="py-8 sm:py-12">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2">
                <MapPin className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-bone">Mapa de Eventos</h2>
                <p className="font-mono text-xs tracking-wider text-bone/40">
                  LOCALIZACION TEMPORAL
                </p>
              </div>
            </div>

            <Suspense fallback={<MapSkeleton />}>
              <EventsMapWrapper
                events={mapEvents}
                className="h-[400px] rounded-2xl border border-amber-500/20"
              />
            </Suspense>

            {/* Map legend */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 rounded-lg border border-bone/10 bg-void-light/50 p-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="font-mono text-xs text-bone/50">Torneo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-purple-400" />
                <span className="font-mono text-xs text-bone/50">Taller</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-400" />
                <span className="font-mono text-xs text-bone/50">Casual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="font-mono text-xs text-bone/50">Campaña</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <span className="font-mono text-xs text-bone/50">Lanzamiento</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-cyan-400" />
                <span className="font-mono text-xs text-bone/50">Quedada</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-6">
          {/* Section header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2">
                <Calendar className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-bone">Proximos Eventos</h2>
                <p className="font-mono text-xs tracking-wider text-bone/40">REGISTRO CHRONUS</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Suspense fallback={<FiltersSkeleton />}>
            <EventFilters className="mb-8" />
          </Suspense>

          {/* Results indicator */}
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-bone/10 bg-void-light/50 p-3">
            <Clock className="h-4 w-4 text-amber-500/60" />
            <p className="font-mono text-sm text-bone/60">
              <span className="font-semibold text-amber-400">{events.length}</span>{' '}
              {events.length === 1 ? 'evento registrado' : 'eventos registrados'} en el Chronus
            </p>
          </div>

          {/* Event grid */}
          <EventGrid
            events={events}
            emptyMessage="No se hallaron eventos con los criterios especificados en el registro temporal"
          />

          {/* Bottom decoration */}
          <div className="mt-12 flex items-center justify-center">
            <div className="flex items-center gap-4 rounded-lg border border-bone/10 bg-void-light/30 px-6 py-3">
              <Clock className="h-4 w-4 text-amber-500/40" />
              <span className="font-mono text-xs tracking-wider text-bone/40">
                CHRONUS EVENTUS • REGISTRO TEMPORAL • ADMINISTRATUM
              </span>
              <Clock className="h-4 w-4 scale-x-[-1] text-amber-500/40" />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile CTA */}
      <div className="fixed bottom-6 right-6 z-40 sm:hidden">
        <Link
          href="/comunidad/eventos/nuevo"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-void shadow-lg shadow-amber-500/30 transition-transform hover:scale-105"
        >
          <Plus className="h-6 w-6" />
        </Link>
      </div>
    </div>
  )
}

function MapSkeleton() {
  return (
    <div className="flex h-[400px] w-full animate-pulse items-center justify-center rounded-2xl border border-amber-500/20 bg-void-light">
      <MapPin className="h-12 w-12 text-bone/20" />
    </div>
  )
}

function FiltersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-12 flex-1 animate-pulse rounded-xl bg-void-light/50" />
        <div className="h-12 w-28 animate-pulse rounded-xl bg-void-light/30" />
      </div>
    </div>
  )
}
