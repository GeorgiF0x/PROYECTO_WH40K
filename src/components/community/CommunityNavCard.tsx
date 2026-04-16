'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ArrowRight, MapPin, Users, Calendar, Store, Sparkles, Globe } from 'lucide-react'

// Map of icon names to components - icons must be imported here since they can't be passed from Server Components
const iconMap = {
  MapPin,
  Users,
  Calendar,
  Store,
  Sparkles,
  Globe,
} as const

type IconName = keyof typeof iconMap

interface CommunityNavCardProps {
  href: string
  title: string
  subtitle: string
  description: string
  icon: IconName
  count?: number
  countLabel?: string
  color: 'gold' | 'purple' | 'amber' | 'cyan'
  disabled?: boolean
  comingSoon?: boolean
  className?: string
}

const colorStyles = {
  gold: {
    gradient: 'from-imperial-gold/20 via-amber-500/10 to-transparent',
    border: 'border-imperial-gold/30 hover:border-imperial-gold/60',
    iconBg: 'bg-imperial-gold/20',
    iconColor: 'text-imperial-gold',
    glow: 'group-hover:shadow-imperial-gold/20',
    accent: 'bg-imperial-gold',
  },
  purple: {
    gradient: 'from-purple-500/20 via-pink-500/10 to-transparent',
    border: 'border-purple-500/30 hover:border-purple-500/60',
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-400',
    glow: 'group-hover:shadow-purple-500/20',
    accent: 'bg-purple-500',
  },
  amber: {
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    border: 'border-amber-500/30 hover:border-amber-500/60',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
    glow: 'group-hover:shadow-amber-500/20',
    accent: 'bg-amber-500',
  },
  cyan: {
    gradient: 'from-cyan-500/20 via-teal-500/10 to-transparent',
    border: 'border-cyan-500/30 hover:border-cyan-500/60',
    iconBg: 'bg-cyan-500/20',
    iconColor: 'text-cyan-400',
    glow: 'group-hover:shadow-cyan-500/20',
    accent: 'bg-cyan-500',
  },
}

export function CommunityNavCard({
  href,
  title,
  subtitle,
  description,
  icon,
  count,
  countLabel,
  color,
  disabled = false,
  comingSoon = false,
  className,
}: CommunityNavCardProps) {
  const styles = colorStyles[color]
  const Icon = iconMap[icon]

  const CardWrapper = disabled ? 'div' : Link

  return (
    <CardWrapper
      href={disabled ? undefined! : href}
      className={cn('block', disabled && 'cursor-not-allowed')}
    >
      <motion.div
        whileHover={disabled ? {} : { scale: 1.02, y: -4 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
        className={cn(
          'bg-void-900/50 group relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all',
          styles.border,
          !disabled && `shadow-lg ${styles.glow} group-hover:shadow-xl`,
          disabled && 'opacity-60',
          className
        )}
      >
        {/* Corner brackets */}
        <div className="absolute left-0 top-0 h-5 w-5 rounded-tl-2xl border-l-2 border-t-2 border-imperial-gold/40" />
        <div className="absolute right-0 top-0 h-5 w-5 rounded-tr-2xl border-r-2 border-t-2 border-imperial-gold/40" />
        <div className="absolute bottom-0 left-0 h-5 w-5 rounded-bl-2xl border-b-2 border-l-2 border-imperial-gold/40" />
        <div className="absolute bottom-0 right-0 h-5 w-5 rounded-br-2xl border-b-2 border-r-2 border-imperial-gold/40" />

        {/* Background gradient */}
        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', styles.gradient)} />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(201, 162, 39, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(201, 162, 39, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Content */}
        <div className="relative p-6">
          {/* Coming Soon Badge */}
          {comingSoon && (
            <div className="absolute right-4 top-4">
              <span className="rounded-full border border-amber-500/30 bg-amber-500/20 px-2 py-1 font-mono text-[10px] font-bold tracking-wider text-amber-400">
                PRÓXIMAMENTE
              </span>
            </div>
          )}

          {/* Icon */}
          <motion.div
            className={cn(
              'mb-4 flex h-14 w-14 items-center justify-center rounded-xl',
              styles.iconBg
            )}
            whileHover={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Icon className={cn('h-7 w-7', styles.iconColor)} />
          </motion.div>

          {/* Subtitle */}
          <p className={cn('mb-1 font-mono text-[10px] tracking-widest', styles.iconColor)}>
            {subtitle}
          </p>

          {/* Title */}
          <h3 className="font-heading text-bone-100 mb-2 text-xl font-bold">{title}</h3>

          {/* Description */}
          <p className="text-bone-500 mb-4 text-sm leading-relaxed">{description}</p>

          {/* Footer: Count + Arrow */}
          <div className="flex items-center justify-between">
            {count !== undefined && countLabel && (
              <div className="flex items-center gap-2">
                <span className={cn('h-1.5 w-1.5 rounded-full', styles.accent)} />
                <span className="text-bone-400 font-mono text-xs">
                  <span className={cn('font-bold', styles.iconColor)}>{count}</span> {countLabel}
                </span>
              </div>
            )}
            {comingSoon && !count && (
              <span className="text-bone-600 font-mono text-xs">En desarrollo</span>
            )}
            {!disabled && (
              <motion.div
                className={cn('flex items-center gap-1 font-mono text-sm', styles.iconColor)}
                whileHover={{ x: 5 }}
              >
                <span className="text-xs">EXPLORAR</span>
                <ArrowRight className="h-4 w-4" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Bottom accent line */}
        <motion.div
          className={cn('absolute bottom-0 left-0 right-0 h-1', styles.accent)}
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: 'left' }}
        />
      </motion.div>
    </CardWrapper>
  )
}
