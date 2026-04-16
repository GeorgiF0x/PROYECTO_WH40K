'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ExternalLink,
  Youtube,
  Instagram,
  Globe,
  FileText,
  Palette,
  Video,
  Image as ImageIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PortfolioLinkCardProps {
  url: string
  className?: string
}

// X (Twitter) icon
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

// Platform detection and styling
const platformConfig: Record<
  string,
  {
    name: string
    icon: React.ComponentType<{ className?: string }>
    gradient: string
    border: string
    iconColor: string
  }
> = {
  youtube: {
    name: 'YouTube',
    icon: Youtube,
    gradient: 'from-red-500/20 to-red-600/10',
    border: 'border-red-500/30 hover:border-red-500/50',
    iconColor: 'text-red-400',
  },
  instagram: {
    name: 'Instagram',
    icon: Instagram,
    gradient: 'from-purple-500/20 via-pink-500/20 to-orange-500/10',
    border: 'border-pink-500/30 hover:border-pink-500/50',
    iconColor: 'text-pink-400',
  },
  twitter: {
    name: 'X',
    icon: XIcon,
    gradient: 'from-bone-100/10 to-bone-200/5',
    border: 'border-bone-400/30 hover:border-bone-400/50',
    iconColor: 'text-bone-300',
  },
  twitch: {
    name: 'Twitch',
    icon: Video,
    gradient: 'from-purple-500/20 to-purple-600/10',
    border: 'border-purple-500/30 hover:border-purple-500/50',
    iconColor: 'text-purple-400',
  },
  artstation: {
    name: 'ArtStation',
    icon: Palette,
    gradient: 'from-blue-500/20 to-cyan-500/10',
    border: 'border-blue-500/30 hover:border-blue-500/50',
    iconColor: 'text-blue-400',
  },
  deviantart: {
    name: 'DeviantArt',
    icon: Palette,
    gradient: 'from-emerald-500/20 to-green-500/10',
    border: 'border-emerald-500/30 hover:border-emerald-500/50',
    iconColor: 'text-emerald-400',
  },
  behance: {
    name: 'Behance',
    icon: ImageIcon,
    gradient: 'from-blue-600/20 to-blue-700/10',
    border: 'border-blue-600/30 hover:border-blue-600/50',
    iconColor: 'text-blue-500',
  },
  reddit: {
    name: 'Reddit',
    icon: Globe,
    gradient: 'from-orange-500/20 to-orange-600/10',
    border: 'border-orange-500/30 hover:border-orange-500/50',
    iconColor: 'text-orange-400',
  },
  default: {
    name: 'Enlace',
    icon: Globe,
    gradient: 'from-imperial-gold/10 to-amber-500/5',
    border: 'border-imperial-gold/30 hover:border-imperial-gold/50',
    iconColor: 'text-imperial-gold',
  },
}

function detectPlatform(url: string): string {
  const urlLower = url.toLowerCase()
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'youtube'
  if (urlLower.includes('instagram.com')) return 'instagram'
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return 'twitter'
  if (urlLower.includes('twitch.tv')) return 'twitch'
  if (urlLower.includes('artstation.com')) return 'artstation'
  if (urlLower.includes('deviantart.com')) return 'deviantart'
  if (urlLower.includes('behance.net')) return 'behance'
  if (urlLower.includes('reddit.com')) return 'reddit'
  return 'default'
}

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return url
  }
}

function extractPath(url: string): string {
  try {
    const urlObj = new URL(url)
    const path = urlObj.pathname.replace(/^\//, '').replace(/\/$/, '')
    if (path.length > 30) return path.slice(0, 30) + '...'
    return path || ''
  } catch {
    return ''
  }
}

export function PortfolioLinkCard({ url, className }: PortfolioLinkCardProps) {
  const [faviconError, setFaviconError] = useState(false)
  const platform = detectPlatform(url)
  const config = platformConfig[platform]
  const domain = extractDomain(url)
  const path = extractPath(url)
  const Icon = config.icon

  // Google Favicon API
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'group relative flex items-center gap-3 overflow-hidden rounded-xl border bg-gradient-to-br p-3 backdrop-blur-sm transition-all',
        config.gradient,
        config.border,
        className
      )}
    >
      {/* Background glow effect on hover */}
      <motion.div
        className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at center, ${platform === 'default' ? 'rgba(201, 162, 39, 0.1)' : 'rgba(255, 255, 255, 0.05)'} 0%, transparent 70%)`,
        }}
      />

      {/* Icon/Favicon container */}
      <div
        className={cn(
          'bg-void-800/50 border-void-700 relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border'
        )}
      >
        {!faviconError && platform === 'default' ? (
          <Image
            src={faviconUrl}
            alt=""
            width={24}
            height={24}
            className="rounded"
            onError={() => setFaviconError(true)}
            unoptimized
          />
        ) : (
          <Icon className={cn('h-5 w-5', config.iconColor)} />
        )}
      </div>

      {/* Content */}
      <div className="relative min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={cn('text-sm font-medium', config.iconColor)}>{config.name}</span>
          {platform !== 'default' && (
            <Icon className={cn('h-3.5 w-3.5 opacity-50', config.iconColor)} />
          )}
        </div>
        <p className="text-bone-500 truncate font-mono text-xs">
          {domain}
          {path && <span className="text-bone-600">/{path}</span>}
        </p>
      </div>

      {/* External link indicator */}
      <ExternalLink className="text-bone-600 group-hover:text-bone-400 h-4 w-4 flex-shrink-0 transition-colors" />
    </motion.a>
  )
}

// Compact version for smaller spaces
export function PortfolioLinkCardCompact({ url, className }: PortfolioLinkCardProps) {
  const platform = detectPlatform(url)
  const config = platformConfig[platform]
  const domain = extractDomain(url)
  const Icon = config.icon

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border bg-gradient-to-br px-3 py-1.5 backdrop-blur-sm transition-all',
        config.gradient,
        config.border,
        className
      )}
      title={domain}
    >
      <Icon className={cn('h-4 w-4', config.iconColor)} />
      <span className="text-bone-400 max-w-[100px] truncate font-mono text-xs">{domain}</span>
    </motion.a>
  )
}
