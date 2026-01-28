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
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  )

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
  const [miniatures, setMiniatures] = useState<(Miniature & { profiles?: Profile; likes_count?: number; comments_count?: number })[]>([])
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
      .select(`
        *,
        miniature_likes(count),
        miniature_comments(count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching miniatures:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        full: JSON.stringify(error)
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

    const { error } = await supabase
      .from('miniatures')
      .delete()
      .eq('id', id)

    if (!error) {
      setMiniatures((prev) => prev.filter((m) => m.id !== id))
    }
  }

  if (authLoading) {
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

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero Section */}
      <section className="relative px-6 py-12 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.08)_0%,transparent_60%)]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8"
          >
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-imperial-gold/10 border border-imperial-gold/30 rounded-full mb-4"
              >
                <ImageIcon className="w-4 h-4 text-imperial-gold" />
                <span className="text-sm font-body text-imperial-gold">Tu Colección</span>
              </motion.div>

              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-wide">
                <span className="text-bone">Mi </span>
                <span className="text-gradient">Galería</span>
              </h1>
              <p className="text-bone/60 font-body mt-2">
                Gestiona y muestra tus miniaturas al mundo
              </p>
            </div>

            <Link href="/mi-galeria/subir">
              <motion.button
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-imperial-gold to-yellow-500 text-void font-display font-bold tracking-wider uppercase text-sm rounded-lg"
                whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(201, 162, 39, 0.4)' }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-5 h-5" />
                Subir Miniatura
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            {[
              { label: 'Miniaturas', value: stats.totalMiniatures, icon: ImageIcon, gradient: 'from-imperial-gold to-yellow-500', bgColor: 'bg-imperial-gold/10', textColor: 'text-imperial-gold' },
              { label: 'Likes Totales', value: stats.totalLikes, icon: Heart, gradient: 'from-red-400 to-pink-500', bgColor: 'bg-red-400/10', textColor: 'text-red-400' },
              { label: 'Engagement', value: stats.totalViews, icon: TrendingUp, gradient: 'from-blue-400 to-cyan-400', bgColor: 'bg-blue-400/10', textColor: 'text-blue-400' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="relative overflow-hidden bg-void-light/50 backdrop-blur-sm rounded-xl border border-bone/10 p-6 group"
              >
                {/* Background glow on hover */}
                <motion.div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${stat.gradient}`}
                  style={{ opacity: 0.05 }}
                />

                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-bone/50 text-sm font-body mb-1">{stat.label}</p>
                    <p className="text-3xl font-display font-bold text-bone">
                      <AnimatedCounter value={stat.value} duration={1.5} />
                    </p>
                  </div>
                  <motion.div
                    className={`p-3 rounded-xl ${stat.bgColor}`}
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
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
            className="flex items-center justify-between mb-8"
          >
            <p className="text-bone/50 font-body">
              {isLoading ? (
                'Cargando...'
              ) : (
                <>
                  <span className="text-imperial-gold font-semibold">{miniatures.length}</span> miniaturas en tu galería
                </>
              )}
            </p>

            <div className="flex items-center gap-2 bg-void-light rounded-xl border border-bone/10 p-1">
              <motion.button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-imperial-gold text-void' : 'text-bone/60 hover:text-bone'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LayoutGrid className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-imperial-gold text-void' : 'text-bone/60 hover:text-bone'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <List className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gallery */}
      <section className="px-6">
        <div className="max-w-7xl mx-auto">
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
                    className="bg-void-light rounded-xl border border-bone/10 p-4 flex items-center gap-4 group"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-void">
                      <img
                        src={miniature.thumbnail_url || miniature.images?.[0] || '/placeholder-miniature.jpg'}
                        alt={miniature.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/galeria/${miniature.id}`}>
                        <h3 className="font-display font-bold text-bone hover:text-imperial-gold transition-colors truncate">
                          {miniature.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-bone/50 truncate">{miniature.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-bone/40">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {miniature.likes_count || 0}
                        </span>
                        <span>
                          {new Date(miniature.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/mi-galeria/editar/${miniature.id}`}>
                        <motion.button
                          className="p-2 bg-bone/10 rounded-lg text-bone/60 hover:text-imperial-gold hover:bg-imperial-gold/10 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Pencil className="w-4 h-4" />
                        </motion.button>
                      </Link>
                      <motion.button
                        onClick={() => handleDelete(miniature.id)}
                        className="p-2 bg-bone/10 rounded-lg text-bone/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="w-4 h-4" />
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
              className="text-center py-20"
            >
              <motion.div
                className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-imperial-gold/10 border border-imperial-gold/30 mb-6"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(201, 162, 39, 0.2)',
                    '0 0 40px rgba(201, 162, 39, 0.4)',
                    '0 0 20px rgba(201, 162, 39, 0.2)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-12 h-12 text-imperial-gold" />
              </motion.div>

              <h2 className="text-2xl font-display font-bold text-bone mb-3">
                Tu galería está vacía
              </h2>
              <p className="text-bone/60 font-body mb-8 max-w-md mx-auto">
                Comparte tus miniaturas con la comunidad y recibe feedback de otros artistas.
              </p>

              <Link href="/mi-galeria/subir">
                <motion.button
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-imperial-gold to-yellow-500 text-void font-display font-bold tracking-wider uppercase text-sm rounded-lg"
                  whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(201, 162, 39, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-5 h-5" />
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
