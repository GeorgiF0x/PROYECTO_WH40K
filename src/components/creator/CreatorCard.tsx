'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Users, ImageIcon, ExternalLink, Feather, ScrollText, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CreatorBadge, creatorTypeConfig } from './CreatorBadge'
import type { PublicCreator } from '@/lib/types/database.types'

interface CreatorCardProps {
  creator: PublicCreator
  index?: number
  featured?: boolean
}

// Gothic corner bracket for cards
function CardCorner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const transforms: Record<string, string> = {
    tl: '',
    tr: 'scaleX(-1)',
    bl: 'scaleY(-1)',
    br: 'scale(-1)',
  }

  const positions: Record<string, string> = {
    tl: 'top-0 left-0',
    tr: 'top-0 right-0',
    bl: 'bottom-0 left-0',
    br: 'bottom-0 right-0',
  }

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={cn(
        'absolute text-imperial-gold/40 transition-colors group-hover:text-imperial-gold/70',
        positions[position]
      )}
      style={{ transform: transforms[position] }}
    >
      <path d="M0 24 L0 8 Q0 0 8 0 L24 0" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="3" cy="3" r="1.5" fill="currentColor" opacity="0.6" />
    </svg>
  )
}

// Quill decoration
function QuillDecoration({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="h-px w-4 bg-gradient-to-r from-transparent to-imperial-gold/30" />
      <Feather className="h-3 w-3 text-imperial-gold/50" />
      <div className="h-px w-4 bg-gradient-to-l from-transparent to-imperial-gold/30" />
    </div>
  )
}

