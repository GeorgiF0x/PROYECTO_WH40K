'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
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
// IMPERIUM - Golden cathedral rays, divine light beams
// ═══════════════════════════════════════════════════════════════════
function ImperiumBackground({ theme }: { theme: FactionTheme }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Dark base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12] via-[#12101a] to-[#0a0a0f]" />

      {/* Cathedral light rays from above */}
      <div className="absolute inset-0">
        {[...Array(7)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-0 origin-top"
            style={{
              left: `${10 + i * 13}%`,
              width: '120px',
              height: '100%',
              background: `linear-gradient(180deg, ${theme.colors.primary}40 0%, ${theme.colors.primary}15 30%, transparent 70%)`,
              filter: 'blur(20px)',
              transform: `rotate(${-15 + i * 5}deg)`,
            }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scaleY: [1, 1.1, 1],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Dust particles in light */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: 2 + Math.random() * 3,
              height: 2 + Math.random() * 3,
              background: theme.colors.primary,
              boxShadow: `0 0 ${4 + Math.random() * 6}px ${theme.colors.glow}`,
            }}
            animate={{
              y: [0, -100 - Math.random() * 200],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 10,
            }}
          />
        ))}
      </div>

      {/* Gothic arch silhouettes */}
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="archGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.colors.primary} stopOpacity="0.3" />
            <stop offset="100%" stopColor={theme.colors.primary} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[15, 35, 55, 75].map((x, i) => (
          <path
            key={i}
            d={`M${x-8} 100 L${x-8} 40 Q${x} 20 ${x+8} 40 L${x+8} 100`}
            fill="none"
            stroke="url(#archGrad)"
            strokeWidth="0.3"
          />
        ))}
      </svg>

      {/* Central golden glow */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px]"
        style={{
          background: `radial-gradient(ellipse at top, ${theme.colors.primary}25 0%, transparent 60%)`,
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CHAOS - Hellfire, warp flames, chaotic energy
// ═══════════════════════════════════════════════════════════════════
function ChaosBackground({ theme }: { theme: FactionTheme }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; life: number; maxLife: number; hue: number
    }> = []

    const createParticle = () => ({
      x: Math.random() * canvas.width,
      y: canvas.height + 50,
      vx: (Math.random() - 0.5) * 3,
      vy: -2 - Math.random() * 4,
      size: 5 + Math.random() * 15,
      life: 0,
      maxLife: 100 + Math.random() * 100,
      hue: Math.random() > 0.7 ? 30 : 0, // Orange or red
    })

    for (let i = 0; i < 60; i++) {
      const p = createParticle()
      p.y = Math.random() * canvas.height
      p.life = Math.random() * p.maxLife
      particles.push(p)
    }

    let animationId: number
    const animate = () => {
      ctx.fillStyle = 'rgba(10, 5, 5, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p, i) => {
        p.life++
        if (p.life > p.maxLife) {
          particles[i] = createParticle()
          return
        }

        p.x += p.vx + Math.sin(p.life * 0.05) * 2
        p.y += p.vy
        p.vx *= 0.99

        const lifeRatio = p.life / p.maxLife
        const alpha = Math.sin(lifeRatio * Math.PI)
        const size = p.size * (1 - lifeRatio * 0.5)

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size)
        gradient.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${alpha})`)
        gradient.addColorStop(0.4, `hsla(${p.hue}, 100%, 50%, ${alpha * 0.6})`)
        gradient.addColorStop(1, `hsla(${p.hue}, 100%, 20%, 0)`)

        ctx.beginPath()
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      })

      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-[#1a0505] via-[#0f0505] to-[#050202]" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-80" />

      {/* Warp cracks */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${20 + i * 15}%`,
            top: '20%',
            width: '2px',
            height: '60%',
            background: `linear-gradient(180deg, transparent, ${theme.colors.primary}, ${theme.colors.secondary}, transparent)`,
            filter: 'blur(1px)',
            transform: `rotate(${-20 + i * 10}deg)`,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scaleY: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}

      {/* Bottom fire glow */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1/2"
        style={{
          background: `linear-gradient(to top, ${theme.colors.primary}50, transparent)`,
        }}
        animate={{
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// NECRONS - Green matrix code, circuits, ancient tech
// ═══════════════════════════════════════════════════════════════════
function NecronsBackground({ theme }: { theme: FactionTheme }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const columns = Math.floor(canvas.width / 20)
    const drops: number[] = Array(columns).fill(1).map(() => Math.random() * -100)
    const chars = '⌐░▒▓█▀▄■□●○◊◆◇▲△▼▽⬡⬢⎔⏣⏢⎊⌬⏥'

    let animationId: number
    const animate = () => {
      ctx.fillStyle = 'rgba(5, 15, 10, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.font = '15px monospace'

      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const x = i * 20

        // Brighter leading character
        ctx.fillStyle = theme.colors.glow
        ctx.shadowBlur = 10
        ctx.shadowColor = theme.colors.glow
        ctx.fillText(char, x, y)

        // Trail characters
        for (let j = 1; j < 15; j++) {
          const trailY = y - j * 20
          if (trailY > 0) {
            const alpha = 1 - j / 15
            ctx.fillStyle = `rgba(0, 255, 135, ${alpha * 0.5})`
            ctx.shadowBlur = 0
            ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, trailY)
          }
        }

        drops[i] = y > canvas.height + Math.random() * 1000 ? 0 : y + 20

        if (Math.random() > 0.98) {
          drops[i] = 0
        }
      })

      animationId = requestAnimationFrame(animate)
    }

    const interval = setInterval(animate, 50)

    return () => {
      cancelAnimationFrame(animationId)
      clearInterval(interval)
    }
  }, [theme.colors.glow])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#020a08] via-[#051510] to-[#020805]" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />

      {/* Circuit lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <linearGradient id="circuitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={theme.colors.primary} stopOpacity="0" />
            <stop offset="50%" stopColor={theme.colors.glow} stopOpacity="1" />
            <stop offset="100%" stopColor={theme.colors.primary} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[20, 40, 60, 80].map((y, i) => (
          <motion.line
            key={i}
            x1="0%"
            y1={`${y}%`}
            x2="100%"
            y2={`${y}%`}
            stroke="url(#circuitGrad)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 0], opacity: [0, 0.5, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 0.8 }}
          />
        ))}
      </svg>

      {/* Glowing nodes */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${10 + (i % 5) * 20}%`,
            top: `${20 + Math.floor(i / 5) * 25}%`,
            background: theme.colors.glow,
            boxShadow: `0 0 20px ${theme.colors.glow}, 0 0 40px ${theme.colors.primary}`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// AELDARI - Cosmic flows, psychedelic waves, ethereal
// ═══════════════════════════════════════════════════════════════════
function AeldariBackground({ theme }: { theme: FactionTheme }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#050510] via-[#0a0a20] to-[#050508]" />

      {/* Flowing cosmic waves */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-full"
          style={{
            top: `${20 + i * 15}%`,
            height: '200px',
            background: `linear-gradient(90deg,
              transparent,
              ${theme.colors.primary}20,
              ${theme.colors.secondary}30,
              ${theme.colors.primary}20,
              transparent
            )`,
            filter: 'blur(30px)',
            borderRadius: '50%',
          }}
          animate={{
            x: ['-100%', '100%'],
            scaleY: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 15 + i * 3,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 2,
          }}
        />
      ))}

      {/* Nebula clouds */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96"
        style={{
          background: `radial-gradient(ellipse, ${theme.colors.secondary}40 0%, transparent 70%)`,
          filter: 'blur(40px)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 20, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80"
        style={{
          background: `radial-gradient(ellipse, ${theme.colors.primary}50 0%, transparent 70%)`,
          filter: 'blur(50px)',
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 15, repeat: Infinity }}
      />

      {/* Star particles */}
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: 1 + Math.random() * 2,
            height: 1 + Math.random() * 2,
            background: i % 3 === 0 ? theme.colors.secondary : '#fff',
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}

      {/* Psychic runes floating */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        {[...Array(8)].map((_, i) => (
          <motion.text
            key={i}
            x={`${15 + (i % 4) * 25}%`}
            y={`${25 + Math.floor(i / 4) * 40}%`}
            fill={theme.colors.secondary}
            fontSize="40"
            fontFamily="serif"
            animate={{
              opacity: [0, 0.5, 0],
              y: [`${25 + Math.floor(i / 4) * 40}%`, `${20 + Math.floor(i / 4) * 40}%`],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              delay: i * 0.7,
            }}
          >
            ᚠᚢᚦᚨᚱᚲ
          </motion.text>
        ))}
      </svg>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ORKS - Industrial sparks, explosions, brutal metal
// ═══════════════════════════════════════════════════════════════════
function OrksBackground({ theme }: { theme: FactionTheme }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f08] via-[#0f1510] to-[#080a05]" />

      {/* Metal texture overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.03) 2px,
              rgba(255,255,255,0.03) 4px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.03) 2px,
              rgba(255,255,255,0.03) 4px
            )
          `,
        }}
      />

      {/* Welding sparks */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`,
          }}
        >
          {[...Array(8)].map((_, j) => (
            <motion.div
              key={j}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: j % 2 === 0 ? theme.colors.primary : '#ff6600',
                boxShadow: `0 0 4px ${theme.colors.glow}`,
              }}
              animate={{
                x: [0, (Math.random() - 0.5) * 100],
                y: [0, Math.random() * 150],
                opacity: [1, 0],
                scale: [1, 0],
              }}
              transition={{
                duration: 0.8 + Math.random() * 0.5,
                repeat: Infinity,
                delay: i * 0.3 + j * 0.05,
                repeatDelay: 2 + Math.random() * 3,
              }}
            />
          ))}
        </motion.div>
      ))}

      {/* Explosion flashes */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${20 + i * 30}%`,
            top: `${30 + i * 15}%`,
            width: '200px',
            height: '200px',
            background: `radial-gradient(circle, ${theme.colors.primary}60 0%, #ff4400 30%, transparent 70%)`,
            filter: 'blur(20px)',
          }}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 3 + i * 2,
            delay: i * 1.5,
          }}
        />
      ))}

      {/* Smoke */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${10 + i * 20}%`,
            bottom: '0',
            width: '150px',
            height: '300px',
            background: `linear-gradient(to top, rgba(50,50,50,0.5), transparent)`,
            filter: 'blur(30px)',
          }}
          animate={{
            y: [0, -50, 0],
            opacity: [0.3, 0.5, 0.3],
            scaleX: [1, 1.2, 1],
          }}
          transition={{
            duration: 5 + i,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}

      {/* Green glow from below */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1/3"
        style={{
          background: `linear-gradient(to top, ${theme.colors.primary}30, transparent)`,
        }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// T'AU - Clean tech grid, futuristic, cyan accents
// ═══════════════════════════════════════════════════════════════════
function TauBackground({ theme }: { theme: FactionTheme }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#030810] via-[#051015] to-[#020508]" />

      {/* Tech grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(${theme.colors.primary}20 1px, transparent 1px),
            linear-gradient(90deg, ${theme.colors.primary}20 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Scanning lines */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${theme.colors.glow}, transparent)`,
            boxShadow: `0 0 20px ${theme.colors.glow}`,
          }}
          animate={{
            top: ['0%', '100%'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 1.5,
            ease: 'linear',
          }}
        />
      ))}

      {/* Hexagonal pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <defs>
          <pattern id="hexPattern" width="60" height="52" patternUnits="userSpaceOnUse">
            <polygon
              points="30,0 60,15 60,37 30,52 0,37 0,15"
              fill="none"
              stroke={theme.colors.primary}
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexPattern)" />
      </svg>

      {/* Data streams */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-px"
          style={{
            left: `${15 + i * 15}%`,
            top: 0,
            height: '100%',
            background: `linear-gradient(180deg, transparent, ${theme.colors.glow}50, transparent)`,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            scaleY: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.4,
          }}
        />
      ))}

      {/* Floating UI elements */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute border rounded"
          style={{
            left: `${10 + (i % 4) * 25}%`,
            top: `${20 + Math.floor(i / 4) * 40}%`,
            width: '60px',
            height: '30px',
            borderColor: `${theme.colors.primary}40`,
          }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [0.9, 1, 0.9],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Central glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px]"
        style={{
          background: `radial-gradient(ellipse, ${theme.colors.primary}15 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TYRANIDS - Organic horror, bio swarm, alien tendrils
// ═══════════════════════════════════════════════════════════════════
function TyranidsBackground({ theme }: { theme: FactionTheme }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0510] via-[#100815] to-[#050308]" />

      {/* Organic pulsing veins */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="veinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={theme.colors.primary} stopOpacity="0" />
            <stop offset="50%" stopColor={theme.colors.secondary} stopOpacity="0.6" />
            <stop offset="100%" stopColor={theme.colors.primary} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[...Array(8)].map((_, i) => (
          <motion.path
            key={i}
            d={`M ${-50 + i * 30} ${100 + i * 50} Q ${200 + i * 100} ${50 + i * 30} ${400 + i * 150} ${150 + i * 40} T ${800 + i * 100} ${100 + i * 60}`}
            fill="none"
            stroke="url(#veinGrad)"
            strokeWidth="3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              delay: i * 0.6,
            }}
          />
        ))}
      </svg>

      {/* Spore particles */}
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: 3 + Math.random() * 8,
            height: 3 + Math.random() * 8,
            background: `radial-gradient(circle, ${theme.colors.secondary} 0%, ${theme.colors.primary}50 50%, transparent 100%)`,
          }}
          animate={{
            y: [0, -30 - Math.random() * 50],
            x: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}

      {/* Chitinous texture overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 30%, ${theme.colors.primary}30 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, ${theme.colors.secondary}30 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, ${theme.colors.primary}20 0%, transparent 60%)
          `,
        }}
      />

      {/* Pulsing hive glow */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-2/3"
        style={{
          background: `radial-gradient(ellipse at bottom, ${theme.colors.primary}40 0%, transparent 70%)`,
        }}
        animate={{
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Shadow tendrils from edges */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: i < 3 ? 0 : 'auto',
            right: i >= 3 ? 0 : 'auto',
            top: `${20 + (i % 3) * 25}%`,
            width: '200px',
            height: '100px',
            background: `linear-gradient(${i < 3 ? '90deg' : '270deg'}, ${theme.colors.primary}50, transparent)`,
            filter: 'blur(20px)',
            borderRadius: '50%',
          }}
          animate={{
            x: i < 3 ? [0, 50, 0] : [0, -50, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// DEFAULT - Generic faction background
// ═══════════════════════════════════════════════════════════════════
function DefaultBackground({ theme }: { theme: FactionTheme }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-void via-void-light to-void" />
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
