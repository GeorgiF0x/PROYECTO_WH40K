import { describe, it, expect } from 'vitest'
import {
  embeddingsPostSchema,
  searchQuerySchema,
  turnstileVerifySchema,
  wikiPagePostSchema,
  wikiContributionPostSchema,
  scribeApplicationPostSchema,
  scribeApplicationReviewSchema,
  wikiContributionReviewSchema,
} from './schemas'

// Valid RFC 4122 v4 UUID (3rd group starts with '4', 4th with 8/9/a/b)
const VALID_UUID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

describe('embeddingsPostSchema', () => {
  it('accepts a valid UUID', () => {
    expect(embeddingsPostSchema.safeParse({ miniatureId: VALID_UUID }).success).toBe(true)
  })

  it('rejects non-UUID strings', () => {
    expect(embeddingsPostSchema.safeParse({ miniatureId: 'not-a-uuid' }).success).toBe(false)
  })

  it('rejects missing miniatureId', () => {
    expect(embeddingsPostSchema.safeParse({}).success).toBe(false)
  })
})

describe('searchQuerySchema', () => {
  it('accepts a query string', () => {
    expect(searchQuerySchema.safeParse({ q: 'tau warriors' }).success).toBe(true)
  })

  it('accepts a similar_to UUID', () => {
    expect(searchQuerySchema.safeParse({ similar_to: VALID_UUID }).success).toBe(true)
  })

  it('rejects when neither q nor similar_to is present', () => {
    expect(searchQuerySchema.safeParse({}).success).toBe(false)
  })

  it('coerces and clamps the limit', () => {
    const result = searchQuerySchema.safeParse({ q: 'foo', limit: '5' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.limit).toBe(5)
  })

  it('rejects limit > 50', () => {
    expect(searchQuerySchema.safeParse({ q: 'foo', limit: '200' }).success).toBe(false)
  })
})

describe('turnstileVerifySchema', () => {
  it('requires a non-empty token', () => {
    expect(turnstileVerifySchema.safeParse({ token: '' }).success).toBe(false)
    expect(turnstileVerifySchema.safeParse({ token: 'abc' }).success).toBe(true)
  })
})

describe('wikiPagePostSchema', () => {
  const valid = {
    faction_id: VALID_UUID,
    title: 'Adeptus Astartes',
    slug: 'adeptus-astartes',
    content: { type: 'doc', content: [] },
  }

  it('accepts a minimal valid payload', () => {
    expect(wikiPagePostSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects an invalid slug (uppercase)', () => {
    expect(wikiPagePostSchema.safeParse({ ...valid, slug: 'Bad-Slug' }).success).toBe(false)
  })

  it('rejects an invalid slug (special chars)', () => {
    expect(wikiPagePostSchema.safeParse({ ...valid, slug: 'bad slug!' }).success).toBe(false)
  })

  it('rejects an invalid hero_image URL', () => {
    expect(wikiPagePostSchema.safeParse({ ...valid, hero_image: 'not a url' }).success).toBe(false)
  })

  it('accepts a null hero_image', () => {
    expect(wikiPagePostSchema.safeParse({ ...valid, hero_image: null }).success).toBe(true)
  })
})

describe('wikiContributionPostSchema', () => {
  const content = { type: 'doc' }

  it('accepts edits to an existing page', () => {
    expect(wikiContributionPostSchema.safeParse({ page_id: VALID_UUID, content }).success).toBe(
      true
    )
  })

  it('accepts a new article suggestion', () => {
    expect(
      wikiContributionPostSchema.safeParse({
        faction_id: VALID_UUID,
        suggested_title: 'New article',
        content,
      }).success
    ).toBe(true)
  })

  it('rejects when neither page_id nor (faction_id + suggested_title) is present', () => {
    expect(wikiContributionPostSchema.safeParse({ content }).success).toBe(false)
    expect(wikiContributionPostSchema.safeParse({ faction_id: VALID_UUID, content }).success).toBe(
      false
    )
  })
})

describe('scribeApplicationPostSchema', () => {
  it('rejects motivation under 50 chars', () => {
    expect(scribeApplicationPostSchema.safeParse({ motivation: 'too short' }).success).toBe(false)
  })

  it('accepts motivation >= 50 chars', () => {
    const motivation = 'I have been part of the WH40K hobby for over a decade now.'
    expect(scribeApplicationPostSchema.safeParse({ motivation }).success).toBe(true)
  })
})

describe('scribeApplicationReviewSchema', () => {
  it('accepts approve / reject', () => {
    expect(scribeApplicationReviewSchema.safeParse({ action: 'approve' }).success).toBe(true)
    expect(scribeApplicationReviewSchema.safeParse({ action: 'reject' }).success).toBe(true)
  })

  it('rejects unknown actions', () => {
    expect(scribeApplicationReviewSchema.safeParse({ action: 'maybe' }).success).toBe(false)
  })
})

describe('wikiContributionReviewSchema', () => {
  it('accepts only approved/rejected status', () => {
    expect(wikiContributionReviewSchema.safeParse({ status: 'approved' }).success).toBe(true)
    expect(wikiContributionReviewSchema.safeParse({ status: 'rejected' }).success).toBe(true)
    expect(wikiContributionReviewSchema.safeParse({ status: 'pending' }).success).toBe(false)
  })
})
