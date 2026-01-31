import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { WikiContributionReviewInput } from '@/lib/supabase/wiki.types'
import type { Json } from '@/lib/types/database.types'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Get single contribution
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    // Get contribution
    const { data, error } = await supabase
      .from('wiki_contributions')
      .select(`
        *,
        contributor:profiles!wiki_contributions_contributor_id_fkey(username, display_name),
        page:faction_wiki_pages(id, title, slug, faction_id, content, excerpt),
        reviewer:profiles!wiki_contributions_reviewer_id_fkey(username, display_name)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Contribution not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Check access (admin or contributor)
    if (!isAdmin && data.contributor_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Wiki contribution GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Review contribution (admin only)
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

    const body: WikiContributionReviewInput = await request.json()

    // Validate status
    if (!body.status || !['approved', 'rejected'].includes(body.status)) {
      return NextResponse.json(
        { error: 'status must be "approved" or "rejected"' },
        { status: 400 }
      )
    }

    // Get the contribution
    const { data: contribution, error: fetchError } = await supabase
      .from('wiki_contributions')
      .select('*, page:faction_wiki_pages(id, content)')
      .eq('id', id)
      .eq('status', 'pending')
      .single()

    if (fetchError || !contribution) {
      return NextResponse.json(
        { error: 'Contribution not found or already reviewed' },
        { status: 404 }
      )
    }

    // If approved, apply the changes
    if (body.status === 'approved') {
      if (contribution.page_id) {
        // Edit existing page
        const page = contribution.page as { id: string; content: unknown }

        // Save current content as revision
        await supabase.from('wiki_revisions').insert({
          page_id: page.id,
          content: page.content as Json,
          author_id: user.id,
          change_summary: `Contribution approved from ${contribution.contributor_id}`,
        })

        // Update page with new content
        await supabase
          .from('faction_wiki_pages')
          .update({
            content: contribution.content as Json,
            updated_at: new Date().toISOString(),
          })
          .eq('id', page.id)
      } else {
        // Create new page from contribution
        const slug = contribution.suggested_title
          ?.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')

        await supabase.from('faction_wiki_pages').insert({
          faction_id: contribution.faction_id!,
          title: contribution.suggested_title!,
          slug: slug!,
          content: contribution.content as Json,
          author_id: contribution.contributor_id,
          status: 'published',
          published_at: new Date().toISOString(),
        })
      }
    }

    // Update contribution status
    const { data, error } = await supabase
      .from('wiki_contributions')
      .update({
        status: body.status,
        reviewer_id: user.id,
        reviewer_notes: body.reviewer_notes || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        contributor:profiles!wiki_contributions_contributor_id_fkey(username, display_name),
        page:faction_wiki_pages(title, slug, faction_id),
        reviewer:profiles!wiki_contributions_reviewer_id_fkey(username, display_name)
      `)
      .single()

    if (error) {
      console.error('Wiki contribution update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Wiki contribution PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
