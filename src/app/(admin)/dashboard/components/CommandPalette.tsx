'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Home,
  Store,
  Users,
  Palette,
  Calendar,
  Flag,
  BarChart3,
  Settings,
  ScrollText,
  ShoppingBag,
  ExternalLink,
  ArrowLeft,
  Cpu,
  X,
} from 'lucide-react'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SearchResult {
  id: string
  label: string
  type: 'user' | 'store' | 'listing'
  href: string
}

const navItems = [
  { label: 'Comando', href: '/dashboard', icon: Home, color: 'text-imperial-gold' },
  { label: 'Usuarios', href: '/dashboard/usuarios', icon: Users, color: 'text-necron-teal' },
  { label: 'Tiendas', href: '/dashboard/tiendas', icon: Store, color: 'text-amber-400' },
  { label: 'Mercado', href: '/dashboard/mercado', icon: ShoppingBag, color: 'text-orange-400' },
  { label: 'Creadores', href: '/dashboard/creadores', icon: Palette, color: 'text-purple-400' },
  { label: 'Reportes', href: '/dashboard/reportes', icon: Flag, color: 'text-blood-red' },
  { label: 'Eventos', href: '/dashboard/eventos', icon: Calendar, color: 'text-emerald-400' },
  { label: 'Escribas', href: '/dashboard/escribas', icon: ScrollText, color: 'text-amber-400' },
  { label: 'Analiticas', href: '/dashboard/analiticas', icon: BarChart3, color: 'text-necron-teal' },
  { label: 'Configuracion', href: '/dashboard/configuracion', icon: Settings, color: 'text-bone/60' },
]

