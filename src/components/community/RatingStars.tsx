'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface RatingStarsProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
  showValue?: boolean
}

const sizeMap = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

export default function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
}: RatingStarsProps) {
  const [hovered, setHovered] = useState(0)

  const displayRating = hovered || rating

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, i) => {
          const starValue = i + 1
          const filled = starValue <= displayRating
          const halfFilled = !filled && starValue - 0.5 <= displayRating

          return interactive ? (
            <motion.button
              key={i}
              type="button"
              onClick={() => onChange?.(starValue)}
              onMouseEnter={() => setHovered(starValue)}
              onMouseLeave={() => setHovered(0)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="focus:outline-none"
            >
              <Star
                className={`${sizeMap[size]} transition-colors ${
                  filled
                    ? 'text-imperial-gold fill-imperial-gold'
                    : 'text-bone/20'
                }`}
              />
            </motion.button>
          ) : (
            <Star
              key={i}
              className={`${sizeMap[size]} ${
                filled
                  ? 'text-imperial-gold fill-imperial-gold'
                  : halfFilled
                  ? 'text-imperial-gold fill-imperial-gold/50'
                  : 'text-bone/20'
              }`}
            />
          )
        })}
      </div>
      {showValue && (
        <span className="text-sm font-body text-bone/60 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
