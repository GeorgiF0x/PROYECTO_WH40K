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

  // Fetch or create profile — resolves to null on timeout (never throws)
  const fetchProfile = useCallback(async (userId: string, userEmail?: string, metadata?: Record<string, unknown>): Promise<Profile | null> => {
    try {
      // Race query against a 10s timeout that resolves to null
      const timeoutPromise = new Promise<{ data: null; error: null }>((resolve) => {
        setTimeout(() => {
          console.warn('[useAuth] Profile fetch timed out — continuing without profile')
          resolve({ data: null, error: null })
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

      if (existingProfile) {
        return existingProfile
      }

      // Profile doesn't exist, create it
      if (fetchError?.code === 'PGRST116') {
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
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!mounted) return

        if (session?.user) {
          setSession(session)
          setUser(session.user)

          // Fetch profile but don't block isLoading on it
          fetchProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata
          ).then((profile) => {
            if (mounted && profile) setProfile(profile)
          })
        }
      } catch (error) {
        console.error('[useAuth] Init error:', error)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initAuth()

    // Listen for auth changes - skip INITIAL_SESSION since initAuth handles it
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION') return
        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)

        if (event === 'SIGNED_OUT') {
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
          if (mounted && profile) setProfile(profile)
        }

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
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
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
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setProfile(null)
      setSession(null)
    }
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
