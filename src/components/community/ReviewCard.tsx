'use client'

import { timeAgo } from '@/lib/utils'
import { Avatar } from '@/components/ui'
import RatingStars from './RatingStars'

interface ReviewCardProps {
  review: {
    id: string
    rating: number
    content: string | null
    created_at: string
    profiles?: {
      username: string
      display_name: string | null
      avatar_url: string | null
    } | null
  }
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const displayName = review.profiles?.display_name || review.profiles?.username || 'Usuario'

  return (
    <div className="rounded-xl border border-bone/10 bg-void p-4">
      <div className="flex items-start gap-3">
        <Avatar
          src={review.profiles?.avatar_url}
          alt={displayName}
          fallback={review.profiles?.username}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-body text-sm font-semibold text-bone">{displayName}</span>
            <RatingStars rating={review.rating} size="sm" />
          </div>
          <span className="font-body text-xs text-bone/40">{timeAgo(review.created_at)}</span>
          {review.content && (
            <p className="mt-2 font-body text-sm leading-relaxed text-bone/70">{review.content}</p>
          )}
        </div>
      </div>
    </div>
  )
}
