'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Avatar, Badge, Button, Modal } from '@/components/ui'
import { FollowButton } from './FollowButton'
import { UserCard } from './UserCard'
import { useAuth } from '@/lib/hooks/useAuth'
import type { Profile } from '@/lib/types/database.types'

interface ProfileHeaderProps {
  profile: Profile
  followersCount: number
  followingCount: number
  miniaturesCount: number
  isOwnProfile?: boolean
}

export function ProfileHeader({
  profile,
  followersCount: initialFollowersCount,
  followingCount,
  miniaturesCount,
  isOwnProfile = false,
}: ProfileHeaderProps) {
  const { user } = useAuth()
  const [followersCount, setFollowersCount] = useState(initialFollowersCount)
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [showFollowingModal, setShowFollowingModal] = useState(false)

  const handleFollowChange = (isFollowing: boolean) => {
    setFollowersCount(prev => isFollowing ? prev + 1 : prev - 1)
  }

  return (
    <div className="bg-void-light border border-bone/10 rounded-lg overflow-hidden">
      {/* Banner */}
      <div className="h-32 bg-gradient-to-r from-blood/30 via-void to-gold/20" />

      {/* Profile Info */}
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
          {/* Avatar */}
          <Avatar
            src={profile.avatar_url}
            alt={profile.display_name || profile.username}
            size="xl"
            className="ring-4 ring-void-light"
          />

          {/* Name & Actions */}
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
            <div>
              <h1 className="text-2xl font-bold text-bone">
                {profile.display_name || profile.username}
              </h1>
              <p className="text-bone/60">@{profile.username}</p>
            </div>

            <div className="flex gap-2">
              {isOwnProfile ? (
                <Link href="/perfil">
                  <Button variant="outline" size="sm">
                    Editar perfil
                  </Button>
                </Link>
              ) : (
                <>
                  <FollowButton
                    userId={profile.id}
                    onFollowChange={handleFollowChange}
                  />
                  <Button variant="ghost" size="sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-4 text-bone/80 whitespace-pre-wrap">{profile.bio}</p>
        )}

        {/* Location & Website */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-bone/60">
          {profile.location && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{profile.location}</span>
            </div>
          )}
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gold hover:text-gold/80 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span>{new URL(profile.website).hostname}</span>
            </a>
          )}
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              Se unió en {new Date(profile.created_at).toLocaleDateString('es-ES', {
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 flex gap-6 text-sm">
          <button
            onClick={() => setShowFollowersModal(true)}
            className="hover:text-gold transition-colors"
          >
            <span className="font-bold text-bone">{followersCount}</span>{' '}
            <span className="text-bone/60">seguidores</span>
          </button>
          <button
            onClick={() => setShowFollowingModal(true)}
            className="hover:text-gold transition-colors"
          >
            <span className="font-bold text-bone">{followingCount}</span>{' '}
            <span className="text-bone/60">siguiendo</span>
          </button>
          <div>
            <span className="font-bold text-bone">{miniaturesCount}</span>{' '}
            <span className="text-bone/60">miniaturas</span>
          </div>
        </div>
      </div>

      {/* Followers Modal */}
      <Modal
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        title="Seguidores"
      >
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {/* TODO: Load followers list */}
          <p className="text-bone/60 text-center py-4">
            Cargando seguidores...
          </p>
        </div>
      </Modal>

      {/* Following Modal */}
      <Modal
        isOpen={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        title="Siguiendo"
      >
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {/* TODO: Load following list */}
          <p className="text-bone/60 text-center py-4">
            Cargando...
          </p>
        </div>
      </Modal>
    </div>
  )
}
