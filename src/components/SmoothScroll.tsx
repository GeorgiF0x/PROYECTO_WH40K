'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const init = () => {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 2,
      })

      lenisRef.current = lenis

      function raf(time: number) {
        lenis.raf(time)
        requestAnimationFrame(raf)
      }

      requestAnimationFrame(raf)
    }

    // Defer Lenis init until browser is idle to avoid blocking LCP
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(init)
      return () => {
        cancelIdleCallback(id)
        lenisRef.current?.destroy()
        lenisRef.current = null
      }
    } else {
      const tid = setTimeout(init, 2000)
      return () => {
        clearTimeout(tid)
        lenisRef.current?.destroy()
        lenisRef.current = null
      }
    }
  }, [])

  return null
}
