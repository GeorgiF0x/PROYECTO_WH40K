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
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blood/20 border border-blood/30 mb-6">
          <AlertTriangle className="w-8 h-8 text-blood" />
        </div>

        <h1 className="text-2xl font-display font-bold text-bone mb-4">
          Error al cargar la galería
        </h1>

        <p className="text-bone/60 font-body mb-8">
          Ha ocurrido un error inesperado al cargar las miniaturas. Por favor,
          inténtalo de nuevo.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-necron-teal text-void font-display font-bold rounded-lg hover:bg-necron-teal/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-void-light border border-bone/10 text-bone font-body rounded-lg hover:border-bone/30 transition-colors"
          >
            <Home className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-xs text-bone/30 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
