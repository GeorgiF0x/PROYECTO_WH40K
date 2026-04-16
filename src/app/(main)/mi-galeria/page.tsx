'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence, useInView, useSpring, useTransform } from 'framer-motion'
import { MiniatureGrid } from '@/components/gallery'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  Plus,
  Image as ImageIcon,
  Heart,
  Eye,
  TrendingUp,
  Sparkles,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  MoreVertical,
} from 'lucide-react'
import type { Miniature, Profile } from '@/lib/types/database.types'

// Animated counter component
function AnimatedCounter({ value, duration = 1 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const spring = useSpring(0, { duration: duration * 1000 })
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString())

  useEffect(() => {
    if (isInView) {
      spring.set(value)
    }
  }, [isInView, value, spring])

  return <motion.span ref={ref}>{display}</motion.span>
}

interface Stats {
  totalMiniatures: number
  totalLikes: number
  totalViews: number
}

export default function MyGalleryPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [miniatures, setMiniatures] = useState<
    (Miniature & { profiles?: Profile; likes_count?: number; comments_count?: number })[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [stats, setStats] = useState<Stats>({ totalMiniatures: 0, totalLikes: 0, totalViews: 0 })

  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/mi-galeria')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      fetchMyMiniatures()
    }
  }, [user])

  const fetchMyMiniatures = async () => {
    if (!user?.id) return
    setIsLoading(true)

    // Fetch miniatures with real likes and comments counts
    const { data, error } = await supabase
      .from('miniatures')
      .select(
        `
        *,
        miniature_likes(count),
        miniature_comments(count)
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching miniatures:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        full: JSON.stringify(error),
      })
    } else if (data) {
      // Transform the aggregated counts into simple numbers
      const withStats = data.map((m) => {
        const miniature = m as Miniature & {
          miniature_likes?: { count: number }[]
          miniature_comments?: { count: number }[]
        }
        return {
          ...miniature,
          likes_count: miniature.miniature_likes?.[0]?.count || 0,
          comments_count: miniature.miniature_comments?.[0]?.count || 0,
        }
      })
      setMiniatures(withStats)

      // Calculate total stats from real data
      const totalLikes = withStats.reduce((sum, m) => sum + (m.likes_count || 0), 0)
      const totalComments = withStats.reduce((sum, m) => sum + (m.comments_count || 0), 0)
      setStats({
        totalMiniatures: withStats.length,
        totalLikes,
        totalViews: totalLikes * 3 + totalComments * 2, // Estimated views based on engagement
      })
    }

    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta miniatura?')) return

    const { error } = await supabase.from('miniatures').delete().eq('id', id)

    if (!error) {
      setMiniatures((prev) => prev.filter((m) => m.id !== id))
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center pb-16 pt-24">
        <motion.div
          className="h-8 w-8 rounded-full border-2 border-bone/20 border-t-imperial-gold"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-16 pt-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-12">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.08)_0%,transparent_60%)]" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end"
          >
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-imperial-gold/30 bg-imperial-gold/10 px-4 py-2"
              >
                <ImageIcon className="h-4 w-4 text-imperial-gold" />
                <span className="font-body text-sm text-imperial-gold">Tu Colección</span>
              </motion.div>

              <h1 className="font-display text-4xl font-bold tracking-wide md:text-5xl">
                <span className="text-bone">Mi </span>
                <span className="text-gradient">Galería</span>
              </h1>
              <p className="mt-2 font-body text-bone/60">
                Gestiona y muestra tus miniaturas al mundo
              </p>
            </div>

            <Link href="/mi-galeria/subir">
              <motion.button
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-imperial-gold to-yellow-500 px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-void"
                whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(201, 162, 39, 0.4)' }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="h-5 w-5" />
                Subir Miniatura
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3"
          >
            {[
              {
                label: 'Miniaturas',
                value: stats.totalMiniatures,
                icon: ImageIcon,
                gradient: 'from-imperial-gold to-yellow-500',
                bgColor: 'bg-imperial-gold/10',
                textColor: 'text-imperial-gold',
              },
              {
                label: 'Likes Totales',
                value: stats.totalLikes,
                icon: Heart,
                gradient: 'from-red-400 to-pink-500',
                bgColor: 'bg-red-400/10',
                textColor: 'text-red-400',
              },
              {
                label: 'Engagement',
                value: stats.totalViews,
                icon: TrendingUp,
                gradient: 'from-blue-400 to-cyan-400',
                bgColor: 'bg-blue-400/10',
                textColor: 'text-blue-400',
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="group relative overflow-hidden rounded-xl border border-bone/10 bg-void-light/50 p-6 backdrop-blur-sm"
              >
                {/* Background glow on hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${stat.gradient}`}
                  style={{ opacity: 0.05 }}
                />

                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="mb-1 font-body text-sm text-bone/50">{stat.label}</p>
                    <p className="font-display text-3xl font-bold text-bone">
                      <AnimatedCounter value={stat.value} duration={1.5} />
                    </p>
                  </div>
                  <motion.div
                    className={`rounded-xl p-3 ${stat.bgColor}`}
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                  </motion.div>
                </div>

                {/* Decorative gradient bar */}
                <motion.div
                  className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${stat.gradient}`}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                  style={{ opacity: 0.6 }}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 flex items-center justify-between"
          >
            <p className="font-body text-bone/50">
              {isLoading ? (
                'Cargando...'
              ) : (
                <>
                  <span className="font-semibold text-imperial-gold">{miniatures.length}</span>{' '}
                  miniaturas en tu galería
                </>
              )}
            </p>

            <div className="flex items-center gap-2 rounded-xl border border-bone/10 bg-void-light p-1">
              <motion.button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-2.5 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-imperial-gold text-void'
                    : 'text-bone/60 hover:text-bone'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LayoutGrid className="h-4 w-4" />
              </motion.button>
              <motion.button
                onClick={() => setViewMode('list')}
                className={`rounded-lg p-2.5 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-imperial-gold text-void'
                    : 'text-bone/60 hover:text-bone'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <List className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gallery */}
      <section className="px-6">
        <div className="mx-auto max-w-7xl">
          {viewMode === 'grid' ? (
            <MiniatureGrid
              miniatures={miniatures}
              isLoading={isLoading}
              emptyMessage="Aún no has subido ninguna miniatura. ¡Comparte tu primera obra!"
            />
          ) : (
            /* List View */
            <div className="space-y-4">
              <AnimatePresence>
                {miniatures.map((miniature, index) => (
                  <motion.div
                    key={miniature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group flex items-center gap-4 rounded-xl border border-bone/10 bg-void-light p-4"
                  >
                    {/* Thumbnail */}
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-void">
                      <img
                        src={
                          miniature.thumbnail_url ||
                          miniature.images?.[0] ||
                          '/placeholder-miniature.jpg'
                        }
                        alt={miniature.title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <Link href={`/galeria/${miniature.id}`}>
                        <h3 className="truncate font-display font-bold text-bone transition-colors hover:text-imperial-gold">
                          {miniature.title}
                        </h3>
                      </Link>
                      <p className="truncate text-sm text-bone/50">{miniature.description}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-bone/40">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" /> {miniature.likes_count || 0}
                        </span>
                        <span>{new Date(miniature.created_at).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Link href={`/mi-galeria/editar/${miniature.id}`}>
                        <motion.button
                          className="rounded-lg bg-bone/10 p-2 text-bone/60 transition-colors hover:bg-imperial-gold/10 hover:text-imperial-gold"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Pencil className="h-4 w-4" />
                        </motion.button>
                      </Link>
                      <motion.button
                        onClick={() => handleDelete(miniature.id)}
                        className="rounded-lg bg-bone/10 p-2 text-bone/60 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Empty State with CTA */}
          {!isLoading && miniatures.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-20 text-center"
            >
              <motion.div
                className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full border border-imperial-gold/30 bg-imperial-gold/10"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(201, 162, 39, 0.2)',
                    '0 0 40px rgba(201, 162, 39, 0.4)',
                    '0 0 20px rgba(201, 162, 39, 0.2)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="h-12 w-12 text-imperial-gold" />
              </motion.div>

              <h2 className="mb-3 font-display text-2xl font-bold text-bone">
                Tu galería está vacía
              </h2>
              <p className="mx-auto mb-8 max-w-md font-body text-bone/60">
                Comparte tus miniaturas con la comunidad y recibe feedback de otros artistas.
              </p>

              <Link href="/mi-galeria/subir">
                <motion.button
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-imperial-gold to-yellow-500 px-8 py-4 font-display text-sm font-bold uppercase tracking-wider text-void"
                  whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(201, 162, 39, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="h-5 w-5" />
                  Subir Primera Miniatura
                </motion.button>
              </Link>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}
