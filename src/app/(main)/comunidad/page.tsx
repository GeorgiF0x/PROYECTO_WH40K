import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Users, Compass, Plus, ArrowRight } from 'lucide-react'
import CommunityHero from '@/components/community/CommunityHero'
import CommunityMapWrapper from '@/components/community/CommunityMapWrapper'
import { CommunityNavCard } from '@/components/community'

export const metadata = {
  title: 'Comunidad — Cartographia Imperialis | Forge of War',
  description: 'Explora el hub de la comunidad: encuentra tiendas locales, descubre creadores y conecta con otros jugadores.',
}

async function getCounts() {
  const supabase = await createClient()

  const [storesResult, creatorsResult, eventsResult] = await Promise.all([
    supabase
      .from('stores')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved'),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('creator_status', 'approved'),
    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .in('status', ['upcoming', 'ongoing'])
  ])

  return {
    storesCount: storesResult.count || 0,
    creatorsCount: creatorsResult.count || 0,
    eventsCount: eventsResult.count || 0
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
  const [counts, storeCoords] = await Promise.all([
    getCounts(),
    getAllStoreCoords(),
  ])

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero */}
      <CommunityHero />

      {/* Navigation Cards Section */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <div className="mb-8">
          <h2 className="text-xs font-mono text-imperial-gold/60 tracking-widest mb-2">
            DIRECTORIO IMPERIAL
          </h2>
          <p className="text-2xl font-heading font-bold text-bone-100">
            Explora la Comunidad
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xs font-mono text-imperial-gold/60 tracking-widest mb-1">
              MAPA IMPERIAL
            </h2>
            <p className="text-xl font-heading font-bold text-bone-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-imperial-gold" />
              Vista General de Tiendas
            </p>
          </div>
          <Link
            href="/comunidad/tiendas"
            className="flex items-center gap-1.5 text-sm font-mono text-imperial-gold hover:text-yellow-400 transition-colors"
          >
            Ver directorio completo
            <ArrowRight className="w-4 h-4" />
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

          {/* Corner brackets */}
          <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-imperial-gold/30" />
          <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-imperial-gold/30" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-imperial-gold/30" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-imperial-gold/30" />

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-imperial-gold/10 border border-imperial-gold/20 mb-6">
              <Compass className="w-8 h-8 text-imperial-gold" />
            </div>

            <h3 className="text-2xl md:text-3xl font-heading font-bold text-bone mb-3">
              Contribuye a la Comunidad
            </h3>
            <p className="text-bone/60 font-body max-w-lg mx-auto mb-8">
              Conoces una tienda que no está en el mapa? Eres un creador de contenido?
              Ayuda a expandir el directorio imperial.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/comunidad/tiendas/nueva"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-imperial-gold to-yellow-500 text-void font-heading font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                <Plus className="w-5 h-5" />
                Registrar tienda
              </Link>

              <Link
                href="/comunidad/creadores/solicitar"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500/20 border border-purple-500/30 text-purple-400 font-heading font-bold rounded-xl hover:bg-purple-500/30 transition-colors"
              >
                <Users className="w-5 h-5" />
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
    <div className="w-full h-[400px] bg-void-light rounded-2xl animate-pulse border border-imperial-gold/20 flex items-center justify-center">
      <MapPin className="w-12 h-12 text-bone/20" />
    </div>
  )
}
