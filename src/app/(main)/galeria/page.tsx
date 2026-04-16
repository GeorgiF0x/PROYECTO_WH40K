import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { GalleryPageClient } from './GalleryPageClient'
import type { MiniatureWithStats } from '@/components/gallery'
import { getFactions } from '@/lib/cache/factions'

export const metadata: Metadata = {
  title: 'Galerías Prismáticas de Solemnace | Grimdark Legion',
  description:
    'Explora las mejores miniaturas de Warhammer 40K pintadas por la comunidad. Galería de miniaturas del Imperium, Caos, Xenos y más.',
  openGraph: {
    title: 'Galerías Prismáticas de Solemnace',
    description: 'Colección de miniaturas de Warhammer 40K pintadas por la comunidad',
    type: 'website',
  },
}

// Revalidate every 5 minutes for fresh content
export const revalidate = 300

export default async function GalleryPage() {
  const supabase = await createClient()

  // Run the live miniature fetch and the cached faction list in parallel.
  // Factions only change a few times a year, so they come from unstable_cache.
  const [{ data: initialMiniatures }, factionTags] = await Promise.all([
    supabase
      .from('miniatures')
      .select(
        `
        *,
        profiles:user_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `
      )
      .order('created_at', { ascending: false })
      .limit(24),
    getFactions(),
  ])

  return (
    <GalleryPageClient
      initialMiniatures={(initialMiniatures || []) as MiniatureWithStats[]}
      factions={factionTags}
    />
  )
}
