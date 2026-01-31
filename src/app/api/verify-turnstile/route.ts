import { NextRequest, NextResponse } from 'next/server'

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || ''

interface TurnstileVerifyResponse {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token no proporcionado' },
        { status: 400 }
      )
    }

    if (!TURNSTILE_SECRET_KEY) {
      console.warn('[Turnstile] Secret key not configured, skipping verification')
      // In development without key, allow through
      return NextResponse.json({ success: true })
    }

    // Get the client IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // Verify with Cloudflare
    const formData = new URLSearchParams()
    formData.append('secret', TURNSTILE_SECRET_KEY)
    formData.append('response', token)
    formData.append('remoteip', ip)

    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    )

    const data: TurnstileVerifyResponse = await response.json()

    if (data.success) {
      return NextResponse.json({ success: true })
    } else {
      console.error('[Turnstile] Verification failed:', data['error-codes'])
      return NextResponse.json(
        { success: false, error: 'Verificación fallida' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('[Turnstile] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno' },
      { status: 500 }
    )
  }
}
