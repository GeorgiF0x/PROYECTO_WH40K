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
      <div className="h-14 flex items-center justify-center">
        <motion.div
          className="w-5 h-5 border-2 border-bone/20 border-t-imperial-gold rounded-full"
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
        <div className="flex items-center gap-3 p-3 rounded-xl border border-imperial-gold/30 bg-imperial-gold/10">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
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
              <Shield className="w-5 h-5 text-white/70" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-body font-semibold text-imperial-gold truncate">
              {selectedFaction.name}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-bone/40 hover:text-bone transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs text-imperial-gold/60 hover:text-imperial-gold font-body"
          >
            Cambiar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-3 p-3 rounded-xl border border-bone/10 bg-void hover:border-bone/30 transition-colors text-left"
        >
          <Shield className="w-5 h-5 text-bone/40" />
          <span className="text-sm text-bone/40 font-body">
            Seleccionar faccion (opcional)
          </span>
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
            <div className="p-4 bg-void rounded-xl border border-bone/10 space-y-3">
              {/* Category tabs */}
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body whitespace-nowrap transition-all ${
                      activeCategory === cat.id
                        ? 'bg-imperial-gold text-void'
                        : 'bg-void-light border border-bone/10 text-bone/60 hover:border-bone/30 hover:text-bone'
                    }`}
                  >
                    {cat.icon && (
                      <div className="w-4 h-4 relative">
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bone/40" />
                <input
                  type="text"
                  placeholder="Buscar faccion..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-void-light border border-bone/10 rounded-lg font-body text-sm text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50"
                />
              </div>

              {/* Faction grid */}
              <div className="max-h-[200px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-bone/20">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {filteredFactions.map((faction) => {
                    const isSelected = faction.id === selectedFactionId
                    const iconPath = FACTION_ICONS[faction.slug]

                    return (
                      <button
                        key={faction.id}
                        type="button"
                        onClick={() => handleSelect(faction.id)}
                        className={`relative p-2.5 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'border-imperial-gold bg-imperial-gold/10'
                            : 'border-bone/10 hover:border-bone/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
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
                              <div className="w-3 h-3 rounded-full bg-white/30" />
                            )}
                          </div>
                          <span
                            className={`text-xs font-body truncate ${
                              isSelected ? 'text-imperial-gold font-semibold' : 'text-bone/80'
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
                    <p className="text-bone/50 font-body text-sm">No se encontraron facciones</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('')
                        setActiveCategory('all')
                      }}
                      className="text-imperial-gold text-xs mt-2 hover:underline"
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
