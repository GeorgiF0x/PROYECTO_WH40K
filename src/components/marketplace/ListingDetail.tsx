'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar } from '@/components/ui'
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Calendar,
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
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { getOrCreateConversation, sendMessage } from '@/lib/services/messages'
import type { ListingWithSeller } from './ListingCard'

const conditionLabels: Record<string, { label: string; description: string }> = {
  nib: { label: 'Nuevo en caja', description: 'Producto sin abrir, precintado' },
  nos: { label: 'Nuevo sin caja', description: 'Sin usar pero sin caja original' },
  assembled: { label: 'Montado', description: 'Montado pero sin pintar' },
  painted: { label: 'Pintado', description: 'Pintado a nivel tabletop' },
  pro_painted: { label: 'Pro Painted', description: 'Pintado a nivel profesional/competición' },
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

interface ListingDetailProps {
  listing: ListingWithSeller
}

export default function ListingDetail({ listing }: ListingDetailProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
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

  const condition = conditionLabels[listing.condition] || conditionLabels.assembled
  const listingType = typeLabels[listing.listing_type] || typeLabels.sale
  const TypeIcon = listingType.icon
  const images = listing.images?.length > 0 ? listing.images : ['/placeholder-miniature.jpg']
  const createdDate = new Date(listing.created_at).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-void-light">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
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

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-void/80 backdrop-blur-sm rounded-full text-bone hover:bg-imperial-gold hover:text-void transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-void/80 backdrop-blur-sm rounded-full text-bone hover:bg-imperial-gold hover:text-void transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-void/80 backdrop-blur-sm rounded-full text-sm text-bone font-body">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}

            {/* Price badge */}
            <div className="absolute top-4 left-4">
              <div className="px-4 py-2 bg-imperial-gold text-void font-display font-bold text-2xl rounded-xl shadow-lg">
                {listing.price}€
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
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    index === currentImageIndex
                      ? 'border-imperial-gold'
                      : 'border-transparent hover:border-bone/30'
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

        {/* Listing Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Title and actions */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-bone">
                {listing.title}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-bone/50 text-sm font-body">
                  <Calendar className="w-4 h-4" />
                  {createdDate}
                </span>
                <span className="flex items-center gap-1.5 text-bone/50 text-sm font-body">
                  <Eye className="w-4 h-4" />
                  {listing.views_count || 0} visitas
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setIsFavorited(!isFavorited)}
                className={`p-3 rounded-xl border transition-colors ${
                  isFavorited
                    ? 'bg-red-500/20 border-red-500/50 text-red-500'
                    : 'bg-void-light border-bone/10 text-bone/60 hover:border-imperial-gold/30'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </motion.button>
              <motion.button
                onClick={handleShare}
                className="p-3 rounded-xl bg-void-light border border-bone/10 text-bone/60 hover:border-imperial-gold/30 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-imperial-gold/10 border border-imperial-gold/30 rounded-lg text-imperial-gold font-body">
              <TypeIcon className="w-4 h-4" />
              {listingType.label}
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-void-light border border-bone/10 rounded-lg text-bone/80 font-body">
              <Package className="w-4 h-4" />
              {condition.label}
            </span>
            {listing.category && (() => {
              const cat = categoryLabels[listing.category] || categoryLabels.miniatures
              const CatIcon = cat.icon
              return (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-void-light border border-bone/10 rounded-lg text-bone/80 font-body">
                  <CatIcon className="w-4 h-4" />
                  {cat.label}
                </span>
              )
            })()}
          </div>

          {/* Description */}
          <div className="prose prose-invert max-w-none">
            <h3 className="text-lg font-display font-semibold text-bone mb-2">
              Descripción
            </h3>
            <p className="text-bone/70 font-body whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>

          {/* Condition detail */}
          <div className="p-4 bg-void-light rounded-xl border border-bone/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-imperial-gold/20 rounded-lg">
                <Package className="w-5 h-5 text-imperial-gold" />
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

          {/* Location */}
          {listing.location && (
            <div className="flex items-center gap-3 text-bone/60">
              <MapPin className="w-5 h-5" />
              <span className="font-body">{listing.location}</span>
            </div>
          )}

          {/* Seller Card */}
          <div className="p-5 bg-void-light rounded-xl border border-bone/10">
            <h3 className="text-sm font-body text-bone/50 mb-4">Vendedor</h3>
            <div className="flex items-center justify-between">
              <Link
                href={`/usuarios/${listing.profiles?.username}`}
                className="flex items-center gap-3 group"
              >
                <Avatar
                  src={listing.profiles?.avatar_url}
                  alt={listing.profiles?.display_name || listing.profiles?.username || 'Vendedor'}
                  fallback={listing.profiles?.username || 'V'}
                  size="lg"
                />
                <div>
                  <p className="font-display font-semibold text-bone group-hover:text-imperial-gold transition-colors">
                    {listing.profiles?.display_name || listing.profiles?.username}
                  </p>
                  <p className="text-sm text-bone/50 font-body">
                    @{listing.profiles?.username}
                  </p>
                </div>
              </Link>
              <Link
                href={`/usuarios/${listing.profiles?.username}`}
                className="p-2 text-bone/40 hover:text-imperial-gold transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Contact Error */}
          {contactError && !showContactModal && (
            <p className="text-sm text-red-400 text-center font-body">{contactError}</p>
          )}

          {/* Contact Button */}
          <motion.button
            onClick={handleOpenContact}
            className="w-full py-4 bg-gradient-to-r from-imperial-gold to-yellow-500 text-void font-display font-bold text-lg rounded-xl"
            whileHover={{
              scale: 1.02,
              boxShadow: '0 10px 40px rgba(201, 162, 39, 0.3)',
            }}
            whileTap={{ scale: 0.98 }}
          >
            <MessageCircle className="w-5 h-5 inline mr-2" />
            Contactar al vendedor
          </motion.button>

          {/* Report link */}
          <button className="flex items-center gap-2 text-sm text-bone/40 hover:text-red-400 transition-colors mx-auto font-body">
            <Flag className="w-4 h-4" />
            Reportar anuncio
          </button>
        </motion.div>
      </div>

      {/* Contact Modal */}
      <AnimatePresence>
        {showContactModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm"
            onClick={() => setShowContactModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-void-light rounded-2xl p-6 max-w-md w-full border border-bone/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-display font-bold text-bone mb-4">
                Contactar al vendedor
              </h3>
              <p className="text-bone/60 font-body mb-6">
                Envía un mensaje a {listing.profiles?.display_name || listing.profiles?.username} para
                preguntar sobre este artículo o acordar la compra/intercambio.
              </p>
              <textarea
                placeholder="Escribe tu mensaje..."
                rows={4}
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="w-full px-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 resize-none mb-4"
              />
              {contactError && (
                <p className="text-sm text-red-400 font-body mb-4">{contactError}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowContactModal(false); setContactError(null) }}
                  className="flex-1 py-3 bg-void border border-bone/10 text-bone/60 font-display font-semibold rounded-xl hover:border-bone/30 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={isSending || !contactMessage.trim()}
                  className="flex-1 py-3 bg-imperial-gold text-void font-display font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? 'Enviando...' : 'Enviar mensaje'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
