'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ListingGrid, type ListingWithSeller } from '@/components/marketplace'
import { createClient } from '@/lib/supabase/client'
import {
  Search,
  SlidersHorizontal,
  Plus,
  Clock,
  TrendingUp,
  DollarSign,
  Package,
  MapPin,
  Store,
} from 'lucide-react'
import Link from 'next/link'

type SortOption = 'recent' | 'price_low' | 'price_high'
type ConditionFilter = 'all' | 'nib' | 'nos' | 'assembled' | 'painted' | 'pro_painted'
type TypeFilter = 'all' | 'sale' | 'trade' | 'both'

const sortOptions = [
  { value: 'recent', label: 'Recientes', icon: Clock },
  { value: 'price_low', label: 'Precio: Menor', icon: DollarSign },
  { value: 'price_high', label: 'Precio: Mayor', icon: TrendingUp },
] as const

const conditionOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'nib', label: 'Nuevo en caja' },
  { value: 'nos', label: 'Nuevo sin caja' },
  { value: 'assembled', label: 'Montado' },
  { value: 'painted', label: 'Pintado' },
  { value: 'pro_painted', label: 'Pro Painted' },
] as const

const typeOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'sale', label: 'Venta' },
  { value: 'trade', label: 'Intercambio' },
  { value: 'both', label: 'Ambos' },
] as const

export default function MarketplacePage() {
  const [listings, setListings] = useState<ListingWithSeller[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [showFilters, setShowFilters] = useState(false)
  const [conditionFilter, setConditionFilter] = useState<ConditionFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [locationFilter, setLocationFilter] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchListings()
  }, [sortBy, conditionFilter, typeFilter])

  const fetchListings = async () => {
    setIsLoading(true)

    let query = supabase
      .from('listings')
      .select(`
        *,
        profiles:seller_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('status', 'active')

    // Apply filters
    if (conditionFilter !== 'all') {
      query = query.eq('condition', conditionFilter)
    }
    if (typeFilter !== 'all') {
      query = query.eq('listing_type', typeFilter)
    }

    // Sort
    switch (sortBy) {
      case 'recent':
        query = query.order('created_at', { ascending: false })
        break
      case 'price_low':
        query = query.order('price', { ascending: true })
        break
      case 'price_high':
        query = query.order('price', { ascending: false })
        break
    }

    query = query.limit(24)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching listings:', error)
    } else {
      setListings(data || [])
    }

    setIsLoading(false)
  }

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLocation =
      !locationFilter ||
      listing.location?.toLowerCase().includes(locationFilter.toLowerCase())
    return matchesSearch && matchesLocation
  })

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
              <Store className="w-4 h-4 text-imperial-gold" />
              <span className="text-sm font-body text-imperial-gold">
                Compra, Vende e Intercambia
              </span>
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-wide mb-4">
              <span className="text-bone">Mercado </span>
              <span className="text-gradient">P2P</span>
            </h1>

            <p className="text-lg text-bone/60 font-body max-w-2xl mx-auto">
              Encuentra miniaturas de segunda mano, intercambia con otros coleccionistas
              o vende las que ya no uses.
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
                  animate={{
                    color: searchQuery ? '#C9A227' : 'rgba(232, 232, 240, 0.4)',
                  }}
                >
                  <Search className="w-5 h-5" />
                </motion.div>
                <input
                  type="text"
                  placeholder="Buscar miniaturas, ejércitos..."
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
                  showFilters
                    ? 'bg-imperial-gold/20 border border-imperial-gold/50 text-imperial-gold'
                    : 'bg-void border border-bone/10 text-bone/60 hover:border-imperial-gold/30'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filtros</span>
              </motion.button>

              {/* Create Listing Button */}
              <Link href="/mercado/nuevo">
                <motion.button
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-imperial-gold to-yellow-500 text-void font-display font-bold text-sm rounded-xl"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: '0 8px 30px rgba(201, 162, 39, 0.3)',
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Publicar</span>
                </motion.button>
              </Link>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Condition Filter */}
                      <div>
                        <label className="block text-sm text-bone/60 mb-2 font-body">
                          <Package className="w-4 h-4 inline mr-2" />
                          Estado
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {conditionOptions.map((option) => (
                            <motion.button
                              key={option.value}
                              onClick={() =>
                                setConditionFilter(option.value as ConditionFilter)
                              }
                              className={`px-3 py-1.5 rounded-lg text-sm font-body transition-colors ${
                                conditionFilter === option.value
                                  ? 'bg-imperial-gold text-void'
                                  : 'bg-void border border-bone/10 text-bone/60 hover:border-imperial-gold/30'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {option.label}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Type Filter */}
                      <div>
                        <label className="block text-sm text-bone/60 mb-2 font-body">
                          <Store className="w-4 h-4 inline mr-2" />
                          Tipo
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {typeOptions.map((option) => (
                            <motion.button
                              key={option.value}
                              onClick={() => setTypeFilter(option.value as TypeFilter)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-body transition-colors ${
                                typeFilter === option.value
                                  ? 'bg-imperial-gold text-void'
                                  : 'bg-void border border-bone/10 text-bone/60 hover:border-imperial-gold/30'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {option.label}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Location Filter */}
                      <div>
                        <label className="block text-sm text-bone/60 mb-2 font-body">
                          <MapPin className="w-4 h-4 inline mr-2" />
                          Ubicación
                        </label>
                        <input
                          type="text"
                          placeholder="Ciudad o provincia..."
                          value={locationFilter}
                          onChange={(e) => setLocationFilter(e.target.value)}
                          className="w-full px-4 py-2 bg-void border border-bone/10 rounded-lg font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="px-6">
        <div className="max-w-7xl mx-auto">
          {/* Results count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between mb-8"
          >
            <p className="text-bone/50 font-body">
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <motion.div
                    className="w-4 h-4 border-2 border-bone/20 border-t-imperial-gold rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Cargando...
                </span>
              ) : (
                <span>
                  <span className="text-imperial-gold font-semibold">
                    {filteredListings.length}
                  </span>{' '}
                  anuncios encontrados
                </span>
              )}
            </p>
          </motion.div>

          {/* Grid */}
          <ListingGrid
            listings={filteredListings}
            isLoading={isLoading}
            emptyMessage={
              searchQuery
                ? `No se encontraron anuncios para "${searchQuery}"`
                : 'Aún no hay anuncios publicados. ¡Sé el primero en vender algo!'
            }
          />

          {/* Load More Button */}
          {!isLoading && filteredListings.length > 0 && (
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
                <Package className="w-8 h-8 text-imperial-gold" />
              </motion.div>

              <h2 className="text-2xl md:text-3xl font-display font-bold text-bone mb-4">
                ¿Tienes miniaturas que ya no usas?
              </h2>
              <p className="text-bone/60 font-body mb-8 max-w-xl mx-auto">
                Dales una segunda vida vendiéndolas o intercambiándolas con otros
                coleccionistas de la comunidad.
              </p>

              <Link href="/mercado/nuevo">
                <motion.span
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-imperial-gold to-yellow-500 text-void font-display font-bold tracking-wider uppercase text-sm rounded-lg cursor-pointer"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 10px 40px rgba(201, 162, 39, 0.4)',
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-5 h-5" />
                  Publicar Anuncio
                </motion.span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
