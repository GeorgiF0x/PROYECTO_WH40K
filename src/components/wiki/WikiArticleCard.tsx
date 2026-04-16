'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Users, Swords, Building, Shield, MapPin, Eye, Calendar } from 'lucide-react'
import { optimizeImageUrl } from '@/lib/utils'
import type { WikiPage } from '@/lib/supabase/wiki.types'

export const categoryIcons: Record<string, typeof BookOpen> = {
  BookOpen,
  Users,
  Swords,
  Building,
  Shield,
  MapPin,
}

interface WikiArticleCardProps {
  page: WikiPage
  factionId: string
  factionColor: string
  index: number
  showFactionBadge?: boolean
  factionName?: string
}

export function WikiArticleCard({
  page,
  factionId,
  factionColor,
  index,
  showFactionBadge,
  factionName,
}: WikiArticleCardProps) {
  const CategoryIcon = page.category?.icon
    ? categoryIcons[page.category.icon] || BookOpen
    : BookOpen

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/wiki/${factionId}/${page.slug}`}>
        <div
          className="card-hover group relative h-72 overflow-hidden rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${factionColor}15 0%, transparent 100%)`,
            border: `1px solid ${factionColor}20`,
          }}
        >
          {/* Hero image */}
          {page.hero_image && (
            <div className="absolute inset-0">
              <Image
                src={optimizeImageUrl(page.hero_image, 600, 75)}
                alt={page.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void via-void/80 to-transparent" />
            </div>
          )}

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            {/* Faction badge */}
            {showFactionBadge && factionName && (
              <div
                className="mb-2 inline-flex w-fit items-center gap-1.5 rounded px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  background: `${factionColor}25`,
                  color: factionColor,
                  border: `1px solid ${factionColor}30`,
                }}
              >
                {factionName}
              </div>
            )}

            {/* Category badge */}
            {page.category && (
              <div
                className="mb-3 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 font-body text-xs font-semibold"
                style={{ background: `${factionColor}30`, color: factionColor }}
              >
                <CategoryIcon className="h-3 w-3" />
                {page.category.name}
              </div>
            )}

            <h3 className="mb-2 font-display text-xl font-bold text-white transition-colors group-hover:text-opacity-90">
              {page.title}
            </h3>

            {page.excerpt && (
              <p className="mb-4 line-clamp-2 font-body text-sm text-bone/60">{page.excerpt}</p>
            )}

            {/* Meta */}
            <div className="flex items-center gap-4 font-body text-xs text-bone/40">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {page.views_count}
              </span>
              {page.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(page.published_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              )}
            </div>
          </div>

          {/* Hover overlay */}
          <div
            className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
            style={{
              background: `linear-gradient(135deg, ${factionColor}10 0%, transparent 50%)`,
            }}
          />
        </div>
      </Link>
    </motion.article>
  )
}
