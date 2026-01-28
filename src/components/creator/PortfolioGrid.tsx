'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, ExternalLink, Link as LinkIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PortfolioLinkCard, PortfolioLinkCardCompact } from './PortfolioLinkCard'
import { YouTubeVideoGrid } from './YouTubeVideoCard'

interface PortfolioGridProps {
  links: string[]
  creatorType?: string
  maxVisible?: number
  showYouTubeVideos?: boolean
  className?: string
}

export function PortfolioGrid({
  links,
  creatorType,
  maxVisible = 4,
  showYouTubeVideos = true,
  className
}: PortfolioGridProps) {
  const [expanded, setExpanded] = useState(false)

  if (!links || links.length === 0) {
    return null
  }

  // Separate YouTube links from other links
  const youtubeLinks = links.filter(url =>
    url.includes('youtube.com') || url.includes('youtu.be')
  )
  const otherLinks = links.filter(url =>
    !url.includes('youtube.com') && !url.includes('youtu.be')
  )

  // For YouTubers, show videos prominently; for others, show link cards
  const isYoutuber = creatorType === 'youtuber'
  const visibleLinks = expanded ? otherLinks : otherLinks.slice(0, maxVisible)
  const hasMoreLinks = otherLinks.length > maxVisible

  return (
    <div className={cn('space-y-4', className)}>
      {/* YouTube Videos Section (if YouTuber or has YouTube links) */}
      {showYouTubeVideos && youtubeLinks.length > 0 && (
        <div className="space-y-2">
          {isYoutuber && (
            <h4 className="text-xs font-mono text-bone/50 tracking-wider flex items-center gap-2">
              <ExternalLink className="w-3 h-3" />
              CONTENIDO EN VIDEO
            </h4>
          )}
          <YouTubeVideoGrid
            videoUrls={youtubeLinks}
            maxVideos={isYoutuber ? 4 : 2}
          />
        </div>
      )}

      {/* Other Links Grid */}
      {otherLinks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-mono text-bone/50 tracking-wider flex items-center gap-2">
            <LinkIcon className="w-3 h-3" />
            {isYoutuber ? 'OTROS ENLACES' : 'PORTFOLIO / CONTENIDO'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <AnimatePresence>
              {visibleLinks.map((url, idx) => (
                <motion.div
                  key={`${url}-${idx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <PortfolioLinkCard url={url} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Expand/Collapse button */}
          {hasMoreLinks && (
            <motion.button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors mx-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Ver menos
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Ver {otherLinks.length - maxVisible} más
                </>
              )}
            </motion.button>
          )}
        </div>
      )}
    </div>
  )
}

// Compact inline version for profile headers
export function PortfolioLinksInline({
  links,
  maxVisible = 3,
  className
}: {
  links: string[]
  maxVisible?: number
  className?: string
}) {
  if (!links || links.length === 0) return null

  const visibleLinks = links.slice(0, maxVisible)
  const extraCount = links.length - maxVisible

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {visibleLinks.map((url, idx) => (
        <PortfolioLinkCardCompact key={`${url}-${idx}`} url={url} />
      ))}
      {extraCount > 0 && (
        <span className="inline-flex items-center px-2 py-1 text-xs text-bone/50 font-mono">
          +{extraCount} más
        </span>
      )}
    </div>
  )
}
