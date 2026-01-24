'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// Particle component for atmospheric effect
function Particle({ delay }: { delay: number }) {
  const [dimensions, setDimensions] = useState({ x: 50, height: 800 })

  useEffect(() => {
    setDimensions({
      x: Math.random() * 100,
      height: window.innerHeight
    })
  }, [])

  const randomDuration = 15 + Math.random() * 20
  const randomSize = 1 + Math.random() * 2

  return (
    <motion.div
      className="absolute rounded-full bg-imperial-gold/30"
      style={{
        width: randomSize,
        height: randomSize,
        left: `${dimensions.x}%`,
        bottom: -10,
      }}
      animate={{
        y: [0, -(dimensions.height + 100)],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: randomDuration,
        repeat: Infinity,
        delay: delay,
        ease: 'linear',
      }}
    />
  )
}

// Animated rune symbols
const runes = ['⚔', '☠', '⚡', '✠', '⛧', '◈', '◇', '⬡']

function RuneSymbol({ className, index }: { className?: string; index: number }) {
  const rune = runes[index % runes.length]

  return (
    <motion.span
      className={`text-imperial-gold/10 font-display select-none ${className}`}
      animate={{
        opacity: [0.05, 0.15, 0.05],
      }}
      transition={{
        duration: 4 + (index % 3),
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {rune}
    </motion.span>
  )
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [particles, setParticles] = useState<number[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setParticles(Array.from({ length: 25 }, (_, i) => i))
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden bg-void">
      {/* Atmospheric Background */}
      <div className="absolute inset-0">
        {/* Dark gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-void via-void-light to-void" />

        {/* Radial glow from center */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,162,39,0.08)_0%,transparent_70%)]" />

        {/* Blood red accent from corner */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,0,0,0.15)_0%,transparent_50%)]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(201, 162, 39, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(201, 162, 39, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating particles */}
        {mounted && (
          <div className="absolute inset-0 overflow-hidden">
            {particles.map((i) => (
              <Particle key={i} delay={i * 0.5} />
            ))}
          </div>
        )}

        {/* Decorative runes scattered */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <RuneSymbol className="absolute top-[10%] left-[5%] text-6xl" index={0} />
          <RuneSymbol className="absolute top-[20%] right-[10%] text-8xl" index={1} />
          <RuneSymbol className="absolute bottom-[30%] left-[15%] text-7xl" index={2} />
          <RuneSymbol className="absolute bottom-[15%] right-[5%] text-5xl" index={3} />
          <RuneSymbol className="absolute top-[50%] left-[3%] text-4xl" index={4} />
          <RuneSymbol className="absolute top-[70%] right-[12%] text-6xl" index={5} />
        </div>

        {/* Vignette effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          className="p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/" className="inline-flex items-center gap-3 group">
            {/* Animated logo icon */}
            <motion.div
              className="relative w-12 h-12"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <div
                className="absolute inset-0 bg-gradient-to-br from-imperial-gold via-yellow-500 to-imperial-gold"
                style={{
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                }}
              />
              <motion.div
                className="absolute inset-0"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(201, 162, 39, 0.3)',
                    '0 0 40px rgba(201, 162, 39, 0.6)',
                    '0 0 20px rgba(201, 162, 39, 0.3)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                }}
              />
              <div
                className="absolute inset-[3px] bg-void"
                style={{
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                }}
              />
              <div
                className="absolute inset-[6px] bg-gradient-to-br from-imperial-gold/80 to-yellow-600/80"
                style={{
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                }}
              />
            </motion.div>

            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-[0.2em] text-bone group-hover:text-white transition-colors">
                FORGE
              </span>
              <span className="font-display text-xl font-bold tracking-[0.2em] text-imperial-gold">
                OF WAR
              </span>
            </div>
          </Link>
        </motion.header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.7,
              delay: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className="w-full max-w-md"
          >
            {children}
          </motion.div>
        </main>

        {/* Footer */}
        <motion.footer
          className="p-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm text-bone/40 font-body tracking-wide">
            En el grim darkness del futuro lejano, solo hay guerra.
          </p>
        </motion.footer>
      </div>
    </div>
  )
}
