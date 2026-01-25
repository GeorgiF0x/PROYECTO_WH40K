import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserProfileClient } from './UserProfileClient'

interface PageProps {
  params: Promise<{ username: string }>
}

async function getProfile(username: string) {
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error || !profile) {
    return null
  }

  // Get counts and favorite factions in parallel
  const [followersResult, followingResult, miniaturesResult, factionsResult] = await Promise.all([
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', profile.id),
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', profile.id),
    supabase
      .from('miniatures')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id),
    profile.favorite_factions && profile.favorite_factions.length > 0
      ? supabase
          .from('tags')
          .select('id, name, slug, primary_color, secondary_color')
          .in('id', profile.favorite_factions)
      : Promise.resolve({ data: [] }),
  ])

  // Sort factions to match order in favorite_factions
  let factions: { id: string; name: string; slug: string; primary_color: string | null; secondary_color: string | null }[] = []
  if (profile.favorite_factions && factionsResult.data) {
    factions = profile.favorite_factions
      .map((id: string) => factionsResult.data?.find((f) => f.id === id))
      .filter(Boolean) as typeof factions
  }

  // Get recent miniatures for showcase
  const { data: recentMiniatures } = await supabase
    .from('miniatures')
    .select(`
      id,
      title,
      thumbnail_url,
      images,
      miniature_likes(count),
      miniature_comments(count)
    `)
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(6)

  // Check if current user is viewing own profile
  const { data: { user } } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === profile.id

  return {
    profile,
    followersCount: followersResult.count || 0,
    followingCount: followingResult.count || 0,
    miniaturesCount: miniaturesResult.count || 0,
    factions,
    recentMiniatures: (recentMiniatures || []).map((m) => ({
      ...m,
      likes_count: (m.miniature_likes as { count: number }[])?.[0]?.count || 0,
      comments_count: (m.miniature_comments as { count: number }[])?.[0]?.count || 0,
    })),
    isOwnProfile,
    currentUserId: user?.id || null,
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params
  const data = await getProfile(username)

  if (!data) {
    return { title: 'Usuario no encontrado' }
  }

  return {
    title: `${data.profile.display_name || data.profile.username} (@${data.profile.username}) | FORGE OF WAR`,
    description: data.profile.bio || `Perfil de ${data.profile.username} en FORGE OF WAR`,
  }
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params
  const data = await getProfile(username)

  if (!data) {
    notFound()
  }

  return <UserProfileClient data={data} />
}
