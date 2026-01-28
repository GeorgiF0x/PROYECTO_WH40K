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
  const images = store.images && store.images.length > 0 ? store.images : ['/placeholder-miniature.jpg']

  const socialLinks = [
    store.instagram && { label: 'Instagram', url: `https://instagram.com/${store.instagram}`, icon: '📷' },
    store.facebook && { label: 'Facebook', url: store.facebook, icon: '📘' },
  ].filter(Boolean) as { label: string; url: string; icon: string }[]

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back button */}
      <Link
        href="/comunidad/tiendas"
        className="inline-flex items-center gap-2 text-bone/60 hover:text-imperial-gold transition-colors font-body mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a tiendas
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Images + Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image gallery */}
          <div className="relative rounded-2xl overflow-hidden bg-void-light border border-bone/10">
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
                    onClick={() => setCurrentImage((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-void/80 backdrop-blur-sm rounded-full text-bone hover:text-imperial-gold transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImage((prev) => (prev + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-void/80 backdrop-blur-sm rounded-full text-bone hover:text-imperial-gold transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImage(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${
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
          <div className="p-6 bg-void-light rounded-2xl border border-bone/10">
            {/* Type badge */}
            <span className="inline-block px-3 py-1 text-xs font-medium rounded-md bg-imperial-gold/20 text-imperial-gold border border-imperial-gold/30 mb-4">
              {storeTypeLabels[store.store_type] || store.store_type}
            </span>

            <h1 className="text-3xl font-display font-bold text-bone mb-2">
              {store.name}
            </h1>

            {/* Rating */}
            {store.review_count > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <RatingStars rating={Number(store.avg_rating)} showValue />
                <span className="text-sm text-bone/40 font-body">
                  ({store.review_count} {store.review_count === 1 ? 'valoracion' : 'valoraciones'})
                </span>
              </div>
            )}

            {/* Description */}
            {store.description && (
              <p className="text-bone/70 font-body leading-relaxed mb-6">
                {store.description}
              </p>
            )}

            {/* Services */}
            {store.services && store.services.length > 0 && (
              <div className="mb-6">
                <h3 className="font-display font-semibold text-bone mb-3">Servicios</h3>
                <StoreServiceBadges services={store.services} />
              </div>
            )}

            {/* Location Card */}
            <div className="p-4 bg-void/50 rounded-xl border border-imperial-gold/20">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-imperial-gold/20 rounded-lg">
                  <MapPin className="w-5 h-5 text-imperial-gold" />
                </div>
                <div className="flex-1">
                  <h4 className="font-display font-semibold text-bone text-sm mb-1">Ubicación</h4>
                  <p className="text-bone/80 font-body">{store.address}</p>
                  <p className="text-bone/60 font-body text-sm">
                    {store.postal_code && `${store.postal_code} - `}
                    {store.city}
                    {store.province && store.province !== store.city ? `, ${store.province}` : ''}
                  </p>
                  {store.country && store.country !== 'ES' && (
                    <p className="text-bone/40 font-body text-sm">{store.country}</p>
                  )}

                  {/* Google Maps link */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${store.name}, ${store.address}, ${store.city}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-imperial-gold/10 hover:bg-imperial-gold/20 border border-imperial-gold/30 rounded-lg text-imperial-gold text-sm font-mono transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Cómo llegar
                  </a>
                </div>
              </div>

              {/* Coordinates (for the curious) */}
              <div className="mt-3 pt-3 border-t border-bone/10 flex items-center justify-between">
                <span className="text-[10px] font-mono text-bone/30 tracking-wider">COORDENADAS</span>
                <span className="text-[10px] font-mono text-bone/40">
                  {store.latitude.toFixed(4)}°N, {Math.abs(store.longitude).toFixed(4)}°{store.longitude < 0 ? 'W' : 'E'}
                </span>
              </div>
            </div>
          </div>

          {/* Mini map - non expandable */}
          <div className="rounded-2xl overflow-hidden border border-bone/10">
            <CommunityMap
              stores={[{
                id: store.id,
                name: store.name,
                slug: store.slug,
                latitude: store.latitude,
                longitude: store.longitude,
                city: store.city,
                store_type: store.store_type,
                avg_rating: store.avg_rating,
                review_count: store.review_count,
              }]}
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
          <div className="p-6 bg-void-light rounded-2xl border border-bone/10 space-y-4">
            <h3 className="font-display font-semibold text-bone">Contacto</h3>

            {store.phone && (
              <a
                href={`tel:${store.phone}`}
                className="flex items-center gap-3 text-bone/60 hover:text-imperial-gold transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="font-body text-sm">{store.phone}</span>
              </a>
            )}

            {store.email && (
              <a
                href={`mailto:${store.email}`}
                className="flex items-center gap-3 text-bone/60 hover:text-imperial-gold transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="font-body text-sm truncate">{store.email}</span>
              </a>
            )}

            {store.website && (
              <a
                href={store.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-bone/60 hover:text-imperial-gold transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="font-body text-sm truncate">{store.website}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            )}

            {socialLinks.length > 0 && (
              <div className="pt-3 border-t border-bone/10 space-y-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-bone/60 hover:text-imperial-gold transition-colors"
                  >
                    <span>{link.icon}</span>
                    <span className="font-body text-sm">{link.label}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                ))}
              </div>
            )}

            {!store.phone && !store.email && !store.website && socialLinks.length === 0 && (
              <p className="text-sm text-bone/40 font-body">Sin informacion de contacto</p>
            )}
          </div>

          {/* Opening hours */}
          <div className="p-6 bg-void-light rounded-2xl border border-bone/10">
            <StoreHours hours={store.opening_hours} />
          </div>
        </div>
      </div>
    </div>
  )
}
