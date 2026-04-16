'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Avatar, Button } from '@/components/ui'
import { FollowButton } from './FollowButton'
import { UserListModal } from './UserListModal'
import { useAuth } from '@/lib/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { MapPin, LinkIcon, Calendar, Settings, Shield, Instagram, Youtube } from 'lucide-react'

// X (Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)
import type { Profile } from '@/lib/types/database.types'

interface Faction {
  id: string
  name: string
  slug: string
  primary_color: string | null
  secondary_color: string | null
}

interface ProfileHeaderProps {
  profile: Profile & {
    favorite_factions?: string[] | null
    instagram?: string | null
    twitter?: string | null
    youtube?: string | null
  }
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
  const [factions, setFactions] = useState<Faction[]>([])
  const supabase = createClient()

  // Fetch faction details for gradient
  useEffect(() => {
    if (profile.favorite_factions && profile.favorite_factions.length > 0) {
      fetchFactions()
    }
  }, [profile.favorite_factions])

  const fetchFactions = async () => {
    if (!profile.favorite_factions || profile.favorite_factions.length === 0) return

    const { data, error } = await supabase
      .from('tags')
      .select('id, name, slug, primary_color, secondary_color')
      .in('id', profile.favorite_factions)

    if (!error && data) {
      // Sort to match the order in favorite_factions
      const sorted = profile.favorite_factions
        .map((id) => data.find((f) => f.id === id))
        .filter(Boolean) as Faction[]
      setFactions(sorted)
    }
  }

  // Generate gradient based on favorite factions
  const getBannerGradient = (): string => {
    if (factions.length === 0) {
      // Default gradient
      return 'linear-gradient(135deg, rgba(139,0,0,0.4) 0%, rgba(26,26,46,1) 50%, rgba(201,162,39,0.3) 100%)'
    }

    if (factions.length === 1) {
      return `linear-gradient(135deg, ${factions[0].primary_color}90 0%, rgba(26,26,46,1) 50%, ${factions[0].secondary_color}60 100%)`
    }

    if (factions.length === 2) {
      return `linear-gradient(135deg, ${factions[0].primary_color}90 0%, rgba(26,26,46,1) 40%, ${factions[1].primary_color}60 100%)`
    }

    // 3 factions
    return `linear-gradient(135deg, ${factions[0].primary_color}90 0%, ${factions[1].primary_color}50 50%, ${factions[2].primary_color}60 100%)`
  }

