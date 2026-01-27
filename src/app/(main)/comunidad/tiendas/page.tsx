import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, Store } from 'lucide-react'
import StoreGrid from '@/components/community/StoreGrid'
import CommunityFilters from '@/components/community/CommunityFilters'
import type { StoreWithSubmitter } from '@/components/community/StoreCard'
import type { StoreType } from '@/lib/types/database.types'

export const metadata = {
  title: 'Tiendas — Comunidad | Forge of War',
  description: 'Directorio de tiendas de Warhammer y hobby. Encuentra tu tienda mas cercana.',
}

interface SearchParams {
  type?: string
  city?: string
  q?: string
}

async function getStores(searchParams: SearchParams) {
  const supabase = await createClient()

  let query = supabase
    .from('stores')
    .select(`
      *,
      profiles:submitted_by(id, username, display_name, avatar_url)
    `)
    .eq('status', 'approved')
    .order('avg_rating', { ascending: false })

  // Filter by store type
  if (searchParams.type && searchParams.type !== 'all') {
    query = query.eq('store_type', searchParams.type as StoreType)
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

export default async function TiendasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const stores = await getStores(params)

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-bone flex items-center gap-3">
              <Store className="w-8 h-8 text-imperial-gold" />
              Tiendas
            </h1>
            <p className="text-bone/60 font-body mt-2">
              Directorio de tiendas de Warhammer y hobby
            </p>
          </div>
          <Link
            href="/comunidad/tiendas/nueva"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-imperial-gold text-void font-display font-bold text-sm rounded-xl hover:bg-imperial-gold/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Registrar tienda
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <Suspense fallback={<FiltersSkeleton />}>
            <CommunityFilters totalCount={stores.length} />
          </Suspense>
        </div>

        {/* Store grid */}
        <StoreGrid
          stores={stores}
          emptyMessage="No se encontraron tiendas con esos filtros. Prueba con otros criterios."
        />

        {/* Mobile CTA */}
        <div className="sm:hidden fixed bottom-6 right-6 z-40">
          <Link
            href="/comunidad/tiendas/nueva"
            className="flex items-center justify-center w-14 h-14 bg-imperial-gold text-void rounded-full shadow-lg shadow-imperial-gold/30"
          >
            <Plus className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function FiltersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-12 bg-void-light rounded-xl animate-pulse" />
        <div className="w-24 h-12 bg-void-light rounded-xl animate-pulse" />
      </div>
    </div>
  )
}
