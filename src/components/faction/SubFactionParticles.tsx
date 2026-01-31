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

interface ParticleConfig {
  subFaction: SubFactionIcon
  x: number
  y: number
  size: number
  duration: number
  delay: number
  animationType: number
}

export function SubFactionParticles({
  factionId,
  theme,
  count = 10
}: SubFactionParticlesProps) {
  const subFactions = useMemo(() => getSubFactionIcons(factionId), [factionId])

  const particles = useMemo<ParticleConfig[]>(() => {
    if (subFactions.length === 0) return []

    const seededRandom = (seed: number) => {
      const x = Math.sin(seed * 9999) * 10000
      return x - Math.floor(x)
    }

    return Array.from({ length: count }, (_, i) => {
      const subFaction = subFactions[i % subFactions.length]
      const seed = i * 1337 + factionId.charCodeAt(0)

      return {
        subFaction,
        x: seededRandom(seed) * 85 + 5,
        y: seededRandom(seed + 1) * 60 + 20,
        // Bigger icons - featured ones are huge
        size: subFaction.featured
          ? 60 + seededRandom(seed + 2) * 40 // 60-100px
          : 40 + seededRandom(seed + 2) * 30, // 40-70px
        duration: 15 + seededRandom(seed + 3) * 15, // 15-30 seconds (slower)
        delay: seededRandom(seed + 4) * 10,
        animationType: Math.floor(seededRandom(seed + 5) * 4),
      }
    })
  }, [subFactions, count, factionId])

  if (particles.length === 0) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, i) => {
        const encodedIconUrl = encodeURI(particle.subFaction.icon)

        // Different animation styles
        const animations = [
          // Slow majestic rise
          {
            initial: { opacity: 0, y: 50, scale: 0.5 },
            animate: {
              opacity: [0, 0.9, 1, 0.9, 0],
              y: [50, 0, -100, -200, -300],
              scale: [0.5, 0.8, 1, 0.8, 0.5],
              rotate: [0, 5, 0, -5, 0],
            },
          },
          // Gentle float with pulse
          {
            initial: { opacity: 0, scale: 0.6 },
            animate: {
              opacity: [0, 1, 0.8, 1, 0],
              y: [0, -50, -100, -150, -200],
              scale: [0.6, 1, 1.1, 1, 0.6],
            },
          },
          // Drift sideways
          {
            initial: { opacity: 0, x: -50 },
            animate: {
              opacity: [0, 0.9, 1, 0.9, 0],
              x: [-50, 0, 50, 100, 150],
              y: [0, -30, -80, -130, -180],
              rotate: [0, 10, 0, -10, 0],
            },
          },
          // Dramatic pulse in place
          {
            initial: { opacity: 0, scale: 0.3 },
            animate: {
              opacity: [0, 1, 0.7, 1, 0],
              scale: [0.3, 1.2, 0.9, 1.1, 0.3],
              y: [20, 0, -40, -80, -120],
            },
          },
        ]

        const anim = animations[particle.animationType]

        return (
          <motion.div
            key={`${factionId}-subfaction-${i}`}
            className="absolute"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            initial={anim.initial}
            animate={anim.animate}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Glow layer behind */}
            <div
              className="absolute inset-0 blur-md"
              style={{
                background: `radial-gradient(circle, ${theme.colors.glow}80 0%, transparent 70%)`,
              }}
            />
            {/* Icon */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={encodedIconUrl}
              alt=""
              className="relative w-full h-full object-contain"
              style={{
                filter: `
                  drop-shadow(0 0 10px ${theme.colors.glow})
                  drop-shadow(0 0 20px ${theme.colors.primary})
                  drop-shadow(0 0 30px ${theme.colors.primary}80)
                  brightness(1.4)
                  sepia(1)
                  hue-rotate(${getHueRotation(theme.colors.primary)}deg)
                  saturate(3)
                `,
              }}
            />
          </motion.div>
        )
      })}
    </div>
  )
}

function getHueRotation(hexColor: string): number {
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

  return h * 360 - 30
}

export default SubFactionParticles
