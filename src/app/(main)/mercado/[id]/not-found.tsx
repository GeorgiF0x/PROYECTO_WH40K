import Link from 'next/link'
import { Package, ArrowLeft } from 'lucide-react'

export default function ListingNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 pb-16 pt-24">
      <div className="text-center">
        <Package className="mx-auto mb-4 h-16 w-16 text-bone/30" />
        <h2 className="mb-2 font-display text-2xl font-bold text-bone">Anuncio no encontrado</h2>
        <p className="mb-6 font-body text-bone/60">
          Este anuncio puede haber sido eliminado o no existe.
        </p>
        <Link
          href="/mercado"
          className="inline-flex items-center gap-2 rounded-lg bg-imperial-gold px-6 py-3 font-display font-bold text-void"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al mercado
        </Link>
      </div>
    </div>
  )
}
