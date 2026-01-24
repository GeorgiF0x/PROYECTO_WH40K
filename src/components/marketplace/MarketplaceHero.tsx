'use client'

import { motion } from 'framer-motion'
import { Store } from 'lucide-react'

export default function MarketplaceHero() {
  return (
    <section className="relative px-6 py-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.08)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(139,0,0,0.1)_0%,transparent_50%)]" />

      {/* Animated grid pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201, 162, 39, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 162, 39, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

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
            <Store className="w-4 h-4 text-imperial-gold" />
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
        </motion.div>
      </div>
    </section>
  )
}
