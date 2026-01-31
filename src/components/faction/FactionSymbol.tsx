'use client'

import { motion } from 'framer-motion'
import { getFactionTheme } from '@/lib/faction-themes'

interface FactionSymbolProps {
  factionId: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
  className?: string
}

const sizeMap = {
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 64, height: 64 },
  xl: { width: 96, height: 96 },
}

// Imperium - Imperial Aquila
const AquilaSymbol = ({ color, size, animated }: { color: string; size: number; animated: boolean }) => (
  <motion.svg
    viewBox="0 0 100 60"
    width={size}
    height={size * 0.6}
    animate={animated ? { scale: [1, 1.05, 1] } : undefined}
    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
  >
    <motion.path
      d="M50 5 L35 20 L20 15 L28 28 L10 40 L30 35 L50 50 L70 35 L90 40 L72 28 L80 15 L65 20 Z"
      fill={color}
      animate={animated ? { opacity: [0.8, 1, 0.8] } : undefined}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <circle cx="50" cy="25" r="5" fill={color} />
  </motion.svg>
)

// Chaos - Eight-pointed Star
const ChaosStarSymbol = ({ color, size, animated }: { color: string; size: number; animated: boolean }) => (
  <motion.svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    animate={animated ? { rotate: [0, 360] } : undefined}
    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
  >
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
      <motion.path
        key={i}
        d="M50 50 L50 5 L55 20 L50 50 L45 20 Z"
        fill={color}
        transform={`rotate(${angle} 50 50)`}
        animate={animated ? { opacity: [0.6, 1, 0.6] } : undefined}
        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
      />
    ))}
    <circle cx="50" cy="50" r="8" fill={color} />
  </motion.svg>
)

// Necrons - Scarab/Dynasty symbol
const ScarabSymbol = ({ color, size, animated }: { color: string; size: number; animated: boolean }) => (
  <motion.svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    animate={animated ? { scale: [1, 1.05, 1] } : undefined}
    transition={{ duration: 2, repeat: Infinity }}
  >
    {/* Scarab body */}
    <motion.ellipse
      cx="50"
      cy="55"
      rx="25"
      ry="30"
      fill="none"
      stroke={color}
      strokeWidth="3"
      animate={animated ? { strokeOpacity: [0.5, 1, 0.5] } : undefined}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
    {/* Head */}
    <circle cx="50" cy="25" r="12" fill={color} />
    {/* Wings */}
    <motion.path
      d="M25 50 Q10 40 5 55 Q15 65 25 60"
      fill={color}
      animate={animated ? { opacity: [0.7, 1, 0.7] } : undefined}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.path
      d="M75 50 Q90 40 95 55 Q85 65 75 60"
      fill={color}
      animate={animated ? { opacity: [0.7, 1, 0.7] } : undefined}
      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
    />
    {/* Eye */}
    <motion.circle
      cx="50"
      cy="25"
      r="4"
      fill="black"
      animate={animated ? { scale: [1, 1.2, 1] } : undefined}
      transition={{ duration: 1, repeat: Infinity }}
    />
  </motion.svg>
)

// Aeldari - Spirit Stone Rune
const RuneSymbol = ({ color, size, animated }: { color: string; size: number; animated: boolean }) => (
  <motion.svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    animate={animated ? { opacity: [0.8, 1, 0.8] } : undefined}
    transition={{ duration: 3, repeat: Infinity }}
  >
    {/* Outer diamond */}
    <motion.path
      d="M50 5 L95 50 L50 95 L5 50 Z"
      fill="none"
      stroke={color}
      strokeWidth="2"
      animate={animated ? { strokeDashoffset: [0, 100] } : undefined}
      strokeDasharray="5 5"
      transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
    />
    {/* Inner rune */}
    <motion.path
      d="M50 20 L65 50 L50 80 L35 50 Z M50 35 L50 65"
      fill="none"
      stroke={color}
      strokeWidth="3"
      animate={animated ? { opacity: [0.7, 1, 0.7] } : undefined}
      transition={{ duration: 2, repeat: Infinity }}
    />
    {/* Spirit stone */}
    <motion.ellipse
      cx="50"
      cy="50"
      rx="8"
      ry="12"
      fill={color}
      animate={animated ? { scale: [1, 1.1, 1] } : undefined}
      transition={{ duration: 2, repeat: Infinity }}
    />
  </motion.svg>
)

// Orks - Glyph (skull-like)
const GlyphSymbol = ({ color, size, animated }: { color: string; size: number; animated: boolean }) => (
  <motion.svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    animate={animated ? { rotate: [-5, 5, -5] } : undefined}
    transition={{ duration: 0.5, repeat: Infinity }}
  >
    {/* Skull shape */}
    <motion.path
      d="M50 10 Q80 20 85 50 Q80 85 50 95 Q20 85 15 50 Q20 20 50 10"
      fill={color}
      animate={animated ? { scale: [1, 1.05, 1] } : undefined}
      transition={{ duration: 0.8, repeat: Infinity }}
    />
    {/* Eyes */}
    <circle cx="35" cy="45" r="10" fill="black" />
    <circle cx="65" cy="45" r="10" fill="black" />
    {/* Teeth */}
    <rect x="30" y="70" width="8" height="15" fill="black" />
    <rect x="46" y="70" width="8" height="15" fill="black" />
    <rect x="62" y="70" width="8" height="15" fill="black" />
    {/* Tusk left */}
    <motion.path
      d="M20 55 Q10 70 25 75"
      fill={color}
      stroke={color}
      strokeWidth="5"
    />
    {/* Tusk right */}
    <motion.path
      d="M80 55 Q90 70 75 75"
      fill={color}
      stroke={color}
      strokeWidth="5"
    />
  </motion.svg>
)

