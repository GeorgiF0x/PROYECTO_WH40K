'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  Palette,
  Video,
  Brush,
  BookOpen,
  GraduationCap,
  Cog,
  Radio,
  Feather,
  ScrollText,
  Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CreatorType } from '@/lib/types/database.types'

interface CreatorBadgeProps {
  type: CreatorType
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  showTagline?: boolean
  verified?: boolean
  variant?: 'minimal' | 'default' | 'expanded' | 'purity-seal' | 'avatar-badge' | 'title-ribbon'
  className?: string
}

export const creatorTypeConfig: Record<CreatorType, {
  label: string
  title: string
  tagline: string
  icon: typeof Palette
  secondaryIcon: typeof Cog
  color: string
  colorHex: string
  bgColor: string
  borderColor: string
  glowColor: string
}> = {
  painter: {
    label: 'Pintor',
    title: 'Adepto de la Forja',
    tagline: 'Artesano del Omnissiah',
    icon: Palette,
    secondaryIcon: Cog,
    color: 'text-purple-400',
    colorHex: '#c084fc',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/50',
    glowColor: 'shadow-purple-500/30'
  },
  youtuber: {
    label: 'YouTuber',
    title: 'Vox-Emisor Imperial',
    tagline: 'Portavoz del Imperium',
    icon: Video,
    secondaryIcon: Radio,
    color: 'text-red-400',
    colorHex: '#f87171',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/50',
    glowColor: 'shadow-red-500/30'
  },
  artist: {
    label: 'Artista',
    title: 'Rememorador',
    tagline: 'Cronista Imperial',
    icon: Brush,
    secondaryIcon: Feather,
    color: 'text-cyan-400',
    colorHex: '#22d3ee',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/50',
    glowColor: 'shadow-cyan-500/30'
  },
  blogger: {
    label: 'Blogger',
    title: 'Escriba del Lexicanum',
    tagline: 'Custodio del Conocimiento',
    icon: BookOpen,
    secondaryIcon: ScrollText,
    color: 'text-amber-400',
    colorHex: '#fbbf24',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/50',
    glowColor: 'shadow-amber-500/30'
  },
  instructor: {
    label: 'Instructor',
    title: 'Tecnosacerdote',
    tagline: 'Maestro del Rito',
    icon: GraduationCap,
    secondaryIcon: Wrench,
    color: 'text-emerald-400',
    colorHex: '#34d399',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/50',
    glowColor: 'shadow-emerald-500/30'
  }
}

const sizeConfig = {
  sm: {
    icon: 'w-3 h-3',
    padding: 'px-1.5 py-0.5',
    text: 'text-xs',
    gap: 'gap-1'
  },
  md: {
    icon: 'w-4 h-4',
    padding: 'px-2 py-1',
    text: 'text-sm',
    gap: 'gap-1.5'
  },
  lg: {
    icon: 'w-5 h-5',
    padding: 'px-3 py-1.5',
    text: 'text-base',
    gap: 'gap-2'
  }
}

