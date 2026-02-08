'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/lib/types/database.types'

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const unreadCount = notifications.filter((n) => !n.read).length

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) {
      setNotifications(data)
    }
    setIsLoading(false)
  }, [userId, supabase])

  // Subscribe to realtime inserts
  useEffect(() => {
    if (!userId) {
      setNotifications([])
      setIsLoading(false)
      return
    }

    fetchNotifications()

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications((prev) => [newNotification, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase, fetchNotifications])

  const markAsRead = useCallback(
    async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)

      if (!error) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        )
      }
    },
    [supabase]
  )

  const markAllAsRead = useCallback(async () => {
    if (!userId) return

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }
  }, [userId, supabase])

  const deleteNotification = useCallback(
    async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (!error) {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      }
    },
    [supabase]
  )

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }
}

/** Deferred wrapper — waits 2s before activating realtime subscriptions */
export function useDeferredNotifications(userId: string | undefined) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 2000)
    return () => clearTimeout(id)
  }, [])

  return useNotifications(ready ? userId : undefined)
}
