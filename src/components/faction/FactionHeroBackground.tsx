'use client'

import { motion } from 'framer-motion'
import { getFactionTheme, type FactionTheme } from '@/lib/faction-themes'

interface FactionHeroBackgroundProps {
  factionId: string
}

// Default theme fallback
const defaultTheme: FactionTheme = {
  id: 'default',
  name: 'Default',
  shortName: 'Default',
  colors: {
    primary: '#C9A227',
    secondary: '#8B0000',
    tertiary: '#D4AF37',
    background: '#0D0A05',
    glow: '#FFD700',
    text: '#F5E6C8',
  },
  effects: {
    particleType: 'sparks',
    backgroundPattern: 'none',
    glowIntensity: 0.5,
    animationStyle: 'elegant',
  },
  gradients: {
    hero: 'linear-gradient(135deg, #C9A227 0%, #8B0000 50%, #D4AF37 100%)',
    card: 'linear-gradient(180deg, rgba(201,162,39,0.1) 0%, rgba(139,0,0,0.05) 100%)',
    text: 'linear-gradient(90deg, #C9A227 0%, #FFD700 50%, #C9A227 100%)',
    border: 'linear-gradient(90deg, #C9A227, #8B0000, #C9A227)',
  },
  cssVars: {
    '--faction-primary': '#C9A227',
    '--faction-secondary': '#8B0000',
    '--faction-tertiary': '#D4AF37',
    '--faction-glow': '#FFD700',
    '--faction-bg': '#0D0A05',
  },
  symbol: 'aquila',
}

export function FactionHeroBackground({ factionId }: FactionHeroBackgroundProps) {
  const theme = getFactionTheme(factionId) ?? defaultTheme

  switch (factionId) {
    case 'imperium':
      return <ImperiumBackground theme={theme} />
    case 'chaos':
      return <ChaosBackground theme={theme} />
    case 'necrons':
      return <NecronsBackground theme={theme} />
    case 'aeldari':
      return <AeldariBackground theme={theme} />
    case 'orks':
      return <OrksBackground theme={theme} />
    case 'tau':
      return <TauBackground theme={theme} />
    case 'tyranids':
      return <TyranidsBackground theme={theme} />
    default:
      return <DefaultBackground theme={theme} />
  }
}

