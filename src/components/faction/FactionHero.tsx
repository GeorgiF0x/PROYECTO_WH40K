'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useRef } from 'react'
import { getFactionTheme } from '@/lib/faction-themes'
import type { Faction } from '@/lib/data'
import FactionSymbol from './FactionSymbol'
import FactionEffects from './FactionEffects'
import FactionHeroBackground from './FactionHeroBackground'

interface FactionHeroProps {
  faction: Faction
}

export function FactionHero({ faction }: FactionHeroProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2])

  const theme = getFactionTheme(faction.id)

  return (
    <section ref={ref} className="relative flex min-h-[90vh] items-end overflow-hidden">
      {/* Dynamic Animated Background */}
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <FactionHeroBackground factionId={faction.id} />
      </motion.div>

      {/* Faction-specific effects */}
      <FactionEffects factionId={faction.id} />

      {/* Bottom gradient for content readability */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, ${theme?.cssVars['--faction-bg'] || '#030308'} 0%, transparent 40%)`,
        }}
      />

      {/* Animated border accent */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{
          background: theme?.gradients.border,
          backgroundSize: '200% 100%',
        }}
        animate={{
          backgroundPosition: ['0% 50%', '200% 50%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative mx-auto w-full max-w-7xl px-6 pb-16 pt-40"
      >
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-2 font-body text-sm text-bone/60"
        >
          <Link href="/" className="transition-colors hover:text-white">
            Inicio
          </Link>
          <span>/</span>
          <Link href="/facciones" className="transition-colors hover:text-white">
            Facciones
          </Link>
          <span>/</span>
          <span style={{ color: faction.color }}>{faction.shortName}</span>
        </motion.div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex-1">
            {/* Symbol and Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-4"
            >
              <FactionSymbol factionId={faction.id} size="lg" />
              <span
                className="font-body text-sm font-semibold uppercase tracking-widest"
                style={{ color: faction.color }}
              >
                {faction.tagline}
              </span>
            </motion.div>

            {/* Title with gradient */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 font-display text-5xl font-black text-white md:text-6xl lg:text-7xl"
            >
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    theme?.gradients.text || `linear-gradient(90deg, ${faction.color}, white)`,
                }}
              >
                {faction.name}
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl font-body text-xl leading-relaxed text-bone/70"
            >
              {faction.description}
            </motion.p>
          </div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:w-72"
          >
            <div
              className="rounded-xl border p-6 backdrop-blur-sm"
              style={{
                background: `${theme?.cssVars['--faction-bg'] || '#030308'}90`,
                borderColor: `${faction.color}30`,
                boxShadow: `0 0 40px ${faction.color}10`,
              }}
            >
              <h3
                className="mb-4 font-display text-sm font-bold uppercase tracking-wider"
                style={{ color: faction.color }}
              >
                Estadisticas
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Unidades', value: faction.stats.unitsCount },
                  { label: 'Codex', value: faction.stats.codexEdition },
                  { label: 'Dificultad', value: faction.stats.difficulty },
                  { label: 'Estilo', value: faction.stats.playstyle },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span className="font-body text-sm text-bone/50">{stat.label}</span>
                    <span className="font-display text-sm font-bold text-white">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Difficulty bar */}
              <div className="mt-4 border-t border-white/10 pt-4">
                <div className="mb-2 flex justify-between">
                  <span className="font-body text-xs text-bone/50">Nivel de Dificultad</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-void-light">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: faction.color }}
                    initial={{ width: 0 }}
                    animate={{
                      width:
                        faction.stats.difficulty === 'Facil'
                          ? '25%'
                          : faction.stats.difficulty === 'Media'
                            ? '50%'
                            : faction.stats.difficulty === 'Dificil'
                              ? '75%'
                              : '100%',
                    }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex h-10 w-6 justify-center rounded-full border-2 border-bone/30 pt-2"
          >
            <motion.div
              className="h-3 w-1.5 rounded-full"
              style={{ background: faction.color }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default FactionHero
