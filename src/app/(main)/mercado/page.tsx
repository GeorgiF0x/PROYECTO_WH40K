import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ListingGrid } from '@/components/marketplace'
import MarketplaceFilters from '@/components/marketplace/MarketplaceFilters'
import MarketplaceHero from '@/components/marketplace/MarketplaceHero'
import MarketplaceCTA from '@/components/marketplace/MarketplaceCTA'
import type { ListingWithSeller } from '@/components/marketplace'
import type { ListingCategory } from '@/lib/types/database.types'

// Listings change frequently — revalidate every minute so the CDN serves fresh
// data while still benefiting from edge caching.
export const revalidate = 60

interface SearchParams {
  sort?: string
  condition?: string
  type?: string
  category?: string
  faction?: string
  location?: string
  q?: string
  cursor?: string
  favorites?: string
}

async function getListings(searchParams: SearchParams): Promise<{
  listings: ListingWithSeller[]
  nextCursor: string | null
}> {
  const supabase = await createClient()

  const { sort = 'recent', condition, type, category, faction, location, q, cursor, favorites } = searchParams

  // Resolve the current user up-front. The auth call hits a different service
  // than the listings query, so it costs ~50ms and lets us:
  //  - short-circuit when the favorites filter is active and there's no user
  //  - embed the per-user favorites flag directly into the listings query
  //    (eliminates the separate "is favorited?" round-trip we used to do)
  const { data: { user } } = await supabase.auth.getUser()

  if (favorites === 'true' && !user) {
    return { listings: [], nextCursor: null }
  }

  let query = supabase
    .from('listings')
    .select(`
      *,
      profiles:seller_id (
        id,
        username,
        display_name,
        avatar_url
      ),
      faction:faction_id (
        id,
        name,
        slug,
        primary_color
      )${user ? `,
      user_favorite:listing_favorites!left(user_id)` : ''}
    `)
    .eq('status', 'active')

  // When logged in, the embedded relation is filtered server-side so each
  // listing only carries 0 or 1 row in user_favorite — no payload bloat.
  if (user) {
    query = query.eq('user_favorite.user_id', user.id)
  }

  // "Show me only favorites" mode — restrict the result set to listings the
  // user has favorited. Uses an inner join via the same filtered relation.
  if (favorites === 'true' && user) {
    query = query.not('user_favorite', 'is', null)
  }

  // Apply filters (type assertions needed for Supabase enum types)
  if (condition && condition !== 'all') {
    query = query.eq('condition', condition as 'nib' | 'nos' | 'assembled' | 'painted' | 'pro_painted')
  }
  if (type && type !== 'all') {
    query = query.eq('listing_type', type as 'sale' | 'trade' | 'both')
  }
  if (category && category !== 'all') {
    query = query.eq('category', category as ListingCategory)
  }
  if (faction) {
    query = query.eq('faction_id', faction)
  }
  if (location) {
    query = query.ilike('location', `%${location}%`)
  }
  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
  }

  // Cursor-based pagination
  if (cursor) {
    const [cursorDate, cursorId] = cursor.split('_')
    if (sort === 'recent') {
      query = query.or(`created_at.lt.${cursorDate},and(created_at.eq.${cursorDate},id.lt.${cursorId})`)
    } else if (sort === 'price_low') {
      query = query.or(`price.gt.${cursorDate},and(price.eq.${cursorDate},id.gt.${cursorId})`)
    } else if (sort === 'price_high') {
      query = query.or(`price.lt.${cursorDate},and(price.eq.${cursorDate},id.lt.${cursorId})`)
    }
  }

  // Sort
  switch (sort) {
    case 'recent':
      query = query.order('created_at', { ascending: false }).order('id', { ascending: false })
      break
    case 'price_low':
      query = query.order('price', { ascending: true }).order('id', { ascending: true })
      break
    case 'price_high':
      query = query.order('price', { ascending: false }).order('id', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false }).order('id', { ascending: false })
  }

  // Fetch one extra to determine if there's a next page
  query = query.limit(25)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching listings:', error)
    return { listings: [], nextCursor: null }
  }

  // Map the embedded relation to the legacy `is_favorited` flag, then drop the
  // raw relation from the payload so the rest of the app keeps using the same
  // shape. When there's no user, every listing is implicitly not favorited.
  type RawListing = ListingWithSeller & { user_favorite?: Array<{ user_id: string }> }
  const rawListings = (data || []) as unknown as RawListing[]
  const listings: ListingWithSeller[] = rawListings.map((row) => {
    const { user_favorite, ...rest } = row
    return { ...rest, is_favorited: user ? (user_favorite?.length ?? 0) > 0 : false }
  })

  const hasMore = listings.length > 24
  const returnListings = hasMore ? listings.slice(0, 24) : listings

  // Generate next cursor from last item
  let nextCursor: string | null = null
  if (hasMore && returnListings.length > 0) {
    const lastItem = returnListings[returnListings.length - 1]
    if (sort === 'recent') {
      nextCursor = `${lastItem.created_at}_${lastItem.id}`
    } else if (sort === 'price_low' || sort === 'price_high') {
      nextCursor = `${lastItem.price}_${lastItem.id}`
    }
  }

  return { listings: returnListings, nextCursor }
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { listings, nextCursor } = await getListings(params)

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero Section */}
      <MarketplaceHero />

      {/* Filters Section */}
      <section className="relative px-6 -mt-8 z-20">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<FiltersSkeleton />}>
            <MarketplaceFilters
              initialSort={params.sort}
              initialCondition={params.condition}
              initialType={params.type}
              initialCategory={params.category}
              initialFaction={params.faction}
              initialLocation={params.location}
              initialSearch={params.q}
              initialFavorites={params.favorites}
            />
          </Suspense>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="px-6 mt-12">
        <div className="max-w-7xl mx-auto">
          {/* Results count */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-bone/50 font-body">
              <span className="text-imperial-gold font-semibold">{listings.length}</span> anuncios
              encontrados
            </p>
          </div>

          {/* Grid */}
          <ListingGrid
            listings={listings}
            isLoading={false}
            emptyMessage={
              params.q
                ? `No se encontraron anuncios para "${params.q}"`
                : 'Aún no hay anuncios publicados. ¡Sé el primero en vender algo!'
            }
          />

          {/* Load More - Client Component for cursor pagination */}
          {nextCursor && (
            <LoadMoreButton cursor={nextCursor} searchParams={params as Record<string, string | undefined>} />
          )}
        </div>
      </section>

      {/* CTA Section */}
      <MarketplaceCTA />
    </div>
  )
}

function FiltersSkeleton() {
  return (
    <div className="bg-void-light/50 backdrop-blur-xl rounded-2xl border border-bone/10 p-4 md:p-6 animate-pulse">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 h-12 bg-void rounded-xl" />
        <div className="flex gap-2">
          <div className="w-24 h-12 bg-void rounded-xl" />
          <div className="w-24 h-12 bg-void rounded-xl" />
          <div className="w-24 h-12 bg-void rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// Client component for load more functionality
import LoadMoreButton from '@/components/marketplace/LoadMoreButton'
