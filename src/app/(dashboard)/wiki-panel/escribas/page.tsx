import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ScribeApplicationsClient } from './ScribeApplicationsClient'

export const metadata = {
  title: 'Solicitudes de Escribas | Archivo Lexicanum',
  description: 'Gestiona las solicitudes para unirse a la Orden de Escribas'
}

export default async function ScribeApplicationsPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/wiki-panel/escribas')
  }

  // Get user's permissions
  // Note: wiki_role field added by migration 20260205_wiki_scribe_system.sql
  const { data: profile } = await supabase
    .from('profiles')
    .select('wiki_role, is_admin, role')
    .eq('id', user.id)
    .single() as { data: { wiki_role: string | null; is_admin: boolean; role: string } | null; error: unknown }

  const isAdmin = profile?.is_admin || profile?.role === 'admin' || profile?.role === 'moderator'
  const isLexicanum = profile?.wiki_role === 'lexicanum'

  if (!isAdmin && !isLexicanum) {
    redirect('/wiki-panel')
  }

  return <ScribeApplicationsClient />
}
