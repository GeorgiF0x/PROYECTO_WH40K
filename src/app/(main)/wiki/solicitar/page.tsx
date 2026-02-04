import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ScribeApplicationPageClient } from './ScribeApplicationPageClient'
import type { WikiRole, ScribeApplication } from '@/lib/supabase/wiki.types'

export const metadata: Metadata = {
  title: 'Solicitar ser Lexicanum Scribe | Archivo Imperial',
  description: 'Solicita unirte a la Orden de Escribas del Lexicanum. Contribuye al conocimiento del Imperium documentando el lore de Warhammer 40K.'
}

export default async function ScribeApplicationPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/wiki/solicitar')
  }

  // Get user's wiki role and check for pending applications
  // Note: wiki_role field added by migration 20260205_wiki_scribe_system.sql
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, wiki_role, is_admin, role')
    .eq('id', user.id)
    .single() as { data: { username: string; display_name: string | null; wiki_role: string | null; is_admin: boolean; role: string } | null; error: unknown }

  // Get existing application if any
  // Note: scribe_applications table added by migration 20260205_wiki_scribe_system.sql
  const { data: application } = await supabase
    .from('scribe_applications' as 'profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single() as { data: ScribeApplication | null; error: unknown }

  const wikiRole = (profile?.wiki_role || null) as WikiRole | null
  const isAdmin = profile?.is_admin || profile?.role === 'admin' || profile?.role === 'moderator'

  return (
    <ScribeApplicationPageClient
      userId={user.id}
      username={profile?.username || null}
      displayName={profile?.display_name || null}
      wikiRole={wikiRole}
      isAdmin={isAdmin}
      application={application}
    />
  )
}
