'use client'

import { BookOpen, Scroll } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface LoreBlockProps {
  title: string
  children: ReactNode
  icon?: 'book' | 'scroll'
  factionColor?: string
  className?: string
}

export function LoreBlock({
  title,
  children,
  icon = 'book',
  factionColor = '#C9A227',
  className,
}: LoreBlockProps) {
  const Icon = icon === 'book' ? BookOpen : Scroll

  return (
    <div
      className={cn('relative my-8 overflow-hidden rounded-xl', className)}
      style={{
        background: `linear-gradient(180deg, ${factionColor}10 0%, transparent 100%)`,
        border: `1px solid ${factionColor}25`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-3"
        style={{
          background: `${factionColor}15`,
          borderBottom: `1px solid ${factionColor}20`,
        }}
      >
        <Icon className="h-5 w-5" style={{ color: factionColor }} />
        <h3
          className="font-display text-base font-bold uppercase tracking-wider"
          style={{ color: factionColor }}
        >
          {title}
        </h3>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="prose-sm font-body leading-relaxed text-bone/85">{children}</div>
      </div>

      {/* Corner decorations */}
      <div
        className="absolute right-0 top-0 h-16 w-16 opacity-10"
        style={{
          background: `linear-gradient(135deg, ${factionColor} 0%, transparent 50%)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 h-16 w-16 opacity-10"
        style={{
          background: `linear-gradient(-45deg, ${factionColor} 0%, transparent 50%)`,
        }}
      />
    </div>
  )
}
