'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/hooks/useAuth'
import { getConversations } from '@/lib/services/messages'
import { timeAgo } from '@/lib/utils'
import { Avatar } from '@/components/ui'
import { Radio, ShieldAlert } from 'lucide-react'
import type { ConversationPreview } from '@/lib/services/messages'
import { createClient } from '@/lib/supabase/client'

// Floating warp energy wisps — unique to Astropath theme
const WARP_WISPS = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  left: `${(i * 11 + 7) % 90 + 5}%`,
  top: `${(i * 17 + 12) % 80 + 10}%`,
  w: i % 3 === 0 ? 40 : i % 2 === 0 ? 28 : 16,
  rot: (i * 37) % 180,
  drift: (i % 2 === 0 ? -1 : 1) * (12 + (i % 4) * 8),
  dur: 8 + (i % 4) * 3,
  delay: i * 0.7,
}))

function WarpWisps() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {WARP_WISPS.map((w) => (
        <motion.div
          key={w.id}
          className="absolute rounded-full"
          style={{
            left: w.left,
            top: w.top,
            width: w.w,
            height: 2,
            background: 'linear-gradient(90deg, transparent, rgba(139,42,123,0.3), transparent)',
            transform: `rotate(${w.rot}deg)`,
            filter: 'blur(1px)',
          }}
          animate={{
            y: [0, w.drift, 0],
            opacity: [0, 0.6, 0],
            scaleX: [0.5, 1, 0.5],
          }}
          transition={{
            duration: w.dur,
            repeat: Infinity,
            delay: w.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// Psychic eye divider — Astropath motif
function PsychicDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-warp-light/15" />
      <div className="flex items-center gap-1.5">
        <div className="w-1 h-1 rounded-full bg-warp-light/25" />
        <svg viewBox="0 0 28 16" className="w-5 h-3 text-warp-light/30" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M1 8 Q7 1,14 1 Q21 1,27 8 Q21 15,14 15 Q7 15,1 8Z" />
          <circle cx="14" cy="8" r="3.5" strokeWidth="0.8" opacity="0.7" />
          <circle cx="14" cy="8" r="1.3" fill="currentColor" opacity="0.6" stroke="none" />
        </svg>
        <div className="w-1 h-1 rounded-full bg-warp-light/25" />
      </div>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-warp-light/15" />
    </div>
  )
}

export default function MensajesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [conversations, setConversations] = useState<ConversationPreview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchConversations = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    const { data } = await getConversations(user.id)
    setConversations(data)
    setIsLoading(false)
  }, [user])

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    fetchConversations()

    // Subscribe to new messages to refresh the list
    const channel = supabase
      .channel(`conversations-list:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase, fetchConversations])

  const isUnread = (conv: ConversationPreview) => {
    if (!conv.last_message) return false
    if (conv.last_message.sender_id === user?.id) return false
    if (!conv.last_read_at) return true
    return new Date(conv.last_message.created_at) > new Date(conv.last_read_at)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-void-light rounded-lg animate-pulse" />
          ))}
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
            <div className="absolute -inset-4 bg-warp-light/5 rounded-full blur-xl" />
            <div className="relative p-4 bg-void-light/50 rounded-full border border-warp-light/10">
              <ShieldAlert className="w-12 h-12 text-bone/20" />
            </div>
          </div>
          <h2 className="text-xl font-display font-bold text-bone mb-2">
            Acceso restringido
          </h2>
          <p className="text-xs font-mono text-bone/30 uppercase tracking-wider mb-1">
            Autorizacion psiquica requerida
          </p>
          <p className="text-bone/50 text-sm font-body">
            Inicia sesion para acceder al coro astropatico
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      {/* Warp-tinted background — Astropath */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Static aurora layers */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(107,28,95,0.06)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,42,123,0.04)_0%,transparent_40%)]" />
        {/* Breathing aurora — slow psychic pulse */}
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(139,42,123,0.07)_0%,transparent_50%)]"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(107,28,95,0.05)_0%,transparent_45%)]"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />
        {/* Floating warp wisps */}
        <WarpWisps />
        {/* Background psychic eye — large, faint, pulsing */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.svg
            viewBox="0 0 400 200"
            className="w-[500px] h-[250px] text-warp-light"
            fill="none"
            stroke="currentColor"
            animate={{ opacity: [0.02, 0.05, 0.02] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M10 100 Q100 10,200 10 Q300 10,390 100 Q300 190,200 190 Q100 190,10 100Z" strokeWidth="2" opacity="0.5" />
            <ellipse cx="200" cy="100" rx="55" ry="50" strokeWidth="1.5" opacity="0.4" />
            <circle cx="200" cy="100" r="22" fill="currentColor" opacity="0.25" stroke="none" />
          </motion.svg>
        </div>
        {/* Warp interference lines — occasional psychic static */}
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-warp-light/20 to-transparent"
          style={{ top: '35%' }}
          animate={{ opacity: [0, 0.4, 0], scaleY: [1, 2, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut', delay: 5, repeatDelay: 8 }}
        />
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-warp-light/15 to-transparent"
          style={{ top: '68%' }}
          animate={{ opacity: [0, 0.3, 0], scaleY: [1, 1.5, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 11, repeatDelay: 13 }}
        />
      </div>

      <div className="px-6 relative">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* ── Astropath Header ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-xl p-4 bg-void-light/30 backdrop-blur-sm overflow-hidden border border-warp-light/15"
          >
            {/* Warp aurora background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,42,123,0.08)_0%,transparent_60%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(107,28,95,0.05)_0%,transparent_50%)] pointer-events-none" />

            <div className="relative flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                {/* Radio with psychic pulse rings */}
                <div className="relative flex items-center justify-center" style={{ width: 40, height: 40 }}>
                  <motion.div
                    className="absolute inset-0 border border-warp-light/15 rounded-full"
                    animate={{ scale: [1, 1.7], opacity: [0.4, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
                  />
                  <motion.div
                    className="absolute inset-0 border border-warp-light/15 rounded-full"
                    animate={{ scale: [1, 1.7], opacity: [0.4, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
                  />
                  <div className="relative p-2 bg-warp/15 rounded-full border border-warp-light/20">
                    <motion.div
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Radio className="w-5 h-5 text-warp-light" />
                    </motion.div>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-[0.25em] text-imperial-gold/70 block">
                    Astropath <span className="text-warp-light/40">~</span> Transmisiones del Warp
                  </span>
                  <span className="text-[10px] font-mono text-bone/30 tracking-wider">
                    CORO ASTROPATICO <span className="text-warp-light/25">~</span> CANAL SEGURO
                  </span>
                </div>
              </div>

              {/* Pulsing psychic signal indicator */}
              <div className="flex items-center gap-2 text-xs font-mono text-bone/30">
                <motion.div
                  className="w-2 h-2 rounded-full bg-warp-light/60"
                  animate={{
                    opacity: [0.4, 1, 0.4],
                    boxShadow: ['0 0 0px rgba(139,42,123,0)', '0 0 6px rgba(139,42,123,0.4)', '0 0 0px rgba(139,42,123,0)'],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                Senal activa
              </div>
            </div>
          </motion.div>

          <PsychicDivider />

          {/* ── Conversation List ─────────────────────────────── */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-void-light/30 rounded-xl animate-pulse border border-bone/5" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="relative mb-6">
                <Radio className="w-16 h-16 text-bone/10" />
                <motion.div
                  className="absolute inset-0"
                  animate={{ opacity: [0.1, 0.4, 0.1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Radio className="w-16 h-16 text-warp-light/20" />
                </motion.div>
                {/* Psychic ripples — warp purple */}
                <motion.div
                  className="absolute inset-0 border-2 border-warp-light/10 rounded-full"
                  animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                />
                <motion.div
                  className="absolute inset-0 border-2 border-warp-light/10 rounded-full"
                  animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.7 }}
                />
              </div>
              <h3 className="text-lg font-display font-bold text-bone/40 mb-2">
                El warp permanece en silencio
              </h3>
              <p className="text-sm text-bone/25 text-center max-w-sm font-body">
                Las transmisiones con vendedores y compradores apareceran aqui
              </p>
              <p className="text-[10px] font-mono text-bone/15 uppercase tracking-wider mt-3">
                No hay senales psiquicas detectadas
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {conversations.map((conv, index) => {
                  const unread = isUnread(conv)

                  return (
                    <motion.div
                      key={conv.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + index * 0.04, duration: 0.4 }}
                    >
                      <Link href={`/mensajes/${conv.id}`}>
                        <div
                          className={`relative group rounded-xl overflow-hidden transition-all duration-300 ${
                            unread
                              ? 'bg-void-light/40 border border-imperial-gold/15 hover:border-imperial-gold/30'
                              : 'bg-void-light/20 border border-bone/5 hover:border-bone/10'
                          }`}
                        >
                          {/* Left accent line */}
                          <div className={`absolute left-0 top-0 bottom-0 w-[3px] transition-colors ${
                            unread
                              ? 'bg-gradient-to-b from-imperial-gold/80 via-imperial-gold/40 to-transparent'
                              : 'bg-bone/5 group-hover:bg-bone/10'
                          }`} />

                          {/* Unread psychic glow — warp tinted */}
                          {unread && (
                            <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-warp-light/5 blur-2xl pointer-events-none" />
                          )}

                          <div className="relative flex items-center gap-4 p-4 pl-5">
                            {/* Avatar */}
                            <div className="flex-shrink-0 relative">
                              {unread && (
                                <motion.div
                                  className="absolute -inset-1 bg-imperial-gold/15 rounded-full blur-sm"
                                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                              )}
                              <Avatar
                                src={conv.other_user.avatar_url}
                                alt={conv.other_user.display_name || conv.other_user.username}
                                fallback={conv.other_user.username}
                                size="lg"
                              />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className={`font-display font-semibold truncate ${
                                  unread ? 'text-bone' : 'text-bone/60'
                                }`}>
                                  {conv.other_user.display_name || conv.other_user.username}
                                </p>
                                {conv.last_message && (
                                  <span className={`text-xs flex-shrink-0 font-mono ${
                                    unread ? 'text-imperial-gold/70' : 'text-bone/25'
                                  }`}>
                                    {timeAgo(conv.last_message.created_at)}
                                  </span>
                                )}
                              </div>

                              {/* Listing title */}
                              {conv.listing_title && (
                                <p className="text-xs text-imperial-gold/40 truncate mt-0.5 font-mono">
                                  {conv.listing_title}
                                </p>
                              )}

                              {/* Last message preview */}
                              {conv.last_message && (
                                <p className={`text-sm truncate mt-1 font-body ${
                                  unread ? 'text-bone/70' : 'text-bone/35'
                                }`}>
                                  {conv.last_message.sender_id === user?.id ? 'Tu: ' : ''}
                                  {conv.last_message.content}
                                </p>
                              )}
                            </div>

                            {/* Listing thumbnail */}
                            {conv.listing_image && (
                              <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden relative border border-bone/5">
                                <Image
                                  src={conv.listing_image}
                                  alt={conv.listing_title || 'Listing'}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              </div>
                            )}

                            {/* Unread indicator */}
                            {unread && (
                              <motion.div
                                className="absolute top-4 right-4 w-2.5 h-2.5 bg-imperial-gold rounded-full"
                                animate={{ boxShadow: ['0 0 0px rgba(201,162,39,0.3)', '0 0 8px rgba(201,162,39,0.5)', '0 0 0px rgba(201,162,39,0.3)'] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                            )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
