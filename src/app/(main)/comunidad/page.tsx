import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Users, Compass, Plus, ArrowRight } from 'lucide-react'
import CommunityHero from '@/components/community/CommunityHero'
import CommunityMapWrapper from '@/components/community/CommunityMapWrapper'
import { CommunityNavCard } from '@/components/community'

export const metadata = {
  title: 'Comunidad — Cartographia Imperialis | Forge of War',
  description:
    'Explora el hub de la comunidad: encuentra tiendas locales, descubre creadores y conecta con otros jugadores.',
}

// Hub counts — fine to be a few minutes stale.
export const revalidate = 1800

async function getCounts() {
  const supabase = await createClient()

  const [storesResult, creatorsResult, eventsResult] = await Promise.all([
    supabase.from('stores').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('creator_status', 'approved'),
    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .in('status', ['upcoming', 'ongoing']),
  ])

  return {
    storesCount: storesResult.count || 0,
    creatorsCount: creatorsResult.count || 0,
    eventsCount: eventsResult.count || 0,
  }
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
  const [counts, storeCoords] = await Promise.all([getCounts(), getAllStoreCoords()])

  return (
    <div className="min-h-screen pb-16 pt-20">
      {/* Hero */}
      <CommunityHero />

      {/* Navigation Cards Section */}
      <section className="mx-auto mb-16 max-w-7xl px-6">
        <div className="mb-8">
          <h2 className="mb-2 font-mono text-xs tracking-widest text-imperial-gold/60">
            DIRECTORIO IMPERIAL
          </h2>
          <p className="font-heading text-bone-100 text-2xl font-bold">Explora la Comunidad</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Tiendas Card */}
          <CommunityNavCard
            href="/comunidad/tiendas"
            title="Tiendas Locales"
            subtitle="CARTOGRAPHIA IMPERIALIS"
            description="Descubre tiendas de hobby cercanas, clubs de juego y puntos de encuentro para la comunidad local."
            icon="MapPin"
            count={counts.storesCount}
            countLabel="tiendas registradas"
            color="gold"
          />

          {/* Creadores Card */}
          <CommunityNavCard
            href="/comunidad/creadores"
            title="Creadores"
            subtitle="VOX POPULI"
            description="Conoce a los artistas, pintores, YouTubers y creadores de contenido que dan vida a la comunidad."
            icon="Users"
            count={counts.creatorsCount}
            countLabel="creadores verificados"
            color="purple"
          />

          {/* Eventos Card */}
          <CommunityNavCard
            href="/comunidad/eventos"
            title="Eventos"
            subtitle="CHRONUS EVENTUS"
            description="Torneos, quedadas de pintura, partidas amistosas y eventos especiales cerca de ti."
            icon="Calendar"
            count={counts.eventsCount}
            countLabel="eventos próximos"
            color="amber"
          />
        </div>
      </section>

      {/* Map Preview Section */}
      <section className="mx-auto mb-16 max-w-7xl px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="mb-1 font-mono text-xs tracking-widest text-imperial-gold/60">
              MAPA IMPERIAL
            </h2>
            <p className="font-heading text-bone-100 flex items-center gap-2 text-xl font-bold">
              <MapPin className="h-5 w-5 text-imperial-gold" />
              Vista General de Tiendas
            </p>
          </div>
          <Link
            href="/comunidad/tiendas"
            className="flex items-center gap-1.5 font-mono text-sm text-imperial-gold transition-colors hover:text-yellow-400"
          >
            Ver directorio completo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <Suspense fallback={<MapSkeleton />}>
          <CommunityMapWrapper
            stores={storeCoords}
            className="h-[400px] rounded-2xl border border-imperial-gold/20"
          />
        </Suspense>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-2xl border border-bone/10 bg-void-light p-8 md:p-12">
          {/* Grid bg */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(201,162,39,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.04) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Corner brackets */}
          <div className="absolute left-4 top-4 h-6 w-6 border-l-2 border-t-2 border-imperial-gold/30" />
          <div className="absolute right-4 top-4 h-6 w-6 border-r-2 border-t-2 border-imperial-gold/30" />
          <div className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-imperial-gold/30" />
          <div className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-imperial-gold/30" />

          <div className="relative z-10 text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-imperial-gold/20 bg-imperial-gold/10">
              <Compass className="h-8 w-8 text-imperial-gold" />
            </div>

            <h3 className="font-heading mb-3 text-2xl font-bold text-bone md:text-3xl">
              Contribuye a la Comunidad
            </h3>
            <p className="mx-auto mb-8 max-w-lg font-body text-bone/60">
              Conoces una tienda que no está en el mapa? Eres un creador de contenido? Ayuda a
              expandir el directorio imperial.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/comunidad/tiendas/nueva"
                className="font-heading inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-imperial-gold to-yellow-500 px-6 py-3 font-bold text-void transition-opacity hover:opacity-90"
              >
                <Plus className="h-5 w-5" />
                Registrar tienda
              </Link>

              <Link
                href="/comunidad/creadores/solicitar"
                className="font-heading inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/20 px-6 py-3 font-bold text-purple-400 transition-colors hover:bg-purple-500/30"
              >
                <Users className="h-5 w-5" />
                Ser creador
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function MapSkeleton() {
  return (
    <div className="flex h-[400px] w-full animate-pulse items-center justify-center rounded-2xl border border-imperial-gold/20 bg-void-light">
      <MapPin className="h-12 w-12 text-bone/20" />
    </div>
  )
}
