'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { getFactionTheme } from '@/lib/faction-themes'
import type { Faction } from '@/lib/data'
import FactionSymbol from './FactionSymbol'
import FactionEffects from './FactionEffects'

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
    <section ref={ref} className="relative min-h-[90vh] flex items-end overflow-hidden">
      {/* Parallax Background Image */}
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <Image
          src={faction.heroImage}
          alt={faction.name}
          fill
          className="object-cover"
          priority
          quality={90}
        />
      </motion.div>

      {/* Faction-specific effects */}
      <FactionEffects factionId={faction.id} />

      {/* Gradient overlays */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, ${theme?.cssVars['--faction-bg'] || '#030308'} 0%, transparent 50%, ${theme?.cssVars['--faction-bg'] || '#030308'}90 100%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at bottom, ${faction.color}25 0%, transparent 70%)`,
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
        className="relative max-w-7xl mx-auto px-6 pb-16 pt-40 w-full"
      >
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 font-body text-sm text-bone/60 mb-6"
        >
          <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/facciones" className="hover:text-white transition-colors">Facciones</Link>
          <span>/</span>
          <span style={{ color: faction.color }}>{faction.shortName}</span>
        </motion.div>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="flex-1">
            {/* Symbol and Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-4"
            >
              <FactionSymbol factionId={faction.id} size="lg" />
              <span
                className="font-body text-sm font-semibold tracking-widest uppercase"
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
              className="font-display text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6"
            >
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: theme?.gradients.text || `linear-gradient(90deg, ${faction.color}, white)`,
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
              className="font-body text-xl text-bone/70 max-w-2xl leading-relaxed"
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
              className="p-6 rounded-xl backdrop-blur-sm border"
              style={{
                background: `${theme?.cssVars['--faction-bg'] || '#030308'}90`,
                borderColor: `${faction.color}30`,
                boxShadow: `0 0 40px ${faction.color}10`,
              }}
            >
              <h3
                className="font-display text-sm font-bold tracking-wider uppercase mb-4"
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
                  <div key={stat.label} className="flex justify-between items-center">
                    <span className="font-body text-sm text-bone/50">{stat.label}</span>
                    <span className="font-display text-sm font-bold text-white">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Difficulty bar */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex justify-between mb-2">
                  <span className="font-body text-xs text-bone/50">Nivel de Dificultad</span>
                </div>
                <div className="h-2 bg-void-light rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: faction.color }}
                    initial={{ width: 0 }}
                    animate={{
                      width: faction.stats.difficulty === 'Facil' ? '25%' :
                             faction.stats.difficulty === 'Media' ? '50%' :
                             faction.stats.difficulty === 'Dificil' ? '75%' : '100%'
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
            className="w-6 h-10 rounded-full border-2 border-bone/30 flex justify-center pt-2"
          >
            <motion.div
              className="w-1.5 h-3 rounded-full"
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
