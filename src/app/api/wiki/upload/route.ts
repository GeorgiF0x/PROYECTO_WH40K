import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// --------------- Rate Limiter ---------------

interface RateEntry {
  count: number
  resetAt: number
  dailyCount: number
  dailyResetAt: number
}

const WINDOW_MS = 5 * 60 * 1000        // 5 minutes
const MAX_PER_WINDOW = 10               // 10 uploads per 5 min
const DAILY_MS = 24 * 60 * 60 * 1000   // 24 hours
const MAX_PER_DAY = 50                  // 50 uploads per day

const rateLimitMap = new Map<string, RateEntry>()

// Cleanup stale entries every 10 minutes to prevent memory leak
let lastCleanup = Date.now()
const CLEANUP_INTERVAL = 10 * 60 * 1000

function cleanupStaleEntries() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.dailyResetAt) {
      rateLimitMap.delete(key)
    }
  }
}

function checkRateLimit(userId: string, isAdmin: boolean): { allowed: boolean; retryAfterSec?: number; reason?: string } {
  if (isAdmin) return { allowed: true }

  cleanupStaleEntries()

  const now = Date.now()
  let entry = rateLimitMap.get(userId)

  if (!entry) {
    entry = {
      count: 0,
      resetAt: now + WINDOW_MS,
      dailyCount: 0,
      dailyResetAt: now + DAILY_MS,
    }
    rateLimitMap.set(userId, entry)
  }

  // Reset window if expired
  if (now > entry.resetAt) {
    entry.count = 0
    entry.resetAt = now + WINDOW_MS
  }

  // Reset daily if expired
  if (now > entry.dailyResetAt) {
    entry.dailyCount = 0
    entry.dailyResetAt = now + DAILY_MS
  }

  // Check daily quota
  if (entry.dailyCount >= MAX_PER_DAY) {
    const retryAfterSec = Math.ceil((entry.dailyResetAt - now) / 1000)
    return { allowed: false, retryAfterSec, reason: `Daily upload limit (${MAX_PER_DAY}) reached. Try again later.` }
  }

  // Check window rate
  if (entry.count >= MAX_PER_WINDOW) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000)
    return { allowed: false, retryAfterSec, reason: `Too many uploads. Limit: ${MAX_PER_WINDOW} per 5 minutes.` }
  }

  entry.count++
  entry.dailyCount++
  return { allowed: true }
}

// --------------- Size Limits ---------------

const MAX_SIZE_DEFAULT = 2 * 1024 * 1024  // 2 MB for compressed images
const MAX_SIZE_GIF = 5 * 1024 * 1024      // 5 MB for GIFs (skip compression)

// --------------- Route Handler ---------------

// POST - Upload image to wiki storage bucket
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions (admins, moderators, and wiki contributors)
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, role, wiki_role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.is_admin || ['admin', 'moderator'].includes(profile?.role || '')
    const canUpload = isAdmin || !!profile?.wiki_role
    if (!canUpload) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Rate limit check
    const rateCheck = checkRateLimit(user.id, !!isAdmin)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: rateCheck.reason },
        {
          status: 429,
          headers: { 'Retry-After': String(rateCheck.retryAfterSec) },
        }
      )
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const factionId = formData.get('faction_id') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' },
        { status: 400 }
      )
    }

    // Validate file size (GIF-aware)
    const maxSize = file.type === 'image/gif' ? MAX_SIZE_GIF : MAX_SIZE_DEFAULT
    const maxLabel = file.type === 'image/gif' ? '5MB' : '2MB'
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${maxLabel}` },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const ext = file.name.split('.').pop()
    const filename = `${timestamp}-${randomStr}.${ext}`

    // Build path: wiki/{faction_id}/{filename} or wiki/general/{filename}
    const folder = factionId || 'general'
    const path = `${folder}/${filename}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('wiki')
      .upload(path, file, {
        contentType: file.type,
        cacheControl: '31536000', // 1 year cache
      })

    if (error) {
      console.error('Wiki upload error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('wiki').getPublicUrl(data.path)

    return NextResponse.json({
      path: data.path,
      url: urlData.publicUrl,
    })
  } catch (error) {
    console.error('Wiki upload POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
