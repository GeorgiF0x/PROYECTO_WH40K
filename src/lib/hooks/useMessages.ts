'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  getMessages,
  markConversationRead,
  sendMessage,
  getUnreadConversationsCount,
} from '@/lib/services/messages'
import type { MessageWithSender } from '@/lib/services/messages'

// ── Optimistic message types ─────────────────────────────────
export type MessageStatus = 'sending' | 'sent' | 'error'

export interface ChatMessage extends MessageWithSender {
  _status?: MessageStatus
  _tempId?: string
}

interface SenderProfile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

const POLL_INTERVAL_MS = 8000

export function useMessages(
  conversationId: string | undefined,
  currentUserId: string | undefined,
  currentUserProfile?: SenderProfile | null
) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Keep a ref to profile so send() always has the latest without re-creating
  const profileRef = useRef(currentUserProfile)
  profileRef.current = currentUserProfile

  // Track whether Realtime is connected
  const realtimeConnectedRef = useRef(false)

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return
    setIsLoading(true)

    const { data, error } = await getMessages(conversationId)
    if (!error && data) {
      setMessages(data)
    }
    setIsLoading(false)
  }, [conversationId])

  // Merge server messages with optimistic ones (preserves pending/failed msgs)
  const mergeServerMessages = useCallback((serverData: MessageWithSender[]) => {
    setMessages((prev) => {
      const optimistic = prev.filter((m) => m._tempId)
      const serverIds = new Set(serverData.map((d) => d.id))
      const remainingOptimistic = optimistic.filter((m) => !serverIds.has(m.id))
      return [...serverData, ...remainingOptimistic]
    })
  }, [])

  // Fetch initial messages and subscribe to realtime
  useEffect(() => {
    if (!conversationId || !currentUserId) {
      setMessages([])
      setIsLoading(false)
      return
    }

    fetchMessages()

    // Mark as read
    markConversationRead(conversationId, currentUserId)

    // Subscribe to new messages via Realtime
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMsg = payload.new as MessageWithSender

          // Fetch the sender profile for the new message
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url')
            .eq('id', newMsg.sender_id)
            .single()

          const msgWithSender: ChatMessage = {
            ...newMsg,
            sender: senderProfile || {
              id: newMsg.sender_id,
              username: 'unknown',
              display_name: null,
              avatar_url: null,
            },
          }

          setMessages((prev) => {
            // Skip if we already have this exact message (by real DB id)
            if (prev.some((m) => m.id === msgWithSender.id)) return prev

            // If this is our own message, Realtime might arrive before the API response.
            // Check for a pending optimistic message with matching content.
            if (msgWithSender.sender_id === currentUserId) {
              const pendingIdx = prev.findIndex(
                (m) =>
                  m._tempId &&
                  m._status === 'sending' &&
                  m.content === msgWithSender.content
              )
              if (pendingIdx !== -1) {
                // Replace the optimistic placeholder with the real message
                const updated = [...prev]
                updated[pendingIdx] = { ...msgWithSender, _status: 'sent' }
                return updated
              }
            }

            return [...prev, msgWithSender]
          })

          // Mark as read if message is from someone else
          if (newMsg.sender_id !== currentUserId) {
            markConversationRead(conversationId, currentUserId)
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          realtimeConnectedRef.current = true
          console.log('[Realtime] Connected to messages channel')
        } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          realtimeConnectedRef.current = false
          console.warn('[Realtime] Subscription failed:', status, err)
        } else if (status === 'CLOSED') {
          realtimeConnectedRef.current = false
        }
      })

    // Polling fallback: refetch messages periodically
    // Ensures messages appear even if Realtime is unavailable or disconnected
    const pollInterval = setInterval(async () => {
      if (!conversationId) return
      const { data } = await getMessages(conversationId)
      if (data) {
        mergeServerMessages(data)
      }
    }, POLL_INTERVAL_MS)

    // Refetch on tab visibility change
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && conversationId) {
        getMessages(conversationId).then(({ data }) => {
          if (data) mergeServerMessages(data)
        })
        markConversationRead(conversationId, currentUserId)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(pollInterval)
      document.removeEventListener('visibilitychange', handleVisibility)
      realtimeConnectedRef.current = false
    }
  }, [conversationId, currentUserId, supabase, fetchMessages, mergeServerMessages])

  // ── Optimistic send ──────────────────────────────────────────
  const send = useCallback(
    async (content: string) => {
      if (!conversationId || !currentUserId || !content.trim()) return

      const trimmed = content.trim()
      const tempId = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const profile = profileRef.current

      // 1. Add optimistic message immediately
      const optimisticMsg: ChatMessage = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: trimmed,
        created_at: new Date().toISOString(),
        sender: profile
          ? {
              id: profile.id,
              username: profile.username,
              display_name: profile.display_name,
              avatar_url: profile.avatar_url,
            }
          : {
              id: currentUserId,
              username: 'tu',
              display_name: null,
              avatar_url: null,
            },
        _status: 'sending',
        _tempId: tempId,
      }

      setMessages((prev) => [...prev, optimisticMsg])

      // 2. Send to server in background
      const { data, error } = await sendMessage(conversationId, currentUserId, trimmed)

      if (error || !data) {
        // Mark optimistic message as failed
        setMessages((prev) =>
          prev.map((m) =>
            m._tempId === tempId ? { ...m, _status: 'error' as const } : m
          )
        )
        return { data: null, error }
      }

      // 3. Confirm: replace temp id with real DB id
      //    If Realtime already replaced it, this is a harmless no-op.
      setMessages((prev) =>
        prev.map((m) =>
          m._tempId === tempId
            ? { ...m, id: data.id, _status: 'sent' as const, _tempId: undefined }
            : m
        )
      )

      return { data, error: null }
    },
    [conversationId, currentUserId]
  )

  // ── Retry a failed message ───────────────────────────────────
  const retry = useCallback(
    async (tempId: string) => {
      if (!conversationId || !currentUserId) return

      let failedContent = ''
      setMessages((prev) => {
        const msg = prev.find((m) => m._tempId === tempId)
        if (msg) failedContent = msg.content
        return prev.map((m) =>
          m._tempId === tempId ? { ...m, _status: 'sending' as const } : m
        )
      })

      if (!failedContent) return

      const { data, error } = await sendMessage(conversationId, currentUserId, failedContent)

      if (error || !data) {
        setMessages((prev) =>
          prev.map((m) =>
            m._tempId === tempId ? { ...m, _status: 'error' as const } : m
          )
        )
        return
      }

      setMessages((prev) =>
        prev.map((m) =>
          m._tempId === tempId
            ? { ...m, id: data.id, _status: 'sent' as const, _tempId: undefined }
            : m
        )
      )
    },
    [conversationId, currentUserId]
  )

  // ── Dismiss a failed message ─────────────────────────────────
  const dismiss = useCallback((tempId: string) => {
    setMessages((prev) => prev.filter((m) => m._tempId !== tempId))
  }, [])

  return { messages, isLoading, send, retry, dismiss }
}

export function useUnreadMessages(userId: string | undefined) {
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  const fetchCount = useCallback(async () => {
    if (!userId) return
    const { count } = await getUnreadConversationsCount(userId)
    setUnreadCount(count)
  }, [userId])

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0)
      return
    }

    fetchCount()

    // Subscribe to new messages to refresh count
    const channel = supabase
      .channel(`unread-messages:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchCount()
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Connected to unread messages channel')
        } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          console.warn('[Realtime] Unread subscription failed:', status, err)
        }
      })

    // Polling fallback for unread count
    const pollInterval = setInterval(fetchCount, POLL_INTERVAL_MS)

    // Refetch on tab visibility
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchCount()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(pollInterval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [userId, supabase, fetchCount])

  return { unreadCount }
}
