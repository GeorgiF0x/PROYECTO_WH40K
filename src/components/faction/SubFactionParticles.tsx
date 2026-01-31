'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'
import Image from 'next/image'
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

        return (
          <motion.div
            key={`${factionId}-particle-${i}`}
            className="absolute"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              filter: `drop-shadow(0 0 8px ${theme.colors.glow}) drop-shadow(0 0 16px ${theme.colors.primary}40)`,
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
            <div
              className="relative w-full h-full"
              style={{
                filter: 'brightness(1.2) saturate(0.8)',
              }}
            >
              <Image
                src={particle.subFaction.icon}
                alt={particle.subFaction.name}
                fill
                className="object-contain"
                style={{
                  filter: `drop-shadow(0 0 4px ${theme.colors.glow})`,
                  opacity: 0.9,
                }}
              />
              {/* Color overlay tint */}
              <div
                className="absolute inset-0 mix-blend-overlay"
                style={{
                  backgroundColor: theme.colors.primary,
                  opacity: 0.3,
                }}
              />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default SubFactionParticles
