import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { WikiPageCreateInput } from '@/lib/supabase/wiki.types'
import type { Json } from '@/lib/types/database.types'

// GET - List wiki pages (public: published only, admin: all)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const factionId = searchParams.get('faction_id')
    const categorySlug = searchParams.get('category')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

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

    // Build query
    let query = supabase
      .from('faction_wiki_pages')
      .select(`
        id,
        faction_id,
        category_id,
        title,
        slug,
        excerpt,
        hero_image,
        status,
        views_count,
        published_at,
        created_at,
        updated_at,
        author:profiles!faction_wiki_pages_author_id_fkey(username, display_name),
        category:wiki_categories(id, name, slug, icon)
      `, { count: 'exact' })

    // Filter by status (public only sees published unless admin)
    if (!isAdmin) {
      query = query.eq('status', 'published')
    } else if (status) {
      query = query.eq('status', status)
    }

    // Filter by faction
    if (factionId) {
      query = query.eq('faction_id', factionId)
    }

    // Filter by category
    if (categorySlug) {
      const { data: category } = await supabase
        .from('wiki_categories')
        .select('id')
        .eq('slug', categorySlug)
        .single()

      if (category) {
        query = query.eq('category_id', category.id)
      }
    }

    // Search by title
    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    // Order and paginate
    query = query
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Wiki pages fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      pages: data,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Wiki GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create wiki page (admin only)
export async function POST(request: NextRequest) {
  try {
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

    const body: WikiPageCreateInput = await request.json()

    // Validate required fields
    if (!body.faction_id || !body.title || !body.slug || !body.content) {
      return NextResponse.json(
        { error: 'faction_id, title, slug, and content are required' },
        { status: 400 }
      )
    }

    // Create the page
    const { data, error } = await supabase
      .from('faction_wiki_pages')
      .insert({
        faction_id: body.faction_id,
        category_id: body.category_id || null,
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt || null,
        content: body.content as Json,
        hero_image: body.hero_image || null,
        gallery_images: body.gallery_images || null,
        author_id: user.id,
        status: body.status || 'draft',
        published_at: body.status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (error) {
      console.error('Wiki page create error:', error)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A page with this slug already exists for this faction' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Wiki POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
