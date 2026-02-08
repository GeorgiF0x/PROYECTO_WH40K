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
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
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
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full animate-[heroOrbGold_8s_ease-in-out_infinite]"
          style={{
            background: 'radial-gradient(circle, rgba(201, 162, 39, 0.15) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full animate-[heroOrbRed_10s_ease-in-out_infinite]"
          style={{
            background: 'radial-gradient(circle, rgba(220, 20, 60, 0.1) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 grid-pattern opacity-30" />

      {/* Content */}
      <motion.div
        style={{ opacity, scale, y }}
        className="relative z-10 text-center px-6 max-w-5xl"
      >
        {/* Main Title */}
        <h1
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-none tracking-tight"
        >
          <span className="text-white">EN EL GRIM</span>
          <br />
          <span className="text-gradient">DARKNESS</span>
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="font-body text-xl md:text-2xl text-bone/70 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
        >
          Solo existe la guerra. Equipa tu ejército con las mejores miniaturas,
          pinturas y accesorios del universo de Warhammer 40K.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
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
          className="mt-20 grid grid-cols-3 gap-8 max-w-xl mx-auto"
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
              <div className="font-display text-3xl md:text-4xl font-bold text-imperial-gold">
                {stat.value}
              </div>
              <div className="font-body text-sm text-bone/50 mt-1 tracking-wide">
                {stat.label}
              </div>
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
        <div className="flex flex-col items-center gap-2 cursor-pointer animate-[scrollBounce_2s_ease-in-out_infinite]">
          <span className="font-body text-xs text-bone/40 tracking-widest uppercase">
            Scroll
          </span>
          <div className="w-6 h-10 border border-bone/20 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-imperial-gold rounded-full animate-[scrollDot_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      </motion.div>
    </section>
  )
}
