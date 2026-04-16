'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface ProductCardProps {
  faction: string
  name: string
  description: string
  price: number
  badge?: string
  image: string
  index: number
}

export default function ProductCard({
  faction,
  name,
  description,
  price,
  badge,
  image,
  index,
}: ProductCardProps) {
  const factionColors: Record<string, string> = {
    Imperium: 'text-imperial-gold',
    Chaos: 'text-blood-light',
    Necrons: 'text-necron',
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="card-hover group relative overflow-hidden rounded-lg bg-void-light"
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="img-zoom object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-void-light via-transparent to-transparent" />

        {/* Badge */}
        {badge && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="absolute right-4 top-4 z-10"
          >
            <span className="bg-imperial-gold px-3 py-1.5 font-body text-xs font-semibold tracking-wide text-void">
              {badge}
            </span>
          </motion.div>
        )}

        {/* Quick View Overlay */}
        <motion.div className="absolute inset-0 flex items-center justify-center bg-void/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white px-6 py-3 font-body text-sm font-semibold tracking-wide text-void"
          >
            Vista Rápida
          </motion.button>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Faction Tag */}
        <span
          className={`font-body text-xs font-semibold uppercase tracking-wider ${factionColors[faction] || 'text-bone/60'}`}
        >
          {faction}
        </span>

        {/* Name */}
        <h3 className="mb-3 mt-2 font-display text-lg font-bold leading-tight text-white transition-colors group-hover:text-imperial-gold">
          {name}
        </h3>

        {/* Description */}
        <p className="mb-4 line-clamp-2 font-body text-sm leading-relaxed text-bone/60">
          {description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div>
            <span className="font-display text-2xl font-bold text-white">€{price}</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="border border-imperial-gold/50 px-5 py-2.5 font-body text-sm font-semibold tracking-wide text-imperial-gold transition-all duration-300 hover:bg-imperial-gold hover:text-void"
          >
            Añadir
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}
