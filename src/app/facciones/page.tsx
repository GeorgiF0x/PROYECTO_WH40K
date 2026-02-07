'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { factions } from '@/lib/data'
import { FactionSymbol } from '@/components/faction'
import { getFactionTheme } from '@/lib/faction-themes'
import { Feather, BookOpen, Shield, Scroll, ArrowRight } from 'lucide-react'

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
            Elige tu <span className="text-gradient">Faccion</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-body text-xl text-bone/60 max-w-2xl mx-auto"
          >
            Siete grandes poderes luchan por el dominio de la galaxia. Cada uno con su historia, estetica y estilo de juego unicos.
          </motion.p>

          {/* Quick faction symbols */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center gap-4 mt-8"
          >
            {factions.map((faction, i) => (
              <motion.div
                key={faction.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <Link href={`/facciones/${faction.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.2, y: -5 }}
                    className="p-2 rounded-lg transition-all hover:bg-white/5"
                  >
                    <FactionSymbol factionId={faction.id} size="sm" />
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Factions Grid - Bento Style */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Featured Factions - First Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {factions.slice(0, 3).map((faction, index) => {
              const theme = getFactionTheme(faction.id)
              return (
                <Link key={faction.id} href={`/facciones/${faction.id}`}>
                  <motion.article
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                    className="group relative h-[500px] rounded-2xl overflow-hidden cursor-pointer"
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
                      <FactionSymbol factionId={faction.id} size="lg" className="mb-4" />

                      <span
                        className="font-body text-sm font-semibold tracking-wider uppercase mb-2"
                        style={{ color: faction.color }}
                      >
                        {faction.tagline}
                      </span>

                      <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-4">
                        {faction.name}
                      </h2>

                      <p className="font-body text-bone/70 leading-relaxed mb-6 line-clamp-2">
                        {faction.description}
                      </p>

                      {/* Stats */}
                      <div className="flex gap-4 mb-4">
                        {[
                          { label: 'Unidades', value: faction.stats.unitsCount },
                          { label: 'Dificultad', value: faction.stats.difficulty },
                        ].map((stat) => (
                          <div
                            key={stat.label}
                            className="px-3 py-1.5 rounded text-xs font-body"
                            style={{ background: `${faction.color}20` }}
                          >
                            <span className="text-bone/50">{stat.label}: </span>
                            <span className="font-semibold text-white">{stat.value}</span>
                          </div>
                        ))}
                      </div>

                      <div
                        className="flex items-center gap-2 font-body font-semibold"
                        style={{ color: faction.color }}
                      >
                        <span>Explorar Faccion</span>
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
              )
            })}
          </div>

          {/* Secondary Factions - Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {factions.slice(3).map((faction, index) => {
              const theme = getFactionTheme(faction.id)
              return (
                <Link key={faction.id} href={`/facciones/${faction.id}`}>
                  <motion.article
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group relative h-[350px] rounded-xl overflow-hidden cursor-pointer"
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
                        background: `linear-gradient(to top, ${theme?.cssVars['--faction-bg'] || '#030308'} 0%, transparent 60%)`,
                      }}
                    />

                    {/* Hover border */}
                    <motion.div
                      className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        border: `2px solid ${faction.color}`,
                        boxShadow: `inset 0 0 60px ${faction.color}20`,
                      }}
                    />

                    {/* Content */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <div className="flex items-center gap-3 mb-3">
                        <FactionSymbol factionId={faction.id} size="md" />
                        <span
                          className="font-body text-xs font-semibold tracking-wider uppercase"
                          style={{ color: faction.color }}
                        >
                          {faction.tagline}
                        </span>
                      </div>

                      <h2 className="font-display text-2xl font-black text-white mb-2">
                        {faction.name}
                      </h2>

                      <p className="font-body text-sm text-bone/60 leading-relaxed line-clamp-2 mb-4">
                        {faction.description}
                      </p>

                      <div
                        className="flex items-center gap-2 font-body text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: faction.color }}
                      >
                        <span>Ver mas</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
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
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section - Lexicanum Scribe */}
      <section className="relative py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto relative"
        >
          {/* Main Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-void-light/90 via-void/95 to-amber-950/20 border border-amber-500/20">
            {/* Corner filigrees */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-amber-500/30 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-amber-500/30 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-amber-500/30 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-amber-500/30 rounded-br-2xl" />

            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

            {/* Ambient glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5 pointer-events-none" />

            {/* Background pattern - subtle parchment lines */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(245,158,11,0.5) 39px, rgba(245,158,11,0.5) 40px)',
              }}
            />

            <div className="relative p-8 md:p-12">
              <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                {/* Icon Section */}
                <div className="flex-shrink-0">
                  <motion.div
                    className="relative w-28 h-28 md:w-32 md:h-32"
                    animate={{
                      filter: [
                        'drop-shadow(0 0 20px rgba(245, 158, 11, 0.2))',
                        'drop-shadow(0 0 30px rgba(245, 158, 11, 0.4))',
                        'drop-shadow(0 0 20px rgba(245, 158, 11, 0.2))',
                      ],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {/* Outer ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-amber-500/30" />
                    <motion.div
                      className="absolute inset-2 rounded-full border border-amber-500/20"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    />
                    {/* Inner circle */}
                    <div className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/40 flex items-center justify-center">
                      <Scroll className="w-12 h-12 md:w-14 md:h-14 text-amber-400" />
                    </div>
                    {/* Floating feather */}
                    <motion.div
                      className="absolute -top-2 -right-2"
                      animate={{ y: [0, -5, 0], rotate: [0, 5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Feather className="w-8 h-8 text-amber-300" />
                    </motion.div>
                  </motion.div>
                </div>

                {/* Content Section */}
                <div className="flex-1 text-center lg:text-left">
                  <motion.span
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 font-mono text-xs tracking-widest mb-4"
                  >
                    ORDEN DEL LEXICANUM
                  </motion.span>

                  <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-4">
                    Contribuye al{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
                      Archivo Imperial
                    </span>
                  </h2>

                  <p className="font-body text-lg text-bone/60 mb-6 max-w-xl">
                    Unete a la Orden de Escribas del Lexicanum. Documenta el lore, crea articulos sobre las facciones y ayuda a preservar el conocimiento de la galaxia.
                  </p>

                  {/* Benefits Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-8">
                    {[
                      { icon: Feather, label: 'Crear articulos', desc: 'Escribe lore' },
                      { icon: BookOpen, label: 'Editar wiki', desc: 'Mejora contenido' },
                      { icon: Shield, label: 'Insignia unica', desc: 'Reconocimiento' },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="p-3 rounded-lg bg-void/50 border border-amber-500/10 hover:border-amber-500/30 transition-colors group"
                      >
                        <item.icon className="w-5 h-5 text-amber-400/70 mx-auto mb-1.5 group-hover:text-amber-400 transition-colors" />
                        <p className="text-xs text-bone/70 font-medium">{item.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Link href="/wiki/solicitar">
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(245, 158, 11, 0.3)' }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-display font-bold text-lg rounded-lg transition-all group"
                    >
                      <Feather className="w-5 h-5" />
                      Solicitar ser Lexicanum Scribe
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom accent */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  )
}
