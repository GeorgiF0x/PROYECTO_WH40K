'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

// ══════════════════════════════════════════════════════════════════════════════
// SCANLINES OVERLAY
// Subtle CRT/holographic scanline effect
// ══════════════════════════════════════════════════════════════════════════════

export function ScanLines() {
  return (
    <>
      {/* Static scanlines */}
      <div
        className="scanlines-overlay"
        aria-hidden="true"
      />
      {/* Moving scan sweep */}
      <div
        className="scan-sweep"
        aria-hidden="true"
      />
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// RADAR PULSE
// Concentric expanding rings effect
// ══════════════════════════════════════════════════════════════════════════════

interface RadarPulseProps {
  size?: number
  color?: string
  duration?: number
  className?: string
}

export function RadarPulse({
  size = 100,
  color = 'rgba(13, 155, 138, 0.5)',
  duration = 3,
  className = '',
}: RadarPulseProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Multiple concentric rings */}
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: color }}
          initial={{ scale: 0.3, opacity: 0.8 }}
          animate={{
            scale: 1.5,
            opacity: 0,
          }}
          transition={{
            duration,
            delay: index * (duration / 3),
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
      {/* Center dot */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ backgroundColor: color }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// HOLO GLOW
// Wrapper component that adds holographic glow effect on hover
// ══════════════════════════════════════════════════════════════════════════════

interface HoloGlowProps {
  children: ReactNode
  color?: string
  intensity?: 'low' | 'medium' | 'high'
  className?: string
}

export function HoloGlow({
  children,
  color = '#C9A227',
  intensity = 'medium',
  className = '',
}: HoloGlowProps) {
  const glowIntensity = {
    low: { blur: 10, spread: 5, opacity: 0.2 },
    medium: { blur: 20, spread: 10, opacity: 0.3 },
    high: { blur: 30, spread: 15, opacity: 0.4 },
  }

  const { blur, spread, opacity } = glowIntensity[intensity]

  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{
        boxShadow: `0 0 ${blur}px ${spread}px ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// DATA STREAM
// Matrix-style falling numbers/characters effect
// ══════════════════════════════════════════════════════════════════════════════

interface DataStreamProps {
  width?: number
  height?: number
  speed?: number
  density?: number
  className?: string
}

export function DataStream({
  width = 200,
  height = 300,
  speed = 1,
  density = 0.3,
  className = '',
}: DataStreamProps) {
  const columns = Math.floor(width / 15)
  const characters = '01001101011001010100001101001000010000011001110100110101001110010101010101001101'

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {Array.from({ length: columns }).map((_, colIndex) => {
        if (Math.random() > density) return null

        const delay = Math.random() * 5
        const duration = 3 + Math.random() * 4

        return (
          <motion.div
            key={colIndex}
            className="absolute text-[10px] font-mono leading-3"
            style={{
              left: colIndex * 15,
              color: 'rgba(13, 155, 138, 0.7)',
              textShadow: '0 0 5px rgba(13, 155, 138, 0.5)',
              writingMode: 'vertical-rl',
            }}
            initial={{ y: -100, opacity: 0 }}
            animate={{
              y: height + 100,
              opacity: [0, 0.8, 0.8, 0],
            }}
            transition={{
              duration: duration / speed,
              delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {characters.slice(0, 15 + Math.floor(Math.random() * 10))}
          </motion.div>
        )
      })}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ORBITAL RING
// Rotating dashed ring around content
// ══════════════════════════════════════════════════════════════════════════════

interface OrbitalRingProps {
  children: ReactNode
  size?: number
  color?: string
  duration?: number
  className?: string
}

export function OrbitalRing({
  children,
  size = 100,
  color = 'rgba(201, 162, 39, 0.3)',
  duration = 20,
  className = '',
}: OrbitalRingProps) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Rotating ring */}
      <motion.div
        className="absolute rounded-full border border-dashed"
        style={{
          width: size,
          height: size,
          borderColor: color,
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {/* Counter-rotating inner ring */}
      <motion.div
        className="absolute rounded-full border border-dotted"
        style={{
          width: size * 0.8,
          height: size * 0.8,
          borderColor: color,
          opacity: 0.5,
        }}
        animate={{ rotate: -360 }}
        transition={{
          duration: duration * 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// TACTICAL FRAME
// Corner brackets that animate on hover
// ══════════════════════════════════════════════════════════════════════════════

interface TacticalFrameProps {
  children: ReactNode
  color?: string
  className?: string
}

export function TacticalFrame({
  children,
  color = '#C9A227',
  className = '',
}: TacticalFrameProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      initial="idle"
      whileHover="active"
    >
      {/* Corner brackets */}
      <motion.span
        className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2"
        style={{ borderColor: `${color}50` }}
        variants={{
          idle: { width: 16, height: 16, borderColor: `${color}50` },
          active: { width: 20, height: 20, borderColor: color },
        }}
        transition={{ duration: 0.2 }}
      />
      <motion.span
        className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2"
        style={{ borderColor: `${color}50` }}
        variants={{
          idle: { width: 16, height: 16, borderColor: `${color}50` },
          active: { width: 20, height: 20, borderColor: color },
        }}
        transition={{ duration: 0.2 }}
      />
      <motion.span
        className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2"
        style={{ borderColor: `${color}50` }}
        variants={{
          idle: { width: 16, height: 16, borderColor: `${color}50` },
          active: { width: 20, height: 20, borderColor: color },
        }}
        transition={{ duration: 0.2 }}
      />
      <motion.span
        className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2"
        style={{ borderColor: `${color}50` }}
        variants={{
          idle: { width: 16, height: 16, borderColor: `${color}50` },
          active: { width: 20, height: 20, borderColor: color },
        }}
        transition={{ duration: 0.2 }}
      />
      {/* Content */}
      <div className="relative">{children}</div>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ENERGY SEPARATOR
// Animated divider line with energy pulse
// ══════════════════════════════════════════════════════════════════════════════

interface EnergySeparatorProps {
  className?: string
  showPulse?: boolean
}

export function EnergySeparator({ className = '', showPulse = true }: EnergySeparatorProps) {
  return (
    <div className={`energy-separator ${className}`}>
      {showPulse && (
        <motion.span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-imperial-gold rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5],
            boxShadow: [
              '0 0 5px rgba(201, 162, 39, 0.5)',
              '0 0 15px rgba(201, 162, 39, 0.8)',
              '0 0 5px rgba(201, 162, 39, 0.5)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// COGITATOR LOADING
// Imperial-themed loading spinner
// ══════════════════════════════════════════════════════════════════════════════

interface CogitatorLoadingProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
}

export function CogitatorLoading({
  text = 'INICIALIZANDO COGITADOR...',
  size = 'md',
}: CogitatorLoadingProps) {
  const sizes = {
    sm: { spinner: 32, text: 'text-xs' },
    md: { spinner: 48, text: 'text-sm' },
    lg: { spinner: 64, text: 'text-base' },
  }

  const { spinner, text: textSize } = sizes[size]

  return (
    <div className="cogitator-loading">
      {/* Outer ring */}
      <div className="relative" style={{ width: spinner, height: spinner }}>
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-imperial-gold/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        {/* Inner spinning ring */}
        <motion.div
          className="absolute inset-1 rounded-full border-2 border-transparent border-t-imperial-gold"
          animate={{ rotate: -360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        {/* Center dot */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-imperial-gold rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
      {/* Text */}
      <motion.p
        className={`cogitator-text ${textSize}`}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {text}
      </motion.p>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// STRATEGIUM HEADER
// Section header with imperial styling
// ══════════════════════════════════════════════════════════════════════════════

interface StrategiumHeaderProps {
  title: string
  subtitle?: string
  className?: string
}

export function StrategiumHeader({ title, subtitle, className = '' }: StrategiumHeaderProps) {
  return (
    <motion.div
      className={`strategium-header ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        {subtitle && (
          <p className="subtitle mb-1">{subtitle}</p>
        )}
        <h2>{title}</h2>
      </div>
    </motion.div>
  )
}