  const handleFollowChange = (isFollowing: boolean) => {
    setFollowersCount((prev) => (isFollowing ? prev + 1 : prev - 1))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="overflow-hidden rounded-xl border border-bone/10 bg-void-light"
    >
      {/* Banner with dynamic faction gradient */}
      <div className="relative h-40 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ background: getBannerGradient() }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'url(/noise.png)' }}
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
        />
        {/* Scan line effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-bone/5 to-transparent"
          animate={{ y: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{ height: '50%' }}
        />

        {/* Faction badges in corner */}
        {factions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute right-4 top-4 flex items-center gap-2"
          >
            {factions.map((faction, index) => (
              <motion.div
                key={faction.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="group relative"
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 backdrop-blur-sm"
                  style={{
                    background: `linear-gradient(135deg, ${faction.primary_color}CC, ${faction.secondary_color}99)`,
                  }}
                >
                  <Shield className="h-4 w-4 text-white/90" />
                </div>
                {/* Tooltip */}
                <div className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="whitespace-nowrap rounded bg-void/90 px-2 py-1 text-xs text-bone">
                    {faction.name}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Profile Info */}
      <div className="px-6 pb-6">
        <div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end">
          {/* Avatar with glow ring - uses faction colors */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <motion.div
              className="absolute -inset-1 rounded-full opacity-50 blur-sm"
              animate={{
                background:
                  factions.length > 0
                    ? `linear-gradient(135deg, ${factions[0].primary_color}, ${factions[factions.length - 1]?.primary_color || factions[0].secondary_color})`
                    : 'linear-gradient(135deg, #c9a227, #8b0000)',
                boxShadow:
                  factions.length > 0
                    ? `0 0 20px ${factions[0].primary_color}60`
                    : '0 0 20px rgba(201, 162, 39, 0.3)',
              }}
              transition={{ duration: 0.5 }}
              style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
            />
            <Avatar
              src={profile.avatar_url}
              alt={profile.display_name || profile.username}
              size="xl"
              className="relative ring-4 ring-void-light"
            />
          </motion.div>

          {/* Name & Actions */}
          <div className="flex flex-1 flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="font-display text-2xl font-bold text-bone">
                {profile.display_name || profile.username}
              </h1>
              <p className="font-body text-bone/60">@{profile.username}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-2"
            >
              {isOwnProfile ? (
                <Link href="/perfil">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Editar perfil
                  </Button>
                </Link>
              ) : (
                <FollowButton userId={profile.id} onFollowChange={handleFollowChange} />
              )}
            </motion.div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 whitespace-pre-wrap font-body text-bone/80"
          >
            {profile.bio}
          </motion.p>
        )}

        {/* Location & Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 flex flex-wrap gap-4 text-sm text-bone/60"
        >
          {profile.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-imperial-gold" />
              <span>{profile.location}</span>
            </div>
          )}
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-imperial-gold transition-colors hover:text-imperial-gold/80"
            >
              <LinkIcon className="h-4 w-4" />
              <span>{new URL(profile.website).hostname}</span>
            </a>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-bone/40" />
            <span>
              Se unio en{' '}
              {new Date(profile.created_at).toLocaleDateString('es-ES', {
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </motion.div>

        {/* Social Links */}
        {(profile.instagram || profile.twitter || profile.youtube) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mt-4 flex flex-wrap gap-3"
          >
            {profile.instagram && (
              <a
                href={`https://instagram.com/${profile.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-pink-500/30 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-3 py-1.5 text-sm text-pink-400 transition-colors hover:bg-pink-500/30"
              >
                <Instagram className="h-4 w-4" />@{profile.instagram}
              </a>
            )}
            {profile.twitter && (
              <a
                href={`https://x.com/${profile.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-bone/20 bg-bone/10 px-3 py-1.5 text-sm text-bone/80 transition-colors hover:bg-bone/20"
              >
                <XIcon className="h-4 w-4" />@{profile.twitter}
              </a>
            )}
            {profile.youtube && (
              <a
                href={`https://youtube.com/@${profile.youtube}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/20 px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-500/30"
              >
                <Youtube className="h-4 w-4" />
                {profile.youtube}
              </a>
            )}
          </motion.div>
        )}

        {/* Stats with animation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex gap-6 text-sm"
        >
          <motion.button
            onClick={() => setShowFollowersModal(true)}
            className="group transition-colors hover:text-imperial-gold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="font-bold text-bone transition-colors group-hover:text-imperial-gold">
              {followersCount}
            </span>{' '}
            <span className="text-bone/60">seguidores</span>
          </motion.button>
          <motion.button
            onClick={() => setShowFollowingModal(true)}
            className="group transition-colors hover:text-imperial-gold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="font-bold text-bone transition-colors group-hover:text-imperial-gold">
              {followingCount}
            </span>{' '}
            <span className="text-bone/60">siguiendo</span>
          </motion.button>
          <div>
            <span className="font-bold text-bone">{miniaturesCount}</span>{' '}
            <span className="text-bone/60">miniaturas</span>
          </div>
        </motion.div>
      </div>

      {/* Followers Modal */}
      <UserListModal
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        title="Seguidores"
        userId={profile.id}
        type="followers"
      />

      {/* Following Modal */}
      <UserListModal
        isOpen={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        title="Siguiendo"
        userId={profile.id}
        type="following"
      />
    </motion.div>
  )
}
