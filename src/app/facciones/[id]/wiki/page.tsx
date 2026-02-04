'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useSearchParams } from 'next/navigation'
import {
  BookOpen,
  Users,
  Swords,
  Building,
  Shield,
  MapPin,
  Search,
  ChevronLeft,
  Eye,
  Calendar,
  Feather,
  ArrowRight,
} from 'lucide-react'
import { Navigation, Footer } from '@/components'
import { createClient } from '@/lib/supabase/client'
import { getFactionById } from '@/lib/data'
import { getFactionTheme } from '@/lib/faction-themes'
import { FactionEffects, FactionSymbol } from '@/components/faction'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { WikiPage, WikiCategory } from '@/lib/supabase/wiki.types'

const categoryIcons: Record<string, typeof BookOpen> = {
  BookOpen,
  Users,
  Swords,
  Building,
  Shield,
  MapPin,
}

export default function FactionWikiPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const factionId = params.id as string
  const faction = getFactionById(factionId)
  const theme = getFactionTheme(factionId)

  const [pages, setPages] = useState<WikiPage[]>([])
  const [categories, setCategories] = useState<WikiCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(
    searchParams.get('categoria') || null
  )
  const [userStatus, setUserStatus] = useState<{
    isLoggedIn: boolean
    canContribute: boolean
    hasPendingApplication: boolean
  }>({ isLoggedIn: false, canContribute: false, hasPendingApplication: false })

  useEffect(() => {
    loadData()
    checkUserStatus()
  }, [factionId, activeCategory])

  // Load wiki data directly from Supabase (no API route needed for public data)
  async function loadData() {
    setLoading(true)
    try {
      const supabase = createClient()

      // Load categories
      const { data: catData } = await supabase
        .from('wiki_categories')
        .select('*')
        .order('sort_order', { ascending: true })

      if (catData) {
        setCategories(catData as WikiCategory[])
      }

      // Load published pages for this faction
      let query = supabase
        .from('faction_wiki_pages')
        .select(`
          id,
          faction_id,
          category_id,
          title,
          slug,
          excerpt,
          hero_image,
          status,
          views_count,
          published_at,
          created_at,
          updated_at,
          category:wiki_categories(id, name, slug, icon)
        `)
        .eq('faction_id', factionId)
        .eq('status', 'published')
        .order('published_at', { ascending: false })

      if (activeCategory) {
        // Get category ID from slug
        const cat = categories.find(c => c.slug === activeCategory)
        if (cat) {
          query = query.eq('category_id', cat.id)
        }
      }

      const { data: pagesData } = await query

      if (pagesData) {
        setPages(pagesData as WikiPage[])
      }
    } catch (error) {
      console.error('Error loading wiki data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function checkUserStatus() {
    try {
      const supabase = createClient()

      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setUserStatus({ isLoggedIn: false, canContribute: false, hasPendingApplication: false })
        return
      }

      // Get user's wiki permissions directly from Supabase
      // Note: wiki_role field added by migration 20260205_wiki_scribe_system.sql
      const { data: profile } = await supabase
        .from('profiles')
        .select('wiki_role, is_admin, role')
        .eq('id', user.id)
        .single() as { data: { wiki_role: string | null; is_admin: boolean; role: string } | null; error: unknown }

      const isAdmin = profile?.is_admin || profile?.role === 'admin' || profile?.role === 'moderator'
      const isScribe = !!profile?.wiki_role
      const canContribute = isAdmin || isScribe

      // Check for pending application if user can't contribute
      let hasPendingApplication = false
      if (!canContribute) {
        const { data: application } = await supabase
          .from('scribe_applications' as 'profiles')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .maybeSingle()

        hasPendingApplication = !!application
      }

      setUserStatus({ isLoggedIn: true, canContribute, hasPendingApplication })
    } catch (error) {
      // User not logged in or error
      setUserStatus({ isLoggedIn: false, canContribute: false, hasPendingApplication: false })
    }
  }


  const filteredPages = search
    ? pages.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    : pages

  if (!faction) {
    return (
      <main className="min-h-screen bg-void flex items-center justify-center">
        <div className="noise-overlay" />
        <div className="text-center">
          <h1 className="font-display text-4xl text-white mb-4">Faccion no encontrada</h1>
          <Link href="/facciones" className="text-imperial-gold hover:underline">
            Volver a facciones
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main
      className="relative min-h-screen"
      style={{
        background: theme?.cssVars['--faction-bg'] || '#030308',
      }}
    >
      <div className="noise-overlay" />

      <div className="fixed inset-0 pointer-events-none opacity-20">
        <FactionEffects factionId={faction.id} />
      </div>

      <Navigation />

      {/* Header */}
      <section className="relative pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Back link */}
          <Link
            href={`/facciones/${factionId}`}
            className="inline-flex items-center gap-2 font-body text-sm text-bone/60 hover:text-bone mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver a {faction.shortName}
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center gap-6"
          >
            <FactionSymbol factionId={faction.id} size="lg" animated />

            <div className="flex-1">
              <span
                className="font-body text-sm font-semibold tracking-widest uppercase mb-2 block"
                style={{ color: faction.color }}
              >
                Wiki de {faction.shortName}
              </span>
              <h1 className="font-display text-4xl md:text-5xl font-black text-white mb-4">
                Lexicanum Imperial
              </h1>
              <p className="font-body text-bone/70 max-w-xl">
                Explora el trasfondo completo, personajes legendarios, batallas epicas
                y la rica historia de {faction.name}.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Scribe CTA Banner */}
      {userStatus.isLoggedIn && !userStatus.canContribute && (
        <section className="relative py-4 border-b" style={{ borderColor: `${faction.color}15` }}>
          <div className="max-w-7xl mx-auto px-6">
            <Link href="/wiki/solicitar">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex items-center justify-between p-4 rounded-xl transition-all hover:scale-[1.01]"
                style={{
                  background: `linear-gradient(135deg, ${faction.color}15 0%, ${faction.color}05 100%)`,
                  border: `1px solid ${faction.color}30`,
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ background: `${faction.color}20` }}
                  >
                    <Feather className="w-6 h-6" style={{ color: faction.color }} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-sm sm:text-base">
                      {userStatus.hasPendingApplication
                        ? 'Tu solicitud esta en revision'
                        : 'Unete a la Orden de Escribas'}
                    </h3>
                    <p className="font-body text-bone/60 text-xs sm:text-sm">
                      {userStatus.hasPendingApplication
                        ? 'El Archivista Mayor revisara tu peticion pronto'
                        : 'Contribuye al Archivo Lexicanum documentando el lore de las facciones'}
                    </p>
                  </div>
                </div>
                {!userStatus.hasPendingApplication && (
                  <div
                    className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg font-display text-sm font-semibold transition-all group-hover:gap-3"
                    style={{ background: faction.color, color: '#030308' }}
                  >
                    Solicitar
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            </Link>
          </div>
        </section>
      )}

      {/* Search & Categories */}
      <section className="relative py-8 border-y" style={{ borderColor: `${faction.color}20` }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bone/40" />
              <Input
                type="text"
                placeholder="Buscar articulos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-2 rounded-lg font-body text-sm transition-all ${
                  !activeCategory
                    ? 'text-void'
                    : 'text-bone/70 hover:text-bone hover:bg-bone/10'
                }`}
                style={!activeCategory ? { background: faction.color } : undefined}
              >
                Todos
              </button>
              {categories.map((cat) => {
                const Icon = categoryIcons[cat.icon || 'BookOpen'] || BookOpen
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.slug)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-body text-sm transition-all ${
                      activeCategory === cat.slug
                        ? 'text-void'
                        : 'text-bone/70 hover:text-bone hover:bg-bone/10'
                    }`}
                    style={activeCategory === cat.slug ? { background: faction.color } : undefined}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-72 rounded-xl animate-pulse"
                  style={{ background: `${faction.color}10` }}
                />
              ))}
            </div>
          ) : filteredPages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <BookOpen
                className="w-16 h-16 mx-auto mb-6 opacity-30"
                style={{ color: faction.color }}
              />
              <h2 className="font-display text-2xl text-white mb-4">
                No hay articulos disponibles
              </h2>
              <p className="font-body text-bone/60 mb-8">
                {search
                  ? 'No se encontraron resultados para tu busqueda.'
                  : 'Proximamente se agregaran articulos sobre esta faccion.'}
              </p>
              {search && (
                <Button variant="outline" onClick={() => setSearch('')}>
                  Limpiar busqueda
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPages.map((page, index) => (
                <WikiArticleCard
                  key={page.id}
                  page={page}
                  factionId={factionId}
                  factionColor={faction.color}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

interface WikiArticleCardProps {
  page: WikiPage
  factionId: string
  factionColor: string
  index: number
}

function WikiArticleCard({ page, factionId, factionColor, index }: WikiArticleCardProps) {
  const CategoryIcon = page.category?.icon
    ? categoryIcons[page.category.icon] || BookOpen
    : BookOpen

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/facciones/${factionId}/wiki/${page.slug}`}>
        <div
          className="group relative h-72 rounded-xl overflow-hidden transition-all hover:shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${factionColor}15 0%, transparent 100%)`,
            border: `1px solid ${factionColor}20`,
          }}
        >
          {/* Hero image */}
          {page.hero_image && (
            <div className="absolute inset-0">
              <Image
                src={page.hero_image}
                alt={page.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void via-void/80 to-transparent" />
            </div>
          )}

          {/* Content */}
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            {/* Category badge */}
            {page.category && (
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-body font-semibold mb-3 w-fit"
                style={{ background: `${factionColor}30`, color: factionColor }}
              >
                <CategoryIcon className="w-3 h-3" />
                {page.category.name}
              </div>
            )}

            <h3 className="font-display text-xl font-bold text-white mb-2 group-hover:text-opacity-90 transition-colors">
              {page.title}
            </h3>

            {page.excerpt && (
              <p className="font-body text-sm text-bone/60 line-clamp-2 mb-4">
                {page.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-bone/40 font-body">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {page.views_count}
              </span>
              {page.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(page.published_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              )}
            </div>
          </div>

          {/* Hover overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              background: `linear-gradient(135deg, ${factionColor}10 0%, transparent 50%)`,
            }}
          />
        </div>
      </Link>
    </motion.article>
  )
}
