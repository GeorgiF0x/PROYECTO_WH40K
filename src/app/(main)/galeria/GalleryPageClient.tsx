'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { MiniatureGrid, type MiniatureWithStats } from '@/components/gallery'
import { createClient } from '@/lib/supabase/client'
import { FACTION_ICONS, CATEGORIES, SLUG_TO_CATEGORY } from '@/components/user'
import { Search, SlidersHorizontal, Grid3X3, List, TrendingUp, Clock, Flame, Archive } from 'lucide-react'

type SortOption = 'recent' | 'popular' | 'trending'
type ViewMode = 'grid' | 'list'

type Faction = {
  id: string
  name: string
  slug: string
  primary_color: string | null
  secondary_color: string | null
}

interface GalleryPageClientProps {
  initialMiniatures: MiniatureWithStats[]
  factions: Faction[]
}

const sortOptions = [
  { value: 'recent', label: 'Recientes', icon: Clock },
  { value: 'popular', label: 'Populares', icon: TrendingUp },
  { value: 'trending', label: 'Tendencia', icon: Flame },
] as const

const FILTER_CATEGORIES = CATEGORIES.filter((c) => c.id !== 'all')

// --- Decorative components ---

const GAUSS_PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  left: `${(i * 7 + 3) % 90 + 5}%`,
  top: `${(i * 13 + 8) % 82 + 9}%`,
  isOrb: i >= 10,
  w: i >= 10 ? (i % 3 === 0 ? 10 : 6) : (i % 3 === 0 ? 45 : i % 2 === 0 ? 32 : 20),
  h: i >= 10 ? (i % 3 === 0 ? 10 : 6) : 3,
  rot: i >= 10 ? 0 : (i * 37) % 180,
  drift: (i % 2 === 0 ? -1 : 1) * (12 + (i % 4) * 8),
  dur: 6 + (i % 5) * 1.5,
  delay: i * 0.45,
  blur: i >= 10 ? (i % 3 === 0 ? 4 : 2) : 1,
  peak: i >= 10 ? 0.5 : 0.6,
}))

function GaussParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {GAUSS_PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.w,
            height: p.h,
            background: p.isOrb
              ? 'radial-gradient(circle, rgba(13,155,138,0.5), transparent 70%)'
              : 'linear-gradient(90deg, transparent, rgba(0,255,135,0.3), transparent)',
            transform: p.rot ? `rotate(${p.rot}deg)` : undefined,
            filter: `blur(${p.blur}px)`,
          }}
          animate={{
            y: [0, p.drift, 0],
            opacity: [0, p.peak, 0],
            scale: p.isOrb ? [0.5, 1.3, 0.5] : undefined,
            scaleX: p.isOrb ? undefined : [0.4, 1, 0.4],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

function TesseractIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      <rect x="30" y="30" width="100" height="100" stroke="currentColor" strokeWidth="0.8" />
      <rect x="70" y="70" width="100" height="100" stroke="currentColor" strokeWidth="0.8" />
      <line x1="30" y1="30" x2="70" y2="70" stroke="currentColor" strokeWidth="0.6" />
      <line x1="130" y1="30" x2="170" y2="70" stroke="currentColor" strokeWidth="0.6" />
      <line x1="30" y1="130" x2="70" y2="170" stroke="currentColor" strokeWidth="0.6" />
      <line x1="130" y1="130" x2="170" y2="170" stroke="currentColor" strokeWidth="0.6" />
    </svg>
  )
}

