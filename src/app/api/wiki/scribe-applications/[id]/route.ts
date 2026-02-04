import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Type for profile with wiki fields (added by migration 20260205_wiki_scribe_system.sql)
type ProfileWithWiki = {
  wiki_role: string | null
  is_admin: boolean
  role: string
}

type ScribeApplicationRecord = {
  id: string
  user_id: string
  motivation: string
  experience: string | null
  sample_topic: string | null
  status: string
  reviewer_id: string | null
  reviewer_notes: string | null
  reviewed_at: string | null
  created_at: string
}

// PATCH - Approve or reject application
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Check if user is admin or lexicanum
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, role, wiki_role')
      .eq('id', user.id)
      .single() as { data: ProfileWithWiki | null; error: unknown }

    const isAdmin = profile?.is_admin || profile?.role === 'admin' || profile?.role === 'moderator'
    const isLexicanum = profile?.wiki_role === 'lexicanum'

    if (!isAdmin && !isLexicanum) {
      return NextResponse.json(
        { error: 'No tienes permisos para gestionar solicitudes' },
        { status: 403 }
      )
    }

    // Parse body
    const body = await request.json()
    const { action, notes } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Accion invalida. Usa "approve" o "reject"' },
        { status: 400 }
      )
    }

    // Get application
    const { data: application, error: fetchError } = await supabase
      .from('scribe_applications' as 'profiles')
      .select('*')
      .eq('id', id)
      .single() as { data: ScribeApplicationRecord | null; error: unknown }

    if (fetchError || !application) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      )
    }

    if (application.status !== 'pending') {
      return NextResponse.json(
        { error: 'Esta solicitud ya ha sido procesada' },
        { status: 400 }
      )
    }

    // Update application
    const { error: updateAppError } = await supabase
      .from('scribe_applications' as 'profiles')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewer_id: user.id,
        reviewer_notes: notes || null,
        reviewed_at: new Date().toISOString()
      } as never)
      .eq('id', id)

    if (updateAppError) {
      console.error('Error updating application:', updateAppError)
      return NextResponse.json(
        { error: 'Error al actualizar la solicitud' },
        { status: 500 }
      )
    }

    // If approved, grant scribe role
    if (action === 'approve') {
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ wiki_role: 'scribe' } as never)
        .eq('id', application.user_id)

      if (updateProfileError) {
        console.error('Error granting scribe role:', updateProfileError)
        // Rollback application status
        await supabase
          .from('scribe_applications' as 'profiles')
          .update({ status: 'pending', reviewer_id: null, reviewer_notes: null, reviewed_at: null } as never)
          .eq('id', id)

        return NextResponse.json(
          { error: 'Error al otorgar el rol de escriba' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      message: action === 'approve'
        ? 'Solicitud aprobada. El usuario ahora es Lexicanum Scribe.'
        : 'Solicitud rechazada.'
    })
  } catch (error) {
    console.error('Error in scribe application PATCH:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// GET - Get single application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Fetch application with relations
    const { data: application, error: fetchError } = await supabase
      .from('scribe_applications' as 'profiles')
      .select(`
        *,
        user:profiles!user_id(username, display_name, avatar_url),
        reviewer:profiles!reviewer_id(username, display_name)
      `)
      .eq('id', id)
      .single() as { data: (ScribeApplicationRecord & { user_id: string }) | null; error: unknown }

    if (fetchError || !application) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      )
    }

    // Check permissions - user can see their own, admins can see all
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, role, wiki_role')
      .eq('id', user.id)
      .single() as { data: ProfileWithWiki | null; error: unknown }

    const isAdmin = profile?.is_admin || profile?.role === 'admin' || profile?.role === 'moderator'
    const isLexicanum = profile?.wiki_role === 'lexicanum'
    const isOwner = application.user_id === user.id

    if (!isAdmin && !isLexicanum && !isOwner) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver esta solicitud' },
        { status: 403 }
      )
    }

    return NextResponse.json({ data: application })
  } catch (error) {
    console.error('Error in scribe application GET:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
