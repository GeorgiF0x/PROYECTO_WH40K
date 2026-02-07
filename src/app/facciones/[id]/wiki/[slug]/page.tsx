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
  Edit3,
  BookOpen,
  Share2,
  ChevronUp,
  Clock,
  Scroll,
  Hash,
  ExternalLink,
  Copy,
  Check,
  X,
  ChevronRight,
} from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { getFactionById } from '@/lib/data'
import { getFactionTheme } from '@/lib/faction-themes'
import { FactionEffects, FactionSymbol } from '@/components/faction'
import { WikiRenderer } from '@/components/wiki'
import { GothicCorners } from '@/components/wiki/WikiDecorations'
import { Button } from '@/components/ui/Button'
import type { WikiPage } from '@/lib/supabase/wiki.types'

/* ── Helpers ── */

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

/* ── Faction Divider ── */

function FactionDivider({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-4 my-8">
      <div
        className="flex-1 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${color}40, transparent)` }}
      />
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rotate-45" style={{ background: `${color}60` }} />
        <div className="w-2 h-2 rotate-45" style={{ background: `${color}40`, border: `1px solid ${color}60` }} />
        <div className="w-1.5 h-1.5 rotate-45" style={{ background: `${color}60` }} />
      </div>
      <div
        className="flex-1 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${color}40, transparent)` }}
      />
    </div>
  )
}

/* ── Gallery Lightbox ── */

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

/* ── Table of Contents ── */

function TableOfContents({
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
    <nav className="space-y-1">
      <div className="flex items-center gap-2 mb-3">
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
          className="group flex items-center gap-2 py-1 transition-all duration-200"
          style={{ paddingLeft: `${(entry.level - 1) * 12}px` }}
        >
          <div
            className="w-[3px] h-4 rounded-full shrink-0 transition-all duration-200"
            style={{
              background: activeId === entry.id ? factionColor : `${factionColor}20`,
              boxShadow: activeId === entry.id ? `0 0 8px ${factionColor}50` : 'none',
            }}
          />
          <span
            className="text-xs leading-tight transition-colors duration-200 line-clamp-2"
            style={{
              color: activeId === entry.id ? factionColor : 'rgba(232,232,240,0.45)',
            }}
          >
            {entry.text}
          </span>
        </a>
      ))}
    </nav>
  )
}

