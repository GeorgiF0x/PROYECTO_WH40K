'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Navigation, Footer } from '@/components'
import { getFactionById, factions } from '@/lib/data'

export default function FactionPage() {
  const params = useParams()
  const faction = getFactionById(params.id as string)

  if (!faction) {
    return (
      <main className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl text-white mb-4">Facción no encontrada</h1>
          <Link href="/facciones" className="text-imperial-gold hover:underline">
            Volver a facciones
          </Link>
        </div>
      </main>
    )
  }

  const otherFactions = factions.filter(f => f.id !== faction.id)

  return (
    <main className="relative min-h-screen bg-void">
      <div className="noise-overlay" />
      <Navigation />

      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-end">
        <div className="absolute inset-0">
          <Image
            src={faction.heroImage}
            alt={faction.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/80 to-void/40" />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at bottom, ${faction.color}20 0%, transparent 70%)`,
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pb-20 pt-40 w-full">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 font-body text-sm text-bone/60 mb-6"
          >
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/facciones" className="hover:text-white transition-colors">Facciones</Link>
            <span>/</span>
            <span style={{ color: faction.color }}>{faction.shortName}</span>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span
              className="font-body text-sm font-semibold tracking-widest uppercase mb-4 block"
              style={{ color: faction.color }}
            >
              {faction.tagline}
            </span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6">
              {faction.name}
            </h1>
            <p className="font-body text-xl text-bone/70 max-w-2xl leading-relaxed">
              {faction.description}
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-8 mt-10"
          >
            {[
              { label: 'Unidades', value: '50+' },
              { label: 'Codex', value: '10ª Ed.' },
              { label: 'Dificultad', value: 'Media' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl font-bold text-white">{stat.value}</div>
                <div className="font-body text-sm text-bone/50">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lore Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span
                className="font-body text-sm font-semibold tracking-widest uppercase mb-4 block"
                style={{ color: faction.color }}
              >
                Historia
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-6">
                El Trasfondo
              </h2>
              <div className="font-body text-bone/70 leading-relaxed space-y-4">
                {faction.longDescription.split('\n\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[500px] rounded-2xl overflow-hidden"
            >
              <Image
                src={faction.image}
                alt={faction.name}
                fill
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${faction.color}30 0%, transparent 100%)`,
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Units Section */}
      <section className="relative py-20 px-6 bg-void-light/30">
        <div className="max-w-7xl mx-auto">
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
              Catálogo
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-4">
              Unidades Destacadas
            </h2>
            <p className="font-body text-lg text-bone/60 max-w-xl mx-auto">
              Las miniaturas más populares de {faction.shortName}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {faction.units.map((unit, index) => (
              <motion.article
                key={unit.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group bg-void rounded-xl overflow-hidden border border-white/5 hover:border-opacity-20 transition-all"
                style={{ borderColor: `${faction.color}30` }}
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={unit.image}
                    alt={unit.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-void to-transparent" />
                  <span
                    className="absolute top-4 left-4 px-3 py-1 text-xs font-body font-semibold tracking-wide"
                    style={{ backgroundColor: faction.color, color: '#000' }}
                  >
                    {unit.type}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="font-display text-xl font-bold text-white mb-2 group-hover:text-imperial-gold transition-colors">
                    {unit.name}
                  </h3>
                  <p className="font-body text-sm text-bone/60 leading-relaxed mb-4">
                    {unit.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl font-bold text-white">
                      €{unit.price}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-5 py-2 text-sm font-body font-semibold tracking-wide transition-all"
                      style={{
                        border: `1px solid ${faction.color}`,
                        color: faction.color,
                      }}
                    >
                      Añadir
                    </motion.button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-outline font-body"
            >
              Ver Todas las Unidades
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Other Factions */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-2xl md:text-3xl font-black text-white mb-4">
              Explora Otras Facciones
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {otherFactions.map((otherFaction, index) => (
              <Link key={otherFaction.id} href={`/facciones/${otherFaction.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="group relative h-48 rounded-xl overflow-hidden"
                >
                  <Image
                    src={otherFaction.image}
                    alt={otherFaction.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-void via-void/80 to-transparent" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-center">
                    <span
                      className="font-body text-xs font-semibold tracking-wider uppercase mb-2"
                      style={{ color: otherFaction.color }}
                    >
                      {otherFaction.tagline}
                    </span>
                    <h3 className="font-display text-2xl font-bold text-white">
                      {otherFaction.name}
                    </h3>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
