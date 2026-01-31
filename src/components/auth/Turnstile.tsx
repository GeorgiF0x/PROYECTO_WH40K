'use client'

import { useEffect, useRef, useCallback } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string
          callback?: (token: string) => void
          'expired-callback'?: () => void
          'error-callback'?: () => void
          theme?: 'light' | 'dark' | 'auto'
          size?: 'normal' | 'compact'
        }
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
    onloadTurnstileCallback?: () => void
  }
}

interface TurnstileProps {
  onVerify: (token: string) => void
  onExpire?: () => void
  onError?: () => void
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact'
  className?: string
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

export default function Turnstile({
  onVerify,
  onExpire,
  onError,
  theme = 'dark',
  size = 'normal',
  className = '',
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const scriptLoadedRef = useRef(false)

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || widgetIdRef.current) return

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: onVerify,
      'expired-callback': onExpire,
      'error-callback': onError,
      theme,
      size,
    })
  }, [onVerify, onExpire, onError, theme, size])

  useEffect(() => {
    // If Turnstile script is already loaded, render immediately
    if (window.turnstile) {
      renderWidget()
      return
    }

    // Load the script if not already loading
    if (!scriptLoadedRef.current) {
      scriptLoadedRef.current = true

      // Set up callback for when script loads
      window.onloadTurnstileCallback = () => {
        renderWidget()
      }

      // Add script tag
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    // Cleanup
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [renderWidget])

  // Don't render anything if site key is not configured
  if (!TURNSTILE_SITE_KEY) {
    console.warn('[Turnstile] Site key not configured')
    return null
  }

  return (
    <div
      ref={containerRef}
      className={`flex justify-center ${className}`}
      data-theme={theme}
    />
  )
}

// Hook to reset Turnstile widget
export function useTurnstileReset() {
  return useCallback((widgetId?: string) => {
    if (window.turnstile && widgetId) {
      window.turnstile.reset(widgetId)
    }
  }, [])
}
