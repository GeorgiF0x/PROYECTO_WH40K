import { Suspense } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CreatorGrid, CreatorFilters } from '@/components/creator'
import { Feather, ScrollText, BookOpen, Users, Sparkles, ChevronRight } from 'lucide-react'
import type { PublicCreator, CreatorType } from '@/lib/types/database.types'

export const metadata: Metadata = {
  title: 'Orden de Rememoradores | Comunidad',
  description:
    'El sagrado registro de los cronistas del Imperium. Pintores, artistas, narradores e instructores verificados de la comunidad Warhammer 40K.',
}

// Creator approvals are rare — once an hour is plenty.
export const revalidate = 3600

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
    .select(
      `
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
    `
    )
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

  const creatorIds = data.map((c) => c.id)

  const [miniaturesData, followersData] = await Promise.all([
    supabase.from('miniatures').select('user_id').in('user_id', creatorIds),
    supabase.from('follows').select('following_id').in('following_id', creatorIds),
  ])

  const miniaturesCounts = new Map<string, number>()
  const followersCounts = new Map<string, number>()

  miniaturesData.data?.forEach((m) => {
    miniaturesCounts.set(m.user_id, (miniaturesCounts.get(m.user_id) || 0) + 1)
  })

  followersData.data?.forEach((f) => {
    followersCounts.set(f.following_id, (followersCounts.get(f.following_id) || 0) + 1)
  })

  const creatorsWithCounts: PublicCreator[] = data.map(
    (creator) =>
      ({
        ...creator,
        miniatures_count: miniaturesCounts.get(creator.id) || 0,
        followers_count: followersCounts.get(creator.id) || 0,
      }) as PublicCreator
  )

  return creatorsWithCounts
}

