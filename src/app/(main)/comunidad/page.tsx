import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Store, Plus, ArrowRight, Compass } from 'lucide-react'
import CommunityHero from '@/components/community/CommunityHero'
import CommunityMapWrapper from '@/components/community/CommunityMapWrapper'
import StoreGrid from '@/components/community/StoreGrid'
import type { StoreWithSubmitter } from '@/components/community/StoreCard'

export const metadata = {
  title: 'Comunidad — Cartographia Imperialis | Forge of War',
  description: 'Encuentra tiendas de Warhammer cercanas, descubre donde jugar y conecta con la comunidad local.',
}

async function getApprovedStores() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('stores')
    .select(`
      *,
      profiles:submitted_by(id, username, display_name, avatar_url)
    `)
    .eq('status', 'approved')
    .order('avg_rating', { ascending: false })
    .limit(6)

  if (error) {
    console.error('Error fetching stores:', error)
    return []
  }

  return (data as unknown as StoreWithSubmitter[]) || []
}

async function getAllStoreCoords() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('stores')
    .select('id, name, slug, latitude, longitude, city, store_type, avg_rating, review_count')
    .eq('status', 'approved')

  if (error) {
    console.error('Error fetching store coords:', error)
    return []
  }

  return data || []
}

export default async function ComunidadPage() {
  const [stores, storeCoords] = await Promise.all([
    getApprovedStores(),
    getAllStoreCoords(),
  ])

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero */}
      <CommunityHero />

      {/* Map section */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-bone flex items-center gap-2">
            <MapPin className="w-6 h-6 text-imperial-gold" />
            Mapa de tiendas
          </h2>
          <Link
            href="/comunidad/tiendas"
            className="flex items-center gap-1 text-sm font-body text-imperial-gold hover:text-yellow-400 transition-colors"
          >
            Ver todas
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <Suspense fallback={<MapSkeleton />}>
          <CommunityMapWrapper
            stores={storeCoords}
            className="h-[500px]"
          />
        </Suspense>
      </section>

      {/* Featured stores */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-bone flex items-center gap-2">
            <Store className="w-6 h-6 text-imperial-gold" />
            Tiendas destacadas
          </h2>
          <Link
            href="/comunidad/tiendas"
            className="flex items-center gap-1 text-sm font-body text-imperial-gold hover:text-yellow-400 transition-colors"
          >
            Ver todas
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <StoreGrid stores={stores} emptyMessage="Aun no hay tiendas registradas. Se el primero en registrar una." />
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="relative p-8 md:p-12 rounded-2xl overflow-hidden bg-void-light border border-bone/10">
          {/* Grid bg */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(rgba(201,162,39,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.04) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-imperial-gold/10 border border-imperial-gold/20 mb-6">
              <Compass className="w-8 h-8 text-imperial-gold" />
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-bold text-bone mb-3">
              Conoces una tienda que no esta en el mapa?
            </h3>
            <p className="text-bone/60 font-body max-w-lg mx-auto mb-6">
              Registra tu tienda de hobby favorita para que otros jugadores puedan encontrarla.
              Un administrador la revisara antes de publicarla.
            </p>
            <Link
              href="/comunidad/tiendas/nueva"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-imperial-gold to-yellow-500 text-void font-display font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Registrar tienda
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function MapSkeleton() {
  return (
    <div className="w-full h-[500px] bg-void-light rounded-xl animate-pulse border border-bone/10 flex items-center justify-center">
      <MapPin className="w-12 h-12 text-bone/20" />
    </div>
  )
}
