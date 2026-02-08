'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  startTransition,
  type ReactNode,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types/database.types'

// ── Types ────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyError = { message: string } | null | any

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  signInWithEmail: (email: string, password: string) => Promise<{ data: any; error: AnyError }>
  signUpWithEmail: (email: string, password: string) => Promise<{ data: any; error: AnyError }>
  signInWithGoogle: () => Promise<{ data: any; error: AnyError }>
  signInWithDiscord: () => Promise<{ data: any; error: AnyError }>
  signOut: () => Promise<{ error: AnyError }>
  resetPassword: (email: string) => Promise<{ data: any; error: AnyError }>
  updatePassword: (newPassword: string) => Promise<{ data: any; error: AnyError }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ data: Profile | null; error: AnyError }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ── Provider ─────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()
  const mountedRef = useRef(true)

  // ── Fetch or create profile ──────────────────────────────
  const fetchProfile = useCallback(
    async (
      userId: string,
      userEmail?: string,
      metadata?: Record<string, unknown>
    ): Promise<Profile | null> => {
      try {
        const timeoutPromise = new Promise<{ data: null; error: null }>((resolve) => {
          setTimeout(() => {
            console.warn('[Auth] Profile fetch timed out')
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
          timeoutPromise,
        ])

        if (existingProfile) return existingProfile

        // Profile doesn't exist — create it
        if (fetchError?.code === 'PGRST116') {
          const email = userEmail || ''
          const baseUsername =
            email
              .split('@')[0]
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
            console.error('[Auth] Error creating profile:', {
              code: insertError.code,
              message: insertError.message,
              details: insertError.details,
              hint: insertError.hint,
              raw: JSON.stringify(insertError),
            })
            return null
          }
          return newProfile
        }

        return null
      } catch (error) {
        console.error('[Auth] Profile fetch error:', error)
        return null
      }
    },
    [supabase]
  )

  // ── Single auth listener for the entire app ──────────────
  useEffect(() => {
    mountedRef.current = true

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!mountedRef.current) return

        if (session?.user) {
          // Use startTransition so auth state updates don't block rendering
          startTransition(() => {
            setSession(session)
            setUser(session.user)
          })

          fetchProfile(session.user.id, session.user.email, session.user.user_metadata).then(
            (p) => {
              if (mountedRef.current && p) startTransition(() => setProfile(p))
            }
          )
        }
      } catch (error) {
        console.error('[Auth] Init error:', error)
      } finally {
        if (mountedRef.current) startTransition(() => setIsLoading(false))
      }
    }

    // Defer auth init so it doesn't block first paint
    const tid = setTimeout(initAuth, 0)
    const cleanup = () => clearTimeout(tid)

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') return
      if (!mountedRef.current) return

      setSession(session)
      setUser(session?.user ?? null)

      if (event === 'SIGNED_OUT') {
        setProfile(null)
        setIsLoading(false)
        return
      }

      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        const p = await fetchProfile(
          session.user.id,
          session.user.email,
          session.user.user_metadata
        )
        if (mountedRef.current && p) setProfile(p)
      }

      setIsLoading(false)
    })

    return () => {
      mountedRef.current = false
      cleanup()
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  // ── Refresh session on tab visibility change ─────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // getSession() reads from storage and refreshes the token if expired
        supabase.auth.getSession().then(({ data: { session: freshSession } }) => {
          if (!mountedRef.current) return
          if (freshSession) {
            setSession(freshSession)
            setUser(freshSession.user)
          } else {
            // Session expired while tab was inactive
            setSession(null)
            setUser(null)
            setProfile(null)
          }
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [supabase])

  // ── Auth actions (stable refs via supabase singleton) ────
  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      return { data, error }
    },
    [supabase]
  )

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      return { data, error }
    },
    [supabase]
  )

  const signInWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    return { data, error }
  }, [supabase])

  const signInWithDiscord = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    return { data, error }
  }, [supabase])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setProfile(null)
      setSession(null)
    }
    return { error }
  }, [supabase])

  const resetPassword = useCallback(
    async (email: string) => {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      return { data, error }
    },
    [supabase]
  )

  const updatePassword = useCallback(
    async (newPassword: string) => {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword })
      return { data, error }
    },
    [supabase]
  )

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!user) return { data: null, error: new Error('Not authenticated') }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (data && mountedRef.current) setProfile(data)
      return { data, error }
    },
    [supabase, user]
  )

  const value: AuthContextValue = {
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ── Hook ─────────────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within <AuthProvider>')
  }
  return context
}