function CreatorCardImpl({ creator, index = 0, featured = false }: CreatorCardProps) {
  const config = creator.creator_type ? creatorTypeConfig[creator.creator_type] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative"
    >
      <Link href={`/usuarios/${creator.username}`}>
        <div
          className={cn(
            'relative overflow-hidden rounded-lg transition-all duration-300',
            // Parchment-like base
            'bg-gradient-to-b from-void-light/90 to-void/95',
            'border border-imperial-gold/20',
            // Hover effects
            'hover:border-imperial-gold/50 hover:shadow-lg hover:shadow-imperial-gold/10',
            'hover:-translate-y-1',
            featured && 'border-imperial-gold/40 shadow-md shadow-imperial-gold/5'
          )}
        >
          {/* Corner brackets */}
          <CardCorner position="tl" />
          <CardCorner position="tr" />
          <CardCorner position="bl" />
          <CardCorner position="br" />

          {/* Featured badge - wax seal style */}
          {featured && (
            <div className="absolute right-3 top-3 z-10">
              <div className="relative">
                <div className="from-blood-red to-blood-red/80 flex h-8 w-8 items-center justify-center rounded-full border border-imperial-gold/50 bg-gradient-to-br shadow-lg">
                  <Sparkles className="h-4 w-4 text-imperial-gold" />
                </div>
                <div className="absolute inset-0 animate-pulse rounded-full bg-imperial-gold/20" />
              </div>
            </div>
          )}

          {/* Verified indicator - small LED */}
          {creator.creator_verified_at && (
            <div className="absolute left-3 top-3 z-10">
              <div className="flex items-center gap-1.5 rounded border border-imperial-gold/30 bg-void/80 px-2 py-0.5">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                <span className="font-mono text-[9px] uppercase tracking-wider text-bone/60">
                  Verificado
                </span>
              </div>
            </div>
          )}

          {/* Avatar section with illuminated border */}
          <div className="relative px-4 pb-2 pt-6">
            <div className="relative mx-auto h-20 w-20 sm:h-24 sm:w-24">
              {/* Outer glow ring - uses creator type color */}
              <div
                className="absolute -inset-1 rounded-full opacity-40 blur-sm"
                style={{
                  background: config
                    ? `radial-gradient(circle, ${config.colorHex}60 0%, transparent 70%)`
                    : 'radial-gradient(circle, rgba(201, 162, 39, 0.4) 0%, transparent 70%)',
                }}
              />

              {/* Decorative ring */}
              <div
                className="absolute -inset-0.5 rounded-full"
                style={{
                  background: config
                    ? `linear-gradient(135deg, ${config.colorHex}40 0%, transparent 50%, ${config.colorHex}20 100%)`
                    : 'linear-gradient(135deg, rgba(201, 162, 39, 0.3) 0%, transparent 50%, rgba(201, 162, 39, 0.15) 100%)',
                  padding: '2px',
                }}
              />

              {/* Avatar container */}
              <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-imperial-gold/30 bg-void transition-colors group-hover:border-imperial-gold/60">
                {creator.avatar_url ? (
                  <Image
                    src={creator.avatar_url}
                    alt={creator.display_name || creator.username || 'Creator'}
                    fill
                    sizes="(max-width: 640px) 80px, 96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-void-light">
                    <span className="font-display text-2xl font-bold text-imperial-gold/60">
                      {(creator.display_name || creator.username || 'C').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content section */}
          <div className="px-4 pb-4 text-center">
            {/* Name with manuscript styling */}
            <h3 className="truncate font-display text-lg font-bold text-bone transition-colors group-hover:text-imperial-gold">
              {creator.display_name || creator.username}
            </h3>
            <p className="mb-2 font-mono text-xs tracking-wider text-bone/40">
              @{creator.username}
            </p>

            {/* Decorative divider */}
            <QuillDecoration className="mb-2 justify-center" />

            {/* Creator badge - Order title */}
            {creator.creator_type && (
              <div className="mb-3 flex justify-center">
                <CreatorBadge type={creator.creator_type} size="sm" variant="minimal" />
              </div>
            )}

            {/* Creator bio - parchment style quote */}
            {creator.creator_bio && (
              <div className="relative mb-3">
                <p className="line-clamp-2 px-2 font-body text-xs italic text-bone/60">
                  "{creator.creator_bio}"
                </p>
              </div>
            )}

            {/* Stats row - manuscript ledger style */}
            <div className="mb-3 flex items-center justify-center gap-4 border-b border-t border-imperial-gold/10 py-2">
              <div className="flex items-center gap-1.5 text-bone/50">
                <ImageIcon className="h-3.5 w-3.5 text-imperial-gold/60" />
                <span className="font-mono text-xs">{creator.miniatures_count}</span>
              </div>
              <div className="h-3 w-px bg-imperial-gold/20" />
              <div className="flex items-center gap-1.5 text-bone/50">
                <Users className="h-3.5 w-3.5 text-imperial-gold/60" />
                <span className="font-mono text-xs">{creator.followers_count}</span>
              </div>
            </div>

            {/* Commissions indicator - wax seal style */}
            {creator.accepts_commissions && (
              <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
                <div className="relative">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-50" />
                </div>
                <span className="font-mono text-xs uppercase tracking-wider text-emerald-400/90">
                  Acepta Encargos
                </span>
              </div>
            )}
          </div>

          {/* Bottom classification bar */}
          <div
            className="h-1 w-full"
            style={{
              background: config
                ? `linear-gradient(90deg, transparent 0%, ${config.colorHex}50 50%, transparent 100%)`
                : 'linear-gradient(90deg, transparent 0%, rgba(201, 162, 39, 0.3) 50%, transparent 100%)',
            }}
          />

          {/* Hover overlay - parchment glow */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-imperial-gold/5 via-transparent to-imperial-gold/5 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </Link>

      {/* Portfolio link - quill button */}
      {creator.portfolio_url && (
        <a
          href={creator.portfolio_url}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link absolute bottom-4 right-4 z-10 rounded-lg border border-imperial-gold/30 bg-void/90 p-2 text-imperial-gold/60 transition-all hover:border-imperial-gold/60 hover:bg-void-light hover:text-imperial-gold"
          onClick={(e) => e.stopPropagation()}
          title="Ver portfolio"
        >
          <ScrollText className="h-4 w-4 transition-transform group-hover/link:rotate-6" />
        </a>
      )}
    </motion.div>
  )
}

export const CreatorCard = memo(CreatorCardImpl)
