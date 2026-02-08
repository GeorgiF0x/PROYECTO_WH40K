'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  BookOpen,
  Search,
  Feather,
  ArrowRight,
  Scroll,
  Library,
  Layers,
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
  FloatingParticles,
  ImperialDivider,
} from '@/components/wiki'
import type { WikiPage, WikiCategory } from '@/lib/supabase/wiki.types'

const GOLD = '#C9A227'

export default function WikiHubPage() {
  const [activeFaction, setActiveFaction] = useState<string | null>(null)
  const [pages, setPages] = useState<WikiPage[]>([])
  const [categories, setCategories] = useState<WikiCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [totalArticles, setTotalArticles] = useState(0)
  const [userStatus, setUserStatus] = useState<{
    isLoggedIn: boolean
    canContribute: boolean
    hasPendingApplication: boolean
  }>({ isLoggedIn: false, canContribute: false, hasPendingApplication: false })

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

  useEffect(() => {
    loadData()
  }, [activeFaction, activeCategory])

  useEffect(() => {
    checkUserStatus()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const supabase = createClient()

      // Load categories
      const { data: catData } = await supabase
        .from('wiki_categories')
        .select('*')
        .order('sort_order', { ascending: true })

      if (catData) setCategories(catData as WikiCategory[])

      // Load published pages (all factions or filtered)
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
        .eq('status', 'published')
        .order('published_at', { ascending: false })

      if (activeFaction) {
        query = query.eq('faction_id', activeFaction)
      }

      if (activeCategory && catData) {
        const cat = (catData as WikiCategory[]).find(c => c.slug === activeCategory)
        if (cat) {
          query = query.eq('category_id', cat.id)
        }
      }

      const { data: pagesData } = await query
      if (pagesData) {
        setPages(pagesData as WikiPage[])
      }

      // Total count (no filters)
      const { count } = await supabase
        .from('faction_wiki_pages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')

      if (count !== null) setTotalArticles(count)
    } catch (error) {
      console.error('Error loading wiki data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function checkUserStatus() {
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
  }

  const filteredPages = search
    ? pages.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    : pages

  // Helper to resolve faction data for a page
  function getFactionForPage(factionId: string) {
    return factions.find(f => f.id === factionId)
  }

  return (
    <div className="relative min-h-screen">
      <div className="noise-overlay" />
      <FloatingParticles color="bg-imperial-gold/20" />

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

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        {/* Top radial glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-3xl opacity-20 transition-colors duration-700 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
        />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center">
            {/* Icon with glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative mb-8"
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center border transition-colors duration-700"
                style={{
                  background: `${accentColor}15`,
                  borderColor: `${accentColor}30`,
                  boxShadow: `0 0 40px ${accentColor}20`,
                }}
              >
                <BookOpen className="w-10 h-10 transition-colors duration-700" style={{ color: accentColor }} />
              </div>
              {/* Pulsing glow ring */}
              <motion.div
                className="absolute inset-0 rounded-2xl"
                animate={{
                  boxShadow: [
                    `0 0 20px ${accentColor}20`,
                    `0 0 40px ${accentColor}30`,
                    `0 0 20px ${accentColor}20`,
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-5xl md:text-7xl font-black mb-4"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, #F5F0E1, ${accentColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Archivo Lexicanum
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-body text-lg text-bone/60 max-w-lg mb-10"
            >
              El conocimiento sagrado de la galaxia
            </motion.p>

            {/* Mini KPIs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-8"
            >
              {[
                { icon: Scroll, label: 'Articulos', value: totalArticles },
                { icon: Library, label: 'Facciones', value: factionCount || factions.length },
                { icon: Layers, label: 'Categorias', value: categories.length },
              ].map((kpi) => (
                <div key={kpi.label} className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <kpi.icon className="w-4 h-4 transition-colors duration-700" style={{ color: accentColor }} />
                    <span className="font-display text-2xl font-bold text-white">{kpi.value}</span>
                  </div>
                  <span className="text-[10px] font-mono text-bone/40 tracking-widest uppercase">{kpi.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ FACTION SELECTOR ═══ */}
      <section className="relative py-4 border-y transition-colors duration-700" style={{ borderColor: `${accentColor}15` }}>
        <div className="max-w-7xl mx-auto px-6">
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
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-body text-sm whitespace-nowrap transition-all shrink-0"
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
      <section className="relative py-8 border-b transition-colors duration-700" style={{ borderColor: `${accentColor}15` }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative p-6 rounded-xl border transition-colors duration-700" style={{ borderColor: `${accentColor}15`, background: `${accentColor}05` }}>
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
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-6">
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
          ) : filteredPages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <BookOpen
                className="w-16 h-16 mx-auto mb-6 opacity-30 transition-colors duration-700"
                style={{ color: accentColor }}
              />
              <h2 className="font-display text-2xl text-white mb-4">
                No hay articulos disponibles
              </h2>
              <p className="font-body text-bone/60 mb-8">
                {search
                  ? 'No se encontraron resultados para tu busqueda.'
                  : 'Proximamente se agregaran articulos.'}
              </p>
              {search && (
                <Button variant="outline" onClick={() => setSearch('')}>
                  Limpiar busqueda
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPages.map((page, index) => {
                const pf = getFactionForPage(page.faction_id)
                return (
                  <WikiArticleCard
                    key={page.id}
                    page={page}
                    factionId={page.faction_id}
                    factionColor={pf?.color || GOLD}
                    index={index}
                    showFactionBadge={!activeFaction}
                    factionName={pf?.shortName}
                  />
                )
              })}
            </div>
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
                  background: `linear-gradient(135deg, ${accentColor}10 0%, ${accentColor}05 50%, transparent 100%)`,
                  border: `1px solid ${accentColor}20`,
                }}
              >
                <GothicCorners className="text-imperial-gold/20" size={48} />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-700"
                    style={{ background: `${accentColor}20` }}
                  >
                    <Feather className="w-8 h-8 transition-colors duration-700" style={{ color: accentColor }} />
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
                    background: `radial-gradient(circle at 50% 50%, ${accentColor}08 0%, transparent 70%)`,
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
