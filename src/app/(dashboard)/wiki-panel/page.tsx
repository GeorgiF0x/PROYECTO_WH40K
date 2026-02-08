import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WikiDashboardClient } from './WikiDashboardClient'
import { WikiAccessDenied } from './WikiAccessDenied'

export const metadata = {
  title: 'Wiki Manager | Archivo Lexicanum',
  description: 'Panel de gestion de articulos del Archivo Lexicanum'
}

export default async function WikiDashboardPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/wiki-panel')
  }

  // Get user's permissions
  // Note: wiki_role field added by migration 20260205_wiki_scribe_system.sql
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, wiki_role, is_admin, role')
    .eq('id', user.id)
    .single() as { data: { username: string; display_name: string | null; wiki_role: string | null; is_admin: boolean; role: string } | null; error: unknown }

  const isAdmin = profile?.is_admin || profile?.role === 'admin' || profile?.role === 'moderator'
  const isScribe = !!profile?.wiki_role
  const hasAccess = isAdmin || isScribe

  // Check for pending application
  let pendingApplication: { id: string; status: string; created_at: string } | null = null
  if (!hasAccess) {
    // Note: scribe_applications table added by migration 20260205_wiki_scribe_system.sql
    const { data: application } = await supabase
      .from('scribe_applications' as 'profiles')
      .select('id, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single() as { data: { id: string; status: string; created_at: string } | null; error: unknown }

    pendingApplication = application
  }

  // If no access, show access denied / apply page
  if (!hasAccess) {
    return (
      <WikiAccessDenied
        hasPendingApplication={pendingApplication?.status === 'pending'}
        applicationDate={pendingApplication?.created_at}
      />
    )
  }

  return (
    <WikiDashboardClient
      isAdmin={isAdmin}
      isLexicanum={profile?.wiki_role === 'lexicanum'}
      currentUserId={user.id}
    />
  )
}
