import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'

// Lazy initialization to avoid issues during build
let openai: OpenAI | null = null
let supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null

function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openai
}

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabaseAdmin
}

/**
 * Generate embedding for text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await getOpenAI().embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })

  return response.data[0].embedding
}

/**
 * Generate and store embedding for a miniature
 */
export async function generateMiniatureEmbedding(
  miniatureId: string,
  title: string,
  description: string | null
): Promise<void> {
  // Create text to embed - combine title and description
  const textToEmbed = `${title}${description ? `. ${description}` : ''}`

  const embedding = await generateEmbedding(textToEmbed)

  // Store embedding in database
  const { error } = await getSupabaseAdmin()
    .from('miniatures')
    .update({ embedding: embedding as unknown as string })
    .eq('id', miniatureId)

  if (error) {
    console.error('Error storing embedding:', error)
    throw error
  }
}

/**
 * Search miniatures by semantic similarity
 */
export async function searchMiniaturesBySimilarity(
  query: string,
  matchThreshold: number = 0.7,
  matchCount: number = 10
) {
  const queryEmbedding = await generateEmbedding(query)

  const { data, error } = await getSupabaseAdmin().rpc('search_miniatures_by_embedding', {
    query_embedding: queryEmbedding as unknown as string,
    match_threshold: matchThreshold,
    match_count: matchCount,
  })

  if (error) {
    console.error('Error searching miniatures:', error)
    throw error
  }

  return data
}

/**
 * Find miniatures similar to a given one
 */
export async function findSimilarMiniatures(
  miniatureId: string,
  matchCount: number = 5
) {
  const { data, error } = await getSupabaseAdmin().rpc('find_similar_miniatures', {
    miniature_id: miniatureId,
    match_count: matchCount,
  })

  if (error) {
    console.error('Error finding similar miniatures:', error)
    throw error
  }

  return data
}

/**
 * Batch generate embeddings for all miniatures without one
 */
export async function generateMissingEmbeddings(): Promise<number> {
  // Get miniatures without embeddings
  const { data: miniatures, error } = await getSupabaseAdmin()
    .from('miniatures')
    .select('id, title, description')
    .is('embedding', null)

  if (error) {
    console.error('Error fetching miniatures:', error)
    throw error
  }

  if (!miniatures || miniatures.length === 0) {
    return 0
  }

  let processed = 0

  for (const miniature of miniatures) {
    try {
      await generateMiniatureEmbedding(
        miniature.id,
        miniature.title,
        miniature.description
      )
      processed++

      // Rate limiting - wait 100ms between requests
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (err) {
      console.error(`Error processing miniature ${miniature.id}:`, err)
    }
  }

  return processed
}
