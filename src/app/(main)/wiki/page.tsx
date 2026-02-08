'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  BookOpen,
  Search,
  Feather,
  ArrowRight,
  Scroll,
  Library,
  Layers,
  Crosshair,
  Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { factions } from '@/lib/data'
import { FactionSymbol } from '@/components/faction'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import {
  WikiArticleCard,
  categoryIcons,
  GothicCorners,
  ImperialDivider,
  SectionLabel,
} from '@/components/wiki'
import type { WikiPage, WikiCategory } from '@/lib/supabase/wiki.types'

const GOLD = '#C9A227'
const PAGE_SIZE = 12

export default function WikiHubPage() {
  const [activeFaction, setActiveFaction] = useState<string | null>(null)
  const [pages, setPages] = useState<WikiPage[]>([])
  const [categories, setCategories] = useState<WikiCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [totalArticles, setTotalArticles] = useState(0)
  const [filteredCount, setFilteredCount] = useState(0)
  const [page, setPage] = useState(0)
  const categoriesRef = useRef<WikiCategory[]>([])
  const [userStatus, setUserStatus] = useState<{
    isLoggedIn: boolean
    canContribute: boolean
    hasPendingApplication: boolean
  }>({ isLoggedIn: false, canContribute: false, hasPendingApplication: false })

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Accent color based on active faction
  const accentColor = useMemo(() => {
    if (!activeFaction) return GOLD
    return factions.find(f => f.id === activeFaction)?.color || GOLD
  }, [activeFaction])

  // Count unique factions with articles
  const factionCount = useMemo(() => {
    if (activeFaction) return 1
    const ids = new Set(pages.map(p => p.faction_id))
    return ids.size
  }, [pages, activeFaction])

  const hasMore = pages.length < filteredCount

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      // Load categories on first call
      if (categoriesRef.current.length === 0) {
        const { data: catData } = await supabase
          .from('wiki_categories')
          .select('*')
          .order('sort_order', { ascending: true })
        if (catData) {
          categoriesRef.current = catData as WikiCategory[]
          setCategories(catData as WikiCategory[])
        }
      }

      // Build pages query (first page only)
      let pagesQuery = supabase
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
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(0, PAGE_SIZE - 1)

      // Build filtered count query (mirrors filters)
      let countQuery = supabase
        .from('faction_wiki_pages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')

      if (activeFaction) {
        pagesQuery = pagesQuery.eq('faction_id', activeFaction)
        countQuery = countQuery.eq('faction_id', activeFaction)
      }

      if (activeCategory && categoriesRef.current.length > 0) {
        const cat = categoriesRef.current.find(c => c.slug === activeCategory)
        if (cat) {
          pagesQuery = pagesQuery.eq('category_id', cat.id)
          countQuery = countQuery.eq('category_id', cat.id)
        }
      }

      if (debouncedSearch) {
        pagesQuery = pagesQuery.ilike('title', `%${debouncedSearch}%`)
        countQuery = countQuery.ilike('title', `%${debouncedSearch}%`)
      }

      // Run pages, filtered count, and total count in parallel
      const [pagesResult, filteredResult, totalResult] = await Promise.all([
        pagesQuery,
        countQuery,
        supabase.from('faction_wiki_pages').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      ])

      setPages((pagesResult.data ?? []) as WikiPage[])
      if (filteredResult.count !== null) setFilteredCount(filteredResult.count)
      if (totalResult.count !== null) setTotalArticles(totalResult.count)
    } catch (error) {
      console.error('Error loading wiki data:', error)
    } finally {
      setLoading(false)
    }
  }, [activeFaction, activeCategory, debouncedSearch])

  const checkUserStatus = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setUserStatus({ isLoggedIn: false, canContribute: false, hasPendingApplication: false })
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('wiki_role, is_admin, role')
        .eq('id', user.id)
        .single() as { data: { wiki_role: string | null; is_admin: boolean; role: string } | null; error: unknown }

      const isAdmin = profile?.is_admin || profile?.role === 'admin' || profile?.role === 'moderator'
      const isScribe = !!profile?.wiki_role
      const canContribute = isAdmin || isScribe

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
    } catch {
      setUserStatus({ isLoggedIn: false, canContribute: false, hasPendingApplication: false })
    }
  }, [])

  // Reset page when filters change
  useEffect(() => {
    setPage(0)
  }, [activeFaction, activeCategory])

  // Load data when filters or page change (but not on page increment — that uses loadMore)
  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFaction, activeCategory, debouncedSearch])

  useEffect(() => {
    checkUserStatus()
  }, [checkUserStatus])

  const loadMore = useCallback(async () => {
    const nextPage = page + 1
    setPage(nextPage)
    setLoadingMore(true)
    try {
      const supabase = createClient()
      const from = nextPage * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      let pagesQuery = supabase
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
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(from, to)

      if (activeFaction) {
        pagesQuery = pagesQuery.eq('faction_id', activeFaction)
      }
      if (activeCategory && categoriesRef.current.length > 0) {
        const cat = categoriesRef.current.find(c => c.slug === activeCategory)
        if (cat) pagesQuery = pagesQuery.eq('category_id', cat.id)
      }
      if (debouncedSearch) {
        pagesQuery = pagesQuery.ilike('title', `%${debouncedSearch}%`)
      }

      const { data } = await pagesQuery
      if (data) setPages(prev => [...prev, ...(data as WikiPage[])])
    } catch (error) {
      console.error('Error loading more wiki pages:', error)
    } finally {
      setLoadingMore(false)
    }
  }, [page, activeFaction, activeCategory, debouncedSearch])

  // Helper to resolve faction data for a page
  function getFactionForPage(factionId: string) {
    return factions.find(f => f.id === factionId)
  }

  return (
    <div className="relative min-h-screen">
      <div className="noise-overlay" />

      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201,162,39,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,162,39,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Lightweight hero particles (CSS-only) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-imperial-gold/25"
            style={{
              left: `${15 + i * 18}%`,
              top: `${10 + i * 12}%`,
              animation: `wikiParticleDrift ${8 + i * 2}s ease-in-out infinite ${i * 1.2}s`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes wikiParticleDrift {
          0%, 100% { opacity: 0; transform: translateY(0); }
          50% { opacity: 0.5; transform: translateY(-20px); }
        }
        @keyframes wikiPulseOuter {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.25); opacity: 0.15; }
        }
        @keyframes wikiPulseInner {
          0%, 100% { transform: scale(1.1); opacity: 0.25; }
          50% { transform: scale(1); opacity: 0.45; }
        }
        @keyframes wikiGlowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(201,162,39,0.15); }
          50% { box-shadow: 0 0 40px rgba(201,162,39,0.25); }
        }
      `}</style>

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        {/* Top radial glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-3xl opacity-20 transition-colors duration-700 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
        />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Hero card container */}
          <div
            className="relative overflow-hidden rounded-2xl p-8 sm:p-10 md:p-12"
            style={{
              background: `linear-gradient(180deg, ${accentColor}14 0%, rgba(3,3,8,0.6) 100%)`,
              border: `1px solid ${accentColor}26`,
            }}
          >
            <GothicCorners className="text-imperial-gold/30" size={50} />

            {/* Ruled manuscript lines */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage: `repeating-linear-gradient(0deg, ${accentColor}80 0px, ${accentColor}80 1px, transparent 1px, transparent 28px)`,
                backgroundPosition: '0 20px',
              }}
            />

            {/* Radial glow inside card */}
            <div
              className="absolute inset-0 pointer-events-none transition-colors duration-700"
              style={{
                background: `radial-gradient(ellipse at center, ${accentColor}14 0%, transparent 70%)`,
              }}
            />

            <div className="relative flex flex-col items-center text-center">
              {/* Concentric rings icon */}
              <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
                {/* Outer pulsing ring (CSS animation) */}
                <div
                  className="absolute inset-0 rounded-full border-2 transition-colors duration-700"
                  style={{
                    borderColor: `${accentColor}4D`,
                    animation: 'wikiPulseOuter 3s ease-in-out infinite',
                  }}
                />
                {/* Inner counter-pulse ring (CSS animation) */}
                <div
                  className="absolute inset-2 rounded-full border transition-colors duration-700"
                  style={{
                    borderColor: `${accentColor}33`,
                    animation: 'wikiPulseInner 2.5s ease-in-out infinite 0.5s',
                  }}
                />
                {/* Center icon with glow pulse */}
                <div
                  className="relative w-20 h-20 rounded-full flex items-center justify-center border transition-colors duration-700"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}33 0%, ${accentColor}0D 100%)`,
                    borderColor: `${accentColor}80`,
                    animation: 'wikiGlowPulse 3s ease-in-out infinite',
                  }}
                >
                  <Image
                    src="/icons/Imperium/librarian-codicier.svg"
                    alt=""
                    width={40}
                    height={40}
                    className="w-10 h-10 transition-opacity duration-700"
                    style={{ filter: 'brightness(0) invert(1)', opacity: 0.85 }}
                  />
                </div>
              </div>

              {/* Section label */}
              <SectionLabel icon={Crosshair} className="justify-center mb-3">
                TRANSMISION IMPERIAL // ARCHIVO LEXICANUM
              </SectionLabel>

              {/* Static H1 — no initial/animate for LCP */}
              <h1 className="font-display text-5xl md:text-7xl font-black mb-4 text-gradient">
                Archivo Lexicanum
              </h1>

              <p className="font-mono text-sm text-bone/50 tracking-wider max-w-lg mb-10">
                El conocimiento sagrado de la galaxia, custodiado por la Orden de Escribas
              </p>

              {/* Mini KPIs with dividers */}
              <div className="flex items-center gap-6 sm:gap-8">
                {[
                  { icon: Scroll, label: 'Articulos', value: totalArticles },
                  { icon: Library, label: 'Facciones', value: factionCount || factions.length },
                  { icon: Layers, label: 'Categorias', value: categories.length },
                ].map((kpi, idx) => (
                  <div key={kpi.label} className="flex items-center gap-6 sm:gap-8">
                    {idx > 0 && (
                      <div className="w-px h-8 bg-imperial-gold/20" />
                    )}
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2">
                        <kpi.icon className="w-4 h-4 transition-colors duration-700" style={{ color: accentColor }} />
                        <span className="font-display text-2xl font-bold text-white">{kpi.value}</span>
                      </div>
                      <span className="text-[10px] font-mono text-bone/40 tracking-widest uppercase">{kpi.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        <ImperialDivider />
      </div>

      {/* ═══ FACTION SELECTOR ═══ */}
      <section className="relative py-6">
        <div className="max-w-7xl mx-auto px-6">
          <SectionLabel icon={Layers} className="mb-4">
            SELECCIONAR FACCION
          </SectionLabel>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {/* "Todas" button */}
            <button
              onClick={() => { setActiveFaction(null); setActiveCategory(null) }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-body text-sm whitespace-nowrap transition-all shrink-0"
              style={
                !activeFaction
                  ? { background: `${GOLD}20`, color: GOLD, border: `1px solid ${GOLD}40`, boxShadow: `0 0 12px ${GOLD}15` }
                  : { color: '#F5F0E199', border: '1px solid transparent' }
              }
            >
              <Layers className="w-4 h-4" />
              Todas
            </button>

            {/* Faction pills */}
            {factions.map((f) => {
              const isActive = activeFaction === f.id
              return (
                <button
                  key={f.id}
                  onClick={() => { setActiveFaction(f.id); setActiveCategory(null) }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-body text-sm whitespace-nowrap transition-all shrink-0 ${
                    !isActive ? 'hover:bg-bone/5' : ''
                  }`}
                  style={
                    isActive
                      ? { background: `${f.color}20`, color: f.color, border: `1px solid ${f.color}40`, boxShadow: `0 0 12px ${f.color}15` }
                      : { color: '#F5F0E199', border: '1px solid transparent' }
                  }
                >
                  <FactionSymbol factionId={f.id} size="sm" />
                  {f.shortName}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ SEARCH + CATEGORIES ═══ */}
      <section className="relative py-8">
        <div className="max-w-7xl mx-auto px-6">
          <SectionLabel icon={Search} className="mb-4">
            BUSQUEDA EN EL ARCHIVO
          </SectionLabel>

          <div
            className="relative glass p-6 rounded-xl"
            style={{ borderColor: `${accentColor}26` }}
          >
            <GothicCorners className="text-imperial-gold/30" size={32} />

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
                  style={!activeCategory ? { background: accentColor } : undefined}
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
                      style={activeCategory === cat.slug ? { background: accentColor } : undefined}
                    >
                      <Icon className="w-4 h-4" />
                      {cat.name}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ARTICLES GRID ═══ */}
      <section className="relative py-16" style={{ minHeight: 400 }}>
        {/* Top gradient line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-imperial-gold/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-6">
          <SectionLabel icon={Scroll} className="mb-6">
            REGISTROS ENCONTRADOS — {filteredCount}
          </SectionLabel>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-72 rounded-xl animate-pulse transition-colors duration-700"
                  style={{ background: `${accentColor}10` }}
                />
              ))}
            </div>
          ) : pages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="relative p-10 md:p-16 rounded-2xl text-center overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${accentColor}0A 0%, transparent 100%)`,
                border: `1px solid ${accentColor}1A`,
              }}
            >
              <GothicCorners className="text-imperial-gold/20" size={40} />

              <BookOpen
                className="w-16 h-16 mx-auto mb-6 opacity-30 transition-colors duration-700"
                style={{ color: accentColor }}
              />
              <h2 className="font-display text-2xl text-white mb-4">
                No hay articulos disponibles
              </h2>
              <p className="font-body text-bone/60 mb-4">
                {debouncedSearch
                  ? 'No se encontraron resultados para tu busqueda.'
                  : 'Proximamente se agregaran articulos.'}
              </p>
              <p className="font-mono text-sm text-bone/30 italic mb-8 max-w-md mx-auto">
                &ldquo;El conocimiento es poder; guardarlo bien.&rdquo;
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                {debouncedSearch && (
                  <Button variant="outline" onClick={() => { setSearch(''); setDebouncedSearch('') }}>
                    Limpiar busqueda
                  </Button>
                )}
                <Link
                  href="/facciones"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-body text-sm text-bone/60 hover:text-bone border border-bone/10 hover:border-bone/20 transition-all"
                >
                  Explorar Facciones
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pages.map((pg, index) => {
                  const pf = getFactionForPage(pg.faction_id)
                  return (
                    <WikiArticleCard
                      key={pg.id}
                      page={pg}
                      factionId={pg.faction_id}
                      factionColor={pf?.color || GOLD}
                      index={index}
                      showFactionBadge={!activeFaction}
                      factionName={pf?.shortName}
                    />
                  )
                })}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="group flex items-center gap-2 px-8 py-3 rounded-lg font-display text-sm font-semibold transition-all disabled:opacity-50"
                    style={{
                      background: `${accentColor}15`,
                      color: accentColor,
                      border: `1px solid ${accentColor}30`,
                    }}
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Cargando...
                      </>
                    ) : (
                      <>
                        Cargar mas registros
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ═══ CTA ESCRIBAS ═══ */}
      {(!userStatus.isLoggedIn || !userStatus.canContribute) && (
        <section className="relative pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <ImperialDivider className="mb-12" />

            <Link href="/wiki/solicitar">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative p-8 md:p-12 rounded-2xl overflow-hidden transition-all hover:shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}1A 0%, ${accentColor}0D 50%, transparent 100%)`,
                  border: `1px solid ${accentColor}33`,
                }}
              >
                <GothicCorners className="text-imperial-gold/20" size={48} />

                {/* Ruled manuscript lines */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.03]"
                  style={{
                    backgroundImage: `repeating-linear-gradient(0deg, ${accentColor}80 0px, ${accentColor}80 1px, transparent 1px, transparent 28px)`,
                    backgroundPosition: '0 20px',
                  }}
                />

                {/* Radial glow */}
                <div
                  className="absolute inset-0 pointer-events-none transition-colors duration-700"
                  style={{
                    background: `radial-gradient(ellipse at center, ${accentColor}0D 0%, transparent 70%)`,
                  }}
                />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  {/* Concentric rings icon for CTA */}
                  <div className="relative inline-flex items-center justify-center w-20 h-20 shrink-0">
                    <div
                      className="absolute inset-0 rounded-full border-2 transition-colors duration-700"
                      style={{
                        borderColor: `${accentColor}4D`,
                        animation: 'wikiPulseOuter 3s ease-in-out infinite',
                      }}
                    />
                    <div
                      className="absolute inset-2 rounded-full border transition-colors duration-700"
                      style={{
                        borderColor: `${accentColor}33`,
                        animation: 'wikiPulseInner 2.5s ease-in-out infinite 0.5s',
                      }}
                    />
                    <div
                      className="relative w-16 h-16 rounded-full flex items-center justify-center border transition-colors duration-700"
                      style={{
                        background: `linear-gradient(135deg, ${accentColor}33 0%, ${accentColor}0D 100%)`,
                        borderColor: `${accentColor}80`,
                        animation: 'wikiGlowPulse 3s ease-in-out infinite',
                      }}
                    >
                      <Feather className="w-8 h-8 transition-colors duration-700" style={{ color: accentColor }} />
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
                      {userStatus.hasPendingApplication
                        ? 'Tu solicitud esta en revision'
                        : 'Unete a la Orden de Escribas'}
                    </h3>
                    <p className="font-body text-bone/60 max-w-lg">
                      {userStatus.hasPendingApplication
                        ? 'El Archivista Mayor revisara tu peticion pronto. Recibiras una notificacion cuando sea procesada.'
                        : 'Contribuye al Archivo Lexicanum documentando el lore, las batallas y los heroes de cada faccion.'}
                    </p>
                  </div>

                  {!userStatus.hasPendingApplication && (
                    <div
                      className="flex items-center gap-2 px-6 py-3 rounded-lg font-display text-sm font-semibold transition-all group-hover:gap-3 shrink-0"
                      style={{ background: accentColor, color: '#030308' }}
                    >
                      Solicitar
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${accentColor}14 0%, transparent 70%)`,
                  }}
                />
              </motion.div>
            </Link>
          </div>
        </section>
      )}

    </div>
  )
}
