'use client'

import { motion } from 'framer-motion'
import { Feather, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

type WikiRole = 'scribe' | 'lexicanum'

interface ScribeBadgeProps {
  role: WikiRole
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const roleConfig: Record<WikiRole, {
  label: string
  title: string
  icon: typeof Feather
  colorHex: string
}> = {
  scribe: {
    label: 'Scribe',
    title: 'Lexicanum Scribe',
    icon: Feather,
    colorHex: '#f59e0b', // amber-500
  },
  lexicanum: {
    label: 'Lexicanum',
    title: 'Lexicanum',
    icon: BookOpen,
    colorHex: '#fbbf24', // amber-400
  },
}

const sizeConfig = {
  sm: {
    icon: 'w-3 h-3',
    padding: 'px-1.5 py-0.5',
    text: 'text-xs',
    gap: 'gap-1',
  },
  md: {
    icon: 'w-4 h-4',
    padding: 'px-2 py-1',
    text: 'text-sm',
    gap: 'gap-1.5',
  },
  lg: {
    icon: 'w-5 h-5',
    padding: 'px-3 py-1.5',
    text: 'text-base',
    gap: 'gap-2',
  },
}

export function ScribeBadge({
  role,
  size = 'md',
  showLabel = true,
  className,
}: ScribeBadgeProps) {
  const config = roleConfig[role]
  const sizes = sizeConfig[size]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'inline-flex items-center rounded-lg backdrop-blur-sm',
        sizes.padding,
        sizes.gap,
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${config.colorHex}25, rgba(10,10,15,0.8))`,
        border: `1px solid ${config.colorHex}40`,
        boxShadow: `0 2px 10px ${config.colorHex}15`,
      }}
      whileHover={{
        boxShadow: `0 4px 20px ${config.colorHex}30`,
        borderColor: `${config.colorHex}60`,
      }}
      title={config.title}
    >
      <Icon className={cn(sizes.icon)} style={{ color: config.colorHex }} />
      {showLabel && (
        <span
          className={cn(sizes.text, 'font-medium')}
          style={{ color: config.colorHex }}
        >
          {config.title}
        </span>
      )}
    </motion.div>
  )
}
