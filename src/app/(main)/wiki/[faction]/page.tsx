'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useSearchParams } from 'next/navigation'
import { BookOpen, Search, ChevronLeft, Feather, ArrowRight } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'
import { getFactionById } from '@/lib/data'
import { getFactionTheme } from '@/lib/faction-themes'
import { FactionEffects, FactionSymbol } from '@/components/faction'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { WikiArticleCard, categoryIcons } from '@/components/wiki/WikiArticleCard'
import type { WikiPage, WikiCategory } from '@/lib/supabase/wiki.types'

export default function FactionWikiPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const factionId = params.faction as string
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
        .select(
          `
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
        `
        )
        .eq('faction_id', factionId)
        .eq('status', 'published')
        .order('published_at', { ascending: false })

      if (activeCategory) {
        // Get category ID from slug
        const cat = categories.find((c) => c.slug === activeCategory)
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
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setUserStatus({ isLoggedIn: false, canContribute: false, hasPendingApplication: false })
        return
      }

      // Get user's wiki permissions directly from Supabase
      // Note: wiki_role field added by migration 20260205_wiki_scribe_system.sql
      const { data: profile } = (await supabase
        .from('profiles')
        .select('wiki_role, is_admin, role')
        .eq('id', user.id)
        .single()) as {
        data: { wiki_role: string | null; is_admin: boolean; role: string } | null
        error: unknown
      }

      const isAdmin =
        profile?.is_admin || profile?.role === 'admin' || profile?.role === 'moderator'
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
    ? pages.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    : pages

  if (!faction) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-void">
        <div className="noise-overlay" />
        <div className="text-center">
          <h1 className="mb-4 font-display text-4xl text-white">Faccion no encontrada</h1>
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

      <div className="pointer-events-none fixed inset-0 opacity-20">
        <FactionEffects factionId={faction.id} />
      </div>

      <Navigation />

      {/* Header */}
      <section className="relative pb-12 pt-28">
        <div className="mx-auto max-w-7xl px-6">
          {/* Back link */}
          <Link
            href={`/facciones/${factionId}`}
            className="mb-6 inline-flex items-center gap-2 font-body text-sm text-bone/60 transition-colors hover:text-bone"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver a {faction.shortName}
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6 md:flex-row md:items-center"
          >
            <FactionSymbol factionId={faction.id} size="lg" animated />

            <div className="flex-1">
              <span
                className="mb-2 block font-body text-sm font-semibold uppercase tracking-widest"
                style={{ color: faction.color }}
              >
                Wiki de {faction.shortName}
              </span>
              <h1 className="mb-4 font-display text-4xl font-black text-white md:text-5xl">
                Lexicanum Imperial
              </h1>
              <p className="max-w-xl font-body text-bone/70">
                Explora el trasfondo completo, personajes legendarios, batallas epicas y la rica
                historia de {faction.name}.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Scribe CTA Banner */}
      {userStatus.isLoggedIn && !userStatus.canContribute && (
        <section className="relative border-b py-4" style={{ borderColor: `${faction.color}15` }}>
          <div className="mx-auto max-w-7xl px-6">
            <Link href="/wiki/solicitar">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex items-center justify-between rounded-xl p-4 transition-all hover:scale-[1.01]"
                style={{
                  background: `linear-gradient(135deg, ${faction.color}15 0%, ${faction.color}05 100%)`,
                  border: `1px solid ${faction.color}30`,
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-lg"
                    style={{ background: `${faction.color}20` }}
                  >
                    <Feather className="h-6 w-6" style={{ color: faction.color }} />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-white sm:text-base">
                      {userStatus.hasPendingApplication
                        ? 'Tu solicitud esta en revision'
                        : 'Unete a la Orden de Escribas'}
                    </h3>
                    <p className="font-body text-xs text-bone/60 sm:text-sm">
                      {userStatus.hasPendingApplication
                        ? 'El Archivista Mayor revisara tu peticion pronto'
                        : 'Contribuye al Archivo Lexicanum documentando el lore de las facciones'}
                    </p>
                  </div>
                </div>
                {!userStatus.hasPendingApplication && (
                  <div
                    className="hidden items-center gap-2 rounded-lg px-4 py-2 font-display text-sm font-semibold transition-all group-hover:gap-3 sm:flex"
                    style={{ background: faction.color, color: '#030308' }}
                  >
                    Solicitar
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </motion.div>
            </Link>
          </div>
        </section>
      )}

      {/* Search & Categories */}
      <section className="relative border-y py-8" style={{ borderColor: `${faction.color}20` }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-6 md:flex-row">
            {/* Search */}
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-bone/40" />
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
                className={`rounded-lg px-4 py-2 font-body text-sm transition-all ${
                  !activeCategory ? 'text-void' : 'text-bone/70 hover:bg-bone/10 hover:text-bone'
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
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 font-body text-sm transition-all ${
                      activeCategory === cat.slug
                        ? 'text-void'
                        : 'text-bone/70 hover:bg-bone/10 hover:text-bone'
                    }`}
                    style={activeCategory === cat.slug ? { background: faction.color } : undefined}
                  >
                    <Icon className="h-4 w-4" />
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
        <div className="mx-auto max-w-7xl px-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-72 animate-pulse rounded-xl"
                  style={{ background: `${faction.color}10` }}
                />
              ))}
            </div>
          ) : filteredPages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center"
            >
              <BookOpen
                className="mx-auto mb-6 h-16 w-16 opacity-30"
                style={{ color: faction.color }}
              />
              <h2 className="mb-4 font-display text-2xl text-white">
                No hay articulos disponibles
              </h2>
              <p className="mb-8 font-body text-bone/60">
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
