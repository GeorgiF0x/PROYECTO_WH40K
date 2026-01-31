'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ImageBlockProps {
  src: string
  alt: string
  caption?: string
  align?: 'left' | 'center' | 'right'
  size?: 'small' | 'medium' | 'large' | 'full'
  factionColor?: string
  className?: string
}

const sizeClasses = {
  small: 'max-w-xs',
  medium: 'max-w-md',
  large: 'max-w-2xl',
  full: 'max-w-full',
}

const alignClasses = {
  left: 'mr-auto',
  center: 'mx-auto',
  right: 'ml-auto',
}

export function ImageBlock({
  src,
  alt,
  caption,
  align = 'center',
  size = 'large',
  factionColor = '#C9A227',
  className,
}: ImageBlockProps) {
  return (
    <figure
      className={cn(
        'my-8',
        sizeClasses[size],
        alignClasses[align],
        className
      )}
    >
      <div
        className="relative overflow-hidden rounded-lg"
        style={{
          border: `1px solid ${factionColor}30`,
        }}
      >
        <div className="relative aspect-video">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
          />
        </div>

        {/* Overlay gradient */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: `linear-gradient(135deg, ${factionColor}20 0%, transparent 50%, ${factionColor}10 100%)`,
          }}
        />
      </div>

      {caption && (
        <figcaption className="mt-3 text-center">
          <p className="font-body text-sm text-bone/60 italic">
            {caption}
          </p>
        </figcaption>
      )}
    </figure>
  )
}
