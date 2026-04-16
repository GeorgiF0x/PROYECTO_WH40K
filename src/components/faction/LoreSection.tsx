'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Quote, BookOpen, Users, Clock, ArrowRight } from 'lucide-react'
import { getFactionTheme } from '@/lib/faction-themes'
import type { Faction } from '@/lib/data'

interface LoreSectionProps {
  faction: Faction
}

export function LoreSection({ faction }: LoreSectionProps) {
  const theme = getFactionTheme(faction.id)

  // Solo mostramos las primeras 2 secciones de lore como "gancho"
  const featuredLore = faction.loreSections.slice(0, 2)
  const firstQuote = featuredLore.find((s) => s.quote)?.quote

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Hero Lore Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-20 max-w-4xl text-center"
        >
          <span
            className="mb-4 block font-body text-sm font-semibold uppercase tracking-widest"
            style={{ color: faction.color }}
          >
            Trasfondo
          </span>
          <h2 className="mb-8 font-display text-3xl font-black text-white md:text-5xl">
            La Historia de {faction.shortName}
          </h2>

          {/* Intro paragraph with drop cap */}
          <div className="text-left">
            <p className="font-body text-xl leading-relaxed text-bone/80">
              <span
                className="float-left mr-4 mt-1 font-display text-6xl font-black leading-none"
                style={{ color: faction.color }}
              >
                {faction.longDescription.charAt(0)}
              </span>
              {faction.longDescription.split('\n\n')[0].slice(1)}
            </p>
          </div>
        </motion.div>

        {/* Featured Quote */}
        {firstQuote && (
          <motion.blockquote
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative mx-auto mb-20 max-w-3xl rounded-2xl p-8 text-center"
            style={{
              background: `linear-gradient(135deg, ${faction.color}15 0%, transparent 100%)`,
              border: `1px solid ${faction.color}30`,
            }}
          >
            <Quote
              className="absolute left-4 top-4 h-8 w-8 opacity-30"
              style={{ color: faction.color }}
            />
            <Quote
              className="absolute bottom-4 right-4 h-8 w-8 rotate-180 opacity-30"
              style={{ color: faction.color }}
            />
            <p className="mb-4 font-body text-2xl italic text-bone/90">"{firstQuote.text}"</p>
            <footer className="font-body">
              <span className="font-semibold" style={{ color: faction.color }}>
                {firstQuote.author}
              </span>
              {firstQuote.source && <span className="text-bone/50"> — {firstQuote.source}</span>}
            </footer>
          </motion.blockquote>
        )}

        {/* Lore Cards - Solo 2 secciones principales */}
        <div className="mb-20 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {featuredLore.map((section, index) => (
            <motion.article
              key={section.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl"
              style={{
                background: theme?.cssVars['--faction-bg'] || '#030308',
                border: `1px solid ${faction.color}20`,
              }}
            >
              {/* Image Header */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={faction.galleryImages[index] || faction.image}
                  alt={section.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void via-void/80 to-transparent" />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${faction.color}30 0%, transparent 100%)`,
                  }}
                />

                {/* Chapter number */}
                <div
                  className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full font-display font-bold"
                  style={{ background: faction.color, color: '#000' }}
                >
                  {index + 1}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="mb-4 font-display text-xl font-bold text-white">{section.title}</h3>
                <p className="line-clamp-4 font-body leading-relaxed text-bone/70">
                  {section.content.split('\n\n')[0]}
                </p>

                {/* Read more hint */}
                <Link
                  href={`/wiki/${faction.id}`}
                  className="mt-4 flex items-center gap-2 font-body text-sm opacity-60 transition-opacity group-hover:opacity-100"
                  style={{ color: faction.color }}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Explorar en la Wiki</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Notable Characters Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="mb-8 flex items-center gap-3">
            <Users className="h-6 w-6" style={{ color: faction.color }} />
            <h3 className="font-display text-2xl font-bold text-white">Personajes Legendarios</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {faction.notableCharacters.map((character, i) => {
              const [name, title] = character.split(' - ')
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border p-4 transition-all hover:border-opacity-50"
                  style={{
                    background: `${faction.color}05`,
                    borderColor: `${faction.color}20`,
                  }}
                >
                  <h4
                    className="mb-1 font-display text-sm font-bold"
                    style={{ color: faction.color }}
                  >
                    {name}
                  </h4>
                  {title && <p className="font-body text-xs text-bone/50">{title}</p>}
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Wiki CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl p-8"
          style={{
            background: `linear-gradient(135deg, ${theme?.cssVars['--faction-bg'] || '#030308'} 0%, ${faction.color}10 100%)`,
            border: `1px solid ${faction.color}30`,
          }}
        >
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, ${faction.color} 0px, ${faction.color} 1px, transparent 1px, transparent 50px)`,
            }}
          />

          <div className="relative flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{ background: `${faction.color}20` }}
              >
                <BookOpen className="h-8 w-8" style={{ color: faction.color }} />
              </div>
              <div>
                <h3 className="mb-1 font-display text-xl font-bold text-white">
                  Lexicanum Imperial
                </h3>
                <p className="font-body text-bone/60">
                  Explora la historia completa, batallas y leyendas
                </p>
              </div>
            </div>

            <Link
              href={`/wiki/${faction.id}`}
              className="flex items-center gap-2 rounded-lg px-6 py-3 font-body font-semibold transition-all hover:scale-105"
              style={{
                background: `${faction.color}20`,
                color: faction.color,
                border: `1px solid ${faction.color}40`,
              }}
            >
              <span>Explorar Wiki</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default LoreSection
