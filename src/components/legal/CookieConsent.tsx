'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, Shield, ScrollText, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const COOKIE_CONSENT_KEY = 'grimdark-legion-cookies-accepted'

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      // Small delay to avoid flash on page load
      const timer = setTimeout(() => setShowBanner(true), 1000)
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
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-void-light border border-gold/30 rounded-lg shadow-2xl shadow-black/50 overflow-hidden">
              {/* Decorative corner brackets */}
              <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-gold/50" />
              <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-gold/50" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-gold/50" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-gold/50" />

              {/* Header bar */}
              <div className="bg-gold/10 border-b border-gold/20 px-4 py-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-gold" />
                <span className="text-xs font-bold text-gold uppercase tracking-wider">
                  Decreto del Administratum
                </span>
                <span className="text-xs text-gold/50">// Ref: COOKIE-GDPR-M41</span>
              </div>

              {/* Content */}
              <div className="p-4 md:p-6">
                <div className="flex items-start gap-4">
                  <div className="hidden md:flex p-3 bg-gold/10 rounded-lg border border-gold/20">
                    <Cookie className="w-6 h-6 text-gold" />
                  </div>

                  <div className="flex-1 space-y-3">
                    <h3 className="text-lg font-bold text-bone">
                      Registro de Datos Obligatorio
                    </h3>
                    <p className="text-sm text-bone/70 leading-relaxed">
                      Por decreto del Administratum Imperial, este dominio utiliza <span className="text-gold">archivos de datos (cookies)</span> para
                      garantizar el correcto funcionamiento del servicio, analizar el tráfico de la red vox y mejorar tu experiencia como ciudadano imperial.
                    </p>

                    {/* Expandable details */}
                    <AnimatePresence>
                      {showDetails && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 space-y-3 border-t border-bone/10">
                            <CookieCategory
                              title="Cookies Esenciales"
                              description="Necesarias para el funcionamiento del servicio. Autenticación y seguridad."
                              required
                            />
                            <CookieCategory
                              title="Cookies de Análisis"
                              description="Nos ayudan a entender cómo usas el sitio para mejorarlo."
                            />
                            <CookieCategory
                              title="Cookies de Preferencias"
                              description="Guardan tus preferencias como tema y configuración."
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Links */}
                    <div className="flex items-center gap-4 text-xs">
                      <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-gold/70 hover:text-gold transition-colors flex items-center gap-1"
                      >
                        <ScrollText className="w-3 h-3" />
                        {showDetails ? 'Ocultar detalles' : 'Ver detalles'}
                      </button>
                      <Link href="/legal/cookies" className="text-gold/70 hover:text-gold transition-colors">
                        Política de Cookies
                      </Link>
                      <Link href="/legal/privacidad" className="text-gold/70 hover:text-gold transition-colors">
                        Privacidad
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-bone/10">
                  <button
                    onClick={acceptEssential}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-bone/20 text-bone/70 hover:text-bone hover:border-bone/40 transition-colors text-sm font-medium"
                  >
                    Solo Esenciales
                  </button>
                  <button
                    onClick={acceptAll}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-gold text-void font-bold text-sm hover:bg-gold/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Aceptar Todo
                  </button>
                </div>
              </div>

              {/* Footer seal */}
              <div className="bg-void border-t border-gold/10 px-4 py-2 text-center">
                <p className="text-[10px] text-bone/30 tracking-wider">
                  ++ POR EL EMPERADOR Y EL CUMPLIMIENTO DEL RGPD ++
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function CookieCategory({
  title,
  description,
  required = false,
}: {
  title: string
  description: string
  required?: boolean
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-bone/5 rounded-lg">
      <div className={cn(
        'w-4 h-4 rounded border flex items-center justify-center mt-0.5',
        required ? 'bg-gold/20 border-gold/50' : 'border-bone/30'
      )}>
        {required && <Check className="w-3 h-3 text-gold" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-bone">{title}</span>
          {required && (
            <span className="text-[10px] px-1.5 py-0.5 bg-gold/20 text-gold rounded">
              REQUERIDO
            </span>
          )}
        </div>
        <p className="text-xs text-bone/50 mt-0.5">{description}</p>
      </div>
    </div>
  )
}
