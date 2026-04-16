'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Search, X, Shield } from 'lucide-react'
import { CATEGORIES, SLUG_TO_CATEGORY, FACTION_ICONS } from '@/components/user/FactionSelector'

interface Faction {
  id: string
  name: string
  slug: string
  primary_color: string | null
  secondary_color: string | null
}

interface ListingFactionPickerProps {
  selectedFactionId: string | null
  onChange: (factionId: string | null) => void
}

export default function ListingFactionPicker({
  selectedFactionId,
  onChange,
}: ListingFactionPickerProps) {
  const [factions, setFactions] = useState<Faction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const supabase = createClient()

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
      setIsLoading(false)
    }
    fetchFactions()
  }, [supabase])

  const selectedFaction = useMemo(
    () => factions.find((f) => f.id === selectedFactionId) || null,
    [factions, selectedFactionId]
  )

  const filteredFactions = useMemo(() => {
    let filtered = factions

    if (activeCategory !== 'all') {
      filtered = filtered.filter((f) => SLUG_TO_CATEGORY[f.slug] === activeCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (f) => f.name.toLowerCase().includes(query) || f.slug.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [factions, activeCategory, searchQuery])

  const handleSelect = (factionId: string) => {
    onChange(factionId === selectedFactionId ? null : factionId)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleClear = () => {
    onChange(null)
  }

  if (isLoading) {
    return (
      <div className="flex h-14 items-center justify-center">
        <motion.div
          className="h-5 w-5 rounded-full border-2 border-bone/20 border-t-imperial-gold"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Selected faction display / trigger button */}
      {selectedFaction ? (
        <div className="flex items-center gap-3 rounded-xl border border-imperial-gold/30 bg-imperial-gold/10 p-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${selectedFaction.primary_color || '#666'}, ${selectedFaction.secondary_color || '#333'})`,
            }}
          >
            {FACTION_ICONS[selectedFaction.slug] ? (
              <Image
                src={FACTION_ICONS[selectedFaction.slug]}
                alt={selectedFaction.name}
                width={24}
                height={24}
                className="invert"
              />
            ) : (
              <Shield className="h-5 w-5 text-white/70" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-body text-sm font-semibold text-imperial-gold">
              {selectedFaction.name}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-bone/40 transition-colors hover:text-bone"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="font-body text-xs text-imperial-gold/60 hover:text-imperial-gold"
          >
            Cambiar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center gap-3 rounded-xl border border-bone/10 bg-void p-3 text-left transition-colors hover:border-bone/30"
        >
          <Shield className="h-5 w-5 text-bone/40" />
          <span className="font-body text-sm text-bone/40">Seleccionar faccion (opcional)</span>
        </button>
      )}

      {/* Dropdown picker */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 rounded-xl border border-bone/10 bg-void p-4">
              {/* Category tabs */}
              <div className="scrollbar-none flex gap-1 overflow-x-auto pb-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-body text-xs transition-all ${
                      activeCategory === cat.id
                        ? 'bg-imperial-gold text-void'
                        : 'border border-bone/10 bg-void-light text-bone/60 hover:border-bone/30 hover:text-bone'
                    }`}
                  >
                    {cat.icon && (
                      <div className="relative h-4 w-4">
                        <Image
                          src={cat.icon}
                          alt={cat.label}
                          fill
                          className={activeCategory === cat.id ? '' : 'opacity-60 invert'}
                        />
                      </div>
                    )}
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/40" />
                <input
                  type="text"
                  placeholder="Buscar faccion..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-bone/10 bg-void-light py-2 pl-9 pr-4 font-body text-sm text-bone placeholder:text-bone/30 focus:border-imperial-gold/50 focus:outline-none"
                />
              </div>

              {/* Faction grid */}
              <div className="scrollbar-thin scrollbar-thumb-bone/20 max-h-[200px] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {filteredFactions.map((faction) => {
                    const isSelected = faction.id === selectedFactionId
                    const iconPath = FACTION_ICONS[faction.slug]

                    return (
                      <button
                        key={faction.id}
                        type="button"
                        onClick={() => handleSelect(faction.id)}
                        className={`relative rounded-lg border p-2.5 text-left transition-all ${
                          isSelected
                            ? 'border-imperial-gold bg-imperial-gold/10'
                            : 'border-bone/10 hover:border-bone/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                            style={{
                              background: `linear-gradient(135deg, ${faction.primary_color || '#666'}, ${faction.secondary_color || '#333'})`,
                            }}
                          >
                            {iconPath ? (
                              <Image
                                src={iconPath}
                                alt={faction.name}
                                width={16}
                                height={16}
                                className="invert"
                              />
                            ) : (
                              <div className="h-3 w-3 rounded-full bg-white/30" />
                            )}
                          </div>
                          <span
                            className={`truncate font-body text-xs ${
                              isSelected ? 'font-semibold text-imperial-gold' : 'text-bone/80'
                            }`}
                          >
                            {faction.name}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {filteredFactions.length === 0 && (
                  <div className="py-6 text-center">
                    <p className="font-body text-sm text-bone/50">No se encontraron facciones</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('')
                        setActiveCategory('all')
                      }}
                      className="mt-2 text-xs text-imperial-gold hover:underline"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
