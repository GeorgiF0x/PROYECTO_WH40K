'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { UserRole, CreatorStatus } from '@/lib/types/database.types'
import {
  ROLE_DISPLAY_NAMES,
  ATTRIBUTE_DISPLAY_NAMES,
  getDisplayRole,
  getUserBadges,
} from '@/lib/permissions'

interface RoleBadgeProps {
  role: UserRole
  creatorStatus?: CreatorStatus
  isStoreOwner?: boolean
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  showAllBadges?: boolean
  className?: string
}

const BADGE_SIZES = {
  sm: { icon: 16, container: 'h-5 px-1.5 text-xs', gap: 'gap-1' },
  md: { icon: 20, container: 'h-7 px-2 text-sm', gap: 'gap-1.5' },
  lg: { icon: 24, container: 'h-9 px-3 text-base', gap: 'gap-2' },
}

const BADGE_COLORS: Record<string, string> = {
  admin: 'bg-gradient-to-r from-imperial-gold/20 to-blood-red/20 border-imperial-gold/50 text-imperial-gold',
  moderator: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400/50 text-blue-300',
  creator: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/50 text-purple-300',
  store_owner: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400/50 text-amber-300',
  user: 'bg-void-light/30 border-bone/30 text-bone/70',
}

export function RoleBadge({
  role,
  creatorStatus = 'none',
  isStoreOwner = false,
  size = 'md',
  showTooltip = true,
  showAllBadges = false,
  className,
}: RoleBadgeProps) {
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null)
  const sizeConfig = BADGE_SIZES[size]

  // Get badges to display
  const badges = showAllBadges
    ? getUserBadges(role, creatorStatus, isStoreOwner)
    : [getDisplayRole(role, creatorStatus, isStoreOwner)]

  // Don't show anything if it's just a regular user badge and we're showing all badges
  if (showAllBadges && badges.length === 0) {
    return null
  }

  // Don't show the default user badge unless explicitly wanted
  if (!showAllBadges && role === 'user' && creatorStatus !== 'approved' && !isStoreOwner) {
    return null
  }

  return (
    <div className={cn('flex flex-wrap', sizeConfig.gap, className)}>
      {badges.map((badge, index) => {
        const colorKey = badge.type === 'role' ? role : badge.type === 'creator' ? 'creator' : 'store_owner'

        return (
          <div
            key={`${badge.type}-${index}`}
            className="relative"
            onMouseEnter={() => setHoveredBadge(`${badge.type}-${index}`)}
            onMouseLeave={() => setHoveredBadge(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'flex items-center rounded-full border backdrop-blur-sm',
                sizeConfig.container,
                sizeConfig.gap,
                BADGE_COLORS[colorKey]
              )}
            >
              {/* Icon with glow effect */}
              <div className="relative">
                <Image
                  src={badge.icon}
                  alt={badge.name}
                  width={sizeConfig.icon}
                  height={sizeConfig.icon}
                  className="brightness-0 invert opacity-80"
                />
                {/* Subtle glow behind icon */}
                <div
                  className="absolute inset-0 blur-sm opacity-50"
                  style={{
                    background: `radial-gradient(circle, ${
                      colorKey === 'admin'
                        ? 'rgba(201, 162, 39, 0.5)'
                        : colorKey === 'moderator'
                        ? 'rgba(96, 165, 250, 0.5)'
                        : colorKey === 'creator'
                        ? 'rgba(168, 85, 247, 0.5)'
                        : 'rgba(251, 191, 36, 0.5)'
                    } 0%, transparent 70%)`,
                  }}
                />
              </div>

              {/* Name */}
              <span className="font-medium whitespace-nowrap">{badge.name}</span>
            </motion.div>

            {/* Tooltip */}
            <AnimatePresence>
              {showTooltip && hoveredBadge === `${badge.type}-${index}` && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-void-dark/95 border border-bone/20 rounded-lg shadow-xl backdrop-blur-sm whitespace-nowrap"
                >
                  <div className="text-sm font-medium text-bone">{badge.title}</div>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-void-dark/95" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

// Single icon badge (no text, just icon with glow)
interface RoleIconProps {
  role: UserRole
  creatorStatus?: CreatorStatus
  isStoreOwner?: boolean
  size?: number
  showTooltip?: boolean
  className?: string
}

export function RoleIcon({
  role,
  creatorStatus = 'none',
  isStoreOwner = false,
  size = 20,
  showTooltip = true,
  className,
}: RoleIconProps) {
  const [isHovered, setIsHovered] = useState(false)
  const displayRole = getDisplayRole(role, creatorStatus, isStoreOwner)

  // Don't show for regular users
  if (role === 'user' && creatorStatus !== 'approved' && !isStoreOwner) {
    return null
  }

  const colorKey = displayRole.type === 'role' ? role : displayRole.type === 'creator' ? 'creator' : 'store_owner'

  return (
    <div
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="relative"
      >
        <Image
          src={displayRole.icon}
          alt={displayRole.name}
          width={size}
          height={size}
          className="brightness-0 invert opacity-90"
        />
        {/* Glow effect */}
        <div
          className="absolute inset-0 blur-md opacity-60"
          style={{
            background: `radial-gradient(circle, ${
              colorKey === 'admin'
                ? 'rgba(201, 162, 39, 0.6)'
                : colorKey === 'moderator'
                ? 'rgba(96, 165, 250, 0.6)'
                : colorKey === 'creator'
                ? 'rgba(168, 85, 247, 0.6)'
                : 'rgba(251, 191, 36, 0.6)'
            } 0%, transparent 70%)`,
          }}
        />
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-void-dark/95 border border-bone/20 rounded-lg shadow-xl backdrop-blur-sm whitespace-nowrap"
          >
            <div className="text-sm font-medium text-bone">{displayRole.name}</div>
            <div className="text-xs text-bone/60">{displayRole.title}</div>
            <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-void-dark/95" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RoleBadge
