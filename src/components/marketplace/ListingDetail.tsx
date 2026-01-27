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
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-imperial-gold/20" />
      <div className="flex items-center gap-1.5">
        <div className="w-1 h-1 bg-imperial-gold/30 rotate-45" />
        <div className="w-1.5 h-1.5 bg-imperial-gold/50 rotate-45" />
        <div className="w-1 h-1 bg-imperial-gold/30 rotate-45" />
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-imperial-gold/20 to-transparent" />
    </div>
  )
}

// Floating gold dust particles — unique to Rogue Trader theme
const DUST_SEEDS = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 5) % 90 + 5}%`,
  top: `${(i * 23 + 10) % 80 + 10}%`,
  drift: (i % 2 === 0 ? -1 : 1) * (20 + (i % 3) * 10),
  dur: 6 + (i % 3) * 2,
  delay: i * 0.8,
}))

function GoldDust() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {DUST_SEEDS.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 rounded-full bg-imperial-gold/40"
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
      setCurrentImageIndex((prev) =>
        prev === 0 ? listing.images.length - 1 : prev - 1
      )
    }
  }

  const handleNextImage = () => {
    if (listing?.images) {
      setCurrentImageIndex((prev) =>
        prev === listing.images.length - 1 ? 0 : prev + 1
      )
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
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setIsFavorited(!newFavorited); return }
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
        <div className="relative bg-void-light/30 backdrop-blur-sm rounded-xl p-4 overflow-hidden border border-imperial-gold/15">
          {/* Warm golden vignette background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(201,162,39,0.06)_0%,transparent_60%)] pointer-events-none" />

          {/* Floating gold dust */}
          <GoldDust />

          {/* Traveling golden shimmer along top edge */}
          <motion.div
            className="absolute top-0 left-0 w-24 h-[2px] bg-gradient-to-r from-transparent via-imperial-gold/50 to-transparent pointer-events-none"
            animate={{ left: ['-10%', '110%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
          />

          <div className="relative flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              {/* Slowly rotating compass */}
              <div className="relative">
                <div className="absolute inset-0 bg-imperial-gold/20 rounded-lg blur-sm" />
                <div className="relative p-2 bg-imperial-gold/10 rounded-lg border border-imperial-gold/20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  >
                    <Compass className="w-5 h-5 text-imperial-gold" />
                  </motion.div>
                </div>
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-[0.25em] text-imperial-gold/70 block">
                  Rogue Trader <span className="text-imperial-gold/30">◆</span> Manifiesto de Comercio
                </span>
                <span className="text-[10px] font-mono text-bone/30 tracking-wider">
                  REF: {refCode} <span className="text-imperial-gold/20">◆</span> FECHA REGISTRO: {createdDate}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-bone/40 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                {listing.views_count || 0} inspecciones
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-green-500/60" />
                Verificado
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Main Content Grid ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

        {/* ═══ IMAGE GALLERY ═══════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          {/* Main image with ornate frame */}
          <div className="relative group">
            {/* Outer glow on hover */}
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-imperial-gold/30 via-transparent to-imperial-gold/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative aspect-square rounded-2xl overflow-hidden bg-void-light border border-bone/10">
              {/* Golden inner frame — Rogue Trader picture frame feel */}
              <div className="absolute inset-3 rounded-xl border border-imperial-gold/10 z-10 pointer-events-none transition-colors duration-500 group-hover:border-imperial-gold/25" />

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
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-void/80 to-transparent pointer-events-none" />

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-void/70 backdrop-blur-sm rounded-lg text-bone/80 hover:bg-imperial-gold hover:text-void transition-all border border-bone/10 hover:border-imperial-gold z-10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-void/70 backdrop-blur-sm rounded-lg text-bone/80 hover:bg-imperial-gold hover:text-void transition-all border border-bone/10 hover:border-imperial-gold z-10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-void/80 backdrop-blur-sm rounded-full text-xs text-bone/70 font-mono border border-bone/10 z-10">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}

              {/* Price seal */}
              <div className="absolute top-3 left-3 z-10">
                <div className="relative">
                  <div className="absolute -inset-1 bg-imperial-gold/20 rounded-xl blur-md" />
                  <div className="relative px-5 py-2.5 bg-gradient-to-br from-imperial-gold via-yellow-500 to-imperial-gold text-void font-display font-black text-2xl rounded-xl shadow-lg border border-yellow-400/50">
                    {listing.price}€
                  </div>
                </div>
              </div>

              {/* Action buttons overlay - top right */}
              <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                <motion.button
                  onClick={handleToggleFavorite}
                  className={`p-2.5 rounded-lg backdrop-blur-sm border transition-all ${
                    isFavorited
                      ? 'bg-red-500/30 border-red-500/50 text-red-400 shadow-lg shadow-red-500/20'
                      : 'bg-void/60 border-bone/10 text-bone/70 hover:border-imperial-gold/30 hover:text-bone'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                </motion.button>
                <motion.button
                  onClick={handleShare}
                  className="p-2.5 rounded-lg bg-void/60 backdrop-blur-sm border border-bone/10 text-bone/70 hover:border-imperial-gold/30 hover:text-bone transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                    index === currentImageIndex
                      ? 'border-imperial-gold shadow-md shadow-imperial-gold/20'
                      : 'border-bone/10 hover:border-bone/30 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
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
            <h1 className="text-3xl md:text-4xl font-display font-bold text-bone leading-tight">
              {listing.title}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-xs font-mono text-bone/30">
              <ScrollText className="w-3.5 h-3.5" />
              <span>Entrada de manifiesto #{refCode}</span>
            </div>
          </div>

          {/* ── Badges ─────────────────────────────── */}
          <div className="flex flex-wrap gap-2.5">
            {/* Type badge - highlighted */}
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-imperial-gold/10 border border-imperial-gold/30 rounded-lg text-imperial-gold font-body text-sm font-medium">
              <TypeIcon className="w-4 h-4" />
              {listingType.label}
            </span>
            {/* Condition badge */}
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-void-light border border-bone/10 rounded-lg text-bone/70 font-body text-sm">
              <Package className="w-4 h-4 text-bone/50" />
              {condition.label}
            </span>
            {/* Category badge */}
            {listing.category && (() => {
              const cat = categoryLabels[listing.category] || categoryLabels.miniatures
              const CatIcon = cat.icon
              return (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-void-light border border-bone/10 rounded-lg text-bone/70 font-body text-sm">
                  <CatIcon className="w-4 h-4 text-bone/50" />
                  {cat.label}
                </span>
              )
            })()}
            {/* Faction badge */}
            {listing.faction && (() => {
              const iconPath = FACTION_ICONS[listing.faction.slug]
              return (
                <span
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-body text-sm font-medium"
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
                      className="invert opacity-80"
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
            <div className="relative bg-void-light/40 rounded-xl border border-bone/5 p-5 overflow-hidden">
              {/* Left accent bookmark — Rogue Trader trade manifest feel */}
              <div className="absolute top-0 left-0 bottom-0 w-[2px] bg-gradient-to-b from-imperial-gold/30 via-imperial-gold/10 to-transparent rounded-l-xl" />

              <div className="flex items-center gap-2 mb-3">
                <ScrollText className="w-4 h-4 text-imperial-gold/60" />
                <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-imperial-gold/60">
                  Registro del Articulo <span className="text-imperial-gold/30">◆</span>
                </h3>
              </div>
              <p className="text-bone/70 font-body whitespace-pre-wrap leading-relaxed">
                {listing.description}
              </p>
            </div>
          </div>

          {/* ── Condition detail ────────────────────── */}
          <div className="p-4 bg-void-light/40 rounded-xl border border-bone/5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-imperial-gold/20 rounded-lg blur-sm" />
                <div className="relative p-2.5 bg-imperial-gold/10 rounded-lg border border-imperial-gold/20">
                  <Package className="w-5 h-5 text-imperial-gold" />
                </div>
              </div>
              <div>
                <p className="font-display font-semibold text-bone">
                  {condition.label}
                </p>
                <p className="text-sm text-bone/50 font-body">
                  {condition.description}
                </p>
              </div>
            </div>
          </div>

          {/* ── Location ───────────────────────────── */}
          {listing.location && (
            <div className="flex items-center gap-3 text-bone/50 px-1">
              <MapPin className="w-4 h-4 text-imperial-gold/50" />
              <span className="font-body text-sm">{listing.location}</span>
            </div>
          )}

          <OrnateDiv />

          {/* ── Seller Card ────────────────────────── */}
          <div className="relative bg-void-light/40 rounded-xl border border-bone/5 overflow-hidden">
            {/* Subtle top accent line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-imperial-gold/30 to-transparent" />

            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Compass className="w-3.5 h-3.5 text-imperial-gold/50" />
                <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-imperial-gold/50">
                  Capitan Mercante <span className="text-imperial-gold/25">◆</span> Vendedor
                </h3>
              </div>
              <div className="flex items-center justify-between">
                <Link
                  href={`/usuarios/${listing.profiles?.username}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-imperial-gold/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
                    <Avatar
                      src={listing.profiles?.avatar_url}
                      alt={listing.profiles?.display_name || listing.profiles?.username || 'Vendedor'}
                      fallback={listing.profiles?.username || 'V'}
                      size="lg"
                    />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-bone group-hover:text-imperial-gold transition-colors">
                      {listing.profiles?.display_name || listing.profiles?.username}
                    </p>
                    <p className="text-sm text-bone/40 font-body">
                      @{listing.profiles?.username}
                    </p>
                  </div>
                </Link>
                <Link
                  href={`/usuarios/${listing.profiles?.username}`}
                  className="p-2.5 text-bone/30 hover:text-imperial-gold transition-colors rounded-lg hover:bg-imperial-gold/5"
                >
                  <ExternalLink className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* ── Contact Error ──────────────────────── */}
          {contactError && !showContactModal && (
            <p className="text-sm text-red-400 text-center font-body">{contactError}</p>
          )}

          {/* ── Contact Button ─────────────────────── */}
          <motion.button
            onClick={handleOpenContact}
            className="relative w-full group overflow-hidden rounded-xl"
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
            <div className="relative flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-imperial-gold via-yellow-500 to-imperial-gold text-void font-display font-bold text-lg border border-imperial-gold/50">
              {/* Corner cuts */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-imperial-gold via-yellow-500 to-imperial-gold"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                }}
              />
              <span className="relative z-10 flex items-center gap-3">
                <MessageCircle className="w-5 h-5" />
                Iniciar Negociacion
              </span>
            </div>
          </motion.button>

          {/* ── Report link ────────────────────────── */}
          <button className="flex items-center gap-2 text-xs text-bone/30 hover:text-red-400 transition-colors mx-auto font-mono uppercase tracking-wider">
            <Flag className="w-3.5 h-3.5" />
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/85 backdrop-blur-md"
            onClick={() => setShowContactModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-void-light rounded-2xl max-w-md w-full border border-bone/10 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header accent */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-imperial-gold/50 to-transparent" />

              {/* Traveling golden shimmer — Rogue Trader */}
              <motion.div
                className="absolute top-0 left-0 w-20 h-[2px] bg-gradient-to-r from-transparent via-imperial-gold/40 to-transparent pointer-events-none"
                animate={{ left: ['-10%', '110%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.5 }}
              />

              <div className="p-6">
                {/* Modal header */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 bg-imperial-gold/10 rounded-lg border border-imperial-gold/20">
                    <Compass className="w-4 h-4 text-imperial-gold" />
                  </div>
                  <span className="text-xs font-mono uppercase tracking-[0.15em] text-imperial-gold/60">
                    Canal de Negociacion <span className="text-imperial-gold/30">◆</span>
                  </span>
                </div>

                <h3 className="text-xl font-display font-bold text-bone mb-2">
                  Contactar al vendedor
                </h3>
                <p className="text-bone/50 font-body text-sm mb-5">
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
                  className="w-full px-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/25 focus:outline-none focus:border-imperial-gold/40 focus:shadow-[0_0_0_3px_rgba(201,162,39,0.08)] resize-none mb-4 transition-all"
                />

                {contactError && (
                  <p className="text-sm text-red-400 font-body mb-4">{contactError}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowContactModal(false); setContactError(null) }}
                    className="flex-1 py-3 bg-void border border-bone/10 text-bone/50 font-display font-semibold rounded-xl hover:border-bone/20 hover:text-bone/70 transition-all"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    onClick={handleSendMessage}
                    disabled={isSending || !contactMessage.trim()}
                    className="flex-1 py-3 bg-imperial-gold text-void font-display font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    whileHover={{ scale: isSending ? 1 : 1.02 }}
                    whileTap={{ scale: isSending ? 1 : 0.98 }}
                  >
                    {isSending ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-void/30 border-t-void rounded-full"
                        />
                        Transmitiendo...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
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
    </>
  )
}