// ═══════════════════════════════════════════════════════════════════
// IMPERIUM - Gothic Cathedral Silhouette with Divine Light
// ═══════════════════════════════════════════════════════════════════
function ImperiumBackground({ theme }: { theme: FactionTheme }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050408]">
      {/* Divine light rays from center top */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-0 left-1/2 origin-top"
            style={{
              width: '4px',
              height: '120%',
              background: `linear-gradient(180deg, ${theme.colors.glow}60 0%, ${theme.colors.primary}30 40%, transparent 80%)`,
              transform: `translateX(-50%) rotate(${-30 + i * 5}deg)`,
              filter: 'blur(8px)',
            }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + i * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* Central glow */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px]"
        style={{
          background: `radial-gradient(ellipse at top, ${theme.colors.glow}30 0%, ${theme.colors.primary}15 30%, transparent 70%)`,
        }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Gothic Cathedral Silhouette SVG */}
      <svg
        className="absolute bottom-0 left-0 w-full h-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          {/* Gradient for cathedral */}
          <linearGradient id="cathedralGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#000000" />
            <stop offset="40%" stopColor="#0a0a10" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          {/* Glow gradient */}
          <linearGradient id="glowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.colors.glow} stopOpacity="0.4" />
            <stop offset="100%" stopColor={theme.colors.glow} stopOpacity="0" />
          </linearGradient>
          {/* Window glow */}
          <radialGradient id="windowGlow">
            <stop offset="0%" stopColor={theme.colors.glow} stopOpacity="0.8" />
            <stop offset="100%" stopColor={theme.colors.primary} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Left Cathedral Tower */}
        <g className="opacity-90">
          {/* Main tower body */}
          <path
            d="M 0 1080 L 0 400 L 50 400 L 50 350 L 80 350 L 80 250 L 120 100 L 160 250 L 160 350 L 190 350 L 190 400 L 240 400 L 240 1080 Z"
            fill="url(#cathedralGrad)"
          />
          {/* Spire */}
          <path
            d="M 100 250 L 120 50 L 140 250"
            fill="none"
            stroke={theme.colors.primary}
            strokeWidth="2"
            opacity="0.3"
          />
          {/* Gothic windows */}
          <ellipse cx="120" cy="500" rx="25" ry="50" fill="url(#windowGlow)" opacity="0.5" />
          <ellipse cx="120" cy="650" rx="20" ry="40" fill="url(#windowGlow)" opacity="0.4" />
        </g>

        {/* Central Grand Cathedral */}
        <g className="opacity-95">
          {/* Main structure */}
          <path
            d="M 600 1080
               L 600 500
               L 650 500 L 650 400 L 700 400 L 700 350
               L 800 350 L 800 300 L 850 200 L 900 150 L 960 80 L 1020 150 L 1070 200 L 1120 300 L 1120 350
               L 1220 350 L 1220 400 L 1270 400 L 1270 500 L 1320 500
               L 1320 1080 Z"
            fill="url(#cathedralGrad)"
          />
          {/* Central spire */}
          <path
            d="M 930 300 L 960 30 L 990 300"
            fill="#0a0a12"
            stroke={theme.colors.primary}
            strokeWidth="1"
            opacity="0.4"
          />
          {/* Side spires */}
          <path d="M 750 350 L 780 180 L 810 350" fill="#0a0a12" />
          <path d="M 1110 350 L 1140 180 L 1170 350" fill="#0a0a12" />

          {/* Rose window */}
          <circle cx="960" cy="450" r="80" fill="none" stroke={theme.colors.glow} strokeWidth="2" opacity="0.3" />
          <circle cx="960" cy="450" r="60" fill="url(#windowGlow)" opacity="0.4" />

          {/* Gothic arched windows */}
          <path d="M 750 550 Q 780 500 810 550 L 810 700 L 750 700 Z" fill="url(#windowGlow)" opacity="0.3" />
          <path d="M 870 550 Q 900 500 930 550 L 930 700 L 870 700 Z" fill="url(#windowGlow)" opacity="0.35" />
          <path d="M 990 550 Q 1020 500 1050 550 L 1050 700 L 990 700 Z" fill="url(#windowGlow)" opacity="0.35" />
          <path d="M 1110 550 Q 1140 500 1170 550 L 1170 700 L 1110 700 Z" fill="url(#windowGlow)" opacity="0.3" />

          {/* Flying buttresses */}
          <path d="M 600 600 L 500 800 L 520 800 L 620 620" fill="#080810" opacity="0.8" />
          <path d="M 1320 600 L 1420 800 L 1400 800 L 1300 620" fill="#080810" opacity="0.8" />
        </g>

        {/* Right Cathedral Tower */}
        <g className="opacity-90">
          <path
            d="M 1680 1080 L 1680 400 L 1730 400 L 1730 350 L 1760 350 L 1760 250 L 1800 100 L 1840 250 L 1840 350 L 1870 350 L 1870 400 L 1920 400 L 1920 1080 Z"
            fill="url(#cathedralGrad)"
          />
          <path
            d="M 1780 250 L 1800 50 L 1820 250"
            fill="none"
            stroke={theme.colors.primary}
            strokeWidth="2"
            opacity="0.3"
          />
          <ellipse cx="1800" cy="500" rx="25" ry="50" fill="url(#windowGlow)" opacity="0.5" />
          <ellipse cx="1800" cy="650" rx="20" ry="40" fill="url(#windowGlow)" opacity="0.4" />
        </g>

        {/* Smaller towers in background */}
        <path d="M 350 1080 L 350 600 L 400 500 L 450 600 L 450 1080" fill="#030308" opacity="0.7" />
        <path d="M 1470 1080 L 1470 600 L 1520 500 L 1570 600 L 1570 1080" fill="#030308" opacity="0.7" />
      </svg>

      {/* Floating dust/incense particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${20 + Math.random() * 60}%`,
              bottom: `${10 + Math.random() * 40}%`,
              width: 2 + Math.random() * 4,
              height: 2 + Math.random() * 4,
              background: theme.colors.glow,
              boxShadow: `0 0 ${6 + Math.random() * 10}px ${theme.colors.glow}`,
            }}
            animate={{
              y: [0, -150 - Math.random() * 200],
              x: [0, (Math.random() - 0.5) * 100],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 8,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CHAOS - Hellish Warp Flames and Chaos Stars
// ═══════════════════════════════════════════════════════════════════
function ChaosBackground({ theme }: { theme: FactionTheme }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0a0205]">
      {/* Hellfire glow from bottom */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-2/3"
        style={{
          background: `linear-gradient(to top, ${theme.colors.primary}80, ${theme.colors.secondary}40, transparent)`,
        }}
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Warp storm swirls */}
      <svg className="absolute inset-0 w-full h-full opacity-40">
        <defs>
          <radialGradient id="warpGlow">
            <stop offset="0%" stopColor={theme.colors.primary} stopOpacity="0.6" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Chaos star in background */}
        <g transform="translate(960, 400)" opacity="0.15">
          {[...Array(8)].map((_, i) => (
            <motion.path
              key={i}
              d={`M 0 0 L ${Math.cos(i * Math.PI / 4) * 300} ${Math.sin(i * Math.PI / 4) * 300}`}
              stroke={theme.colors.primary}
              strokeWidth="20"
              fill="none"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </g>
      </svg>

      {/* Flame pillars */}
      <div className="absolute bottom-0 left-0 right-0 h-full">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0"
            style={{
              left: `${5 + i * 13}%`,
              width: '80px',
              height: '60%',
              background: `linear-gradient(to top, ${theme.colors.primary}, ${theme.colors.secondary}80, transparent)`,
              filter: 'blur(30px)',
              borderRadius: '50% 50% 0 0',
            }}
            animate={{
              height: ['50%', '70%', '50%'],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 1.5 + i * 0.2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.15,
            }}
          />
        ))}
      </div>

      {/* Daemonic mountain silhouettes */}
      <svg className="absolute bottom-0 left-0 w-full h-1/2" viewBox="0 0 1920 540" preserveAspectRatio="xMidYMax slice">
        <path
          d="M 0 540 L 0 400 L 100 350 L 200 380 L 300 280 L 400 320 L 500 200 L 600 250 L 700 150 L 800 180 L 900 100 L 1000 130 L 1100 80 L 1200 150 L 1300 120 L 1400 200 L 1500 180 L 1600 280 L 1700 230 L 1800 350 L 1920 300 L 1920 540 Z"
          fill="#050102"
        />
        {/* Jagged peaks */}
        <path
          d="M 500 200 L 520 100 L 540 180 M 900 100 L 920 20 L 940 90 M 1100 80 L 1115 10 L 1130 70"
          stroke="#0a0205"
          strokeWidth="15"
          fill="none"
        />
      </svg>

      {/* Ember particles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: '10%',
            width: 3 + Math.random() * 5,
            height: 3 + Math.random() * 5,
            background: i % 3 === 0 ? '#ff6600' : theme.colors.primary,
            boxShadow: `0 0 10px ${i % 3 === 0 ? '#ff6600' : theme.colors.primary}`,
          }}
          animate={{
            y: [0, -400 - Math.random() * 300],
            x: [0, (Math.random() - 0.5) * 200],
            opacity: [0, 1, 0],
            scale: [1, 0.5],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// NECRONS - Ancient Tomb with Pyramids and Green Glow
// ═══════════════════════════════════════════════════════════════════
function NecronsBackground({ theme }: { theme: FactionTheme }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#020805]">
      {/* Green ambient glow */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 80%, ${theme.colors.glow}25 0%, transparent 60%)`,
        }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Tomb architecture SVG */}
      <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="tombGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#030a08" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="greenGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.colors.glow} stopOpacity="0.6" />
            <stop offset="100%" stopColor={theme.colors.glow} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Central Pyramid */}
        <g>
          <path
            d="M 960 200 L 1400 900 L 520 900 Z"
            fill="#040a08"
            stroke={theme.colors.primary}
            strokeWidth="2"
            opacity="0.8"
          />
          {/* Pyramid lines */}
          <path d="M 960 200 L 960 900" stroke={theme.colors.glow} strokeWidth="1" opacity="0.3" />
          <path d="M 960 200 L 740 900" stroke={theme.colors.glow} strokeWidth="1" opacity="0.2" />
          <path d="M 960 200 L 1180 900" stroke={theme.colors.glow} strokeWidth="1" opacity="0.2" />

          {/* Glowing eye/orb at top */}
          <motion.circle
            cx="960"
            cy="350"
            r="30"
            fill={theme.colors.glow}
            opacity="0.6"
            animate={{ opacity: [0.4, 0.8, 0.4], r: [28, 32, 28] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <circle cx="960" cy="350" r="50" fill="none" stroke={theme.colors.glow} strokeWidth="2" opacity="0.3" />
        </g>

        {/* Left obelisk */}
        <g>
          <path d="M 200 1080 L 200 400 L 250 300 L 300 400 L 300 1080 Z" fill="#030908" />
          <path d="M 250 300 L 250 350" stroke={theme.colors.glow} strokeWidth="3" opacity="0.5" />
          <motion.rect
            x="220"
            y="500"
            width="60"
            height="100"
            fill={theme.colors.glow}
            opacity="0.2"
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </g>

        {/* Right obelisk */}
        <g>
          <path d="M 1620 1080 L 1620 400 L 1670 300 L 1720 400 L 1720 1080 Z" fill="#030908" />
          <path d="M 1670 300 L 1670 350" stroke={theme.colors.glow} strokeWidth="3" opacity="0.5" />
          <motion.rect
            x="1640"
            y="500"
            width="60"
            height="100"
            fill={theme.colors.glow}
            opacity="0.2"
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </g>

        {/* Background pyramids */}
        <path d="M 100 1080 L 350 600 L 600 1080" fill="#020604" opacity="0.6" />
        <path d="M 1320 1080 L 1570 600 L 1820 1080" fill="#020604" opacity="0.6" />

        {/* Ground line with glyphs */}
        <line x1="0" y1="900" x2="1920" y2="900" stroke={theme.colors.glow} strokeWidth="2" opacity="0.2" />
      </svg>

      {/* Scanning green lines */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${theme.colors.glow}, transparent)`,
            boxShadow: `0 0 20px ${theme.colors.glow}`,
          }}
          animate={{
            top: ['0%', '100%'],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            delay: i * 1.8,
            ease: 'linear',
          }}
        />
      ))}

      {/* Floating scarab-like particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${30 + Math.random() * 50}%`,
            width: 4,
            height: 6,
            background: theme.colors.glow,
            borderRadius: '50%',
            boxShadow: `0 0 10px ${theme.colors.glow}`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, (Math.random() - 0.5) * 40, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// AELDARI - Elegant Wraithbone Spires and Cosmic Webway
// ═══════════════════════════════════════════════════════════════════
function AeldariBackground({ theme }: { theme: FactionTheme }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#030510]">
      {/* Cosmic nebula background */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, ${theme.colors.secondary}30 0%, transparent 50%),
            radial-gradient(ellipse at 70% 60%, ${theme.colors.primary}25 0%, transparent 40%),
            radial-gradient(ellipse at 50% 80%, ${theme.colors.tertiary}20 0%, transparent 50%)
          `,
        }}
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* Wraithbone spires SVG */}
      <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="wraithGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#05050f" />
            <stop offset="60%" stopColor="#0a0a1a" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="spiritStone" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.colors.secondary} stopOpacity="0.8" />
            <stop offset="100%" stopColor={theme.colors.primary} stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Elegant curved spires */}
        <g opacity="0.9">
          {/* Central spire */}
          <path
            d="M 960 1080
               C 960 800, 920 600, 940 400
               C 950 300, 960 200, 960 100
               C 960 200, 970 300, 980 400
               C 1000 600, 960 800, 960 1080"
            fill="#08081a"
            stroke={theme.colors.primary}
            strokeWidth="1"
            opacity="0.5"
          />
          {/* Spirit stone */}
          <ellipse cx="960" cy="250" rx="15" ry="25" fill="url(#spiritStone)" />
        </g>

        {/* Left curved structures */}
        <path
          d="M 300 1080 C 300 900, 250 700, 280 500 C 300 350, 350 200, 320 100"
          fill="none"
          stroke="#0a0a20"
          strokeWidth="40"
        />
        <path
          d="M 500 1080 C 480 850, 450 650, 500 450 C 530 300, 480 180, 520 80"
          fill="none"
          stroke="#08081a"
          strokeWidth="30"
        />

        {/* Right curved structures */}
        <path
          d="M 1620 1080 C 1620 900, 1670 700, 1640 500 C 1620 350, 1570 200, 1600 100"
          fill="none"
          stroke="#0a0a20"
          strokeWidth="40"
        />
        <path
          d="M 1420 1080 C 1440 850, 1470 650, 1420 450 C 1390 300, 1440 180, 1400 80"
          fill="none"
          stroke="#08081a"
          strokeWidth="30"
        />

        {/* Webway gate frame */}
        <ellipse cx="960" cy="600" rx="200" ry="350" fill="none" stroke={theme.colors.primary} strokeWidth="3" opacity="0.2" />
        <ellipse cx="960" cy="600" rx="180" ry="320" fill="none" stroke={theme.colors.secondary} strokeWidth="2" opacity="0.15" />
      </svg>

      {/* Spirit particles */}
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: 2 + Math.random() * 3,
            height: 2 + Math.random() * 3,
            background: i % 3 === 0 ? theme.colors.secondary : theme.colors.primary,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.5, 0.5],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ORKS - Industrial Scrap and Explosions
// ═══════════════════════════════════════════════════════════════════
function OrksBackground({ theme }: { theme: FactionTheme }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#080a05]">
      {/* Industrial smoke/haze */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, #0a0f08 0%, transparent 50%)`,
        }}
      />

      {/* Scrap pile silhouettes */}
      <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMax slice">
        {/* Junk pile - chaotic shapes */}
        <path
          d="M 0 1080 L 0 700 L 100 750 L 150 650 L 200 720 L 280 600 L 350 680 L 400 550 L 500 620 L 550 500 L 650 580 L 700 450 L 800 520 L 850 400 L 950 480 L 1000 380 L 1100 450 L 1150 350 L 1200 420 L 1300 380 L 1400 450 L 1450 380 L 1550 480 L 1600 420 L 1700 520 L 1750 450 L 1850 550 L 1920 500 L 1920 1080 Z"
          fill="#050805"
        />

        {/* Gork (or Mork) idol silhouette */}
        <path
          d="M 800 600 L 780 400 L 820 350 L 880 320 L 920 280 L 960 320 L 1020 350 L 1060 400 L 1040 600 L 1020 580 L 1000 620 L 950 600 L 920 650 L 890 600 L 840 620 L 820 580 Z"
          fill="#0a0f08"
          opacity="0.8"
        />

        {/* Glyph eyes */}
        <motion.circle
          cx="880" cy="380" r="15"
          fill={theme.colors.glow}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <motion.circle
          cx="960" cy="380" r="15"
          fill={theme.colors.glow}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
        />

        {/* Scrap metal pieces */}
        <rect x="200" y="650" width="80" height="20" fill="#0a0a05" transform="rotate(-15 200 650)" />
        <rect x="400" y="550" width="60" height="15" fill="#0a0a05" transform="rotate(25 400 550)" />
        <rect x="1400" y="480" width="70" height="18" fill="#0a0a05" transform="rotate(-20 1400 480)" />
        <rect x="1600" y="550" width="50" height="12" fill="#0a0a05" transform="rotate(10 1600 550)" />
      </svg>

      {/* Explosion flashes */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${15 + i * 25}%`,
            top: `${20 + (i % 2) * 30}%`,
            width: 150 + i * 30,
            height: 150 + i * 30,
            background: `radial-gradient(circle, ${theme.colors.primary}80 0%, #ff4400 30%, transparent 70%)`,
            filter: 'blur(10px)',
          }}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 0.9, 0],
          }}
          transition={{
            duration: 0.4,
            repeat: Infinity,
            repeatDelay: 3 + i * 1.5,
            delay: i * 0.8,
          }}
        />
      ))}

      {/* Sparks flying */}
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: '30%',
            width: 3,
            height: 3,
            background: i % 2 === 0 ? theme.colors.glow : '#ff6600',
            borderRadius: '50%',
          }}
          animate={{
            y: [0, -200 - Math.random() * 200],
            x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200],
            opacity: [1, 0],
          }}
          transition={{
            duration: 1 + Math.random(),
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}

      {/* Green glow from below */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1/3"
        style={{
          background: `linear-gradient(to top, ${theme.colors.primary}40, transparent)`,
        }}
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// T'AU - Clean Futuristic City and Tech Grid
// ═══════════════════════════════════════════════════════════════════
function TauBackground({ theme }: { theme: FactionTheme }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#020810]">
      {/* Tech grid overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(${theme.colors.primary}30 1px, transparent 1px),
            linear-gradient(90deg, ${theme.colors.primary}30 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Futuristic city silhouette */}
      <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="tauBuildingGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#050a15" />
            <stop offset="100%" stopColor="#0a1520" />
          </linearGradient>
        </defs>

        {/* City skyline - clean geometric shapes */}
        <g fill="url(#tauBuildingGrad)">
          {/* Left buildings */}
          <rect x="50" y="500" width="120" height="580" />
          <rect x="200" y="400" width="100" height="680" />
          <rect x="330" y="550" width="80" height="530" />
          <polygon points="450,300 550,300 550,1080 450,1080 500,250" />

          {/* Center tower */}
          <rect x="700" y="200" width="150" height="880" />
          <polygon points="700,200 775,50 850,200" fill="#0a1525" />

          {/* Main dome structure */}
          <ellipse cx="960" cy="600" rx="200" ry="150" fill="#081015" />
          <rect x="860" y="600" width="200" height="480" fill="#081015" />

          {/* Right buildings */}
          <rect x="1100" y="350" width="120" height="730" />
          <polygon points="1250,250 1350,250 1350,1080 1250,1080 1300,180" />
          <rect x="1400" y="450" width="100" height="630" />
          <rect x="1550" y="380" width="150" height="700" />
          <rect x="1750" y="500" width="170" height="580" />
        </g>

        {/* Window lights */}
        {[...Array(30)].map((_, i) => (
          <motion.rect
            key={i}
            x={100 + (i % 10) * 180}
            y={400 + Math.floor(i / 10) * 150}
            width="8"
            height="15"
            fill={theme.colors.glow}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}

        {/* Glowing antenna */}
        <motion.circle
          cx="775"
          cy="50"
          r="8"
          fill={theme.colors.glow}
          animate={{ opacity: [0.5, 1, 0.5], r: [6, 10, 6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.circle
          cx="1300"
          cy="180"
          r="6"
          fill={theme.colors.glow}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        />
      </svg>

      {/* Scanning lines */}
      {[...Array(2)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-0 right-0 h-[1px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${theme.colors.glow}, transparent)`,
            boxShadow: `0 0 15px ${theme.colors.glow}`,
          }}
          animate={{ top: ['0%', '100%'] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: i * 3,
            ease: 'linear',
          }}
        />
      ))}

      {/* Ambient glow */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1/2"
        style={{
          background: `linear-gradient(to top, ${theme.colors.primary}30, transparent)`,
        }}
        animate={{ opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TYRANIDS - Organic Horror Bio-Ship Interior
// ═══════════════════════════════════════════════════════════════════
function TyranidsBackground({ theme }: { theme: FactionTheme }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#080510]">
      {/* Pulsing hive glow */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 70%, ${theme.colors.primary}40 0%, transparent 60%)`,
        }}
        animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Organic structures SVG */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="chitinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.colors.primary} stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0a0510" />
          </linearGradient>
        </defs>

        {/* Organic ribcage/tunnel structure */}
        <g stroke={theme.colors.primary} strokeWidth="3" fill="none" opacity="0.3">
          {/* Left ribs */}
          <path d="M 0 200 Q 300 250, 400 500 Q 450 700, 400 900" />
          <path d="M 0 350 Q 250 400, 350 600 Q 400 750, 350 950" />
          <path d="M 0 500 Q 200 550, 300 700 Q 350 850, 300 1000" />

          {/* Right ribs */}
          <path d="M 1920 200 Q 1620 250, 1520 500 Q 1470 700, 1520 900" />
          <path d="M 1920 350 Q 1670 400, 1570 600 Q 1520 750, 1570 950" />
          <path d="M 1920 500 Q 1720 550, 1620 700 Q 1570 850, 1620 1000" />
        </g>

        {/* Central spine */}
        <path
          d="M 960 0 Q 940 200, 960 400 Q 980 600, 960 800 Q 940 1000, 960 1080"
          stroke={theme.colors.secondary}
          strokeWidth="8"
          fill="none"
          opacity="0.4"
        />

        {/* Tendrils from edges */}
        {[...Array(6)].map((_, i) => (
          <motion.path
            key={i}
            d={`M ${i < 3 ? 0 : 1920} ${200 + i * 150}
                Q ${i < 3 ? 150 + i * 30 : 1770 - i * 30} ${250 + i * 100},
                  ${i < 3 ? 250 + i * 50 : 1670 - i * 50} ${400 + i * 80}`}
            stroke={theme.colors.primary}
            strokeWidth="15"
            fill="none"
            opacity="0.5"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}

        {/* Nodes/eyes */}
        {[...Array(8)].map((_, i) => (
          <motion.circle
            key={i}
            cx={200 + (i % 4) * 450 + (i < 4 ? 0 : 100)}
            cy={300 + Math.floor(i / 4) * 350}
            r="12"
            fill={theme.colors.secondary}
            animate={{ opacity: [0.3, 0.9, 0.3], r: [10, 14, 10] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </svg>

      {/* Spore particles */}
      {[...Array(35)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: 4 + Math.random() * 8,
            height: 4 + Math.random() * 8,
            background: `radial-gradient(circle, ${theme.colors.secondary} 0%, ${theme.colors.primary}50 50%, transparent 100%)`,
          }}
          animate={{
            y: [0, -40 - Math.random() * 60],
            x: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 50],
            opacity: [0, 0.7, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 5 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 6,
          }}
        />
      ))}

      {/* Vein pulse effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${theme.colors.secondary}20 0%, transparent 50%)`,
        }}
        animate={{
          opacity: [0, 0.4, 0],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// DEFAULT
// ═══════════════════════════════════════════════════════════════════
function DefaultBackground({ theme }: { theme: FactionTheme }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-void">
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, ${theme.colors.primary}20 0%, transparent 70%)`,
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
    </div>
  )
}

export default FactionHeroBackground
