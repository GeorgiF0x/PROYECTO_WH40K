import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { checkServerPermissions } from '@/lib/permissions.server'
import DashboardShell from './components/DashboardShell'

export const metadata = {
  title: 'Administratum | Forge of War',
  description: 'Terminal del Administratum Imperial',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get profile with role info
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, creator_status, creator_type, is_store_owner, username, display_name, avatar_url')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // Check permissions
  const permissions = checkServerPermissions(profile)

  if (!permissions?.hasDashboardAccess) {
    redirect('/')
  }

  return (
    <DashboardShell profile={profile} permissions={permissions}>
      {children}
    </DashboardShell>
  )
}
