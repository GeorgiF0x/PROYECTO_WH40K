'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DataslateContainerProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'processing'
}

export function DataslateContainer({
  children,
  title,
  subtitle,
  className,
  variant = 'default',
}: DataslateContainerProps) {
  const variantStyles = {
    default: {
      border: 'border-imperial-gold/30',
      glow: 'shadow-imperial-gold/10',
      led: 'bg-imperial-gold',
      headerBg: 'bg-imperial-gold/5',
    },
    success: {
      border: 'border-emerald-500/30',
      glow: 'shadow-emerald-500/10',
      led: 'bg-emerald-400',
      headerBg: 'bg-emerald-500/5',
    },
    warning: {
      border: 'border-amber-500/30',
      glow: 'shadow-amber-500/10',
      led: 'bg-amber-400',
      headerBg: 'bg-amber-500/5',
    },
    processing: {
      border: 'border-purple-500/30',
      glow: 'shadow-purple-500/10',
      led: 'bg-purple-400',
      headerBg: 'bg-purple-500/5',
    },
  }

  const styles = variantStyles[variant]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'bg-void-900/80 relative overflow-hidden rounded-xl border backdrop-blur-xl',
        styles.border,
        `shadow-lg ${styles.glow}`,
        className
      )}
    >
      {/* Corner brackets */}
      <div className="absolute left-0 top-0 h-6 w-6 rounded-tl-xl border-l-2 border-t-2 border-imperial-gold/50" />
      <div className="absolute right-0 top-0 h-6 w-6 rounded-tr-xl border-r-2 border-t-2 border-imperial-gold/50" />
      <div className="absolute bottom-0 left-0 h-6 w-6 rounded-bl-xl border-b-2 border-l-2 border-imperial-gold/50" />
      <div className="absolute bottom-0 right-0 h-6 w-6 rounded-br-xl border-b-2 border-r-2 border-imperial-gold/50" />

      {/* Status LEDs */}
      <div className="absolute right-3 top-3 flex gap-1.5">
        <motion.div
          className={cn('h-2 w-2 rounded-full', styles.led)}
          animate={{
            opacity: [0.5, 1, 0.5],
            boxShadow: ['0 0 4px currentColor', '0 0 8px currentColor', '0 0 4px currentColor'],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className={cn('h-2 w-2 rounded-full', styles.led)}
          animate={{
            opacity: [1, 0.5, 1],
          }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        />
      </div>

      {/* Aquila watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.02]">
        <svg viewBox="0 0 200 100" className="h-[250px] w-[500px]" fill="currentColor">
          <path d="M100 10 L95 25 L85 20 L90 35 L75 30 L85 45 L65 40 L80 55 L55 50 L75 65 L45 60 L70 75 L35 70 L65 85 L25 80 L60 95 L100 90 L140 95 L175 80 L135 85 L165 70 L130 75 L155 60 L125 65 L145 50 L120 55 L135 40 L115 45 L125 30 L110 35 L115 20 L105 25 Z" />
          <circle cx="100" cy="55" r="12" />
        </svg>
      </div>

      {/* Header */}
      {(title || subtitle) && (
        <div className={cn('border-void-700 relative border-b px-6 py-4', styles.headerBg)}>
          {/* Header decoration line */}
          <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-imperial-gold/30 to-transparent" />

          <div className="flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-imperial-gold to-imperial-gold/30" />
            <div>
              {title && (
                <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-imperial-gold">
                  {title}
                </h2>
              )}
              {subtitle && <p className="text-bone-500 mt-0.5 font-mono text-xs">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative p-6">{children}</div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-imperial-gold/20 to-transparent" />
    </motion.div>
  )
}

// Processing overlay component for the dataslate
export function DataslateProcessing({ message = 'PROCESANDO PETICIÓN...' }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-void-900/90 absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-sm"
    >
      {/* Spinning cog */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="mb-4"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-16 w-16 text-purple-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      </motion.div>

      <motion.p
        className="font-mono text-lg tracking-wider text-purple-400"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {message}
      </motion.p>

      <p className="text-bone-600 mt-2 font-mono text-xs">Espíritu Máquina procesando datos...</p>
    </motion.div>
  )
}

// Success state for the dataslate
export function DataslateSuccess({
  title = 'PETICIÓN REGISTRADA',
  message = 'Aguarde revisión inquisitorial',
}: {
  title?: string
  message?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-12 text-center"
    >
      {/* Success icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="relative mx-auto mb-6 h-24 w-24"
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-emerald-500/20"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="relative flex h-full w-full items-center justify-center rounded-full border border-emerald-500/50 bg-gradient-to-br from-emerald-500/30 to-emerald-600/20">
          <motion.svg
            viewBox="0 0 24 24"
            className="h-12 w-12 text-emerald-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.path
              d="M20 6L9 17l-5-5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            />
          </motion.svg>
        </div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="font-heading mb-2 text-xl font-bold tracking-wide text-emerald-400"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-bone-400 mb-6 font-mono text-sm"
      >
        {message}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-void-800/50 border-void-700 text-bone-500 inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-xs"
      >
        <motion.span
          className="h-2 w-2 rounded-full bg-amber-400"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        Revisión en progreso
      </motion.div>
    </motion.div>
  )
}
