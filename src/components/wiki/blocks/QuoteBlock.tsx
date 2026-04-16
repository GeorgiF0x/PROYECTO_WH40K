'use client'

import { Quote as QuoteIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuoteBlockProps {
  text: string
  author?: string
  source?: string
  factionColor?: string
  className?: string
}

export function QuoteBlock({
  text,
  author,
  source,
  factionColor = '#C9A227',
  className,
}: QuoteBlockProps) {
  return (
    <blockquote
      className={cn('relative my-8 rounded-xl p-6', className)}
      style={{
        background: `linear-gradient(135deg, ${factionColor}15 0%, transparent 100%)`,
        border: `1px solid ${factionColor}30`,
      }}
    >
      <QuoteIcon
        className="absolute left-3 top-3 h-6 w-6 opacity-30"
        style={{ color: factionColor }}
      />
      <QuoteIcon
        className="absolute bottom-3 right-3 h-6 w-6 rotate-180 opacity-30"
        style={{ color: factionColor }}
      />

      <div className="pl-6">
        <p className="font-body text-lg italic leading-relaxed text-bone/90">"{text}"</p>

        {(author || source) && (
          <footer className="mt-4 font-body">
            {author && (
              <span className="font-semibold" style={{ color: factionColor }}>
                {author}
              </span>
            )}
            {source && <span className="text-bone/50"> — {source}</span>}
          </footer>
        )}
      </div>
    </blockquote>
  )
}
