'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Expand, Download } from 'lucide-react'
import { getFactionTheme } from '@/lib/faction-themes'
import type { Faction } from '@/lib/data'

interface FactionGalleryProps {
  faction: Faction
}

export function FactionGallery({ faction }: FactionGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const theme = getFactionTheme(faction.id)

  const allImages = [faction.heroImage, ...faction.galleryImages]

  const handlePrev = () => {
    if (selectedIndex === null) return
    setSelectedIndex((selectedIndex - 1 + allImages.length) % allImages.length)
  }

  const handleNext = () => {
    if (selectedIndex === null) return
    setSelectedIndex((selectedIndex + 1) % allImages.length)
  }

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
            Galeria Visual
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-4">
            Imagenes de {faction.shortName}
          </h2>
          <p className="font-body text-lg text-bone/60 max-w-xl mx-auto">
            Explora la estetica y el arte de esta faccion. Miniaturas, ilustraciones y escenas de batalla.
          </p>
        </motion.div>

        {/* Main Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Hero Image - Large */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="col-span-2 row-span-2 relative group cursor-pointer overflow-hidden rounded-2xl"
            onClick={() => setSelectedIndex(0)}
          >
            <div className="relative h-full min-h-[400px]">
              <Image
                src={faction.heroImage}
                alt={`${faction.name} - Principal`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${faction.color}40 0%, transparent 50%)`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent" />

              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="p-4 rounded-full"
                  style={{ background: `${faction.color}20`, border: `1px solid ${faction.color}` }}
                >
                  <Expand className="w-8 h-8" style={{ color: faction.color }} />
                </motion.div>
              </div>

              {/* Label */}
              <div className="absolute bottom-4 left-4">
                <span
                  className="px-3 py-1.5 text-xs font-body font-semibold tracking-wide rounded"
                  style={{ background: faction.color, color: '#000' }}
                >
                  Imagen Principal
                </span>
              </div>
            </div>
          </motion.div>

          {/* Gallery Images */}
          {faction.galleryImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative group cursor-pointer overflow-hidden rounded-xl aspect-square"
              onClick={() => setSelectedIndex(index + 1)}
            >
              <Image
                src={image}
                alt={`${faction.name} - Galeria ${index + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Faction color overlay on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${faction.color}60 0%, transparent 100%)`,
                }}
              />

              {/* Expand icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Expand className="w-6 h-6 text-white drop-shadow-lg" />
              </div>

              {/* Number badge */}
              <div
                className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center font-display text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: faction.color, color: '#000' }}
              >
                {index + 1}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-wrap justify-center gap-8"
        >
          {[
            { label: 'Imagenes', value: allImages.length },
            { label: 'Resolucion', value: 'HD' },
            { label: 'Estilo', value: 'Grimdark' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="font-display text-2xl font-bold"
                style={{ color: faction.color }}
              >
                {stat.value}
              </div>
              <div className="font-body text-sm text-bone/50">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center"
              onClick={() => setSelectedIndex(null)}
            >
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/95" />

              {/* Navigation */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrev()
                }}
                className="absolute left-4 z-10 p-3 rounded-full transition-all hover:scale-110"
                style={{
                  background: `${faction.color}20`,
                  border: `1px solid ${faction.color}40`,
                }}
              >
                <ChevronLeft className="w-6 h-6" style={{ color: faction.color }} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
                className="absolute right-4 z-10 p-3 rounded-full transition-all hover:scale-110"
                style={{
                  background: `${faction.color}20`,
                  border: `1px solid ${faction.color}40`,
                }}
              >
                <ChevronRight className="w-6 h-6" style={{ color: faction.color }} />
              </button>

              {/* Close button */}
              <button
                onClick={() => setSelectedIndex(null)}
                className="absolute top-4 right-4 z-10 p-3 rounded-full transition-all hover:scale-110"
                style={{
                  background: `${faction.color}20`,
                  border: `1px solid ${faction.color}40`,
                }}
              >
                <X className="w-6 h-6" style={{ color: faction.color }} />
              </button>

              {/* Image */}
              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative max-w-5xl max-h-[80vh] w-full h-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={allImages[selectedIndex]}
                  alt={`${faction.name} - Imagen ${selectedIndex + 1}`}
                  fill
                  className="object-contain"
                />
              </motion.div>

              {/* Counter */}
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full font-body text-sm"
                style={{
                  background: `${faction.color}20`,
                  border: `1px solid ${faction.color}40`,
                  color: faction.color,
                }}
              >
                {selectedIndex + 1} / {allImages.length}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

export default FactionGallery
