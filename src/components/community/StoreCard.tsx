'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MapPin, Star, Clock, ExternalLink } from 'lucide-react'
import type { Store } from '@/lib/types/database.types'
import StoreServiceBadges from './StoreServiceBadges'

export type StoreWithSubmitter = Store & {
  profiles?: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

interface StoreCardProps {
  store: StoreWithSubmitter
  index?: number
}

const storeTypeLabels: Record<string, { label: string; color: string }> = {
  specialist: { label: 'Especialista GW', color: 'bg-imperial-gold/20 text-imperial-gold border-imperial-gold/30' },
  comics_games: { label: 'Comics y juegos', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  general_hobby: { label: 'Hobby general', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  online_only: { label: 'Solo online', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
}

export default function StoreCard({ store, index = 0 }: StoreCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const thumbnailUrl = store.images?.[0] || '/placeholder-miniature.jpg'
  const storeType = storeTypeLabels[store.store_type] || storeTypeLabels.specialist

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <Link href={`/comunidad/tiendas/${store.slug}`}>
        <motion.article
          className="group relative bg-void-light rounded-xl overflow-hidden cursor-pointer"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileHover={{ y: -8 }}
          transition={{ duration: 0.3 }}
        >
          {/* Animated border glow */}
          <motion.div
            className="absolute -inset-[1px] rounded-xl z-0"
            style={{
              background: 'linear-gradient(135deg, #C9A227, transparent, #C9A227)',
              backgroundSize: '200% 200%',
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: isHovered ? 0.6 : 0,
              backgroundPosition: isHovered ? ['0% 0%', '100% 100%'] : '0% 0%',
            }}
            transition={{ duration: 0.3 }}
          />

          <div className="relative z-10 bg-void-light rounded-xl overflow-hidden">
            {/* Image */}
            <div className="relative aspect-[16/9] overflow-hidden">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-void animate-pulse">
                  <div className="absolute inset-0 bg-gradient-to-br from-bone/5 to-transparent" />
                </div>
              )}
              <Image
                src={thumbnailUrl}
                alt={store.name}
                fill
                className={`object-cover transition-all duration-700 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                } ${isHovered ? 'scale-110' : 'scale-100'}`}
                onLoad={() => setImageLoaded(true)}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent opacity-80" />

              {/* Store type badge */}
              <div className="absolute top-3 left-3">
                <span className={`px-2.5 py-1 text-xs font-medium rounded-md border ${storeType.color}`}>
                  {storeType.label}
                </span>
              </div>

              {/* Rating badge */}
              {(store.review_count ?? 0) > 0 && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-void/80 backdrop-blur-sm rounded-lg">
                  <Star className="w-3.5 h-3.5 text-imperial-gold fill-imperial-gold" />
                  <span className="text-sm font-bold text-imperial-gold">
                    {Number(store.avg_rating).toFixed(1)}
                  </span>
                  <span className="text-xs text-bone/50">({store.review_count})</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-display font-bold text-bone text-lg leading-tight line-clamp-1 group-hover:text-imperial-gold transition-colors duration-300">
                {store.name}
              </h3>

              {store.description && (
                <p className="mt-1 text-sm text-bone/50 line-clamp-2 font-body">
                  {store.description}
                </p>
              )}

              {/* Location */}
              <div className="mt-3 flex items-center gap-1.5 text-bone/40">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-body truncate">
                  {store.city}{store.province ? `, ${store.province}` : ''}
                </span>
              </div>

              {/* Services */}
              {store.services && store.services.length > 0 && (
                <div className="mt-3">
                  <StoreServiceBadges services={store.services.slice(0, 4)} compact />
                </div>
              )}

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-bone/10 flex items-center justify-between">
                {store.website && (
                  <span className="text-xs text-bone/40 font-body flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    Web
                  </span>
                )}
                <span className="text-xs text-imperial-gold/60 font-body ml-auto">
                  Ver detalle →
                </span>
              </div>
            </div>

            {/* Bottom accent */}
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-imperial-gold via-yellow-500 to-imperial-gold"
              initial={{ width: '0%' }}
              animate={{ width: isHovered ? '100%' : '0%' }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.article>
      </Link>
    </motion.div>
  )
}
