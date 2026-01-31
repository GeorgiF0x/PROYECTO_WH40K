'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { getFactionTheme } from '@/lib/faction-themes'
import { getFactionIcon } from '@/lib/faction-icons'

interface FactionSymbolProps {
  factionId: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  animated?: boolean
  className?: string
  variant?: 'default' | 'dark' | 'glow'
}

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
  '2xl': 128,
}

export function FactionSymbol({
  factionId,
  size = 'md',
  animated = true,
  className = '',
  variant = 'default',
}: FactionSymbolProps) {
  const theme = getFactionTheme(factionId)
  const iconConfig = getFactionIcon(factionId)

  if (!theme || !iconConfig) return null

  const dimensions = sizeMap[size]
  const iconPath = variant === 'dark' && iconConfig.iconPathDark
    ? iconConfig.iconPathDark
    : iconConfig.iconPath

  return (
    <motion.div
      className={`relative flex items-center justify-center ${className}`}
      style={{
        width: dimensions,
        height: dimensions,
      }}
      animate={animated ? {
        scale: [1, 1.05, 1],
      } : undefined}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Glow effect behind icon */}
      {variant === 'glow' && (
        <motion.div
          className="absolute inset-0 rounded-full blur-xl"
          style={{
            background: theme.colors.glow,
            opacity: 0.3,
          }}
          animate={animated ? {
            opacity: [0.2, 0.4, 0.2],
            scale: [0.8, 1.1, 0.8],
          } : undefined}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* SVG Icon - white with faction glow */}
      <div
        className="relative w-full h-full"
        style={{
          filter: variant === 'glow'
            ? `drop-shadow(0 0 12px ${theme.colors.glow}) drop-shadow(0 0 6px ${theme.colors.primary})`
            : `drop-shadow(0 0 6px ${theme.colors.glow}80) drop-shadow(0 0 2px ${theme.colors.primary}60)`,
        }}
      >
        <Image
          src={iconPath}
          alt={iconConfig.name}
          fill
          className="object-contain"
          style={{
            filter: 'brightness(0) invert(1)',
          }}
        />
      </div>
    </motion.div>
  )
}

// Versión simplificada sin animaciones para listas
export function FactionIcon({
  factionId,
  size = 'sm',
  className = '',
}: {
  factionId: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}) {
  const theme = getFactionTheme(factionId)
  const iconConfig = getFactionIcon(factionId)

  if (!iconConfig) return null

  const dimensions = sizeMap[size]

  return (
    <div
      className={`relative ${className}`}
      style={{
        width: dimensions,
        height: dimensions,
      }}
    >
      <Image
        src={iconConfig.iconPath}
        alt={iconConfig.name}
        fill
        className="object-contain"
        style={{
          filter: theme
            ? `brightness(0) saturate(100%) invert(1) drop-shadow(0 0 2px ${theme.colors.primary})`
            : 'brightness(0) invert(1)',
        }}
      />
    </div>
  )
}

export default FactionSymbol
