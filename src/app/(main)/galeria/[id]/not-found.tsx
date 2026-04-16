import Link from 'next/link'
import { ImageOff, ArrowLeft } from 'lucide-react'

export default function MiniatureNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 pb-16 pt-24">
      <div className="text-center">
        <ImageOff className="mx-auto mb-4 h-16 w-16 text-bone/30" />
        <h2 className="mb-2 font-display text-2xl font-bold text-bone">Miniatura no encontrada</h2>
        <p className="mb-6 font-body text-bone/60">
          Esta miniatura puede haber sido eliminada o no existe.
        </p>
        <Link
          href="/galeria"
          className="inline-flex items-center gap-2 rounded-lg bg-necron-teal px-6 py-3 font-display font-bold text-void"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la galería
        </Link>
      </div>
    </div>
  )
}
