import { NextRequest, NextResponse } from 'next/server'
import { searchMiniaturesBySimilarity, findSimilarMiniatures } from '@/lib/services/embeddings'
import { parseQueryParams } from '@/lib/validation/http'
import { searchQuerySchema } from '@/lib/validation/schemas'

// GET - Semantic search for miniatures
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed = parseQueryParams(searchParams, searchQuerySchema)
    if (!parsed.success) return parsed.response
    const { q: query, similar_to: miniatureId, limit } = parsed.data

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
