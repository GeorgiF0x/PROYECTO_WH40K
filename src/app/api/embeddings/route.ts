import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateMiniatureEmbedding, generateMissingEmbeddings } from '@/lib/services/embeddings'

// POST - Generate embedding for a specific miniature
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { miniatureId } = await request.json()

    if (!miniatureId) {
      return NextResponse.json({ error: 'miniatureId is required' }, { status: 400 })
    }

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
    // This should be protected by admin auth in production
    const authHeader = request.headers.get('authorization')
    const expectedKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const processed = await generateMissingEmbeddings()

    return NextResponse.json({ success: true, processed })
  } catch (error) {
    console.error('Error generating embeddings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
