import { NextRequest, NextResponse } from 'next/server'
import { searchMiniaturesBySimilarity, findSimilarMiniatures } from '@/lib/services/embeddings'

// GET - Semantic search for miniatures
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const miniatureId = searchParams.get('similar_to')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query && !miniatureId) {
      return NextResponse.json(
        { error: 'Either "q" (search query) or "similar_to" (miniature ID) is required' },
        { status: 400 }
      )
    }

    let results

    if (miniatureId) {
      // Find similar miniatures
      results = await findSimilarMiniatures(miniatureId, limit)
    } else if (query) {
      // Semantic search
      results = await searchMiniaturesBySimilarity(query, 0.5, limit)
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
