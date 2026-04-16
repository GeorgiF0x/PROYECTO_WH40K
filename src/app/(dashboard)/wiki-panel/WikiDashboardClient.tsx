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
import {
  WikiPageBackground,
  GothicCorners,
  ImperialDivider,
  SectionLabel,
} from '@/components/wiki/WikiDecorations'
import type { WikiPage, WikiCategory } from '@/lib/supabase/wiki.types'

interface WikiDashboardClientProps {
  isAdmin: boolean
  isLexicanum: boolean
  currentUserId: string
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

export function WikiDashboardClient({
  isAdmin,
  isLexicanum,
  currentUserId,
}: WikiDashboardClientProps) {
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
      const catRes = await fetch('/api/wiki/categories')
      if (catRes.ok) {
        setCategories(await catRes.json())
      }

      let url = '/api/wiki?limit=50'
      if (statusFilter) url += `&status=${statusFilter}`
      if (factionFilter) url += `&faction_id=${factionFilter}`

      const pagesRes = await fetch(url)
      if (pagesRes.ok) {
        const data = await pagesRes.json()
        setPages(data.pages || [])
      }

      if (isAdmin || isLexicanum) {
        const contribRes = await fetch('/api/wiki/contributions?status=pending&limit=1')
        if (contribRes.ok) {
          const contribData = await contribRes.json()
          setPendingContributions(contribData.total || 0)
        }

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
    ? pages.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    : pages

  const publishedCount = pages.filter((p) => p.status === 'published').length
  const draftCount = pages.filter((p) => p.status === 'draft').length

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
        setPages(pages.filter((p) => p.id !== pageId))
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
    <div className="relative">
      <WikiPageBackground />

      <div className="relative z-10 space-y-6">
        {/* ── Hero Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
          style={{
            background: 'linear-gradient(180deg, rgba(201,162,39,0.06) 0%, rgba(3,3,8,0.5) 100%)',
            border: '1px solid rgba(201,162,39,0.12)',
          }}
        >
          <GothicCorners className="text-imperial-gold/25" size={44} />

          {/* Radial glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(201,162,39,0.08)_0%,transparent_60%)]" />

          <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <SectionLabel icon={Crosshair} className="mb-3">
                ARCHIVO LEXICANUM // GESTION IMPERIAL
              </SectionLabel>
              <div className="mb-2 flex items-center gap-3">
                <h1 className="font-display text-2xl font-bold tracking-wide text-bone sm:text-3xl">
                  Archivo Lexicanum
                </h1>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] tracking-wider"
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
                    color: isAdmin ? '#C9A227' : isLexicanum ? '#0D9B8A' : 'rgba(232,232,240,0.7)',
                    boxShadow: isAdmin
                      ? '0 0 12px rgba(201,162,39,0.2)'
                      : isLexicanum
                        ? '0 0 12px rgba(13,155,138,0.2)'
                        : 'none',
                  }}
                >
                  <Feather className="h-3 w-3" />
                  {isAdmin ? 'ARCHIVISTA' : isLexicanum ? 'LEXICANUM' : 'SCRIBE'}
                </span>
              </div>
              <p className="font-mono text-sm text-bone/40">
                Gestion Imperial del Conocimiento Sagrado
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(isAdmin || isLexicanum) && pendingScribeApps > 0 && (
                <Link href="/wiki-panel/escribas">
                  <motion.button
                    className="relative inline-flex items-center gap-2 rounded-lg border border-imperial-gold/20 bg-void-light/60 px-4 py-2 text-sm font-medium text-bone/80 transition-all duration-200 hover:border-imperial-gold/40 hover:bg-imperial-gold/10 hover:text-bone"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Users className="h-4 w-4 text-amber-400" />
                    Solicitudes
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-void shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                      {pendingScribeApps}
                    </span>
                  </motion.button>
                </Link>
              )}

              {(isAdmin || isLexicanum) && pendingContributions > 0 && (
                <Link href="/wiki-panel/contribuciones">
                  <motion.button
                    className="relative inline-flex items-center gap-2 rounded-lg border border-imperial-gold/20 bg-void-light/60 px-4 py-2 text-sm font-medium text-bone/80 transition-all duration-200 hover:border-imperial-gold/40 hover:bg-imperial-gold/10 hover:text-bone"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    Contribuciones
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blood text-[10px] font-bold text-white shadow-[0_0_8px_rgba(139,0,0,0.5)]">
                      {pendingContributions}
                    </span>
                  </motion.button>
                </Link>
              )}

              <Link href="/wiki-panel/nuevo">
                <motion.button
                  className="inline-flex items-center gap-2 rounded-lg border border-imperial-gold/30 bg-gradient-to-r from-imperial-gold/80 to-imperial-gold/60 px-5 py-2 text-sm font-semibold text-void shadow-[0_0_20px_rgba(201,162,39,0.2)] transition-all duration-200 hover:from-imperial-gold hover:to-imperial-gold/80 hover:shadow-[0_0_30px_rgba(201,162,39,0.4)]"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Plus className="h-4 w-4" />
                  Nuevo Articulo
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── Stats Row ── */}
        <motion.div
          className="grid grid-cols-2 gap-3 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Total Articles */}
          <motion.div
            variants={itemVariants}
            className="group relative overflow-hidden rounded-xl border border-imperial-gold/15 bg-void-light/50 p-4 backdrop-blur-sm"
            whileHover={{ scale: 1.02, borderColor: 'rgba(201,162,39,0.4)' }}
          >
            <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-imperial-gold to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="absolute left-1.5 top-1.5 h-2.5 w-2.5 border-l border-t border-imperial-gold/20 transition-colors group-hover:border-imperial-gold/50" />
            <span className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5 border-b border-r border-imperial-gold/20 transition-colors group-hover:border-imperial-gold/50" />
            {/* Watermark icon */}
            <BookOpen className="absolute bottom-2 right-2 h-10 w-10 text-imperial-gold/[0.04]" />
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-1 flex items-center gap-1.5">
                  <Cpu className="h-3 w-3 text-imperial-gold/40" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-imperial-gold/50">
                    TOTAL
                  </span>
                </div>
                <p className="font-display text-2xl font-bold tracking-tight text-bone">
                  {pages.length}
                </p>
              </div>
              <div
                className="rounded-lg p-2"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(201,162,39,0.2), rgba(201,162,39,0.08))',
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
            className="group relative overflow-hidden rounded-xl border border-imperial-gold/15 bg-void-light/50 p-4 backdrop-blur-sm"
            whileHover={{ scale: 1.02, borderColor: 'rgba(13,155,138,0.4)' }}
          >
            <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-necron-teal to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="absolute left-1.5 top-1.5 h-2.5 w-2.5 border-l border-t border-imperial-gold/20 transition-colors group-hover:border-necron-teal/50" />
            <span className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5 border-b border-r border-imperial-gold/20 transition-colors group-hover:border-necron-teal/50" />
            <Globe className="absolute bottom-2 right-2 h-10 w-10 text-necron-teal/[0.04]" />
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-1 flex items-center gap-1.5">
                  <Cpu className="h-3 w-3 text-necron-teal/40" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-necron-teal/50">
                    PUBLICADOS
                  </span>
                </div>
                <p className="font-display text-2xl font-bold tracking-tight text-bone">
                  {publishedCount}
                </p>
              </div>
              <div
                className="rounded-lg p-2"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(13,155,138,0.2), rgba(13,155,138,0.08))',
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
            className="group relative overflow-hidden rounded-xl border border-imperial-gold/15 bg-void-light/50 p-4 backdrop-blur-sm"
            whileHover={{ scale: 1.02, borderColor: 'rgba(245,158,11,0.4)' }}
          >
            <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="absolute left-1.5 top-1.5 h-2.5 w-2.5 border-l border-t border-imperial-gold/20 transition-colors group-hover:border-amber-500/50" />
            <span className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5 border-b border-r border-imperial-gold/20 transition-colors group-hover:border-amber-500/50" />
            <FileText className="absolute bottom-2 right-2 h-10 w-10 text-amber-500/[0.04]" />
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-1 flex items-center gap-1.5">
                  <Cpu className="h-3 w-3 text-amber-500/40" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-amber-500/50">
                    BORRADORES
                  </span>
                </div>
                <p className="font-display text-2xl font-bold tracking-tight text-bone">
                  {draftCount}
                </p>
              </div>
              <div
                className="rounded-lg p-2"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.08))',
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
              className="group relative overflow-hidden rounded-xl border border-imperial-gold/15 bg-void-light/50 p-4 backdrop-blur-sm"
              whileHover={{ scale: 1.02, borderColor: 'rgba(139,0,0,0.4)' }}
            >
              <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blood to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="absolute left-1.5 top-1.5 h-2.5 w-2.5 border-l border-t border-imperial-gold/20 transition-colors group-hover:border-blood/50" />
              <span className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5 border-b border-r border-imperial-gold/20 transition-colors group-hover:border-blood/50" />
              <AlertTriangle className="absolute bottom-2 right-2 h-10 w-10 text-blood/[0.04]" />
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-1.5">
                    <Cpu className="h-3 w-3 text-blood/40" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-blood/50">
                      PENDIENTES
                    </span>
                  </div>
                  <p className="font-display text-2xl font-bold tracking-tight text-bone">
                    {pendingContributions}
                  </p>
                </div>
                <div
                  className="rounded-lg p-2"
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

        <ImperialDivider />

        {/* ── Filters ── */}
        <div className="relative overflow-hidden rounded-xl border border-imperial-gold/10 bg-void-light/30 p-4 backdrop-blur-sm">
          <GothicCorners className="text-imperial-gold/15" size={20} />
          <div className="relative flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-imperial-gold/40" />
              <Input
                type="text"
                placeholder="Buscar articulos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-imperial-gold/20 bg-void pl-10 text-bone placeholder:text-bone/30 focus:border-imperial-gold/50 focus:ring-imperial-gold/30"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-imperial-gold/20 bg-void-light px-4 py-2 font-mono text-sm text-bone transition-colors focus:border-imperial-gold/50 focus:outline-none focus:ring-2 focus:ring-imperial-gold/30"
            >
              <option value="">Todos los estados</option>
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="archived">Archivado</option>
            </select>
            <select
              value={factionFilter}
              onChange={(e) => setFactionFilter(e.target.value)}
              className="rounded-lg border border-imperial-gold/20 bg-void-light px-4 py-2 font-mono text-sm text-bone transition-colors focus:border-imperial-gold/50 focus:outline-none focus:ring-2 focus:ring-imperial-gold/30"
            >
              <option value="">Todas las facciones</option>
              {factions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.shortName}
                </option>
              ))}
            </select>
          </div>
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
                className="h-24 animate-pulse rounded-xl border border-imperial-gold/10 bg-void-light/50"
              />
            ))
          ) : filteredPages.length === 0 ? (
            /* ── Empty state ── */
            <div className="relative overflow-hidden rounded-2xl border border-imperial-gold/10 bg-void-light/30 py-20 text-center">
              <GothicCorners className="text-imperial-gold/15" size={36} />

              <motion.div
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(201,162,39,0.1), rgba(201,162,39,0.03))',
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
                <BookOpen className="h-9 w-9 text-imperial-gold/50" />
              </motion.div>

              <h3 className="mb-2 font-display text-xl font-bold text-bone">
                El archivo esta vacio
              </h3>
              <p className="mb-8 font-mono text-sm text-bone/40">
                {search
                  ? 'No se encontraron resultados para tu busqueda.'
                  : 'Las paginas del Lexicanum apareceran aqui.'}
              </p>
              {!search && (
                <Link href="/wiki-panel/nuevo">
                  <motion.button
                    className="inline-flex items-center gap-2 rounded-lg border border-imperial-gold/30 bg-gradient-to-r from-imperial-gold/80 to-imperial-gold/60 px-5 py-2.5 text-sm font-semibold text-void shadow-[0_0_20px_rgba(201,162,39,0.2)] transition-all duration-200 hover:from-imperial-gold hover:to-imperial-gold/80 hover:shadow-[0_0_30px_rgba(201,162,39,0.4)]"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Plus className="h-4 w-4" />
                    Crear Articulo
                  </motion.button>
                </Link>
              )}
            </div>
          ) : (
            filteredPages.map((page) => {
              const faction = factions.find((f) => f.id === page.faction_id)
              const StatusIcon = statusIcons[page.status]
              const factionColor = faction?.color ?? '#C9A227'

              return (
                <motion.div
                  key={page.id}
                  variants={itemVariants}
                  className="group relative overflow-hidden rounded-xl border border-imperial-gold/15 bg-void-light/50 backdrop-blur-sm transition-all duration-300 hover:border-imperial-gold/30"
                  whileHover={{
                    scale: 1.005,
                    y: -2,
                    boxShadow: `0 4px 25px ${factionColor}10`,
                  }}
                >
                  {/* Faction color accent stripe */}
                  <div
                    className="absolute bottom-0 left-0 top-0 w-[3px]"
                    style={{
                      background: `linear-gradient(180deg, ${factionColor}, ${factionColor}40)`,
                    }}
                  />

                  {/* Top glow line (faction color) */}
                  <div
                    className="absolute left-0 right-0 top-0 h-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${factionColor}, transparent)`,
                    }}
                  />

                  <GothicCorners
                    className="text-imperial-gold/10 transition-colors group-hover:text-imperial-gold/25"
                    size={18}
                  />

                  <div className="flex flex-col gap-4 p-4 pl-5 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      {/* Badges row */}
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[11px] ${statusColors[page.status]}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {page.status === 'draft'
                            ? 'Borrador'
                            : page.status === 'published'
                              ? 'Publicado'
                              : 'Archivado'}
                        </span>
                        {faction && (
                          <span
                            className="inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[11px]"
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
                          <span className="font-mono text-[11px] text-bone/40">
                            {page.category.name}
                          </span>
                        )}
                      </div>

                      {/* Title + excerpt */}
                      <h3 className="truncate font-display text-lg font-bold text-bone transition-colors group-hover:text-white">
                        {page.title}
                      </h3>
                      {page.excerpt && (
                        <p className="mt-1 line-clamp-2 font-body text-sm text-bone/40">
                          {page.excerpt}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="mt-2 flex items-center gap-4 font-mono text-[11px] text-bone/40">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {page.views_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(page.updated_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 transition-all duration-200 sm:translate-x-2 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100">
                      {page.status === 'published' && (
                        <Link href={`/wiki/${page.faction_id}/${page.slug}`} target="_blank">
                          <button
                            className="rounded-lg p-2 text-bone/50 transition-all duration-200 hover:bg-imperial-gold/10 hover:text-bone"
                            title="Ver publicado"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </Link>
                      )}
                      {(isAdmin || isLexicanum || page.author_id === currentUserId) && (
                        <Link href={`/wiki-panel/${page.id}`}>
                          <button
                            className="rounded-lg p-2 text-bone/50 transition-all duration-200 hover:bg-imperial-gold/10 hover:text-bone"
                            title="Editar"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </Link>
                      )}
                      {page.status === 'draft' && (isAdmin || isLexicanum) && (
                        <button
                          className="rounded-lg p-2 text-bone/50 transition-all duration-200 hover:bg-necron-teal/10 hover:text-necron-teal"
                          title="Publicar"
                          onClick={() => handleStatusChange(page.id, 'published')}
                        >
                          <Globe className="h-4 w-4" />
                        </button>
                      )}
                      {page.status === 'published' && (isAdmin || isLexicanum) && (
                        <button
                          className="rounded-lg p-2 text-bone/50 transition-all duration-200 hover:bg-amber-500/10 hover:text-amber-400"
                          title="Archivar"
                          onClick={() => handleStatusChange(page.id, 'archived')}
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          className="rounded-lg p-2 text-bone/50 transition-all duration-200 hover:bg-blood/10 hover:text-blood"
                          title="Eliminar"
                          onClick={() => handleDelete(page.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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
    </div>
  )
}
