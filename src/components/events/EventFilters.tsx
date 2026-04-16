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
  Clock,
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

  const updateFilters = useCallback(
    (updates: Record<string, string | null>) => {
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
    },
    [router, searchParams]
  )

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

  const hasActiveFilters =
    currentType !== 'all' || currentTier !== 'all' || showPast || searchParams.get('q')

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Calendar className="h-4 w-4 text-amber-500/50" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar eventos..."
            className={cn(
              'w-full rounded-lg py-3 pl-12 pr-4',
              'border border-amber-500/20 bg-void-light/80',
              'font-body text-sm text-bone placeholder-bone/30',
              'focus:border-amber-500/40 focus:outline-none focus:ring-1 focus:ring-amber-500/50',
              'transition-all hover:border-amber-500/30'
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30">
            <Search className="h-4 w-4 text-bone" />
          </div>
        </form>

        {/* Filter toggle button */}
        <motion.button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg border px-5 py-3 transition-all',
            showFilters || hasActiveFilters
              ? 'border-amber-500/50 bg-amber-500/15 text-amber-400'
              : 'border-amber-500/20 bg-void-light/60 text-bone/60 hover:border-amber-500/40 hover:text-bone'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="font-mono text-sm tracking-wider">FILTROS</span>
          {hasActiveFilters && <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />}
        </motion.button>

        {/* Clear filters */}
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={clearFilters}
            className="border-blood-red/30 text-blood-red/60 hover:text-blood-red hover:border-blood-red/50 hover:bg-blood-red/5 flex items-center justify-center gap-2 rounded-lg border px-4 py-3 transition-all"
          >
            <X className="h-4 w-4" />
            <span className="hidden font-mono text-sm tracking-wider sm:inline">LIMPIAR</span>
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
            <div className="relative rounded-xl border border-amber-500/20 bg-gradient-to-b from-void-light/90 to-void/80 p-5">
              {/* Corner decorations */}
              <div className="absolute left-2 top-2 h-4 w-4 border-l border-t border-amber-500/30" />
              <div className="absolute right-2 top-2 h-4 w-4 border-r border-t border-amber-500/30" />
              <div className="absolute bottom-2 left-2 h-4 w-4 border-b border-l border-amber-500/30" />
              <div className="absolute bottom-2 right-2 h-4 w-4 border-b border-r border-amber-500/30" />

              {/* Event Type */}
              <div className="mb-5">
                <div className="mb-3 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500/60" />
                  <label className="font-mono text-xs uppercase tracking-[0.15em] text-amber-500/80">
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
                          'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all',
                          isActive
                            ? 'border-amber-500/50 bg-amber-500/20 text-amber-400 shadow-sm shadow-amber-500/20'
                            : 'border-amber-500/15 bg-void/50 text-bone/50 hover:border-amber-500/30 hover:text-bone/80'
                        )}
                      >
                        <Icon
                          className={cn('h-4 w-4', isActive ? 'text-amber-400' : 'text-bone/40')}
                        />
                        <span className="font-body">{type.label}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="mb-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                <Calendar className="h-3 w-3 text-amber-500/30" />
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
              </div>

              {/* Tier filter (Official vs Community) */}
              <div className="mb-5">
                <div className="mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-amber-500/60" />
                  <label className="font-mono text-xs uppercase tracking-[0.15em] text-amber-500/80">
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
                          'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all',
                          isActive
                            ? tier.value === 'official'
                              ? 'border-imperial-gold/50 bg-imperial-gold/20 text-imperial-gold'
                              : 'border-amber-500/50 bg-amber-500/20 text-amber-400'
                            : 'border-amber-500/15 bg-void/50 text-bone/50 hover:border-amber-500/30 hover:text-bone/80'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4',
                            isActive
                              ? tier.value === 'official'
                                ? 'text-imperial-gold'
                                : 'text-amber-400'
                              : 'text-bone/40'
                          )}
                        />
                        <span className="font-body">{tier.label}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Show past events toggle */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500/60" />
                  <label className="font-mono text-xs uppercase tracking-[0.15em] text-amber-500/80">
                    Opciones
                  </label>
                </div>
                <motion.button
                  onClick={() => updateFilters({ past: showPast ? null : 'true' })}
                  disabled={isPending}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm transition-all',
                    showPast
                      ? 'border-bone/30 bg-bone/10 text-bone/80'
                      : 'border-amber-500/15 bg-void/50 text-bone/50 hover:border-amber-500/30 hover:text-bone/80'
                  )}
                >
                  <div
                    className={cn(
                      'h-2.5 w-2.5 rounded-full transition-colors',
                      showPast ? 'bg-bone/60' : 'bg-bone/30'
                    )}
                  />
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
          <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
          <span className="font-mono text-xs tracking-wider text-bone/40">
            CONSULTANDO CHRONUS...
          </span>
        </motion.div>
      )}
    </div>
  )
}
