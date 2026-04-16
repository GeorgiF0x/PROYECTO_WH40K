import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  Plus,
  Store,
  MapPin,
  Compass,
  ScrollText,
  Shield,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import StoreGrid from '@/components/community/StoreGrid'
import CommunityFilters from '@/components/community/CommunityFilters'
import type { StoreWithSubmitter } from '@/components/community/StoreCard'
import type { StoreType } from '@/lib/types/database.types'

export const metadata = {
  title: 'Tiendas — Comunidad | Forge of War',
  description: 'Directorio de tiendas de Warhammer y hobby. Encuentra tu tienda mas cercana.',
}

// Stores are reviewed manually before publish — list barely changes day-to-day.
export const revalidate = 3600

interface SearchParams {
  type?: string
  ccaa?: string
  province?: string
  city?: string
  q?: string
}

// Mapping de CCAA a provincias (para validar filtros)
const CCAA_PROVINCES: Record<string, string[]> = {
  Andalucía: ['Almería', 'Cádiz', 'Córdoba', 'Granada', 'Huelva', 'Jaén', 'Málaga', 'Sevilla'],
  Aragón: ['Huesca', 'Teruel', 'Zaragoza'],
  Asturias: ['Asturias'],
  Baleares: ['Baleares'],
  Canarias: ['Las Palmas', 'Santa Cruz de Tenerife'],
  Cantabria: ['Cantabria'],
  'Castilla-La Mancha': ['Albacete', 'Ciudad Real', 'Cuenca', 'Guadalajara', 'Toledo'],
  'Castilla y León': [
    'Ávila',
    'Burgos',
    'León',
    'Palencia',
    'Salamanca',
    'Segovia',
    'Soria',
    'Valladolid',
    'Zamora',
  ],
  Cataluña: ['Barcelona', 'Girona', 'Lleida', 'Tarragona'],
  Ceuta: ['Ceuta'],
  'Comunidad Valenciana': ['Alicante', 'Castellón', 'Valencia'],
  Extremadura: ['Badajoz', 'Cáceres'],
  Galicia: ['A Coruña', 'Lugo', 'Ourense', 'Pontevedra'],
  'La Rioja': ['La Rioja'],
  Madrid: ['Madrid'],
  Melilla: ['Melilla'],
  Murcia: ['Murcia'],
  Navarra: ['Navarra'],
  'País Vasco': ['Álava', 'Gipuzkoa', 'Vizcaya'],
}

