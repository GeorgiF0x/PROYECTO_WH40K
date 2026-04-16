'use client'

import { motion } from 'framer-motion'
import { Compass, MapPin } from 'lucide-react'

// Star-point particles for Cartographia theme
const STAR_POINTS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${((i * 8.5 + 2) % 92) + 4}%`,
  top: `${((i * 11 + 5) % 80) + 10}%`,
  drift: (i % 2 === 0 ? -1 : 1) * (10 + (i % 4) * 6),
  dur: 8 + (i % 3) * 2,
  delay: i * 0.5,
  size: i % 4 === 0 ? 'w-1.5 h-1.5' : 'w-1 h-1',
}))

export default function CommunityHero() {
  return (
    <section className="relative overflow-hidden px-6 py-20 sm:py-24 lg:py-28">
      {/* Cartographic grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201,162,39,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,162,39,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Coordinate lines */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle, rgba(201,162,39,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '120px 120px',
          backgroundPosition: '30px 30px',
          opacity: 0.3,
        }}
      />

      {/* Amber vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.08)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(161,130,39,0.05)_0%,transparent_40%)]" />

      {/* Star point particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {STAR_POINTS.map((p) => (
          <motion.div
            key={p.id}
            className={`absolute ${p.size} rounded-full bg-imperial-gold/40`}
            style={{ left: p.left, top: p.top }}
            animate={{
              y: [0, p.drift, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: p.dur,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Background compass rose — ultra-slow rotation */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
          className="opacity-[0.04]"
        >
          <Compass className="h-[500px] w-[500px] text-imperial-gold" strokeWidth={0.5} />
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-imperial-gold/30 bg-imperial-gold/10 px-4 py-2"
          >
            <MapPin className="h-4 w-4 text-imperial-gold" />
            <span className="font-body text-sm text-imperial-gold">Tiendas y Comunidad Local</span>
          </motion.div>

          {/* Title */}
          <h1 className="mb-4 font-display text-4xl font-bold tracking-wide md:text-6xl">
            <span className="text-bone">Cartographia </span>
            <span className="text-gradient">Imperialis</span>
          </h1>

          <p className="mx-auto max-w-2xl font-body text-lg text-bone/60">
            Encuentra tiendas de hobby cercanas, descubre donde jugar y conecta con la comunidad
            local de Warhammer.
          </p>

          {/* Compass/sextant ornament */}
          <div className="mt-5 flex items-center justify-center gap-2">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-imperial-gold/30" />
            <div className="h-1 w-1 rotate-45 bg-imperial-gold/30" />
            <Compass className="h-4 w-4 text-imperial-gold/40" />
            <div className="h-1 w-1 rotate-45 bg-imperial-gold/30" />
            <div className="h-px w-16 bg-gradient-to-r from-imperial-gold/30 to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
