import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { GalleryPageClient } from './GalleryPageClient'
import type { MiniatureWithStats } from '@/components/gallery'

export const metadata: Metadata = {
  title: 'Galerías Prismáticas de Solemnace | Grimdark Legion',
  description: 'Explora las mejores miniaturas de Warhammer 40K pintadas por la comunidad. Galería de miniaturas del Imperium, Caos, Xenos y más.',
  openGraph: {
    title: 'Galerías Prismáticas de Solemnace',
    description: 'Colección de miniaturas de Warhammer 40K pintadas por la comunidad',
    type: 'website',
  }
}

// Revalidate every 5 minutes for fresh content
export const revalidate = 300

// Faction type for initial data
type FactionTag = {
  id: string
  name: string
  slug: string
  primary_color: string | null
  secondary_color: string | null
}

export default async function GalleryPage() {
  const supabase = await createClient()

  // Fetch initial miniatures server-side for SEO
  const { data: initialMiniatures } = await supabase
    .from('miniatures')
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .limit(24)

  // Fetch faction tags for filters
  const { data: factionTags } = await supabase
    .from('tags')
    .select('id, name, slug, primary_color, secondary_color')
    .eq('category', 'faction')
    .order('name')

  return (
    <GalleryPageClient
      initialMiniatures={(initialMiniatures || []) as MiniatureWithStats[]}
      factions={(factionTags || []) as FactionTag[]}
    />
  )
}
