'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/hooks/useAuth'
import { useMessages } from '@/lib/hooks/useMessages'
import type { ChatMessage } from '@/lib/hooks/useMessages'
import {
  getConversationMetadata,
  isConversationParticipant,
} from '@/lib/services/messages'
import { timeAgo } from '@/lib/utils'
import { Avatar } from '@/components/ui'
import {
  ArrowLeft,
  Send,
  ExternalLink,
  MessageCircle,
  ShieldAlert,
  AlertCircle,
  RefreshCw,
  X,
  Check,
  Loader2,
} from 'lucide-react'

interface ConversationMeta {
  otherUser: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
  listing: {
    id: string
    title: string
    images: string[]
  } | null
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id as string
  const { user, profile, isLoading: authLoading } = useAuth()
  const { messages, isLoading: messagesLoading, send, retry, dismiss } = useMessages(
    conversationId,
    user?.id,
    profile
  )

  const [meta, setMeta] = useState<ConversationMeta | null>(null)
  const [metaLoading, setMetaLoading] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const [accessDenied, setAccessDenied] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const prevMessageCountRef = useRef(0)

  // Fetch conversation metadata and verify access
  useEffect(() => {
    if (!user || !conversationId) return

    const load = async () => {
      setMetaLoading(true)

      // Verify user is a participant
      const { isParticipant } = await isConversationParticipant(conversationId, user.id)
      if (!isParticipant) {
        setAccessDenied(true)
        setMetaLoading(false)
        return
      }

      const { data } = await getConversationMetadata(conversationId, user.id)
      if (data) {
        setMeta({
          otherUser: data.otherUser,
          listing: data.listing,
        })
      }
      setMetaLoading(false)
    }

    load()
  }, [user, conversationId])

