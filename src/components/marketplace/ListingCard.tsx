'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, MapPin, Tag, Eye, MessageCircle, Package } from 'lucide-react'
import { Avatar } from '@/components/ui'
import type { Listing, Profile } from '@/lib/types/database.types'

export type ListingWithSeller = Listing & {
  profiles?: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
  is_favorited?: boolean
}

interface ListingCardProps {
  listing: ListingWithSeller
  index?: number
}

const conditionLabels: Record<string, { label: string; color: string }> = {
  nib: { label: 'Nuevo en caja', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  nos: { label: 'Nuevo sin caja', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  assembled: { label: 'Montado', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  painted: { label: 'Pintado', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  pro_painted: { label: 'Pro Painted', color: 'bg-imperial-gold/20 text-imperial-gold border-imperial-gold/30' },
}

const typeLabels: Record<string, string> = {
  sale: 'Venta',
  trade: 'Intercambio',
  both: 'Venta/Intercambio',
}

export default function ListingCard({ listing, index = 0 }: ListingCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isFavorited, setIsFavorited] = useState(listing.is_favorited || false)

  const thumbnailUrl = listing.images?.[0] || '/placeholder-miniature.jpg'
  const condition = conditionLabels[listing.condition] || conditionLabels.assembled

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorited(!isFavorited)
    // TODO: Implementar llamada a Supabase
  }

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
      <Link href={`/mercado/${listing.id}`}>
        <motion.article
          className="group relative bg-void-light rounded-xl overflow-hidden cursor-pointer"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileHover={{ y: -8 }}
          transition={{ duration: 0.3 }}
        >
          {/* Animated border glow on hover */}
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

          {/* Card content */}
          <div className="relative z-10 bg-void-light rounded-xl overflow-hidden">
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden">
              {/* Loading skeleton */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-void animate-pulse">
                  <div className="absolute inset-0 bg-gradient-to-br from-bone/5 to-transparent" />
                </div>
              )}

              {/* Main Image */}
              <Image
                src={thumbnailUrl}
                alt={listing.title}
                fill
                className={`object-cover transition-all duration-700 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                } ${isHovered ? 'scale-110' : 'scale-100'}`}
                onLoad={() => setImageLoaded(true)}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent opacity-80" />

              {/* Price badge */}
              <div className="absolute top-3 left-3">
                <div className="px-3 py-1.5 bg-imperial-gold text-void font-display font-bold text-lg rounded-lg shadow-lg">
                  {listing.price}€
                </div>
              </div>

              {/* Favorite button */}
              <motion.button
                className="absolute top-3 right-3 p-2 bg-void/80 backdrop-blur-sm rounded-lg"
                onClick={handleFavorite}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isFavorited ? 'text-red-500 fill-red-500' : 'text-bone/60 hover:text-red-400'
                  }`}
                />
              </motion.button>

              {/* Condition badge */}
              <div className="absolute bottom-3 left-3">
                <span className={`px-2.5 py-1 text-xs font-medium rounded-md border ${condition.color}`}>
                  {condition.label}
                </span>
              </div>

              {/* Type badge */}
              <div className="absolute bottom-3 right-3">
                <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-void/80 text-bone/80 border border-bone/20">
                  {typeLabels[listing.listing_type]}
                </span>
              </div>
            </div>

            {/* Info Section */}
            <div className="p-4">
              {/* Title */}
              <h3 className="font-display font-bold text-bone text-lg leading-tight line-clamp-1 group-hover:text-imperial-gold transition-colors duration-300">
                {listing.title}
              </h3>

              {/* Description preview */}
              <p className="mt-1 text-sm text-bone/50 line-clamp-2 font-body">
                {listing.description}
              </p>

              {/* Location */}
              {listing.location && (
                <div className="mt-3 flex items-center gap-1.5 text-bone/40">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-body truncate">{listing.location}</span>
                </div>
              )}

              {/* Footer with seller info */}
              <div className="mt-4 pt-4 border-t border-bone/10 flex items-center justify-between">
                {/* Seller */}
                <div className="flex items-center gap-2">
                  {listing.profiles ? (
                    <>
                      <Avatar
                        src={listing.profiles.avatar_url}
                        alt={listing.profiles.display_name || listing.profiles.username}
                        fallback={listing.profiles.username}
                        size="xs"
                      />
                      <span className="text-sm text-bone/60 font-body truncate max-w-[100px]">
                        {listing.profiles.display_name || listing.profiles.username}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-bone/40 font-body">Vendedor</span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 text-bone/40">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span className="text-xs">{listing.views_count || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom accent line */}
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
