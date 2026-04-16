'use client'

import { useState } from 'react'
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

/** Hostnames whitelisted in next.config.js remotePatterns */
const OPTIMIZED_HOSTNAMES = [
  'yvjflhvbtjjmdwkgqqfs.supabase.co',
  'images.unsplash.com',
  'img.youtube.com',
  'i.ytimg.com',
  'lh3.googleusercontent.com',
]

function isOptimizableUrl(src: string): boolean {
  try {
    const url = new URL(src)
    return OPTIMIZED_HOSTNAMES.includes(url.hostname)
  } catch {
    // Relative URLs (e.g. /images/foo.png) are optimizable by Next.js
    return src.startsWith('/')
  }
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
  const [broken, setBroken] = useState(false)
  const optimizable = isOptimizableUrl(src)

  return (
    <figure className={cn('my-8', sizeClasses[size], alignClasses[align], className)}>
      <div
        className="relative overflow-hidden rounded-lg"
        style={{
          border: `1px solid ${factionColor}30`,
        }}
      >
        <div
          className="bg-void-950 relative flex items-center justify-center"
          style={{ maxHeight: '500px' }}
        >
          {broken ? (
            <div className="flex flex-col items-center justify-center py-16 text-bone/40">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mb-2 h-10 w-10 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                />
              </svg>
              <span className="font-body text-xs">Image not found</span>
            </div>
          ) : optimizable ? (
            <Image
              src={src}
              alt={alt}
              width={800}
              height={500}
              className="h-auto max-h-[500px] w-full object-contain"
              onError={() => setBroken(true)}
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={src}
              alt={alt}
              loading="lazy"
              className="h-auto max-h-[500px] w-full object-contain"
              onError={() => setBroken(true)}
            />
          )}
        </div>

        {/* Overlay gradient */}
        {!broken && (
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background: `linear-gradient(135deg, ${factionColor}20 0%, transparent 50%, ${factionColor}10 100%)`,
            }}
          />
        )}
      </div>

      {caption && (
        <figcaption className="mt-3 text-center">
          <p className="font-body text-sm italic text-bone/60">{caption}</p>
        </figcaption>
      )}
    </figure>
  )
}
