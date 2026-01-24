import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ListingDetail from '@/components/marketplace/ListingDetail'
import { ArrowLeft, Package } from 'lucide-react'
import type { ListingWithSeller } from '@/components/marketplace'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

// Parallel fetch: listing data + increment views at the same time
async function getListingAndIncrementViews(id: string): Promise<ListingWithSeller | null> {
  const supabase = await createClient()

  // Use Promise.all for parallel operations (async-parallel best practice)
  const [listingResult] = await Promise.all([
    // Fetch listing data
    supabase
      .from('listings')
      .select(`
        *,
        profiles:seller_id (
          id,
          username,
          display_name,
          avatar_url,
          location,
          created_at
        )
      `)
      .eq('id', id)
      .single(),
    // Increment views in parallel (fire-and-forget, we don't need the result)
    supabase.rpc('increment_listing_views', { listing_id: id }),
  ])

  if (listingResult.error || !listingResult.data) {
    return null
  }

  return listingResult.data
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: listing } = await supabase
    .from('listings')
    .select('title, description, images, price')
    .eq('id', id)
    .single()

  if (!listing) {
    return {
      title: 'Anuncio no encontrado | Grimdark Legion',
    }
  }

  return {
    title: `${listing.title} - ${listing.price}€ | Mercado Grimdark Legion`,
    description: listing.description?.slice(0, 160),
    openGraph: {
      title: `${listing.title} - ${listing.price}€`,
      description: listing.description?.slice(0, 160),
      images: listing.images?.[0] ? [listing.images[0]] : undefined,
    },
  }
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params
  const listing = await getListingAndIncrementViews(id)

  if (!listing) {
    notFound()
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Back button */}
        <div className="mb-8">
          <Link
            href="/mercado"
            className="inline-flex items-center gap-2 text-bone/60 hover:text-imperial-gold transition-colors font-body"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al mercado
          </Link>
        </div>

        <ListingDetail listing={listing} />
      </div>
    </div>
  )
}

// Custom not-found component for this route
export function NotFound() {
  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <div className="text-center">
        <Package className="w-16 h-16 text-bone/30 mx-auto mb-4" />
        <h2 className="text-2xl font-display font-bold text-bone mb-2">
          Anuncio no encontrado
        </h2>
        <p className="text-bone/60 mb-6">
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
