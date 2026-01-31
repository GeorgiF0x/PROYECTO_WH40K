import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST - Upload image to wiki storage bucket
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin status (only admins can upload to wiki bucket)
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.is_admin || ['admin', 'moderator'].includes(profile?.role || '')
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 5MB' },
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
