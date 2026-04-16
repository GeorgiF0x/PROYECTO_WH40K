'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100])

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&q=80"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-void via-void/80 to-void" />
        <div className="absolute inset-0 bg-gradient-to-r from-void via-transparent to-void/50" />

        {/* Animated gradient orbs — CSS animations for infinite loops */}
        <div
          className="absolute left-1/4 top-1/4 h-[600px] w-[600px] animate-[heroOrbGold_8s_ease-in-out_infinite] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(201, 162, 39, 0.15) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] animate-[heroOrbRed_10s_ease-in-out_infinite] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(220, 20, 60, 0.1) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Grid Pattern */}
      <div className="grid-pattern absolute inset-0 opacity-30" />

      {/* Content */}
      <motion.div
        style={{ opacity, scale, y }}
        className="relative z-10 max-w-5xl px-6 text-center"
      >
        {/* Main Title */}
        <h1 className="mb-6 font-display text-5xl font-black leading-none tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          <span className="text-white">EN EL GRIM</span>
          <br />
          <span className="text-gradient">DARKNESS</span>
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mx-auto mb-10 max-w-2xl font-body text-xl font-light leading-relaxed text-bone/70 md:text-2xl"
        >
          Solo existe la guerra. Equipa tu ejército con las mejores miniaturas, pinturas y
          accesorios del universo de Warhammer 40K.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col justify-center gap-4 sm:flex-row"
        >
          <Link href="/facciones">
            <motion.button
              className="btn-modern font-body"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Explorar Facciones
            </motion.button>
          </Link>
          <motion.button
            className="btn-outline font-body"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Ver Catálogo
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mx-auto mt-20 grid max-w-xl grid-cols-3 gap-8"
        >
          {[
            { value: '500+', label: 'Productos' },
            { value: '20+', label: 'Facciones' },
            { value: '10K+', label: 'Clientes' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-3xl font-bold text-imperial-gold md:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 font-body text-sm tracking-wide text-bone/50">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
      >
        <div className="flex animate-[scrollBounce_2s_ease-in-out_infinite] cursor-pointer flex-col items-center gap-2">
          <span className="font-body text-xs uppercase tracking-widest text-bone/40">Scroll</span>
          <div className="flex h-10 w-6 justify-center rounded-full border border-bone/20 pt-2">
            <div className="h-2 w-1 animate-[scrollDot_1.5s_ease-in-out_infinite] rounded-full bg-imperial-gold" />
          </div>
        </div>
      </motion.div>
    </section>
  )
}
