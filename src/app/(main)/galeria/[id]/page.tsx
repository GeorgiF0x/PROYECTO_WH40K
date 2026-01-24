'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { Avatar } from '@/components/ui'
import {
  Heart,
  MessageCircle,
  Share2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Eye,
  Flag,
  Bookmark,
  Send,
  MoreHorizontal,
  X,
  ZoomIn,
} from 'lucide-react'
import type { Miniature, Profile } from '@/lib/types/database.types'

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: Profile
}

export default function MiniatureDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [miniature, setMiniature] = useState<(Miniature & { profiles: Profile }) | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [isSaved, setIsSaved] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [showLightbox, setShowLightbox] = useState(false)
  const [relatedMiniatures, setRelatedMiniatures] = useState<Miniature[]>([])

  const supabase = createClient()
  const miniatureId = typeof params.id === 'string' ? params.id : params.id?.[0]

  useEffect(() => {
    if (miniatureId) {
      fetchMiniature()
      fetchComments()
      fetchRelatedMiniatures()
    }
  }, [miniatureId])

  // Check if user has liked this miniature
  useEffect(() => {
    if (miniatureId && user?.id) {
      checkIfLiked()
    }
  }, [miniatureId, user?.id])

  const checkIfLiked = async () => {
    if (!user?.id) return
    const { data } = await supabase
      .from('miniature_likes')
      .select('id')
      .eq('miniature_id', miniatureId as string)
      .eq('user_id', user.id)
      .single()

    setIsLiked(!!data)
  }

  const fetchMiniature = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('miniatures')
      .select(`
        *,
        profiles:user_id (*)
      `)
      .eq('id', miniatureId as string)
      .single()

    if (error) {
      console.error('Error fetching miniature:', error)
    } else {
      setMiniature(data)
      // likes_count is computed from the miniature_likes table via trigger
      setLikesCount((data as unknown as { likes_count?: number }).likes_count || 0)
    }
    setIsLoading(false)
  }

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('miniature_comments')
      .select(`
        *,
        profiles:user_id (*)
      `)
      .eq('miniature_id', miniatureId as string)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setComments(data)
    }
  }

  const fetchRelatedMiniatures = async () => {
    const { data } = await supabase
      .from('miniatures')
      .select('*')
      .neq('id', miniatureId as string)
      .limit(4)

    if (data) {
      setRelatedMiniatures(data)
    }
  }

  const handleLike = async () => {
    if (!isAuthenticated || !user?.id) {
      router.push('/login')
      return
    }

    // Optimistic update
    const wasLiked = isLiked
    setIsLiked(!wasLiked)
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1))

    if (wasLiked) {
      // Remove like
      const { error } = await supabase
        .from('miniature_likes')
        .delete()
        .eq('miniature_id', miniatureId as string)
        .eq('user_id', user.id)

      if (error) {
        // Revert on error
        setIsLiked(true)
        setLikesCount((prev) => prev + 1)
        console.error('Error removing like:', error)
      }
    } else {
      // Add like
      const { error } = await supabase
        .from('miniature_likes')
        .insert({
          miniature_id: miniatureId as string,
          user_id: user.id,
        })

      if (error) {
        // Revert on error
        setIsLiked(false)
        setLikesCount((prev) => prev - 1)
        console.error('Error adding like:', error)
      }
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !isAuthenticated || !user?.id) return

    setIsSubmittingComment(true)
    const { error } = await supabase.from('miniature_comments').insert({
      miniature_id: miniatureId as string,
      user_id: user.id,
      content: newComment.trim(),
    })

    if (!error) {
      setNewComment('')
      fetchComments()
    }
    setIsSubmittingComment(false)
  }

  const nextImage = () => {
    if (miniature?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % miniature.images.length)
    }
  }

  const prevImage = () => {
    if (miniature?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + miniature.images.length) % miniature.images.length)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Skeleton */}
            <div className="aspect-square bg-void-light rounded-2xl animate-pulse" />
            {/* Info Skeleton */}
            <div className="space-y-6">
              <div className="h-10 bg-void-light rounded-lg w-3/4 animate-pulse" />
              <div className="h-4 bg-void-light rounded w-full animate-pulse" />
              <div className="h-4 bg-void-light rounded w-2/3 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!miniature) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold text-bone mb-4">
            Miniatura no encontrada
          </h2>
          <Link href="/galeria">
            <motion.button
              className="px-6 py-3 bg-imperial-gold text-void font-semibold rounded-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Volver a la galería
            </motion.button>
          </Link>
        </div>
      </div>
    )
  }

  const images = miniature.images?.length ? miniature.images : [miniature.thumbnail_url || '/placeholder-miniature.jpg']

  return (
    <>
      <div className="min-h-screen pt-24 pb-16">
        {/* Back Button */}
        <div className="px-6 mb-6">
          <div className="max-w-7xl mx-auto">
            <motion.button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-bone/60 hover:text-imperial-gold transition-colors"
              whileHover={{ x: -4 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-body">Volver</span>
            </motion.button>
          </div>
        </div>

        <div className="px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Image Gallery */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                {/* Main Image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-void-light group">
                  <motion.div
                    className="absolute -inset-[1px] rounded-2xl opacity-60"
                    style={{
                      background: 'linear-gradient(135deg, #C9A227 0%, transparent 50%, #C9A227 100%)',
                    }}
                  />
                  <div className="relative h-full bg-void-light rounded-2xl overflow-hidden">
                    <Image
                      src={images[currentImageIndex]}
                      alt={miniature.title}
                      fill
                      className="object-cover cursor-zoom-in"
                      onClick={() => setShowLightbox(true)}
                    />

                    {/* Zoom indicator */}
                    <div className="absolute top-4 right-4 p-2 bg-void/80 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn className="w-5 h-5 text-bone" />
                    </div>

                    {/* Navigation arrows */}
                    {images.length > 1 && (
                      <>
                        <motion.button
                          onClick={(e) => { e.stopPropagation(); prevImage(); }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-void/80 backdrop-blur-sm rounded-full text-bone opacity-0 group-hover:opacity-100 transition-opacity"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          onClick={(e) => { e.stopPropagation(); nextImage(); }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-void/80 backdrop-blur-sm rounded-full text-bone opacity-0 group-hover:opacity-100 transition-opacity"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </motion.button>
                      </>
                    )}

                    {/* Image counter */}
                    {images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-void/80 backdrop-blur-sm rounded-full text-sm text-bone">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    )}
                  </div>
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {images.map((img, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${
                          idx === currentImageIndex
                            ? 'ring-2 ring-imperial-gold'
                            : 'ring-1 ring-bone/10 opacity-60 hover:opacity-100'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Image src={img} alt="" fill className="object-cover" />
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Info Panel */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-6"
              >
                {/* Title and Actions */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-bone mb-2">
                      {miniature.title}
                    </h1>
                    <div className="flex items-center gap-4 text-bone/50 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(miniature.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {Math.floor(Math.random() * 5000)} vistas
                      </span>
                    </div>
                  </div>

                  <motion.button
                    className="p-2 text-bone/40 hover:text-bone transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Author */}
                <Link href={`/usuarios/${miniature.profiles.username}`}>
                  <motion.div
                    className="flex items-center gap-4 p-4 bg-void-light rounded-xl hover:bg-void-light/80 transition-colors group"
                    whileHover={{ scale: 1.01 }}
                  >
                    <Avatar
                      src={miniature.profiles.avatar_url}
                      alt={miniature.profiles.display_name || miniature.profiles.username}
                      fallback={miniature.profiles.username}
                      size="lg"
                    />
                    <div className="flex-1">
                      <p className="font-display font-semibold text-bone group-hover:text-imperial-gold transition-colors">
                        {miniature.profiles.display_name || miniature.profiles.username}
                      </p>
                      <p className="text-sm text-bone/50">@{miniature.profiles.username}</p>
                    </div>
                    <motion.button
                      className="px-4 py-2 bg-imperial-gold/10 border border-imperial-gold/30 text-imperial-gold font-semibold text-sm rounded-lg"
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(201, 162, 39, 0.2)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => e.preventDefault()}
                    >
                      Seguir
                    </motion.button>
                  </motion.div>
                </Link>

                {/* Description */}
                {miniature.description && (
                  <div className="prose prose-invert max-w-none">
                    <p className="text-bone/70 font-body leading-relaxed">
                      {miniature.description}
                    </p>
                  </div>
                )}

                {/* Stats and Actions */}
                <div className="flex items-center gap-3">
                  <motion.button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
                      isLiked
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-void-light border border-bone/10 text-bone hover:border-red-500/30 hover:text-red-400'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-400' : ''}`} />
                    <span>{likesCount}</span>
                  </motion.button>

                  <motion.button
                    onClick={() => setIsSaved(!isSaved)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
                      isSaved
                        ? 'bg-imperial-gold/20 text-imperial-gold border border-imperial-gold/30'
                        : 'bg-void-light border border-bone/10 text-bone hover:border-imperial-gold/30 hover:text-imperial-gold'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-imperial-gold' : ''}`} />
                    <span>Guardar</span>
                  </motion.button>

                  <motion.button
                    className="flex items-center gap-2 px-5 py-3 bg-void-light border border-bone/10 text-bone hover:border-bone/30 rounded-xl font-semibold transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Compartir</span>
                  </motion.button>

                  <motion.button
                    className="p-3 bg-void-light border border-bone/10 text-bone/50 hover:text-red-400 hover:border-red-500/30 rounded-xl transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Flag className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-bone/10 to-transparent" />

                {/* Comments Section */}
                <div>
                  <h3 className="text-xl font-display font-bold text-bone mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-imperial-gold" />
                    Comentarios ({comments.length})
                  </h3>

                  {/* Comment Input */}
                  {isAuthenticated ? (
                    <div className="flex gap-3 mb-6">
                      <Avatar
                        src={null}
                        alt="Tu avatar"
                        fallback={user?.email?.charAt(0).toUpperCase()}
                        size="sm"
                      />
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder="Escribe un comentario..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                          className="w-full px-4 py-3 pr-12 bg-void border border-bone/10 rounded-xl text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50"
                        />
                        <motion.button
                          onClick={handleSubmitComment}
                          disabled={!newComment.trim() || isSubmittingComment}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-imperial-gold disabled:text-bone/30 disabled:cursor-not-allowed"
                          whileHover={newComment.trim() ? { scale: 1.1 } : {}}
                          whileTap={newComment.trim() ? { scale: 0.9 } : {}}
                        >
                          <Send className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <Link href="/login">
                      <div className="p-4 bg-void-light rounded-xl text-center mb-6 hover:bg-void-light/80 transition-colors cursor-pointer">
                        <p className="text-bone/60">
                          <span className="text-imperial-gold">Inicia sesión</span> para comentar
                        </p>
                      </div>
                    </Link>
                  )}

                  {/* Comments List */}
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {comments.length === 0 ? (
                      <p className="text-bone/40 text-center py-8">
                        Sé el primero en comentar
                      </p>
                    ) : (
                      comments.map((comment) => (
                        <motion.div
                          key={comment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-3 p-4 bg-void-light rounded-xl"
                        >
                          <Avatar
                            src={comment.profiles.avatar_url}
                            alt={comment.profiles.display_name || comment.profiles.username}
                            fallback={comment.profiles.username}
                            size="sm"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-bone text-sm">
                                {comment.profiles.display_name || comment.profiles.username}
                              </span>
                              <span className="text-xs text-bone/40">
                                {new Date(comment.created_at).toLocaleDateString('es-ES')}
                              </span>
                            </div>
                            <p className="text-bone/70 text-sm">{comment.content}</p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Related Miniatures */}
            {relatedMiniatures.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-20"
              >
                <h2 className="text-2xl font-display font-bold text-bone mb-8">
                  Más Miniaturas
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {relatedMiniatures.map((m) => (
                    <Link key={m.id} href={`/galeria/${m.id}`}>
                      <motion.div
                        className="relative aspect-square rounded-xl overflow-hidden group"
                        whileHover={{ scale: 1.02 }}
                      >
                        <Image
                          src={m.thumbnail_url || m.images?.[0] || '/placeholder-miniature.jpg'}
                          alt={m.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-void/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-4 left-4 right-4">
                            <p className="font-display font-bold text-bone text-sm truncate">
                              {m.title}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </motion.section>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-void/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setShowLightbox(false)}
          >
            <motion.button
              className="absolute top-6 right-6 p-3 bg-bone/10 rounded-full text-bone hover:bg-bone/20 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6" />
            </motion.button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[currentImageIndex]}
                alt={miniature.title}
                width={1200}
                height={1200}
                className="object-contain w-full h-full"
              />

              {images.length > 1 && (
                <>
                  <motion.button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-void/80 rounded-full text-bone"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </motion.button>
                  <motion.button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-void/80 rounded-full text-bone"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </motion.button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
