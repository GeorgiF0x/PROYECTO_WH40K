'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  SlidersHorizontal,
  X,
  Palette,
  Video,
  Brush,
  BookOpen,
  GraduationCap,
  ScrollText,
  Feather,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CreatorType } from '@/lib/types/database.types'

interface CreatorFiltersProps {
  className?: string
}

// Order names in Warhammer lore style
const creatorTypes: {
  value: CreatorType | 'all'
  label: string
  orderName: string
  icon: typeof Palette
}[] = [
  { value: 'all', label: 'Todos', orderName: 'Todas las Ordenes', icon: ScrollText },
  { value: 'painter', label: 'Pintores', orderName: 'Orden de Artesanos', icon: Palette },
  { value: 'youtuber', label: 'YouTubers', orderName: 'Orden de Vox-Emisores', icon: Video },
  { value: 'artist', label: 'Artistas', orderName: 'Orden de Iluminadores', icon: Brush },
  { value: 'blogger', label: 'Bloggers', orderName: 'Orden de Cronistas', icon: BookOpen },
  {
    value: 'instructor',
    label: 'Instructores',
    orderName: 'Orden de Magisters',
    icon: GraduationCap,
  },
]

export function CreatorFilters({ className }: CreatorFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '')

  const currentType = (searchParams.get('type') || 'all') as CreatorType | 'all'
  const acceptsCommissions = searchParams.get('commissions') === 'true'

  const updateFilters = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'all') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })

      startTransition(() => {
        router.push(`/comunidad/creadores?${params.toString()}`, { scroll: false })
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
      router.push('/comunidad/creadores', { scroll: false })
    })
  }

  const hasActiveFilters = currentType !== 'all' || acceptsCommissions || searchParams.get('q')

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main filter bar - Manuscript scroll style */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Search - parchment input */}
        <form onSubmit={handleSearch} className="relative flex-1">
          <div className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
            <Feather className="h-4 w-4 text-imperial-gold/50" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar en los archivos..."
            className={cn(
              'w-full rounded-lg py-3 pl-12 pr-4',
              'border border-imperial-gold/20 bg-void-light/80',
              'font-body text-sm text-bone placeholder-bone/30',
              'focus:border-imperial-gold/40 focus:outline-none focus:ring-1 focus:ring-imperial-gold/50',
              'transition-all hover:border-imperial-gold/30'
            )}
          />
          {/* Decorative corner */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30">
            <Search className="h-4 w-4 text-bone" />
          </div>
        </form>

        {/* Filter toggle button - wax seal style */}
        <motion.button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg border px-5 py-3 transition-all',
            showFilters || hasActiveFilters
              ? 'border-imperial-gold/50 bg-imperial-gold/15 text-imperial-gold'
              : 'border-imperial-gold/20 bg-void-light/60 text-bone/60 hover:border-imperial-gold/40 hover:text-bone'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="font-mono text-sm tracking-wider">FILTROS</span>
          {hasActiveFilters && (
            <span className="h-2 w-2 animate-pulse rounded-full bg-imperial-gold" />
          )}
        </motion.button>

        {/* Clear filters - crossed quill */}
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={clearFilters}
            className="border-blood-red/30 text-blood-red/60 hover:text-blood-red hover:border-blood-red/50 hover:bg-blood-red/5 flex items-center justify-center gap-2 rounded-lg border px-4 py-3 transition-all"
          >
            <X className="h-4 w-4" />
            <span className="hidden font-mono text-sm tracking-wider sm:inline">PURGAR</span>
          </motion.button>
        )}
      </div>

      {/* Expanded filters - Scroll/Parchment panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="relative rounded-xl border border-imperial-gold/20 bg-gradient-to-b from-void-light/90 to-void/80 p-5">
              {/* Corner decorations */}
              <div className="absolute left-2 top-2 h-4 w-4 border-l border-t border-imperial-gold/30" />
              <div className="absolute right-2 top-2 h-4 w-4 border-r border-t border-imperial-gold/30" />
              <div className="absolute bottom-2 left-2 h-4 w-4 border-b border-l border-imperial-gold/30" />
              <div className="absolute bottom-2 right-2 h-4 w-4 border-b border-r border-imperial-gold/30" />

              {/* Section: Creator Orders */}
              <div className="mb-5">
                <div className="mb-3 flex items-center gap-2">
                  <ScrollText className="h-4 w-4 text-imperial-gold/60" />
                  <label className="font-mono text-xs uppercase tracking-[0.15em] text-imperial-gold/80">
                    Orden del Rememorizador
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {creatorTypes.map((type) => {
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
                            ? 'border-imperial-gold/50 bg-imperial-gold/20 text-imperial-gold shadow-sm shadow-imperial-gold/20'
                            : 'border-imperial-gold/15 bg-void/50 text-bone/50 hover:border-imperial-gold/30 hover:text-bone/80'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4',
                            isActive ? 'text-imperial-gold' : 'text-bone/40'
                          )}
                        />
                        <span className="font-body">{type.label}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="mb-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-imperial-gold/20 to-transparent" />
                <Feather className="h-3 w-3 text-imperial-gold/30" />
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-imperial-gold/20 to-transparent" />
              </div>

              {/* Section: Opciones */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Palette className="h-4 w-4 text-imperial-gold/60" />
                  <label className="font-mono text-xs uppercase tracking-[0.15em] text-imperial-gold/80">
                    Estado de Servicios
                  </label>
                </div>
                <motion.button
                  onClick={() =>
                    updateFilters({
                      commissions: acceptsCommissions ? null : 'true',
                    })
                  }
                  disabled={isPending}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm transition-all',
                    acceptsCommissions
                      ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400'
                      : 'border-imperial-gold/15 bg-void/50 text-bone/50 hover:border-imperial-gold/30 hover:text-bone/80'
                  )}
                >
                  <div className="relative">
                    <div
                      className={cn(
                        'h-2.5 w-2.5 rounded-full transition-colors',
                        acceptsCommissions ? 'bg-emerald-400' : 'bg-bone/30'
                      )}
                    />
                    {acceptsCommissions && (
                      <div className="absolute inset-0 h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400 opacity-50" />
                    )}
                  </div>
                  <span className="font-body">Acepta encargos del Imperium</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading indicator - cogitator style */}
      {isPending && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-3 py-2"
        >
          <Loader2 className="h-4 w-4 animate-spin text-imperial-gold" />
          <span className="font-mono text-xs tracking-wider text-bone/40">
            CONSULTANDO ARCHIVOS...
          </span>
        </motion.div>
      )}
    </div>
  )
}
