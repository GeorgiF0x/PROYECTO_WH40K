'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu } from 'lucide-react'

const BOOT_LINES = [
  { text: '> INITIATING COGITATOR SEQUENCE...', delay: 0 },
  { text: '> MACHINE SPIRIT AWAKENING.............. OK', delay: 300 },
  { text: '> NOOSPHERIC LINK ESTABLISHED........... OK', delay: 550 },
  { text: '> VERIFYING IMPERIAL CREDENTIALS........ OK', delay: 800 },
  { text: '> LOADING ASTROPATHIC RELAY BUFFERS..... OK', delay: 1050 },
  { text: '> SYNCHRONIZING FORGE DATABANKS......... OK', delay: 1300 },
  { text: '> PURGING HERETICAL DATA FRAGMENTS...... OK', delay: 1550 },
  { text: '> RITE OF ACTIVATION COMPLETE', delay: 1800 },
  { text: '', delay: 1950 },
  { text: '  ++ ACCESO AUTORIZADO ++', delay: 2050 },
  { text: '  ++ OMNISSIAH PROTECTS ++', delay: 2200 },
]

const BOOT_TOTAL_DURATION = 2900

export default function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState(0)
  const [phase, setPhase] = useState<'flash' | 'boot' | 'reveal'>('flash')
  const hasCompleted = useRef(false)

  useEffect(() => {
    const flashTimer = setTimeout(() => setPhase('boot'), 250)

    const lineTimers = BOOT_LINES.map((line, i) =>
      setTimeout(() => setVisibleLines(i + 1), line.delay + 300)
    )

    const revealTimer = setTimeout(() => setPhase('reveal'), BOOT_TOTAL_DURATION)

    const doneTimer = setTimeout(() => {
      if (!hasCompleted.current) {
        hasCompleted.current = true
        onComplete()
      }
    }, BOOT_TOTAL_DURATION + 500)

    return () => {
      clearTimeout(flashTimer)
      lineTimers.forEach(clearTimeout)
      clearTimeout(revealTimer)
      clearTimeout(doneTimer)
    }
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-void"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      {/* CRT scanlines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(201,162,39,0.4) 2px, rgba(201,162,39,0.4) 4px)',
        }}
      />

      {/* Sweeping scan line */}
      <motion.div
        className="pointer-events-none absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-imperial-gold/40 to-transparent"
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
      />

      {/* Power-on flash */}
      <AnimatePresence>
        {phase === 'flash' && (
          <motion.div
            className="absolute inset-0 bg-imperial-gold/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
        )}
      </AnimatePresence>

      {/* Screen flicker */}
      {phase === 'boot' && (
        <motion.div
          className="pointer-events-none absolute inset-0 bg-imperial-gold/5"
          animate={{ opacity: [0, 0.08, 0, 0.04, 0] }}
          transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 1.5 }}
        />
      )}

      {/* Terminal content */}
      <motion.div
        className="relative w-full max-w-2xl px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase !== 'flash' ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative overflow-hidden rounded-lg border border-imperial-gold/20 bg-void-light/10 p-6">
          {/* Corner brackets */}
          <div className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-imperial-gold/50" />
          <div className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-imperial-gold/50" />
          <div className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-imperial-gold/50" />
          <div className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-imperial-gold/50" />

          {/* Header */}
          <div className="mb-5 flex items-center gap-3 border-b border-imperial-gold/10 pb-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Cpu className="h-4 w-4 text-imperial-gold" />
            </motion.div>
            <span className="font-body text-xs uppercase tracking-[0.3em] text-imperial-gold">
              Cogitator MK.VII — Autenticacion Imperial
            </span>
            <motion.span
              className="ml-auto font-body text-xs text-imperial-gold/50"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              _
            </motion.span>
          </div>

          {/* Boot log lines */}
          <div className="min-h-[240px] space-y-1 font-mono text-xs">
            {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className={
                  line.text.includes('ACCESO AUTORIZADO')
                    ? 'mt-2 font-bold text-green-400'
                    : line.text.includes('OMNISSIAH')
                      ? 'font-bold text-imperial-gold'
                      : line.text.includes('OK')
                        ? 'text-imperial-gold/70'
                        : 'text-bone/50'
                }
              >
                {line.text}
                {i === visibleLines - 1 && phase === 'boot' && (
                  <motion.span
                    className="ml-1 inline-block text-imperial-gold"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    |
                  </motion.span>
                )}
              </motion.div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-4 border-t border-imperial-gold/10 pt-3">
            <div className="h-1 overflow-hidden rounded-full bg-void">
              <motion.div
                className="h-full bg-gradient-to-r from-imperial-gold/60 via-imperial-gold to-imperial-gold/60"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: BOOT_TOTAL_DURATION / 1000 - 0.3, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Final flash */}
      <AnimatePresence>
        {phase === 'reveal' && (
          <motion.div
            className="absolute inset-0 bg-imperial-gold/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
