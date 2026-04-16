'use client'

import { motion } from 'framer-motion'
import FactionCard from './FactionCard'
import { factions } from '@/lib/data'

export default function Factions() {
  return (
    <section id="facciones" className="relative overflow-hidden px-6 py-24">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(201, 162, 39, 0.08) 0%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(220, 20, 60, 0.08) 0%, transparent 70%)',
          }}
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.span
            className="mb-4 inline-block bg-blood-light/10 px-3 py-1 font-body text-sm font-semibold tracking-wider text-blood-light"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            ELIGE TU BANDO
          </motion.span>
          <h2 className="mb-6 font-display text-4xl font-black text-white md:text-5xl lg:text-6xl">
            Facciones del <span className="text-gradient-red">Milenio 41</span>
          </h2>
          <p className="mx-auto max-w-2xl font-body text-lg text-bone/60">
            Tres poderes luchan por el dominio de la galaxia. ¿De qué lado estás?
          </p>
        </motion.div>

        {/* Factions Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {factions.map((faction, index) => (
            <FactionCard key={faction.id} {...faction} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
