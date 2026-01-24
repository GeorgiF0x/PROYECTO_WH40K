'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Navigation, Footer } from '@/components'
import { factions } from '@/lib/data'

export default function FactionsPage() {
  return (
    <main className="relative min-h-screen bg-void">
      <div className="noise-overlay" />
      <Navigation />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-void via-void/90 to-void" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-2 bg-blood-light/10 text-blood-light font-body text-sm font-semibold tracking-wider mb-6"
          >
            WARHAMMER 40,000
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6"
          >
            Elige tu <span className="text-gradient">Facción</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-body text-xl text-bone/60 max-w-2xl mx-auto"
          >
            La galaxia está en guerra. Imperium, Caos y Necrones luchan por el dominio supremo. ¿De qué lado lucharás?
          </motion.p>
        </div>
      </section>

      {/* Factions Grid */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {factions.map((faction, index) => (
              <Link key={faction.id} href={`/facciones/${faction.id}`}>
                <motion.article
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  whileHover={{ y: -10 }}
                  className="group relative h-[600px] rounded-2xl overflow-hidden cursor-pointer"
                >
                  {/* Background */}
                  <Image
                    src={faction.image}
                    alt={faction.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Overlays */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to top, ${faction.color}50 0%, transparent 50%, ${faction.color}20 100%)`,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-void via-void/70 to-transparent" />

                  {/* Hover glow */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      boxShadow: `inset 0 0 100px ${faction.color}30`,
                    }}
                  />

                  {/* Top accent */}
                  <div
                    className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: faction.color }}
                  />

                  {/* Content */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <motion.div
                      className="w-16 h-16 rounded-xl mb-6 flex items-center justify-center"
                      style={{ backgroundColor: `${faction.color}20` }}
                    >
                      <div
                        className="w-8 h-8"
                        style={{
                          backgroundColor: faction.color,
                          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                        }}
                      />
                    </motion.div>

                    <span
                      className="font-body text-sm font-semibold tracking-wider uppercase mb-2"
                      style={{ color: faction.color }}
                    >
                      {faction.tagline}
                    </span>

                    <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-4">
                      {faction.name}
                    </h2>

                    <p className="font-body text-bone/70 leading-relaxed mb-6 line-clamp-3">
                      {faction.description}
                    </p>

                    <div
                      className="flex items-center gap-2 font-body font-semibold"
                      style={{ color: faction.color }}
                    >
                      <span>Ver Facción</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 group-hover:translate-x-2 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </motion.article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center glass rounded-2xl p-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-4">
            ¿No sabes por dónde empezar?
          </h2>
          <p className="font-body text-lg text-bone/60 mb-8 max-w-xl mx-auto">
            Nuestros expertos pueden ayudarte a elegir la facción perfecta según tu estilo de juego y preferencias estéticas.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-modern font-body"
          >
            Contactar con un Experto
          </motion.button>
        </motion.div>
      </section>

      <Footer />
    </main>
  )
}