// Gothic corner ornament SVG
function GothicCorner({
  position,
  className = '',
}: {
  position: 'tl' | 'tr' | 'bl' | 'br'
  className?: string
}) {
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
    <div className="my-8 flex items-center gap-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-imperial-gold/30 to-transparent" />
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 rotate-45 bg-imperial-gold/50" />
        <Feather className="h-5 w-5 text-imperial-gold/60" />
        <div className="h-1.5 w-1.5 rotate-45 bg-imperial-gold/50" />
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-imperial-gold/30 to-transparent" />
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
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Hero Section - Illuminated Manuscript Style */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-32">
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
        <div className="absolute left-4 top-4 text-imperial-gold/40">
          <GothicCorner position="tl" />
        </div>
        <div className="absolute right-4 top-4 text-imperial-gold/40">
          <GothicCorner position="tr" />
        </div>

        {/* Floating ink particles */}
        <div className="absolute left-1/4 top-20 h-1 w-1 animate-pulse rounded-full bg-imperial-gold/30" />
        <div
          className="absolute right-1/4 top-32 h-1.5 w-1.5 animate-pulse rounded-full bg-imperial-gold/20"
          style={{ animationDelay: '0.5s' }}
        />
        <div
          className="absolute bottom-20 left-1/3 h-1 w-1 animate-pulse rounded-full bg-bone/20"
          style={{ animationDelay: '1s' }}
        />

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          {/* Order badge */}
          <div className="mb-8 inline-flex items-center gap-3 rounded-lg border border-imperial-gold/30 bg-void-light/80 px-5 py-2">
            <ScrollText className="h-4 w-4 text-imperial-gold" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-imperial-gold/80">
              Archivo del Librarium
            </span>
            <div className="h-4 w-px bg-imperial-gold/30" />
            <span className="font-mono text-xs text-bone/50">M41.126</span>
          </div>

          {/* Main title - illuminated style */}
          <h1 className="relative mb-6">
            <span className="mb-3 block font-mono text-sm uppercase tracking-[0.3em] text-imperial-gold/60">
              Sagrado Registro de los
            </span>
            <span className="block font-display text-5xl font-bold tracking-wide text-bone sm:text-6xl lg:text-7xl">
              Rememoradores
            </span>
            <span className="mt-2 block font-display text-lg tracking-widest text-imperial-gold/80 sm:text-xl">
              Cronistas del Imperium
            </span>
          </h1>

          {/* Decorative line */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-imperial-gold/50" />
            <Feather className="h-5 w-5 rotate-45 text-imperial-gold/60" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-imperial-gold/50" />
          </div>

          {/* Description - manuscript style */}
          <p className="mx-auto mb-10 max-w-2xl font-body text-lg leading-relaxed text-bone/70">
            Aquellos bendecidos con el don de la creación, registrados en los sagrados archivos del
            Imperium. Pintores, artistas, narradores e instructores que preservan la gloria de la
            humanidad a través de su arte.
          </p>

          {/* Stats row */}
          <div className="mb-10 flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-imperial-gold">
                {creators.length}
              </div>
              <div className="font-mono text-xs uppercase tracking-wider text-bone/50">
                Rememoradores
              </div>
            </div>
            <div className="h-10 w-px bg-imperial-gold/20" />
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-bone/80">5</div>
              <div className="font-mono text-xs uppercase tracking-wider text-bone/50">Órdenes</div>
            </div>
            <div className="h-10 w-px bg-imperial-gold/20" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="font-mono text-xs uppercase tracking-wider text-bone/50">
                Verificados
              </div>
            </div>
          </div>

          {/* CTA Button - Wax seal style */}
          <Link
            href="/comunidad/creadores/solicitar"
            className="group inline-flex items-center gap-3 rounded-lg border-2 border-imperial-gold/40 bg-gradient-to-b from-imperial-gold/20 to-imperial-gold/10 px-8 py-4 transition-all duration-300 hover:border-imperial-gold/60 hover:from-imperial-gold/30 hover:to-imperial-gold/15"
          >
            <BookOpen className="h-5 w-5 text-imperial-gold" />
            <span className="font-display font-semibold tracking-wide text-imperial-gold">
              Solicitar Ingreso a la Orden
            </span>
            <ChevronRight className="h-4 w-4 text-imperial-gold/60 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative py-8 sm:py-12">
        {/* Section background */}
        <div className="absolute inset-0 bg-gradient-to-b from-void to-void-light/30" />

        <div className="relative mx-auto max-w-7xl px-6">
          {/* Section header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-imperial-gold/30 bg-imperial-gold/10 p-2">
                <Users className="h-5 w-5 text-imperial-gold" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-bone">
                  Directorio de Cronistas
                </h2>
                <p className="font-mono text-xs tracking-wider text-bone/40">REGISTROS ACTIVOS</p>
              </div>
            </div>
          </div>

          <ImperialDivider />

          {/* Filters */}
          <Suspense fallback={<FiltersSkeleton />}>
            <CreatorFilters className="mb-8" />
          </Suspense>

          {/* Results count */}
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-bone/10 bg-void-light/50 p-3">
            <ScrollText className="h-4 w-4 text-imperial-gold/60" />
            <p className="font-mono text-sm text-bone/60">
              <span className="font-semibold text-imperial-gold">{creators.length}</span>{' '}
              {creators.length === 1 ? 'registro encontrado' : 'registros encontrados'} en los
              archivos
            </p>
          </div>

          {/* Creator Grid */}
          <CreatorGrid
            creators={creators}
            emptyMessage="No se hallaron registros con los criterios especificados en el Librarium"
          />

          {/* Bottom decoration */}
          <div className="mt-12 flex items-center justify-center">
            <div className="flex items-center gap-4 rounded-lg border border-bone/10 bg-void-light/30 px-6 py-3">
              <Feather className="h-4 w-4 text-imperial-gold/40" />
              <span className="font-mono text-xs tracking-wider text-bone/40">
                ARCHIVO CLASIFICADO • SOLO LECTURA • ADMINISTRATUM
              </span>
              <Feather className="h-4 w-4 scale-x-[-1] text-imperial-gold/40" />
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
      <div className="h-12 animate-pulse rounded-lg bg-void-light/50" />
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 w-24 animate-pulse rounded-lg bg-void-light/30" />
        ))}
      </div>
    </div>
  )
}
