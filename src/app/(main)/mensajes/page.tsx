'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/hooks/useAuth'
import { getConversations } from '@/lib/services/messages'
import { timeAgo } from '@/lib/utils'
import { Avatar } from '@/components/ui'
import { Cpu, MessageCircle, Image as ImageIcon } from 'lucide-react'
import type { ConversationPreview } from '@/lib/services/messages'
import { createClient } from '@/lib/supabase/client'

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
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 text-bone/20 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-bone mb-2">
            Acceso restringido
          </h2>
          <p className="text-bone/50 text-sm">
            Inicia sesion para ver tus mensajes
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header Bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative border border-imperial-gold/20 rounded-lg p-3 bg-void-light/30 overflow-hidden"
          >
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-imperial-gold/60" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-imperial-gold/60" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-imperial-gold/60" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-imperial-gold/60" />

            {/* Scan-line overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
              <div className="w-full h-px bg-imperial-gold/40 animate-scan" />
            </div>

            <div className="flex items-center gap-3">
              <Cpu className="w-4 h-4 text-imperial-gold/60 flex-shrink-0" />
              <span className="text-xs font-body uppercase tracking-[0.2em] text-imperial-gold/70">
                Administratum // Canal de Comunicaciones
              </span>
            </div>
          </motion.div>

          {/* Conversation List */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-void-light rounded-lg animate-pulse" />
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
                <MessageCircle className="w-16 h-16 text-bone/10" />
                <motion.div
                  className="absolute inset-0"
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <MessageCircle className="w-16 h-16 text-imperial-gold/20" />
                </motion.div>
              </div>
              <h3 className="text-lg font-display font-bold text-bone/40 mb-2">
                No hay transmisiones activas
              </h3>
              <p className="text-sm text-bone/25 text-center max-w-sm">
                Las conversaciones con vendedores y compradores apareceran aqui
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
                          className={`relative group rounded-lg overflow-hidden transition-all duration-300 border-l-[3px] ${
                            unread
                              ? 'border-l-imperial-gold bg-void-light/40 border border-l-[3px] border-bone/10 hover:border-bone/20'
                              : 'border-l-bone/10 bg-void-light/20 border border-l-[3px] border-bone/5 hover:border-bone/10'
                          }`}
                        >
                          {/* Unread glow */}
                          {unread && (
                            <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-imperial-gold/5 blur-2xl pointer-events-none" />
                          )}

                          <div className="relative flex items-center gap-4 p-4">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
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
                                  <span className={`text-xs flex-shrink-0 ${
                                    unread ? 'text-imperial-gold' : 'text-bone/30'
                                  }`}>
                                    {timeAgo(conv.last_message.created_at)}
                                  </span>
                                )}
                              </div>

                              {/* Listing title */}
                              {conv.listing_title && (
                                <p className="text-xs text-imperial-gold/50 truncate mt-0.5 font-body">
                                  {conv.listing_title}
                                </p>
                              )}

                              {/* Last message preview */}
                              {conv.last_message && (
                                <p className={`text-sm truncate mt-1 font-body ${
                                  unread ? 'text-bone/70' : 'text-bone/40'
                                }`}>
                                  {conv.last_message.sender_id === user?.id ? 'Tu: ' : ''}
                                  {conv.last_message.content}
                                </p>
                              )}
                            </div>

                            {/* Listing thumbnail */}
                            {conv.listing_image && (
                              <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden relative">
                                <Image
                                  src={conv.listing_image}
                                  alt={conv.listing_title || 'Listing'}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              </div>
                            )}

                            {/* Unread dot */}
                            {unread && (
                              <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-imperial-gold rounded-full" />
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
