'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const errorCode = searchParams.get('code')

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blood/20 border border-blood/30 mb-6">
          <AlertTriangle className="w-8 h-8 text-blood" />
        </div>

        <h1 className="text-2xl font-display font-bold text-bone mb-4">
          Error de Autenticación
        </h1>

        <p className="text-bone/60 font-body mb-4">
          Hubo un problema al iniciar sesión. Esto puede ocurrir si el enlace ha expirado
          o si hubo un error con el proveedor de autenticación.
        </p>

        {(error || errorCode) && (
          <div className="mb-6 p-4 bg-blood/10 border border-blood/30 rounded-lg text-left">
            <p className="text-xs text-bone/50 font-mono">
              {errorCode && <span className="block">Code: {errorCode}</span>}
              {error && <span className="block">Error: {error}</span>}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link href="/login">
            <motion.button
              className="w-full px-6 py-3 bg-imperial-gold text-void font-display font-bold rounded-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Intentar de nuevo
            </motion.button>
          </Link>

          <Link href="/">
            <motion.button
              className="w-full px-6 py-3 bg-void-light border border-bone/10 text-bone font-body rounded-lg flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default function AuthCodeErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-void" />}>
      <ErrorContent />
    </Suspense>
  )
}
