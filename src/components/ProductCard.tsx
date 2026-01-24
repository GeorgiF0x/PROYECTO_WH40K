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
      className="group relative bg-void-light rounded-lg overflow-hidden card-hover"
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover img-zoom"
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
            className="absolute top-4 right-4 z-10"
          >
            <span className="px-3 py-1.5 bg-imperial-gold text-void text-xs font-body font-semibold tracking-wide">
              {badge}
            </span>
          </motion.div>
        )}

        {/* Quick View Overlay */}
        <motion.div
          className="absolute inset-0 bg-void/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-white text-void font-body font-semibold text-sm tracking-wide"
          >
            Vista Rápida
          </motion.button>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Faction Tag */}
        <span className={`font-body text-xs font-semibold tracking-wider uppercase ${factionColors[faction] || 'text-bone/60'}`}>
          {faction}
        </span>

        {/* Name */}
        <h3 className="font-display text-lg font-bold text-white mt-2 mb-3 leading-tight group-hover:text-imperial-gold transition-colors">
          {name}
        </h3>

        {/* Description */}
        <p className="font-body text-sm text-bone/60 leading-relaxed mb-4 line-clamp-2">
          {description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div>
            <span className="font-display text-2xl font-bold text-white">
              €{price}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 border border-imperial-gold/50 text-imperial-gold font-body text-sm font-semibold tracking-wide hover:bg-imperial-gold hover:text-void transition-all duration-300"
          >
            Añadir
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}
