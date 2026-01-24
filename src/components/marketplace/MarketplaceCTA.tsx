'use client'

import { motion } from 'framer-motion'
import { Package, Plus } from 'lucide-react'
import Link from 'next/link'

export default function MarketplaceCTA() {
  return (
    <section className="px-6 mt-20">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-imperial-gold/20 via-void-light to-blood/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />

          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-imperial-gold/40" />
          <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-imperial-gold/40" />

          <div className="relative z-10 p-8 md:p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-imperial-gold/20 border border-imperial-gold/40 mb-6"
            >
              <Package className="w-8 h-8 text-imperial-gold" />
            </motion.div>

            <h2 className="text-2xl md:text-3xl font-display font-bold text-bone mb-4">
              ¿Tienes miniaturas que ya no usas?
            </h2>
            <p className="text-bone/60 font-body mb-8 max-w-xl mx-auto">
              Dales una segunda vida vendiéndolas o intercambiándolas con otros
              coleccionistas de la comunidad.
            </p>

            <Link href="/mercado/nuevo">
              <motion.span
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-imperial-gold to-yellow-500 text-void font-display font-bold tracking-wider uppercase text-sm rounded-lg cursor-pointer"
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 10px 40px rgba(201, 162, 39, 0.4)',
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5" />
                Publicar Anuncio
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
