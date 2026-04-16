'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, Shield, ScrollText, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const COOKIE_CONSENT_KEY = 'grimdark-legion-cookies-accepted'

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      const timer = setTimeout(() => setShowBanner(true), 3500)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptAll = () => {
    localStorage.setItem(
      COOKIE_CONSENT_KEY,
      JSON.stringify({
        essential: true,
        analytics: true,
        preferences: true,
        timestamp: Date.now(),
      })
    )
    setShowBanner(false)
  }

  const acceptEssential = () => {
    localStorage.setItem(
      COOKIE_CONSENT_KEY,
      JSON.stringify({
        essential: true,
        analytics: false,
        preferences: false,
        timestamp: Date.now(),
      })
    )
    setShowBanner(false)
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={acceptEssential}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-4 left-4 right-4 z-50 md:bottom-8 md:left-auto md:right-8 md:max-w-lg"
          >
            <div className="relative overflow-hidden rounded-xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-950 via-amber-900/95 to-amber-950 shadow-2xl shadow-amber-900/30">
              {/* Animated glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />

              {/* Corner brackets */}
              <div className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-amber-400" />
              <div className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-amber-400" />
              <div className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-amber-400" />
              <div className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-amber-400" />

              {/* Header bar */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 border-b border-amber-500/30 bg-amber-500/20 px-4 py-2.5"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Shield className="h-5 w-5 text-amber-400" />
                </motion.div>
                <span className="text-sm font-bold uppercase tracking-wider text-amber-300">
                  Decreto del Administratum
                </span>
                <span className="hidden text-xs text-amber-400/60 sm:inline">
                  // Ref: COOKIE-GDPR-M41
                </span>
              </motion.div>

              {/* Content */}
              <div className="relative p-5">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-start gap-4"
                >
                  <motion.div
                    className="hidden rounded-lg border border-amber-500/30 bg-amber-500/20 p-3 sm:flex"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Cookie className="h-7 w-7 text-amber-400" />
                  </motion.div>

                  <div className="flex-1 space-y-3">
                    <h3 className="text-lg font-bold text-amber-100">
                      Registro de Datos Obligatorio
                    </h3>
                    <p className="text-sm leading-relaxed text-amber-200/80">
                      Por decreto del Administratum Imperial, este dominio utiliza{' '}
                      <span className="font-medium text-amber-400">
                        archivos de datos (cookies)
                      </span>{' '}
                      para garantizar el correcto funcionamiento del servicio y mejorar tu
                      experiencia como ciudadano imperial.
                    </p>

                    {/* Expandable details */}
                    <AnimatePresence>
                      {showDetails && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-2 border-t border-amber-500/20 pt-3">
                            <CookieCategory
                              title="Cookies Esenciales"
                              description="Autenticación y seguridad del servicio."
                              required
                              delay={0}
                            />
                            <CookieCategory
                              title="Cookies de Análisis"
                              description="Nos ayudan a mejorar el sitio."
                              delay={0.1}
                            />
                            <CookieCategory
                              title="Cookies de Preferencias"
                              description="Guardan tu configuración personal."
                              delay={0.2}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Links */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center gap-4 pt-1 text-xs"
                    >
                      <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="flex items-center gap-1 text-amber-400/80 transition-colors hover:text-amber-300"
                      >
                        <ScrollText className="h-3 w-3" />
                        {showDetails ? 'Ocultar' : 'Ver detalles'}
                      </button>
                      <Link
                        href="/legal/cookies"
                        className="text-amber-400/80 transition-colors hover:text-amber-300"
                      >
                        Política de Cookies
                      </Link>
                      <Link
                        href="/legal/privacidad"
                        className="text-amber-400/80 transition-colors hover:text-amber-300"
                      >
                        Privacidad
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-5 flex flex-col gap-3 border-t border-amber-500/20 pt-4 sm:flex-row"
                >
                  <motion.button
                    onClick={acceptEssential}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 rounded-lg border border-amber-500/40 px-4 py-2.5 text-sm font-medium text-amber-300 transition-all hover:border-amber-400/60 hover:bg-amber-500/10"
                  >
                    Solo Esenciales
                  </motion.button>
                  <motion.button
                    onClick={acceptAll}
                    whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-2.5 text-sm font-bold text-amber-950 shadow-lg shadow-amber-500/20 transition-all hover:from-amber-500 hover:to-amber-400"
                  >
                    <Check className="h-4 w-4" />
                    Aceptar Todo
                  </motion.button>
                </motion.div>
              </div>

              {/* Footer seal */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="border-t border-amber-500/20 bg-amber-950/80 px-4 py-2 text-center"
              >
                <p className="text-[10px] tracking-[0.15em] text-amber-500/60">
                  ++ POR EL EMPERADOR Y EL CUMPLIMIENTO DEL RGPD ++
                </p>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function CookieCategory({
  title,
  description,
  required = false,
  delay = 0,
}: {
  title: string
  description: string
  required?: boolean
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5"
    >
      <div
        className={cn(
          'mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border',
          required ? 'border-amber-400 bg-amber-500/30' : 'border-amber-500/40'
        )}
      >
        {required && <Check className="h-3 w-3 text-amber-300" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-amber-200">{title}</span>
          {required && (
            <span className="rounded bg-amber-500/30 px-1.5 py-0.5 text-[9px] font-medium text-amber-300">
              REQUERIDO
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-amber-300/60">{description}</p>
      </div>
    </motion.div>
  )
}
