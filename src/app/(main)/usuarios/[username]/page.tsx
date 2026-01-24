import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileHeader } from '@/components/user'

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

  // Get counts
  const [followersResult, followingResult, miniaturesResult] = await Promise.all([
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
  ])

  // Check if current user is viewing own profile
  const { data: { user } } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === profile.id

  return {
    profile,
    followersCount: followersResult.count || 0,
    followingCount: followingResult.count || 0,
    miniaturesCount: miniaturesResult.count || 0,
    isOwnProfile,
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ProfileHeader
        profile={data.profile}
        followersCount={data.followersCount}
        followingCount={data.followingCount}
        miniaturesCount={data.miniaturesCount}
        isOwnProfile={data.isOwnProfile}
      />

      {/* Tabs for content */}
      <div className="mt-8">
        <div className="flex gap-4 border-b border-bone/10">
          <button className="px-4 py-2 text-gold border-b-2 border-gold font-medium">
            Miniaturas
          </button>
          <button className="px-4 py-2 text-bone/60 hover:text-bone transition-colors">
            Likes
          </button>
        </div>

        {/* Content Area */}
        <div className="py-8">
          {data.miniaturesCount === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bone/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-bone/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-bone mb-2">Sin miniaturas</h3>
              <p className="text-bone/60">
                {data.isOwnProfile
                  ? 'Todavía no has compartido ninguna miniatura.'
                  : 'Este usuario aún no ha compartido miniaturas.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* TODO: Load and display miniatures */}
              <p className="col-span-full text-center text-bone/60">
                Cargando miniaturas...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
