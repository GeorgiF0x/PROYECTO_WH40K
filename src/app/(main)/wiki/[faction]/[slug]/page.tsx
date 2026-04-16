'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import {
  ChevronLeft,
  Eye,
  Calendar,
  User,
  BookOpen,
  Share2,
  Clock,
  Hash,
  ExternalLink,
  Copy,
  Check,
  X,
  ChevronRight,
  List,
  ArrowUp,
} from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { getFactionById } from '@/lib/data'
import { getFactionTheme } from '@/lib/faction-themes'

import { WikiRenderer } from '@/components/wiki'
import { GothicCorners } from '@/components/wiki/WikiDecorations'
import { Button } from '@/components/ui/Button'
import type { WikiPage } from '@/lib/supabase/wiki.types'

/* ─────────────────── Helpers ─────────────────── */

interface TocEntry {
  id: string
  text: string
  level: number
}

function extractToc(content: unknown): TocEntry[] {
  if (!Array.isArray(content)) return []
  const entries: TocEntry[] = []
  for (const block of content) {
    if (block?.type === 'heading' && block.props?.level && Array.isArray(block.content)) {
      const text = block.content.map((c: { text?: string }) => c.text || '').join('')
      if (text.trim()) {
        entries.push({
          id:
            block.id ||
            text
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, ''),
          text: text.trim(),
          level: block.props.level,
        })
      }
    }
  }
  return entries
}

function getReadingTime(content: unknown): number {
  if (!content) return 1
  const blocks = Array.isArray(content) ? content : []
  const wordCount = blocks.reduce((acc: number, block: Record<string, unknown>) => {
    if (typeof block === 'object' && block !== null && 'content' in block) {
      const c = block.content
      if (Array.isArray(c)) {
        return (
          acc +
          c.reduce((a: number, item: Record<string, unknown>) => {
            return a + (typeof item.text === 'string' ? item.text.split(/\s+/).length : 0)
          }, 0)
        )
      }
    }
    return acc + 15
  }, 0)
  return Math.max(1, Math.ceil(wordCount / 200))
}

/* ─────────────────── Gallery Lightbox ─────────────────── */

function GalleryLightbox({
  images,
  activeIndex,
  onClose,
  onNav,
  factionColor,
}: {
  images: string[]
  activeIndex: number
  onClose: () => void
  onNav: (dir: -1 | 1) => void
  factionColor: string
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onNav(-1)
      if (e.key === 'ArrowRight') onNav(1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, onNav])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-void/95 backdrop-blur-xl"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-6 top-6 z-10 rounded-full bg-bone/10 p-2 transition-colors hover:bg-bone/20"
      >
        <X className="h-6 w-6 text-bone/80" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onNav(-1)
            }}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-bone/10 p-3 transition-colors hover:bg-bone/20"
          >
            <ChevronLeft className="h-6 w-6 text-bone/80" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onNav(1)
            }}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-bone/10 p-3 transition-colors hover:bg-bone/20"
          >
            <ChevronRight className="h-6 w-6 text-bone/80" />
          </button>
        </>
      )}

      <motion.div
        key={activeIndex}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative max-h-[85vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[activeIndex]}
          alt={`Imagen ${activeIndex + 1}`}
          width={1200}
          height={800}
          className="max-h-[85vh] rounded-lg object-contain"
          style={{ boxShadow: `0 0 60px ${factionColor}30` }}
        />
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1">
          <span className="rounded-full bg-void/80 px-3 py-1 font-mono text-xs text-bone/60">
            {activeIndex + 1} / {images.length}
          </span>
          <span className="max-w-[60vw] truncate rounded-lg bg-void/70 px-3 py-1 font-body text-[11px] text-bone/50">
            Imagen {activeIndex + 1} de {images.length}
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─────────────────── Mobile TOC Drawer ─────────────────── */

