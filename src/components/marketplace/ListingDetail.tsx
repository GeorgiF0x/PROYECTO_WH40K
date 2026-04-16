'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar } from '@/components/ui'
import {
  Heart,
  Share2,
  MapPin,
  Eye,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Flag,
  Package,
  RefreshCw,
  Tag,
  ExternalLink,
  Swords,
  BookOpen,
  BookMarked,
  Paintbrush,
  Wrench,
  Mountain,
  Dice5,
  Compass,
  ScrollText,
  Shield,
  Send,
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { ReportModal } from '@/components/ui/ReportModal'
import { getOrCreateConversation, sendMessage } from '@/lib/services/messages'
import { FACTION_ICONS } from '@/components/user/FactionSelector'
import type { ListingWithSeller } from './ListingCard'

const conditionLabels: Record<string, { label: string; description: string }> = {
  nib: { label: 'Nuevo en caja', description: 'Producto sin abrir, precintado' },
  nos: { label: 'Nuevo sin caja', description: 'Sin usar pero sin caja original' },
  assembled: { label: 'Montado', description: 'Montado pero sin pintar' },
  painted: { label: 'Pintado', description: 'Pintado a nivel tabletop' },
  pro_painted: { label: 'Pro Painted', description: 'Pintado a nivel profesional/competicion' },
}

const typeLabels: Record<string, { label: string; icon: typeof Tag }> = {
  sale: { label: 'En venta', icon: Tag },
  trade: { label: 'Para intercambio', icon: RefreshCw },
  both: { label: 'Venta o intercambio', icon: Package },
}

const categoryLabels: Record<string, { label: string; icon: typeof Swords }> = {
  miniatures: { label: 'Miniaturas', icon: Swords },
  novels: { label: 'Novelas', icon: BookOpen },
  codex: { label: 'Codex / Reglas', icon: BookMarked },
  paints: { label: 'Pinturas', icon: Paintbrush },
  tools: { label: 'Herramientas', icon: Wrench },
  terrain: { label: 'Terreno', icon: Mountain },
  accessories: { label: 'Accesorios', icon: Dice5 },
  other: { label: 'Otros', icon: Package },
}

// Rogue Trader ornamental divider — diamond motif
function OrnateDiv() {
  return (
    <div className="my-1 flex items-center gap-3">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-imperial-gold/20" />
      <div className="flex items-center gap-1.5">
        <div className="h-1 w-1 rotate-45 bg-imperial-gold/30" />
        <div className="h-1.5 w-1.5 rotate-45 bg-imperial-gold/50" />
        <div className="h-1 w-1 rotate-45 bg-imperial-gold/30" />
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-imperial-gold/20 to-transparent" />
    </div>
  )
}

// Floating gold dust particles — unique to Rogue Trader theme
const DUST_SEEDS = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  left: `${((i * 17 + 5) % 90) + 5}%`,
  top: `${((i * 23 + 10) % 80) + 10}%`,
  drift: (i % 2 === 0 ? -1 : 1) * (20 + (i % 3) * 10),
  dur: 6 + (i % 3) * 2,
  delay: i * 0.8,
}))

