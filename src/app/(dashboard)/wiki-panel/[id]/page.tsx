import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditWikiArticleClient from './EditWikiArticleClient'

export const metadata = {
  title: 'Editar Articulo | Archivo Lexicanum',
  description: 'Editor de articulos del Archivo Lexicanum',
}

export default async function EditWikiArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?redirect=/wiki-panel')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('wiki_role, is_admin, role')
    .eq('id', user.id)
    .single() as { data: { wiki_role: string | null; is_admin: boolean; role: string } | null; error: unknown }

  const isAdmin = !!profile && (profile.is_admin || profile.role === 'admin' || profile.role === 'moderator')
  const isLexicanum = profile?.wiki_role === 'lexicanum'
  const hasAccess = isAdmin || !!profile?.wiki_role

  if (!hasAccess) {
    redirect('/wiki-panel')
  }

  return (
    <EditWikiArticleClient
      pageId={id}
      currentUserId={user.id}
      isAdmin={isAdmin}
      isLexicanum={isLexicanum}
    />
  )
}
