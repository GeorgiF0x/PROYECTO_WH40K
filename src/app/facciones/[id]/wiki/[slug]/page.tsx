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
  ChevronUp,
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
import { FactionSymbol } from '@/components/faction'
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
          id: block.id || text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
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
        return acc + c.reduce((a: number, item: Record<string, unknown>) => {
          return a + (typeof item.text === 'string' ? item.text.split(/\s+/).length : 0)
        }, 0)
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
      className="fixed inset-0 z-[100] bg-void/95 backdrop-blur-xl flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full bg-bone/10 hover:bg-bone/20 transition-colors z-10"
      >
        <X className="w-6 h-6 text-bone/80" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onNav(-1) }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-bone/10 hover:bg-bone/20 transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6 text-bone/80" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNav(1) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-bone/10 hover:bg-bone/20 transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6 text-bone/80" />
          </button>
        </>
      )}

      <motion.div
        key={activeIndex}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative max-w-[90vw] max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[activeIndex]}
          alt={`Imagen ${activeIndex + 1}`}
          width={1200}
          height={800}
          className="object-contain max-h-[85vh] rounded-lg"
          style={{ boxShadow: `0 0 60px ${factionColor}30` }}
        />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-void/80 text-xs text-bone/60 font-mono">
          {activeIndex + 1} / {images.length}
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
        className="absolute left-0 top-0 bottom-0 w-72 p-6 pt-20 overflow-y-auto"
        style={{
          background: 'rgba(10,10,18,0.98)',
          borderRight: `1px solid ${factionColor}20`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-6">
          <Hash className="w-3.5 h-3.5" style={{ color: `${factionColor}80` }} />
          <span
            className="text-[10px] font-mono tracking-[0.3em] uppercase"
            style={{ color: `${factionColor}60` }}
          >
            CONTENIDO
          </span>
          <button
            onClick={onClose}
            className="ml-auto p-1 rounded hover:bg-bone/10 transition-colors"
          >
            <X className="w-4 h-4 text-bone/40" />
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
                className="w-[3px] h-4 rounded-full shrink-0 transition-all duration-200"
                style={{
                  background: activeId === entry.id ? factionColor : `${factionColor}20`,
                  boxShadow: activeId === entry.id ? `0 0 8px ${factionColor}50` : 'none',
                }}
              />
              <span
                className="text-sm leading-tight transition-colors duration-200 line-clamp-2"
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
      <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: `1px solid ${factionColor}15` }}>
        <Hash className="w-3 h-3" style={{ color: `${factionColor}60` }} />
        <span
          className="text-[9px] font-mono tracking-[0.3em] uppercase"
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
            className="w-[3px] h-4 rounded-full shrink-0 transition-all duration-200"
            style={{
              background: activeId === entry.id ? factionColor : `${factionColor}15`,
              boxShadow: activeId === entry.id ? `0 0 8px ${factionColor}50` : 'none',
            }}
          />
          <span
            className="text-xs leading-tight transition-colors duration-200 line-clamp-2"
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
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 px-2 py-2 rounded-full"
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
          className="xl:hidden flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-mono transition-all hover:bg-bone/10"
          style={{ color: `${factionColor}90` }}
        >
          <List className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Indice</span>
        </button>
      )}

      {/* Share */}
      <button
        onClick={onShare}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-mono transition-all hover:bg-bone/10"
        style={{ color: copiedLink ? factionColor : 'rgba(232,232,240,0.5)' }}
      >
        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">{copiedLink ? 'Copiado' : 'Compartir'}</span>
      </button>

      {/* Separator */}
      <div className="w-px h-4" style={{ background: `${factionColor}20` }} />

      {/* Copy link */}
      <button
        onClick={onShare}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-mono transition-all hover:bg-bone/10 text-bone/40"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>

      {/* Scroll top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-mono transition-all overflow-hidden"
            style={{ background: `${factionColor}20`, color: factionColor }}
          >
            <ArrowUp className="w-3.5 h-3.5" />
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
  const factionId = params.id as string
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
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])

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
      try { await navigator.share({ title: page?.title, url }) } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const handleLightboxNav = useCallback((dir: -1 | 1) => {
    if (lightboxIndex === null || !page?.gallery_images) return
    const len = page.gallery_images.length
    setLightboxIndex((lightboxIndex + dir + len) % len)
  }, [lightboxIndex, page?.gallery_images])

  const handleLightboxClose = useCallback(() => setLightboxIndex(null), [])

  /* ── Error / Not Found States ── */

  if (!faction) {
    return (
      <main className="min-h-screen bg-void flex items-center justify-center">
        <div className="noise-overlay" />
        <div className="text-center">
          <h1 className="font-display text-4xl text-white mb-4">Faccion no encontrada</h1>
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
        <div className="pt-28 pb-16">
          <div className="max-w-3xl mx-auto px-6">
            <div className="space-y-6">
              <div className="h-6 w-40 rounded animate-pulse" style={{ background: `${fc}15` }} />
              <div className="h-12 w-3/4 rounded animate-pulse" style={{ background: `${fc}10` }} />
              <div className="h-5 w-1/2 rounded animate-pulse" style={{ background: `${fc}08` }} />
              <div
                className="h-[35vh] rounded-2xl animate-pulse"
                style={{
                  background: `linear-gradient(135deg, ${fc}08 0%, ${secondaryColor}05 50%, ${fc}08 100%)`,
                  border: `1px solid ${fc}10`,
                }}
              />
              <div className="space-y-3 pt-4">
                {[1, 0.85, 0.7, 0.9, 0.6, 0.95, 0.75].map((w, i) => (
                  <div
                    key={i}
                    className="h-4 rounded animate-pulse"
                    style={{ width: `${w * 100}%`, background: `${fc}08`, animationDelay: `${i * 0.08}s` }}
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
        <div className="pt-28 pb-16 flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div
              className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
              style={{ background: `${fc}10`, border: `1px solid ${fc}20` }}
            >
              <BookOpen className="w-10 h-10" style={{ color: `${fc}40` }} />
            </div>
            <h1 className="font-display text-3xl text-white mb-4">{error}</h1>
            <p className="font-body text-bone/60 mb-8">
              El articulo que buscas no existe o ha sido eliminado.
            </p>
            <Link href={`/facciones/${factionId}/wiki`}>
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
        className="fixed top-0 left-0 right-0 h-[2px] z-50 origin-left"
        style={{
          scaleX,
          background: theme?.gradients.border || `linear-gradient(90deg, ${fc}, ${glowColor})`,
          boxShadow: `0 0 12px ${fc}60`,
        }}
      />

      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-[40%] -left-[30%] w-[80%] h-[80%] rounded-full blur-[150px] opacity-[0.03]"
          style={{ background: fc }}
        />
        <div
          className="absolute -bottom-[40%] -right-[30%] w-[70%] h-[70%] rounded-full blur-[130px] opacity-[0.02]"
          style={{ background: secondaryColor }}
        />
      </div>

      <Navigation />

      {/* ══════════════════════════════════════════
          HERO — Compact, cinematic, content-first
         ══════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ minHeight: page.hero_image ? '45vh' : '32vh', maxHeight: '50vh' }}
      >
        {/* Hero Image */}
        {page.hero_image && (
          <div className="absolute inset-0">
            <Image
              src={page.hero_image}
              alt={page.title}
              fill
              priority
              className="object-cover"
            />
            {/* Gradient overlays — push content readable zone to bottom */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg,
                  ${bgColor} 0%,
                  ${bgColor}80 15%,
                  transparent 40%,
                  ${bgColor}60 70%,
                  ${bgColor} 100%
                )`,
              }}
            />
            {/* Faction tint */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${fc}12 0%, transparent 60%, ${secondaryColor}08 100%)`,
              }}
            />
            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(3,3,8,0.5)_100%)]" />
          </div>
        )}

        {/* Faction Symbol watermark */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
          style={{ opacity: heroOpacity }}
        >
          <div className="opacity-[0.04]" style={{ transform: 'scale(4)' }}>
            <FactionSymbol factionId={faction.id} size="xl" animated={false} />
          </div>
        </motion.div>

        {/* Hero Content — anchored to bottom */}
        <div className="relative flex items-end" style={{ minHeight: page.hero_image ? '45vh' : '32vh', maxHeight: '50vh' }}>
          <div className="w-full max-w-3xl mx-auto px-6 pb-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 font-body text-xs text-bone/40 mb-4">
              <Link href={`/facciones/${factionId}`} className="hover:text-bone/70 transition-colors">
                {faction.shortName}
              </Link>
              <ChevronRight className="w-3 h-3" style={{ color: `${fc}30` }} />
              <Link href={`/facciones/${factionId}/wiki`} className="hover:text-bone/70 transition-colors">
                Wiki
              </Link>
              {page.category && (
                <>
                  <ChevronRight className="w-3 h-3" style={{ color: `${fc}30` }} />
                  <span style={{ color: `${fc}70` }}>{page.category.name}</span>
                </>
              )}
            </nav>

            {/* Title */}
            <h1
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-[0.95]"
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
              <p className="font-body text-base sm:text-lg text-bone/55 leading-relaxed mb-6 max-w-2xl">
                {page.excerpt}
              </p>
            )}

            {/* Meta row — prominent, chip-style */}
            <div className="flex flex-wrap items-center gap-3">
              {page.author && (
                <Link
                  href={page.author.username ? `/usuarios/${page.author.username}` : '#'}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-body transition-all hover:scale-[1.03]"
                  style={{ background: `${fc}15`, border: `1px solid ${fc}20`, color: 'rgba(232,232,240,0.8)' }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: `${fc}30` }}
                  >
                    <User className="w-2.5 h-2.5" style={{ color: fc }} />
                  </div>
                  {page.author.display_name || page.author.username}
                </Link>
              )}

              <div className="flex items-center gap-3 text-xs text-bone/35 font-mono">
                {page.published_at && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" style={{ color: `${fc}50` }} />
                    {new Date(page.published_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" style={{ color: `${fc}50` }} />
                  {readingTime} min
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3 h-3" style={{ color: `${fc}50` }} />
                  {page.views_count}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{
            background: theme?.gradients.border || `linear-gradient(90deg, transparent, ${fc}, transparent)`,
            boxShadow: `0 0 15px ${fc}25`,
          }}
        />
      </section>

      {/* ══════════════════════════════════════════
          CONTENT SECTION — Clean reading zone with sticky TOC
         ══════════════════════════════════════════ */}
      <section className="relative py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-10">
            {/* ── Sticky Sidebar TOC (desktop) ── */}
            {toc.length > 0 && (
              <aside className="hidden xl:block w-52 shrink-0">
                <div className="sticky top-20 space-y-6">
                  <div
                    className="p-4 rounded-xl"
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
                      className="flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-bone/5"
                      style={{ border: `1px solid ${fc}08` }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: `${fc}20` }}
                      >
                        <User className="w-3.5 h-3.5" style={{ color: fc }} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-mono text-bone/30 tracking-wider uppercase block">Escrito por</span>
                        <span className="text-xs text-bone/70 truncate block">
                          {page.author.display_name || page.author.username}
                        </span>
                      </div>
                    </Link>
                  )}
                </div>
              </aside>
            )}

            {/* ── Main Content Column ── */}
            <div className="flex-1 min-w-0 max-w-3xl mx-auto">
              {/* Content container — clean, high contrast */}
              <div
                className="relative rounded-2xl overflow-hidden"
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
                  <BookOpen className="w-3.5 h-3.5" style={{ color: `${fc}60` }} />
                  <span
                    className="text-[10px] font-mono tracking-[0.3em] uppercase"
                    style={{ color: `${fc}40` }}
                  >
                    REGISTRO IMPERIAL
                  </span>
                  <div className="flex-1" />
                  {page.category && (
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded"
                      style={{ background: `${fc}10`, color: `${fc}60` }}
                    >
                      {page.category.name}
                    </span>
                  )}
                </div>

                {/* Article body — clean reading surface */}
                <div
                  className="px-6 sm:px-10 py-8 sm:py-10"
                  style={{
                    background: `linear-gradient(180deg, ${fc}03 0%, transparent 20%)`,
                  }}
                >
                  <GothicCorners className="text-imperial-gold/8" size={24} />

                  <WikiRenderer content={page.content} factionColor={fc} />
                </div>
              </div>

              {/* ── Back + Actions Row ── */}
              <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6" style={{ borderTop: `1px solid ${fc}10` }}>
                <Link href={`/facciones/${factionId}/wiki`}>
                  <button className="flex items-center gap-2 text-sm font-body text-bone/40 hover:text-bone/70 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                    Volver a la Wiki
                  </button>
                </Link>

                {page.author && page.author.username && (
                  <Link
                    href={`/usuarios/${page.author.username}`}
                    className="xl:hidden flex items-center gap-2 text-xs font-mono transition-all hover:bg-bone/5 px-3 py-1.5 rounded-lg"
                    style={{ color: `${fc}60`, border: `1px solid ${fc}12` }}
                  >
                    <User className="w-3 h-3" />
                    {page.author.display_name || page.author.username}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {/* ── Gallery Section ── */}
              {page.gallery_images && page.gallery_images.length > 0 && (
                <div className="mt-12">
                  {/* Section divider */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${fc}25, transparent)` }} />
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rotate-45" style={{ background: `${fc}40` }} />
                      <Eye className="w-4 h-4" style={{ color: `${fc}40` }} />
                      <div className="w-1.5 h-1.5 rotate-45" style={{ background: `${fc}40` }} />
                    </div>
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${fc}25, transparent)` }} />
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <span
                      className="text-[9px] font-mono tracking-[0.3em] uppercase"
                      style={{ color: `${fc}50` }}
                    >
                      ARCHIVOS PICTOGRAFICOS
                    </span>
                    <span className="text-[10px] font-mono text-bone/20">
                      {page.gallery_images.length} imagenes
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {page.gallery_images.map((img, i) => (
                      <motion.button
                        key={i}
                        type="button"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.04 }}
                        className="relative aspect-[4/3] rounded-xl overflow-hidden group cursor-pointer"
                        style={{ border: `1px solid ${fc}10` }}
                        onClick={() => setLightboxIndex(i)}
                      >
                        <Image
                          src={img}
                          alt={`${page.title} - imagen ${i + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center"
                          style={{ background: `${fc}30` }}
                        >
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm"
                            style={{ background: `${fc}40`, border: `1px solid ${fc}60` }}
                          >
                            <Eye className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        {/* Bottom glow on hover */}
                        <div
                          className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: `linear-gradient(90deg, transparent, ${fc}, transparent)` }}
                        />
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
