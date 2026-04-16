'use client'

import { memo } from 'react'
import Link from 'next/link'
import { Avatar, Badge } from '@/components/ui'
import type { Profile } from '@/lib/types/database.types'

interface UserCardProps {
  user: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'bio'>
  showBio?: boolean
  className?: string
}

function UserCardImpl({ user, showBio = false, className = '' }: UserCardProps) {
  return (
    <Link
      href={`/usuarios/${user.username}`}
      className={`hover:border-gold/30 flex items-center gap-3 rounded-lg border border-bone/10 bg-void-light p-3 transition-colors ${className}`}
    >
      <Avatar src={user.avatar_url} alt={user.display_name || user.username} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-bone">{user.display_name || user.username}</p>
        <p className="truncate text-sm text-bone/60">@{user.username}</p>
        {showBio && user.bio && (
          <p className="mt-1 line-clamp-2 text-sm text-bone/50">{user.bio}</p>
        )}
      </div>
    </Link>
  )
}

export const UserCard = memo(UserCardImpl)
