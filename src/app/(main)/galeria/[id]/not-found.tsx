import Link from 'next/link'
import { ImageOff, ArrowLeft } from 'lucide-react'

export default function MiniatureNotFound() {
  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-6">
      <div className="text-center">
        <ImageOff className="w-16 h-16 text-bone/30 mx-auto mb-4" />
        <h2 className="text-2xl font-display font-bold text-bone mb-2">
          Miniatura no encontrada
        </h2>
        <p className="text-bone/60 font-body mb-6">
          Esta miniatura puede haber sido eliminada o no existe.
        </p>
        <Link
          href="/galeria"
          className="inline-flex items-center gap-2 px-6 py-3 bg-imperial-gold text-void font-display font-bold rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la galería
        </Link>
      </div>
    </div>
  )
}
