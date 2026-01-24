'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export interface AvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-xl',
}

export function Avatar({ src, alt = '', fallback, size = 'md', className }: AvatarProps) {
  const [hasError, setHasError] = useState(false)

  const initials = fallback
    ? fallback.slice(0, 2).toUpperCase()
    : alt
      ? alt.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      : '?'

  if (!src || hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-blood text-bone font-bold',
          sizeClasses[size],
          className
        )}
        aria-label={alt}
      >
        {initials}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={cn(
        'rounded-full object-cover',
        sizeClasses[size],
        className
      )}
    />
  )
}
