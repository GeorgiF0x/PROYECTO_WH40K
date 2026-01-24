import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  console.log('[Auth Callback] Code received:', code ? 'yes' : 'no')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    console.log('[Auth Callback] Exchange result:', {
      success: !error,
      error: error?.message,
      errorCode: error?.code,
      hasSession: !!data?.session
    })

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    // Redirect with error details for debugging
    const errorUrl = new URL(`${origin}/auth/auth-code-error`)
    errorUrl.searchParams.set('error', error.message)
    errorUrl.searchParams.set('code', error.code || 'unknown')
    return NextResponse.redirect(errorUrl.toString())
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
