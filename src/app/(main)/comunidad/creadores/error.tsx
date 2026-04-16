'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'

export default function CreatorsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Creators page error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="bg-blood-red/20 border-blood-red/30 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border">
          <AlertTriangle className="text-blood-red h-10 w-10" />
        </div>

        <h1 className="font-heading text-bone-100 mb-2 text-2xl font-bold">
          Error al cargar creadores
        </h1>
        <p className="text-bone-400 mb-6">
          Ha ocurrido un error al cargar el directorio de creadores. Por favor, intenta de nuevo.
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="text-void-950 inline-flex items-center justify-center gap-2 rounded-lg bg-imperial-gold px-6 py-3 font-medium transition-colors hover:bg-imperial-gold/90"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
          <Link
            href="/comunidad"
            className="border-void-600 text-bone-300 hover:border-void-500 hover:text-bone-100 inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a comunidad
          </Link>
        </div>
      </div>
    </div>
  )
}
