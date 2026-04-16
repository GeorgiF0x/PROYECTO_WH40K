import { z } from 'zod'

// ── Reusable primitives ─────────────────────────────────────────

export const uuidSchema = z.uuid('must be a valid UUID')

const slugSchema = z
  .string()
  .min(1)
  .max(150)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be lowercase kebab-case')

const urlSchema = z.string().url().max(2048)

// BlockNote / Tiptap document — arbitrary JSON. We don't try to schema this
// because the editor format evolves; trust the editor and rely on storage
// limits / RLS for the rest.
const richContentSchema: z.ZodType<unknown> = z.unknown()

// ── /api/embeddings ────────────────────────────────────────────

export const embeddingsPostSchema = z.object({
  miniatureId: uuidSchema,
})

// ── /api/search ────────────────────────────────────────────────

export const searchQuerySchema = z
  .object({
    q: z.string().trim().min(1).max(200).optional(),
    similar_to: uuidSchema.optional(),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  })
  .refine((v) => v.q || v.similar_to, {
    message: 'either "q" or "similar_to" is required',
  })

// ── /api/verify-turnstile ─────────────────────────────────────

export const turnstileVerifySchema = z.object({
  token: z.string().min(1).max(2048),
})

// ── /api/wiki (GET query) ──────────────────────────────────────

export const wikiListQuerySchema = z.object({
  faction_id: uuidSchema.optional(),
  category: slugSchema.optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  search: z.string().trim().min(1).max(200).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

// ── /api/wiki (POST body) ──────────────────────────────────────

export const wikiPagePostSchema = z.object({
  faction_id: uuidSchema,
  category_id: uuidSchema.nullable().optional(),
  title: z.string().trim().min(1).max(200),
  slug: slugSchema,
  excerpt: z.string().max(500).nullable().optional(),
  content: richContentSchema,
  hero_image: urlSchema.nullable().optional(),
  gallery_images: z.array(urlSchema).max(50).nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
})

// ── /api/wiki/[id] (PUT body) ──────────────────────────────────

export const wikiPagePutSchema = z
  .object({
    category_id: uuidSchema.nullable(),
    title: z.string().trim().min(1).max(200),
    slug: slugSchema,
    excerpt: z.string().max(500).nullable(),
    content: richContentSchema,
    hero_image: urlSchema.nullable(),
    gallery_images: z.array(urlSchema).max(50).nullable(),
    status: z.enum(['draft', 'published', 'archived']),
  })
  .partial()

// ── /api/wiki/contributions (GET query) ────────────────────────

export const wikiContributionsListQuerySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  page_id: uuidSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

// ── /api/wiki/contributions (POST body) ────────────────────────

export const wikiContributionPostSchema = z
  .object({
    page_id: uuidSchema.optional(),
    faction_id: uuidSchema.optional(),
    suggested_title: z.string().trim().min(1).max(200).optional(),
    content: richContentSchema,
  })
  .refine((v) => v.page_id || (v.faction_id && v.suggested_title), {
    message: 'either page_id or (faction_id + suggested_title) is required',
  })

// ── /api/wiki/contributions/[id] (PUT body) ────────────────────

export const wikiContributionReviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reviewer_notes: z.string().max(2000).optional(),
})

// ── /api/wiki/scribe-applications (POST body) ──────────────────

export const scribeApplicationPostSchema = z.object({
  motivation: z.string().trim().min(50, 'motivation must be at least 50 chars').max(2000),
  experience: z.string().trim().max(2000).optional(),
  sample_topic: z.string().trim().max(500).optional(),
})

// ── /api/wiki/scribe-applications/[id] (PATCH body) ────────────

export const scribeApplicationReviewSchema = z.object({
  action: z.enum(['approve', 'reject']),
  notes: z.string().max(2000).optional(),
})