function NecronCorner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const posClass = { tl: 'top-0 left-0', tr: 'top-0 right-0', bl: 'bottom-0 left-0', br: 'bottom-0 right-0' }[position]
  const flip = { tl: undefined, tr: 'scaleX(-1)', bl: 'scaleY(-1)', br: 'scale(-1)' }[position]

  return (
    <svg
      viewBox="0 0 60 60"
      className={`absolute w-14 h-14 text-necron-teal pointer-events-none ${posClass}`}
      style={flip ? { transform: flip } : undefined}
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
    >
      <path d="M0 60 V14 H6 V6 H14 V0 H60" strokeWidth="1.5" opacity="0.45" />
      <path d="M6 52 V20 H12 V12 H20 V6 H52" strokeWidth="0.75" opacity="0.18" />
      <path d="M14 20 H20 V14" strokeWidth="1" opacity="0.3" />
      <rect x="11" y="11" width="4" height="4" fill="currentColor" opacity="0.3" stroke="none" />
      <rect x="36" y="1" width="2.5" height="2.5" fill="currentColor" opacity="0.2" stroke="none" />
      <rect x="1" y="36" width="2.5" height="2.5" fill="currentColor" opacity="0.2" stroke="none" />
      <rect x="52" y="1" width="2" height="2" fill="currentColor" opacity="0.15" stroke="none" />
    </svg>
  )
}

