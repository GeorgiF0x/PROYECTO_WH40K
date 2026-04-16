import { unstable_cache } from 'next/cache'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// A stateless Supabase client for cached, auth-less queries.
// Next.js' `unstable_cache` forbids accessing dynamic data sources (including
// `cookies()`) inside the cached function. Our normal server client reads the
// cookie store on every call — so we can't use it here. Factions are public
// data anyway, so the anon key + no cookies is the correct fit.
function getPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}

export interface FactionTag {
  id: string
  name: string
  slug: string
  primary_color: string | null
  secondary_color: string | null
}

/**
 * Returns all tags of category 'faction', ordered alphabetically.
 *
 * Wrapped with `unstable_cache` so that the same payload is reused across
 * requests (and across users) — factions change at most a few times a year.
 *
 * Cache key: `factions:list`
 * Tag:       `factions` — call `revalidateTag('factions')` from any admin
 *            mutation that adds/edits/removes a faction.
 * TTL:       1 day (86400s) as a safety net in case revalidateTag is missed.
 */
export const getFactions = unstable_cache(
  async (): Promise<FactionTag[]> => {
    const supabase = getPublicClient()
    const { data, error } = await supabase
      .from('tags')
      .select('id, name, slug, primary_color, secondary_color')
      .eq('category', 'faction')
      .order('name')

    if (error) {
      console.error('[cache/factions] fetch failed:', error)
      return []
    }
    return data ?? []
  },
  ['factions:list'],
  { revalidate: 86400, tags: ['factions'] }
)

/**
 * Returns only the IDs of factions, useful for sitemap generation where the
 * other columns are not needed.
 */
export const getFactionIds = unstable_cache(
  async (): Promise<string[]> => {
    const supabase = getPublicClient()
    const { data } = await supabase.from('tags').select('id').eq('category', 'faction')
    return (data ?? []).map((row) => row.id)
  },
  ['factions:ids'],
  { revalidate: 86400, tags: ['factions'] }
)
