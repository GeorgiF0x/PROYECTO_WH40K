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
  'Personaje': <Crown className="w-4 h-4" />,
  'Tropas': <Target className="w-4 h-4" />,
  'Elite': <Swords className="w-4 h-4" />,
  'Ataque Rapido': <Zap className="w-4 h-4" />,
  'Apoyo Pesado': <Shield className="w-4 h-4" />,
  'Lord of War': <Crown className="w-4 h-4" />,
  'Transporte': <ChevronRight className="w-4 h-4" />,
}

export function UnitsGrid({ faction }: UnitsGridProps) {
  const [selectedUnit, setSelectedUnit] = useState<FactionUnit | null>(null)
  const theme = getFactionTheme(faction.id)

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span
            className="font-body text-sm font-semibold tracking-widest uppercase mb-4 block"
            style={{ color: faction.color }}
          >
            Catalogo de Unidades
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-4">
            Unidades Destacadas
          </h2>
          <p className="font-body text-lg text-bone/60 max-w-xl mx-auto">
            Las miniaturas mas iconicas de {faction.shortName}. Cada una con su historia y rol en el campo de batalla.
          </p>
        </motion.div>

        {/* Units Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {faction.units.map((unit, index) => (
            <motion.article
              key={unit.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => setSelectedUnit(unit)}
              className="group relative rounded-xl overflow-hidden cursor-pointer"
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
                  className="absolute top-4 left-4 px-3 py-1.5 text-xs font-body font-semibold tracking-wide rounded flex items-center gap-1.5"
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
                  className="absolute top-4 right-4 px-2 py-1 text-xs font-display font-bold rounded"
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
                <h3 className="font-display text-lg font-bold text-white mb-2 group-hover:text-opacity-90 transition-colors">
                  {unit.name}
                </h3>
                <p className="font-body text-sm text-bone/60 leading-relaxed line-clamp-2">
                  {unit.description}
                </p>

                {/* View more indicator */}
                <div
                  className="mt-4 flex items-center gap-2 font-body text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: faction.color }}
                >
                  <span>Ver detalles</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Hover border effect */}
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
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
                className="relative max-w-3xl w-full rounded-2xl overflow-hidden"
                style={{
                  background: theme?.cssVars['--faction-bg'] || '#030308',
                  border: `1px solid ${faction.color}40`,
                  boxShadow: `0 0 60px ${faction.color}20`,
                }}
              >
                {/* Close button */}
                <button
                  onClick={() => setSelectedUnit(null)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full transition-colors"
                  style={{
                    background: `${faction.color}20`,
                    color: faction.color,
                  }}
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Image */}
                  <div className="relative h-64 md:h-full min-h-[300px]">
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
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="px-2 py-1 text-xs font-body font-semibold tracking-wide rounded flex items-center gap-1"
                        style={{ background: `${faction.color}20`, color: faction.color }}
                      >
                        {unitTypeIcons[selectedUnit.type]}
                        {selectedUnit.type}
                      </span>
                      <span
                        className="px-2 py-1 text-xs font-display font-bold rounded"
                        style={{ background: 'rgba(255,255,255,0.1)', color: faction.color }}
                      >
                        {selectedUnit.points} pts
                      </span>
                    </div>

                    <h2 className="font-display text-2xl md:text-3xl font-black text-white mb-4">
                      {selectedUnit.name}
                    </h2>

                    <p className="font-body text-bone/70 leading-relaxed mb-6">
                      {selectedUnit.lore}
                    </p>

                    {/* Stats */}
                    {selectedUnit.stats && (
                      <div className="mb-6">
                        <h4
                          className="font-display text-sm font-bold tracking-wider uppercase mb-3"
                          style={{ color: faction.color }}
                        >
                          Caracteristicas
                        </h4>
                        <div className="grid grid-cols-9 gap-1">
                          {Object.entries(selectedUnit.stats).map(([stat, value]) => (
                            <div
                              key={stat}
                              className="text-center p-2 rounded"
                              style={{ background: `${faction.color}10` }}
                            >
                              <div className="font-body text-xs text-bone/50 mb-1">{stat}</div>
                              <div className="font-display text-sm font-bold text-white">{value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <div
                      className="p-4 rounded-lg"
                      style={{ background: `${faction.color}10` }}
                    >
                      <p className="font-body text-sm text-bone/60 italic">
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
