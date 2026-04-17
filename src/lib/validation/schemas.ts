import { z } from 'zod'

// ── Reusable primitives ─────────────────────────────────────────

export const uuidSchema = z.uuid('must be a valid UUID')

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
