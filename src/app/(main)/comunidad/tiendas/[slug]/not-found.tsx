import Link from 'next/link'
import { MapPin, ArrowLeft, Compass } from 'lucide-react'

export default function StoreNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 pb-16 pt-24">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full border border-imperial-gold/20 bg-imperial-gold/10">
          <Compass className="h-10 w-10 text-imperial-gold/50" />
        </div>

        <h1 className="mb-2 font-display text-3xl font-bold text-bone">
          Coordenadas no encontradas
        </h1>

        <p className="mb-2 font-body text-bone/60">
          Esta tienda no existe en nuestro registro cartografico o aun no ha sido aprobada.
        </p>

        <p className="mb-8 font-body text-sm italic text-bone/40">
          &ldquo;El Imperium es vasto, y no todos sus puertos aparecen en los mapas
          estelares.&rdquo;
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/comunidad/tiendas"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-imperial-gold px-6 py-3 font-display font-bold text-void transition-colors hover:bg-imperial-gold/90"
          >
            <MapPin className="h-4 w-4" />
            Ver tiendas
          </Link>
          <Link
            href="/comunidad"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-bone/10 bg-void-light px-6 py-3 font-body text-bone transition-colors hover:border-bone/30"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a comunidad
          </Link>
        </div>
      </div>
    </div>
  )
}
