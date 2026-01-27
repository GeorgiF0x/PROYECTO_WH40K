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
    <div className="p-4 bg-void rounded-xl border border-bone/10">
      <div className="flex items-start gap-3">
        <Avatar
          src={review.profiles?.avatar_url}
          alt={displayName}
          fallback={review.profiles?.username}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-body font-semibold text-bone text-sm">
              {displayName}
            </span>
            <RatingStars rating={review.rating} size="sm" />
          </div>
          <span className="text-xs text-bone/40 font-body">
            {timeAgo(review.created_at)}
          </span>
          {review.content && (
            <p className="mt-2 text-sm font-body text-bone/70 leading-relaxed">
              {review.content}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
