'use client'

import { motion } from 'framer-motion'
import { Feather } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/* ─────────────────────────────────────────────────────
   WikiPageBackground
   Full-page atmospheric background: grid + parchment + vignette
   ───────────────────────────────────────────────────── */
export function WikiPageBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201,162,39,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,162,39,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Parchment noise texture */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Top radial gold glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.06)_0%,transparent_50%)]" />

      {/* Bottom darkness */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(3,3,8,0.4)_0%,transparent_60%)]" />
    </div>
  )
}

/* ─────────────────────────────────────────────────────
   FloatingParticles
   Animated ink/ember particles drifting in the background
   ───────────────────────────────────────────────────── */
const INK_PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${(i * 8.5 + 3) % 90 + 5}%`,
  top: `${(i * 11 + 7) % 78 + 11}%`,
  drift: (i % 2 === 0 ? -1 : 1) * (8 + (i % 4) * 5),
  dur: 9 + (i % 3) * 2.5,
  delay: i * 0.6,
  size: i % 4 === 0 ? 'w-1.5 h-1.5' : 'w-1 h-1',
}))

export function FloatingParticles({ color = 'bg-imperial-gold/30' }: { color?: string }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {INK_PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute ${p.size} rounded-full ${color}`}
          style={{ left: p.left, top: p.top }}
          animate={{
            y: [0, p.drift, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────
   GothicCorners
   SVG corner ornaments with double curved paths
   ───────────────────────────────────────────────────── */
const CORNER_TRANSFORMS: Record<string, string> = {
  tl: '',
  tr: 'scaleX(-1)',
  bl: 'scaleY(-1)',
  br: 'scale(-1)',
}

const CORNER_POSITIONS: Record<string, string> = {
  tl: 'top-2 left-2',
  tr: 'top-2 right-2',
  bl: 'bottom-2 left-2',
  br: 'bottom-2 right-2',
}

export function GothicCorner({
  position,
  className = '',
  size = 40,
}: {
  position: 'tl' | 'tr' | 'bl' | 'br'
  className?: string
  size?: number
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      className={`absolute ${CORNER_POSITIONS[position]} pointer-events-none ${className}`}
      style={{ transform: CORNER_TRANSFORMS[position] }}
    >
      <path
        d="M0 60 L0 20 Q0 0 20 0 L60 0"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M0 50 L0 15 Q0 5 15 5 L50 5"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.3"
      />
      <circle cx="8" cy="8" r="3" fill="currentColor" opacity="0.5" />
      <path d="M15 0 L15 15 L0 15" stroke="currentColor" strokeWidth="1" opacity="0.2" />
    </svg>
  )
}

export function GothicCorners({ className = 'text-imperial-gold/40', size = 40 }: { className?: string; size?: number }) {
  return (
    <>
      <GothicCorner position="tl" className={className} size={size} />
      <GothicCorner position="tr" className={className} size={size} />
      <GothicCorner position="bl" className={className} size={size} />
      <GothicCorner position="br" className={className} size={size} />
    </>
  )
}

/* ─────────────────────────────────────────────────────
   ImperialDivider
   Horizontal divider with centered icon and gradient lines
   ───────────────────────────────────────────────────── */
export function ImperialDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-imperial-gold/30 to-transparent" />
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rotate-45 bg-imperial-gold/50" />
        <Feather className="w-4 h-4 text-imperial-gold/50" />
        <div className="w-1.5 h-1.5 rotate-45 bg-imperial-gold/50" />
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-imperial-gold/30 to-transparent" />
    </div>
  )
}

/* ─────────────────────────────────────────────────────
   SectionLabel
   Tiny mono label used above section titles
   ───────────────────────────────────────────────────── */
export function SectionLabel({
  icon: Icon,
  children,
  className = '',
}: {
  icon?: LucideIcon
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {Icon && <Icon className="h-3.5 w-3.5 text-imperial-gold/50" />}
      <span className="text-[10px] font-mono text-imperial-gold/60 tracking-[0.3em] uppercase">
        {children}
      </span>
    </div>
  )
}
