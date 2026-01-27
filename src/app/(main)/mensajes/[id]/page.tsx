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
  Radio,
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
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className="w-8 h-8 border-2 border-bone/20 border-t-imperial-gold rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <span className="text-[10px] font-mono text-bone/20 uppercase tracking-wider">
            Estableciendo enlace psiquico...
          </span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center relative">
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(107,28,95,0.03)_0%,transparent_50%)]" />
        <div className="text-center relative">
          <div className="relative inline-block mb-6">
            <div className="absolute -inset-4 bg-imperial-gold/5 rounded-full blur-xl" />
            <div className="relative p-4 bg-void-light/50 rounded-full border border-bone/10">
              <Radio className="w-12 h-12 text-bone/20" />
            </div>
          </div>
          <h2 className="text-xl font-display font-bold text-bone mb-2">
            Acceso restringido
          </h2>
          <p className="text-xs font-mono text-bone/30 uppercase tracking-wider">
            Autorizacion psiquica requerida
          </p>
        </div>
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center relative">
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(107,28,95,0.03)_0%,transparent_50%)]" />
        <div className="text-center relative">
          <div className="relative inline-block mb-6">
            <div className="absolute -inset-4 bg-red-500/5 rounded-full blur-xl" />
            <div className="relative p-4 bg-void-light/50 rounded-full border border-red-500/10">
              <ShieldAlert className="w-12 h-12 text-red-400/30" />
            </div>
          </div>
          <h2 className="text-xl font-display font-bold text-bone mb-2">
            Acceso denegado
          </h2>
          <p className="text-xs font-mono text-bone/30 uppercase tracking-wider mb-1">
            Transmision no autorizada
          </p>
          <p className="text-bone/50 text-sm mb-6 font-body">No tienes acceso a esta conversacion</p>
          <Link
            href="/mensajes"
            className="inline-flex items-center gap-2 text-imperial-gold hover:text-imperial-gold/80 transition-colors font-mono text-sm uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a transmisiones
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 flex flex-col relative">
      {/* Warp-tinted background — Astropath */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(107,28,95,0.03)_0%,transparent_50%)]" />
      </div>

      {/* ── Sticky Header ────────────────────────────────── */}
      <div className="sticky top-20 z-30 bg-void/90 backdrop-blur-xl border-b border-bone/10 relative">
        {/* Top accent line — warp tinted */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-warp-light/15 to-transparent" />

        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/mensajes')}
              className="p-2 text-bone/40 hover:text-warp-light transition-colors rounded-lg hover:bg-warp/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {meta?.otherUser && (
              <Link
                href={`/usuarios/${meta.otherUser.username}`}
                className="flex items-center gap-3 group"
              >
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-warp-light/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
                  <Avatar
                    src={meta.otherUser.avatar_url}
                    alt={meta.otherUser.display_name || meta.otherUser.username}
                    fallback={meta.otherUser.username}
                    size="sm"
                  />
                </div>
                <div>
                  <span className="font-display font-semibold text-bone group-hover:text-imperial-gold transition-colors block text-sm">
                    {meta.otherUser.display_name || meta.otherUser.username}
                  </span>
                  <span className="text-[10px] font-mono text-warp-light/40 uppercase tracking-wider">
                    Enlace astropatico activo
                  </span>
                </div>
              </Link>
            )}
          </div>

          {meta?.listing && (
            <Link
              href={`/mercado/${meta.listing.id}`}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-bone/40 hover:text-imperial-gold border border-bone/5 hover:border-imperial-gold/20 rounded-lg transition-all font-mono"
            >
              <span className="truncate max-w-[120px]">{meta.listing.title}</span>
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
            </Link>
          )}
        </div>
      </div>

      {/* ── Messages Area ────────────────────────────────── */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {messagesLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`h-12 rounded-2xl animate-pulse bg-void-light/30 border border-bone/5 ${
                    i % 2 === 0 ? 'w-2/3' : 'w-1/2'
                  }`} />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative mb-4">
                <Radio className="w-10 h-10 text-bone/10" />
                <motion.div
                  className="absolute inset-0 border border-warp-light/10 rounded-full"
                  animate={{ scale: [1, 2], opacity: [0.2, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                />
              </div>
              <p className="text-bone/25 text-sm font-body text-center">
                Inicia la transmision enviando un mensaje
              </p>
              <p className="text-[10px] font-mono text-bone/15 uppercase tracking-wider mt-2">
                Canal abierto — esperando senal
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

      {/* ── Sticky Input ─────────────────────────────────── */}
      <div className="sticky bottom-0 bg-void/90 backdrop-blur-xl border-t border-bone/10 relative">
        {/* Top accent line — warp tinted */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-warp-light/10 to-transparent" />

        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Transmitir mensaje..."
              rows={1}
              className="flex-1 px-4 py-3 bg-void-light/50 border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/25 focus:outline-none focus:border-imperial-gold/40 focus:shadow-[0_0_0_3px_rgba(201,162,39,0.06)] resize-none max-h-32 transition-all"
              style={{ minHeight: '48px' }}
            />
            <motion.button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="relative p-3 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden group"
              whileHover={{ scale: inputValue.trim() ? 1.05 : 1 }}
              whileTap={{ scale: inputValue.trim() ? 0.95 : 1 }}
            >
              {/* Button glow */}
              <div className="absolute inset-0 bg-imperial-gold rounded-xl" />
              <div className="absolute inset-0 bg-gradient-to-tr from-imperial-gold via-yellow-500 to-imperial-gold opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              <Send className="w-5 h-5 text-void relative z-10" />
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
        <div className="text-center my-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-bone/5" />
            <span className="text-[10px] text-bone/20 font-mono px-3 py-1 bg-void-light/30 rounded-full border border-bone/5 uppercase tracking-wider">
              {timeAgo(msg.created_at)}
            </span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-bone/5" />
          </div>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
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
              className={`px-4 py-2.5 rounded-2xl transition-all ${
                isOwn
                  ? 'bg-imperial-gold/8 border border-imperial-gold/15 rounded-br-md'
                  : 'bg-void-light/60 border border-bone/8 rounded-bl-md'
              } ${isSending ? 'opacity-60' : ''} ${
                isError ? 'border-red-500/30 bg-red-500/5' : ''
              }`}
            >
              <p
                className={`text-sm font-body whitespace-pre-wrap leading-relaxed ${
                  isOwn ? 'text-bone/90' : 'text-bone/75'
                }`}
              >
                {msg.content}
              </p>
            </div>

            {/* Status indicator for own messages */}
            {isOwn && (
              <div className="flex items-center justify-end gap-1 mt-1 pr-1">
                {isSending && (
                  <Loader2 className="w-3 h-3 text-bone/25 animate-spin" />
                )}
                {msg._status === 'sent' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    <Check className="w-3 h-3 text-imperial-gold/40" />
                  </motion.div>
                )}
                {!msg._status && (
                  <Check className="w-3 h-3 text-imperial-gold/40" />
                )}
                {isError && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-red-400" />
                    <span className="text-[10px] text-red-400/70 font-mono">
                      Error
                    </span>
                    <button
                      onClick={() => msg._tempId && onRetry(msg._tempId)}
                      className="text-[10px] text-imperial-gold hover:text-imperial-gold/80 font-mono flex items-center gap-0.5 transition-colors"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      Reintentar
                    </button>
                    <button
                      onClick={() => msg._tempId && onDismiss(msg._tempId)}
                      className="text-[10px] text-bone/25 hover:text-bone/40 font-mono flex items-center gap-0.5 transition-colors"
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
