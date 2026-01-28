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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blood-red/20 border border-blood-red/30 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-blood-red" />
        </div>

        <h1 className="text-2xl font-heading font-bold text-bone-100 mb-2">
          Error al cargar creadores
        </h1>
        <p className="text-bone-400 mb-6">
          Ha ocurrido un error al cargar el directorio de creadores.
          Por favor, intenta de nuevo.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-imperial-gold text-void-950 font-medium hover:bg-imperial-gold/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
          <Link
            href="/comunidad"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-void-600 text-bone-300 hover:border-void-500 hover:text-bone-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a comunidad
          </Link>
        </div>
      </div>
    </div>
  )
}
