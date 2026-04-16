'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export default function Quote() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 1, 1, 0.8])

  return (
    <section ref={ref} className="relative overflow-hidden px-6 py-32">
      {/* Background effects */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 30% 50%, rgba(139, 0, 0, 0.2) 0%, transparent 60%)',
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 70% 50%, rgba(107, 28, 95, 0.15) 0%, transparent 60%)',
        }}
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
      />

      <motion.div style={{ opacity, scale }} className="relative mx-auto max-w-4xl text-center">
        {/* Quote Mark */}
        <motion.span
          className="font-cinzel block select-none text-[10rem] leading-none text-blood opacity-30"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 0.3, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          "
        </motion.span>

        {/* Quote Text */}
        <motion.blockquote
          className="font-almendra -mt-20 mb-10 text-2xl italic leading-relaxed text-bone-dark md:text-3xl lg:text-4xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          En la oscuridad del lejano futuro, solo existe la guerra. No hay paz entre las estrellas,
          solo una eternidad de carnicería y matanza, y la risa de los dioses sedientos.
        </motion.blockquote>

        {/* Author */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <p className="font-cinzel text-lg uppercase tracking-[0.2em] text-imperial-gold">
            Credo Imperial
          </p>
          <p className="font-cinzel mt-2 text-sm tracking-wider text-imperial-bronze">
            M41 - Administratum Terra
          </p>
        </motion.div>
      </motion.div>
    </section>
  )
}