  // Auto-scroll: only when a new message is added and user is near bottom
  useEffect(() => {
    const prevCount = prevMessageCountRef.current
    const newCount = messages.length
    prevMessageCountRef.current = newCount

    // No new messages added (just a status update) — skip
    if (newCount <= prevCount) return

    const container = scrollContainerRef.current
    if (!container) {
      // Fallback for initial load
      messagesEndRef.current?.scrollIntoView({ behavior: 'instant' })
      return
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight

    // If user is near the bottom (within 150px) or it's the initial load, scroll down
    if (distanceFromBottom < 150 || prevCount === 0) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: prevCount === 0 ? 'instant' : 'smooth',
          block: 'end',
        })
      })
    }
  }, [messages])

  const handleSend = useCallback(async () => {
    if (!inputValue.trim()) return
    const content = inputValue.trim()
    setInputValue('')

    // send() adds the message optimistically — no need to wait
    send(content)
    inputRef.current?.focus()
  }, [inputValue, send])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (authLoading || metaLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <motion.div
          className="w-8 h-8 border-2 border-bone/20 border-t-imperial-gold rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 text-bone/20 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-bone mb-2">
            Acceso restringido
          </h2>
          <p className="text-bone/50 text-sm">Inicia sesion para ver tus mensajes</p>
        </div>
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="w-12 h-12 text-red-400/50 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-bone mb-2">
            Acceso denegado
          </h2>
          <p className="text-bone/50 text-sm mb-4">No tienes acceso a esta conversacion</p>
          <Link
            href="/mensajes"
            className="text-imperial-gold hover:text-imperial-gold/80 transition-colors font-body text-sm"
          >
            Volver a mensajes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-20 z-30 bg-void/90 backdrop-blur-xl border-b border-bone/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/mensajes')}
              className="p-2 text-bone/60 hover:text-imperial-gold transition-colors rounded-lg hover:bg-imperial-gold/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {meta?.otherUser && (
              <Link
                href={`/usuarios/${meta.otherUser.username}`}
                className="flex items-center gap-3 group"
              >
                <Avatar
                  src={meta.otherUser.avatar_url}
                  alt={meta.otherUser.display_name || meta.otherUser.username}
                  fallback={meta.otherUser.username}
                  size="sm"
                />
                <span className="font-display font-semibold text-bone group-hover:text-imperial-gold transition-colors">
                  {meta.otherUser.display_name || meta.otherUser.username}
                </span>
              </Link>
            )}
          </div>

          {meta?.listing && (
            <Link
              href={`/mercado/${meta.listing.id}`}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-bone/50 hover:text-imperial-gold border border-bone/10 hover:border-imperial-gold/30 rounded-lg transition-colors font-body"
            >
              <span className="truncate max-w-[120px]">{meta.listing.title}</span>
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
            </Link>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {messagesLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`h-12 rounded-2xl animate-pulse bg-void-light ${
                    i % 2 === 0 ? 'w-2/3' : 'w-1/2'
                  }`} />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <MessageCircle className="w-12 h-12 text-bone/10 mb-4" />
              <p className="text-bone/30 text-sm font-body text-center">
                Inicia la conversacion enviando un mensaje
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <MessageBubble
                key={msg._tempId || msg.id}
                msg={msg}
                isOwn={msg.sender_id === user.id}
                showTimestamp={
                  index === 0 ||
                  new Date(msg.created_at).getTime() -
                    new Date(messages[index - 1].created_at).getTime() >
                    5 * 60 * 1000
                }
                onRetry={retry}
                onDismiss={dismiss}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Sticky Input */}
      <div className="sticky bottom-0 bg-void/90 backdrop-blur-xl border-t border-bone/10">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              rows={1}
              className="flex-1 px-4 py-3 bg-void-light border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 resize-none max-h-32 transition-colors"
              style={{ minHeight: '48px' }}
            />
            <motion.button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="p-3 bg-imperial-gold text-void rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Message bubble with optimistic status ────────────────────
function MessageBubble({
  msg,
  isOwn,
  showTimestamp,
  onRetry,
  onDismiss,
}: {
  msg: ChatMessage
  isOwn: boolean
  showTimestamp: boolean
  onRetry: (tempId: string) => void
  onDismiss: (tempId: string) => void
}) {
  const isSending = msg._status === 'sending'
  const isError = msg._status === 'error'

  return (
    <div>
      {showTimestamp && (
        <div className="text-center my-4">
          <span className="text-xs text-bone/25 font-body px-3 py-1 bg-void-light/50 rounded-full">
            {timeAgo(msg.created_at)}
          </span>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
      >
        <div className="flex items-end gap-2 max-w-[75%]">
          {!isOwn && (
            <Avatar
              src={msg.sender?.avatar_url}
              alt={msg.sender?.username || ''}
              fallback={msg.sender?.username || '?'}
              size="xs"
            />
          )}
          <div className="flex flex-col">
            <div
              className={`px-4 py-2.5 rounded-2xl transition-opacity ${
                isOwn
                  ? 'bg-imperial-gold/10 border border-imperial-gold/20 rounded-br-md'
                  : 'bg-void-light border border-bone/10 rounded-bl-md'
              } ${isSending ? 'opacity-70' : ''} ${
                isError ? 'border-red-500/30 bg-red-500/5' : ''
              }`}
            >
              <p
                className={`text-sm font-body whitespace-pre-wrap ${
                  isOwn ? 'text-bone' : 'text-bone/80'
                }`}
              >
                {msg.content}
              </p>
            </div>

            {/* Status indicator for own messages */}
            {isOwn && (
              <div className="flex items-center justify-end gap-1 mt-1 pr-1">
                {isSending && (
                  <Loader2 className="w-3 h-3 text-bone/30 animate-spin" />
                )}
                {msg._status === 'sent' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    <Check className="w-3 h-3 text-imperial-gold/50" />
                  </motion.div>
                )}
                {!msg._status && (
                  <Check className="w-3 h-3 text-imperial-gold/50" />
                )}
                {isError && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-red-400" />
                    <span className="text-[10px] text-red-400/70 font-body">
                      Error al enviar
                    </span>
                    <button
                      onClick={() => msg._tempId && onRetry(msg._tempId)}
                      className="text-[10px] text-imperial-gold hover:text-imperial-gold/80 font-body flex items-center gap-0.5 transition-colors"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      Reintentar
                    </button>
                    <button
                      onClick={() => msg._tempId && onDismiss(msg._tempId)}
                      className="text-[10px] text-bone/30 hover:text-bone/50 font-body flex items-center gap-0.5 transition-colors"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
