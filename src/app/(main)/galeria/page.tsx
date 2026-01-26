'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { MiniatureGrid, type MiniatureWithStats } from '@/components/gallery'
import { createClient } from '@/lib/supabase/client'
import { FACTION_ICONS, CATEGORIES, SLUG_TO_CATEGORY } from '@/components/user'
import type { Faction } from '@/components/user'
import { Search, SlidersHorizontal, Grid3X3, LayoutGrid, Sparkles, TrendingUp, Clock, Flame } from 'lucide-react'

type SortOption = 'recent' | 'popular' | 'trending'
type ViewMode = 'grid' | 'masonry'

const sortOptions = [
  { value: 'recent', label: 'Recientes', icon: Clock },
  { value: 'popular', label: 'Populares', icon: TrendingUp },
  { value: 'trending', label: 'Tendencia', icon: Flame },
] as const

// Filter categories (skip 'all' since we handle it separately)
const FILTER_CATEGORIES = CATEGORIES.filter((c) => c.id !== 'all')

export default function GalleryPage() {
  const [miniatures, setMiniatures] = useState<MiniatureWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Faction data from DB
  const [factions, setFactions] = useState<Faction[]>([])
  const [factionsLoading, setFactionsLoading] = useState(true)

  const supabase = createClient()

  // Fetch factions from DB
  useEffect(() => {
    const fetchFactions = async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('id, name, slug, primary_color, secondary_color')
        .eq('category', 'faction')
        .order('name')

      if (!error && data) {
        setFactions(data)
      }
      setFactionsLoading(false)
    }
    fetchFactions()
  }, [])

  // Factions filtered by selected category
  const factionsInCategory = useMemo(() => {
    if (!selectedCategory) return []
    return factions.filter((f) => SLUG_TO_CATEGORY[f.slug] === selectedCategory)
  }, [factions, selectedCategory])

  useEffect(() => {
    fetchMiniatures()
  }, [sortBy, selectedFaction])

  const fetchMiniatures = async () => {
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

    if (selectedFaction) {
      query = query.eq('faction_id', selectedFaction)
    }

    // Sort based on selection
    switch (sortBy) {
      case 'recent':
        query = query.order('created_at', { ascending: false })
        break
      case 'popular':
        query = query.order('created_at', { ascending: false })
        break
      case 'trending':
        query = query.order('created_at', { ascending: false })
        break
    }

    query = query.limit(24)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching miniatures:', error)
    } else {
      setMiniatures(data || [])
    }

    setIsLoading(false)
  }

  const filteredMiniatures = miniatures.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // When selecting a category, clear the specific faction filter
  const handleCategorySelect = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null)
      setSelectedFaction(null)
    } else {
      setSelectedCategory(categoryId)
      setSelectedFaction(null)
    }
  }

  // When selecting a specific faction
  const handleFactionSelect = (factionId: string) => {
    setSelectedFaction(selectedFaction === factionId ? null : factionId)
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero Section */}
      <section className="relative px-6 py-16 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(139,0,0,0.1)_0%,transparent_50%)]" />

        {/* Animated grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(201, 162, 39, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(201, 162, 39, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-imperial-gold/10 border border-imperial-gold/30 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-imperial-gold" />
              <span className="text-sm font-body text-imperial-gold">Comunidad de Artistas</span>
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-wide mb-4">
              <span className="text-bone">Galería de </span>
              <span className="text-gradient">Miniaturas</span>
            </h1>

            <p className="text-lg text-bone/60 font-body max-w-2xl mx-auto">
              Explora las obras maestras de nuestra comunidad. Cada miniatura cuenta una historia de dedicación y arte.
            </p>
          </motion.div>

          {/* Search and Filters Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-void-light/50 backdrop-blur-xl rounded-2xl border border-bone/10 p-4 md:p-6"
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <motion.div
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-bone/40"
                  animate={{ color: searchQuery ? '#C9A227' : 'rgba(232, 232, 240, 0.4)' }}
                >
                  <Search className="w-5 h-5" />
                </motion.div>
                <input
                  type="text"
                  placeholder="Buscar miniaturas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-void border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 transition-colors"
                />
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-2">
                {sortOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <motion.button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl font-body text-sm font-medium transition-all duration-300 ${
                        sortBy === option.value
                          ? 'bg-imperial-gold text-void'
                          : 'bg-void border border-bone/10 text-bone/60 hover:border-imperial-gold/30 hover:text-bone'
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
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-body text-sm font-medium transition-all duration-300 ${
                  showFilters || selectedFaction
                    ? 'bg-imperial-gold/20 border border-imperial-gold/50 text-imperial-gold'
                    : 'bg-void border border-bone/10 text-bone/60 hover:border-imperial-gold/30'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filtros</span>
                {selectedFaction && (
                  <span className="w-2 h-2 rounded-full bg-imperial-gold" />
                )}
              </motion.button>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-void rounded-xl border border-bone/10 p-1">
                <motion.button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-imperial-gold text-void' : 'text-bone/60 hover:text-bone'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Grid3X3 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  onClick={() => setViewMode('masonry')}
                  className={`p-2.5 rounded-lg transition-colors ${
                    viewMode === 'masonry' ? 'bg-imperial-gold text-void' : 'text-bone/60 hover:text-bone'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LayoutGrid className="w-4 h-4" />
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
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t border-bone/10">
                    {/* Category filter tabs */}
                    <div className="mb-3">
                      <label className="block text-sm text-bone/60 mb-2 font-body">
                        Facción
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {FILTER_CATEGORIES.map((cat) => (
                          <motion.button
                            key={cat.id}
                            onClick={() => handleCategorySelect(cat.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-body transition-colors ${
                              selectedCategory === cat.id
                                ? 'bg-imperial-gold text-void'
                                : 'bg-void border border-bone/10 text-bone/60 hover:border-imperial-gold/30'
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

                        {/* Clear filter */}
                        {(selectedCategory || selectedFaction) && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => {
                              setSelectedCategory(null)
                              setSelectedFaction(null)
                            }}
                            className="px-3 py-1.5 rounded-lg text-sm font-body text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Limpiar
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Specific factions within selected category */}
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
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body transition-colors ${
                                    isSelected
                                      ? 'border-imperial-gold text-imperial-gold'
                                      : 'border-bone/10 text-bone/60 hover:border-bone/30 hover:text-bone'
                                  } border`}
                                  style={isSelected ? {
                                    background: `linear-gradient(135deg, ${faction.primary_color}20, transparent)`,
                                  } : {}}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  {iconPath && (
                                    <div
                                      className="w-4 h-4 rounded flex items-center justify-center"
                                      style={{ background: faction.primary_color || '#666' }}
                                    >
                                      <Image
                                        src={iconPath}
                                        alt={faction.name}
                                        width={12}
                                        height={12}
                                        className="invert"
                                      />
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
      <section className="px-6">
        <div className="max-w-7xl mx-auto">
          {/* Results count */}
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
                    className="inline-block w-4 h-4 border-2 border-bone/20 border-t-imperial-gold rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Cargando...
                </span>
              ) : (
                <span>
                  <span className="text-imperial-gold font-semibold">{filteredMiniatures.length}</span> miniaturas encontradas
                </span>
              )}
            </div>
          </motion.div>

          {/* Grid */}
          <MiniatureGrid
            miniatures={filteredMiniatures}
            isLoading={isLoading}
            emptyMessage={
              searchQuery
                ? `No se encontraron miniaturas para "${searchQuery}"`
                : 'Aún no hay miniaturas en la galería. ¡Sé el primero en subir la tuya!'
            }
          />

          {/* Load More Button */}
          {!isLoading && filteredMiniatures.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center mt-12"
            >
              <motion.button
                className="relative px-8 py-4 bg-transparent border border-imperial-gold/50 text-imperial-gold font-display font-semibold tracking-wider uppercase text-sm rounded-lg overflow-hidden group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-imperial-gold/10"
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
      <section className="px-6 mt-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-imperial-gold/20 via-void-light to-blood/20" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />

            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-imperial-gold/40" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-imperial-gold/40" />

            <div className="relative z-10 p-8 md:p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-imperial-gold/20 border border-imperial-gold/40 mb-6"
              >
                <Sparkles className="w-8 h-8 text-imperial-gold" />
              </motion.div>

              <h2 className="text-2xl md:text-3xl font-display font-bold text-bone mb-4">
                ¿Tienes miniaturas que mostrar?
              </h2>
              <p className="text-bone/60 font-body mb-8 max-w-xl mx-auto">
                Únete a nuestra comunidad y comparte tus obras con miles de entusiastas del hobby.
              </p>

              <motion.a
                href="/mi-galeria/subir"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-imperial-gold to-yellow-500 text-void font-display font-bold tracking-wider uppercase text-sm rounded-lg"
                whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(201, 162, 39, 0.4)' }}
                whileTap={{ scale: 0.95 }}
              >
                Subir Miniatura
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
