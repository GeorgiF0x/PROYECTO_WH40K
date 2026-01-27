'use client'

import { useState, useEffect, useMemo, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
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
  Heart,
  Swords,
  BookOpen,
  BookMarked,
  Paintbrush,
  Wrench,
  Mountain,
  Dice5,
  Layers,
  Shield,
  X,
  ChevronDown,
} from 'lucide-react'
import type { ListingCategory } from '@/lib/types/database.types'
import { CATEGORIES, SLUG_TO_CATEGORY, FACTION_ICONS } from '@/components/user/FactionSelector'
import { createClient } from '@/lib/supabase/client'
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

interface FactionTag {
  id: string
  name: string
  slug: string
  primary_color: string | null
}

interface MarketplaceFiltersProps {
  initialSort?: string
  initialCondition?: string
  initialType?: string
  initialCategory?: string
  initialFaction?: string
  initialLocation?: string
  initialSearch?: string
  initialFavorites?: string
}

export default function MarketplaceFilters({
  initialSort = 'recent',
  initialCondition = 'all',
  initialType = 'all',
  initialCategory = 'all',
  initialFaction = '',
  initialLocation = '',
  initialSearch = '',
  initialFavorites = '',
}: MarketplaceFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()

  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [sortBy, setSortBy] = useState<SortOption>(initialSort as SortOption)
  const [showFilters, setShowFilters] = useState(false)
  const [conditionFilter, setConditionFilter] = useState<ConditionFilter>(
    initialCondition as ConditionFilter
  )
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(initialType as TypeFilter)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(initialCategory as CategoryFilter)
  const [locationFilter, setLocationFilter] = useState(initialLocation)
  const [favoritesOnly, setFavoritesOnly] = useState(initialFavorites === 'true')

  // Faction filter state
  const [factionFilter, setFactionFilter] = useState(initialFaction)
  const [factionTags, setFactionTags] = useState<FactionTag[]>([])
  const [activeFactionCategory, setActiveFactionCategory] = useState('all')
  const [showFactionPicker, setShowFactionPicker] = useState(false)

  useEffect(() => {
    const fetchFactions = async () => {
      const { data } = await supabase
        .from('tags')
        .select('id, name, slug, primary_color')
        .eq('category', 'faction')
        .order('name')
      if (data) setFactionTags(data)
    }
    fetchFactions()
  }, [supabase])

  const filteredFactionTags = useMemo(() => {
    if (activeFactionCategory === 'all') return factionTags
    return factionTags.filter((f) => SLUG_TO_CATEGORY[f.slug] === activeFactionCategory)
  }, [factionTags, activeFactionCategory])

  const selectedFactionTag = useMemo(
    () => factionTags.find((f) => f.id === factionFilter) || null,
    [factionTags, factionFilter]
  )

  // Count active filters for badge
  const activeFilterCount = [
    categoryFilter !== 'all',
    conditionFilter !== 'all',
    typeFilter !== 'all',
    !!factionFilter,
    !!locationFilter,
  ].filter(Boolean).length

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

  const allFilters = () => ({
    sort: sortBy,
    condition: conditionFilter,
    type: typeFilter,
    category: categoryFilter,
    faction: factionFilter,
    location: locationFilter,
    q: searchQuery,
    favorites: favoritesOnly ? 'true' : '',
  })

  const handleSortChange = (value: SortOption) => {
    setSortBy(value)
    updateURL({ ...allFilters(), sort: value })
  }

  const handleConditionChange = (value: ConditionFilter) => {
    setConditionFilter(value)
    updateURL({ ...allFilters(), condition: value })
  }

  const handleTypeChange = (value: TypeFilter) => {
    setTypeFilter(value)
    updateURL({ ...allFilters(), type: value })
  }

  const handleCategoryChange = (value: CategoryFilter) => {
    setCategoryFilter(value)
    updateURL({ ...allFilters(), category: value })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateURL(allFilters())
  }

  const handleLocationChange = (value: string) => {
    setLocationFilter(value)
    updateURL({ ...allFilters(), location: value })
  }

  const handleFavoritesToggle = () => {
    const newVal = !favoritesOnly
    setFavoritesOnly(newVal)
    updateURL({ ...allFilters(), favorites: newVal ? 'true' : '' })
  }

  const handleFactionChange = (factionId: string) => {
    const newVal = factionId === factionFilter ? '' : factionId
    setFactionFilter(newVal)
    setShowFactionPicker(false)
    updateURL({ ...allFilters(), faction: newVal })
  }

  const handleClearFaction = () => {
    setFactionFilter('')
    updateURL({ ...allFilters(), faction: '' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative bg-void-light/50 backdrop-blur-xl rounded-2xl border border-bone/10 p-4 md:p-6"
    >
      {/* === Row 1: Search + Sort + Actions === */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
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
            placeholder="Buscar miniaturas, ejercitos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 transition-colors"
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
                className={`flex items-center gap-1.5 px-3 py-3 rounded-xl font-body text-sm font-medium transition-all ${
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

        {/* Favorites */}
        <motion.button
          type="button"
          onClick={handleFavoritesToggle}
          className={`flex items-center gap-1.5 px-3 py-3 rounded-xl font-body text-sm font-medium transition-all ${
            favoritesOnly
              ? 'bg-red-500/20 border border-red-500/50 text-red-400'
              : 'bg-void border border-bone/10 text-bone/60 hover:border-red-500/30 hover:text-red-400'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isPending}
        >
          <Heart className={`w-4 h-4 ${favoritesOnly ? 'fill-current' : ''}`} />
          <span className="hidden sm:inline">Favoritos</span>
        </motion.button>

        {/* Filters Toggle */}
        <motion.button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`relative flex items-center gap-1.5 px-3 py-3 rounded-xl font-body text-sm font-medium transition-all ${
            showFilters
              ? 'bg-imperial-gold/20 border border-imperial-gold/50 text-imperial-gold'
              : 'bg-void border border-bone/10 text-bone/60 hover:border-imperial-gold/30'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filtros</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center bg-imperial-gold text-void text-[10px] font-bold rounded-full">
              {activeFilterCount}
            </span>
          )}
        </motion.button>

        {/* Publish */}
        <Link href="/mercado/nuevo">
          <motion.span
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-imperial-gold to-yellow-500 text-void font-display font-bold text-sm rounded-xl cursor-pointer"
            whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(201, 162, 39, 0.3)' }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" />
            <span>Publicar</span>
          </motion.span>
        </Link>
      </form>

      {/* === Active filter chips === */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-bone/5">
          <span className="text-xs text-bone/40 font-body mr-1">Filtros:</span>

          {categoryFilter !== 'all' && (() => {
            const cat = categoryOptions.find((c) => c.value === categoryFilter)
            const CatIcon = cat?.icon || Layers
            return (
              <FilterChip
                label={cat?.label || categoryFilter}
                icon={<CatIcon className="w-3 h-3" />}
                onClear={() => handleCategoryChange('all')}
              />
            )
          })()}

          {conditionFilter !== 'all' && (
            <FilterChip
              label={conditionOptions.find((c) => c.value === conditionFilter)?.label || conditionFilter}
              onClear={() => handleConditionChange('all')}
            />
          )}

          {typeFilter !== 'all' && (
            <FilterChip
              label={typeOptions.find((t) => t.value === typeFilter)?.label || typeFilter}
              onClear={() => handleTypeChange('all')}
            />
          )}

          {selectedFactionTag && (
            <FilterChip
              label={selectedFactionTag.name}
              color={selectedFactionTag.primary_color || undefined}
              icon={
                FACTION_ICONS[selectedFactionTag.slug] ? (
                  <Image
                    src={FACTION_ICONS[selectedFactionTag.slug]}
                    alt=""
                    width={12}
                    height={12}
                    className="invert opacity-70"
                  />
                ) : undefined
              }
              onClear={handleClearFaction}
            />
          )}

          {locationFilter && (
            <FilterChip
              label={locationFilter}
              icon={<MapPin className="w-3 h-3" />}
              onClear={() => handleLocationChange('')}
            />
          )}
        </div>
      )}

      {/* === Expanded Filters Panel === */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-bone/10 space-y-5">

              {/* --- Row: Category pills (horizontal scroll) --- */}
              <div>
                <label className="flex items-center gap-1.5 text-xs text-bone/50 mb-2.5 font-body uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5" />
                  Categoria
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {categoryOptions.map((option) => {
                    const CatIcon = option.icon
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleCategoryChange(option.value)}
                        disabled={isPending}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body whitespace-nowrap transition-colors ${
                          categoryFilter === option.value
                            ? 'bg-imperial-gold text-void font-semibold'
                            : 'bg-void border border-bone/10 text-bone/60 hover:border-bone/30'
                        }`}
                      >
                        <CatIcon className="w-3.5 h-3.5" />
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* --- Row: Condition + Type + Location (compact grid) --- */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Condition */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-bone/50 mb-2 font-body uppercase tracking-wider">
                    <Package className="w-3.5 h-3.5" />
                    Estado
                  </label>
                  <select
                    value={conditionFilter}
                    onChange={(e) => handleConditionChange(e.target.value as ConditionFilter)}
                    disabled={isPending}
                    className="w-full px-3 py-2 bg-void border border-bone/10 rounded-lg font-body text-sm text-bone focus:outline-none focus:border-imperial-gold/50 transition-colors appearance-none cursor-pointer"
                  >
                    {conditionOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-bone/50 mb-2 font-body uppercase tracking-wider">
                    <Store className="w-3.5 h-3.5" />
                    Tipo
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => handleTypeChange(e.target.value as TypeFilter)}
                    disabled={isPending}
                    className="w-full px-3 py-2 bg-void border border-bone/10 rounded-lg font-body text-sm text-bone focus:outline-none focus:border-imperial-gold/50 transition-colors appearance-none cursor-pointer"
                  >
                    {typeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-bone/50 mb-2 font-body uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5" />
                    Ubicacion
                  </label>
                  <input
                    type="text"
                    placeholder="Ciudad o provincia..."
                    value={locationFilter}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    className="w-full px-3 py-2 bg-void border border-bone/10 rounded-lg font-body text-sm text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 transition-colors"
                  />
                </div>
              </div>

              {/* --- Faction: collapsible section --- */}
              <div className="rounded-xl border border-bone/10 overflow-hidden">
                {/* Faction header / toggle */}
                <button
                  type="button"
                  onClick={() => setShowFactionPicker(!showFactionPicker)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-void/50 hover:bg-void/80 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-bone/50" />
                    <span className="text-xs text-bone/50 font-body uppercase tracking-wider">Faccion</span>

                    {/* Selected faction inline preview */}
                    {selectedFactionTag && (
                      <span
                        className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded text-xs font-body border"
                        style={{
                          color: selectedFactionTag.primary_color || '#C9A227',
                          borderColor: `${selectedFactionTag.primary_color || '#C9A227'}40`,
                          backgroundColor: `${selectedFactionTag.primary_color || '#C9A227'}10`,
                        }}
                      >
                        {FACTION_ICONS[selectedFactionTag.slug] && (
                          <Image
                            src={FACTION_ICONS[selectedFactionTag.slug]}
                            alt=""
                            width={12}
                            height={12}
                            className="invert opacity-70"
                          />
                        )}
                        {selectedFactionTag.name}
                        <span
                          onClick={(e) => { e.stopPropagation(); handleClearFaction() }}
                          className="ml-0.5 hover:opacity-70 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </span>
                      </span>
                    )}
                  </div>
                  <motion.div
                    animate={{ rotate: showFactionPicker ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-bone/40" />
                  </motion.div>
                </button>

                {/* Faction picker body */}
                <AnimatePresence>
                  {showFactionPicker && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-2 space-y-3 border-t border-bone/5">
                        {/* Category tabs */}
                        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                          {CATEGORIES.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setActiveFactionCategory(cat.id)}
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-body whitespace-nowrap transition-all ${
                                activeFactionCategory === cat.id
                                  ? 'bg-imperial-gold/20 border border-imperial-gold/40 text-imperial-gold'
                                  : 'bg-void border border-bone/10 text-bone/50 hover:border-bone/20 hover:text-bone/70'
                              }`}
                            >
                              {cat.icon && (
                                <div className="w-3.5 h-3.5 relative">
                                  <Image
                                    src={cat.icon}
                                    alt={cat.label}
                                    fill
                                    className={activeFactionCategory === cat.id ? 'opacity-80' : 'opacity-50 invert'}
                                  />
                                </div>
                              )}
                              {cat.label}
                            </button>
                          ))}
                        </div>

                        {/* Faction grid */}
                        <div className="max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-bone/20 pr-1">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                            {filteredFactionTags.map((faction) => {
                              const isSelected = faction.id === factionFilter
                              const iconPath = FACTION_ICONS[faction.slug]
                              return (
                                <button
                                  key={faction.id}
                                  type="button"
                                  onClick={() => handleFactionChange(faction.id)}
                                  disabled={isPending}
                                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-body transition-colors text-left ${
                                    isSelected
                                      ? 'bg-imperial-gold/20 border border-imperial-gold/40 text-imperial-gold font-semibold'
                                      : 'bg-void/50 border border-bone/5 text-bone/60 hover:border-bone/20 hover:text-bone/80'
                                  }`}
                                >
                                  {iconPath ? (
                                    <Image
                                      src={iconPath}
                                      alt=""
                                      width={14}
                                      height={14}
                                      className={isSelected ? 'opacity-80' : 'invert opacity-50'}
                                    />
                                  ) : (
                                    <div
                                      className="w-3.5 h-3.5 rounded-full shrink-0"
                                      style={{ backgroundColor: faction.primary_color || '#666' }}
                                    />
                                  )}
                                  <span className="truncate">{faction.name}</span>
                                </button>
                              )
                            })}
                          </div>

                          {filteredFactionTags.length === 0 && (
                            <p className="text-center text-bone/40 text-xs py-6 font-body">
                              No hay facciones en esta categoria
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading overlay */}
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

/* ── Reusable filter chip ── */
function FilterChip({
  label,
  icon,
  color,
  onClear,
}: {
  label: string
  icon?: React.ReactNode
  color?: string
  onClear: () => void
}) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-body border transition-colors"
      style={
        color
          ? {
              color,
              borderColor: `${color}40`,
              backgroundColor: `${color}10`,
            }
          : undefined
      }
    >
      {icon}
      <span className={color ? '' : 'text-bone/70'}>{label}</span>
      <button
        type="button"
        onClick={onClear}
        className="ml-0.5 hover:opacity-60 transition-opacity"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}
