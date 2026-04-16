'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/hooks/useAuth'
import { useMessages } from '@/lib/hooks/useMessages'
import type { ChatMessage } from '@/lib/hooks/useMessages'
import { getConversationMetadata, isConversationParticipant } from '@/lib/services/messages'
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

// Floating warp energy particles — wisps + orbs, Astropath atmosphere
const WARP_PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${((i * 8 + 5) % 92) + 4}%`,
  top: `${((i * 15 + 10) % 84) + 8}%`,
  isOrb: i >= 9,
  w: i >= 9 ? (i % 3 === 0 ? 10 : 6) : i % 3 === 0 ? 50 : i % 2 === 0 ? 34 : 20,
  h: i >= 9 ? (i % 3 === 0 ? 10 : 6) : 3,
  rot: i >= 9 ? 0 : (i * 41) % 180,
  drift: (i % 2 === 0 ? -1 : 1) * (12 + (i % 4) * 8),
  dur: 7 + (i % 5) * 2,
  delay: i * 0.5,
  blur: i >= 9 ? (i % 3 === 0 ? 4 : 2) : 1,
  peak: i >= 9 ? 0.45 : 0.65,
}))

function WarpWisps() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {WARP_PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.w,
            height: p.h,
            background: p.isOrb
              ? 'radial-gradient(circle, rgba(139,42,123,0.5), transparent 70%)'
              : 'linear-gradient(90deg, transparent, rgba(139,42,123,0.35), transparent)',
            transform: p.rot ? `rotate(${p.rot}deg)` : undefined,
            filter: `blur(${p.blur}px)`,
          }}
          animate={{
            y: [0, p.drift, 0],
            opacity: [0, p.peak, 0],
            scale: p.isOrb ? [0.5, 1.3, 0.5] : undefined,
            scaleX: p.isOrb ? undefined : [0.4, 1, 0.4],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

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
  const {
    messages,
    isLoading: messagesLoading,
    send,
    retry,
    dismiss,
  } = useMessages(conversationId, user?.id, profile)

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

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight

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
      <div className="flex min-h-screen items-center justify-center pb-16 pt-24">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className="h-8 w-8 rounded-full border-2 border-bone/20 border-t-imperial-gold"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <span className="font-mono text-[10px] uppercase tracking-wider text-bone/20">
            Estableciendo enlace psiquico...
          </span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="relative flex min-h-screen items-center justify-center pb-16 pt-24">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(107,28,95,0.03)_0%,transparent_50%)]" />
        <div className="relative text-center">
          <div className="relative mb-6 inline-block">
            <div className="absolute -inset-4 rounded-full bg-imperial-gold/5 blur-xl" />
            <div className="relative rounded-full border border-bone/10 bg-void-light/50 p-4">
              <Radio className="h-12 w-12 text-bone/20" />
            </div>
          </div>
          <h2 className="mb-2 font-display text-xl font-bold text-bone">Acceso restringido</h2>
          <p className="font-mono text-xs uppercase tracking-wider text-bone/30">
            Autorizacion psiquica requerida
          </p>
        </div>
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div className="relative flex min-h-screen items-center justify-center pb-16 pt-24">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(107,28,95,0.03)_0%,transparent_50%)]" />
        <div className="relative text-center">
          <div className="relative mb-6 inline-block">
            <div className="absolute -inset-4 rounded-full bg-red-500/5 blur-xl" />
            <div className="relative rounded-full border border-red-500/10 bg-void-light/50 p-4">
              <ShieldAlert className="h-12 w-12 text-red-400/30" />
            </div>
          </div>
          <h2 className="mb-2 font-display text-xl font-bold text-bone">Acceso denegado</h2>
          <p className="mb-1 font-mono text-xs uppercase tracking-wider text-bone/30">
            Transmision no autorizada
          </p>
          <p className="mb-6 font-body text-sm text-bone/50">
            No tienes acceso a esta conversacion
          </p>
          <Link
            href="/mensajes"
            className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-wider text-imperial-gold transition-colors hover:text-imperial-gold/80"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a transmisiones
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden pt-20">
      {/* Warp-tinted background — Astropath */}
      <div className="pointer-events-none fixed inset-0">
        {/* Strong aurora layers */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(107,28,95,0.09)_0%,transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,42,123,0.06)_0%,transparent_40%)]" />
        {/* Breathing aurora — strong */}
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_30%,rgba(139,42,123,0.10)_0%,transparent_50%)]"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_70%,rgba(107,28,95,0.08)_0%,transparent_45%)]"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        />
        {/* Floating warp particles */}
        <WarpWisps />
        {/* Concentric psychic waves */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={`wave-${i}`}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-warp-light/[0.06]"
            style={{ width: 180, height: 180 }}
            animate={{ scale: [0.5, 4], opacity: [0.35, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeOut', delay: i * 1.7 }}
          />
        ))}
        {/* Background psychic eye — pulsing */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.svg
            viewBox="0 0 400 200"
            className="h-[250px] w-[500px] text-warp-light"
            fill="none"
            stroke="currentColor"
            animate={{ opacity: [0.03, 0.07, 0.03] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path
              d="M10 100 Q100 10,200 10 Q300 10,390 100 Q300 190,200 190 Q100 190,10 100Z"
              strokeWidth="2"
              opacity="0.6"
            />
            <path
              d="M40 100 Q110 30,200 30 Q290 30,360 100 Q290 170,200 170 Q110 170,40 100Z"
              strokeWidth="1"
              opacity="0.3"
            />
            <ellipse cx="200" cy="100" rx="55" ry="50" strokeWidth="1.5" opacity="0.5" />
            <circle cx="200" cy="100" r="22" fill="currentColor" opacity="0.2" stroke="none" />
          </motion.svg>
        </div>
        {/* Warp interference lines */}
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-warp-light/25 to-transparent"
          style={{ top: '40%' }}
          animate={{ opacity: [0, 0.5, 0], scaleY: [1, 2, 1] }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 6,
            repeatDelay: 9,
          }}
        />
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-warp-light/20 to-transparent"
          style={{ top: '75%' }}
          animate={{ opacity: [0, 0.4, 0] }}
          transition={{
            duration: 0.4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 12,
            repeatDelay: 10,
          }}
        />
      </div>

      {/* ── Sticky Header ────────────────────────────────── */}
      <div className="relative sticky top-20 z-30 border-b border-warp-light/10 bg-void/90 backdrop-blur-xl">
        {/* Top accent line — warp tinted, breathing */}
        <motion.div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-warp-light/25 to-transparent"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/mensajes')}
              className="rounded-lg p-2 text-bone/40 transition-colors hover:bg-warp/10 hover:text-warp-light"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            {meta?.otherUser && (
              <Link
                href={`/usuarios/${meta.otherUser.username}`}
                className="group flex items-center gap-3"
              >
                <div className="relative">
                  <div className="absolute -inset-0.5 rounded-full bg-warp-light/10 opacity-0 blur-sm transition-opacity group-hover:opacity-100" />
                  <Avatar
                    src={meta.otherUser.avatar_url}
                    alt={meta.otherUser.display_name || meta.otherUser.username}
                    fallback={meta.otherUser.username}
                    size="sm"
                  />
                </div>
                <div>
                  <span className="block font-display text-sm font-semibold text-bone transition-colors group-hover:text-imperial-gold">
                    {meta.otherUser.display_name || meta.otherUser.username}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-warp-light/40">
                    Enlace astropatico activo
                  </span>
                </div>
              </Link>
            )}
          </div>

          {meta?.listing && (
            <Link
              href={`/mercado/${meta.listing.id}`}
              className="flex items-center gap-2 rounded-lg border border-bone/5 px-3 py-1.5 font-mono text-xs text-bone/40 transition-all hover:border-imperial-gold/20 hover:text-imperial-gold"
            >
              <span className="max-w-[120px] truncate">{meta.listing.title}</span>
              <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
            </Link>
          )}
        </div>
      </div>

      {/* ── Messages Area ────────────────────────────────── */}
      <div ref={scrollContainerRef} className="relative flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
          {messagesLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`h-12 animate-pulse rounded-2xl border border-bone/5 bg-void-light/30 ${
                      i % 2 === 0 ? 'w-2/3' : 'w-1/2'
                    }`}
                  />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative mb-4">
                <Radio className="h-10 w-10 text-bone/10" />
                <motion.div
                  className="absolute inset-0 rounded-full border border-warp-light/10"
                  animate={{ scale: [1, 2], opacity: [0.2, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                />
              </div>
              <p className="text-center font-body text-sm text-bone/25">
                Inicia la transmision enviando un mensaje
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-bone/15">
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
      <div className="relative sticky bottom-0 border-t border-warp-light/10 bg-void/90 backdrop-blur-xl">
        {/* Top accent line — warp tinted, breathing */}
        <motion.div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-warp-light/20 to-transparent"
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Transmitir mensaje..."
              rows={1}
              className="max-h-32 flex-1 resize-none rounded-xl border border-bone/10 bg-void-light/50 px-4 py-3 font-body text-bone transition-all placeholder:text-bone/25 focus:border-imperial-gold/40 focus:shadow-[0_0_0_3px_rgba(201,162,39,0.06)] focus:outline-none"
              style={{ minHeight: '48px' }}
            />
            <motion.button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="group relative overflow-hidden rounded-xl p-3 disabled:cursor-not-allowed disabled:opacity-30"
              whileHover={{ scale: inputValue.trim() ? 1.05 : 1 }}
              whileTap={{ scale: inputValue.trim() ? 0.95 : 1 }}
            >
              {/* Button glow */}
              <div className="absolute inset-0 rounded-xl bg-imperial-gold" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-imperial-gold via-yellow-500 to-imperial-gold opacity-0 transition-opacity group-hover:opacity-100" />
              <Send className="relative z-10 h-5 w-5 text-void" />
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
        <div className="my-6 text-center">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-bone/5" />
            <span className="rounded-full border border-bone/5 bg-void-light/30 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-bone/20">
              {timeAgo(msg.created_at)}
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-bone/5" />
          </div>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
      >
        <div className="flex max-w-[75%] items-end gap-2">
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
              className={`relative overflow-hidden rounded-2xl px-4 py-2.5 transition-all ${
                isOwn
                  ? 'bg-imperial-gold/8 rounded-br-md border border-imperial-gold/15'
                  : 'rounded-bl-md border border-warp-light/10 bg-warp/[0.07]'
              } ${isSending ? 'opacity-60' : ''} ${
                isError ? 'border-red-500/30 bg-red-500/5' : ''
              }`}
            >
              {/* Subtle warp glow inside received messages */}
              {!isOwn && !isError && (
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(139,42,123,0.06)_0%,transparent_70%)]" />
              )}
              <p
                className={`whitespace-pre-wrap font-body text-sm leading-relaxed ${
                  isOwn ? 'text-bone/90' : 'text-bone/75'
                }`}
              >
                {msg.content}
              </p>
            </div>

            {/* Status indicator for own messages */}
            {isOwn && (
              <div className="mt-1 flex items-center justify-end gap-1 pr-1">
                {isSending && <Loader2 className="h-3 w-3 animate-spin text-bone/25" />}
                {msg._status === 'sent' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    <Check className="h-3 w-3 text-imperial-gold/40" />
                  </motion.div>
                )}
                {!msg._status && <Check className="h-3 w-3 text-imperial-gold/40" />}
                {isError && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 text-red-400" />
                    <span className="font-mono text-[10px] text-red-400/70">Error</span>
                    <button
                      onClick={() => msg._tempId && onRetry(msg._tempId)}
                      className="flex items-center gap-0.5 font-mono text-[10px] text-imperial-gold transition-colors hover:text-imperial-gold/80"
                    >
                      <RefreshCw className="h-2.5 w-2.5" />
                      Reintentar
                    </button>
                    <button
                      onClick={() => msg._tempId && onDismiss(msg._tempId)}
                      className="flex items-center gap-0.5 font-mono text-[10px] text-bone/25 transition-colors hover:text-bone/40"
                    >
                      <X className="h-2.5 w-2.5" />
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
