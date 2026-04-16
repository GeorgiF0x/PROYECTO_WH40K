import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getFactionIds } from '@/lib/cache/factions'

const BASE_URL = 'https://grimdarklegion.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    {
      url: `${BASE_URL}/galeria`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/facciones`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    { url: `${BASE_URL}/wiki`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    {
      url: `${BASE_URL}/comunidad`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/comunidad/tiendas`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/comunidad/creadores`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/comunidad/eventos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/mercado`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/usuarios`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    { url: `${BASE_URL}/login`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/register`, changeFrequency: 'monthly', priority: 0.3 },
  ]

  // Dynamic: factions (cached — rarely change, no point hammering Supabase
  // on every sitemap regeneration).
  const factionIds = await getFactionIds()
  const factionRoutes: MetadataRoute.Sitemap = factionIds.map((id) => ({
    url: `${BASE_URL}/facciones/${id}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Dynamic: published wiki articles
  const { data: wikiPages } = await supabase
    .from('faction_wiki_pages')
    .select('slug, faction_id, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(500)

  const wikiRoutes: MetadataRoute.Sitemap = (wikiPages ?? []).map((w) => ({
    url: `${BASE_URL}/wiki/${w.faction_id}/${w.slug}`,
    lastModified: w.published_at ? new Date(w.published_at) : undefined,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Dynamic: approved stores
  const { data: stores } = await supabase
    .from('stores')
    .select('slug')
    .eq('status', 'approved')
    .limit(500)

  const storeRoutes: MetadataRoute.Sitemap = (stores ?? []).map((s) => ({
    url: `${BASE_URL}/comunidad/tiendas/${s.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  // Dynamic: active events (upcoming or ongoing)
  const { data: events } = await supabase
    .from('events')
    .select('slug')
    .in('status', ['upcoming', 'ongoing'])
    .limit(500)

  const eventRoutes: MetadataRoute.Sitemap = (events ?? []).map((e) => ({
    url: `${BASE_URL}/comunidad/eventos/${e.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  return [...staticRoutes, ...factionRoutes, ...wikiRoutes, ...storeRoutes, ...eventRoutes]
}
