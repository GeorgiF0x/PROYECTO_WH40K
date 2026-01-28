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
  Loader2
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
  { value: 'instructor', label: 'Instructores', orderName: 'Orden de Magisters', icon: GraduationCap }
]

export function CreatorFilters({ className }: CreatorFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '')

  const currentType = (searchParams.get('type') || 'all') as CreatorType | 'all'
  const acceptsCommissions = searchParams.get('commissions') === 'true'

  const updateFilters = useCallback((updates: Record<string, string | null>) => {
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
  }, [router, searchParams])

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
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search - parchment input */}
        <form onSubmit={handleSearch} className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <Feather className="w-4 h-4 text-imperial-gold/50" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar en los archivos..."
            className={cn(
              'w-full pl-12 pr-4 py-3 rounded-lg',
              'bg-void-light/80 border border-imperial-gold/20',
              'text-bone placeholder-bone/30 font-body text-sm',
              'focus:outline-none focus:ring-1 focus:ring-imperial-gold/50 focus:border-imperial-gold/40',
              'hover:border-imperial-gold/30 transition-all'
            )}
          />
          {/* Decorative corner */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30">
            <Search className="w-4 h-4 text-bone" />
          </div>
        </form>

        {/* Filter toggle button - wax seal style */}
        <motion.button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center justify-center gap-2 px-5 py-3 rounded-lg border transition-all',
            showFilters || hasActiveFilters
              ? 'bg-imperial-gold/15 border-imperial-gold/50 text-imperial-gold'
              : 'bg-void-light/60 border-imperial-gold/20 text-bone/60 hover:border-imperial-gold/40 hover:text-bone'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-sm font-mono tracking-wider">FILTROS</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-imperial-gold animate-pulse" />
          )}
        </motion.button>

        {/* Clear filters - crossed quill */}
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={clearFilters}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-blood-red/30 text-blood-red/60 hover:text-blood-red hover:border-blood-red/50 hover:bg-blood-red/5 transition-all"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline text-sm font-mono tracking-wider">PURGAR</span>
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
            <div className="relative p-5 rounded-xl bg-gradient-to-b from-void-light/90 to-void/80 border border-imperial-gold/20">
              {/* Corner decorations */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-imperial-gold/30" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-imperial-gold/30" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-imperial-gold/30" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-imperial-gold/30" />

              {/* Section: Creator Orders */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <ScrollText className="w-4 h-4 text-imperial-gold/60" />
                  <label className="text-xs font-mono text-imperial-gold/80 tracking-[0.15em] uppercase">
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
                          'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all',
                          isActive
                            ? 'bg-imperial-gold/20 border-imperial-gold/50 text-imperial-gold shadow-sm shadow-imperial-gold/20'
                            : 'bg-void/50 border-imperial-gold/15 text-bone/50 hover:border-imperial-gold/30 hover:text-bone/80'
                        )}
                      >
                        <Icon className={cn('w-4 h-4', isActive ? 'text-imperial-gold' : 'text-bone/40')} />
                        <span className="font-body">{type.label}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-imperial-gold/20 to-transparent" />
                <Feather className="w-3 h-3 text-imperial-gold/30" />
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-imperial-gold/20 to-transparent" />
              </div>

              {/* Section: Opciones */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="w-4 h-4 text-imperial-gold/60" />
                  <label className="text-xs font-mono text-imperial-gold/80 tracking-[0.15em] uppercase">
                    Estado de Servicios
                  </label>
                </div>
                <motion.button
                  onClick={() => updateFilters({
                    commissions: acceptsCommissions ? null : 'true'
                  })}
                  disabled={isPending}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm transition-all',
                    acceptsCommissions
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
                      : 'bg-void/50 border-imperial-gold/15 text-bone/50 hover:border-imperial-gold/30 hover:text-bone/80'
                  )}
                >
                  <div className="relative">
                    <div className={cn(
                      'w-2.5 h-2.5 rounded-full transition-colors',
                      acceptsCommissions ? 'bg-emerald-400' : 'bg-bone/30'
                    )} />
                    {acceptsCommissions && (
                      <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-50" />
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
          <Loader2 className="w-4 h-4 text-imperial-gold animate-spin" />
          <span className="text-xs font-mono text-bone/40 tracking-wider">CONSULTANDO ARCHIVOS...</span>
        </motion.div>
      )}
    </div>
  )
}