// T'au - Tau symbol
const TauSymbolIcon = ({ color, size, animated }: { color: string; size: number; animated: boolean }) => (
  <motion.svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    animate={animated ? { opacity: [0.9, 1, 0.9] } : undefined}
    transition={{ duration: 2, repeat: Infinity }}
  >
    {/* Main T shape */}
    <motion.path
      d="M20 20 L80 20 L80 30 L55 30 L55 85 L45 85 L45 30 L20 30 Z"
      fill={color}
      animate={animated ? { fillOpacity: [0.8, 1, 0.8] } : undefined}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
    {/* Circle accent */}
    <motion.circle
      cx="50"
      cy="55"
      r="5"
      fill="none"
      stroke={color}
      strokeWidth="2"
      animate={animated ? { r: [5, 7, 5] } : undefined}
      transition={{ duration: 2, repeat: Infinity }}
    />
    {/* Side bars */}
    <rect x="15" y="35" width="3" height="30" fill={color} opacity="0.6" />
    <rect x="82" y="35" width="3" height="30" fill={color} opacity="0.6" />
  </motion.svg>
)

// Tyranids - Bio-sigil
const BioSigilSymbol = ({ color, size, animated }: { color: string; size: number; animated: boolean }) => (
  <motion.svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    animate={animated ? { scale: [1, 1.05, 1] } : undefined}
    transition={{ duration: 3, repeat: Infinity }}
  >
    {/* Central maw */}
    <motion.ellipse
      cx="50"
      cy="50"
      rx="20"
      ry="25"
      fill={color}
      animate={animated ? { ry: [25, 28, 25] } : undefined}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
    {/* Tendrils */}
    {[0, 60, 120, 180, 240, 300].map((angle, i) => (
      <motion.path
        key={i}
        d={`M50 50 Q${50 + Math.cos((angle * Math.PI) / 180) * 30} ${50 + Math.sin((angle * Math.PI) / 180) * 20} ${50 + Math.cos((angle * Math.PI) / 180) * 45} ${50 + Math.sin((angle * Math.PI) / 180) * 40}`}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        animate={animated ? {
          d: [
            `M50 50 Q${50 + Math.cos((angle * Math.PI) / 180) * 30} ${50 + Math.sin((angle * Math.PI) / 180) * 20} ${50 + Math.cos((angle * Math.PI) / 180) * 45} ${50 + Math.sin((angle * Math.PI) / 180) * 40}`,
            `M50 50 Q${50 + Math.cos(((angle + 10) * Math.PI) / 180) * 35} ${50 + Math.sin(((angle + 10) * Math.PI) / 180) * 25} ${50 + Math.cos(((angle + 5) * Math.PI) / 180) * 48} ${50 + Math.sin(((angle + 5) * Math.PI) / 180) * 43}`,
            `M50 50 Q${50 + Math.cos((angle * Math.PI) / 180) * 30} ${50 + Math.sin((angle * Math.PI) / 180) * 20} ${50 + Math.cos((angle * Math.PI) / 180) * 45} ${50 + Math.sin((angle * Math.PI) / 180) * 40}`,
          ]
        } : undefined}
        transition={{ duration: 2 + i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
      />
    ))}
    {/* Eye */}
    <motion.circle
      cx="50"
      cy="45"
      r="6"
      fill="black"
      animate={animated ? { scale: [1, 0.8, 1] } : undefined}
      transition={{ duration: 2, repeat: Infinity }}
    />
  </motion.svg>
)

const symbolComponents: Record<string, React.FC<{ color: string; size: number; animated: boolean }>> = {
  imperium: AquilaSymbol,
  chaos: ChaosStarSymbol,
  necrons: ScarabSymbol,
  aeldari: RuneSymbol,
  orks: GlyphSymbol,
  tau: TauSymbolIcon,
  tyranids: BioSigilSymbol,
}

export function FactionSymbol({ factionId, size = 'md', animated = true, className = '' }: FactionSymbolProps) {
  const theme = getFactionTheme(factionId)
  if (!theme) return null

  const SymbolComponent = symbolComponents[factionId]
  if (!SymbolComponent) return null

  const dimensions = sizeMap[size]

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        filter: animated ? `drop-shadow(0 0 10px ${theme.colors.glow}40)` : undefined,
      }}
    >
      <SymbolComponent
        color={theme.colors.primary}
        size={dimensions.width}
        animated={animated}
      />
    </div>
  )
}

export default FactionSymbol
