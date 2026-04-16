import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateMiniatureEmbedding, generateMissingEmbeddings } from '@/lib/services/embeddings'
import { parseJsonBody } from '@/lib/validation/http'
import { embeddingsPostSchema } from '@/lib/validation/schemas'

// POST - Generate embedding for a specific miniature
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parsed = await parseJsonBody(request, embeddingsPostSchema)
    if (!parsed.success) return parsed.response
    const { miniatureId } = parsed.data

    // Get miniature data
    const { data: miniature, error: miniatureError } = await supabase
      .from('miniatures')
      .select('id, title, description, user_id')
      .eq('id', miniatureId)
      .single()

    if (miniatureError || !miniature) {
      return NextResponse.json({ error: 'Miniature not found' }, { status: 404 })
    }

    // Check ownership
    if (miniature.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Generate embedding
    await generateMiniatureEmbedding(miniature.id, miniature.title, miniature.description)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error generating embedding:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Batch generate missing embeddings (admin only)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, role')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const processed = await generateMissingEmbeddings()

    return NextResponse.json({ success: true, processed })
  } catch (error) {
    console.error('Error generating embeddings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
