'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lock, Feather, Clock, BookOpen, ArrowRight, Shield, Library } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface WikiAccessDeniedProps {
  hasPendingApplication: boolean
  applicationDate?: string
}

export function WikiAccessDenied({
  hasPendingApplication,
  applicationDate,
}: WikiAccessDeniedProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Main card */}
        <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-b from-void-light/90 to-void/80">
          {/* Corner decorations */}
          <div className="absolute left-0 top-0 h-20 w-20 rounded-tl-xl border-l-2 border-t-2 border-amber-500/20" />
          <div className="absolute right-0 top-0 h-20 w-20 rounded-tr-xl border-r-2 border-t-2 border-amber-500/20" />
          <div className="absolute bottom-0 left-0 h-20 w-20 rounded-bl-xl border-b-2 border-l-2 border-amber-500/20" />
          <div className="absolute bottom-0 right-0 h-20 w-20 rounded-br-xl border-b-2 border-r-2 border-amber-500/20" />

          {/* Top accent */}
          <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

          <div className="relative p-8 text-center">
            {/* Icon */}
            <div className="relative mb-6 inline-block">
              <motion.div
                className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-amber-500/30 bg-amber-500/10"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(245, 158, 11, 0.1)',
                    '0 0 30px rgba(245, 158, 11, 0.2)',
                    '0 0 20px rgba(245, 158, 11, 0.1)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {hasPendingApplication ? (
                  <Clock className="h-10 w-10 text-amber-400" />
                ) : (
                  <Lock className="h-10 w-10 text-amber-400" />
                )}
              </motion.div>
            </div>

            {hasPendingApplication ? (
              <>
                <h1 className="mb-3 font-display text-2xl font-bold text-bone">
                  Peticion en Proceso
                </h1>
                <p className="mx-auto mb-6 max-w-sm text-bone/60">
                  Tu solicitud para unirte a la Orden de Escribas esta siendo revisada por el
                  Archivista Mayor.
                </p>
                {applicationDate && (
                  <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-amber-500/20 bg-void/50 px-4 py-2 font-mono text-sm text-amber-400/70">
                    <Clock className="h-4 w-4" />
                    Enviada:{' '}
                    {new Date(applicationDate).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                )}
              </>
            ) : (
              <>
                <h1 className="mb-3 font-display text-2xl font-bold text-bone">
                  Archivo Restringido
                </h1>
                <p className="mx-auto mb-6 max-w-sm text-bone/60">
                  El acceso al Archivo Lexicanum requiere autorizacion del Archivista Mayor.
                  Solicita unirte a la Orden de Escribas.
                </p>
              </>
            )}

            {/* Benefits preview */}
            <div className="mb-6 grid grid-cols-3 gap-3">
              {[
                { icon: Feather, label: 'Crear articulos' },
                { icon: BookOpen, label: 'Editar wiki' },
                { icon: Shield, label: 'Insignia especial' },
              ].map((item, i) => (
                <div key={i} className="rounded-lg border border-bone/5 bg-void/30 p-3">
                  <item.icon className="mx-auto mb-1 h-5 w-5 text-amber-400/60" />
                  <p className="text-xs text-bone/50">{item.label}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            {!hasPendingApplication && (
              <Link href="/wiki/solicitar">
                <Button
                  variant="primary"
                  className="w-full gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600"
                >
                  <Feather className="h-5 w-5" />
                  Solicitar ser Lexicanum Scribe
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}

            {/* Browse factions link */}
            <Link
              href="/facciones"
              className="mt-4 inline-flex items-center gap-2 text-sm text-bone/40 transition-colors hover:text-bone/70"
            >
              <Library className="h-4 w-4" />
              Explorar el Archivo publico
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
