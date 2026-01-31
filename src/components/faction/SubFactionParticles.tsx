'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { getSubFactionIcons, type SubFactionIcon } from '@/lib/subfaction-icons'
import { type FactionTheme } from '@/lib/faction-themes'

interface SubFactionParticlesProps {
  factionId: string
  theme: FactionTheme
  count?: number
}

type AnimationType = 'float' | 'drift' | 'spiral' | 'pulse' | 'gentle'

interface ParticleConfig {
  subFaction: SubFactionIcon
  x: number
  y: number
  size: number
  duration: number
  delay: number
  animationType: AnimationType
}

// Get animation props based on type
function getAnimationProps(type: AnimationType, index: number) {
  switch (type) {
    case 'float':
      return {
        initial: { opacity: 0, y: 100, scale: 0.3, rotate: -20 },
        animate: {
          opacity: [0, 0.4, 0.6, 0.4, 0],
          y: [100, -50, -150, -250, -350],
          scale: [0.3, 0.6, 0.8, 0.6, 0.3],
          rotate: [-20, 0, 10, 0, -10],
        },
      }
    case 'drift':
      return {
        initial: { opacity: 0, x: -100, scale: 0.2 },
        animate: {
          opacity: [0, 0.5, 0.7, 0.5, 0],
          x: [-100, 0, 100, 200, 300],
          y: [0, -30, -60, -90, -120],
          scale: [0.2, 0.5, 0.7, 0.5, 0.2],
          rotate: [0, 15, 0, -15, 0],
        },
      }
    case 'spiral':
      return {
        initial: { opacity: 0, scale: 0.1 },
        animate: {
          opacity: [0, 0.6, 0.8, 0.6, 0],
          scale: [0.1, 0.4, 0.7, 0.4, 0.1],
          rotate: [0, 90, 180, 270, 360],
          y: [50, 0, -50, -100, -150],
        },
      }
    case 'pulse':
      return {
        initial: { opacity: 0, scale: 0.4, y: 50 },
        animate: {
          opacity: [0, 0.5, 0.8, 0.5, 0],
          scale: [0.4, 0.7, 0.9, 0.7, 0.4],
          y: [50, -20, -100, -180, -260],
        },
      }
    case 'gentle':
    default:
      return {
        initial: { opacity: 0, y: 80 },
        animate: {
          opacity: [0, 0.3, 0.5, 0.3, 0],
          y: [80, 40, 0, -40, -80],
          x: [0, 20 * (index % 2 === 0 ? 1 : -1), 0, -20 * (index % 2 === 0 ? 1 : -1), 0],
          scale: [0.5, 0.7, 0.8, 0.7, 0.5],
        },
      }
  }
}

const animationTypes: AnimationType[] = ['float', 'drift', 'spiral', 'pulse', 'gentle']

export function SubFactionParticles({
  factionId,
  theme,
  count = 12
}: SubFactionParticlesProps) {
  const subFactions = useMemo(() => getSubFactionIcons(factionId), [factionId])

  // Generate random but deterministic particle configurations
  const particles = useMemo<ParticleConfig[]>(() => {
    if (subFactions.length === 0) return []

    // Create seeded random for consistent positions
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed * 9999) * 10000
      return x - Math.floor(x)
    }

    return Array.from({ length: count }, (_, i) => {
      const subFaction = subFactions[i % subFactions.length]
      const seed = i * 1337 + factionId.charCodeAt(0)

      return {
        subFaction,
        x: seededRandom(seed) * 90 + 5, // 5-95% from left
        y: seededRandom(seed + 1) * 70 + 15, // 15-85% from top (start position)
        size: subFaction.featured
          ? 40 + seededRandom(seed + 2) * 24 // 40-64px for featured
          : 28 + seededRandom(seed + 2) * 20, // 28-48px for regular
        duration: 12 + seededRandom(seed + 3) * 10, // 12-22 seconds
        delay: seededRandom(seed + 4) * 8, // 0-8 second delay
        animationType: animationTypes[Math.floor(seededRandom(seed + 5) * animationTypes.length)],
      }
    })
  }, [subFactions, count, factionId])

  if (particles.length === 0) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, i) => {
        const { initial, animate } = getAnimationProps(particle.animationType, i)
        // Encode the URL to handle spaces and special characters
        const encodedIconUrl = encodeURI(particle.subFaction.icon)

        return (
          <motion.div
            key={`${factionId}-particle-${i}`}
            className="absolute"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            initial={initial}
            animate={animate}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={encodedIconUrl}
              alt=""
              className="w-full h-full object-contain"
              style={{
                filter: `
                  drop-shadow(0 0 6px ${theme.colors.glow})
                  drop-shadow(0 0 12px ${theme.colors.primary}60)
                  brightness(1.3)
                  sepia(1)
                  hue-rotate(${getHueRotation(theme.colors.primary)}deg)
                  saturate(2)
                `,
              }}
            />
          </motion.div>
        )
      })}
    </div>
  )
}

// Calculate hue rotation based on target color
function getHueRotation(hexColor: string): number {
  // Convert hex to HSL and return the hue
  const r = parseInt(hexColor.slice(1, 3), 16) / 255
  const g = parseInt(hexColor.slice(3, 5), 16) / 255
  const b = parseInt(hexColor.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0

  if (max !== min) {
    const d = max - min
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  // Sepia starts at ~30deg, so we need to rotate from there
  return h * 360 - 30
}

export default SubFactionParticles
