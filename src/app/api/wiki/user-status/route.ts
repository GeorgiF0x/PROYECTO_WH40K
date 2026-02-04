import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Type for profile with wiki fields
type ProfileWithWiki = {
  wiki_role: string | null
  is_admin: boolean
  role: string
}

export async function GET() {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({
        isLoggedIn: false,
        canContribute: false,
        hasPendingApplication: false
      })
    }

    // Get user's wiki permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('wiki_role, is_admin, role')
      .eq('id', user.id)
      .single() as { data: ProfileWithWiki | null; error: unknown }

    const isAdmin = profile?.is_admin || profile?.role === 'admin' || profile?.role === 'moderator'
    const isScribe = !!profile?.wiki_role
    const canContribute = isAdmin || isScribe

    // Check for pending application if user can't contribute
    let hasPendingApplication = false
    if (!canContribute) {
      const { data: application } = await supabase
        .from('scribe_applications' as 'profiles')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .single() as { data: { id: string; status: string } | null; error: unknown }

      hasPendingApplication = !!application
    }

    return NextResponse.json({
      isLoggedIn: true,
      canContribute,
      hasPendingApplication,
      wikiRole: profile?.wiki_role || null,
      isAdmin
    })
  } catch (error) {
    console.error('Error checking user status:', error)
    return NextResponse.json({
      isLoggedIn: false,
      canContribute: false,
      hasPendingApplication: false
    })
  }
}
