'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function GaleriaError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Gallery error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center px-6 pb-16 pt-24">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-blood/30 bg-blood/20">
          <AlertTriangle className="h-8 w-8 text-blood" />
        </div>

        <h1 className="mb-4 font-display text-2xl font-bold text-bone">
          Error al cargar la galería
        </h1>

        <p className="mb-8 font-body text-bone/60">
          Ha ocurrido un error inesperado al cargar las miniaturas. Por favor, inténtalo de nuevo.
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-necron-teal px-6 py-3 font-display font-bold text-void transition-colors hover:bg-necron-teal/90"
          >
            <RefreshCw className="h-4 w-4" />
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-bone/10 bg-void-light px-6 py-3 font-body text-bone transition-colors hover:border-bone/30"
          >
            <Home className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 font-mono text-xs text-bone/30">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  )
}
