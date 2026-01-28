import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CreatorApplicationPageClient } from './CreatorApplicationPageClient'
import type { CreatorType } from '@/lib/types/database.types'

export const metadata: Metadata = {
  title: 'Solicitar ser Creador | Administratum',
  description: 'Únete al programa de creadores verificados del Imperium. Demuestra tu valía y recibe la bendición del Administratum.'
}

export default async function CreatorApplicationPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/comunidad/creadores/solicitar')
  }

  // Get user's creator status and profile info
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, creator_status, creator_type, creator_verified_at, creator_application_date, creator_rejection_reason')
    .eq('id', user.id)
    .single()

  const creatorStatus = profile?.creator_status || 'none'

  return (
    <CreatorApplicationPageClient
      userId={user.id}
      username={profile?.username || null}
      displayName={profile?.display_name || null}
      creatorStatus={creatorStatus}
      creatorType={profile?.creator_type as CreatorType | null}
      verifiedAt={profile?.creator_verified_at}
      applicationDate={profile?.creator_application_date}
      rejectionReason={profile?.creator_rejection_reason}
    />
  )
}
