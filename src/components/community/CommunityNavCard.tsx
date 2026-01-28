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
          'relative overflow-hidden rounded-2xl border bg-void-900/50 backdrop-blur-sm transition-all group',
          styles.border,
          !disabled && `shadow-lg ${styles.glow} group-hover:shadow-xl`,
          disabled && 'opacity-60',
          className
        )}
      >
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-5 h-5 border-l-2 border-t-2 border-imperial-gold/40 rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-5 h-5 border-r-2 border-t-2 border-imperial-gold/40 rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-l-2 border-b-2 border-imperial-gold/40 rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-r-2 border-b-2 border-imperial-gold/40 rounded-br-2xl" />

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
            <div className="absolute top-4 right-4">
              <span className="px-2 py-1 text-[10px] font-mono font-bold text-amber-400 bg-amber-500/20 border border-amber-500/30 rounded-full tracking-wider">
                PRÓXIMAMENTE
              </span>
            </div>
          )}

          {/* Icon */}
          <motion.div
            className={cn(
              'w-14 h-14 rounded-xl flex items-center justify-center mb-4',
              styles.iconBg
            )}
            whileHover={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Icon className={cn('w-7 h-7', styles.iconColor)} />
          </motion.div>

          {/* Subtitle */}
          <p className={cn('text-[10px] font-mono tracking-widest mb-1', styles.iconColor)}>
            {subtitle}
          </p>

          {/* Title */}
          <h3 className="text-xl font-heading font-bold text-bone-100 mb-2">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-bone-500 mb-4 leading-relaxed">
            {description}
          </p>

          {/* Footer: Count + Arrow */}
          <div className="flex items-center justify-between">
            {count !== undefined && countLabel && (
              <div className="flex items-center gap-2">
                <span className={cn('w-1.5 h-1.5 rounded-full', styles.accent)} />
                <span className="text-xs font-mono text-bone-400">
                  <span className={cn('font-bold', styles.iconColor)}>{count}</span> {countLabel}
                </span>
              </div>
            )}
            {comingSoon && !count && (
              <span className="text-xs font-mono text-bone-600">En desarrollo</span>
            )}
            {!disabled && (
              <motion.div
                className={cn('flex items-center gap-1 text-sm font-mono', styles.iconColor)}
                whileHover={{ x: 5 }}
              >
                <span className="text-xs">EXPLORAR</span>
                <ArrowRight className="w-4 h-4" />
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
