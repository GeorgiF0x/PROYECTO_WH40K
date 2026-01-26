'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  Swords,
  BookOpen,
  BookMarked,
  Paintbrush,
  Wrench,
  Mountain,
  Dice5,
  Layers,
} from 'lucide-react'
import type { ListingCategory } from '@/lib/types/database.types'
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

type CategoryFilter = 'all' | ListingCategory

const categoryOptions: { value: CategoryFilter; label: string; icon: typeof Layers }[] = [
  { value: 'all', label: 'Todos', icon: Layers },
  { value: 'miniatures', label: 'Miniaturas', icon: Swords },
  { value: 'novels', label: 'Novelas', icon: BookOpen },
  { value: 'codex', label: 'Codex', icon: BookMarked },
  { value: 'paints', label: 'Pinturas', icon: Paintbrush },
  { value: 'tools', label: 'Herramientas', icon: Wrench },
  { value: 'terrain', label: 'Terreno', icon: Mountain },
  { value: 'accessories', label: 'Accesorios', icon: Dice5 },
  { value: 'other', label: 'Otros', icon: Package },
]

interface MarketplaceFiltersProps {
  initialSort?: string
  initialCondition?: string
  initialType?: string
  initialCategory?: string
  initialLocation?: string
  initialSearch?: string
}

export default function MarketplaceFilters({
  initialSort = 'recent',
  initialCondition = 'all',
  initialType = 'all',
  initialCategory = 'all',
  initialLocation = '',
  initialSearch = '',
}: MarketplaceFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [sortBy, setSortBy] = useState<SortOption>(initialSort as SortOption)
  const [showFilters, setShowFilters] = useState(false)
  const [conditionFilter, setConditionFilter] = useState<ConditionFilter>(
    initialCondition as ConditionFilter
  )
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(initialType as TypeFilter)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(initialCategory as CategoryFilter)
  const [locationFilter, setLocationFilter] = useState(initialLocation)

  const updateURL = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== 'recent') {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })
    startTransition(() => {
      router.push(`/mercado?${newParams.toString()}`, { scroll: false })
    })
  }

  const handleSortChange = (value: SortOption) => {
    setSortBy(value)
    updateURL({ sort: value, condition: conditionFilter, type: typeFilter, category: categoryFilter, location: locationFilter, q: searchQuery })
  }

  const handleConditionChange = (value: ConditionFilter) => {
    setConditionFilter(value)
    updateURL({ sort: sortBy, condition: value, type: typeFilter, category: categoryFilter, location: locationFilter, q: searchQuery })
  }

  const handleTypeChange = (value: TypeFilter) => {
    setTypeFilter(value)
    updateURL({ sort: sortBy, condition: conditionFilter, type: value, category: categoryFilter, location: locationFilter, q: searchQuery })
  }

  const handleCategoryChange = (value: CategoryFilter) => {
    setCategoryFilter(value)
    updateURL({ sort: sortBy, condition: conditionFilter, type: typeFilter, category: value, location: locationFilter, q: searchQuery })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateURL({ sort: sortBy, condition: conditionFilter, type: typeFilter, category: categoryFilter, location: locationFilter, q: searchQuery })
  }

  const handleLocationChange = (value: string) => {
    setLocationFilter(value)
    updateURL({ sort: sortBy, condition: conditionFilter, type: typeFilter, category: categoryFilter, location: value, q: searchQuery })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-void-light/50 backdrop-blur-xl rounded-2xl border border-bone/10 p-4 md:p-6"
    >
      <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
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
                type="button"
                onClick={() => handleSortChange(option.value)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-body text-sm font-medium transition-all duration-300 ${
                  sortBy === option.value
                    ? 'bg-imperial-gold text-void'
                    : 'bg-void border border-bone/10 text-bone/60 hover:border-imperial-gold/30 hover:text-bone'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isPending}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{option.label}</span>
              </motion.button>
            )
          })}
        </div>

        {/* Filter Toggle */}
        <motion.button
          type="button"
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
          <motion.span
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-imperial-gold to-yellow-500 text-void font-display font-bold text-sm rounded-xl cursor-pointer"
            whileHover={{
              scale: 1.02,
              boxShadow: '0 8px 30px rgba(201, 162, 39, 0.3)',
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" />
            <span>Publicar</span>
          </motion.span>
        </Link>
      </form>

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
            <div className="pt-4 mt-4 border-t border-bone/10 space-y-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm text-bone/60 mb-2 font-body">
                  <Layers className="w-4 h-4 inline mr-2" />
                  Categoria
                </label>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((option) => {
                    const CatIcon = option.icon
                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => handleCategoryChange(option.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-body transition-colors ${
                          categoryFilter === option.value
                            ? 'bg-imperial-gold text-void'
                            : 'bg-void border border-bone/10 text-bone/60 hover:border-imperial-gold/30'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isPending}
                      >
                        <CatIcon className="w-3.5 h-3.5" />
                        {option.label}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

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
                        type="button"
                        onClick={() => handleConditionChange(option.value as ConditionFilter)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-body transition-colors ${
                          conditionFilter === option.value
                            ? 'bg-imperial-gold text-void'
                            : 'bg-void border border-bone/10 text-bone/60 hover:border-imperial-gold/30'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isPending}
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
                        type="button"
                        onClick={() => handleTypeChange(option.value as TypeFilter)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-body transition-colors ${
                          typeFilter === option.value
                            ? 'bg-imperial-gold text-void'
                            : 'bg-void border border-bone/10 text-bone/60 hover:border-imperial-gold/30'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isPending}
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
                    onChange={(e) => handleLocationChange(e.target.value)}
                    className="w-full px-4 py-2 bg-void border border-bone/10 rounded-lg font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 transition-colors"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading indicator */}
      {isPending && (
        <div className="absolute inset-0 bg-void/50 rounded-2xl flex items-center justify-center">
          <motion.div
            className="w-6 h-6 border-2 border-bone/20 border-t-imperial-gold rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      )}
    </motion.div>
  )
}
