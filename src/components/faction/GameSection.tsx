'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Shield, Skull, Target, Zap, Users, TrendingUp, AlertTriangle } from 'lucide-react'
import { getFactionTheme } from '@/lib/faction-themes'
import type { Faction } from '@/lib/data'

interface GameSectionProps {
  faction: Faction
}

// Mapeo de dificultad a valores numéricos
const difficultyMap: Record<string, number> = {
  'Facil': 1,
  'Media': 2,
  'Dificil': 3,
  'Muy Dificil': 4,
}

// Descripciones de "ideal para" según el estilo de juego
const idealForDescriptions: Record<string, string> = {
  'Versatil': 'Jugadores que quieren opciones tacticas y flexibilidad en cada partida.',
  'Agresivo': 'Jugadores que disfrutan cargando al enemigo y resolviendo batallas en combate cuerpo a cuerpo.',
  'Resistente': 'Jugadores pacientes que prefieren aguantar el castigo enemigo y contraatacar.',
  'Movil y Tactico': 'Jugadores que disfrutan de maniobras complejas y golpes quirurgicos.',
  'Agresivo y Caotico': 'Jugadores que quieren lanzar dados, reir y ver el caos desplegarse.',
  'Disparo a Distancia': 'Jugadores que prefieren eliminar amenazas antes de que lleguen al combate.',
  'Hordas Adaptables': 'Jugadores que disfrutan abrumando al enemigo con numeros y monstruos.',
}

