import Link from 'next/link'
import { Package, ArrowLeft } from 'lucide-react'

export default function ListingNotFound() {
  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-6">
      <div className="text-center">
        <Package className="w-16 h-16 text-bone/30 mx-auto mb-4" />
        <h2 className="text-2xl font-display font-bold text-bone mb-2">
          Anuncio no encontrado
        </h2>
        <p className="text-bone/60 font-body mb-6">
          Este anuncio puede haber sido eliminado o no existe.
        </p>
        <Link
          href="/mercado"
          className="inline-flex items-center gap-2 px-6 py-3 bg-imperial-gold text-void font-display font-bold rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al mercado
        </Link>
      </div>
    </div>
  )
}
