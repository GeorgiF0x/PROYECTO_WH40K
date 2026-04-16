'use client'

import { memo, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Heart,
  MapPin,
  Tag,
  Eye,
  MessageCircle,
  Package,
  Swords,
  BookOpen,
  BookMarked,
  Paintbrush,
  Wrench,
  Mountain,
  Dice5,
} from 'lucide-react'
import type { ListingCategory } from '@/lib/types/database.types'
import { Avatar } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { optimizeImageUrl } from '@/lib/utils'
import type { Listing, Profile } from '@/lib/types/database.types'
import { FACTION_ICONS } from '@/components/user/FactionSelector'

export type ListingWithSeller = Listing & {
  profiles?: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
  faction?: {
    id: string
    name: string
    slug: string
    primary_color: string | null
  } | null
  is_favorited?: boolean
}

interface ListingCardProps {
  listing: ListingWithSeller
  index?: number
}

const conditionLabels: Record<string, { label: string; color: string }> = {
  nib: { label: 'Nuevo en caja', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  nos: {
    label: 'Nuevo sin caja',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  assembled: { label: 'Montado', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  painted: { label: 'Pintado', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  pro_painted: {
    label: 'Pro Painted',
    color: 'bg-imperial-gold/20 text-imperial-gold border-imperial-gold/30',
  },
}

const typeLabels: Record<string, string> = {
  sale: 'Venta',
  trade: 'Intercambio',
  both: 'Venta/Intercambio',
}

const categoryConfig: Record<string, { label: string; icon: typeof Swords }> = {
  miniatures: { label: 'Miniaturas', icon: Swords },
  novels: { label: 'Novelas', icon: BookOpen },
  codex: { label: 'Codex', icon: BookMarked },
  paints: { label: 'Pinturas', icon: Paintbrush },
  tools: { label: 'Herramientas', icon: Wrench },
  terrain: { label: 'Terreno', icon: Mountain },
  accessories: { label: 'Accesorios', icon: Dice5 },
  other: { label: 'Otros', icon: Package },
}

function ListingCard({ listing, index = 0 }: ListingCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isFavorited, setIsFavorited] = useState(listing.is_favorited || false)
  const { user } = useAuth()
  const supabase = createClient()

  const thumbnailUrl = optimizeImageUrl(listing.images?.[0], 600)
  const condition = conditionLabels[listing.condition] || conditionLabels.assembled

  const handleFavorite = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!user) return

      // Ensure we have a fresh session before the request
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return

      const newFavorited = !isFavorited
      setIsFavorited(newFavorited) // Optimistic update

      if (newFavorited) {
        const { error } = await supabase
          .from('listing_favorites')
          .insert({ listing_id: listing.id, user_id: user.id })
        if (error) setIsFavorited(false) // Rollback
      } else {
        const { error } = await supabase
          .from('listing_favorites')
          .delete()
          .eq('listing_id', listing.id)
          .eq('user_id', user.id)
        if (error) setIsFavorited(true) // Rollback
      }
    },
    [user, isFavorited, supabase, listing.id]
  )

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
          className="group relative cursor-pointer overflow-hidden rounded-xl bg-void-light"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileHover={{ y: -8 }}
          transition={{ duration: 0.3 }}
        >
          {/* Animated border glow on hover */}
          <motion.div
            className="absolute -inset-[1px] z-0 rounded-xl"
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
          <div className="relative z-10 overflow-hidden rounded-xl bg-void-light">
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden">
              {/* Loading skeleton */}
              {!imageLoaded && (
                <div className="absolute inset-0 animate-pulse bg-void">
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
              <div className="absolute left-3 top-3">
                <div className="rounded-lg bg-imperial-gold px-3 py-1.5 font-display text-lg font-bold text-void shadow-lg">
                  {listing.price}€
                </div>
              </div>

              {/* Favorite button */}
              <motion.button
                className="absolute right-3 top-3 rounded-lg bg-void/80 p-2 backdrop-blur-sm"
                onClick={handleFavorite}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart
                  className={`h-5 w-5 transition-colors ${
                    isFavorited ? 'fill-red-500 text-red-500' : 'text-bone/60 hover:text-red-400'
                  }`}
                />
              </motion.button>

              {/* Condition badge */}
              <div className="absolute bottom-3 left-3">
                <span
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium ${condition.color}`}
                >
                  {condition.label}
                </span>
              </div>

              {/* Type badge */}
              <div className="absolute bottom-3 right-3">
                <span className="rounded-md border border-bone/20 bg-void/80 px-2.5 py-1 text-xs font-medium text-bone/80">
                  {typeLabels[listing.listing_type]}
                </span>
              </div>
            </div>

            {/* Info Section */}
            <div className="p-4">
              {/* Title */}
              <h3 className="line-clamp-1 font-display text-lg font-bold leading-tight text-bone transition-colors duration-300 group-hover:text-imperial-gold">
                {listing.title}
              </h3>

              {/* Category & Faction badges */}
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {listing.category &&
                  listing.category !== 'miniatures' &&
                  (() => {
                    const cat = categoryConfig[listing.category] || categoryConfig.other
                    const CatIcon = cat.icon
                    return (
                      <span className="inline-flex items-center gap-1 rounded-md border border-imperial-gold/20 bg-imperial-gold/10 px-2 py-0.5 font-body text-xs text-imperial-gold/70">
                        <CatIcon className="h-3 w-3" />
                        {cat.label}
                      </span>
                    )
                  })()}
                {listing.faction &&
                  (() => {
                    const iconPath = FACTION_ICONS[listing.faction.slug]
                    return (
                      <span
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-body text-xs"
                        style={{
                          color: listing.faction.primary_color || '#C9A227',
                          borderColor: `${listing.faction.primary_color || '#C9A227'}40`,
                          backgroundColor: `${listing.faction.primary_color || '#C9A227'}15`,
                        }}
                      >
                        {iconPath && (
                          <Image
                            src={iconPath}
                            alt={listing.faction.name}
                            width={12}
                            height={12}
                            className="opacity-70 invert"
                          />
                        )}
                        {listing.faction.name}
                      </span>
                    )
                  })()}
              </div>

              {/* Description preview */}
              <p className="mt-1 line-clamp-2 font-body text-sm text-bone/50">
                {listing.description}
              </p>

              {/* Location */}
              {listing.location && (
                <div className="mt-3 flex items-center gap-1.5 text-bone/40">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate font-body text-sm">{listing.location}</span>
                </div>
              )}

              {/* Footer with seller info */}
              <div className="mt-4 flex items-center justify-between border-t border-bone/10 pt-4">
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
                      <span className="max-w-[100px] truncate font-body text-sm text-bone/60">
                        {listing.profiles.display_name || listing.profiles.username}
                      </span>
                    </>
                  ) : (
                    <span className="font-body text-sm text-bone/40">Vendedor</span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 text-bone/40">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
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

export default memo(ListingCard)
