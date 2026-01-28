'use client'

import { motion } from 'framer-motion'
import { Compass, MapPin } from 'lucide-react'

// Star-point particles for Cartographia theme
const STAR_POINTS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${(i * 8.5 + 2) % 92 + 4}%`,
  top: `${(i * 11 + 5) % 80 + 10}%`,
  drift: (i % 2 === 0 ? -1 : 1) * (10 + (i % 4) * 6),
  dur: 8 + (i % 3) * 2,
  delay: i * 0.5,
  size: i % 4 === 0 ? 'w-1.5 h-1.5' : 'w-1 h-1',
}))

export default function CommunityHero() {
  return (
    <section className="relative px-6 py-20 sm:py-24 lg:py-28 overflow-hidden">
      {/* Cartographic grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
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
        className="absolute inset-0 pointer-events-none"
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
          className="opacity-[0.04]"
        >
          <Compass className="w-[500px] h-[500px] text-imperial-gold" strokeWidth={0.5} />
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-imperial-gold/10 border border-imperial-gold/30 rounded-full mb-6"
          >
            <MapPin className="w-4 h-4 text-imperial-gold" />
            <span className="text-sm font-body text-imperial-gold">
              Tiendas y Comunidad Local
            </span>
          </motion.div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-wide mb-4">
            <span className="text-bone">Cartographia </span>
            <span className="text-gradient">Imperialis</span>
          </h1>

          <p className="text-lg text-bone/60 font-body max-w-2xl mx-auto">
            Encuentra tiendas de hobby cercanas, descubre donde jugar
            y conecta con la comunidad local de Warhammer.
          </p>

          {/* Compass/sextant ornament */}
          <div className="flex items-center justify-center gap-2 mt-5">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-imperial-gold/30" />
            <div className="w-1 h-1 bg-imperial-gold/30 rotate-45" />
            <Compass className="w-4 h-4 text-imperial-gold/40" />
            <div className="w-1 h-1 bg-imperial-gold/30 rotate-45" />
            <div className="w-16 h-px bg-gradient-to-r from-imperial-gold/30 to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
