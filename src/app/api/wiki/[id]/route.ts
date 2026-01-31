import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { WikiPageUpdateInput } from '@/lib/supabase/wiki.types'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Get single wiki page
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    let isAdmin = false
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, role')
        .eq('id', user.id)
        .single()
      isAdmin = profile?.is_admin || ['admin', 'moderator'].includes(profile?.role || '')
    }

    // Build query - can search by ID or by faction_id/slug combo
    let query = supabase
      .from('faction_wiki_pages')
      .select(`
        *,
        author:profiles!faction_wiki_pages_author_id_fkey(username, display_name),
        category:wiki_categories(id, name, slug, icon)
      `)

    // Check if it's a UUID or a slug path (faction_id/slug)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    if (isUUID) {
      query = query.eq('id', id)
    } else {
      // Assume format: faction_id--slug
      const [factionId, slug] = id.split('--')
      if (factionId && slug) {
        query = query.eq('faction_id', factionId).eq('slug', slug)
      } else {
        return NextResponse.json({ error: 'Invalid page identifier' }, { status: 400 })
      }
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Check access for non-published pages
    if (data.status !== 'published' && !isAdmin) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    // Increment view count (fire and forget)
    if (data.status === 'published') {
      supabase.rpc('increment_wiki_page_views', { page_uuid: data.id })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Wiki GET [id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update wiki page (admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin status
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.is_admin || ['admin', 'moderator'].includes(profile?.role || '')
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body: WikiPageUpdateInput = await request.json()

    // Get existing page first
    const { data: existingPage, error: fetchError } = await supabase
      .from('faction_wiki_pages')
      .select('id, content, status')
      .eq('id', id)
      .single()

    if (fetchError || !existingPage) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    // Create a revision if content is changing
    if (body.content && JSON.stringify(body.content) !== JSON.stringify(existingPage.content)) {
      await supabase.from('wiki_revisions').insert({
        page_id: existingPage.id,
        content: existingPage.content,
        author_id: user.id,
        change_summary: body.status === 'published' ? 'Published update' : 'Draft update',
      })
    }

    // Build update object
    const updateData: Record<string, unknown> = {}
    if (body.category_id !== undefined) updateData.category_id = body.category_id
    if (body.title !== undefined) updateData.title = body.title
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt
    if (body.content !== undefined) updateData.content = body.content
    if (body.hero_image !== undefined) updateData.hero_image = body.hero_image
    if (body.gallery_images !== undefined) updateData.gallery_images = body.gallery_images
    if (body.status !== undefined) {
      updateData.status = body.status
      // Set published_at when first published
      if (body.status === 'published' && existingPage.status !== 'published') {
        updateData.published_at = new Date().toISOString()
      }
    }

    const { data, error } = await supabase
      .from('faction_wiki_pages')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        author:profiles!faction_wiki_pages_author_id_fkey(username, display_name),
        category:wiki_categories(id, name, slug, icon)
      `)
      .single()

    if (error) {
      console.error('Wiki page update error:', error)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A page with this slug already exists for this faction' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Wiki PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete wiki page (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin status
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.is_admin || ['admin', 'moderator'].includes(profile?.role || '')
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('faction_wiki_pages')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Wiki page delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Wiki DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
