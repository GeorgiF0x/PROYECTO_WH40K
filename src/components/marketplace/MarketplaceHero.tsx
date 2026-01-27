'use client'

import { motion } from 'framer-motion'
import { Compass, Anchor } from 'lucide-react'

// Floating gold dust particles for Rogue Trader atmosphere
const HERO_DUST = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: `${(i * 13 + 3) % 94 + 3}%`,
  top: `${(i * 19 + 8) % 84 + 8}%`,
  drift: (i % 2 === 0 ? -1 : 1) * (15 + (i % 4) * 8),
  dur: 7 + (i % 3) * 2.5,
  delay: i * 0.6,
  size: i % 3 === 0 ? 'w-1.5 h-1.5' : 'w-1 h-1',
}))

export default function MarketplaceHero() {
  return (
    <section className="relative px-6 py-16 overflow-hidden">
      {/* Star chart background — Rogue Trader */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle, rgba(201,162,39,0.3) 1px, transparent 1px),
            radial-gradient(circle, rgba(201,162,39,0.2) 0.5px, transparent 0.5px)
          `,
          backgroundSize: '80px 80px, 120px 100px',
          backgroundPosition: '0 0, 40px 60px',
          opacity: 0.12,
        }}
      />
      {/* Warm golden vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.1)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(201,162,39,0.04)_0%,transparent_40%)]" />

      {/* Floating gold dust */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {HERO_DUST.map((p) => (
          <motion.div
            key={p.id}
            className={`absolute ${p.size} rounded-full bg-imperial-gold/30`}
            style={{ left: p.left, top: p.top }}
            animate={{
              y: [0, p.drift, 0],
              opacity: [0, 0.5, 0],
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

      {/* Background compass rose — slow rotation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
          className="opacity-[0.03]"
        >
          <Compass className="w-[400px] h-[400px] text-imperial-gold" strokeWidth={0.5} />
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
            <Anchor className="w-4 h-4 text-imperial-gold" />
            <span className="text-sm font-body text-imperial-gold">
              Compra, Vende e Intercambia
            </span>
          </motion.div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-wide mb-4">
            <span className="text-bone">Mercado </span>
            <span className="text-gradient">P2P</span>
          </h1>

          <p className="text-lg text-bone/60 font-body max-w-2xl mx-auto">
            Encuentra miniaturas de segunda mano, intercambia con otros coleccionistas
            o vende las que ya no uses.
          </p>

          {/* Rogue Trader diamond ornament */}
          <div className="flex items-center justify-center gap-2 mt-5">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-imperial-gold/20" />
            <div className="w-1 h-1 bg-imperial-gold/30 rotate-45" />
            <div className="w-1.5 h-1.5 bg-imperial-gold/50 rotate-45" />
            <div className="w-1 h-1 bg-imperial-gold/30 rotate-45" />
            <div className="w-12 h-px bg-gradient-to-r from-imperial-gold/20 to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
