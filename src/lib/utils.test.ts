import { describe, it, expect } from 'vitest'
import { cn, optimizeImageUrl, timeAgo } from './utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('dedupes conflicting tailwind classes (last wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })
})

describe('optimizeImageUrl', () => {
  const SUPABASE_URL =
    'https://yvjflhvbtjjmdwkgqqfs.supabase.co/storage/v1/object/public/wiki/foo.jpg'

  it('returns placeholder when url is null', () => {
    expect(optimizeImageUrl(null, 400)).toBe('/placeholder-miniature.jpg')
  })

  it('returns placeholder when url is undefined', () => {
    expect(optimizeImageUrl(undefined, 400)).toBe('/placeholder-miniature.jpg')
  })

  it('returns the original url for non-supabase hosts', () => {
    const external = 'https://images.unsplash.com/photo.jpg'
    expect(optimizeImageUrl(external, 400)).toBe(external)
  })

  it('rewrites supabase storage url to render endpoint with width and quality', () => {
    const result = optimizeImageUrl(SUPABASE_URL, 800, 80)
    expect(result).toContain('/storage/v1/render/image/public/')
    expect(result).toContain('width=800')
    expect(result).toContain('quality=80')
  })

  it('uses default quality of 75 when not provided', () => {
    expect(optimizeImageUrl(SUPABASE_URL, 400)).toContain('quality=75')
  })

  it('appends params with & when url already has a query string', () => {
    const url = `${SUPABASE_URL}?token=abc`
    const result = optimizeImageUrl(url, 400)
    expect(result).toMatch(/\?token=abc&width=400&quality=75$/)
  })
})

describe('timeAgo', () => {
  it('returns "ahora" for very recent dates', () => {
    const now = new Date().toISOString()
    expect(timeAgo(now)).toBe('ahora')
  })

  it('returns minutes for dates less than an hour ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    expect(timeAgo(fiveMinAgo)).toBe('hace 5m')
  })

  it('returns hours for dates less than a day ago', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    expect(timeAgo(threeHoursAgo)).toBe('hace 3h')
  })

  it('returns days for dates less than a week ago', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    expect(timeAgo(twoDaysAgo)).toBe('hace 2d')
  })

  it('returns formatted date for older dates', () => {
    const result = timeAgo('2025-01-15T10:00:00Z')
    expect(result).toMatch(/\d+/)
  })
})
