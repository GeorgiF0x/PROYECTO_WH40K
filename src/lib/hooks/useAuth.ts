'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types/database.types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Get supabase client (singleton)
  const supabase = createClient()

  // Fetch or create profile with timeout
  const fetchProfile = useCallback(async (userId: string, userEmail?: string, metadata?: Record<string, unknown>) => {
    console.log('[useAuth] Fetching profile for:', userId)
    console.log('[useAuth] Supabase client URL:', (supabase as unknown as { supabaseUrl?: string }).supabaseUrl || 'hidden')

    try {
      console.log('[useAuth] Starting Supabase query...')

      // Wrap in Promise.race with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Profile fetch TIMEOUT after 10 seconds - check network/RLS'))
        }, 10000)
      })

      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const { data: existingProfile, error: fetchError } = await Promise.race([
        queryPromise,
        timeoutPromise
      ])

      console.log('[useAuth] Profile fetch result:', {
        found: !!existingProfile,
        error: fetchError?.message,
        code: fetchError?.code,
        profile: existingProfile ? { username: existingProfile.username, id: existingProfile.id } : null
      })

      if (existingProfile) {
        console.log('[useAuth] Returning existing profile:', existingProfile.username)
        return existingProfile
      }

      // Profile doesn't exist, create it
      if (fetchError?.code === 'PGRST116') {
        console.log('[useAuth] Creating new profile...')
        const email = userEmail || ''
        const baseUsername = email.split('@')[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .slice(0, 20) || 'user'
        const username = `${baseUsername}${Math.floor(Math.random() * 1000)}`

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            username,
            display_name: (metadata?.full_name || metadata?.name || null) as string | null,
            avatar_url: (metadata?.avatar_url || metadata?.picture || null) as string | null,
          })
          .select()
          .single()

        if (insertError) {
          console.error('[useAuth] Error creating profile:', insertError)
          return null
        }

        console.log('[useAuth] Profile created:', newProfile?.username)
        return newProfile
      }

      return null
    } catch (error) {
      console.error('[useAuth] Profile fetch error:', error)
      return null
    }
  }, [supabase])

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      console.log('[useAuth] Initializing auth...')

      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        console.log('[useAuth] getSession result:', {
          hasSession: !!session,
          error: error?.message,
          email: session?.user?.email
        })

        if (!mounted) return

        if (session?.user) {
          setSession(session)
          setUser(session.user)

          const profile = await fetchProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata
          )
          console.log('[useAuth] initAuth: Setting profile state:', profile?.username || 'null')
          if (mounted) setProfile(profile)
        }
      } catch (error) {
        console.error('[useAuth] Init error:', error)
      } finally {
        if (mounted) {
          console.log('[useAuth] initAuth complete, setting isLoading to false')
          setIsLoading(false)
        }
      }
    }

    initAuth()

    // Listen for auth changes - but skip INITIAL_SESSION since initAuth handles it
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[useAuth] Auth state changed:', event, session?.user?.email)

        // Skip INITIAL_SESSION - initAuth already handles the initial load
        // This prevents race conditions where both try to fetch profile
        if (event === 'INITIAL_SESSION') {
          console.log('[useAuth] Skipping INITIAL_SESSION (handled by initAuth)')
          return
        }

        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)

        if (event === 'SIGNED_OUT') {
          console.log('[useAuth] User signed out, clearing profile')
          setProfile(null)
          setIsLoading(false)
          return
        }

        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          const profile = await fetchProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata
          )
          console.log('[useAuth] onAuthStateChange: Setting profile state:', profile?.username || 'null')
          if (mounted && profile) setProfile(profile)
        }

        console.log('[useAuth] onAuthStateChange complete')
        setIsLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    console.log('[useAuth] Starting Google sign in...')
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    console.log('[useAuth] Google sign in result:', { data, error: error?.message })
    return { data, error }
  }

  const signInWithDiscord = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    return { data, error }
  }

  const signOut = async () => {
    console.log('[useAuth] Signing out...')
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setProfile(null)
      setSession(null)
    }
    console.log('[useAuth] Sign out result:', { error: error?.message })
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { data, error }
  }

  const updatePassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword })
    return { data, error }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { data: null, error: new Error('Not authenticated') }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (data) setProfile(data)
    return { data, error }
  }

  return {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated: !!user,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithDiscord,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
  }
}
