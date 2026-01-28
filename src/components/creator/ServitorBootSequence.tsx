'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cog, SkipForward } from 'lucide-react'

interface ServitorBootSequenceProps {
  onComplete: () => void
  duration?: number // Total duration in ms (default 5500)
}

interface BootPhase {
  text: string
  subtext?: string
  duration: number
  color: string
}

const bootPhases: BootPhase[] = [
  {
    text: 'INICIALIZANDO COGITADOR...',
    subtext: 'Activando circuitos lógicos',
    duration: 1200,
    color: '#22c55e' // green
  },
  {
    text: 'ESPÍRITU MÁQUINA DESPERTANDO...',
    subtext: 'Recitando letanías de activación',
    duration: 1500,
    color: '#eab308' // yellow
  },
  {
    text: 'ENLACE ADMINISTRATUM ESTABLECIDO',
    subtext: 'Conexión segura verificada',
    duration: 1200,
    color: '#06b6d4' // cyan
  },
  {
    text: 'PROTOCOLO: VERIFICACIÓN DE CREADOR',
    subtext: 'Sistema listo para registro',
    duration: 1600,
    color: '#a855f7' // purple
  }
]

export function ServitorBootSequence({ onComplete, duration = 5500 }: ServitorBootSequenceProps) {
  const [currentPhase, setCurrentPhase] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [showSubtext, setShowSubtext] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [scanLine, setScanLine] = useState(0)

  const skipSequence = useCallback(() => {
    setIsComplete(true)
    setTimeout(onComplete, 300)
  }, [onComplete])

  // Scanline animation
  useEffect(() => {
    const interval = setInterval(() => {
      setScanLine(prev => (prev + 1) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  // Boot sequence logic
  useEffect(() => {
    if (isComplete) return

    const phase = bootPhases[currentPhase]
    if (!phase) {
      setIsComplete(true)
      setTimeout(onComplete, 500)
      return
    }

    // Type out the text
    let charIndex = 0
    setDisplayText('')
    setShowSubtext(false)

    const typeInterval = setInterval(() => {
      if (charIndex < phase.text.length) {
        setDisplayText(phase.text.slice(0, charIndex + 1))
        charIndex++
      } else {
        clearInterval(typeInterval)
        setShowSubtext(true)
      }
    }, 40)

    // Move to next phase
    const phaseTimeout = setTimeout(() => {
      setCurrentPhase(prev => prev + 1)
    }, phase.duration)

    return () => {
      clearInterval(typeInterval)
      clearTimeout(phaseTimeout)
    }
  }, [currentPhase, isComplete, onComplete])

  const phase = bootPhases[currentPhase] || bootPhases[bootPhases.length - 1]

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-50 bg-void flex items-center justify-center overflow-hidden"
        >
          {/* CRT scanline effect */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0, 0, 0, 0.1) 2px,
                rgba(0, 0, 0, 0.1) 4px
              )`,
            }}
          />

          {/* Moving scanline */}
          <motion.div
            className="absolute left-0 right-0 h-1 pointer-events-none"
            style={{
              top: `${scanLine}%`,
              background: `linear-gradient(90deg, transparent, ${phase.color}20, transparent)`,
            }}
          />

          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.5) 100%)',
            }}
          />

          {/* Grid background */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
          />

          {/* Content */}
          <div className="relative max-w-2xl w-full px-8">
            {/* Cogitator icon */}
            <motion.div
              className="flex justify-center mb-8"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <div className="relative">
                <Cog className="w-16 h-16" style={{ color: phase.color }} />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: [
                      `0 0 20px ${phase.color}40`,
                      `0 0 40px ${phase.color}60`,
                      `0 0 20px ${phase.color}40`,
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
            </motion.div>

            {/* Terminal window */}
            <div className="relative">
              {/* Corner brackets */}
              <div className="absolute -top-2 -left-2 w-4 h-4 border-l-2 border-t-2" style={{ borderColor: phase.color }} />
              <div className="absolute -top-2 -right-2 w-4 h-4 border-r-2 border-t-2" style={{ borderColor: phase.color }} />
              <div className="absolute -bottom-2 -left-2 w-4 h-4 border-l-2 border-b-2" style={{ borderColor: phase.color }} />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-r-2 border-b-2" style={{ borderColor: phase.color }} />

              <div className="bg-void-900/80 border border-void-700 rounded-lg p-6 backdrop-blur-sm">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-void-700">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                  </div>
                  <span className="text-xs font-mono text-bone-600 ml-2">COGITATOR TERMINAL v.M41</span>
                </div>

                {/* Main text */}
                <div className="font-mono text-lg mb-2" style={{ color: phase.color }}>
                  <span>{displayText}</span>
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="ml-0.5"
                  >
                    _
                  </motion.span>
                </div>

                {/* Subtext */}
                <AnimatePresence>
                  {showSubtext && phase.subtext && (
                    <motion.p
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-bone-500 font-mono"
                    >
                      {'>'} {phase.subtext}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Progress indicators */}
                <div className="mt-6 flex items-center gap-2">
                  {bootPhases.map((_, idx) => (
                    <motion.div
                      key={idx}
                      className="h-1 flex-1 rounded-full overflow-hidden bg-void-700"
                    >
                      <motion.div
                        className="h-full"
                        initial={{ width: '0%' }}
                        animate={{
                          width: idx < currentPhase ? '100%' : idx === currentPhase ? '50%' : '0%',
                        }}
                        style={{ backgroundColor: bootPhases[idx].color }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skip button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={skipSequence}
              className="mt-6 mx-auto flex items-center gap-2 px-4 py-2 text-sm font-mono text-bone-500 hover:text-bone-300 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
              Saltar secuencia
            </motion.button>
          </div>

          {/* Random data noise effect */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[10px] font-mono text-bone-700 opacity-50">
            <span>MEM: 0x{Math.random().toString(16).slice(2, 10).toUpperCase()}</span>
            <span>PROC: ACTIVO</span>
            <span>SEC: NIVEL-{currentPhase + 1}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
