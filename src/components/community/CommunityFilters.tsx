'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  SlidersHorizontal,
  X,
  Shield,
  BookOpen,
  Palette,
  Globe,
  MapPin,
  Loader2,
  ChevronDown,
} from 'lucide-react'
import type { StoreType } from '@/lib/types/database.types'

const storeTypeOptions: { value: StoreType | 'all'; label: string; icon: typeof Shield }[] = [
  { value: 'all', label: 'Todas', icon: Globe },
  { value: 'specialist', label: 'Especialista GW', icon: Shield },
  { value: 'comics_games', label: 'Comics y juegos', icon: BookOpen },
  { value: 'general_hobby', label: 'Hobby general', icon: Palette },
  { value: 'online_only', label: 'Solo online', icon: Globe },
]

// Comunidades Autónomas con sus provincias
const CCAA_PROVINCES: Record<string, string[]> = {
  'Andalucía': ['Almería', 'Cádiz', 'Córdoba', 'Granada', 'Huelva', 'Jaén', 'Málaga', 'Sevilla'],
  'Aragón': ['Huesca', 'Teruel', 'Zaragoza'],
  'Asturias': ['Asturias'],
  'Baleares': ['Baleares'],
  'Canarias': ['Las Palmas', 'Santa Cruz de Tenerife'],
  'Cantabria': ['Cantabria'],
  'Castilla-La Mancha': ['Albacete', 'Ciudad Real', 'Cuenca', 'Guadalajara', 'Toledo'],
  'Castilla y León': ['Ávila', 'Burgos', 'León', 'Palencia', 'Salamanca', 'Segovia', 'Soria', 'Valladolid', 'Zamora'],
  'Cataluña': ['Barcelona', 'Girona', 'Lleida', 'Tarragona'],
  'Ceuta': ['Ceuta'],
  'Comunidad Valenciana': ['Alicante', 'Castellón', 'Valencia'],
  'Extremadura': ['Badajoz', 'Cáceres'],
  'Galicia': ['A Coruña', 'Lugo', 'Ourense', 'Pontevedra'],
  'La Rioja': ['La Rioja'],
  'Madrid': ['Madrid'],
  'Melilla': ['Melilla'],
  'Murcia': ['Murcia'],
  'Navarra': ['Navarra'],
  'País Vasco': ['Álava', 'Gipuzkoa', 'Vizcaya'],
}

interface CommunityFiltersProps {
  totalCount?: number
}

export default function CommunityFilters({ totalCount }: CommunityFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [showFilters, setShowFilters] = useState(false)

  const currentType = (searchParams.get('type') || 'all') as StoreType | 'all'
  const currentCcaa = searchParams.get('ccaa') || ''
  const currentProvince = searchParams.get('province') || ''
  const currentCity = searchParams.get('city') || ''
  const currentSearch = searchParams.get('q') || ''

  // Get provinces for selected CCAA
  const availableProvinces = useMemo(() => {
    if (!currentCcaa) return []
    return CCAA_PROVINCES[currentCcaa] || []
  }, [currentCcaa])

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // If changing CCAA, reset province
    if (key === 'ccaa') {
      params.delete('province')
    }
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false })
    })
  }

  const clearFilters = () => {
    startTransition(() => {
      router.push('?', { scroll: false })
    })
  }

  const hasActiveFilters = currentType !== 'all' || currentCcaa || currentProvince || currentCity || currentSearch

  return (
    <div className="space-y-4">
      {/* Top bar: search + filter toggle */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-bone/40" />
          <input
            type="text"
            defaultValue={currentSearch}
            onChange={(e) => {
              const val = e.target.value
              if (val.length === 0 || val.length >= 2) {
                updateParams('q', val)
              }
            }}
            placeholder="Buscar tiendas..."
            className="w-full pl-11 pr-4 py-3 bg-void-light border border-bone/10 rounded-xl font-body text-bone text-sm placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 transition-colors"
          />
        </div>

        {/* Filter toggle */}
        <motion.button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-imperial-gold/20 border-imperial-gold/50 text-imperial-gold'
              : 'bg-void-light border-bone/10 text-bone/60 hover:border-bone/30'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-sm font-body hidden sm:inline">Filtros</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-imperial-gold" />
          )}
        </motion.button>
      </div>

      {/* Expanded filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-void-light rounded-xl border border-bone/10 space-y-4">
              {/* Store type */}
              <div>
                <label className="block text-xs text-bone/50 font-body mb-2 uppercase tracking-wider">
                  Tipo de tienda
                </label>
                <div className="flex flex-wrap gap-2">
                  {storeTypeOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <motion.button
                        key={option.value}
                        onClick={() => updateParams('type', option.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                          currentType === option.value || (option.value === 'all' && !currentType)
                            ? 'bg-imperial-gold/20 border-imperial-gold/50 text-imperial-gold'
                            : 'bg-void border-bone/10 text-bone/60 hover:border-bone/30'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="font-body">{option.label}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Location filters row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* CCAA filter */}
                <div>
                  <label className="block text-xs text-bone/50 font-body mb-2 uppercase tracking-wider">
                    Comunidad Autónoma
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bone/40" />
                    <select
                      value={currentCcaa}
                      onChange={(e) => updateParams('ccaa', e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-void border border-bone/10 rounded-lg font-body text-bone text-sm focus:outline-none focus:border-imperial-gold/50 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Todas las CCAA</option>
                      {Object.keys(CCAA_PROVINCES).map((ccaa) => (
                        <option key={ccaa} value={ccaa}>{ccaa}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bone/40 pointer-events-none" />
                  </div>
                </div>

                {/* Province filter */}
                <div>
                  <label className="block text-xs text-bone/50 font-body mb-2 uppercase tracking-wider">
                    Provincia
                  </label>
                  <div className="relative">
                    <select
                      value={currentProvince}
                      onChange={(e) => updateParams('province', e.target.value)}
                      disabled={!currentCcaa}
                      className={`w-full pl-4 pr-10 py-2.5 bg-void border border-bone/10 rounded-lg font-body text-sm focus:outline-none focus:border-imperial-gold/50 transition-colors appearance-none ${
                        currentCcaa ? 'text-bone cursor-pointer' : 'text-bone/30 cursor-not-allowed'
                      }`}
                    >
                      <option value="">{currentCcaa ? 'Todas las provincias' : 'Selecciona CCAA'}</option>
                      {availableProvinces.map((province) => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bone/40 pointer-events-none" />
                  </div>
                </div>

                {/* City filter */}
                <div>
                  <label className="block text-xs text-bone/50 font-body mb-2 uppercase tracking-wider">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    defaultValue={currentCity}
                    onChange={(e) => updateParams('city', e.target.value)}
                    placeholder="Filtrar por ciudad..."
                    className="w-full px-4 py-2.5 bg-void border border-bone/10 rounded-lg font-body text-bone text-sm placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 transition-colors"
                  />
                </div>
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-sm text-bone/50 hover:text-imperial-gold transition-colors font-body"
                >
                  <X className="w-3.5 h-3.5" />
                  Limpiar filtros
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count + loading */}
      <div className="flex items-center gap-2">
        {isPending && <Loader2 className="w-4 h-4 text-imperial-gold animate-spin" />}
        {totalCount !== undefined && (
          <span className="text-sm text-bone/40 font-body">
            {totalCount} {totalCount === 1 ? 'tienda encontrada' : 'tiendas encontradas'}
          </span>
        )}
      </div>
    </div>
  )
}
