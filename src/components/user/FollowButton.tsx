'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui'
import { useAuth } from '@/lib/hooks/useAuth'
import { isFollowing, followUser, unfollowUser } from '@/lib/services/users'

interface FollowButtonProps {
  userId: string
  initialIsFollowing?: boolean
  onFollowChange?: (isFollowing: boolean) => void
  className?: string
}

export function FollowButton({
  userId,
  initialIsFollowing = false,
  onFollowChange,
  className = '',
}: FollowButtonProps) {
  const { user, isAuthenticated } = useAuth()
  const [following, setFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Check follow status on mount if not provided
  useEffect(() => {
    if (isAuthenticated && user && !initialIsFollowing) {
      isFollowing(user.id, userId).then(({ isFollowing }) => {
        setFollowing(isFollowing)
      })
    }
  }, [isAuthenticated, user, userId, initialIsFollowing])

  // Don't show button for own profile
  if (!isAuthenticated || user?.id === userId) {
    return null
  }

  const handleClick = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      if (following) {
        await unfollowUser(user.id, userId)
        setFollowing(false)
        onFollowChange?.(false)
      } else {
        await followUser(user.id, userId)
        setFollowing(true)
        onFollowChange?.(true)
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={following ? 'outline' : 'primary'}
      size="sm"
      onClick={handleClick}
      isLoading={isLoading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      {following
        ? isHovered
          ? 'Dejar de seguir'
          : 'Siguiendo'
        : 'Seguir'}
    </Button>
  )
}
