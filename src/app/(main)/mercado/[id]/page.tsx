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
      .select(
        `
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
      `
      )
      .eq('id', id)
      .single(),
    // Increment views in parallel (fire-and-forget, we don't need the result)
    // Type assertion needed because custom RPC functions aren't in generated types
    (supabase.rpc as Function)('increment_listing_views', { listing_id: id }),
  ])

  if (listingResult.error || !listingResult.data) {
    return null
  }

  return listingResult.data as unknown as ListingWithSeller
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
    <div className="relative min-h-screen pb-16 pt-24">
      {/* Star chart background — Rogue Trader navigation map */}
      <div
        className="pointer-events-none fixed inset-0"
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
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.04)_0%,transparent_50%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Back button */}
        <div className="mb-6">
          <Link
            href="/mercado"
            className="group inline-flex items-center gap-2 font-mono text-sm uppercase tracking-wider text-bone/40 transition-colors hover:text-imperial-gold"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
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
    <div className="relative flex min-h-screen items-center justify-center pb-16 pt-24">
      <div
        className="pointer-events-none fixed inset-0"
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
      <div className="relative text-center">
        <div className="relative mb-6 inline-block">
          <div className="absolute -inset-4 rounded-full bg-imperial-gold/5 blur-xl" />
          <div className="relative rounded-full border border-bone/10 bg-void-light/50 p-4">
            <Compass className="h-12 w-12 text-bone/20" />
          </div>
        </div>
        <h2 className="mb-2 font-display text-2xl font-bold text-bone">Manifiesto no encontrado</h2>
        <p className="mb-2 font-body text-bone/50">
          Este articulo puede haber sido retirado del comercio.
        </p>
        <p className="mb-8 font-mono text-xs uppercase tracking-wider text-bone/25">
          Registro no disponible en los archivos del Rogue Trader
        </p>
        <Link
          href="/mercado"
          className="inline-flex items-center gap-2 rounded-lg bg-imperial-gold px-6 py-3 font-display font-bold text-void transition-colors hover:bg-yellow-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al mercado
        </Link>
      </div>
    </div>
  )
}
