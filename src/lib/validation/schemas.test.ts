import { describe, it, expect } from 'vitest'
import { embeddingsPostSchema, searchQuerySchema, turnstileVerifySchema } from './schemas'

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