async function getStores(searchParams: SearchParams) {
  const supabase = await createClient()

  let query = supabase
    .from('stores')
    .select(
      `
      *,
      profiles:submitted_by(id, username, display_name, avatar_url)
    `
    )
    .eq('status', 'approved')
    .order('avg_rating', { ascending: false })

  // Filter by store type
  if (searchParams.type && searchParams.type !== 'all') {
    query = query.eq('store_type', searchParams.type as StoreType)
  }

  // Filter by province (if selected)
  if (searchParams.province) {
    query = query.ilike('province', `%${searchParams.province}%`)
  }
  // Filter by CCAA (all provinces in that CCAA) - only if province not selected
  else if (searchParams.ccaa && CCAA_PROVINCES[searchParams.ccaa]) {
    const provinces = CCAA_PROVINCES[searchParams.ccaa]
    // Use OR filter for all provinces in the CCAA
    query = query.or(provinces.map((p) => `province.ilike.%${p}%`).join(','))
  }

  // Filter by city
  if (searchParams.city) {
    query = query.ilike('city', `%${searchParams.city}%`)
  }

  // Search by name
  if (searchParams.q) {
    query = query.ilike('name', `%${searchParams.q}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching stores:', error)
    return []
  }

  return (data as unknown as StoreWithSubmitter[]) || []
}

// Get unique provinces count
function getUniqueProvinces(stores: StoreWithSubmitter[]): number {
  const provinces = new Set(stores.map((s) => s.province).filter(Boolean))
  return provinces.size
}

// Compass SVG decoration
function CompassRose({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      {/* Outer circle */}
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />

      {/* Cardinal points */}
      <path d="M50 5 L53 20 L50 15 L47 20 Z" fill="currentColor" opacity="0.6" />
      <path d="M50 95 L53 80 L50 85 L47 80 Z" fill="currentColor" opacity="0.4" />
      <path d="M5 50 L20 47 L15 50 L20 53 Z" fill="currentColor" opacity="0.4" />
      <path d="M95 50 L80 47 L85 50 L80 53 Z" fill="currentColor" opacity="0.4" />

      {/* Inner details */}
      <circle cx="50" cy="50" r="8" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <circle cx="50" cy="50" r="3" fill="currentColor" opacity="0.6" />

      {/* Intercardinal lines */}
      <line x1="20" y1="20" x2="35" y2="35" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <line x1="80" y1="20" x2="65" y2="35" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <line x1="20" y1="80" x2="35" y2="65" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <line x1="80" y1="80" x2="65" y2="65" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </svg>
  )
}

export default async function TiendasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const stores = await getStores(params)
  const uniqueProvinces = getUniqueProvinces(stores)

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section - Rogue Trader / Cartographia Style */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-32">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-void via-void-light/30 to-void" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(201, 162, 39, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(201, 162, 39, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Compass decorations */}
        <div className="absolute left-8 top-8 hidden text-imperial-gold/20 lg:block">
          <CompassRose className="h-24 w-24" />
        </div>
        <div className="absolute bottom-8 right-8 hidden text-imperial-gold/10 lg:block">
          <CompassRose className="h-32 w-32" />
        </div>

        {/* Floating coordinate markers */}
        <div className="absolute right-1/4 top-16 hidden font-mono text-[10px] tracking-wider text-imperial-gold/20 md:block">
          40.4168° N
        </div>
        <div className="absolute bottom-16 left-1/4 hidden font-mono text-[10px] tracking-wider text-imperial-gold/20 md:block">
          3.7038° W
        </div>

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-3 rounded-lg border border-imperial-gold/30 bg-void-light/80 px-4 py-2">
            <Compass className="h-4 w-4 text-imperial-gold" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-imperial-gold/80">
              Cartographia Commercialis
            </span>
          </div>

          {/* Title */}
          <h1 className="mb-4 font-display text-4xl font-bold tracking-wide text-bone sm:text-5xl lg:text-6xl">
            Puestos de Comercio
          </h1>
          <p className="mx-auto mb-8 max-w-2xl font-body text-lg text-bone/60">
            Registro Imperial de establecimientos autorizados para el comercio de pertrechos,
            miniaturas y suministros del Adeptus Ministrorum.
          </p>

          {/* Stats row */}
          <div className="mb-8 flex items-center justify-center gap-6 sm:gap-10">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 font-display text-3xl font-bold text-imperial-gold">
                <Store className="h-6 w-6" />
                {stores.length}
              </div>
              <div className="mt-1 font-mono text-xs uppercase tracking-wider text-bone/50">
                Puestos
              </div>
            </div>
            <div className="h-12 w-px bg-imperial-gold/20" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 font-display text-3xl font-bold text-bone/80">
                <MapPin className="h-6 w-6 text-imperial-gold/60" />
                {uniqueProvinces}
              </div>
              <div className="mt-1 font-mono text-xs uppercase tracking-wider text-bone/50">
                Provincias
              </div>
            </div>
            <div className="h-12 w-px bg-imperial-gold/20" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-400">
                <Shield className="h-5 w-5" />
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="mt-1 font-mono text-xs uppercase tracking-wider text-bone/50">
                Verificados
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/comunidad/tiendas/nueva"
            className="group inline-flex items-center gap-3 rounded-xl border border-imperial-gold/40 bg-gradient-to-b from-imperial-gold/20 to-imperial-gold/10 px-6 py-3 transition-all duration-300 hover:border-imperial-gold/60 hover:from-imperial-gold/30 hover:to-imperial-gold/15"
          >
            <Plus className="h-5 w-5 text-imperial-gold" />
            <span className="font-display font-semibold tracking-wide text-imperial-gold">
              Registrar Puesto Comercial
            </span>
            <ChevronRight className="h-4 w-4 text-imperial-gold/60 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-imperial-gold/20 to-transparent" />
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rotate-45 bg-imperial-gold/40" />
          <ScrollText className="h-4 w-4 text-imperial-gold/40" />
          <div className="h-1.5 w-1.5 rotate-45 bg-imperial-gold/40" />
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-imperial-gold/20 to-transparent" />
      </div>

      {/* Main Content */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-6">
          {/* Section header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-imperial-gold/30 bg-imperial-gold/10 p-2">
                <Store className="h-5 w-5 text-imperial-gold" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-bone">Directorio de Tiendas</h2>
                <p className="font-mono text-xs tracking-wider text-bone/40">
                  ESTABLECIMIENTOS AUTORIZADOS
                </p>
              </div>
            </div>

            {/* Map link */}
            <Link
              href="/comunidad"
              className="hidden items-center gap-2 rounded-lg border border-bone/10 bg-void-light/60 px-4 py-2 font-mono text-sm text-bone/60 transition-all hover:border-imperial-gold/30 hover:text-imperial-gold sm:flex"
            >
              <Compass className="h-4 w-4" />
              Ver Mapa
            </Link>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <Suspense fallback={<FiltersSkeleton />}>
              <CommunityFilters totalCount={stores.length} />
            </Suspense>
          </div>

          {/* Results indicator */}
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-bone/10 bg-void-light/50 p-3">
            <MapPin className="h-4 w-4 text-imperial-gold/60" />
            <p className="font-mono text-sm text-bone/60">
              <span className="font-semibold text-imperial-gold">{stores.length}</span>{' '}
              {stores.length === 1 ? 'puesto registrado' : 'puestos registrados'} en el Sector
            </p>
          </div>

          {/* Store grid */}
          <StoreGrid
            stores={stores}
            emptyMessage="No se hallaron puestos comerciales con los criterios especificados en el registro imperial"
          />

          {/* Bottom decoration */}
          <div className="mt-12 flex items-center justify-center">
            <div className="flex items-center gap-4 rounded-lg border border-bone/10 bg-void-light/30 px-6 py-3">
              <Compass className="h-4 w-4 text-imperial-gold/40" />
              <span className="font-mono text-xs tracking-wider text-bone/40">
                REGISTRO IMPERIAL • SECTOR HISPANIA • COMMERCIA IMPERIALIS
              </span>
              <Compass className="h-4 w-4 scale-x-[-1] text-imperial-gold/40" />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile CTA */}
      <div className="fixed bottom-6 right-6 z-40 sm:hidden">
        <Link
          href="/comunidad/tiendas/nueva"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-imperial-gold text-void shadow-lg shadow-imperial-gold/30 transition-transform hover:scale-105"
        >
          <Plus className="h-6 w-6" />
        </Link>
      </div>
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
