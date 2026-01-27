import Link from 'next/link'
import { MapPin, ArrowLeft, Compass } from 'lucide-react'

export default function StoreNotFound() {
  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-imperial-gold/10 border border-imperial-gold/20 mb-6">
          <Compass className="w-10 h-10 text-imperial-gold/50" />
        </div>

        <h1 className="text-3xl font-display font-bold text-bone mb-2">
          Coordenadas no encontradas
        </h1>

        <p className="text-bone/60 font-body mb-2">
          Esta tienda no existe en nuestro registro cartografico o aun no ha sido aprobada.
        </p>

        <p className="text-sm text-bone/40 font-body italic mb-8">
          &ldquo;El Imperium es vasto, y no todos sus puertos aparecen en los mapas estelares.&rdquo;
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/comunidad/tiendas"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-imperial-gold text-void font-display font-bold rounded-lg hover:bg-imperial-gold/90 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Ver tiendas
          </Link>
          <Link
            href="/comunidad"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-void-light border border-bone/10 text-bone font-body rounded-lg hover:border-bone/30 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a comunidad
          </Link>
        </div>
      </div>
    </div>
  )
}
