'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { getFactionTheme, type FactionTheme } from '@/lib/faction-themes'
import { SubFactionParticles } from './SubFactionParticles'

interface FactionEffectsProps {
  factionId: string
  className?: string
  showSubFactionIcons?: boolean
}

// Imperium - Golden sparks and light rays
const ImperiumEffects = ({ theme }: { theme: FactionTheme }) => (
  <>
    {/* Divine light rays */}
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-0 left-1/2 w-1 origin-top"
          style={{
            height: '150%',
            background: `linear-gradient(180deg, ${theme.colors.primary}40 0%, transparent 100%)`,
            transform: `rotate(${i * 45}deg)`,
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
    {/* Golden particles */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: theme.colors.glow,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: `0 0 6px ${theme.colors.glow}`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
    {/* Aquila watermark */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 60'%3E%3Cpath fill='%23C9A227' d='M50 10 L30 30 L10 20 L25 35 L5 50 L30 40 L50 55 L70 40 L95 50 L75 35 L90 20 L70 30 Z'/%3E%3C/svg%3E")`,
        backgroundSize: '200px',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat',
      }}
    />
  </>
)

// Chaos - Warp flames and distortion
const ChaosEffects = ({ theme }: { theme: FactionTheme }) => (
  <>
    {/* Warp flames at bottom */}
    <div className="absolute bottom-0 left-0 right-0 h-64 overflow-hidden">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bottom-0"
          style={{
            left: `${(i / 12) * 100}%`,
            width: '100px',
            height: '200px',
            background: `linear-gradient(0deg, ${theme.colors.primary}60 0%, ${theme.colors.secondary}40 50%, transparent 100%)`,
            borderRadius: '50% 50% 0 0',
            filter: 'blur(20px)',
            transform: 'translateX(-50%)',
          }}
          animate={{
            height: ['150px', '200px', '180px', '150px'],
            opacity: [0.4, 0.7, 0.5, 0.4],
          }}
          transition={{
            duration: 2 + Math.random(),
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
    {/* Chaos runes floating */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {['I', 'X', 'V', 'Z', 'K', 'Y'].map((rune, i) => (
        <motion.div
          key={i}
          className="absolute font-display text-4xl font-bold"
          style={{
            color: theme.colors.primary,
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            textShadow: `0 0 20px ${theme.colors.glow}`,
            opacity: 0.15,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 5 + i,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {rune}
        </motion.div>
      ))}
    </div>
    {/* Distortion overlay */}
    <motion.div
      className="absolute inset-0 opacity-10"
      style={{
        background: `radial-gradient(ellipse at 50% 100%, ${theme.colors.secondary} 0%, transparent 70%)`,
      }}
      animate={{
        opacity: [0.05, 0.15, 0.05],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  </>
)

// Necrons - Gauss energy and circuitry
const NecronEffects = ({ theme }: { theme: FactionTheme }) => (
  <>
    {/* Circuitry pattern */}
    <div
      className="absolute inset-0 opacity-[0.08]"
      style={{
        backgroundImage: `
          linear-gradient(${theme.colors.primary} 1px, transparent 1px),
          linear-gradient(90deg, ${theme.colors.primary} 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }}
    />
    {/* Energy pulses along lines */}
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-px"
          style={{
            width: '200px',
            background: `linear-gradient(90deg, transparent, ${theme.colors.glow}, transparent)`,
            top: `${20 + i * 15}%`,
            left: '-200px',
            boxShadow: `0 0 10px ${theme.colors.glow}`,
          }}
          animate={{
            x: ['0vw', '120vw'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.8,
            ease: 'linear',
          }}
        />
      ))}
    </div>
    {/* Floating energy particles */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1"
          style={{
            background: theme.colors.primary,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: `0 0 8px ${theme.colors.glow}, 0 0 16px ${theme.colors.glow}`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}
    </div>
    {/* Scarab silhouette */}
    <div
      className="absolute bottom-10 right-10 w-32 h-32 opacity-[0.05]"
      style={{
        background: theme.colors.primary,
        clipPath: 'polygon(50% 0%, 90% 20%, 100% 60%, 80% 100%, 20% 100%, 0% 60%, 10% 20%)',
      }}
    />
  </>
)

// Aeldari - Ethereal runes and flowing energy
const AeldariEffects = ({ theme }: { theme: FactionTheme }) => (
  <>
    {/* Hexagonal pattern */}
    <div
      className="absolute inset-0 opacity-[0.05]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%234169E1' fill-opacity='1'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    />
    {/* Flowing spirit stones */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-4 rounded-full"
          style={{
            background: `linear-gradient(180deg, ${theme.colors.secondary}, ${theme.colors.primary})`,
            left: `${10 + i * 12}%`,
            top: '100%',
            boxShadow: `0 0 15px ${theme.colors.glow}`,
          }}
          animate={{
            y: [0, '-120vh'],
            x: [0, Math.sin(i) * 50, 0],
            opacity: [0, 0.8, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 8 + i,
            repeat: Infinity,
            delay: i * 1.5,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
    {/* Ethereal wisps */}
    <motion.div
      className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
      style={{
        background: `radial-gradient(ellipse, ${theme.colors.primary}10 0%, transparent 70%)`,
        filter: 'blur(40px)',
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  </>
)

// Orks - Sparks, smoke and explosions
const OrksEffects = ({ theme }: { theme: FactionTheme }) => (
  <>
    {/* Sparks flying */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1"
          style={{
            background: theme.colors.secondary,
            left: `${Math.random() * 100}%`,
            bottom: '0%',
            boxShadow: `0 0 4px ${theme.colors.secondary}`,
          }}
          animate={{
            y: [0, -Math.random() * 300 - 100],
            x: [0, (Math.random() - 0.5) * 200],
            opacity: [1, 0],
            scale: [1, 0],
          }}
          transition={{
            duration: 1 + Math.random(),
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
    {/* Smoke puffs */}
    {[...Array(3)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: '200px',
          height: '200px',
          background: `radial-gradient(ellipse, ${theme.colors.background}80 0%, transparent 70%)`,
          left: `${20 + i * 30}%`,
          bottom: '10%',
          filter: 'blur(30px)',
        }}
        animate={{
          y: [0, -50, 0],
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4 + i,
          repeat: Infinity,
          delay: i * 0.5,
        }}
      />
    ))}
    {/* WAAAGH! text watermark */}
    <div
      className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none"
    >
      <span
        className="font-display text-[20vw] font-black tracking-wider"
        style={{ color: theme.colors.primary }}
      >
        WAAAGH!
      </span>
    </div>
  </>
)

// T'au - Holographic displays and clean tech
const TauEffects = ({ theme }: { theme: FactionTheme }) => (
  <>
    {/* Grid pattern */}
    <div
      className="absolute inset-0 opacity-[0.06]"
      style={{
        backgroundImage: `
          linear-gradient(${theme.colors.primary}40 1px, transparent 1px),
          linear-gradient(90deg, ${theme.colors.primary}40 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }}
    />
    {/* Holographic HUD elements */}
    <div className="absolute top-10 left-10 opacity-20">
      <motion.div
        className="w-32 h-32 border rounded-lg"
        style={{ borderColor: theme.colors.primary }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        <div
          className="absolute top-2 left-2 w-4 h-4 border-t border-l"
          style={{ borderColor: theme.colors.primary }}
        />
        <div
          className="absolute top-2 right-2 w-4 h-4 border-t border-r"
          style={{ borderColor: theme.colors.primary }}
        />
        <div
          className="absolute bottom-2 left-2 w-4 h-4 border-b border-l"
          style={{ borderColor: theme.colors.primary }}
        />
        <div
          className="absolute bottom-2 right-2 w-4 h-4 border-b border-r"
          style={{ borderColor: theme.colors.primary }}
        />
      </motion.div>
    </div>
    <div className="absolute bottom-10 right-10 opacity-20">
      <motion.div
        className="flex flex-col gap-2"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      >
        {[80, 60, 90, 45].map((width, i) => (
          <div
            key={i}
            className="h-2 rounded"
            style={{
              width: `${width}px`,
              background: theme.colors.primary,
            }}
          />
        ))}
      </motion.div>
    </div>
    {/* Scanning line */}
    <motion.div
      className="absolute left-0 right-0 h-px"
      style={{
        background: `linear-gradient(90deg, transparent, ${theme.colors.glow}, transparent)`,
        boxShadow: `0 0 20px ${theme.colors.glow}`,
      }}
      animate={{
        top: ['0%', '100%'],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  </>
)

// Tyranids - Organic tendrils and spores
const TyranidsEffects = ({ theme }: { theme: FactionTheme }) => (
  <>
    {/* Organic membrane pattern */}
    <div
      className="absolute inset-0 opacity-[0.08]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B008B' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    />
    {/* Floating spores */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${4 + Math.random() * 8}px`,
            height: `${4 + Math.random() * 8}px`,
            background: `radial-gradient(ellipse, ${theme.colors.secondary} 0%, ${theme.colors.primary} 100%)`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: `0 0 10px ${theme.colors.glow}`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.sin(i) * 20, 0],
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
    {/* Tendril-like elements at edges */}
    <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bottom-0"
          style={{
            left: `${(i / 8) * 100}%`,
            width: '4px',
            height: '100px',
            background: `linear-gradient(0deg, ${theme.colors.primary}60 0%, transparent 100%)`,
            borderRadius: '50%',
            transformOrigin: 'bottom center',
          }}
          animate={{
            rotate: [-10, 10, -10],
            height: ['80px', '120px', '80px'],
          }}
          transition={{
            duration: 3 + i * 0.3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
    {/* Bio-luminescent glow */}
    <motion.div
      className="absolute inset-0"
      style={{
        background: `radial-gradient(ellipse at 50% 80%, ${theme.colors.primary}15 0%, transparent 50%)`,
      }}
      animate={{
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  </>
)

const effectComponents: Record<string, React.FC<{ theme: FactionTheme }>> = {
  imperium: ImperiumEffects,
  chaos: ChaosEffects,
  necrons: NecronEffects,
  aeldari: AeldariEffects,
  orks: OrksEffects,
  tau: TauEffects,
  tyranids: TyranidsEffects,
}

export function FactionEffects({
  factionId,
  className = '',
  showSubFactionIcons = true
}: FactionEffectsProps) {
  const theme = useMemo(() => getFactionTheme(factionId), [factionId])

  if (!theme) return null

  const EffectComponent = effectComponents[factionId]

  if (!EffectComponent) return null

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{
        background: theme.cssVars['--faction-bg'],
      }}
    >
      <EffectComponent theme={theme} />

      {/* Sub-faction icons floating as particles */}
      {showSubFactionIcons && (
        <SubFactionParticles
          factionId={factionId}
          theme={theme}
          count={10}
        />
      )}
    </div>
  )
}

export default FactionEffects