/* ── Main Page ── */

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

  const { scrollYProgress } = useScroll()
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 80])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])

  const toc = useMemo(() => (page ? extractToc(page.content) : []), [page])

  useEffect(() => {
    loadPage()
  }, [factionId, slug])

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500)
    window.addEventListener('scroll', handleScroll)
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

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
          <div className="max-w-4xl mx-auto px-6">
            {/* Skeleton with faction color shimmer */}
            <div className="space-y-6">
              <div className="h-8 w-48 rounded animate-pulse" style={{ background: `${fc}15` }} />
              <div className="h-14 w-3/4 rounded animate-pulse" style={{ background: `${fc}10` }} />
              <div
                className="h-[40vh] rounded-2xl animate-pulse"
                style={{
                  background: `linear-gradient(135deg, ${fc}08 0%, ${secondaryColor}05 50%, ${fc}08 100%)`,
                  border: `1px solid ${fc}10`,
                }}
              />
              <div className="space-y-3">
                {[1, 0.85, 0.7, 0.9, 0.6].map((w, i) => (
                  <div
                    key={i}
                    className="h-4 rounded animate-pulse"
                    style={{ width: `${w * 100}%`, background: `${fc}08`, animationDelay: `${i * 0.1}s` }}
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
        className="fixed top-0 left-0 right-0 h-[3px] z-50 origin-left"
        style={{
          scaleX,
          background: theme?.gradients.border || `linear-gradient(90deg, ${fc}, ${glowColor})`,
          boxShadow: `0 0 12px ${fc}60`,
        }}
      />

      {/* ── Faction Background Effects ── */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <FactionEffects factionId={faction.id} />
      </div>

      {/* ── Ambient Gradient Orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-[30%] -left-[20%] w-[70%] h-[70%] rounded-full blur-[120px] opacity-[0.04]"
          style={{ background: fc }}
        />
        <div
          className="absolute -bottom-[30%] -right-[20%] w-[60%] h-[60%] rounded-full blur-[100px] opacity-[0.03]"
          style={{ background: secondaryColor }}
        />
      </div>

      <Navigation />

      {/* ═══════════════════════════════════════════
          HERO SECTION — Cinematic, parallax, faction-themed
         ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: page.hero_image ? '70vh' : '40vh' }}>
        {/* Hero Image with parallax */}
        {page.hero_image && (
          <motion.div className="absolute inset-0" style={{ y: heroY }}>
            <Image
              src={page.hero_image}
              alt={page.title}
              fill
              priority
              className="object-cover"
            />
            {/* Multi-layer gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: `
                  linear-gradient(180deg,
                    ${bgColor}90 0%,
                    ${bgColor}20 30%,
                    ${bgColor}40 60%,
                    ${bgColor} 100%
                  )
                `,
              }}
            />
            {/* Faction-colored tint */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${fc}15 0%, transparent 50%, ${secondaryColor}10 100%)`,
              }}
            />
            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(3,3,8,0.6)_100%)]" />
          </motion.div>
        )}

        {/* Faction Symbol Watermark — larger, animated */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            className="opacity-[0.06]"
            style={{ scale: 5 }}
            animate={{ rotate: [0, 1, -1, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          >
            <FactionSymbol factionId={faction.id} size="xl" animated={false} />
          </motion.div>
        </motion.div>

        {/* Hero Content */}
        <div className="relative pt-28 pb-16 flex items-end" style={{ minHeight: page.hero_image ? '70vh' : '40vh' }}>
          <div className="max-w-5xl mx-auto px-6 w-full">
            <div className="relative">
              <GothicCorners className={`text-[${fc}]/30`} size={42} />

              {/* Breadcrumb */}
              <motion.nav
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2 font-body text-sm text-bone/50 mb-6"
              >
                <Link
                  href={`/facciones/${factionId}`}
                  className="hover:text-bone transition-colors"
                >
                  {faction.shortName}
                </Link>
                <ChevronRight className="w-3 h-3" style={{ color: `${fc}40` }} />
                <Link
                  href={`/facciones/${factionId}/wiki`}
                  className="hover:text-bone transition-colors"
                >
                  Wiki
                </Link>
                {page.category && (
                  <>
                    <ChevronRight className="w-3 h-3" style={{ color: `${fc}40` }} />
                    <Link
                      href={`/facciones/${factionId}/wiki?categoria=${page.category.slug}`}
                      className="hover:text-bone transition-colors"
                      style={{ color: `${fc}90` }}
                    >
                      {page.category.name}
                    </Link>
                  </>
                )}
              </motion.nav>

              {/* Category badge */}
              {page.category && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold tracking-wider mb-5"
                    style={{
                      background: `${fc}15`,
                      color: fc,
                      border: `1px solid ${fc}25`,
                      boxShadow: `0 0 20px ${fc}10`,
                    }}
                  >
                    <BookOpen className="w-3 h-3" />
                    {page.category.name}
                  </span>
                </motion.div>
              )}

              {/* Title — dramatic with gradient */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-[0.95]"
                style={{
                  background: theme?.gradients.text || `linear-gradient(90deg, ${fc}, ${glowColor})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: `drop-shadow(0 4px 30px ${fc}30)`,
                }}
              >
                {page.title}
              </motion.h1>

              {/* Excerpt */}
              {page.excerpt && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="font-body text-lg sm:text-xl text-bone/60 leading-relaxed mb-8 max-w-3xl"
                >
                  {page.excerpt}
                </motion.p>
              )}

              {/* Meta Row */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="flex flex-wrap items-center gap-4 text-sm font-body"
              >
                {page.author && (
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                    style={{ background: `${fc}10`, border: `1px solid ${fc}15` }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: `${fc}25` }}
                    >
                      <User className="w-3 h-3" style={{ color: fc }} />
                    </div>
                    <span className="text-bone/70">
                      {page.author.display_name || page.author.username}
                    </span>
                  </div>
                )}
                {page.published_at && (
                  <div className="flex items-center gap-2 text-bone/40">
                    <Calendar className="w-3.5 h-3.5" style={{ color: `${fc}70` }} />
                    <span>
                      {new Date(page.published_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-bone/40">
                  <Eye className="w-3.5 h-3.5" style={{ color: `${fc}70` }} />
                  <span>{page.views_count} lecturas</span>
                </div>
                <div className="flex items-center gap-2 text-bone/40">
                  <Clock className="w-3.5 h-3.5" style={{ color: `${fc}70` }} />
                  <span>{readingTime} min</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom gradient border */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{
            background: theme?.gradients.border || `linear-gradient(90deg, transparent, ${fc}, transparent)`,
            boxShadow: `0 0 20px ${fc}30`,
          }}
        />
      </section>

      {/* ═══════════════════════════════════════════
          CONTENT SECTION — with ToC sidebar
         ═══════════════════════════════════════════ */}
      <section className="relative py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {/* ── Sidebar: Table of Contents ── */}
            {toc.length > 0 && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="hidden xl:block w-56 shrink-0"
              >
                <div className="sticky top-24 space-y-6">
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      background: `${fc}05`,
                      border: `1px solid ${fc}10`,
                    }}
                  >
                    <TableOfContents
                      entries={toc}
                      factionColor={fc}
                      activeId={activeTocId}
                    />
                  </div>

                  {/* Quick actions */}
                  <div className="space-y-2">
                    <button
                      onClick={handleShare}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition-all hover:bg-bone/5 text-bone/40 hover:text-bone/70"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5" style={{ color: fc }} />
                          <span style={{ color: fc }}>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar enlace</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.aside>
            )}

            {/* ── Main Content ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex-1 min-w-0 max-w-4xl"
            >
              {/* Decorative header bar */}
              <div
                className="relative flex items-center gap-3 px-6 py-3 rounded-t-2xl overflow-hidden"
                style={{
                  background: `linear-gradient(90deg, ${fc}12 0%, ${secondaryColor}08 50%, transparent 100%)`,
                  borderBottom: `1px solid ${fc}15`,
                }}
              >
                {/* Animated gradient shimmer */}
                <motion.div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${fc}10 50%, transparent 100%)`,
                    backgroundSize: '200% 100%',
                  }}
                  animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                />
                <Scroll className="w-4 h-4 relative z-10" style={{ color: `${fc}80` }} />
                <span
                  className="text-[10px] font-mono tracking-[0.3em] uppercase relative z-10"
                  style={{ color: `${fc}50` }}
                >
                  REGISTRO IMPERIAL
                </span>
                <div className="flex-1" />
                <span className="text-[10px] font-mono text-bone/20 relative z-10">
                  {readingTime} min lectura
                </span>
              </div>

              {/* Article content container */}
              <div
                className="relative p-8 sm:p-10 rounded-b-2xl"
                style={{
                  background: `linear-gradient(180deg, ${fc}06 0%, transparent 30%, transparent 70%, ${fc}03 100%)`,
                  border: `1px solid ${fc}12`,
                  borderTop: 'none',
                }}
              >
                {/* Left border accent — faction gradient */}
                <div
                  className="absolute top-0 bottom-0 left-0 w-[3px] rounded-bl-2xl"
                  style={{
                    background: `linear-gradient(180deg, ${fc}80, ${secondaryColor}40, ${fc}15)`,
                  }}
                />

                {/* Subtle faction symbol watermark behind content */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.02]">
                  <div style={{ transform: 'scale(6)' }}>
                    <FactionSymbol factionId={faction.id} size="xl" animated={false} />
                  </div>
                </div>

                <GothicCorners className="text-imperial-gold/10" size={28} />

                <WikiRenderer content={page.content} factionColor={fc} />
              </div>

              {/* ── Actions Row ── */}
              <div className="mt-10">
                <FactionDivider color={fc} />
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <Link href={`/facciones/${factionId}/wiki`}>
                    <motion.button
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-bone/50 hover:text-bone transition-all"
                      whileHover={{ x: -4, color: fc }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Volver a la Wiki
                    </motion.button>
                  </Link>

                  <div className="flex items-center gap-3">
                    <motion.button
                      onClick={handleShare}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: `${fc}10`,
                        color: `${fc}90`,
                        border: `1px solid ${fc}20`,
                      }}
                      whileHover={{ scale: 1.03, boxShadow: `0 0 20px ${fc}15` }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {copiedLink ? (
                        <><Check className="w-4 h-4" /> Enlace copiado</>
                      ) : (
                        <><Share2 className="w-4 h-4" /> Compartir</>
                      )}
                    </motion.button>
                    <motion.button
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border opacity-40 cursor-not-allowed"
                      style={{
                        borderColor: `${fc}20`,
                        color: `${fc}60`,
                      }}
                      disabled
                    >
                      <Edit3 className="w-4 h-4" />
                      Sugerir edicion
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* ── Author Card ── */}
              {page.author && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mt-10"
                >
                  <div
                    className="relative p-6 rounded-xl overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${fc}08 0%, ${secondaryColor}05 100%)`,
                      border: `1px solid ${fc}15`,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${fc}30, ${secondaryColor}20)`,
                          border: `2px solid ${fc}30`,
                          boxShadow: `0 0 20px ${fc}15`,
                        }}
                      >
                        <User className="w-6 h-6" style={{ color: fc }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span
                          className="text-[9px] font-mono tracking-[0.2em] uppercase block mb-1"
                          style={{ color: `${fc}50` }}
                        >
                          ESCRITO POR
                        </span>
                        <p className="font-display text-lg text-bone/90 truncate">
                          {page.author.display_name || page.author.username}
                        </p>
                      </div>
                      {page.author.username && (
                        <Link
                          href={`/usuarios/${page.author.username}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all hover:bg-bone/5"
                          style={{ color: `${fc}70`, border: `1px solid ${fc}15` }}
                        >
                          Ver perfil
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          GALLERY SECTION
         ═══════════════════════════════════════════ */}
      {page.gallery_images && page.gallery_images.length > 0 && (
        <section className="relative py-12">
          <div className="max-w-6xl mx-auto px-6">
            <FactionDivider color={fc} />

            <div className="mt-8 mb-6 flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${fc}15`, border: `1px solid ${fc}20` }}
              >
                <BookOpen className="w-4 h-4" style={{ color: fc }} />
              </div>
              <div>
                <span
                  className="text-[9px] font-mono tracking-[0.3em] uppercase block"
                  style={{ color: `${fc}50` }}
                >
                  ARCHIVOS PICTOGRAFICOS
                </span>
                <h2 className="font-display text-xl font-bold" style={{ color: fc }}>
                  Galeria
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {page.gallery_images.map((img, i) => (
                <motion.button
                  key={i}
                  type="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
                  style={{ border: `1px solid ${fc}15` }}
                  onClick={() => setLightboxIndex(i)}
                  whileHover={{ scale: 1.02, boxShadow: `0 0 30px ${fc}20` }}
                >
                  <Image
                    src={img}
                    alt={`${page.title} - imagen ${i + 1}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Hover overlay */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${fc}30 0%, ${secondaryColor}20 100%)`,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm"
                      style={{ background: `${fc}40`, border: `1px solid ${fc}60` }}
                    >
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  {/* Bottom border glow on hover */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: `linear-gradient(90deg, transparent, ${fc}, transparent)` }}
                  />
                </motion.button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Lightbox ── */}
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

      {/* ── Scroll to top ── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-3 rounded-full shadow-lg z-40 group"
            style={{
              background: `linear-gradient(135deg, ${fc}, ${secondaryColor})`,
              boxShadow: `0 4px 30px ${fc}40`,
            }}
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: `2px solid ${fc}` }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <ChevronUp className="w-5 h-5 text-void relative z-10" />
          </motion.button>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  )
}
