'use client'

import Link from 'next/link'
import { Avatar, Badge } from '@/components/ui'
import type { Profile } from '@/lib/types/database.types'

interface UserCardProps {
  user: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'bio'>
  showBio?: boolean
  className?: string
}

export function UserCard({ user, showBio = false, className = '' }: UserCardProps) {
  return (
    <Link
      href={`/usuarios/${user.username}`}
      className={`flex items-center gap-3 p-3 bg-void-light rounded-lg border border-bone/10 hover:border-gold/30 transition-colors ${className}`}
    >
      <Avatar
        src={user.avatar_url}
        alt={user.display_name || user.username}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-bone truncate">
          {user.display_name || user.username}
        </p>
        <p className="text-sm text-bone/60 truncate">@{user.username}</p>
        {showBio && user.bio && (
          <p className="text-sm text-bone/50 mt-1 line-clamp-2">{user.bio}</p>
        )}
      </div>
    </Link>
  )
}