const EMBER_SEEDS = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 5) % 90 + 5}%`,
  top: `${(i * 23 + 10) % 80 + 10}%`,
  drift: (i % 2 === 0 ? -1 : 1) * (18 + (i % 3) * 10),
  dur: 5 + (i % 3) * 2,
  delay: i * 0.7,
}))

function GaussEmbers() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {EMBER_SEEDS.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 rounded-full bg-necron/40"
          style={{ left: p.left, top: p.top }}
          animate={{
            y: [0, p.drift, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

function NecronDivider() {
  return (
    <div className="relative flex items-center justify-center py-6">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-necron-dark/20" />
      <motion.div
        className="w-1.5 h-1.5 rounded-full bg-necron-teal mx-2"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="mx-3">
        <svg width="24" height="32" viewBox="0 0 24 32" fill="none" className="text-necron-teal">
          <ellipse cx="12" cy="9" rx="6" ry="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <line x1="12" y1="17" x2="12" y2="30" stroke="currentColor" strokeWidth="1.5" />
          <line x1="6" y1="22" x2="18" y2="22" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>
      </div>
      <motion.div
        className="w-1.5 h-1.5 rounded-full bg-necron-teal mx-2"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      />
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-necron-dark/20" />
    </div>
  )
}

export function GalleryPageClient({ initialMiniatures, factions }: GalleryPageClientProps) {
  const [miniatures, setMiniatures] = useState<MiniatureWithStats[]>(initialMiniatures)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const supabase = createClient()

  const factionsInCategory = useMemo(() => {
    if (!selectedCategory) return []
    return factions.filter((f) => SLUG_TO_CATEGORY[f.slug] === selectedCategory)
  }, [factions, selectedCategory])

  const fetchMiniatures = async (factionId: string | null) => {
    setIsLoading(true)

    let query = supabase
      .from('miniatures')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `)

    if (factionId) {
      query = query.eq('faction_id', factionId)
    }

    query = query.order('created_at', { ascending: false }).limit(24)

    const { data, error } = await query

    if (!error && data) {
      setMiniatures(data)
    }

    setIsLoading(false)
  }

  const filteredMiniatures = miniatures.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCategorySelect = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null)
      setSelectedFaction(null)
      setMiniatures(initialMiniatures)
    } else {
      setSelectedCategory(categoryId)
      setSelectedFaction(null)
    }
  }

  const handleFactionSelect = (factionId: string) => {
    if (selectedFaction === factionId) {
      setSelectedFaction(null)
      setMiniatures(initialMiniatures)
    } else {
      setSelectedFaction(factionId)
      fetchMiniatures(factionId)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Atmospheric Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(13,155,138,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,212,170,0.05)_0%,transparent_50%)]" />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(13,155,138,0.06)_0%,transparent_50%)]"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <GaussParticles />
        {[0, 1, 2].map((i) => (
          <motion.div
            key={`wave-${i}`}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-necron-teal/[0.06]"
            style={{ width: 600, height: 600 }}
            animate={{ scale: [0.5, 4], opacity: [0.3, 0] }}
            transition={{ duration: 12, repeat: Infinity, delay: i * 4, ease: 'linear' }}
          />
        ))}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] text-necron-teal"
          animate={{ opacity: [0.03, 0.07, 0.03] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <TesseractIcon className="w-full h-full" />
        </motion.div>
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,255,135,0.2) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative px-6 py-16 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-necron-teal/10 border border-necron-teal/30 rounded-full mb-6"
            >
              <Archive className="w-4 h-4 text-necron-dark" />
              <span className="text-sm font-body text-necron-dark">Galerías Prismáticas de Solemnace</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-wide mb-4">
              <span className="text-bone">Galerías </span>
              <span className="bg-gradient-to-r from-necron-dark via-necron to-necron-dark bg-clip-text text-transparent">
                Prismáticas
              </span>
            </h1>

            <p className="text-lg text-bone/60 font-body max-w-2xl mx-auto">
              Explora los especímenes de la colección. Cada pieza, un tesoro preservado por la eternidad.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-necron-teal/40" />
              <div className="w-1.5 h-1.5 rotate-45 bg-necron-teal/60" />
              <div className="w-2 h-2 rotate-45 bg-necron-teal" />
              <div className="w-1.5 h-1.5 rotate-45 bg-necron-teal/60" />
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-necron-teal/40" />
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative bg-void-light/50 backdrop-blur-xl rounded-2xl border border-necron-teal/10 p-4 md:p-6 overflow-hidden"
          >
            <NecronCorner position="tl" />
            <NecronCorner position="tr" />
            <NecronCorner position="bl" />
            <NecronCorner position="br" />

            <motion.div
              className="absolute top-0 left-0 w-20 h-[1px] bg-gradient-to-r from-transparent via-necron-dark/40 to-transparent pointer-events-none"
              animate={{ left: ['-10%', '110%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
            />

            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <motion.div
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-bone/40"
                  animate={{ color: searchQuery ? '#0D9B8A' : 'rgba(232, 232, 240, 0.4)' }}
                >
                  <Search className="w-5 h-5" />
                </motion.div>
                <input
                  type="text"
                  placeholder="Buscar especímenes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-void border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-necron-dark/50 transition-colors"
                />
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                {sortOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <motion.button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl font-body text-sm font-medium transition-all ${
                        sortBy === option.value
                          ? 'bg-necron-teal text-void'
                          : 'bg-void border border-bone/10 text-bone/60 hover:border-necron-teal/30'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{option.label}</span>
                    </motion.button>
                  )
                })}
              </div>

              {/* Filter Toggle */}
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-body text-sm font-medium transition-all ${
                  showFilters || selectedFaction
                    ? 'bg-necron-teal/20 border border-necron-teal/50 text-necron-dark'
                    : 'bg-void border border-bone/10 text-bone/60 hover:border-necron-teal/30'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filtros</span>
                {selectedFaction && <span className="w-2 h-2 rounded-full bg-necron-teal" />}
              </motion.button>

              {/* View Mode */}
              <div className="flex items-center gap-1 bg-void rounded-xl border border-bone/10 p-1">
                <motion.button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-necron-teal text-void' : 'text-bone/60 hover:text-bone'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Grid3X3 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-necron-teal text-void' : 'text-bone/60 hover:text-bone'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <List className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Expanded Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t border-necron-teal/10">
                    <div className="mb-3">
                      <label className="block text-sm text-bone/60 mb-2 font-body">Facción</label>
                      <div className="flex flex-wrap gap-2">
                        {FILTER_CATEGORIES.map((cat) => (
                          <motion.button
                            key={cat.id}
                            onClick={() => handleCategorySelect(cat.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-body transition-colors ${
                              selectedCategory === cat.id
                                ? 'bg-necron-teal text-void'
                                : 'bg-void border border-bone/10 text-bone/60 hover:border-necron-teal/30'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {cat.icon && (
                              <div className="w-4 h-4 relative">
                                <Image
                                  src={cat.icon}
                                  alt={cat.label}
                                  fill
                                  className={selectedCategory === cat.id ? '' : 'opacity-60 invert'}
                                />
                              </div>
                            )}
                            {cat.label}
                          </motion.button>
                        ))}
                        {(selectedCategory || selectedFaction) && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => {
                              setSelectedCategory(null)
                              setSelectedFaction(null)
                              setMiniatures(initialMiniatures)
                            }}
                            className="px-3 py-1.5 rounded-lg text-sm font-body text-red-400 border border-red-400/30 hover:bg-red-400/10"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Limpiar
                          </motion.button>
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {selectedCategory && factionsInCategory.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-wrap gap-2 pt-2">
                            {factionsInCategory.map((faction) => {
                              const iconPath = FACTION_ICONS[faction.slug]
                              const isSelected = selectedFaction === faction.id
                              return (
                                <motion.button
                                  key={faction.id}
                                  onClick={() => handleFactionSelect(faction.id)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body transition-colors border ${
                                    isSelected
                                      ? 'border-necron-teal text-necron-dark'
                                      : 'border-bone/10 text-bone/60 hover:border-bone/30'
                                  }`}
                                  style={isSelected ? { background: `linear-gradient(135deg, ${faction.primary_color}20, transparent)` } : {}}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  {iconPath && (
                                    <div
                                      className="w-4 h-4 rounded flex items-center justify-center"
                                      style={{ background: faction.primary_color || '#666' }}
                                    >
                                      <Image src={iconPath} alt={faction.name} width={12} height={12} className="invert" />
                                    </div>
                                  )}
                                  {faction.name}
                                </motion.button>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="relative px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="text-bone/50 font-body">
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <motion.span
                    className="inline-block w-4 h-4 border-2 border-bone/20 border-t-necron-dark rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Cargando...
                </span>
              ) : (
                <span>
                  <span className="text-necron-dark font-semibold">{filteredMiniatures.length}</span> especímenes encontrados
                </span>
              )}
            </div>
          </motion.div>

          <MiniatureGrid
            miniatures={filteredMiniatures}
            isLoading={isLoading}
            viewMode={viewMode}
            emptyMessage={
              searchQuery
                ? `No se encontraron especímenes para "${searchQuery}"`
                : 'Aún no hay especímenes en las galerías. ¡Sé el primero en preservar el tuyo!'
            }
          />

          {!isLoading && filteredMiniatures.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center mt-12"
            >
              <motion.button
                className="relative px-8 py-4 bg-transparent border border-necron-teal/50 text-necron-dark font-display font-semibold tracking-wider uppercase text-sm rounded-lg overflow-hidden group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-necron-teal/10"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative">Cargar más</span>
              </motion.button>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 mt-20 z-10">
        <div className="max-w-4xl mx-auto">
          <NecronDivider />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-necron-teal/15 via-void-light to-necron-dark/10" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, transparent 40%, rgba(0,212,170,0.15) 50%, transparent 60%, transparent 100%)',
                backgroundSize: '200% 100%',
              }}
              animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            />
            <NecronCorner position="tl" />
            <NecronCorner position="tr" />
            <NecronCorner position="bl" />
            <NecronCorner position="br" />
            <GaussEmbers />
            <div className="relative z-10 p-8 md:p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-necron-teal/15 border border-necron-teal/30 mb-6"
              >
                <Archive className="w-8 h-8 text-necron-dark" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-bone mb-4">
                ¿Tienes especímenes para la colección?
              </h2>
              <p className="text-bone/60 font-body mb-8 max-w-xl mx-auto">
                Todo Arqueovista merece un lugar en las Galerías. Preserva tus obras para la eternidad.
              </p>
              <motion.a
                href="/mi-galeria/subir"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-necron-dark to-necron text-void font-display font-bold tracking-wider uppercase text-sm rounded-lg"
                whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(13, 155, 138, 0.4)' }}
                whileTap={{ scale: 0.95 }}
              >
                Añadir Espécimen
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
