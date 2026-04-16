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
    <div className="flex min-h-screen items-center justify-center bg-void p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-blood/30 bg-blood/20">
          <AlertTriangle className="h-8 w-8 text-blood" />
        </div>

        <h1 className="mb-4 font-display text-2xl font-bold text-bone">Error de Autenticación</h1>

        <p className="mb-4 font-body text-bone/60">
          Hubo un problema al iniciar sesión. Esto puede ocurrir si el enlace ha expirado o si hubo
          un error con el proveedor de autenticación.
        </p>

        {(error || errorCode) && (
          <div className="mb-6 rounded-lg border border-blood/30 bg-blood/10 p-4 text-left">
            <p className="font-mono text-xs text-bone/50">
              {errorCode && <span className="block">Code: {errorCode}</span>}
              {error && <span className="block">Error: {error}</span>}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link href="/login">
            <motion.button
              className="w-full rounded-lg bg-imperial-gold px-6 py-3 font-display font-bold text-void"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Intentar de nuevo
            </motion.button>
          </Link>

          <Link href="/">
            <motion.button
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-bone/10 bg-void-light px-6 py-3 font-body text-bone"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="h-4 w-4" />
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
