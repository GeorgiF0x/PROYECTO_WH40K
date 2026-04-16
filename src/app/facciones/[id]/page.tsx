'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { getFactionById, factions } from '@/lib/data'
import { getFactionTheme } from '@/lib/faction-themes'
import {
  FactionHero,
  FactionTabs,
  FactionEffects,
  FactionSymbol,
  LoreSection,
  GameSection,
  FactionGallery,
  type FactionTab,
} from '@/components/faction'

export default function FactionPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState<FactionTab>('lore')
  const faction = getFactionById(params.id as string)
  const theme = getFactionTheme(params.id as string)

  // Reset tab when faction changes
  useEffect(() => {
    setActiveTab('lore')
  }, [params.id])

  if (!faction) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-void">
        <div className="noise-overlay" />
        <div className="text-center">
          <h1 className="mb-4 font-display text-4xl text-white">Faccion no encontrada</h1>
          <Link href="/facciones" className="text-imperial-gold hover:underline">
            Volver a facciones
          </Link>
        </div>
      </main>
    )
  }

  // Get adjacent factions for navigation
  const currentIndex = factions.findIndex((f) => f.id === faction.id)
  const prevFaction = factions[(currentIndex - 1 + factions.length) % factions.length]
  const nextFaction = factions[(currentIndex + 1) % factions.length]

  return (
    <main
      className="relative min-h-screen"
      style={{
        background: theme?.cssVars['--faction-bg'] || '#030308',
      }}
    >
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Global faction effects (subtle) */}
      <div className="pointer-events-none fixed inset-0 opacity-30">
        <FactionEffects factionId={faction.id} />
      </div>

      <Navigation />

      {/* Hero Section */}
      <FactionHero faction={faction} />

      {/* Tabs Navigation */}
      <FactionTabs factionId={faction.id} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'lore' && <LoreSection faction={faction} />}
          {activeTab === 'juego' && <GameSection faction={faction} />}
          {activeTab === 'gallery' && <FactionGallery faction={faction} />}
        </motion.div>
      </AnimatePresence>

      {/* Faction Navigation */}
      <section
        className="relative border-t py-16"
        style={{
          borderColor: `${faction.color}20`,
          background: `linear-gradient(180deg, transparent 0%, ${faction.color}05 100%)`,
        }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 font-display text-2xl font-black text-white md:text-3xl">
              Explora Otras Facciones
            </h2>
            <p className="font-body text-bone/60">
              Cada faccion tiene su propia historia, unidades y estetica unica
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Previous Faction */}
            <Link href={`/facciones/${prevFaction.id}`}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ x: -5 }}
                className="group relative h-48 overflow-hidden rounded-xl"
              >
                <Image
                  src={prevFaction.image}
                  alt={prevFaction.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-void via-void/80 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-center p-6">
                  <div className="mb-2 flex items-center gap-2">
                    <ChevronLeft className="h-5 w-5" style={{ color: prevFaction.color }} />
                    <span className="font-body text-sm text-bone/60">Anterior</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FactionSymbol factionId={prevFaction.id} size="sm" animated={false} />
                    <div>
                      <span
                        className="mb-1 block font-body text-xs font-semibold uppercase tracking-wider"
                        style={{ color: prevFaction.color }}
                      >
                        {prevFaction.tagline}
                      </span>
                      <h3 className="font-display text-xl font-bold text-white">
                        {prevFaction.name}
                      </h3>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Next Faction */}
            <Link href={`/facciones/${nextFaction.id}`}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ x: 5 }}
                className="group relative h-48 overflow-hidden rounded-xl"
              >
                <Image
                  src={nextFaction.image}
                  alt={nextFaction.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-void via-void/80 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-end justify-center p-6 text-right">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-body text-sm text-bone/60">Siguiente</span>
                    <ChevronRight className="h-5 w-5" style={{ color: nextFaction.color }} />
                  </div>
                  <div className="flex flex-row-reverse items-center gap-3">
                    <FactionSymbol factionId={nextFaction.id} size="sm" animated={false} />
                    <div>
                      <span
                        className="mb-1 block font-body text-xs font-semibold uppercase tracking-wider"
                        style={{ color: nextFaction.color }}
                      >
                        {nextFaction.tagline}
                      </span>
                      <h3 className="font-display text-xl font-bold text-white">
                        {nextFaction.name}
                      </h3>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>

          {/* All Factions Quick Nav */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 flex flex-wrap justify-center gap-3"
          >
            {factions.map((f) => (
              <Link key={f.id} href={`/facciones/${f.id}`}>
                <motion.div
                  whileHover={{ scale: 1.1, y: -2 }}
                  className={`rounded-lg p-3 transition-all ${
                    f.id === faction.id ? 'ring-2' : 'opacity-50 hover:opacity-100'
                  }`}
                  style={{
                    background: f.id === faction.id ? `${f.color}20` : 'transparent',
                    // @ts-expect-error - CSS custom property for ring color
                    '--tw-ring-color': f.color,
                  }}
                >
                  <FactionSymbol factionId={f.id} size="sm" animated={f.id === faction.id} />
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
