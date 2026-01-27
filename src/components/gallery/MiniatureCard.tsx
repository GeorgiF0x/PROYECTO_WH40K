'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Eye, User } from 'lucide-react'
import { Avatar } from '@/components/ui'
import type { Miniature } from '@/lib/types/database.types'

// Flexible profile type that works with partial data from queries
export type PartialProfile = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
} | null

export type MiniatureWithStats = Miniature & {
  profiles?: PartialProfile
  likes_count?: number
  comments_count?: number
  user_has_liked?: boolean
}

interface MiniatureCardProps {
  miniature: MiniatureWithStats
  index?: number
  variant?: 'card' | 'list'
}

export default function MiniatureCard({ miniature, index = 0, variant = 'card' }: MiniatureCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const thumbnailUrl = miniature.thumbnail_url || miniature.images?.[0] || '/placeholder-miniature.jpg'

  // ── List variant ────────────────────────────────────
  if (variant === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: index * 0.03 }}
      >
        <Link href={`/galeria/${miniature.id}`}>
          <motion.article
            className="group relative flex bg-void-light rounded-xl overflow-hidden cursor-pointer border border-bone/5"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            {/* Animated border glow on hover */}
            <motion.div
              className="absolute -inset-[1px] rounded-xl z-0"
              style={{ background: 'linear-gradient(135deg, #0D9B8A, transparent, #0D9B8A)', backgroundSize: '200% 200%' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 0.5 : 0 }}
              transition={{ duration: 0.3 }}
            />

            <div className="relative z-10 flex w-full bg-void-light rounded-xl overflow-hidden">
              {/* Thumbnail */}
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0 overflow-hidden">
                <Image
                  src={thumbnailUrl}
                  alt={miniature.title}
                  fill
                  className={`object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
                  onLoad={() => setImageLoaded(true)}
                  sizes="150px"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-void-light/30" />
              </div>

              {/* Content */}
              <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                <div>
                  <h3 className="font-display font-bold text-bone text-base leading-tight line-clamp-1 group-hover:text-necron-dark transition-colors duration-300">
                    {miniature.title}
                  </h3>
                  {miniature.description && (
                    <p className="mt-1 text-sm text-bone/50 line-clamp-2 font-body">
                      {miniature.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-2">
                  {/* Author */}
                  <div className="flex items-center gap-2">
                    {miniature.profiles ? (
                      <>
                        <Avatar
                          src={miniature.profiles.avatar_url}
                          alt={miniature.profiles.display_name || miniature.profiles.username}
                          fallback={miniature.profiles.username}
                          size="xs"
                        />
                        <span className="text-xs text-bone/60 font-body truncate max-w-[100px]">
                          {miniature.profiles.display_name || miniature.profiles.username}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-5 h-5 rounded-full bg-bone/10 flex items-center justify-center">
                          <User className="w-3 h-3 text-bone/40" />
                        </div>
                        <span className="text-xs text-bone/40 font-body">Anónimo</span>
                      </>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Heart className={`w-3.5 h-3.5 ${miniature.user_has_liked ? 'text-red-500 fill-red-500' : 'text-bone/40'}`} />
                      <span className="text-xs text-bone/50">{miniature.likes_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-bone/40" />
                      <span className="text-xs text-bone/50">{miniature.comments_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-bone/40" />
                      <span className="text-xs text-bone/50">{miniature.view_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom accent line */}
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-necron-teal via-necron to-necron-teal z-10"
              initial={{ width: '0%' }}
              animate={{ width: isHovered ? '100%' : '0%' }}
              transition={{ duration: 0.3 }}
            />
          </motion.article>
        </Link>
      </motion.div>
    )
  }

  // ── Card variant (default) ──────────────────────────
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
      <Link href={`/galeria/${miniature.id}`}>
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
              background: 'linear-gradient(135deg, #0D9B8A, transparent, #0D9B8A)',
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
            <div className="relative aspect-[4/5] overflow-hidden">
              {/* Loading skeleton */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-void animate-pulse">
                  <div className="absolute inset-0 bg-gradient-to-br from-bone/5 to-transparent" />
                </div>
              )}

              {/* Main Image */}
              <Image
                src={thumbnailUrl}
                alt={miniature.title}
                fill
                className={`object-cover transition-all duration-700 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                } ${isHovered ? 'scale-110' : 'scale-100'}`}
                onLoad={() => setImageLoaded(true)}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />

              {/* Gradient overlay - bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent opacity-80" />

              {/* Hover overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/50 to-necron-teal/[0.03]"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />

              {/* Stats on hover */}
              <motion.div
                className="absolute top-4 right-4 flex flex-col gap-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-void/80 backdrop-blur-sm rounded-lg">
                  <Heart className="w-4 h-4 text-bone/60" />
                  <span className="text-xs font-medium text-bone/80">
                    {miniature.likes_count || 0}
                  </span>
                </div>
              </motion.div>

              {/* Quick actions on hover */}
              <motion.div
                className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <motion.button
                  className="flex items-center gap-2 px-4 py-2 bg-necron-teal text-void font-semibold text-sm rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => e.preventDefault()}
                >
                  <Eye className="w-4 h-4" />
                  Ver Detalle
                </motion.button>
              </motion.div>
            </div>

            {/* Info Section */}
            <div className="p-4">
              {/* Title */}
              <h3 className="font-display font-bold text-bone text-lg leading-tight line-clamp-1 group-hover:text-necron-dark transition-colors duration-300">
                {miniature.title}
              </h3>

              {/* Description preview */}
              {miniature.description && (
                <p className="mt-1 text-sm text-bone/50 line-clamp-2 font-body">
                  {miniature.description}
                </p>
              )}

              {/* Footer with author and stats */}
              <div className="mt-4 flex items-center justify-between">
                {/* Author */}
                <div className="flex items-center gap-2">
                  {miniature.profiles ? (
                    <>
                      <Avatar
                        src={miniature.profiles.avatar_url}
                        alt={miniature.profiles.display_name || miniature.profiles.username}
                        fallback={miniature.profiles.username}
                        size="xs"
                      />
                      <span className="text-sm text-bone/60 font-body truncate max-w-[100px]">
                        {miniature.profiles.display_name || miniature.profiles.username}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-6 h-6 rounded-full bg-bone/10 flex items-center justify-center">
                        <User className="w-3 h-3 text-bone/40" />
                      </div>
                      <span className="text-sm text-bone/40 font-body">Anónimo</span>
                    </>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3">
                  <motion.div
                    className="flex items-center gap-1"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        miniature.user_has_liked
                          ? 'text-red-500 fill-red-500'
                          : 'text-bone/40'
                      }`}
                    />
                    <span className="text-xs text-bone/50">
                      {miniature.likes_count || 0}
                    </span>
                  </motion.div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4 text-bone/40" />
                    <span className="text-xs text-bone/50">
                      {miniature.comments_count || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inner glow on hover */}
            <motion.div
              className="absolute inset-0 pointer-events-none rounded-xl bg-[radial-gradient(ellipse_at_bottom,rgba(13,155,138,0.04)_0%,transparent_70%)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />

            {/* Bottom accent line */}
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-necron-teal via-necron to-necron-teal"
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
