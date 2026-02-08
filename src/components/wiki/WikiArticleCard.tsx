'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  BookOpen,
  Users,
  Swords,
  Building,
  Shield,
  MapPin,
  Eye,
  Calendar,
} from 'lucide-react'
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
      <Link href={`/facciones/${factionId}/wiki/${page.slug}`}>
        <div
          className="group relative h-72 rounded-xl overflow-hidden card-hover"
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
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            {/* Faction badge */}
            {showFactionBadge && factionName && (
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider mb-2 w-fit"
                style={{ background: `${factionColor}25`, color: factionColor, border: `1px solid ${factionColor}30` }}
              >
                {factionName}
              </div>
            )}

            {/* Category badge */}
            {page.category && (
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-body font-semibold mb-3 w-fit"
                style={{ background: `${factionColor}30`, color: factionColor }}
              >
                <CategoryIcon className="w-3 h-3" />
                {page.category.name}
              </div>
            )}

            <h3 className="font-display text-xl font-bold text-white mb-2 group-hover:text-opacity-90 transition-colors">
              {page.title}
            </h3>

            {page.excerpt && (
              <p className="font-body text-sm text-bone/60 line-clamp-2 mb-4">
                {page.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-bone/40 font-body">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {page.views_count}
              </span>
              {page.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
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
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              background: `linear-gradient(135deg, ${factionColor}10 0%, transparent 50%)`,
            }}
          />
        </div>
      </Link>
    </motion.article>
  )
}