function GoldDust() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {DUST_SEEDS.map((p) => (
        <motion.div
          key={p.id}
          className="absolute h-1 w-1 rounded-full bg-imperial-gold/40"
          style={{ left: p.left, top: p.top }}
          animate={{
            y: [0, p.drift, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// Baroque filigree corner — SVG curved ornament for Rogue Trader frames
function BaroqueCorner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const posClass = {
    tl: 'top-0 left-0',
    tr: 'top-0 right-0',
    bl: 'bottom-0 left-0',
    br: 'bottom-0 right-0',
  }[position]
  const flip = { tl: undefined, tr: 'scaleX(-1)', bl: 'scaleY(-1)', br: 'scale(-1)' }[position]

  return (
    <svg
      viewBox="0 0 60 60"
      className={`pointer-events-none absolute h-14 w-14 text-imperial-gold ${posClass}`}
      style={flip ? { transform: flip } : undefined}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
    >
      {/* Main curved L-arm */}
      <path d="M0 60 V18 Q0 0 18 0 H60" strokeWidth="1.5" opacity="0.5" />
      {/* Inner parallel curve — filigree doubling */}
      <path d="M7 48 V22 Q7 7 22 7 H48" strokeWidth="0.75" opacity="0.2" />
      {/* Volute scroll at the corner bend */}
      <path d="M14 22 Q6 6 22 6" strokeWidth="1" opacity="0.4" />
      <path d="M18 18 Q12 10 18 8" strokeWidth="0.75" opacity="0.25" />
      {/* Center accent dot */}
      <circle cx="13" cy="13" r="2" fill="currentColor" opacity="0.35" stroke="none" />
      {/* Arm accent dots */}
      <circle cx="38" cy="3" r="1" fill="currentColor" opacity="0.2" stroke="none" />
      <circle cx="3" cy="38" r="1" fill="currentColor" opacity="0.2" stroke="none" />
    </svg>
  )
}

// Star chart dots — Rogue Trader navigation map feel
const CHART_STARS = Array.from({ length: 35 }, (_, i) => ({
  left: `${((i * 7.3 + 13.7) % 98) + 1}%`,
  top: `${((i * 11.9 + 5.3) % 98) + 1}%`,
  size: i % 7 === 0 ? 2.5 : i % 4 === 0 ? 1.5 : 1,
  opacity: i % 7 === 0 ? 0.25 : i % 4 === 0 ? 0.15 : 0.08,
  twinkle: i % 6 === 0,
  twinkDur: 3 + (i % 4),
  twinkDelay: (i % 5) * 0.8,
}))

function StarChart() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {CHART_STARS.map((s, i) =>
        s.twinkle ? (
          <motion.div
            key={i}
            className="absolute rounded-full bg-imperial-gold"
            style={{ left: s.left, top: s.top, width: s.size, height: s.size }}
            animate={{ opacity: [s.opacity * 0.5, s.opacity * 1.5, s.opacity * 0.5] }}
            transition={{
              duration: s.twinkDur,
              repeat: Infinity,
              delay: s.twinkDelay,
              ease: 'easeInOut',
            }}
          />
        ) : (
          <div
            key={i}
            className="absolute rounded-full bg-imperial-gold"
            style={{ left: s.left, top: s.top, width: s.size, height: s.size, opacity: s.opacity }}
          />
        )
      )}
    </div>
  )
}

// Wax seal price stamp — real PNG seal with price overlay
function WaxSeal({ price }: { price: number }) {
  const priceStr = `${price}€`
  const fs = priceStr.length > 5 ? '0.85rem' : priceStr.length > 4 ? '1rem' : '1.15rem'

  return (
    <div className="relative" style={{ width: 82, height: 82 }}>
      <Image
        src="/wax-seal.png"
        alt="Sello de cera"
        width={82}
        height={82}
        className="pointer-events-none absolute inset-0 h-full w-full object-contain drop-shadow-lg"
        priority
      />
      <span
        className="absolute inset-0 flex items-center justify-center font-display font-black"
        style={{
          fontSize: fs,
          color: 'rgba(232,232,240,0.9)',
          textShadow: '0 1px 3px rgba(20,0,0,0.9), 0 0 6px rgba(80,0,0,0.4)',
        }}
      >
        {priceStr}
      </span>
    </div>
  )
}

interface ListingDetailProps {
  listing: ListingWithSeller
}

export default function ListingDetail({ listing }: ListingDetailProps) {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(listing.is_favorited || false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactMessage, setContactMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [contactError, setContactError] = useState<string | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)

  const handleOpenContact = useCallback(() => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(`/mercado/${listing.id}`))
      return
    }
    if (user.id === listing.seller_id) {
      setContactError('No puedes contactarte con tu propio anuncio')
      return
    }
    setContactError(null)
    setShowContactModal(true)
  }, [user, listing.seller_id, listing.id, router])

  const handleSendMessage = useCallback(async () => {
    if (!user || !contactMessage.trim()) return
    setIsSending(true)
    setContactError(null)

    try {
      const { conversationId, error: convError } = await getOrCreateConversation(
        listing.id,
        user.id,
        listing.seller_id
      )
      if (convError || !conversationId) throw convError || new Error('Error al crear conversacion')

      const { error: msgError } = await sendMessage(conversationId, user.id, contactMessage.trim())
      if (msgError) throw msgError

      setShowContactModal(false)
      setContactMessage('')
      router.push(`/mensajes/${conversationId}`)
    } catch {
      setContactError('Error al enviar el mensaje. Intentalo de nuevo.')
    } finally {
      setIsSending(false)
    }
  }, [user, contactMessage, listing.id, listing.seller_id, router])

  const handlePrevImage = () => {
    if (listing?.images) {
      setCurrentImageIndex((prev) => (prev === 0 ? listing.images.length - 1 : prev - 1))
    }
  }

  const handleNextImage = () => {
    if (listing?.images) {
      setCurrentImageIndex((prev) => (prev === listing.images.length - 1 ? 0 : prev + 1))
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: listing?.title,
        text: listing?.description,
        url: window.location.href,
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleToggleFavorite = async () => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(`/mercado/${listing.id}`))
      return
    }
    const newFavorited = !isFavorited
    setIsFavorited(newFavorited)
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      setIsFavorited(!newFavorited)
      return
    }
    if (newFavorited) {
      const { error } = await supabase
        .from('listing_favorites')
        .insert({ listing_id: listing.id, user_id: user.id })
      if (error) setIsFavorited(false)
    } else {
      const { error } = await supabase
        .from('listing_favorites')
        .delete()
        .eq('listing_id', listing.id)
        .eq('user_id', user.id)
      if (error) setIsFavorited(true)
    }
  }

  const condition = conditionLabels[listing.condition] || conditionLabels.assembled
  const listingType = typeLabels[listing.listing_type] || typeLabels.sale
  const TypeIcon = listingType.icon
  const images = listing.images?.length > 0 ? listing.images : ['/placeholder-miniature.jpg']
  const createdDate = new Date(listing.created_at).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const refCode = listing.id.slice(0, 8).toUpperCase()

  return (
    <>
      {/* ── Rogue Trader Header ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="relative overflow-hidden rounded-xl bg-void-light/30 p-5 backdrop-blur-sm">
          {/* Baroque filigree corners */}
          <BaroqueCorner position="tl" />
          <BaroqueCorner position="tr" />
          <BaroqueCorner position="bl" />
          <BaroqueCorner position="br" />

          {/* Star chart background */}
          <StarChart />

          {/* Warm golden vignette */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(201,162,39,0.06)_0%,transparent_60%)]" />

          {/* Floating gold dust */}
          <GoldDust />

          {/* Traveling golden shimmer along top edge */}
          <motion.div
            className="pointer-events-none absolute left-0 top-0 h-[2px] w-24 bg-gradient-to-r from-transparent via-imperial-gold/50 to-transparent"
            animate={{ left: ['-10%', '110%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
          />

          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Slowly rotating compass */}
              <div className="relative">
                <div className="absolute inset-0 rounded-lg bg-imperial-gold/20 blur-sm" />
                <div className="relative rounded-lg border border-imperial-gold/20 bg-imperial-gold/10 p-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  >
                    <Compass className="h-5 w-5 text-imperial-gold" />
                  </motion.div>
                </div>
              </div>
              <div>
                <span className="block font-mono text-xs uppercase tracking-[0.25em] text-imperial-gold/70">
                  Rogue Trader <span className="text-imperial-gold/30">◆</span> Manifiesto de
                  Comercio
                </span>
                <span className="font-mono text-[10px] tracking-wider text-bone/30">
                  REF: {refCode} <span className="text-imperial-gold/20">◆</span> FECHA REGISTRO:{' '}
                  {createdDate}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 font-mono text-xs text-bone/40">
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                {listing.views_count || 0} inspecciones
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-green-500/60" />
                Verificado
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Main Content Grid ──────────────────────────────── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* ═══ IMAGE GALLERY ═══════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          {/* Main image with ornate frame */}
          <div className="group relative">
            {/* Outer glow on hover */}
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-imperial-gold/30 via-transparent to-imperial-gold/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative aspect-square overflow-hidden rounded-2xl border border-bone/10 bg-void-light">
              {/* Baroque filigree frame */}
              <div className="pointer-events-none absolute inset-0 z-10">
                <BaroqueCorner position="tl" />
                <BaroqueCorner position="tr" />
                <BaroqueCorner position="bl" />
                <BaroqueCorner position="br" />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={images[currentImageIndex]}
                    alt={`${listing.title} - Imagen ${currentImageIndex + 1}`}
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Dark gradient overlay at bottom */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-void/80 to-transparent" />

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-lg border border-bone/10 bg-void/70 p-2.5 text-bone/80 backdrop-blur-sm transition-all hover:border-imperial-gold hover:bg-imperial-gold hover:text-void"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-lg border border-bone/10 bg-void/70 p-2.5 text-bone/80 backdrop-blur-sm transition-all hover:border-imperial-gold hover:bg-imperial-gold hover:text-void"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-bone/10 bg-void/80 px-4 py-1.5 font-mono text-xs text-bone/70 backdrop-blur-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}

              {/* Wax seal price stamp — stamp-down spring animation */}
              <motion.div
                className="absolute left-4 top-4 z-10"
                initial={{ scale: 2.5, rotate: -20, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 10, stiffness: 120, delay: 0.6 }}
              >
                <WaxSeal price={listing.price} />
              </motion.div>

              {/* Action buttons overlay - top right */}
              <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
                <motion.button
                  onClick={handleToggleFavorite}
                  className={`rounded-lg border p-2.5 backdrop-blur-sm transition-all ${
                    isFavorited
                      ? 'border-red-500/50 bg-red-500/30 text-red-400 shadow-lg shadow-red-500/20'
                      : 'border-bone/10 bg-void/60 text-bone/70 hover:border-imperial-gold/30 hover:text-bone'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                </motion.button>
                <motion.button
                  onClick={handleShare}
                  className="rounded-lg border border-bone/10 bg-void/60 p-2.5 text-bone/70 backdrop-blur-sm transition-all hover:border-imperial-gold/30 hover:text-bone"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Share2 className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    index === currentImageIndex
                      ? 'border-imperial-gold shadow-md shadow-imperial-gold/20'
                      : 'border-bone/10 opacity-60 hover:border-bone/30 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* ═══ LISTING INFO ═════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-6"
        >
          {/* Title */}
          <div>
            <h1 className="font-display text-3xl font-bold leading-tight text-bone md:text-4xl">
              {listing.title}
            </h1>
            <div className="mt-2 flex items-center gap-2 font-mono text-xs text-bone/30">
              <ScrollText className="h-3.5 w-3.5" />
              <span>Entrada de manifiesto #{refCode}</span>
            </div>
          </div>

          {/* ── Badges ─────────────────────────────── */}
          <div className="flex flex-wrap gap-2.5">
            {/* Type badge - highlighted */}
            <span className="inline-flex items-center gap-2 rounded-lg border border-imperial-gold/30 bg-imperial-gold/10 px-4 py-2 font-body text-sm font-medium text-imperial-gold">
              <TypeIcon className="h-4 w-4" />
              {listingType.label}
            </span>
            {/* Condition badge */}
            <span className="inline-flex items-center gap-2 rounded-lg border border-bone/10 bg-void-light px-4 py-2 font-body text-sm text-bone/70">
              <Package className="h-4 w-4 text-bone/50" />
              {condition.label}
            </span>
            {/* Category badge */}
            {listing.category &&
              (() => {
                const cat = categoryLabels[listing.category] || categoryLabels.miniatures
                const CatIcon = cat.icon
                return (
                  <span className="inline-flex items-center gap-2 rounded-lg border border-bone/10 bg-void-light px-4 py-2 font-body text-sm text-bone/70">
                    <CatIcon className="h-4 w-4 text-bone/50" />
                    {cat.label}
                  </span>
                )
              })()}
            {/* Faction badge */}
            {listing.faction &&
              (() => {
                const iconPath = FACTION_ICONS[listing.faction.slug]
                return (
                  <span
                    className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-body text-sm font-medium"
                    style={{
                      color: listing.faction.primary_color || '#C9A227',
                      borderColor: `${listing.faction.primary_color || '#C9A227'}50`,
                      backgroundColor: `${listing.faction.primary_color || '#C9A227'}15`,
                    }}
                  >
                    {iconPath && (
                      <Image
                        src={iconPath}
                        alt={listing.faction.name}
                        width={16}
                        height={16}
                        className="opacity-80 invert"
                      />
                    )}
                    {listing.faction.name}
                  </span>
                )
              })()}
          </div>

          <OrnateDiv />

          {/* ── Description ────────────────────────── */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-xl border border-bone/5 bg-void-light/40 p-5">
              {/* Left accent bookmark — Rogue Trader trade manifest feel */}
              <div className="absolute bottom-0 left-0 top-0 w-[2px] rounded-l-xl bg-gradient-to-b from-imperial-gold/30 via-imperial-gold/10 to-transparent" />

              <div className="mb-3 flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-imperial-gold/60" />
                <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-imperial-gold/60">
                  Registro del Articulo <span className="text-imperial-gold/30">◆</span>
                </h3>
              </div>
              <p className="whitespace-pre-wrap font-body leading-relaxed text-bone/70">
                {listing.description}
              </p>
            </div>
          </div>

          {/* ── Condition detail ────────────────────── */}
          <div className="rounded-xl border border-bone/5 bg-void-light/40 p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-lg bg-imperial-gold/20 blur-sm" />
                <div className="relative rounded-lg border border-imperial-gold/20 bg-imperial-gold/10 p-2.5">
                  <Package className="h-5 w-5 text-imperial-gold" />
                </div>
              </div>
              <div>
                <p className="font-display font-semibold text-bone">{condition.label}</p>
                <p className="font-body text-sm text-bone/50">{condition.description}</p>
              </div>
            </div>
          </div>

          {/* ── Location ───────────────────────────── */}
          {listing.location && (
            <div className="flex items-center gap-3 px-1 text-bone/50">
              <MapPin className="h-4 w-4 text-imperial-gold/50" />
              <span className="font-body text-sm">{listing.location}</span>
            </div>
          )}

          <OrnateDiv />

          {/* ── Seller Card ────────────────────────── */}
          <div className="relative overflow-hidden rounded-xl border border-bone/5 bg-void-light/40">
            {/* Subtle top accent line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-imperial-gold/30 to-transparent" />

            <div className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <Compass className="h-3.5 w-3.5 text-imperial-gold/50" />
                <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-imperial-gold/50">
                  Capitan Mercante <span className="text-imperial-gold/25">◆</span> Vendedor
                </h3>
              </div>
              <div className="flex items-center justify-between">
                <Link
                  href={`/usuarios/${listing.profiles?.username}`}
                  className="group flex items-center gap-3"
                >
                  <div className="relative">
                    <div className="absolute -inset-0.5 rounded-full bg-imperial-gold/20 opacity-0 blur-sm transition-opacity group-hover:opacity-100" />
                    <Avatar
                      src={listing.profiles?.avatar_url}
                      alt={
                        listing.profiles?.display_name || listing.profiles?.username || 'Vendedor'
                      }
                      fallback={listing.profiles?.username || 'V'}
                      size="lg"
                    />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-bone transition-colors group-hover:text-imperial-gold">
                      {listing.profiles?.display_name || listing.profiles?.username}
                    </p>
                    <p className="font-body text-sm text-bone/40">@{listing.profiles?.username}</p>
                  </div>
                </Link>
                <Link
                  href={`/usuarios/${listing.profiles?.username}`}
                  className="rounded-lg p-2.5 text-bone/30 transition-colors hover:bg-imperial-gold/5 hover:text-imperial-gold"
                >
                  <ExternalLink className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* ── Contact Error ──────────────────────── */}
          {contactError && !showContactModal && (
            <p className="text-center font-body text-sm text-red-400">{contactError}</p>
          )}

          {/* ── Contact Button ─────────────────────── */}
          <motion.button
            onClick={handleOpenContact}
            className="group relative w-full overflow-hidden rounded-xl"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Animated background glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-imperial-gold/20 via-yellow-500/20 to-imperial-gold/20"
              animate={{
                backgroundPosition: ['0% 0%', '200% 0%'],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              style={{ backgroundSize: '200% 100%' }}
            />
            <div className="relative flex items-center justify-center gap-3 border border-imperial-gold/50 bg-gradient-to-r from-imperial-gold via-yellow-500 to-imperial-gold py-4 font-display text-lg font-bold text-void">
              {/* Corner cuts */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-imperial-gold via-yellow-500 to-imperial-gold"
                style={{
                  clipPath:
                    'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                }}
              />
              <span className="relative z-10 flex items-center gap-3">
                <MessageCircle className="h-5 w-5" />
                Iniciar Negociacion
              </span>
            </div>
          </motion.button>

          {/* ── Report link ────────────────────────── */}
          <button
            onClick={() => setShowReportModal(true)}
            className="mx-auto flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-bone/30 transition-colors hover:text-red-400"
          >
            <Flag className="h-3.5 w-3.5" />
            Reportar anomalia
          </button>
        </motion.div>
      </div>

      {/* ═══ CONTACT MODAL ══════════════════════════════════ */}
      <AnimatePresence>
        {showContactModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-void/85 p-4 backdrop-blur-md"
            onClick={() => setShowContactModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-bone/10 bg-void-light"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Baroque filigree corners */}
              <BaroqueCorner position="tl" />
              <BaroqueCorner position="tr" />
              <BaroqueCorner position="bl" />
              <BaroqueCorner position="br" />

              {/* Traveling golden shimmer — Rogue Trader */}
              <motion.div
                className="pointer-events-none absolute left-0 top-0 h-[2px] w-20 bg-gradient-to-r from-transparent via-imperial-gold/40 to-transparent"
                animate={{ left: ['-10%', '110%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.5 }}
              />

              <div className="p-6">
                {/* Modal header */}
                <div className="mb-2 flex items-center gap-3">
                  <div className="rounded-lg border border-imperial-gold/20 bg-imperial-gold/10 p-1.5">
                    <Compass className="h-4 w-4 text-imperial-gold" />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-[0.15em] text-imperial-gold/60">
                    Canal de Negociacion <span className="text-imperial-gold/30">◆</span>
                  </span>
                </div>

                <h3 className="mb-2 font-display text-xl font-bold text-bone">
                  Contactar al vendedor
                </h3>
                <p className="mb-5 font-body text-sm text-bone/50">
                  Envia un mensaje a{' '}
                  <span className="text-imperial-gold/80">
                    {listing.profiles?.display_name || listing.profiles?.username}
                  </span>{' '}
                  para negociar sobre este articulo.
                </p>

                <textarea
                  placeholder="Escribe tu mensaje..."
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="mb-4 w-full resize-none rounded-xl border border-bone/10 bg-void px-4 py-3 font-body text-bone transition-all placeholder:text-bone/25 focus:border-imperial-gold/40 focus:shadow-[0_0_0_3px_rgba(201,162,39,0.08)] focus:outline-none"
                />

                {contactError && (
                  <p className="mb-4 font-body text-sm text-red-400">{contactError}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowContactModal(false)
                      setContactError(null)
                    }}
                    className="flex-1 rounded-xl border border-bone/10 bg-void py-3 font-display font-semibold text-bone/50 transition-all hover:border-bone/20 hover:text-bone/70"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    onClick={handleSendMessage}
                    disabled={isSending || !contactMessage.trim()}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-imperial-gold py-3 font-display font-bold text-void disabled:cursor-not-allowed disabled:opacity-40"
                    whileHover={{ scale: isSending ? 1 : 1.02 }}
                    whileTap={{ scale: isSending ? 1 : 0.98 }}
                  >
                    {isSending ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="h-4 w-4 rounded-full border-2 border-void/30 border-t-void"
                        />
                        Transmitiendo...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Enviar
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ REPORT MODAL ══════════════════════════════════ */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentType="listing"
        contentId={listing.id}
        reportedUserId={listing.seller_id}
      />
    </>
  )
}
