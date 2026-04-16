import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/types/database.types'
import { parseJsonBody, parseQueryParams } from '@/lib/validation/http'
import {
  wikiContributionPostSchema,
  wikiContributionsListQuerySchema,
} from '@/lib/validation/schemas'

// GET - List contributions (users: own, admins: all/filtered)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const parsedQuery = parseQueryParams(searchParams, wikiContributionsListQuerySchema)
    if (!parsedQuery.success) return parsedQuery.response
    const { status, page_id: pageId, limit, offset } = parsedQuery.data

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser()
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

    // Build query
    let query = supabase.from('wiki_contributions').select(
      `
        *,
        contributor:profiles!wiki_contributions_contributor_id_fkey(username, display_name),
        page:faction_wiki_pages(title, slug, faction_id),
        reviewer:profiles!wiki_contributions_reviewer_id_fkey(username, display_name)
      `,
      { count: 'exact' }
    )

    // Non-admins can only see their own contributions
    if (!isAdmin) {
      query = query.eq('contributor_id', user.id)
    }

    // Filter by status
    if (status) {
      query = query.eq('status', status)
    }

    // Filter by page
    if (pageId) {
      query = query.eq('page_id', pageId)
    }

    // Order and paginate
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Wiki contributions fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      contributions: data,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Wiki contributions GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create contribution (authenticated users)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parsed = await parseJsonBody(request, wikiContributionPostSchema)
    if (!parsed.success) return parsed.response
    const body = parsed.data

    // If editing existing page, verify it exists
    if (body.page_id) {
      const { data: page } = await supabase
        .from('faction_wiki_pages')
        .select('id')
        .eq('id', body.page_id)
        .eq('status', 'published')
        .single()

      if (!page) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 })
      }
    }

    // Create contribution
    const { data, error } = await supabase
      .from('wiki_contributions')
      .insert({
        page_id: body.page_id ?? null,
        faction_id: body.faction_id ?? null,
        suggested_title: body.suggested_title ?? null,
        content: body.content as Json,
        contributor_id: user.id,
        status: 'pending',
      })
      .select(
        `
        *,
        contributor:profiles!wiki_contributions_contributor_id_fkey(username, display_name),
        page:faction_wiki_pages(title, slug, faction_id)
      `
      )
      .single()

    if (error) {
      console.error('Wiki contribution create error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Wiki contributions POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
