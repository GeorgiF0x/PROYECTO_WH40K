'use client'

import { AlertTriangle, Skull, Info, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type WarningType = 'heresy' | 'danger' | 'info' | 'imperial'

interface WarningBlockProps {
  type?: WarningType
  title?: string
  children: ReactNode
  className?: string
}

const warningConfig: Record<WarningType, {
  icon: typeof AlertTriangle
  color: string
  bgColor: string
  borderColor: string
  defaultTitle: string
}> = {
  heresy: {
    icon: Skull,
    color: '#DC143C',
    bgColor: 'rgba(220, 20, 60, 0.1)',
    borderColor: 'rgba(220, 20, 60, 0.3)',
    defaultTitle: 'Advertencia de Herejia',
  },
  danger: {
    icon: AlertTriangle,
    color: '#FF6B35',
    bgColor: 'rgba(255, 107, 53, 0.1)',
    borderColor: 'rgba(255, 107, 53, 0.3)',
    defaultTitle: 'Peligro',
  },
  info: {
    icon: Info,
    color: '#00D4AA',
    bgColor: 'rgba(0, 212, 170, 0.1)',
    borderColor: 'rgba(0, 212, 170, 0.3)',
    defaultTitle: 'Informacion',
  },
  imperial: {
    icon: ShieldAlert,
    color: '#C9A227',
    bgColor: 'rgba(201, 162, 39, 0.1)',
    borderColor: 'rgba(201, 162, 39, 0.3)',
    defaultTitle: 'Decreto Imperial',
  },
}

export function WarningBlock({ type = 'info', title, children, className }: WarningBlockProps) {
  const config = warningConfig[type]
  const Icon = config.icon
  const displayTitle = title || config.defaultTitle

  return (
    <div
      className={cn(
        'my-6 p-4 rounded-lg',
        className
      )}
      style={{
        background: config.bgColor,
        borderLeft: `4px solid ${config.color}`,
      }}
    >
      <div className="flex items-start gap-3">
        <Icon
          className="w-5 h-5 mt-0.5 flex-shrink-0"
          style={{ color: config.color }}
        />
        <div className="flex-1 min-w-0">
          <h4
            className="font-display text-sm font-bold uppercase tracking-wider mb-2"
            style={{ color: config.color }}
          >
            {displayTitle}
          </h4>
          <div className="font-body text-sm text-bone/80 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
