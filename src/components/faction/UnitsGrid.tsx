'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'
import { X, ChevronRight, Target, Heart, Shield, Swords, Zap, Crown } from 'lucide-react'
import { getFactionTheme } from '@/lib/faction-themes'
import type { Faction, FactionUnit } from '@/lib/data'

interface UnitsGridProps {
  faction: Faction
}

const unitTypeIcons: Record<string, React.ReactNode> = {
  Personaje: <Crown className="h-4 w-4" />,
  Tropas: <Target className="h-4 w-4" />,
  Elite: <Swords className="h-4 w-4" />,
  'Ataque Rapido': <Zap className="h-4 w-4" />,
  'Apoyo Pesado': <Shield className="h-4 w-4" />,
  'Lord of War': <Crown className="h-4 w-4" />,
  Transporte: <ChevronRight className="h-4 w-4" />,
}

export function UnitsGrid({ faction }: UnitsGridProps) {
  const [selectedUnit, setSelectedUnit] = useState<FactionUnit | null>(null)
  const theme = getFactionTheme(faction.id)

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span
            className="mb-4 block font-body text-sm font-semibold uppercase tracking-widest"
            style={{ color: faction.color }}
          >
            Catalogo de Unidades
          </span>
          <h2 className="mb-4 font-display text-3xl font-black text-white md:text-4xl">
            Unidades Destacadas
          </h2>
          <p className="mx-auto max-w-xl font-body text-lg text-bone/60">
            Las miniaturas mas iconicas de {faction.shortName}. Cada una con su historia y rol en el
            campo de batalla.
          </p>
        </motion.div>

        {/* Units Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {faction.units.map((unit, index) => (
            <motion.article
              key={unit.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => setSelectedUnit(unit)}
              className="group relative cursor-pointer overflow-hidden rounded-xl"
              style={{
                background: theme?.gradients.card,
                boxShadow: `0 4px 20px ${faction.color}10`,
              }}
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={unit.image}
                  alt={unit.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-transparent" />

                {/* Unit Type Badge */}
                <span
                  className="absolute left-4 top-4 flex items-center gap-1.5 rounded px-3 py-1.5 font-body text-xs font-semibold tracking-wide"
                  style={{
                    background: faction.color,
                    color: '#000',
                  }}
                >
                  {unitTypeIcons[unit.type]}
                  {unit.type}
                </span>

                {/* Points Badge */}
                <span
                  className="absolute right-4 top-4 rounded px-2 py-1 font-display text-xs font-bold"
                  style={{
                    background: 'rgba(0,0,0,0.6)',
                    color: faction.color,
                    border: `1px solid ${faction.color}40`,
                  }}
                >
                  {unit.points} pts
                </span>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="mb-2 font-display text-lg font-bold text-white transition-colors group-hover:text-opacity-90">
                  {unit.name}
                </h3>
                <p className="line-clamp-2 font-body text-sm leading-relaxed text-bone/60">
                  {unit.description}
                </p>

                {/* View more indicator */}
                <div
                  className="mt-4 flex items-center gap-2 font-body text-sm font-semibold opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ color: faction.color }}
                >
                  <span>Ver detalles</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>

              {/* Hover border effect */}
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-xl"
                style={{
                  border: `1px solid ${faction.color}`,
                  opacity: 0,
                }}
                whileHover={{ opacity: 0.5 }}
              />
            </motion.article>
          ))}
        </div>

        {/* Unit Detail Modal */}
        <AnimatePresence>
          {selectedUnit && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedUnit(null)}
            >
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

              {/* Modal */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-3xl overflow-hidden rounded-2xl"
                style={{
                  background: theme?.cssVars['--faction-bg'] || '#030308',
                  border: `1px solid ${faction.color}40`,
                  boxShadow: `0 0 60px ${faction.color}20`,
                }}
              >
                {/* Close button */}
                <button
                  onClick={() => setSelectedUnit(null)}
                  className="absolute right-4 top-4 z-10 rounded-full p-2 transition-colors"
                  style={{
                    background: `${faction.color}20`,
                    color: faction.color,
                  }}
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Image */}
                  <div className="relative h-64 min-h-[300px] md:h-full">
                    <Image
                      src={selectedUnit.image}
                      alt={selectedUnit.name}
                      fill
                      className="object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(90deg, transparent 50%, ${theme?.cssVars['--faction-bg'] || '#030308'} 100%)`,
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6 md:p-8">
                    {/* Header */}
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className="flex items-center gap-1 rounded px-2 py-1 font-body text-xs font-semibold tracking-wide"
                        style={{ background: `${faction.color}20`, color: faction.color }}
                      >
                        {unitTypeIcons[selectedUnit.type]}
                        {selectedUnit.type}
                      </span>
                      <span
                        className="rounded px-2 py-1 font-display text-xs font-bold"
                        style={{ background: 'rgba(255,255,255,0.1)', color: faction.color }}
                      >
                        {selectedUnit.points} pts
                      </span>
                    </div>

                    <h2 className="mb-4 font-display text-2xl font-black text-white md:text-3xl">
                      {selectedUnit.name}
                    </h2>

                    <p className="mb-6 font-body leading-relaxed text-bone/70">
                      {selectedUnit.lore}
                    </p>

                    {/* Stats */}
                    {selectedUnit.stats && (
                      <div className="mb-6">
                        <h4
                          className="mb-3 font-display text-sm font-bold uppercase tracking-wider"
                          style={{ color: faction.color }}
                        >
                          Caracteristicas
                        </h4>
                        <div className="grid grid-cols-9 gap-1">
                          {Object.entries(selectedUnit.stats).map(([stat, value]) => (
                            <div
                              key={stat}
                              className="rounded p-2 text-center"
                              style={{ background: `${faction.color}10` }}
                            >
                              <div className="mb-1 font-body text-xs text-bone/50">{stat}</div>
                              <div className="font-display text-sm font-bold text-white">
                                {value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <div className="rounded-lg p-4" style={{ background: `${faction.color}10` }}>
                      <p className="font-body text-sm italic text-bone/60">
                        {selectedUnit.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

export default UnitsGrid
