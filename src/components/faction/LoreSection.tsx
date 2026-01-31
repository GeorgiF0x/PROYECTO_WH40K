'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Quote, Shield, Users, Skull, Award } from 'lucide-react'
import { getFactionTheme } from '@/lib/faction-themes'
import type { Faction } from '@/lib/data'

interface LoreSectionProps {
  faction: Faction
}

export function LoreSection({ faction }: LoreSectionProps) {
  const theme = getFactionTheme(faction.id)

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Long Description intro */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-20"
        >
          <div className="prose prose-invert prose-lg">
            {faction.longDescription.split('\n\n').map((paragraph, i) => (
              <p
                key={i}
                className="font-body text-lg leading-relaxed text-bone/70 mb-6 first-letter:text-5xl first-letter:font-display first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1"
                style={{
                  '--tw-prose-first-letter': faction.color,
                } as React.CSSProperties}
              >
                <span style={{ color: i === 0 ? faction.color : undefined }}>
                  {i === 0 ? paragraph.charAt(0) : ''}
                </span>
                {i === 0 ? paragraph.slice(1) : paragraph}
              </p>
            ))}
          </div>
        </motion.div>

        {/* Lore Sections */}
        <div className="space-y-24">
          {faction.loreSections.map((section, index) => (
            <motion.article
              key={section.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'lg:grid-flow-dense' : ''
              }`}
            >
              {/* Image */}
              <motion.div
                className={`relative h-[400px] rounded-2xl overflow-hidden ${
                  index % 2 === 1 ? 'lg:col-start-2' : ''
                }`}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={faction.galleryImages[index % faction.galleryImages.length]}
                  alt={section.title}
                  fill
                  className="object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${faction.color}30 0%, transparent 100%)`,
                  }}
                />
                {/* Corner accents */}
                <div
                  className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2"
                  style={{ borderColor: faction.color }}
                />
                <div
                  className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2"
                  style={{ borderColor: faction.color }}
                />
              </motion.div>

              {/* Content */}
              <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <span
                    className="inline-block px-3 py-1 text-xs font-body font-semibold tracking-wider uppercase rounded mb-4"
                    style={{
                      background: `${faction.color}20`,
                      color: faction.color,
                    }}
                  >
                    Capitulo {index + 1}
                  </span>

                  <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-6">
                    {section.title}
                  </h2>

                  <div className="font-body text-bone/70 leading-relaxed space-y-4">
                    {section.content.split('\n\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>

                  {/* Quote if exists */}
                  {section.quote && (
                    <motion.blockquote
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                      className="mt-8 relative pl-6 border-l-2"
                      style={{ borderColor: faction.color }}
                    >
                      <Quote
                        className="absolute -left-3 -top-2 w-6 h-6"
                        style={{ color: faction.color }}
                      />
                      <p className="font-body italic text-lg text-bone/80 mb-2">
                        "{section.quote.text}"
                      </p>
                      <footer className="font-body text-sm">
                        <span style={{ color: faction.color }}>{section.quote.author}</span>
                        {section.quote.source && (
                          <span className="text-bone/50"> — {section.quote.source}</span>
                        )}
                      </footer>
                    </motion.blockquote>
                  )}
                </motion.div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Strengths & Weaknesses + Notable Characters */}
        <div className="mt-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Strengths */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-xl border"
            style={{
              background: `${theme?.cssVars['--faction-bg'] || '#030308'}`,
              borderColor: `${faction.color}30`,
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6" style={{ color: faction.color }} />
              <h3 className="font-display text-xl font-bold text-white">Fortalezas</h3>
            </div>
            <ul className="space-y-3">
              {faction.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{ background: faction.color }}
                  />
                  <span className="font-body text-sm text-bone/70">{strength}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Weaknesses */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-xl border"
            style={{
              background: `${theme?.cssVars['--faction-bg'] || '#030308'}`,
              borderColor: `${faction.color}30`,
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Skull className="w-6 h-6" style={{ color: faction.color }} />
              <h3 className="font-display text-xl font-bold text-white">Debilidades</h3>
            </div>
            <ul className="space-y-3">
              {faction.weaknesses.map((weakness, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{ background: '#8B0000' }}
                  />
                  <span className="font-body text-sm text-bone/70">{weakness}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Notable Characters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl border"
            style={{
              background: `${theme?.cssVars['--faction-bg'] || '#030308'}`,
              borderColor: `${faction.color}30`,
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-6 h-6" style={{ color: faction.color }} />
              <h3 className="font-display text-xl font-bold text-white">Personajes Notables</h3>
            </div>
            <ul className="space-y-3">
              {faction.notableCharacters.map((character, i) => (
                <li key={i} className="font-body text-sm text-bone/70">
                  <span style={{ color: faction.color }}>{character.split(' - ')[0]}</span>
                  {character.includes(' - ') && (
                    <span className="text-bone/50"> — {character.split(' - ')[1]}</span>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default LoreSection
