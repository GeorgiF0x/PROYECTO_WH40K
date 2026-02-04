import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Type for profile with wiki fields (added by migration 20260205_wiki_scribe_system.sql)
type ProfileWithWiki = {
  wiki_role: string | null
  is_admin: boolean
  role: string
}

// POST - Create new scribe application
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Check if user already has wiki role
    const { data: profile } = await supabase
      .from('profiles')
      .select('wiki_role, is_admin, role')
      .eq('id', user.id)
      .single() as { data: ProfileWithWiki | null; error: unknown }

    if (profile?.wiki_role || profile?.is_admin || profile?.role === 'admin' || profile?.role === 'moderator') {
      return NextResponse.json(
        { error: 'Ya tienes permisos para editar la wiki' },
        { status: 400 }
      )
    }

    // Check for pending application
    // Note: scribe_applications table added by migration 20260205_wiki_scribe_system.sql
    const { data: existingApp } = await supabase
      .from('scribe_applications' as 'profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single() as { data: { id: string } | null; error: unknown }

    if (existingApp) {
      return NextResponse.json(
        { error: 'Ya tienes una solicitud pendiente' },
        { status: 400 }
      )
    }

    // Parse body
    const body = await request.json()
    const { motivation, experience, sample_topic } = body

    if (!motivation || motivation.trim().length < 50) {
      return NextResponse.json(
        { error: 'La motivacion debe tener al menos 50 caracteres' },
        { status: 400 }
      )
    }

    // Create application
    const { error: insertError } = await supabase
      .from('scribe_applications' as 'profiles')
      .insert({
        user_id: user.id,
        motivation: motivation.trim(),
        experience: experience?.trim() || null,
        sample_topic: sample_topic?.trim() || null,
        status: 'pending'
      } as never)

    if (insertError) {
      console.error('Error creating scribe application:', insertError)
      return NextResponse.json(
        { error: 'Error al crear la solicitud' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Error in scribe application POST:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// GET - List scribe applications (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, role, wiki_role')
      .eq('id', user.id)
      .single() as { data: ProfileWithWiki | null; error: unknown }

    const isAdmin = profile?.is_admin || profile?.role === 'admin' || profile?.role === 'moderator'
    const isLexicanum = profile?.wiki_role === 'lexicanum'

    if (!isAdmin && !isLexicanum) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver las solicitudes' },
        { status: 403 }
      )
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'

    // Fetch applications with user info
    const { data: applications, error: fetchError } = await supabase
      .from('scribe_applications' as 'profiles')
      .select(`
        *,
        user:profiles!user_id(username, display_name, avatar_url),
        reviewer:profiles!reviewer_id(username, display_name)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false }) as { data: unknown[] | null; error: unknown }

    if (fetchError) {
      console.error('Error fetching scribe applications:', fetchError)
      return NextResponse.json(
        { error: 'Error al obtener las solicitudes' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: applications })
  } catch (error) {
    console.error('Error in scribe application GET:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
