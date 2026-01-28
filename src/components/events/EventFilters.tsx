'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  SlidersHorizontal,
  X,
  Calendar,
  Trophy,
  Paintbrush,
  Swords,
  BookOpen,
  PartyPopper,
  Users2,
  Shield,
  Users,
  Loader2,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EventType } from '@/lib/types/database.types'

interface EventFiltersProps {
  className?: string
}

const eventTypes: {
  value: EventType | 'all'
  label: string
  icon: typeof Trophy
}[] = [
  { value: 'all', label: 'Todos', icon: Calendar },
  { value: 'tournament', label: 'Torneos', icon: Trophy },
  { value: 'painting_workshop', label: 'Talleres', icon: Paintbrush },
  { value: 'casual_play', label: 'Casual', icon: Swords },
  { value: 'campaign', label: 'Campañas', icon: BookOpen },
  { value: 'release_event', label: 'Lanzamientos', icon: PartyPopper },
  { value: 'meetup', label: 'Quedadas', icon: Users2 },
]

const tierOptions = [
  { value: 'all', label: 'Todos', icon: Calendar },
  { value: 'official', label: 'Oficiales', icon: Shield },
  { value: 'community', label: 'Comunidad', icon: Users },
]

export function EventFilters({ className }: EventFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '')

  const currentType = (searchParams.get('type') || 'all') as EventType | 'all'
  const currentTier = searchParams.get('tier') || 'all'
  const showPast = searchParams.get('past') === 'true'

  const updateFilters = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all' || value === 'false') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    startTransition(() => {
      router.push(`/comunidad/eventos?${params.toString()}`, { scroll: false })
    })
  }, [router, searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ q: searchInput.trim() || null })
  }

  const clearFilters = () => {
    setSearchInput('')
    startTransition(() => {
      router.push('/comunidad/eventos', { scroll: false })
    })
  }

  const hasActiveFilters = currentType !== 'all' || currentTier !== 'all' || showPast || searchParams.get('q')

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Calendar className="w-4 h-4 text-amber-500/50" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar eventos..."
            className={cn(
              'w-full pl-12 pr-4 py-3 rounded-lg',
              'bg-void-light/80 border border-amber-500/20',
              'text-bone placeholder-bone/30 font-body text-sm',
              'focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/40',
              'hover:border-amber-500/30 transition-all'
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30">
            <Search className="w-4 h-4 text-bone" />
          </div>
        </form>

        {/* Filter toggle button */}
        <motion.button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center justify-center gap-2 px-5 py-3 rounded-lg border transition-all',
            showFilters || hasActiveFilters
              ? 'bg-amber-500/15 border-amber-500/50 text-amber-400'
              : 'bg-void-light/60 border-amber-500/20 text-bone/60 hover:border-amber-500/40 hover:text-bone'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-sm font-mono tracking-wider">FILTROS</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </motion.button>

        {/* Clear filters */}
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={clearFilters}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-blood-red/30 text-blood-red/60 hover:text-blood-red hover:border-blood-red/50 hover:bg-blood-red/5 transition-all"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline text-sm font-mono tracking-wider">LIMPIAR</span>
          </motion.button>
        )}
      </div>

      {/* Expanded filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="relative p-5 rounded-xl bg-gradient-to-b from-void-light/90 to-void/80 border border-amber-500/20">
              {/* Corner decorations */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-amber-500/30" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-amber-500/30" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-amber-500/30" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-amber-500/30" />

              {/* Event Type */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-amber-500/60" />
                  <label className="text-xs font-mono text-amber-500/80 tracking-[0.15em] uppercase">
                    Tipo de Evento
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {eventTypes.map((type) => {
                    const Icon = type.icon
                    const isActive = currentType === type.value

                    return (
                      <motion.button
                        key={type.value}
                        onClick={() => updateFilters({ type: type.value })}
                        disabled={isPending}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all',
                          isActive
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-sm shadow-amber-500/20'
                            : 'bg-void/50 border-amber-500/15 text-bone/50 hover:border-amber-500/30 hover:text-bone/80'
                        )}
                      >
                        <Icon className={cn('w-4 h-4', isActive ? 'text-amber-400' : 'text-bone/40')} />
                        <span className="font-body">{type.label}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                <Calendar className="w-3 h-3 text-amber-500/30" />
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
              </div>

              {/* Tier filter (Official vs Community) */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-amber-500/60" />
                  <label className="text-xs font-mono text-amber-500/80 tracking-[0.15em] uppercase">
                    Categoria
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tierOptions.map((tier) => {
                    const Icon = tier.icon
                    const isActive = currentTier === tier.value

                    return (
                      <motion.button
                        key={tier.value}
                        onClick={() => updateFilters({ tier: tier.value })}
                        disabled={isPending}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all',
                          isActive
                            ? tier.value === 'official'
                              ? 'bg-imperial-gold/20 border-imperial-gold/50 text-imperial-gold'
                              : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                            : 'bg-void/50 border-amber-500/15 text-bone/50 hover:border-amber-500/30 hover:text-bone/80'
                        )}
                      >
                        <Icon className={cn('w-4 h-4', isActive ? (tier.value === 'official' ? 'text-imperial-gold' : 'text-amber-400') : 'text-bone/40')} />
                        <span className="font-body">{tier.label}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Show past events toggle */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-amber-500/60" />
                  <label className="text-xs font-mono text-amber-500/80 tracking-[0.15em] uppercase">
                    Opciones
                  </label>
                </div>
                <motion.button
                  onClick={() => updateFilters({ past: showPast ? null : 'true' })}
                  disabled={isPending}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm transition-all',
                    showPast
                      ? 'bg-bone/10 border-bone/30 text-bone/80'
                      : 'bg-void/50 border-amber-500/15 text-bone/50 hover:border-amber-500/30 hover:text-bone/80'
                  )}
                >
                  <div className={cn(
                    'w-2.5 h-2.5 rounded-full transition-colors',
                    showPast ? 'bg-bone/60' : 'bg-bone/30'
                  )} />
                  <span className="font-body">Incluir eventos pasados</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading indicator */}
      {isPending && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-3 py-2"
        >
          <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
          <span className="text-xs font-mono text-bone/40 tracking-wider">CONSULTANDO CHRONUS...</span>
        </motion.div>
      )}
    </div>
  )
}
