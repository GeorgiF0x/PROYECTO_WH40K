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
  Andalucía: ['Almería', 'Cádiz', 'Córdoba', 'Granada', 'Huelva', 'Jaén', 'Málaga', 'Sevilla'],
  Aragón: ['Huesca', 'Teruel', 'Zaragoza'],
  Asturias: ['Asturias'],
  Baleares: ['Baleares'],
  Canarias: ['Las Palmas', 'Santa Cruz de Tenerife'],
  Cantabria: ['Cantabria'],
  'Castilla-La Mancha': ['Albacete', 'Ciudad Real', 'Cuenca', 'Guadalajara', 'Toledo'],
  'Castilla y León': [
    'Ávila',
    'Burgos',
    'León',
    'Palencia',
    'Salamanca',
    'Segovia',
    'Soria',
    'Valladolid',
    'Zamora',
  ],
  Cataluña: ['Barcelona', 'Girona', 'Lleida', 'Tarragona'],
  Ceuta: ['Ceuta'],
  'Comunidad Valenciana': ['Alicante', 'Castellón', 'Valencia'],
  Extremadura: ['Badajoz', 'Cáceres'],
  Galicia: ['A Coruña', 'Lugo', 'Ourense', 'Pontevedra'],
  'La Rioja': ['La Rioja'],
  Madrid: ['Madrid'],
  Melilla: ['Melilla'],
  Murcia: ['Murcia'],
  Navarra: ['Navarra'],
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

  const hasActiveFilters =
    currentType !== 'all' || currentCcaa || currentProvince || currentCity || currentSearch

  return (
    <div className="space-y-4">
      {/* Top bar: search + filter toggle */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/40" />
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
            className="w-full rounded-xl border border-bone/10 bg-void-light py-3 pl-11 pr-4 font-body text-sm text-bone transition-colors placeholder:text-bone/30 focus:border-imperial-gold/50 focus:outline-none"
          />
        </div>

        {/* Filter toggle */}
        <motion.button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 transition-colors ${
            showFilters || hasActiveFilters
              ? 'border-imperial-gold/50 bg-imperial-gold/20 text-imperial-gold'
              : 'border-bone/10 bg-void-light text-bone/60 hover:border-bone/30'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden font-body text-sm sm:inline">Filtros</span>
          {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-imperial-gold" />}
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
            <div className="space-y-4 rounded-xl border border-bone/10 bg-void-light p-4">
              {/* Store type */}
              <div>
                <label className="mb-2 block font-body text-xs uppercase tracking-wider text-bone/50">
                  Tipo de tienda
                </label>
                <div className="flex flex-wrap gap-2">
                  {storeTypeOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <motion.button
                        key={option.value}
                        onClick={() => updateParams('type', option.value)}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                          currentType === option.value || (option.value === 'all' && !currentType)
                            ? 'border-imperial-gold/50 bg-imperial-gold/20 text-imperial-gold'
                            : 'border-bone/10 bg-void text-bone/60 hover:border-bone/30'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span className="font-body">{option.label}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Location filters row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* CCAA filter */}
                <div>
                  <label className="mb-2 block font-body text-xs uppercase tracking-wider text-bone/50">
                    Comunidad Autónoma
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/40" />
                    <select
                      value={currentCcaa}
                      onChange={(e) => updateParams('ccaa', e.target.value)}
                      className="w-full cursor-pointer appearance-none rounded-lg border border-bone/10 bg-void py-2.5 pl-10 pr-10 font-body text-sm text-bone transition-colors focus:border-imperial-gold/50 focus:outline-none"
                    >
                      <option value="">Todas las CCAA</option>
                      {Object.keys(CCAA_PROVINCES).map((ccaa) => (
                        <option key={ccaa} value={ccaa}>
                          {ccaa}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/40" />
                  </div>
                </div>

                {/* Province filter */}
                <div>
                  <label className="mb-2 block font-body text-xs uppercase tracking-wider text-bone/50">
                    Provincia
                  </label>
                  <div className="relative">
                    <select
                      value={currentProvince}
                      onChange={(e) => updateParams('province', e.target.value)}
                      disabled={!currentCcaa}
                      className={`w-full appearance-none rounded-lg border border-bone/10 bg-void py-2.5 pl-4 pr-10 font-body text-sm transition-colors focus:border-imperial-gold/50 focus:outline-none ${
                        currentCcaa ? 'cursor-pointer text-bone' : 'cursor-not-allowed text-bone/30'
                      }`}
                    >
                      <option value="">
                        {currentCcaa ? 'Todas las provincias' : 'Selecciona CCAA'}
                      </option>
                      {availableProvinces.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/40" />
                  </div>
                </div>

                {/* City filter */}
                <div>
                  <label className="mb-2 block font-body text-xs uppercase tracking-wider text-bone/50">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    defaultValue={currentCity}
                    onChange={(e) => updateParams('city', e.target.value)}
                    placeholder="Filtrar por ciudad..."
                    className="w-full rounded-lg border border-bone/10 bg-void px-4 py-2.5 font-body text-sm text-bone transition-colors placeholder:text-bone/30 focus:border-imperial-gold/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 font-body text-sm text-bone/50 transition-colors hover:text-imperial-gold"
                >
                  <X className="h-3.5 w-3.5" />
                  Limpiar filtros
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count + loading */}
      <div className="flex items-center gap-2">
        {isPending && <Loader2 className="h-4 w-4 animate-spin text-imperial-gold" />}
        {totalCount !== undefined && (
          <span className="font-body text-sm text-bone/40">
            {totalCount} {totalCount === 1 ? 'tienda encontrada' : 'tiendas encontradas'}
          </span>
        )}
      </div>
    </div>
  )
}
