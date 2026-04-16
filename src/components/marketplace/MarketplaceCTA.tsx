'use client'

import { motion } from 'framer-motion'
import { Compass, Plus } from 'lucide-react'
import Link from 'next/link'

export default function MarketplaceCTA() {
  return (
    <section className="mt-20 px-6">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl"
        >
          {/* Warm golden vignette background — Rogue Trader */}
          <div className="absolute inset-0 bg-gradient-to-br from-imperial-gold/15 via-void-light to-imperial-gold/10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />

          {/* Baroque filigree corners */}
          <svg
            viewBox="0 0 60 60"
            className="pointer-events-none absolute left-0 top-0 h-14 w-14 text-imperial-gold"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
          >
            <path d="M0 60 V18 Q0 0 18 0 H60" strokeWidth="1.5" opacity="0.5" />
            <path d="M7 48 V22 Q7 7 22 7 H48" strokeWidth="0.75" opacity="0.2" />
            <path d="M14 22 Q6 6 22 6" strokeWidth="1" opacity="0.4" />
            <circle cx="13" cy="13" r="2" fill="currentColor" opacity="0.35" stroke="none" />
          </svg>
          <svg
            viewBox="0 0 60 60"
            className="pointer-events-none absolute right-0 top-0 h-14 w-14 text-imperial-gold"
            style={{ transform: 'scaleX(-1)' }}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
          >
            <path d="M0 60 V18 Q0 0 18 0 H60" strokeWidth="1.5" opacity="0.5" />
            <path d="M7 48 V22 Q7 7 22 7 H48" strokeWidth="0.75" opacity="0.2" />
            <path d="M14 22 Q6 6 22 6" strokeWidth="1" opacity="0.4" />
            <circle cx="13" cy="13" r="2" fill="currentColor" opacity="0.35" stroke="none" />
          </svg>
          <svg
            viewBox="0 0 60 60"
            className="pointer-events-none absolute bottom-0 left-0 h-14 w-14 text-imperial-gold"
            style={{ transform: 'scaleY(-1)' }}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
          >
            <path d="M0 60 V18 Q0 0 18 0 H60" strokeWidth="1.5" opacity="0.5" />
            <path d="M7 48 V22 Q7 7 22 7 H48" strokeWidth="0.75" opacity="0.2" />
            <path d="M14 22 Q6 6 22 6" strokeWidth="1" opacity="0.4" />
            <circle cx="13" cy="13" r="2" fill="currentColor" opacity="0.35" stroke="none" />
          </svg>
          <svg
            viewBox="0 0 60 60"
            className="pointer-events-none absolute bottom-0 right-0 h-14 w-14 text-imperial-gold"
            style={{ transform: 'scale(-1)' }}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
          >
            <path d="M0 60 V18 Q0 0 18 0 H60" strokeWidth="1.5" opacity="0.5" />
            <path d="M7 48 V22 Q7 7 22 7 H48" strokeWidth="0.75" opacity="0.2" />
            <path d="M14 22 Q6 6 22 6" strokeWidth="1" opacity="0.4" />
            <circle cx="13" cy="13" r="2" fill="currentColor" opacity="0.35" stroke="none" />
          </svg>

          {/* Traveling golden shimmer along top */}
          <motion.div
            className="pointer-events-none absolute left-0 top-0 h-[2px] w-32 bg-gradient-to-r from-transparent via-imperial-gold/40 to-transparent"
            animate={{ left: ['-15%', '115%'] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
          />

          <div className="relative z-10 p-8 text-center md:p-12">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-imperial-gold/30 bg-imperial-gold/15"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              >
                <Compass className="h-8 w-8 text-imperial-gold" />
              </motion.div>
            </motion.div>

            <h2 className="mb-4 font-display text-2xl font-bold text-bone md:text-3xl">
              ¿Tienes miniaturas que ya no usas?
            </h2>
            <p className="mx-auto mb-8 max-w-xl font-body text-bone/60">
              Dales una segunda vida vendiéndolas o intercambiándolas con otros coleccionistas de la
              comunidad.
            </p>

            <Link href="/mercado/nuevo">
              <motion.span
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-imperial-gold to-yellow-500 px-8 py-4 font-display text-sm font-bold uppercase tracking-wider text-void"
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 10px 40px rgba(201, 162, 39, 0.4)',
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-5 w-5" />
                Publicar Anuncio
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
