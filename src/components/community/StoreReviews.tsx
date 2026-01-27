'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import RatingStars from './RatingStars'
import ReviewCard from './ReviewCard'

interface StoreReviewsProps {
  storeId: string
  userId?: string
}

interface ReviewWithProfile {
  id: string
  store_id: string
  reviewer_id: string
  rating: number
  content: string | null
  created_at: string
  profiles: {
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

export default function StoreReviews({ storeId, userId }: StoreReviewsProps) {
  const supabase = createClient()
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newRating, setNewRating] = useState(0)
  const [newContent, setNewContent] = useState('')
  const [userHasReview, setUserHasReview] = useState(false)

  const fetchReviews = useCallback(async () => {
    setIsLoading(true)
    const { data, error: fetchError } = await supabase
      .from('store_reviews')
      .select(`
        *,
        profiles:reviewer_id(username, display_name, avatar_url)
      `)
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Error fetching reviews:', fetchError)
    } else {
      setReviews((data as unknown as ReviewWithProfile[]) || [])
      if (userId) {
        setUserHasReview(data?.some((r) => r.reviewer_id === userId) || false)
      }
    }
    setIsLoading(false)
  }, [storeId, userId, supabase])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    if (newRating === 0) {
      setError('Selecciona una puntuacion')
      return
    }

    setError(null)
    setIsSubmitting(true)

    const { error: insertError } = await supabase
      .from('store_reviews')
      .insert({
        store_id: storeId,
        reviewer_id: userId,
        rating: newRating,
        content: newContent.trim() || null,
      })

    if (insertError) {
      if (insertError.code === '23505') {
        setError('Ya has valorado esta tienda')
      } else {
        setError(insertError.message)
      }
    } else {
      setNewRating(0)
      setNewContent('')
      await fetchReviews()
    }

    setIsSubmitting(false)
  }

  return (
    <div className="p-6 bg-void-light rounded-2xl border border-bone/10">
      <h3 className="font-display font-semibold text-bone text-lg flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-imperial-gold" />
        Valoraciones ({reviews.length})
      </h3>

      {/* Submit review form */}
      {userId && !userHasReview && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-void rounded-xl border border-bone/10">
          <p className="text-sm font-body text-bone/60 mb-3">Tu valoracion</p>

          <div className="mb-4">
            <RatingStars
              rating={newRating}
              interactive
              onChange={setNewRating}
              size="lg"
            />
          </div>

          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Escribe tu experiencia (opcional)..."
            rows={3}
            className="w-full px-4 py-3 bg-void-light border border-bone/10 rounded-xl font-body text-bone text-sm placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 transition-colors resize-none mb-3"
          />

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 flex items-center gap-2 text-sm text-red-400"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={isSubmitting || newRating === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-imperial-gold text-void font-display font-bold text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Enviar valoracion
          </motion.button>
        </form>
      )}

      {!userId && (
        <p className="mb-6 text-sm text-bone/40 font-body text-center py-4 bg-void rounded-xl border border-bone/10">
          Inicia sesion para dejar una valoracion
        </p>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 bg-void rounded-xl animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-bone/10" />
                <div className="h-4 bg-bone/10 rounded w-24" />
              </div>
              <div className="mt-3 h-3 bg-bone/10 rounded w-full" />
              <div className="mt-2 h-3 bg-bone/10 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-bone/40 font-body text-center py-8">
          Aun no hay valoraciones. Se el primero en opinar.
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  )
}
