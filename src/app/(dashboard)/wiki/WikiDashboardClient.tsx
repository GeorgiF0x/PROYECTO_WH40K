'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Plus,
  Search,
  BookOpen,
  Eye,
  Edit3,
  Trash2,
  Globe,
  FileText,
  Archive,
  Clock,
  AlertTriangle,
  Users,
  Feather,
  Crosshair,
  Cpu,
} from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { factions } from '@/lib/data'
import type { WikiPage, WikiCategory } from '@/lib/supabase/wiki.types'

interface WikiDashboardClientProps {
  isAdmin: boolean
  isLexicanum: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 100 },
  },
}

export function WikiDashboardClient({ isAdmin, isLexicanum }: WikiDashboardClientProps) {
  const [pages, setPages] = useState<WikiPage[]>([])
  const [categories, setCategories] = useState<WikiCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [factionFilter, setFactionFilter] = useState<string>('')
  const [pendingContributions, setPendingContributions] = useState(0)
  const [pendingScribeApps, setPendingScribeApps] = useState(0)

  useEffect(() => {
    loadData()
  }, [statusFilter, factionFilter])

  async function loadData() {
    setLoading(true)
    try {
      // Load categories
      const catRes = await fetch('/api/wiki/categories')
      if (catRes.ok) {
        setCategories(await catRes.json())
      }

      // Load pages
      let url = '/api/wiki?limit=50'
      if (statusFilter) url += `&status=${statusFilter}`
      if (factionFilter) url += `&faction_id=${factionFilter}`

      const pagesRes = await fetch(url)
      if (pagesRes.ok) {
        const data = await pagesRes.json()
        setPages(data.pages || [])
      }

      // Load pending contributions count (admins only)
      if (isAdmin || isLexicanum) {
        const contribRes = await fetch('/api/wiki/contributions?status=pending&limit=1')
        if (contribRes.ok) {
          const contribData = await contribRes.json()
          setPendingContributions(contribData.total || 0)
        }

        // Load pending scribe applications
        const scribeRes = await fetch('/api/wiki/scribe-applications?status=pending')
        if (scribeRes.ok) {
          const scribeData = await scribeRes.json()
          setPendingScribeApps(scribeData.data?.length || 0)
        }
      }
    } catch (error) {
      console.error('Error loading wiki data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPages = search
    ? pages.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    : pages

  const publishedCount = pages.filter(p => p.status === 'published').length
  const draftCount = pages.filter(p => p.status === 'draft').length

  const statusColors: Record<string, string> = {
    draft: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    published: 'bg-necron-teal/15 text-necron-teal border border-necron-teal/30',
    archived: 'bg-bone/10 text-bone/50 border border-bone/20',
  }

  const statusIcons: Record<string, typeof FileText> = {
    draft: FileText,
    published: Globe,
    archived: Archive,
  }

  async function handleDelete(pageId: string) {
    if (!confirm('Estas seguro de que quieres eliminar este articulo?')) return

    try {
      const res = await fetch(`/api/wiki/${pageId}`, { method: 'DELETE' })
      if (res.ok) {
        setPages(pages.filter(p => p.id !== pageId))
      }
    } catch (error) {
      console.error('Error deleting page:', error)
    }
  }

  async function handleStatusChange(pageId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/wiki/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        loadData()
      }
    } catch (error) {
      console.error('Error updating page status:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Crosshair className="h-4 w-4 text-imperial-gold/60" />
            <span className="text-[10px] font-mono text-imperial-gold/60 tracking-[0.3em] uppercase">
              ARCHIVO LEXICANUM // GESTION IMPERIAL
            </span>
          </div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-display font-bold text-bone tracking-wide">
              Archivo Lexicanum
            </h1>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono tracking-wider border"
              style={{
                background: isAdmin
                  ? 'rgba(201,162,39,0.15)'
                  : isLexicanum
                    ? 'rgba(13,155,138,0.15)'
                    : 'rgba(232,232,240,0.08)',
                borderColor: isAdmin
                  ? 'rgba(201,162,39,0.4)'
                  : isLexicanum
                    ? 'rgba(13,155,138,0.4)'
                    : 'rgba(232,232,240,0.2)',
                color: isAdmin
                  ? '#C9A227'
                  : isLexicanum
                    ? '#0D9B8A'
                    : 'rgba(232,232,240,0.7)',
                boxShadow: isAdmin
                  ? '0 0 12px rgba(201,162,39,0.2)'
                  : isLexicanum
                    ? '0 0 12px rgba(13,155,138,0.2)'
                    : 'none',
              }}
            >
              <Feather className="w-3 h-3" />
              {isAdmin ? 'ARCHIVISTA' : isLexicanum ? 'LEXICANUM' : 'SCRIBE'}
            </span>
          </div>
          <p className="text-bone/40 font-mono text-sm">
            Gestiona los articulos del Archivo Imperial
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Pending scribe applications */}
          {(isAdmin || isLexicanum) && pendingScribeApps > 0 && (
            <Link href="/wiki/escribas">
              <button className="relative inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-void-light/60 border border-imperial-gold/20 text-bone/80 hover:bg-imperial-gold/10 hover:border-imperial-gold/40 hover:text-bone transition-all duration-200 active:scale-[0.97]">
                <Users className="w-4 h-4 text-amber-400" />
                Solicitudes
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber-500 text-void text-[10px] flex items-center justify-center font-bold shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                  {pendingScribeApps}
                </span>
              </button>
            </Link>
          )}

          {/* Pending contributions */}
          {(isAdmin || isLexicanum) && pendingContributions > 0 && (
            <Link href="/wiki/contribuciones">
              <button className="relative inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-void-light/60 border border-imperial-gold/20 text-bone/80 hover:bg-imperial-gold/10 hover:border-imperial-gold/40 hover:text-bone transition-all duration-200 active:scale-[0.97]">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                Contribuciones
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blood text-white text-[10px] flex items-center justify-center font-bold shadow-[0_0_8px_rgba(139,0,0,0.5)]">
                  {pendingContributions}
                </span>
              </button>
            </Link>
          )}

          {/* New article */}
          <Link href="/wiki/nuevo">
            <button className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-imperial-gold/80 to-imperial-gold/60 text-void border border-imperial-gold/30 hover:from-imperial-gold hover:to-imperial-gold/80 shadow-[0_0_20px_rgba(201,162,39,0.2)] hover:shadow-[0_0_30px_rgba(201,162,39,0.4)] transition-all duration-200 active:scale-[0.97]">
              <Plus className="w-4 h-4" />
              Nuevo Articulo
            </button>
          </Link>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Total Articles */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-xl bg-void-light/50 backdrop-blur-sm border border-imperial-gold/15 p-4 group"
          whileHover={{ scale: 1.02, borderColor: 'rgba(201,162,39,0.4)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-imperial-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-l border-t border-imperial-gold/20 group-hover:border-imperial-gold/50 transition-colors" />
          <span className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-r border-b border-imperial-gold/20 group-hover:border-imperial-gold/50 transition-colors" />
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Cpu className="h-3 w-3 text-imperial-gold/40" />
                <span className="text-[10px] font-mono text-imperial-gold/50 tracking-widest uppercase">
                  TOTAL
                </span>
              </div>
              <p className="text-2xl font-display font-bold text-bone tracking-tight">
                {pages.length}
              </p>
            </div>
            <div
              className="p-2 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(201,162,39,0.2), rgba(201,162,39,0.08))',
                border: '1px solid rgba(201,162,39,0.3)',
              }}
            >
              <BookOpen className="h-5 w-5 text-imperial-gold" />
            </div>
          </div>
        </motion.div>

        {/* Published */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-xl bg-void-light/50 backdrop-blur-sm border border-imperial-gold/15 p-4 group"
          whileHover={{ scale: 1.02, borderColor: 'rgba(13,155,138,0.4)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-necron-teal to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-l border-t border-imperial-gold/20 group-hover:border-necron-teal/50 transition-colors" />
          <span className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-r border-b border-imperial-gold/20 group-hover:border-necron-teal/50 transition-colors" />
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Cpu className="h-3 w-3 text-necron-teal/40" />
                <span className="text-[10px] font-mono text-necron-teal/50 tracking-widest uppercase">
                  PUBLICADOS
                </span>
              </div>
              <p className="text-2xl font-display font-bold text-bone tracking-tight">
                {publishedCount}
              </p>
            </div>
            <div
              className="p-2 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(13,155,138,0.2), rgba(13,155,138,0.08))',
                border: '1px solid rgba(13,155,138,0.3)',
              }}
            >
              <Globe className="h-5 w-5 text-necron-teal" />
            </div>
          </div>
        </motion.div>

        {/* Drafts */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-xl bg-void-light/50 backdrop-blur-sm border border-imperial-gold/15 p-4 group"
          whileHover={{ scale: 1.02, borderColor: 'rgba(245,158,11,0.4)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-l border-t border-imperial-gold/20 group-hover:border-amber-500/50 transition-colors" />
          <span className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-r border-b border-imperial-gold/20 group-hover:border-amber-500/50 transition-colors" />
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Cpu className="h-3 w-3 text-amber-500/40" />
                <span className="text-[10px] font-mono text-amber-500/50 tracking-widest uppercase">
                  BORRADORES
                </span>
              </div>
              <p className="text-2xl font-display font-bold text-bone tracking-tight">
                {draftCount}
              </p>
            </div>
            <div
              className="p-2 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.08))',
                border: '1px solid rgba(245,158,11,0.3)',
              }}
            >
              <FileText className="h-5 w-5 text-amber-500" />
            </div>
          </div>
        </motion.div>

        {/* Pending contributions (admin/lexicanum) */}
        {(isAdmin || isLexicanum) && (
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-xl bg-void-light/50 backdrop-blur-sm border border-imperial-gold/15 p-4 group"
            whileHover={{ scale: 1.02, borderColor: 'rgba(139,0,0,0.4)' }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blood to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-l border-t border-imperial-gold/20 group-hover:border-blood/50 transition-colors" />
            <span className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-r border-b border-imperial-gold/20 group-hover:border-blood/50 transition-colors" />
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Cpu className="h-3 w-3 text-blood/40" />
                  <span className="text-[10px] font-mono text-blood/50 tracking-widest uppercase">
                    PENDIENTES
                  </span>
                </div>
                <p className="text-2xl font-display font-bold text-bone tracking-tight">
                  {pendingContributions}
                </p>
              </div>
              <div
                className="p-2 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,0,0,0.2), rgba(139,0,0,0.08))',
                  border: '1px solid rgba(139,0,0,0.3)',
                }}
              >
                <AlertTriangle className="h-5 w-5 text-blood" />
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ── Filters ── */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-imperial-gold/40" />
          <Input
            type="text"
            placeholder="Buscar articulos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-void border-imperial-gold/20 focus:border-imperial-gold/50 focus:ring-imperial-gold/30 text-bone placeholder:text-bone/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-void-light border border-imperial-gold/20 text-bone font-mono text-sm focus:outline-none focus:ring-2 focus:ring-imperial-gold/30 focus:border-imperial-gold/50 transition-colors"
        >
          <option value="">Todos los estados</option>
          <option value="draft">Borrador</option>
          <option value="published">Publicado</option>
          <option value="archived">Archivado</option>
        </select>
        <select
          value={factionFilter}
          onChange={(e) => setFactionFilter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-void-light border border-imperial-gold/20 text-bone font-mono text-sm focus:outline-none focus:ring-2 focus:ring-imperial-gold/30 focus:border-imperial-gold/50 transition-colors"
        >
          <option value="">Todas las facciones</option>
          {factions.map(f => (
            <option key={f.id} value={f.id}>{f.shortName}</option>
          ))}
        </select>
      </div>

      {/* ── Articles List ── */}
      <motion.div
        className="space-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-void-light/50 border border-imperial-gold/10 animate-pulse"
            />
          ))
        ) : filteredPages.length === 0 ? (
          /* ── Empty state ── */
          <div className="relative text-center py-16 rounded-xl bg-void-light/30 border border-imperial-gold/10">
            <span className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-imperial-gold/15" />
            <span className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-imperial-gold/15" />
            <span className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-imperial-gold/15" />
            <span className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-imperial-gold/15" />

            <motion.div
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(201,162,39,0.1), rgba(201,162,39,0.03))',
                border: '1px solid rgba(201,162,39,0.2)',
              }}
              animate={{
                boxShadow: [
                  '0 0 15px rgba(201,162,39,0.1)',
                  '0 0 30px rgba(201,162,39,0.25)',
                  '0 0 15px rgba(201,162,39,0.1)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <BookOpen className="w-9 h-9 text-imperial-gold/50" />
            </motion.div>

            <h3 className="font-display text-xl font-bold text-bone mb-2">
              El archivo esta vacio
            </h3>
            <p className="font-mono text-sm text-bone/40 mb-8">
              {search
                ? 'No se encontraron resultados para tu busqueda.'
                : 'Las paginas del Lexicanum apareceran aqui.'}
            </p>
            {!search && (
              <Link href="/wiki/nuevo">
                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-imperial-gold/80 to-imperial-gold/60 text-void border border-imperial-gold/30 hover:from-imperial-gold hover:to-imperial-gold/80 shadow-[0_0_20px_rgba(201,162,39,0.2)] hover:shadow-[0_0_30px_rgba(201,162,39,0.4)] transition-all duration-200 active:scale-[0.97]">
                  <Plus className="w-4 h-4" />
                  Crear Articulo
                </button>
              </Link>
            )}
          </div>
        ) : (
          filteredPages.map((page, i) => {
            const faction = factions.find(f => f.id === page.faction_id)
            const StatusIcon = statusIcons[page.status]
            const factionColor = faction?.color ?? '#C9A227'

            return (
              <motion.div
                key={page.id}
                variants={itemVariants}
                className="relative overflow-hidden rounded-xl bg-void-light/50 backdrop-blur-sm border border-imperial-gold/15 p-4 group hover:border-imperial-gold/30 transition-all duration-300"
                whileHover={{
                  scale: 1.005,
                  boxShadow: `0 0 25px ${factionColor}10`,
                }}
              >
                {/* Top glow line (faction color) */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${factionColor}, transparent)`,
                  }}
                />

                {/* Corner brackets */}
                <span className="absolute top-2 left-2 w-2.5 h-2.5 border-l border-t border-imperial-gold/15 group-hover:border-imperial-gold/40 transition-colors" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 border-r border-t border-imperial-gold/15 group-hover:border-imperial-gold/40 transition-colors" />
                <span className="absolute bottom-2 left-2 w-2.5 h-2.5 border-l border-b border-imperial-gold/15 group-hover:border-imperial-gold/40 transition-colors" />
                <span className="absolute bottom-2 right-2 w-2.5 h-2.5 border-r border-b border-imperial-gold/15 group-hover:border-imperial-gold/40 transition-colors" />

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Badges row */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono ${statusColors[page.status]}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {page.status === 'draft'
                          ? 'Borrador'
                          : page.status === 'published'
                            ? 'Publicado'
                            : 'Archivado'}
                      </span>
                      {faction && (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono border"
                          style={{
                            background: `${factionColor}15`,
                            color: factionColor,
                            borderColor: `${factionColor}30`,
                          }}
                        >
                          {faction.shortName}
                        </span>
                      )}
                      {page.category && (
                        <span className="text-[11px] text-bone/40 font-mono">
                          {page.category.name}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-lg font-bold text-bone truncate group-hover:text-white transition-colors">
                      {page.title}
                    </h3>

                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-1.5 text-[11px] text-bone/40 font-mono">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {page.views_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(page.updated_at).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {page.status === 'published' && (
                      <Link href={`/facciones/${page.faction_id}/wiki/${page.slug}`} target="_blank">
                        <button
                          className="p-2 rounded-lg text-bone/50 hover:text-bone hover:bg-imperial-gold/10 transition-all duration-200"
                          title="Ver publicado"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>
                    )}
                    <Link href={`/wiki/${page.id}`}>
                      <button
                        className="p-2 rounded-lg text-bone/50 hover:text-bone hover:bg-imperial-gold/10 transition-all duration-200"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </Link>
                    {page.status === 'draft' && (isAdmin || isLexicanum) && (
                      <button
                        className="p-2 rounded-lg text-bone/50 hover:text-necron-teal hover:bg-necron-teal/10 transition-all duration-200"
                        title="Publicar"
                        onClick={() => handleStatusChange(page.id, 'published')}
                      >
                        <Globe className="w-4 h-4" />
                      </button>
                    )}
                    {page.status === 'published' && (isAdmin || isLexicanum) && (
                      <button
                        className="p-2 rounded-lg text-bone/50 hover:text-amber-400 hover:bg-amber-500/10 transition-all duration-200"
                        title="Archivar"
                        onClick={() => handleStatusChange(page.id, 'archived')}
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                    {(isAdmin || isLexicanum) && (
                      <button
                        className="p-2 rounded-lg text-bone/50 hover:text-blood hover:bg-blood/10 transition-all duration-200"
                        title="Eliminar"
                        onClick={() => handleDelete(page.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </motion.div>
    </div>
  )
}