export function CreatorBadge({
  type,
  size = 'md',
  showLabel = true,
  showTagline = false,
  verified = true,
  variant = 'default',
  className
}: CreatorBadgeProps) {
  const config = creatorTypeConfig[type]
  const sizes = sizeConfig[size]
  const Icon = config.icon

  // Minimal variant - icon + title text in manuscript style
  if (variant === 'minimal') {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          'inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border backdrop-blur-sm',
          className
        )}
        style={{
          background: `linear-gradient(135deg, ${config.colorHex}15 0%, transparent 100%)`,
          borderColor: `${config.colorHex}30`,
        }}
        title={config.title}
      >
        <Icon className={cn(size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4')} style={{ color: config.colorHex }} />
        <span
          className={cn(
            'font-mono tracking-wider uppercase',
            size === 'sm' ? 'text-[10px]' : 'text-xs'
          )}
          style={{ color: config.colorHex }}
        >
          {config.title}
        </span>
      </motion.div>
    )
  }

  // Avatar Badge variant - Small seal designed to overlay avatar corner
  if (variant === 'avatar-badge') {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0, rotate: -20 }}
        animate={{ scale: 1, opacity: 1, rotate: 8 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 15 }}
        className={cn('relative', className)}
        title={config.title}
      >
        {/* Purity seal image */}
        <motion.div
          animate={{
            filter: [
              'drop-shadow(0 4px 8px rgba(139, 0, 0, 0.5))',
              'drop-shadow(0 6px 12px rgba(139, 0, 0, 0.7))',
              'drop-shadow(0 4px 8px rgba(139, 0, 0, 0.5))',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          whileHover={{ scale: 1.1, rotate: 15 }}
        >
          <Image
            src="/purity-seal-large.svg"
            alt="Sello de Pureza"
            width={size === 'sm' ? 56 : size === 'md' ? 72 : 88}
            height={size === 'sm' ? 56 : size === 'md' ? 72 : 88}
            className="relative z-10"
          />
        </motion.div>
      </motion.div>
    )
  }

  // Title Ribbon variant - Clean, elegant badge showing creator rank
  if (variant === 'title-ribbon') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.3 }}
        className={cn('inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg', className)}
        style={{
          background: `linear-gradient(135deg, ${config.colorHex}20 0%, ${config.colorHex}10 100%)`,
          border: `1px solid ${config.colorHex}35`,
          boxShadow: `0 2px 8px ${config.colorHex}15`,
        }}
      >
        {/* Icon */}
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${config.colorHex}35, ${config.colorHex}15)`,
            border: `1px solid ${config.colorHex}40`,
          }}
        >
          <Icon className="w-4 h-4" style={{ color: config.colorHex }} />
        </div>

        {/* Text */}
        <div className="flex flex-col leading-tight">
          <span
            className="text-sm font-display font-bold tracking-wide whitespace-nowrap"
            style={{ color: config.colorHex }}
          >
            {config.title}
          </span>
          <span className="text-[10px] text-bone/50 font-mono tracking-wider whitespace-nowrap">
            {config.tagline}
          </span>
        </div>
      </motion.div>
    )
  }

  // Purity Seal variant - Large image with text card below
  if (variant === 'purity-seal') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className={cn('flex flex-col items-center', className)}
      >
        {/* Purity Seal image - large and prominent */}
        <motion.div
          className="relative"
          animate={{
            filter: [
              'drop-shadow(0 8px 16px rgba(139, 0, 0, 0.4))',
              'drop-shadow(0 12px 24px rgba(139, 0, 0, 0.6))',
              'drop-shadow(0 8px 16px rgba(139, 0, 0, 0.4))',
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          whileHover={{ scale: 1.05, rotate: 3 }}
        >
          <Image
            src="/purity-seal-large.svg"
            alt="Sello de Pureza Imperial"
            width={180}
            height={180}
            className="relative z-10"
            priority
          />
        </motion.div>

        {/* Title card below the seal */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-center"
        >
          {/* Icon badge */}
          <div
            className="mx-auto mb-2 w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${config.colorHex}50, ${config.colorHex}20)`,
              border: `2px solid ${config.colorHex}60`,
              boxShadow: `0 4px 15px ${config.colorHex}30`,
            }}
          >
            <Icon className="w-5 h-5" style={{ color: config.colorHex }} />
          </div>

          {/* Title */}
          <h3
            className="text-lg font-display font-bold tracking-wide"
            style={{ color: config.colorHex }}
          >
            {config.title}
          </h3>

          {/* Tagline */}
          <p className="text-sm text-bone/60 font-mono mt-1">
            {config.tagline}
          </p>
        </motion.div>
      </motion.div>
    )
  }

  // Expanded variant - Horizontal layout with seal and content
  if (variant === 'expanded') {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn('relative flex items-center gap-4', className)}
      >
        {/* Purity seal image */}
        <motion.div
          className="flex-shrink-0"
          animate={{
            filter: [
              'drop-shadow(0 4px 8px rgba(139, 0, 0, 0.3))',
              'drop-shadow(0 6px 12px rgba(139, 0, 0, 0.5))',
              'drop-shadow(0 4px 8px rgba(139, 0, 0, 0.3))',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <Image
            src="/purity-seal-large.svg"
            alt="Sello de Pureza"
            width={80}
            height={80}
          />
        </motion.div>

        {/* Content */}
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div
            className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${config.colorHex}40, ${config.colorHex}15)`,
              border: `2px solid ${config.colorHex}50`,
              boxShadow: `0 4px 15px ${config.colorHex}25`,
            }}
          >
            <Icon className="w-6 h-6" style={{ color: config.colorHex }} />
          </div>

          {/* Text */}
          <div>
            <h3
              className="font-display font-bold text-base tracking-wide"
              style={{ color: config.colorHex }}
            >
              {config.title}
            </h3>
            <p className="text-xs text-bone/50 font-mono">
              {config.tagline}
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  // Default variant - pill badge with mini seal
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn('inline-flex items-center gap-2', className)}
    >
      {/* Mini purity seal */}
      {verified && (
        <motion.div
          className="flex-shrink-0"
          animate={{
            filter: [
              'drop-shadow(0 2px 4px rgba(139, 0, 0, 0.3))',
              'drop-shadow(0 3px 6px rgba(139, 0, 0, 0.5))',
              'drop-shadow(0 2px 4px rgba(139, 0, 0, 0.3))',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Image
            src="/purity-seal-large.svg"
            alt="Verificado"
            width={size === 'sm' ? 24 : size === 'md' ? 32 : 40}
            height={size === 'sm' ? 24 : size === 'md' ? 32 : 40}
          />
        </motion.div>
      )}

      {/* Badge content */}
      <motion.div
        className={cn(
          'inline-flex items-center rounded-lg backdrop-blur-sm relative overflow-hidden',
          sizes.padding,
          sizes.gap
        )}
        style={{
          background: `linear-gradient(135deg, ${config.colorHex}25, rgba(10,10,15,0.8))`,
          border: `1px solid ${config.colorHex}40`,
          boxShadow: `0 2px 10px ${config.colorHex}15`,
        }}
        whileHover={{
          boxShadow: `0 4px 20px ${config.colorHex}30`,
          borderColor: `${config.colorHex}60`,
        }}
      >
        <Icon className={cn(sizes.icon)} style={{ color: config.colorHex }} />
        {showLabel && (
          <span
            className={cn(sizes.text, 'font-medium')}
            style={{ color: config.colorHex }}
          >
            {config.title}
          </span>
        )}
      </motion.div>
    </motion.div>
  )
}

export function getCreatorTypeConfig(type: CreatorType) {
  return creatorTypeConfig[type]
}

export function getAllCreatorTypes() {
  return Object.entries(creatorTypeConfig).map(([value, config]) => ({
    value: value as CreatorType,
    ...config
  }))
}
