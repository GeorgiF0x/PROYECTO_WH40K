// =============================================================================
// WIKI TYPES
// =============================================================================

export type WikiRole = 'scribe' | 'lexicanum'

export interface ScribeApplication {
  id: string
  user_id: string
  motivation: string
  experience: string | null
  sample_topic: string | null
  status: 'pending' | 'approved' | 'rejected'
  reviewer_id: string | null
  reviewer_notes: string | null
  reviewed_at: string | null
  created_at: string
  // Joined relations
  user?: { username: string; display_name: string | null; avatar_url: string | null }
  reviewer?: { username: string; display_name: string | null } | null
}

export interface ScribeApplicationInput {
  motivation: string
  experience?: string
  sample_topic?: string
}

export interface WikiCategory {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  sort_order: number
  created_at: string
}

export interface WikiPage {
  id: string
  faction_id: string
  category_id: string | null
  title: string
  slug: string
  excerpt: string | null
  content: TiptapContent
  hero_image: string | null
  gallery_images: string[] | null
  author_id: string | null
  status: 'draft' | 'published' | 'archived'
  views_count: number
  published_at: string | null
  created_at: string
  updated_at: string
  // Joined relations
  category?: WikiCategory | null
  author?: { username: string; display_name: string | null } | null
}

export interface WikiRevision {
  id: string
  page_id: string
  content: TiptapContent
  author_id: string | null
  change_summary: string | null
  created_at: string
  // Joined relations
  author?: { username: string; display_name: string | null } | null
}

export interface WikiContribution {
  id: string
  page_id: string | null
  faction_id: string | null
  suggested_title: string | null
  content: TiptapContent
  contributor_id: string
  status: 'pending' | 'approved' | 'rejected'
  reviewer_id: string | null
  reviewer_notes: string | null
  created_at: string
  reviewed_at: string | null
  // Joined relations
  contributor?: { username: string; display_name: string | null } | null
  page?: { title: string; slug: string; faction_id: string } | null
  reviewer?: { username: string; display_name: string | null } | null
}

// =============================================================================
// TIPTAP CONTENT TYPES
// =============================================================================

// Index signature makes these compatible with Supabase's Json type
export interface TiptapContent {
  type: 'doc'
  content: TiptapNode[]
  [key: string]: unknown
}

export interface TiptapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  text?: string
  marks?: TiptapMark[]
  [key: string]: unknown
}

export interface TiptapMark {
  type: string
  attrs?: Record<string, unknown>
  [key: string]: unknown
}

// =============================================================================
// API TYPES
// =============================================================================

export interface WikiPageListParams {
  faction_id?: string
  category_slug?: string
  status?: 'draft' | 'published' | 'archived'
  search?: string
  limit?: number
  offset?: number
}

export interface WikiPageCreateInput {
  faction_id: string
  category_id?: string
  title: string
  slug: string
  excerpt?: string
  content: TiptapContent
  hero_image?: string
  gallery_images?: string[]
  status?: 'draft' | 'published'
}

export interface WikiPageUpdateInput {
  category_id?: string
  title?: string
  slug?: string
  excerpt?: string
  content?: TiptapContent
  hero_image?: string
  gallery_images?: string[]
  status?: 'draft' | 'published' | 'archived'
}

export interface WikiContributionCreateInput {
  page_id?: string
  faction_id?: string
  suggested_title?: string
  content: TiptapContent
}

export interface WikiContributionReviewInput {
  status: 'approved' | 'rejected'
  reviewer_notes?: string
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type WikiPageWithRelations = WikiPage & {
  category: WikiCategory | null
  author: { username: string; display_name: string | null } | null
}

export type WikiContributionWithRelations = WikiContribution & {
  contributor: { username: string; display_name: string | null }
  page: { title: string; slug: string; faction_id: string } | null
  reviewer: { username: string; display_name: string | null } | null
}

// =============================================================================
// EMPTY CONTENT HELPER
// =============================================================================

export const EMPTY_TIPTAP_CONTENT: TiptapContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: []
    }
  ]
}
