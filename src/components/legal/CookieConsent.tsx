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
      const timer = setTimeout(() => setShowBanner(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      essential: true,
      analytics: true,
      preferences: true,
      timestamp: Date.now()
    }))
    setShowBanner(false)
  }

  const acceptEssential = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      essential: true,
      analytics: false,
      preferences: false,
      timestamp: Date.now()
    }))
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={acceptEssential}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-4 left-4 right-4 md:bottom-8 md:left-auto md:right-8 md:max-w-lg z-50"
          >
            <div className="relative bg-gradient-to-br from-amber-950 via-amber-900/95 to-amber-950 border-2 border-amber-500/50 rounded-xl shadow-2xl shadow-amber-900/30 overflow-hidden">
              {/* Animated glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />

              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-5 h-5 border-l-2 border-t-2 border-amber-400" />
              <div className="absolute top-0 right-0 w-5 h-5 border-r-2 border-t-2 border-amber-400" />
              <div className="absolute bottom-0 left-0 w-5 h-5 border-l-2 border-b-2 border-amber-400" />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-r-2 border-b-2 border-amber-400" />

              {/* Header bar */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2.5 flex items-center gap-2"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Shield className="w-5 h-5 text-amber-400" />
                </motion.div>
                <span className="text-sm font-bold text-amber-300 uppercase tracking-wider">
                  Decreto del Administratum
                </span>
                <span className="text-xs text-amber-400/60 hidden sm:inline">// Ref: COOKIE-GDPR-M41</span>
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
                    className="hidden sm:flex p-3 bg-amber-500/20 rounded-lg border border-amber-500/30"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Cookie className="w-7 h-7 text-amber-400" />
                  </motion.div>

                  <div className="flex-1 space-y-3">
                    <h3 className="text-lg font-bold text-amber-100">
                      Registro de Datos Obligatorio
                    </h3>
                    <p className="text-sm text-amber-200/80 leading-relaxed">
                      Por decreto del Administratum Imperial, este dominio utiliza{' '}
                      <span className="text-amber-400 font-medium">archivos de datos (cookies)</span> para
                      garantizar el correcto funcionamiento del servicio y mejorar tu experiencia como ciudadano imperial.
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
                          <div className="pt-3 space-y-2 border-t border-amber-500/20">
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
                      className="flex items-center gap-4 text-xs pt-1"
                    >
                      <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-amber-400/80 hover:text-amber-300 transition-colors flex items-center gap-1"
                      >
                        <ScrollText className="w-3 h-3" />
                        {showDetails ? 'Ocultar' : 'Ver detalles'}
                      </button>
                      <Link href="/legal/cookies" className="text-amber-400/80 hover:text-amber-300 transition-colors">
                        Política de Cookies
                      </Link>
                      <Link href="/legal/privacidad" className="text-amber-400/80 hover:text-amber-300 transition-colors">
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
                  className="flex flex-col sm:flex-row gap-3 mt-5 pt-4 border-t border-amber-500/20"
                >
                  <motion.button
                    onClick={acceptEssential}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400/60 transition-all text-sm font-medium"
                  >
                    Solo Esenciales
                  </motion.button>
                  <motion.button
                    onClick={acceptAll}
                    whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 text-amber-950 font-bold text-sm hover:from-amber-500 hover:to-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                  >
                    <Check className="w-4 h-4" />
                    Aceptar Todo
                  </motion.button>
                </motion.div>
              </div>

              {/* Footer seal */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-amber-950/80 border-t border-amber-500/20 px-4 py-2 text-center"
              >
                <p className="text-[10px] text-amber-500/60 tracking-[0.15em]">
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
      className="flex items-start gap-3 p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/20"
    >
      <div className={cn(
        'w-4 h-4 rounded border flex items-center justify-center mt-0.5 flex-shrink-0',
        required ? 'bg-amber-500/30 border-amber-400' : 'border-amber-500/40'
      )}>
        {required && <Check className="w-3 h-3 text-amber-300" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-amber-200">{title}</span>
          {required && (
            <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/30 text-amber-300 rounded font-medium">
              REQUERIDO
            </span>
          )}
        </div>
        <p className="text-xs text-amber-300/60 mt-0.5">{description}</p>
      </div>
    </motion.div>
  )
}
