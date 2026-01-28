import { Suspense } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CreatorGrid, CreatorFilters } from '@/components/creator'
import {
  Feather,
  ScrollText,
  BookOpen,
  Users,
  Sparkles,
  ChevronRight
} from 'lucide-react'
import type { PublicCreator, CreatorType } from '@/lib/types/database.types'

export const metadata: Metadata = {
  title: 'Orden de Rememoradores | Comunidad',
  description: 'El sagrado registro de los cronistas del Imperium. Pintores, artistas, narradores e instructores verificados de la comunidad Warhammer 40K.'
}

interface PageProps {
  searchParams: Promise<{
    type?: string
    commissions?: string
    q?: string
  }>
}

async function getCreators(params: {
  type?: string
  commissions?: string
  q?: string
}): Promise<PublicCreator[]> {
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select(`
      id,
      username,
      display_name,
      avatar_url,
      bio,
      creator_type,
      creator_bio,
      creator_services,
      accepts_commissions,
      portfolio_url,
      pinned_miniatures,
      creator_verified_at,
      favorite_factions,
      instagram,
      twitter,
      youtube,
      website
    `)
    .eq('creator_status', 'approved')
    .order('creator_verified_at', { ascending: false })

  if (params.type && params.type !== 'all') {
    query = query.eq('creator_type', params.type as CreatorType)
  }

  if (params.commissions === 'true') {
    query = query.eq('accepts_commissions', true)
  }

  if (params.q) {
    query = query.or(`username.ilike.%${params.q}%,display_name.ilike.%${params.q}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching creators:', error)
    return []
  }

  if (!data || data.length === 0) return []

  const creatorIds = data.map(c => c.id)

  const [miniaturesData, followersData] = await Promise.all([
    supabase
      .from('miniatures')
      .select('user_id')
      .in('user_id', creatorIds),
    supabase
      .from('follows')
      .select('following_id')
      .in('following_id', creatorIds)
  ])

  const miniaturesCounts = new Map<string, number>()
  const followersCounts = new Map<string, number>()

  miniaturesData.data?.forEach(m => {
    miniaturesCounts.set(m.user_id, (miniaturesCounts.get(m.user_id) || 0) + 1)
  })

  followersData.data?.forEach(f => {
    followersCounts.set(f.following_id, (followersCounts.get(f.following_id) || 0) + 1)
  })

  const creatorsWithCounts: PublicCreator[] = data.map(creator => ({
    ...creator,
    miniatures_count: miniaturesCounts.get(creator.id) || 0,
    followers_count: followersCounts.get(creator.id) || 0
  } as PublicCreator))

  return creatorsWithCounts
}

// Gothic corner ornament SVG
function GothicCorner({ position, className = '' }: { position: 'tl' | 'tr' | 'bl' | 'br'; className?: string }) {
  const transforms: Record<string, string> = {
    tl: '',
    tr: 'scaleX(-1)',
    bl: 'scaleY(-1)',
    br: 'scale(-1)',
  }

  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 60 60"
      fill="none"
      className={className}
      style={{ transform: transforms[position] }}
    >
      <path
        d="M0 60 L0 20 Q0 0 20 0 L60 0"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M0 50 L0 15 Q0 5 15 5 L50 5"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.3"
      />
      <circle cx="8" cy="8" r="3" fill="currentColor" opacity="0.5" />
      <path d="M15 0 L15 15 L0 15" stroke="currentColor" strokeWidth="1" opacity="0.2" />
    </svg>
  )
}

// Decorative divider
function ImperialDivider() {
  return (
    <div className="flex items-center gap-4 my-8">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-imperial-gold/30 to-transparent" />
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rotate-45 bg-imperial-gold/50" />
        <Feather className="w-5 h-5 text-imperial-gold/60" />
        <div className="w-1.5 h-1.5 rotate-45 bg-imperial-gold/50" />
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-imperial-gold/30 to-transparent" />
    </div>
  )
}

export default async function CreatorsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const creators = await getCreators(params)

  return (
    <div className="min-h-screen pt-20">
      {/* Parchment texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02] z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Hero Section - Illuminated Manuscript Style */}
      <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-void via-void-light/50 to-void" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(201, 162, 39, 0.3) 0%, transparent 40%),
              radial-gradient(circle at 80% 70%, rgba(201, 162, 39, 0.2) 0%, transparent 40%)
            `,
          }}
        />

        {/* Gothic corners */}
        <div className="absolute top-4 left-4 text-imperial-gold/40">
          <GothicCorner position="tl" />
        </div>
        <div className="absolute top-4 right-4 text-imperial-gold/40">
          <GothicCorner position="tr" />
        </div>

        {/* Floating ink particles */}
        <div className="absolute top-20 left-1/4 w-1 h-1 rounded-full bg-imperial-gold/30 animate-pulse" />
        <div className="absolute top-32 right-1/4 w-1.5 h-1.5 rounded-full bg-imperial-gold/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-20 left-1/3 w-1 h-1 rounded-full bg-bone/20 animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          {/* Order badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-lg bg-void-light/80 border border-imperial-gold/30 mb-8">
            <ScrollText className="w-4 h-4 text-imperial-gold" />
            <span className="text-xs font-mono text-imperial-gold/80 tracking-[0.2em] uppercase">
              Archivo del Librarium
            </span>
            <div className="w-px h-4 bg-imperial-gold/30" />
            <span className="text-xs font-mono text-bone/50">M41.126</span>
          </div>

          {/* Main title - illuminated style */}
          <h1 className="relative mb-6">
            <span className="block text-sm font-mono text-imperial-gold/60 tracking-[0.3em] uppercase mb-3">
              Sagrado Registro de los
            </span>
            <span className="block text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-bone tracking-wide">
              Rememoradores
            </span>
            <span className="block text-lg sm:text-xl font-display text-imperial-gold/80 mt-2 tracking-widest">
              Cronistas del Imperium
            </span>
          </h1>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-imperial-gold/50" />
            <Feather className="w-5 h-5 text-imperial-gold/60 rotate-45" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-imperial-gold/50" />
          </div>

          {/* Description - manuscript style */}
          <p className="text-bone/70 font-body text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Aquellos bendecidos con el don de la creación, registrados en los sagrados
            archivos del Imperium. Pintores, artistas, narradores e instructores que
            preservan la gloria de la humanidad a través de su arte.
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8 mb-10">
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-imperial-gold">{creators.length}</div>
              <div className="text-xs font-mono text-bone/50 tracking-wider uppercase">Rememoradores</div>
            </div>
            <div className="w-px h-10 bg-imperial-gold/20" />
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-bone/80">5</div>
              <div className="text-xs font-mono text-bone/50 tracking-wider uppercase">Órdenes</div>
            </div>
            <div className="w-px h-10 bg-imperial-gold/20" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono text-bone/50 tracking-wider uppercase">Verificados</div>
            </div>
          </div>

          {/* CTA Button - Wax seal style */}
          <Link
            href="/comunidad/creadores/solicitar"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-lg bg-gradient-to-b from-imperial-gold/20 to-imperial-gold/10 border-2 border-imperial-gold/40 hover:border-imperial-gold/60 hover:from-imperial-gold/30 hover:to-imperial-gold/15 transition-all duration-300"
          >
            <BookOpen className="w-5 h-5 text-imperial-gold" />
            <span className="font-display font-semibold text-imperial-gold tracking-wide">
              Solicitar Ingreso a la Orden
            </span>
            <ChevronRight className="w-4 h-4 text-imperial-gold/60 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative py-8 sm:py-12">
        {/* Section background */}
        <div className="absolute inset-0 bg-gradient-to-b from-void to-void-light/30" />

        <div className="relative max-w-7xl mx-auto px-6">
          {/* Section header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-imperial-gold/10 border border-imperial-gold/30">
                <Users className="w-5 h-5 text-imperial-gold" />
              </div>
              <div>
                <h2 className="font-display font-bold text-bone text-lg">Directorio de Cronistas</h2>
                <p className="text-xs font-mono text-bone/40 tracking-wider">REGISTROS ACTIVOS</p>
              </div>
            </div>
          </div>

          <ImperialDivider />

          {/* Filters */}
          <Suspense fallback={<FiltersSkeleton />}>
            <CreatorFilters className="mb-8" />
          </Suspense>

          {/* Results count */}
          <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-void-light/50 border border-bone/10">
            <ScrollText className="w-4 h-4 text-imperial-gold/60" />
            <p className="text-sm text-bone/60 font-mono">
              <span className="text-imperial-gold font-semibold">{creators.length}</span>
              {' '}{creators.length === 1 ? 'registro encontrado' : 'registros encontrados'} en los archivos
            </p>
          </div>

          {/* Creator Grid */}
          <CreatorGrid
            creators={creators}
            emptyMessage="No se hallaron registros con los criterios especificados en el Librarium"
          />

          {/* Bottom decoration */}
          <div className="mt-12 flex items-center justify-center">
            <div className="flex items-center gap-4 px-6 py-3 rounded-lg bg-void-light/30 border border-bone/10">
              <Feather className="w-4 h-4 text-imperial-gold/40" />
              <span className="text-xs font-mono text-bone/40 tracking-wider">
                ARCHIVO CLASIFICADO • SOLO LECTURA • ADMINISTRATUM
              </span>
              <Feather className="w-4 h-4 text-imperial-gold/40 scale-x-[-1]" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function FiltersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-12 bg-void-light/50 rounded-lg animate-pulse" />
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 w-24 bg-void-light/30 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  )
}