export function GameSection({ faction }: GameSectionProps) {
  const theme = getFactionTheme(faction.id)
  const difficultyLevel = difficultyMap[faction.stats.difficulty] || 2

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
            Ficha de Juego
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-4">
            Como jugar {faction.shortName}
          </h2>
          <p className="font-body text-lg text-bone/60 max-w-2xl mx-auto">
            Todo lo que necesitas saber para empezar a jugar con esta faccion en el campo de batalla.
          </p>
        </motion.div>

        {/* Main Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16"
        >
          {/* Identity Card */}
          <div
            className="lg:col-span-2 p-8 rounded-2xl border"
            style={{
              background: `linear-gradient(135deg, ${theme?.cssVars['--faction-bg'] || '#030308'} 0%, ${faction.color}10 100%)`,
              borderColor: `${faction.color}30`,
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6" style={{ color: faction.color }} />
              <h3 className="font-display text-xl font-bold text-white">Identidad de Juego</h3>
            </div>

            <p className="font-body text-lg text-bone/80 leading-relaxed mb-8">
              {faction.description}
            </p>

            {/* Playstyle Badge */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div
                className="px-4 py-2 rounded-lg font-body font-semibold"
                style={{ background: `${faction.color}20`, color: faction.color }}
              >
                <span className="text-bone/60 mr-2">Estilo:</span>
                {faction.stats.playstyle}
              </div>
              <div
                className="px-4 py-2 rounded-lg font-body font-semibold"
                style={{ background: `${faction.color}20`, color: faction.color }}
              >
                <span className="text-bone/60 mr-2">Unidades:</span>
                {faction.stats.unitsCount}
              </div>
              <div
                className="px-4 py-2 rounded-lg font-body font-semibold"
                style={{ background: `${faction.color}20`, color: faction.color }}
              >
                <span className="text-bone/60 mr-2">Codex:</span>
                {faction.stats.codexEdition}
              </div>
            </div>

            {/* Ideal For */}
            <div
              className="p-4 rounded-lg border-l-4"
              style={{ background: `${faction.color}10`, borderColor: faction.color }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5" style={{ color: faction.color }} />
                <span className="font-display text-sm font-bold text-white">Ideal para...</span>
              </div>
              <p className="font-body text-bone/70">
                {idealForDescriptions[faction.stats.playstyle] || 'Jugadores que buscan una experiencia unica.'}
              </p>
            </div>
          </div>

          {/* Difficulty Card */}
          <div
            className="p-8 rounded-2xl border"
            style={{
              background: theme?.cssVars['--faction-bg'] || '#030308',
              borderColor: `${faction.color}30`,
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6" style={{ color: faction.color }} />
              <h3 className="font-display text-xl font-bold text-white">Dificultad</h3>
            </div>

            <div className="text-center mb-6">
              <span
                className="font-display text-4xl font-black"
                style={{ color: faction.color }}
              >
                {faction.stats.difficulty}
              </span>
            </div>

            {/* Difficulty Bars */}
            <div className="space-y-2 mb-6">
              {[1, 2, 3, 4].map((level) => (
                <div key={level} className="flex items-center gap-3">
                  <span className="font-body text-xs text-bone/50 w-20">
                    {level === 1 && 'Facil'}
                    {level === 2 && 'Media'}
                    {level === 3 && 'Dificil'}
                    {level === 4 && 'Muy Dificil'}
                  </span>
                  <div className="flex-1 h-3 bg-void-light rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: level <= difficultyLevel ? faction.color : 'transparent',
                      }}
                      initial={{ width: 0 }}
                      whileInView={{ width: level <= difficultyLevel ? '100%' : '0%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: level * 0.1 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="font-body text-sm text-bone/50 text-center">
              {difficultyLevel === 1 && 'Perfecta para principiantes'}
              {difficultyLevel === 2 && 'Requiere conocimiento basico'}
              {difficultyLevel === 3 && 'Requiere experiencia previa'}
              {difficultyLevel === 4 && 'Para jugadores veteranos'}
            </p>
          </div>
        </motion.div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Strengths */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl border"
            style={{
              background: `linear-gradient(135deg, ${theme?.cssVars['--faction-bg'] || '#030308'} 0%, ${faction.color}05 100%)`,
              borderColor: `${faction.color}30`,
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6" style={{ color: faction.color }} />
              <h3 className="font-display text-xl font-bold text-white">Fortalezas</h3>
            </div>
            <ul className="space-y-4">
              {faction.strengths.map((strength, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${faction.color}20` }}
                  >
                    <Zap className="w-3 h-3" style={{ color: faction.color }} />
                  </div>
                  <span className="font-body text-bone/80">{strength}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Weaknesses */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl border"
            style={{
              background: `linear-gradient(135deg, ${theme?.cssVars['--faction-bg'] || '#030308'} 0%, #8B000010 100%)`,
              borderColor: '#8B000030',
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Skull className="w-6 h-6 text-blood-light" />
              <h3 className="font-display text-xl font-bold text-white">Debilidades</h3>
            </div>
            <ul className="space-y-4">
              {faction.weaknesses.map((weakness, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: '#8B000020' }}
                  >
                    <AlertTriangle className="w-3 h-3 text-blood-light" />
                  </div>
                  <span className="font-body text-bone/80">{weakness}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Featured Units */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">
                Unidades Iconicas
              </h3>
              <p className="font-body text-bone/60">
                Las miniaturas mas representativas de {faction.shortName}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {faction.units.slice(0, 4).map((unit, index) => (
              <motion.div
                key={unit.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative rounded-xl overflow-hidden"
                style={{
                  background: theme?.gradients.card,
                }}
              >
                {/* Image */}
                <div className="relative h-32 overflow-hidden">
                  <Image
                    src={unit.image}
                    alt={unit.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-transparent" />

                  {/* Type Badge */}
                  <span
                    className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-body font-semibold tracking-wide rounded"
                    style={{ background: faction.color, color: '#000' }}
                  >
                    {unit.type}
                  </span>
                </div>

                {/* Content */}
                <div className="p-3">
                  <h4 className="font-display text-sm font-bold text-white mb-1 line-clamp-1">
                    {unit.name}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="font-body text-xs text-bone/50">
                      {unit.points} pts
                    </span>
                    {unit.stats && (
                      <span className="font-body text-xs text-bone/50">
                        T{unit.stats.T} W{unit.stats.W}
                      </span>
                    )}
                  </div>
                </div>

                {/* Hover border */}
                <motion.div
                  className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    border: `1px solid ${faction.color}`,
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 p-8 rounded-2xl border text-center"
          style={{
            background: `linear-gradient(135deg, ${faction.color}10 0%, transparent 100%)`,
            borderColor: `${faction.color}30`,
          }}
        >
          <h3 className="font-display text-xl font-bold text-white mb-4">
            Consejo para empezar
          </h3>
          <p className="font-body text-bone/70 max-w-2xl mx-auto">
            {faction.id === 'imperium' && 'Comienza con una Combat Patrol de Space Marines. Son versatiles y te permitiran aprender las mecanicas del juego mientras construyes tu ejercito.'}
            {faction.id === 'chaos' && 'Enfocate en llegar al combate cuerpo a cuerpo lo antes posible. Usa terreno y transportes para proteger a tus unidades de elite.'}
            {faction.id === 'necrons' && 'Mantén tus unidades cerca de los personajes para maximizar los Protocolos de Reanimacion. La paciencia es clave.'}
            {faction.id === 'aeldari' && 'Planifica tus movimientos con antelacion. Los Aeldari castigan errores pero recompensan el juego tactico preciso.'}
            {faction.id === 'orks' && 'Mas es mejor. No te preocupes por perder modelos, preocupate por llegar al combate con suficientes Boyz para aplastar al enemigo.'}
            {faction.id === 'tau' && 'Mantén distancia y usa Fuego de Apoyo. Tus drones son valiosos - usalos para proteger a tus unidades clave.'}
            {faction.id === 'tyranids' && 'Protege a tus criaturas sinapticas. Sin ellas, tu enjambre perdera coordinacion. Usa los Gaunts para atar unidades enemigas.'}
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default GameSection
