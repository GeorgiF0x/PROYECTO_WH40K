'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  ArrowLeft,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { Store } from '@/lib/types/database.types'
import RatingStars from './RatingStars'
import StoreServiceBadges from './StoreServiceBadges'
import StoreHours from './StoreHours'
import StoreReviews from './StoreReviews'
import dynamic from 'next/dynamic'

const CommunityMap = dynamic(() => import('./CommunityMap'), { ssr: false })

const storeTypeLabels: Record<string, string> = {
  specialist: 'Especialista Warhammer/GW',
  comics_games: 'Comics y juegos',
  general_hobby: 'Hobby general',
  online_only: 'Solo online',
}

interface StoreDetailProps {
  store: Store
  userId?: string
}

export default function StoreDetail({ store, userId }: StoreDetailProps) {
  const [currentImage, setCurrentImage] = useState(0)
  const images =
    store.images && store.images.length > 0 ? store.images : ['/placeholder-miniature.jpg']

  const socialLinks = [
    store.instagram && {
      label: 'Instagram',
      url: `https://instagram.com/${store.instagram}`,
      icon: '📷',
    },
    store.facebook && { label: 'Facebook', url: store.facebook, icon: '📘' },
  ].filter(Boolean) as { label: string; url: string; icon: string }[]

  return (
    <div className="mx-auto max-w-5xl">
      {/* Back button */}
      <Link
        href="/comunidad/tiendas"
        className="mb-6 inline-flex items-center gap-2 font-body text-bone/60 transition-colors hover:text-imperial-gold"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a tiendas
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left column: Images + Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Image gallery */}
          <div className="relative overflow-hidden rounded-2xl border border-bone/10 bg-void-light">
            <div className="relative aspect-[16/9]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={images[currentImage]}
                    alt={`${store.name} - Foto ${currentImage + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-void/80 p-2 text-bone backdrop-blur-sm transition-colors hover:text-imperial-gold"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImage((prev) => (prev + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-void/80 p-2 text-bone backdrop-blur-sm transition-colors hover:text-imperial-gold"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImage(i)}
                        className={`h-2 w-2 rounded-full transition-colors ${
                          i === currentImage ? 'bg-imperial-gold' : 'bg-bone/30'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Store info */}
          <div className="rounded-2xl border border-bone/10 bg-void-light p-6">
            {/* Type badge */}
            <span className="mb-4 inline-block rounded-md border border-imperial-gold/30 bg-imperial-gold/20 px-3 py-1 text-xs font-medium text-imperial-gold">
              {storeTypeLabels[store.store_type] || store.store_type}
            </span>

            <h1 className="mb-2 font-display text-3xl font-bold text-bone">{store.name}</h1>

            {/* Rating */}
            {(store.review_count ?? 0) > 0 && (
              <div className="mb-4 flex items-center gap-2">
                <RatingStars rating={Number(store.avg_rating)} showValue />
                <span className="font-body text-sm text-bone/40">
                  ({store.review_count} {store.review_count === 1 ? 'valoracion' : 'valoraciones'})
                </span>
              </div>
            )}

            {/* Description */}
            {store.description && (
              <p className="mb-6 font-body leading-relaxed text-bone/70">{store.description}</p>
            )}

            {/* Services */}
            {store.services && store.services.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 font-display font-semibold text-bone">Servicios</h3>
                <StoreServiceBadges services={store.services} />
              </div>
            )}

            {/* Location Card */}
            <div className="rounded-xl border border-imperial-gold/20 bg-void/50 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-imperial-gold/20 p-2">
                  <MapPin className="h-5 w-5 text-imperial-gold" />
                </div>
                <div className="flex-1">
                  <h4 className="mb-1 font-display text-sm font-semibold text-bone">Ubicación</h4>
                  <p className="font-body text-bone/80">{store.address}</p>
                  <p className="font-body text-sm text-bone/60">
                    {store.postal_code && `${store.postal_code} - `}
                    {store.city}
                    {store.province && store.province !== store.city ? `, ${store.province}` : ''}
                  </p>
                  {store.country && store.country !== 'ES' && (
                    <p className="font-body text-sm text-bone/40">{store.country}</p>
                  )}

                  {/* Google Maps link */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${store.name}, ${store.address}, ${store.city}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-imperial-gold/30 bg-imperial-gold/10 px-3 py-1.5 font-mono text-sm text-imperial-gold transition-colors hover:bg-imperial-gold/20"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Cómo llegar
                  </a>
                </div>
              </div>

              {/* Coordinates (for the curious) */}
              <div className="mt-3 flex items-center justify-between border-t border-bone/10 pt-3">
                <span className="font-mono text-[10px] tracking-wider text-bone/30">
                  COORDENADAS
                </span>
                <span className="font-mono text-[10px] text-bone/40">
                  {store.latitude.toFixed(4)}°N, {Math.abs(store.longitude).toFixed(4)}°
                  {store.longitude < 0 ? 'W' : 'E'}
                </span>
              </div>
            </div>
          </div>

          {/* Mini map - non expandable */}
          <div className="overflow-hidden rounded-2xl border border-bone/10">
            <CommunityMap
              stores={[
                {
                  id: store.id,
                  name: store.name,
                  slug: store.slug,
                  latitude: store.latitude,
                  longitude: store.longitude,
                  city: store.city,
                  store_type: store.store_type,
                  avg_rating: store.avg_rating,
                  review_count: store.review_count,
                },
              ]}
              center={[store.longitude, store.latitude]}
              zoom={15}
              interactive={true}
              showExpandButton={false}
              className="h-[300px]"
            />
          </div>

          {/* Reviews */}
          <StoreReviews storeId={store.id} userId={userId} />
        </div>

        {/* Right column: Contact + Hours */}
        <div className="space-y-6">
          {/* Contact info */}
          <div className="space-y-4 rounded-2xl border border-bone/10 bg-void-light p-6">
            <h3 className="font-display font-semibold text-bone">Contacto</h3>

            {store.phone && (
              <a
                href={`tel:${store.phone}`}
                className="flex items-center gap-3 text-bone/60 transition-colors hover:text-imperial-gold"
              >
                <Phone className="h-4 w-4" />
                <span className="font-body text-sm">{store.phone}</span>
              </a>
            )}

            {store.email && (
              <a
                href={`mailto:${store.email}`}
                className="flex items-center gap-3 text-bone/60 transition-colors hover:text-imperial-gold"
              >
                <Mail className="h-4 w-4" />
                <span className="truncate font-body text-sm">{store.email}</span>
              </a>
            )}

            {store.website && (
              <a
                href={store.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-bone/60 transition-colors hover:text-imperial-gold"
              >
                <Globe className="h-4 w-4" />
                <span className="truncate font-body text-sm">{store.website}</span>
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </a>
            )}

            {socialLinks.length > 0 && (
              <div className="space-y-3 border-t border-bone/10 pt-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-bone/60 transition-colors hover:text-imperial-gold"
                  >
                    <span>{link.icon}</span>
                    <span className="font-body text-sm">{link.label}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                ))}
              </div>
            )}

            {!store.phone && !store.email && !store.website && socialLinks.length === 0 && (
              <p className="font-body text-sm text-bone/40">Sin informacion de contacto</p>
            )}
          </div>

          {/* Opening hours */}
          <div className="rounded-2xl border border-bone/10 bg-void-light p-6">
            <StoreHours hours={store.opening_hours} />
          </div>
        </div>
      </div>
    </div>
  )
}
