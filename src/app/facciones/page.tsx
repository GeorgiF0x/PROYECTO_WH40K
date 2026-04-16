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
      <section className="relative px-6 pb-20 pt-32">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-void via-void/90 to-void" />
        </div>

        <div className="relative mx-auto max-w-7xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-block bg-blood-light/10 px-4 py-2 font-body text-sm font-semibold tracking-wider text-blood-light"
          >
            WARHAMMER 40,000
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 font-display text-5xl font-black text-white md:text-6xl lg:text-7xl"
          >
            Elige tu <span className="text-gradient">Faccion</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl font-body text-xl text-bone/60"
          >
            Siete grandes poderes luchan por el dominio de la galaxia. Cada uno con su historia,
            estetica y estilo de juego unicos.
          </motion.p>

          {/* Quick faction symbols */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex justify-center gap-4"
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
                    className="rounded-lg p-2 transition-all hover:bg-white/5"
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
      <section className="relative px-6 py-20">
        <div className="mx-auto max-w-7xl">
          {/* Featured Factions - First Row */}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
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
                    className="group relative h-[500px] cursor-pointer overflow-hidden rounded-2xl"
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
                      className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{
                        boxShadow: `inset 0 0 100px ${faction.color}30`,
                      }}
                    />

                    {/* Top accent */}
                    <div
                      className="absolute left-0 top-0 h-1 w-full opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ backgroundColor: faction.color }}
                    />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-8">
                      <FactionSymbol factionId={faction.id} size="lg" className="mb-4" />

                      <span
                        className="mb-2 font-body text-sm font-semibold uppercase tracking-wider"
                        style={{ color: faction.color }}
                      >
                        {faction.tagline}
                      </span>

                      <h2 className="mb-4 font-display text-3xl font-black text-white md:text-4xl">
                        {faction.name}
                      </h2>

                      <p className="mb-6 line-clamp-2 font-body leading-relaxed text-bone/70">
                        {faction.description}
                      </p>

                      {/* Stats */}
                      <div className="mb-4 flex gap-4">
                        {[
                          { label: 'Unidades', value: faction.stats.unitsCount },
                          { label: 'Dificultad', value: faction.stats.difficulty },
                        ].map((stat) => (
                          <div
                            key={stat.label}
                            className="rounded px-3 py-1.5 font-body text-xs"
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
                          className="h-5 w-5 transition-transform group-hover:translate-x-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </div>
                    </div>
                  </motion.article>
                </Link>
              )
            })}
          </div>

          {/* Secondary Factions - Second Row */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                    className="group relative h-[350px] cursor-pointer overflow-hidden rounded-xl"
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
                      className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100"
                      style={{
                        border: `2px solid ${faction.color}`,
                        boxShadow: `inset 0 0 60px ${faction.color}20`,
                      }}
                    />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <div className="mb-3 flex items-center gap-3">
                        <FactionSymbol factionId={faction.id} size="md" />
                        <span
                          className="font-body text-xs font-semibold uppercase tracking-wider"
                          style={{ color: faction.color }}
                        >
                          {faction.tagline}
                        </span>
                      </div>

                      <h2 className="mb-2 font-display text-2xl font-black text-white">
                        {faction.name}
                      </h2>

                      <p className="mb-4 line-clamp-2 font-body text-sm leading-relaxed text-bone/60">
                        {faction.description}
                      </p>

                      <div
                        className="flex items-center gap-2 font-body text-sm font-semibold opacity-0 transition-opacity group-hover:opacity-100"
                        style={{ color: faction.color }}
                      >
                        <span>Ver mas</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
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
      <section className="relative px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-4xl"
        >
          {/* Main Card */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-void-light/90 via-void/95 to-amber-950/20">
            {/* Corner filigrees */}
            <div className="absolute left-0 top-0 h-24 w-24 rounded-tl-2xl border-l-2 border-t-2 border-amber-500/30" />
            <div className="absolute right-0 top-0 h-24 w-24 rounded-tr-2xl border-r-2 border-t-2 border-amber-500/30" />
            <div className="absolute bottom-0 left-0 h-24 w-24 rounded-bl-2xl border-b-2 border-l-2 border-amber-500/30" />
            <div className="absolute bottom-0 right-0 h-24 w-24 rounded-br-2xl border-b-2 border-r-2 border-amber-500/30" />

            {/* Top accent line */}
            <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

            {/* Ambient glow */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5" />

            {/* Background pattern - subtle parchment lines */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(245,158,11,0.5) 39px, rgba(245,158,11,0.5) 40px)',
              }}
            />

            <div className="relative p-8 md:p-12">
              <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-12">
                {/* Icon Section */}
                <div className="flex-shrink-0">
                  <motion.div
                    className="relative h-28 w-28 md:h-32 md:w-32"
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
                    <div className="absolute inset-4 flex items-center justify-center rounded-full border border-amber-500/40 bg-gradient-to-br from-amber-500/20 to-amber-700/10">
                      <Scroll className="h-12 w-12 text-amber-400 md:h-14 md:w-14" />
                    </div>
                    {/* Floating feather */}
                    <motion.div
                      className="absolute -right-2 -top-2"
                      animate={{ y: [0, -5, 0], rotate: [0, 5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Feather className="h-8 w-8 text-amber-300" />
                    </motion.div>
                  </motion.div>
                </div>

                {/* Content Section */}
                <div className="flex-1 text-center lg:text-left">
                  <motion.span
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mb-4 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xs tracking-widest text-amber-400"
                  >
                    ORDEN DEL LEXICANUM
                  </motion.span>

                  <h2 className="mb-4 font-display text-3xl font-black text-white md:text-4xl">
                    Contribuye al{' '}
                    <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                      Archivo Imperial
                    </span>
                  </h2>

                  <p className="mb-6 max-w-xl font-body text-lg text-bone/60">
                    Unete a la Orden de Escribas del Lexicanum. Documenta el lore, crea articulos
                    sobre las facciones y ayuda a preservar el conocimiento de la galaxia.
                  </p>

                  {/* Benefits Grid */}
                  <div className="mb-8 grid grid-cols-3 gap-3">
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
                        className="group rounded-lg border border-amber-500/10 bg-void/50 p-3 transition-colors hover:border-amber-500/30"
                      >
                        <item.icon className="mx-auto mb-1.5 h-5 w-5 text-amber-400/70 transition-colors group-hover:text-amber-400" />
                        <p className="text-xs font-medium text-bone/70">{item.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Link href="/wiki/solicitar">
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(245, 158, 11, 0.3)' }}
                      whileTap={{ scale: 0.98 }}
                      className="group inline-flex items-center gap-3 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 px-8 py-4 font-display text-lg font-bold text-white transition-all hover:from-amber-500 hover:to-amber-600"
                    >
                      <Feather className="h-5 w-5" />
                      Solicitar ser Lexicanum Scribe
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
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
