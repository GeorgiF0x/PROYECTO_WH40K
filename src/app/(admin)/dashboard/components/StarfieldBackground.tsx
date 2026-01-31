'use client'

import { useEffect, useRef, useCallback } from 'react'

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  twinkleSpeed: number
  twinklePhase: number
  color: string
}

interface WarpLine {
  x: number
  y: number
  length: number
  angle: number
  speed: number
  opacity: number
  active: boolean
}

const STAR_COLORS = [
  'rgba(232, 232, 240, 1)',    // bone - most common
  'rgba(232, 232, 240, 0.8)',  // bone dim
  'rgba(201, 162, 39, 0.7)',   // imperial-gold
  'rgba(13, 155, 138, 0.6)',   // necron-teal
  'rgba(107, 28, 95, 0.5)',    // warp-purple (rare)
]

export function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const warpLinesRef = useRef<WarpLine[]>([])
  const animationRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  // Initialize stars
  const initStars = useCallback((width: number, height: number) => {
    const starCount = Math.floor((width * height) / 8000) // Density based on screen size
    const stars: Star[] = []

    for (let i = 0; i < starCount; i++) {
      const colorIndex = Math.random() < 0.7 ? 0 :
                        Math.random() < 0.7 ? 1 :
                        Math.random() < 0.6 ? 2 :
                        Math.random() < 0.7 ? 3 : 4

      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.003 + 0.001,
        twinklePhase: Math.random() * Math.PI * 2,
        color: STAR_COLORS[colorIndex],
      })
    }

    starsRef.current = stars
  }, [])

  // Initialize occasional warp lines
  const initWarpLines = useCallback(() => {
    const warpLines: WarpLine[] = []
    for (let i = 0; i < 3; i++) {
      warpLines.push({
        x: 0,
        y: 0,
        length: 0,
        angle: 0,
        speed: 0,
        opacity: 0,
        active: false,
      })
    }
    warpLinesRef.current = warpLines
  }, [])

  // Spawn a warp line occasionally
  const maybeSpawnWarpLine = useCallback((width: number, height: number) => {
    if (Math.random() > 0.001) return // Very rare

    const inactiveWarp = warpLinesRef.current.find(w => !w.active)
    if (!inactiveWarp) return

    inactiveWarp.x = Math.random() * width
    inactiveWarp.y = Math.random() * height
    inactiveWarp.length = 0
    inactiveWarp.angle = Math.random() * Math.PI * 2
    inactiveWarp.speed = Math.random() * 2 + 1
    inactiveWarp.opacity = 0.6
    inactiveWarp.active = true
  }, [])

  // Draw function
  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, deltaTime: number) => {
    // Clear canvas with slight fade for trail effect
    ctx.fillStyle = 'rgba(3, 3, 8, 0.1)'
    ctx.fillRect(0, 0, width, height)

    // Draw stars
    starsRef.current.forEach(star => {
      // Update twinkle
      star.twinklePhase += star.twinkleSpeed * deltaTime
      const twinkle = (Math.sin(star.twinklePhase) + 1) / 2
      const currentOpacity = star.opacity * (0.5 + twinkle * 0.5)

      // Draw star glow
      const gradient = ctx.createRadialGradient(
        star.x, star.y, 0,
        star.x, star.y, star.size * 2
      )

      const baseColor = star.color.replace(/[\d.]+\)$/, '')
      gradient.addColorStop(0, `${baseColor}${currentOpacity})`)
      gradient.addColorStop(1, `${baseColor}0)`)

      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Draw star core
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size * 0.5, 0, Math.PI * 2)
      ctx.fillStyle = star.color.replace(/[\d.]+\)$/, `${currentOpacity})`)
      ctx.fill()
    })

    // Draw warp lines
    warpLinesRef.current.forEach(warp => {
      if (!warp.active) return

      // Update warp line
      warp.length += warp.speed * deltaTime * 0.5
      warp.opacity -= 0.001 * deltaTime

      if (warp.opacity <= 0 || warp.length > 200) {
        warp.active = false
        return
      }

      // Draw warp streak
      const endX = warp.x + Math.cos(warp.angle) * warp.length
      const endY = warp.y + Math.sin(warp.angle) * warp.length

      const gradient = ctx.createLinearGradient(warp.x, warp.y, endX, endY)
      gradient.addColorStop(0, `rgba(107, 28, 95, 0)`)
      gradient.addColorStop(0.3, `rgba(107, 28, 95, ${warp.opacity * 0.5})`)
      gradient.addColorStop(0.7, `rgba(13, 155, 138, ${warp.opacity})`)
      gradient.addColorStop(1, `rgba(13, 155, 138, 0)`)

      ctx.beginPath()
      ctx.moveTo(warp.x, warp.y)
      ctx.lineTo(endX, endY)
      ctx.strokeStyle = gradient
      ctx.lineWidth = 1.5
      ctx.stroke()
    })

    // Maybe spawn new warp line
    maybeSpawnWarpLine(width, height)
  }, [maybeSpawnWarpLine])

  // Animation loop
  const animate = useCallback((time: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const deltaTime = time - lastTimeRef.current
    lastTimeRef.current = time

    draw(ctx, canvas.width, canvas.height, deltaTime)
    animationRef.current = requestAnimationFrame(animate)
  }, [draw])

  // Handle resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    initStars(canvas.width, canvas.height)
  }, [initStars])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set initial size
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Initialize
    initStars(canvas.width, canvas.height)
    initWarpLines()

    // Start animation
    lastTimeRef.current = performance.now()
    animationRef.current = requestAnimationFrame(animate)

    // Handle resize
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', handleResize)
    }
  }, [initStars, initWarpLines, animate, handleResize])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  )
}

// Nebula overlay - subtle colored gradients
export function NebulaOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none opacity-30"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Warp nebula - top right */}
      <div
        className="absolute w-[800px] h-[600px] rounded-full blur-3xl"
        style={{
          top: '-10%',
          right: '-5%',
          background: 'radial-gradient(ellipse, rgba(107, 28, 95, 0.15) 0%, transparent 70%)',
        }}
      />
      {/* Teal nebula - bottom left */}
      <div
        className="absolute w-[600px] h-[800px] rounded-full blur-3xl"
        style={{
          bottom: '-15%',
          left: '-10%',
          background: 'radial-gradient(ellipse, rgba(13, 155, 138, 0.1) 0%, transparent 70%)',
        }}
      />
      {/* Gold dust - center */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full blur-3xl"
        style={{
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(ellipse, rgba(201, 162, 39, 0.05) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}
