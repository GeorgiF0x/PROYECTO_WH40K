'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Lock,
  Feather,
  Clock,
  BookOpen,
  ArrowRight,
  Shield,
  Library
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface WikiAccessDeniedProps {
  hasPendingApplication: boolean
  applicationDate?: string
}

export function WikiAccessDenied({
  hasPendingApplication,
  applicationDate
}: WikiAccessDeniedProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        {/* Main card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-void-light/90 to-void/80 border border-amber-500/20">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-amber-500/20 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-amber-500/20 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-amber-500/20 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-amber-500/20 rounded-br-xl" />

          {/* Top accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

          <div className="relative p-8 text-center">
            {/* Icon */}
            <div className="relative inline-block mb-6">
              <motion.div
                className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(245, 158, 11, 0.1)',
                    '0 0 30px rgba(245, 158, 11, 0.2)',
                    '0 0 20px rgba(245, 158, 11, 0.1)',
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {hasPendingApplication ? (
                  <Clock className="w-10 h-10 text-amber-400" />
                ) : (
                  <Lock className="w-10 h-10 text-amber-400" />
                )}
              </motion.div>
            </div>

            {hasPendingApplication ? (
              <>
                <h1 className="text-2xl font-display font-bold text-bone mb-3">
                  Peticion en Proceso
                </h1>
                <p className="text-bone/60 mb-6 max-w-sm mx-auto">
                  Tu solicitud para unirte a la Orden de Escribas esta siendo
                  revisada por el Archivista Mayor.
                </p>
                {applicationDate && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-void/50 border border-amber-500/20 text-amber-400/70 text-sm font-mono mb-6">
                    <Clock className="w-4 h-4" />
                    Enviada: {new Date(applicationDate).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                )}
              </>
            ) : (
              <>
                <h1 className="text-2xl font-display font-bold text-bone mb-3">
                  Archivo Restringido
                </h1>
                <p className="text-bone/60 mb-6 max-w-sm mx-auto">
                  El acceso al Archivo Lexicanum requiere autorizacion del
                  Archivista Mayor. Solicita unirte a la Orden de Escribas.
                </p>
              </>
            )}

            {/* Benefits preview */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: Feather, label: 'Crear articulos' },
                { icon: BookOpen, label: 'Editar wiki' },
                { icon: Shield, label: 'Insignia especial' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-void/30 border border-bone/5"
                >
                  <item.icon className="w-5 h-5 text-amber-400/60 mx-auto mb-1" />
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
                  <Feather className="w-5 h-5" />
                  Solicitar ser Lexicanum Scribe
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}

            {/* Browse factions link */}
            <Link
              href="/facciones"
              className="inline-flex items-center gap-2 mt-4 text-sm text-bone/40 hover:text-bone/70 transition-colors"
            >
              <Library className="w-4 h-4" />
              Explorar el Archivo publico
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
