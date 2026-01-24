'use client'

import { motion } from 'framer-motion'
import FactionCard from './FactionCard'
import { factions } from '@/lib/data'

export default function Factions() {
  return (
    <section id="facciones" className="relative py-24 px-6 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(201, 162, 39, 0.08) 0%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(220, 20, 60, 0.08) 0%, transparent 70%)',
          }}
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.span
            className="inline-block px-3 py-1 bg-blood-light/10 text-blood-light font-body text-sm font-semibold tracking-wider mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            ELIGE TU BANDO
          </motion.span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
            Facciones del <span className="text-gradient-red">Milenio 41</span>
          </h2>
          <p className="font-body text-lg text-bone/60 max-w-2xl mx-auto">
            Tres poderes luchan por el dominio de la galaxia. ¿De qué lado estás?
          </p>
        </motion.div>

        {/* Factions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {factions.map((faction, index) => (
            <FactionCard key={faction.id} {...faction} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