function MobileTocDrawer({
  entries,
  factionColor,
  activeId,
  isOpen,
  onClose,
}: {
  entries: TocEntry[]
  factionColor: string
  activeId: string | null
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen || entries.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 xl:hidden"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" />
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        exit={{ x: -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="absolute bottom-0 left-0 top-0 w-72 overflow-y-auto p-6 pt-20"
        style={{
          background: 'rgba(10,10,18,0.98)',
          borderRight: `1px solid ${factionColor}20`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center gap-2">
          <Hash className="h-3.5 w-3.5" style={{ color: `${factionColor}80` }} />
          <span
            className="font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: `${factionColor}60` }}
          >
            CONTENIDO
          </span>
          <button
            onClick={onClose}
            className="ml-auto rounded p-1 transition-colors hover:bg-bone/10"
          >
            <X className="h-4 w-4 text-bone/40" />
          </button>
        </div>

        <nav className="space-y-1">
          {entries.map((entry) => (
            <a
              key={entry.id}
              href={`#${entry.id}`}
              onClick={onClose}
              className="group flex items-center gap-2.5 py-2 transition-all duration-200"
              style={{ paddingLeft: `${(entry.level - 1) * 14}px` }}
            >
              <div
                className="h-4 w-[3px] shrink-0 rounded-full transition-all duration-200"
                style={{
                  background: activeId === entry.id ? factionColor : `${factionColor}20`,
                  boxShadow: activeId === entry.id ? `0 0 8px ${factionColor}50` : 'none',
                }}
              />
              <span
                className="line-clamp-2 text-sm leading-tight transition-colors duration-200"
                style={{
                  color: activeId === entry.id ? factionColor : 'rgba(232,232,240,0.5)',
                }}
              >
                {entry.text}
              </span>
            </a>
          ))}
        </nav>
      </motion.div>
    </motion.div>
  )
}

/* ─────────────────── Desktop TOC ─────────────────── */

function DesktopTableOfContents({
  entries,
  factionColor,
  activeId,
}: {
  entries: TocEntry[]
  factionColor: string
  activeId: string | null
}) {
  if (entries.length === 0) return null

  return (
    <nav className="space-y-0.5">
      <div
        className="mb-4 flex items-center gap-2 pb-3"
        style={{ borderBottom: `1px solid ${factionColor}15` }}
      >
        <Hash className="h-3 w-3" style={{ color: `${factionColor}60` }} />
        <span
          className="font-mono text-[9px] uppercase tracking-[0.3em]"
          style={{ color: `${factionColor}60` }}
        >
          CONTENIDO
        </span>
      </div>
      {entries.map((entry) => (
        <a
          key={entry.id}
          href={`#${entry.id}`}
          className="group flex items-center gap-2 py-1.5 transition-all duration-200"
          style={{ paddingLeft: `${(entry.level - 1) * 12}px` }}
        >
          <div
            className="h-4 w-[3px] shrink-0 rounded-full transition-all duration-200"
            style={{
              background: activeId === entry.id ? factionColor : `${factionColor}15`,
              boxShadow: activeId === entry.id ? `0 0 8px ${factionColor}50` : 'none',
            }}
          />
          <span
            className="line-clamp-2 text-xs leading-tight transition-colors duration-200"
            style={{
              color: activeId === entry.id ? factionColor : 'rgba(232,232,240,0.4)',
            }}
          >
            {entry.text}
          </span>
        </a>
      ))}
    </nav>
  )
}

/* ─────────────────── Floating Action Bar ─────────────────── */

function FloatingActionBar({
  factionColor,
  onShare,
  copiedLink,
  showScrollTop,
  tocCount,
  onOpenToc,
}: {
  factionColor: string
  onShare: () => void
  copiedLink: boolean
  showScrollTop: boolean
  tocCount: number
  onOpenToc: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-full px-2 py-2"
      style={{
        background: 'rgba(10,10,18,0.9)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${factionColor}20`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${factionColor}08`,
      }}
    >
      {/* TOC toggle — mobile only */}
      {tocCount > 0 && (
        <button
          onClick={onOpenToc}
          className="flex items-center gap-1.5 rounded-full px-3 py-2 font-mono text-xs transition-all hover:bg-bone/10 xl:hidden"
          style={{ color: `${factionColor}90` }}
        >
          <List className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Indice</span>
        </button>
      )}

      {/* Share */}
      <button
        onClick={onShare}
        className="flex items-center gap-1.5 rounded-full px-3 py-2 font-mono text-xs transition-all hover:bg-bone/10"
        style={{ color: copiedLink ? factionColor : 'rgba(232,232,240,0.5)' }}
      >
        {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
        <span className="hidden sm:inline">{copiedLink ? 'Copiado' : 'Compartir'}</span>
      </button>

      {/* Separator */}
      <div className="h-4 w-px" style={{ background: `${factionColor}20` }} />

      {/* Copy link */}
      <button
        onClick={onShare}
        className="flex items-center gap-1.5 rounded-full px-3 py-2 font-mono text-xs text-bone/40 transition-all hover:bg-bone/10"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>

      {/* Scroll top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-1.5 overflow-hidden rounded-full px-3 py-2 font-mono text-xs transition-all"
            style={{ background: `${factionColor}20`, color: factionColor }}
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════ */

export default function WikiArticlePage() {
  const params = useParams()
  const factionId = params.faction as string
  const slug = params.slug as string
  const faction = getFactionById(factionId)
  const theme = getFactionTheme(factionId)

  const [page, setPage] = useState<WikiPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [activeTocId, setActiveTocId] = useState<string | null>(null)
  const [tocOpen, setTocOpen] = useState(false)

  const { scrollYProgress } = useScroll()
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  const toc = useMemo(() => (page ? extractToc(page.content) : []), [page])

  useEffect(() => {
    loadPage()
  }, [factionId, slug])

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Track active heading for ToC
  useEffect(() => {
    if (toc.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveTocId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px' }
    )
    for (const entry of toc) {
      const el = document.getElementById(entry.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [toc])

  async function loadPage() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/wiki/${factionId}--${slug}`)
      if (!res.ok) {
        setError(res.status === 404 ? 'Articulo no encontrado' : 'Error al cargar el articulo')
        return
      }
      setPage(await res.json())
    } catch {
      setError('Error al cargar el articulo')
    } finally {
      setLoading(false)
    }
  }

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: page?.title, url })
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const handleLightboxNav = useCallback(
    (dir: -1 | 1) => {
      if (lightboxIndex === null || !page?.gallery_images) return
      const len = page.gallery_images.length
      setLightboxIndex((lightboxIndex + dir + len) % len)
    },
    [lightboxIndex, page?.gallery_images]
  )

  const handleLightboxClose = useCallback(() => setLightboxIndex(null), [])

  /* ── Error / Not Found States ── */

  if (!faction) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-void">
        <div className="noise-overlay" />
        <div className="text-center">
          <h1 className="mb-4 font-display text-4xl text-white">Faccion no encontrada</h1>
          <Link href="/facciones" className="text-imperial-gold hover:underline">
            Volver a facciones
          </Link>
        </div>
      </main>
    )
  }

  const fc = faction.color
  const bgColor = theme?.cssVars['--faction-bg'] || '#030308'
  const secondaryColor = theme?.colors.secondary || fc
  const glowColor = theme?.colors.glow || fc

  if (loading) {
    return (
      <main className="relative min-h-screen" style={{ background: bgColor }}>
        <div className="noise-overlay" />
        <Navigation />
        <div className="pb-16 pt-28">
          <div className="mx-auto max-w-3xl px-6">
            <div className="space-y-6">
              <div className="h-6 w-40 animate-pulse rounded" style={{ background: `${fc}15` }} />
              <div className="h-12 w-3/4 animate-pulse rounded" style={{ background: `${fc}10` }} />
              <div className="h-5 w-1/2 animate-pulse rounded" style={{ background: `${fc}08` }} />
              <div
                className="h-[35vh] animate-pulse rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, ${fc}08 0%, ${secondaryColor}05 50%, ${fc}08 100%)`,
                  border: `1px solid ${fc}10`,
                }}
              />
              <div className="space-y-3 pt-4">
                {[1, 0.85, 0.7, 0.9, 0.6, 0.95, 0.75].map((w, i) => (
                  <div
                    key={i}
                    className="h-4 animate-pulse rounded"
                    style={{
                      width: `${w * 100}%`,
                      background: `${fc}08`,
                      animationDelay: `${i * 0.08}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !page) {
    return (
      <main className="relative min-h-screen" style={{ background: bgColor }}>
        <div className="noise-overlay" />
        <Navigation />
        <div className="flex min-h-[60vh] items-center justify-center pb-16 pt-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
              style={{ background: `${fc}10`, border: `1px solid ${fc}20` }}
            >
              <BookOpen className="h-10 w-10" style={{ color: `${fc}40` }} />
            </div>
            <h1 className="mb-4 font-display text-3xl text-white">{error}</h1>
            <p className="mb-8 font-body text-bone/60">
              El articulo que buscas no existe o ha sido eliminado.
            </p>
            <Link href={`/wiki/${factionId}`}>
              <Button variant="outline">Volver a la Wiki</Button>
            </Link>
          </motion.div>
        </div>
        <Footer />
      </main>
    )
  }

  const readingTime = getReadingTime(page.content)

  return (
    <main className="relative min-h-screen" style={{ background: bgColor }}>
      <div className="noise-overlay" />

      {/* ── Reading Progress Bar ── */}
      <motion.div
        className="fixed left-0 right-0 top-0 z-50 h-[2px] origin-left"
        style={{
          scaleX,
          background: theme?.gradients.border || `linear-gradient(90deg, ${fc}, ${glowColor})`,
          boxShadow: `0 0 12px ${fc}60`,
        }}
      />

      {/* ── Ambient Background ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -left-[30%] -top-[40%] h-[80%] w-[80%] rounded-full opacity-[0.03] blur-[150px]"
          style={{ background: fc }}
        />
        <div
          className="absolute -bottom-[40%] -right-[30%] h-[70%] w-[70%] rounded-full opacity-[0.02] blur-[130px]"
          style={{ background: secondaryColor }}
        />
      </div>

      <Navigation />

      {/* ══════════════════════════════════════════
          HEADER — Editorial: title block, then feature image
         ══════════════════════════════════════════ */}
      <section className="relative pb-0 pt-28">
        {/* Subtle faction glow behind header area */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full opacity-[0.06] blur-[120px]"
          style={{ background: fc }}
        />

        <div className="relative mx-auto max-w-3xl px-6">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 font-body text-xs text-bone/40">
            <Link href={`/facciones/${factionId}`} className="transition-colors hover:text-bone/70">
              {faction.shortName}
            </Link>
            <ChevronRight className="h-3 w-3" style={{ color: `${fc}30` }} />
            <Link href={`/wiki/${factionId}`} className="transition-colors hover:text-bone/70">
              Wiki
            </Link>
            {page.category && (
              <>
                <ChevronRight className="h-3 w-3" style={{ color: `${fc}30` }} />
                <span style={{ color: `${fc}70` }}>{page.category.name}</span>
              </>
            )}
          </nav>

          {/* Title */}
          <h1
            className="mb-5 font-display text-3xl font-black leading-[0.95] sm:text-4xl md:text-5xl lg:text-6xl"
            style={{
              background: theme?.gradients.text || `linear-gradient(90deg, ${fc}, ${glowColor})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: `drop-shadow(0 2px 20px ${fc}25)`,
            }}
          >
            {page.title}
          </h1>

          {/* Excerpt */}
          {page.excerpt && (
            <p className="mb-6 max-w-2xl font-body text-base leading-relaxed text-bone/55 sm:text-lg">
              {page.excerpt}
            </p>
          )}

          {/* Meta row */}
          <div className="mb-8 flex flex-wrap items-center gap-3">
            {page.author && (
              <Link
                href={page.author.username ? `/usuarios/${page.author.username}` : '#'}
                className="flex items-center gap-2 rounded-full px-3 py-1.5 font-body text-sm transition-all hover:scale-[1.03]"
                style={{
                  background: `${fc}15`,
                  border: `1px solid ${fc}20`,
                  color: 'rgba(232,232,240,0.8)',
                }}
              >
                <div
                  className="flex h-5 w-5 items-center justify-center rounded-full"
                  style={{ background: `${fc}30` }}
                >
                  <User className="h-2.5 w-2.5" style={{ color: fc }} />
                </div>
                {page.author.display_name || page.author.username}
              </Link>
            )}

            <div className="flex items-center gap-3 font-mono text-xs text-bone/35">
              {page.published_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" style={{ color: `${fc}50` }} />
                  {new Date(page.published_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" style={{ color: `${fc}50` }} />
                {readingTime} min
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-3 w-3" style={{ color: `${fc}50` }} />
                {page.views_count}
              </span>
            </div>
          </div>
        </div>

        {/* Feature Image — full width, natural aspect ratio */}
        {page.hero_image && (
          <div className="mx-auto max-w-5xl px-6">
            <div
              className="relative overflow-hidden rounded-2xl"
              style={{
                border: `1px solid ${fc}15`,
                boxShadow: `0 8px 40px rgba(0,0,0,0.4), 0 0 30px ${fc}08`,
              }}
            >
              <div className="relative w-full" style={{ aspectRatio: '16 / 9', maxHeight: '65vh' }}>
                <Image
                  src={page.hero_image}
                  alt={page.title}
                  fill
                  priority
                  className="object-cover"
                />
                {/* Subtle vignette */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(3,3,8,0.3)_100%)]" />
                {/* Faction tint — very subtle */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${fc}08 0%, transparent 60%, ${secondaryColor}05 100%)`,
                  }}
                />
              </div>
              {/* Bottom glow line */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[2px]"
                style={{
                  background:
                    theme?.gradients.border ||
                    `linear-gradient(90deg, transparent, ${fc}, transparent)`,
                  boxShadow: `0 0 12px ${fc}20`,
                }}
              />
            </div>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════
          CONTENT SECTION — Clean reading zone with sticky TOC
         ══════════════════════════════════════════ */}
      <section className="relative py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-10">
            {/* ── Sticky Sidebar TOC (desktop) ── */}
            {toc.length > 0 && (
              <aside className="hidden w-52 shrink-0 xl:block">
                <div className="sticky top-20 space-y-6">
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background: `${fc}04`,
                      border: `1px solid ${fc}08`,
                    }}
                  >
                    <DesktopTableOfContents
                      entries={toc}
                      factionColor={fc}
                      activeId={activeTocId}
                    />
                  </div>

                  {/* Author mini-card in sidebar */}
                  {page.author && (
                    <Link
                      href={page.author.username ? `/usuarios/${page.author.username}` : '#'}
                      className="flex items-center gap-3 rounded-lg p-3 transition-all hover:bg-bone/5"
                      style={{ border: `1px solid ${fc}08` }}
                    >
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                        style={{ background: `${fc}20` }}
                      >
                        <User className="h-3.5 w-3.5" style={{ color: fc }} />
                      </div>
                      <div className="min-w-0">
                        <span className="block font-mono text-[9px] uppercase tracking-wider text-bone/30">
                          Escrito por
                        </span>
                        <span className="block truncate text-xs text-bone/70">
                          {page.author.display_name || page.author.username}
                        </span>
                      </div>
                    </Link>
                  )}
                </div>
              </aside>
            )}

            {/* ── Main Content Column ── */}
            <div className="mx-auto min-w-0 max-w-3xl flex-1">
              {/* Content container — clean, high contrast */}
              <div
                className="relative overflow-hidden rounded-2xl"
                style={{ border: `1px solid ${fc}0A` }}
              >
                {/* Top header bar */}
                <div
                  className="flex items-center gap-3 px-6 py-3"
                  style={{
                    background: `${fc}08`,
                    borderBottom: `1px solid ${fc}0D`,
                  }}
                >
                  <BookOpen className="h-3.5 w-3.5" style={{ color: `${fc}60` }} />
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.3em]"
                    style={{ color: `${fc}40` }}
                  >
                    REGISTRO IMPERIAL
                  </span>
                  <div className="flex-1" />
                  {page.category && (
                    <span
                      className="rounded px-2 py-0.5 font-mono text-[10px]"
                      style={{ background: `${fc}10`, color: `${fc}60` }}
                    >
                      {page.category.name}
                    </span>
                  )}
                </div>

                {/* Article body — clean reading surface */}
                <div
                  className="px-6 py-8 sm:px-10 sm:py-10"
                  style={{
                    background: `linear-gradient(180deg, ${fc}03 0%, transparent 20%)`,
                  }}
                >
                  <GothicCorners className="text-imperial-gold/8" size={24} />

                  <WikiRenderer content={page.content} factionColor={fc} />
                </div>
              </div>

              {/* ── Back + Actions Row ── */}
              <div
                className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-6"
                style={{ borderTop: `1px solid ${fc}10` }}
              >
                <Link href={`/wiki/${factionId}`}>
                  <button className="flex items-center gap-2 font-body text-sm text-bone/40 transition-colors hover:text-bone/70">
                    <ChevronLeft className="h-4 w-4" />
                    Volver a la Wiki
                  </button>
                </Link>

                {page.author && page.author.username && (
                  <Link
                    href={`/usuarios/${page.author.username}`}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-xs transition-all hover:bg-bone/5 xl:hidden"
                    style={{ color: `${fc}60`, border: `1px solid ${fc}12` }}
                  >
                    <User className="h-3 w-3" />
                    {page.author.display_name || page.author.username}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>

              {/* ── Gallery Section ── */}
              {page.gallery_images && page.gallery_images.length > 0 && (
                <div className="mt-12">
                  {/* Section divider */}
                  <div className="mb-8 flex items-center gap-4">
                    <div
                      className="h-px flex-1"
                      style={{
                        background: `linear-gradient(to right, transparent, ${fc}25, transparent)`,
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rotate-45" style={{ background: `${fc}40` }} />
                      <Eye className="h-4 w-4" style={{ color: `${fc}40` }} />
                      <div className="h-1.5 w-1.5 rotate-45" style={{ background: `${fc}40` }} />
                    </div>
                    <div
                      className="h-px flex-1"
                      style={{
                        background: `linear-gradient(to right, transparent, ${fc}25, transparent)`,
                      }}
                    />
                  </div>

                  <div className="mb-6 flex items-center gap-3">
                    <span
                      className="font-mono text-[9px] uppercase tracking-[0.3em]"
                      style={{ color: `${fc}50` }}
                    >
                      ARCHIVOS PICTOGRAFICOS
                    </span>
                    <span className="font-mono text-[10px] text-bone/20">
                      {page.gallery_images.length} imagenes
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {page.gallery_images.map((img, i) => (
                      <motion.button
                        key={i}
                        type="button"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.04 }}
                        className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl"
                        style={{ border: `1px solid ${fc}10` }}
                        onClick={() => setLightboxIndex(i)}
                      >
                        <Image
                          src={img}
                          alt={`${page.title} - imagen ${i + 1}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Hover overlay */}
                        <div
                          className="absolute inset-0 flex flex-col items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100"
                          style={{ background: `${fc}30` }}
                        >
                          <div
                            className="mb-2 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-sm"
                            style={{ background: `${fc}40`, border: `1px solid ${fc}60` }}
                          >
                            <Eye className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        {/* Label overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-void/90 via-void/60 to-transparent px-3 py-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <p className="truncate font-mono text-[11px] text-bone/80">
                            {page.title} — Img {i + 1}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Floating Action Bar ── */}
      <FloatingActionBar
        factionColor={fc}
        onShare={handleShare}
        copiedLink={copiedLink}
        showScrollTop={showScrollTop}
        tocCount={toc.length}
        onOpenToc={() => setTocOpen(true)}
      />

      {/* ── Mobile TOC Drawer ── */}
      <AnimatePresence>
        <MobileTocDrawer
          entries={toc}
          factionColor={fc}
          activeId={activeTocId}
          isOpen={tocOpen}
          onClose={() => setTocOpen(false)}
        />
      </AnimatePresence>

      {/* ── Gallery Lightbox ── */}
      <AnimatePresence>
        {lightboxIndex !== null && page.gallery_images && (
          <GalleryLightbox
            images={page.gallery_images}
            activeIndex={lightboxIndex}
            onClose={handleLightboxClose}
            onNav={handleLightboxNav}
            factionColor={fc}
          />
        )}
      </AnimatePresence>

      <Footer />
    </main>
  )
}
