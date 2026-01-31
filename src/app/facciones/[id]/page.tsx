'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Navigation, Footer } from '@/components'
import { getFactionById, factions } from '@/lib/data'
import { getFactionTheme } from '@/lib/faction-themes'
import {
  FactionHero,
  FactionTabs,
  FactionEffects,
  FactionSymbol,
  LoreSection,
  UnitsGrid,
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
      <main className="min-h-screen bg-void flex items-center justify-center">
        <div className="noise-overlay" />
        <div className="text-center">
          <h1 className="font-display text-4xl text-white mb-4">Faccion no encontrada</h1>
          <Link href="/facciones" className="text-imperial-gold hover:underline">
            Volver a facciones
          </Link>
        </div>
      </main>
    )
  }

  // Get adjacent factions for navigation
  const currentIndex = factions.findIndex(f => f.id === faction.id)
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
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <FactionEffects factionId={faction.id} />
      </div>

      <Navigation />

      {/* Hero Section */}
      <FactionHero faction={faction} />

      {/* Tabs Navigation */}
      <FactionTabs
        factionId={faction.id}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

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
          {activeTab === 'units' && <UnitsGrid faction={faction} />}
          {activeTab === 'gallery' && <FactionGallery faction={faction} />}
        </motion.div>
      </AnimatePresence>

      {/* Faction Navigation */}
      <section
        className="relative py-16 border-t"
        style={{
          borderColor: `${faction.color}20`,
          background: `linear-gradient(180deg, transparent 0%, ${faction.color}05 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-2xl md:text-3xl font-black text-white mb-4">
              Explora Otras Facciones
            </h2>
            <p className="font-body text-bone/60">
              Cada faccion tiene su propia historia, unidades y estetica unica
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Previous Faction */}
            <Link href={`/facciones/${prevFaction.id}`}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ x: -5 }}
                className="group relative h-48 rounded-xl overflow-hidden"
              >
                <Image
                  src={prevFaction.image}
                  alt={prevFaction.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-void via-void/80 to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <ChevronLeft className="w-5 h-5" style={{ color: prevFaction.color }} />
                    <span className="font-body text-sm text-bone/60">Anterior</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FactionSymbol factionId={prevFaction.id} size="sm" animated={false} />
                    <div>
                      <span
                        className="font-body text-xs font-semibold tracking-wider uppercase block mb-1"
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
                className="group relative h-48 rounded-xl overflow-hidden"
              >
                <Image
                  src={nextFaction.image}
                  alt={nextFaction.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-void via-void/80 to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col justify-center items-end text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-body text-sm text-bone/60">Siguiente</span>
                    <ChevronRight className="w-5 h-5" style={{ color: nextFaction.color }} />
                  </div>
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <FactionSymbol factionId={nextFaction.id} size="sm" animated={false} />
                    <div>
                      <span
                        className="font-body text-xs font-semibold tracking-wider uppercase block mb-1"
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
            className="mt-12 flex justify-center flex-wrap gap-3"
          >
            {factions.map((f) => (
              <Link key={f.id} href={`/facciones/${f.id}`}>
                <motion.div
                  whileHover={{ scale: 1.1, y: -2 }}
                  className={`p-3 rounded-lg transition-all ${
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