const quickActions = [
  { label: 'Ver sitio', href: '/', icon: ExternalLink, external: true },
  { label: 'Volver al portal', href: '/', icon: ArrowLeft, external: false },
]

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const supabase = createClient()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced search
  const searchSupabase = useCallback(
    async (term: string) => {
      if (term.length < 2) {
        setResults([])
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      const searchTerm = `%${term}%`

      const [usersRes, storesRes, listingsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, username, display_name')
          .or(`username.ilike.${searchTerm},display_name.ilike.${searchTerm}`)
          .limit(5),
        supabase
          .from('stores')
          .select('id, name, slug')
          .ilike('name', searchTerm)
          .limit(5),
        supabase
          .from('listings')
          .select('id, title')
          .ilike('title', searchTerm)
          .limit(5),
      ])

      const combined: SearchResult[] = []

      if (usersRes.data) {
        for (const u of usersRes.data) {
          combined.push({
            id: u.id,
            label: u.display_name || u.username || u.id,
            type: 'user',
            href: '/dashboard/usuarios',
          })
        }
      }

      if (storesRes.data) {
        for (const s of storesRes.data) {
          combined.push({
            id: s.id,
            label: s.name,
            type: 'store',
            href: '/dashboard/tiendas',
          })
        }
      }

      if (listingsRes.data) {
        for (const l of listingsRes.data) {
          combined.push({
            id: l.id,
            label: l.title,
            type: 'listing',
            href: '/dashboard/mercado',
          })
        }
      }

      setResults(combined)
      setIsSearching(false)
    },
    [supabase]
  )

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (query.length < 2) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(() => {
      searchSupabase(query)
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, searchSupabase])

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
    }
  }, [open])

  const navigate = (href: string, external?: boolean) => {
    onOpenChange(false)
    if (external) {
      window.open(href, '_blank')
    } else {
      router.push(href)
    }
  }

  const typeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'user':
        return <Users className="h-4 w-4 text-necron-teal" />
      case 'store':
        return <Store className="h-4 w-4 text-amber-400" />
      case 'listing':
        return <ShoppingBag className="h-4 w-4 text-orange-400" />
    }
  }

  const typeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'user':
        return 'Usuario'
      case 'store':
        return 'Tienda'
      case 'listing':
        return 'Anuncio'
    }
  }

  const userResults = results.filter((r) => r.type === 'user')
  const storeResults = results.filter((r) => r.type === 'store')
  const listingResults = results.filter((r) => r.type === 'listing')

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[200] bg-void-dark/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
          />

          {/* Command dialog */}
          <motion.div
            className="fixed inset-0 z-[201] flex items-start justify-center pt-[20vh]"
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <div className="relative w-full max-w-lg mx-4">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-imperial-gold/40" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-imperial-gold/40" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-imperial-gold/40" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-imperial-gold/40" />

              <Command
                className="rounded-xl border border-imperial-gold/15 bg-void-dark/95 backdrop-blur-xl shadow-2xl shadow-imperial-gold/5 overflow-hidden"
                shouldFilter={false}
              >
                {/* Header */}
                <div className="flex items-center gap-2 border-b border-imperial-gold/10 px-4 py-2">
                  <Cpu className="h-3 w-3 text-imperial-gold/60" />
                  <span className="text-[10px] font-mono text-imperial-gold/60 tracking-widest">
                    COGITATOR // BUSQUEDA GLOBAL
                  </span>
                  <button
                    onClick={() => onOpenChange(false)}
                    className="ml-auto p-1 rounded text-bone/30 hover:text-bone/60 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Input */}
                <div className="flex items-center gap-3 px-4 border-b border-imperial-gold/10">
                  <Search className="h-4 w-4 text-imperial-gold/50 shrink-0" />
                  <Command.Input
                    value={query}
                    onValueChange={setQuery}
                    placeholder="Buscar modulos, usuarios, tiendas..."
                    className="flex-1 bg-transparent py-3 text-sm text-bone placeholder:text-bone/30 outline-none font-mono"
                  />
                  <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-imperial-gold/20 bg-void-light px-1.5 font-mono text-[10px] text-bone/30">
                    ESC
                  </kbd>
                </div>

                {/* Results */}
                <Command.List className="max-h-[320px] overflow-y-auto p-2">
                  <Command.Empty className="py-8 text-center text-sm text-bone/30 font-mono">
                    {isSearching ? 'Escaneando bases de datos...' : 'Sin resultados encontrados'}
                  </Command.Empty>

                  {/* Search results (when typing) */}
                  {userResults.length > 0 && (
                    <Command.Group heading={
                      <span className="flex items-center gap-2 text-[10px] font-mono text-necron-teal/60 tracking-widest px-2">
                        <Users className="h-3 w-3" /> USUARIOS
                      </span>
                    }>
                      {userResults.map((r) => (
                        <Command.Item
                          key={r.id}
                          value={`user-${r.id}`}
                          onSelect={() => navigate(r.href)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-bone/70 cursor-pointer data-[selected=true]:bg-imperial-gold/10 data-[selected=true]:text-bone transition-colors"
                        >
                          {typeIcon(r.type)}
                          <span className="flex-1 truncate">{r.label}</span>
                          <span className="text-[10px] text-bone/30 font-mono">{typeLabel(r.type)}</span>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  )}

                  {storeResults.length > 0 && (
                    <Command.Group heading={
                      <span className="flex items-center gap-2 text-[10px] font-mono text-amber-400/60 tracking-widest px-2">
                        <Store className="h-3 w-3" /> TIENDAS
                      </span>
                    }>
                      {storeResults.map((r) => (
                        <Command.Item
                          key={r.id}
                          value={`store-${r.id}`}
                          onSelect={() => navigate(r.href)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-bone/70 cursor-pointer data-[selected=true]:bg-imperial-gold/10 data-[selected=true]:text-bone transition-colors"
                        >
                          {typeIcon(r.type)}
                          <span className="flex-1 truncate">{r.label}</span>
                          <span className="text-[10px] text-bone/30 font-mono">{typeLabel(r.type)}</span>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  )}

                  {listingResults.length > 0 && (
                    <Command.Group heading={
                      <span className="flex items-center gap-2 text-[10px] font-mono text-orange-400/60 tracking-widest px-2">
                        <ShoppingBag className="h-3 w-3" /> ANUNCIOS
                      </span>
                    }>
                      {listingResults.map((r) => (
                        <Command.Item
                          key={r.id}
                          value={`listing-${r.id}`}
                          onSelect={() => navigate(r.href)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-bone/70 cursor-pointer data-[selected=true]:bg-imperial-gold/10 data-[selected=true]:text-bone transition-colors"
                        >
                          {typeIcon(r.type)}
                          <span className="flex-1 truncate">{r.label}</span>
                          <span className="text-[10px] text-bone/30 font-mono">{typeLabel(r.type)}</span>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  )}

                  {/* Navigation (when not typing or no results) */}
                  {query.length < 2 && (
                    <>
                      <Command.Group heading={
                        <span className="flex items-center gap-2 text-[10px] font-mono text-imperial-gold/40 tracking-widest px-2">
                          <Cpu className="h-3 w-3" /> NAVEGACION RAPIDA
                        </span>
                      }>
                        {navItems.map((item) => {
                          const Icon = item.icon
                          return (
                            <Command.Item
                              key={item.href}
                              value={item.label}
                              onSelect={() => navigate(item.href)}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-bone/70 cursor-pointer data-[selected=true]:bg-imperial-gold/10 data-[selected=true]:text-bone transition-colors"
                            >
                              <Icon className={`h-4 w-4 ${item.color}`} />
                              <span>{item.label}</span>
                            </Command.Item>
                          )
                        })}
                      </Command.Group>

                      <Command.Group heading={
                        <span className="flex items-center gap-2 text-[10px] font-mono text-necron-teal/40 tracking-widest px-2">
                          <ExternalLink className="h-3 w-3" /> ACCIONES RAPIDAS
                        </span>
                      }>
                        {quickActions.map((action) => {
                          const Icon = action.icon
                          return (
                            <Command.Item
                              key={action.label}
                              value={action.label}
                              onSelect={() => navigate(action.href, action.external)}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-bone/70 cursor-pointer data-[selected=true]:bg-imperial-gold/10 data-[selected=true]:text-bone transition-colors"
                            >
                              <Icon className="h-4 w-4 text-bone/40" />
                              <span>{action.label}</span>
                            </Command.Item>
                          )
                        })}
                      </Command.Group>
                    </>
                  )}
                </Command.List>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-imperial-gold/10 px-4 py-2">
                  <div className="flex items-center gap-3 text-[10px] text-bone/30 font-mono">
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-imperial-gold/20 bg-void-light px-1">↑↓</kbd>
                      navegar
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-imperial-gold/20 bg-void-light px-1">↵</kbd>
                      seleccionar
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-imperial-gold/20 bg-void-light px-1">esc</kbd>
                      cerrar
                    </span>
                  </div>
                </div>
              </Command>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
