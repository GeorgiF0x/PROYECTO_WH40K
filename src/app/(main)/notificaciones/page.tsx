'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/hooks/useAuth'
import { useNotifications } from '@/lib/hooks/useNotifications'
import { timeAgo } from '@/lib/utils'
import {
  Bell,
  Cpu,
  Heart,
  MessageCircle,
  UserPlus,
  Mail,
  AtSign,
  Info,
  Trash2,
  CheckCheck,
} from 'lucide-react'
import type { Notification } from '@/lib/types/database.types'

// ── Blast-door transition (~700ms) ─────────────────────────────
function BlastDoor({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'closed' | 'opening' | 'done'>('closed')

  useEffect(() => {
    // Start opening after a micro-beat
    const t1 = setTimeout(() => setPhase('opening'), 80)
    // Signal done
    const t2 = setTimeout(() => {
      setPhase('done')
      onComplete()
    }, 750)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-50 pointer-events-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'done' ? 0 : 1 }}
      transition={{ duration: 0.15 }}
    >
      {/* Top panel */}
      <motion.div
        className="absolute top-0 left-0 right-0 bg-void border-b border-imperial-gold/20 overflow-hidden"
        initial={{ height: '50%' }}
        animate={{ height: phase === 'opening' ? '0%' : '50%' }}
        transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
      >
        {/* Panel inner detail — horizontal lines */}
        <div className="absolute bottom-0 left-0 right-0 h-8">
          <div className="h-px bg-imperial-gold/10 mb-1" />
          <div className="h-px bg-imperial-gold/5 mb-2" />
          <div className="h-[2px] bg-imperial-gold/20" />
        </div>
        {/* Mechanicum insignia hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <Cpu className="w-3 h-3 text-imperial-gold/30" />
          <span className="text-[10px] font-body uppercase tracking-[0.3em] text-imperial-gold/20">
            Administratum
          </span>
          <Cpu className="w-3 h-3 text-imperial-gold/30" />
        </div>
      </motion.div>

      {/* Bottom panel */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-void border-t border-imperial-gold/20 overflow-hidden"
        initial={{ height: '50%' }}
        animate={{ height: phase === 'opening' ? '0%' : '50%' }}
        transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
      >
        {/* Panel inner detail */}
        <div className="absolute top-0 left-0 right-0 h-8">
          <div className="h-[2px] bg-imperial-gold/20" />
          <div className="h-px bg-imperial-gold/5 mt-2" />
          <div className="h-px bg-imperial-gold/10 mt-1" />
        </div>
      </motion.div>

      {/* Center gap glow — appears as doors split */}
      <motion.div
        className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-transparent via-imperial-gold to-transparent"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{
          opacity: phase === 'opening' ? [0, 1, 0] : 0,
          scaleX: phase === 'opening' ? [0, 1, 1] : 0,
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      {/* Flash at the split point */}
      <motion.div
        className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-16 bg-gradient-to-b from-transparent via-imperial-gold/10 to-transparent"
        initial={{ opacity: 0 }}
        animate={{
          opacity: phase === 'opening' ? [0, 0.6, 0] : 0,
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </motion.div>
  )
}

// ── Helpers ────────────────────────────────────────────────────

const typeConfig: Record<
  Notification['type'],
  { icon: typeof Heart; color: string; border: string; glow: string; label: string }
> = {
  like: { icon: Heart, color: 'text-red-400', border: 'border-l-red-500', glow: 'shadow-red-500/40', label: 'VOX // APROBACION' },
  comment: { icon: MessageCircle, color: 'text-blue-400', border: 'border-l-blue-500', glow: 'shadow-blue-500/40', label: 'VOX // COMUNICACION' },
  follow: { icon: UserPlus, color: 'text-green-400', border: 'border-l-green-500', glow: 'shadow-green-500/40', label: 'VOX // RECLUTAMIENTO' },
  message: { icon: Mail, color: 'text-purple-400', border: 'border-l-purple-500', glow: 'shadow-purple-500/40', label: 'VOX // MENSAJE' },
  mention: { icon: AtSign, color: 'text-yellow-400', border: 'border-l-yellow-500', glow: 'shadow-yellow-500/40', label: 'VOX // MENCION' },
  system: { icon: Info, color: 'text-imperial-gold', border: 'border-l-imperial-gold', glow: 'shadow-imperial-gold/40', label: 'VOX // SISTEMA' },
}

function getNotificationHref(notification: Notification): string | null {
  const data = notification.data as Record<string, string> | null
  if (!data) return null

  if (notification.type === 'like' || notification.type === 'comment') {
    return data.miniature_id ? `/galeria/${data.miniature_id}` : null
  }
  if (notification.type === 'follow') {
    return data.actor_username ? `/usuarios/${data.actor_username}` : null
  }
  if (notification.type === 'message') {
    return data.conversation_id ? `/mensajes/${data.conversation_id}` : null
  }
  return null
}

// ── Main page ──────────────────────────────────────────────────

export default function NotificacionesPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(user?.id)

  const [doorOpen, setDoorOpen] = useState(false)
  const handleDoorComplete = useCallback(() => setDoorOpen(true), [])

  const handleClick = (notification: Notification) => {
    const href = getNotificationHref(notification)
    if (!notification.read) {
      markAsRead(notification.id)
    }
    if (href) {
      router.push(href)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-void-light rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <Bell className="w-12 h-12 text-bone/20 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-bone mb-2">
            Acceso restringido
          </h2>
          <p className="text-bone/50 text-sm">
            Inicia sesion para ver tus notificaciones
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Blast-door opening transition */}
      <AnimatePresence>
        {!doorOpen && <BlastDoor onComplete={handleDoorComplete} />}
      </AnimatePresence>

      {/* Page content */}
      <motion.div
        className="min-h-screen pt-24 pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: doorOpen ? 1 : 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <div className="px-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header Bar */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={doorOpen ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.05 }}
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

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cpu className="w-4 h-4 text-imperial-gold/60 flex-shrink-0" />
                  <span className="text-xs font-body uppercase tracking-[0.2em] text-imperial-gold/70">
                    Administratum // Registro de Comunicaciones
                  </span>
                </div>

                {unreadCount > 0 && (
                  <motion.button
                    onClick={markAllAsRead}
                    className="flex items-center gap-2 px-3 py-1.5 border border-imperial-gold/30 text-imperial-gold rounded-md text-xs font-body uppercase tracking-wider hover:bg-imperial-gold/10 transition-colors"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Marcar todas como leidas
                  </motion.button>
                )}
              </div>
            </motion.div>

            {/* Notification List */}
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 bg-void-light rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={doorOpen ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div className="relative mb-6">
                  <Bell className="w-16 h-16 text-bone/10" />
                  <motion.div
                    className="absolute inset-0"
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Bell className="w-16 h-16 text-imperial-gold/20" />
                  </motion.div>
                </div>
                <h3 className="text-lg font-display font-bold text-bone/40 mb-2">
                  No hay transmisiones pendientes
                </h3>
                <p className="text-sm text-bone/25 text-center max-w-sm">
                  Las notificaciones de likes, comentarios y seguidores
                  apareceran aqui
                </p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {notifications.map((notification, index) => {
                    const config = typeConfig[notification.type]
                    const Icon = config.icon
                    const href = getNotificationHref(notification)
                    const isUnread = !notification.read

                    return (
                      <motion.div
                        key={notification.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={doorOpen ? { opacity: 1, y: 0 } : {}}
                        exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
                        transition={{ delay: 0.1 + index * 0.05, duration: 0.4 }}
                        className={`relative group rounded-lg border-l-[3px] overflow-hidden transition-all duration-300 ${
                          isUnread
                            ? `${config.border} bg-void-light/40 border border-l-[3px] border-bone/10 hover:border-bone/20`
                            : 'border-l-bone/10 bg-void-light/20 border border-l-[3px] border-bone/5 hover:border-bone/10'
                        }`}
                      >
                        {/* Unread corner brackets */}
                        {isUnread && (
                          <>
                            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-imperial-gold/30 rounded-tr-lg" />
                            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-imperial-gold/30 rounded-br-lg" />
                          </>
                        )}

                        {/* Hover scan-line effect */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <motion.div
                            className="w-full h-px bg-gradient-to-r from-transparent via-imperial-gold/20 to-transparent"
                            animate={{ top: ['0%', '100%'] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                            style={{ position: 'absolute' }}
                          />
                        </div>

                        {/* Unread radial glow */}
                        {isUnread && (
                          <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-imperial-gold/5 blur-2xl pointer-events-none" />
                        )}

                        <button
                          onClick={() => handleClick(notification)}
                          className={`relative w-full text-left flex items-start gap-4 p-4 pr-12 ${
                            href ? 'cursor-pointer' : 'cursor-default'
                          }`}
                        >
                          {/* Icon with glow */}
                          <div className="relative flex-shrink-0">
                            {isUnread && (
                              <motion.div
                                className={`absolute -inset-1 rounded-full blur-md ${config.glow}`}
                                animate={{ opacity: [0.4, 0.8, 0.4] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                style={{ boxShadow: 'inherit' }}
                              />
                            )}
                            <div
                              className={`relative w-11 h-11 rounded-full flex items-center justify-center border ${
                                isUnread
                                  ? 'bg-void border-bone/10'
                                  : 'bg-bone/5 border-transparent'
                              }`}
                            >
                              <Icon
                                className={`w-5 h-5 ${
                                  isUnread ? config.color : 'text-bone/25'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Type label */}
                            <span
                              className={`text-[10px] font-body uppercase tracking-[0.2em] ${
                                isUnread ? 'text-imperial-gold/50' : 'text-bone/20'
                              }`}
                            >
                              {config.label}
                            </span>

                            <p
                              className={`text-sm font-display font-semibold mt-0.5 ${
                                isUnread ? 'text-bone' : 'text-bone/50'
                              }`}
                            >
                              {notification.title}
                            </p>

                            {notification.body && (
                              <p
                                className={`text-sm mt-1 font-body ${
                                  isUnread ? 'text-bone/60' : 'text-bone/30'
                                }`}
                              >
                                {notification.body}
                              </p>
                            )}

                            {/* Footer: time + ref */}
                            <div className="flex items-center gap-3 mt-2">
                              <span
                                className={`text-xs font-body ${
                                  isUnread ? 'text-bone/40' : 'text-bone/20'
                                }`}
                              >
                                {timeAgo(notification.created_at)}
                              </span>
                              <span className="text-[10px] text-bone/15 font-mono">
                                REF:{notification.id.slice(0, 8).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </button>

                        {/* Delete button — bottom right, clear of content */}
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="absolute bottom-3 right-3 p-1.5 text-bone/15 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100"
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  )
}
