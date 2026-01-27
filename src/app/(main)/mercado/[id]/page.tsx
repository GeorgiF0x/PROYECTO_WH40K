import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ListingDetail from '@/components/marketplace/ListingDetail'
import { ArrowLeft, Compass } from 'lucide-react'
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
        ),
        faction:faction_id (
          id,
          name,
          slug,
          primary_color
        )
      `)
      .eq('id', id)
      .single(),
    // Increment views in parallel (fire-and-forget, we don't need the result)
    // Type assertion needed because custom RPC functions aren't in generated types
    (supabase.rpc as Function)('increment_listing_views', { listing_id: id }),
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
  const supabase = await createClient()

  // Fetch listing and check favorite status in parallel
  const [listing, userResult] = await Promise.all([
    getListingAndIncrementViews(id),
    supabase.auth.getUser(),
  ])

  if (!listing) {
    notFound()
  }

  // Check if the current user has favorited this listing
  const user = userResult.data?.user
  if (user) {
    const { data: fav } = await supabase
      .from('listing_favorites')
      .select('id')
      .eq('listing_id', id)
      .eq('user_id', user.id)
      .maybeSingle()
    listing.is_favorited = !!fav
  }

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      {/* Star chart background — Rogue Trader navigation map */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle, rgba(201,162,39,0.3) 1px, transparent 1px),
            radial-gradient(circle, rgba(201,162,39,0.2) 0.5px, transparent 0.5px)
          `,
          backgroundSize: '80px 80px, 120px 100px',
          backgroundPosition: '0 0, 40px 60px',
          opacity: 0.15,
        }}
      />
      {/* Warm golden vignette overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.04)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative">
        {/* Back button */}
        <div className="mb-6">
          <Link
            href="/mercado"
            className="inline-flex items-center gap-2 text-bone/40 hover:text-imperial-gold transition-colors font-mono text-sm uppercase tracking-wider group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
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
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center relative">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle, rgba(201,162,39,0.3) 1px, transparent 1px),
            radial-gradient(circle, rgba(201,162,39,0.2) 0.5px, transparent 0.5px)
          `,
          backgroundSize: '80px 80px, 120px 100px',
          backgroundPosition: '0 0, 40px 60px',
          opacity: 0.12,
        }}
      />
      <div className="text-center relative">
        <div className="relative inline-block mb-6">
          <div className="absolute -inset-4 bg-imperial-gold/5 rounded-full blur-xl" />
          <div className="relative p-4 bg-void-light/50 rounded-full border border-bone/10">
            <Compass className="w-12 h-12 text-bone/20" />
          </div>
        </div>
        <h2 className="text-2xl font-display font-bold text-bone mb-2">
          Manifiesto no encontrado
        </h2>
        <p className="text-bone/50 mb-2 font-body">
          Este articulo puede haber sido retirado del comercio.
        </p>
        <p className="text-xs font-mono text-bone/25 mb-8 uppercase tracking-wider">
          Registro no disponible en los archivos del Rogue Trader
        </p>
        <Link
          href="/mercado"
          className="inline-flex items-center gap-2 px-6 py-3 bg-imperial-gold text-void font-display font-bold rounded-lg hover:bg-yellow-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al mercado
        </Link>
      </div>
    </div>
  )
}
