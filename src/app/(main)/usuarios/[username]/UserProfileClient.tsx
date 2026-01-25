'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence, useInView, useSpring, useTransform } from 'framer-motion'
import { Avatar, Spinner } from '@/components/ui'
import { FollowButton } from '@/components/user/FollowButton'
import { UserListModal } from '@/components/user/UserListModal'
import { FACTION_ICONS } from '@/components/user'
import { createClient } from '@/lib/supabase/client'
import {
  MapPin,
  Calendar,
  Settings,
  Shield,
  Heart,
  MessageCircle,
  ImageIcon,
  Users,
  User,
  Instagram,
  Youtube,
  ExternalLink,
  Cpu,
  Activity,
  Grid3X3,
  Info,
} from 'lucide-react'
import type { Profile } from '@/lib/types/database.types'

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

// Animated counter
function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const spring = useSpring(0, { duration: duration * 1000 })
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString())

  useEffect(() => {
    if (isInView) spring.set(value)
  }, [isInView, value, spring])

  return <motion.span ref={ref}>{display}</motion.span>
}

interface Faction {
  id: string
  name: string
  slug: string
  primary_color: string | null
  secondary_color: string | null
}

interface Miniature {
  id: string
  title: string
  thumbnail_url: string | null
  images: string[]
  likes_count: number
  comments_count: number
}

interface ProfileData {
  profile: Profile & {
    favorite_factions?: string[] | null
    instagram?: string | null
    twitter?: string | null
    youtube?: string | null
  }
  followersCount: number
  followingCount: number
  miniaturesCount: number
  factions: Faction[]
  recentMiniatures: Miniature[]
  isOwnProfile: boolean
  currentUserId: string | null
}

type TabType = 'miniatures' | 'likes' | 'info'

export function UserProfileClient({ data }: UserProfileClientProps) {
  const {
    profile,
    followersCount: initialFollowersCount,
    followingCount,
    miniaturesCount,
    factions,
    recentMiniatures,
    isOwnProfile,
  } = data

  const [followersCount, setFollowersCount] = useState(initialFollowersCount)
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [showFollowingModal, setShowFollowingModal] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('miniatures')
  const [likedMiniatures, setLikedMiniatures] = useState<Miniature[]>([])
  const [likesLoading, setLikesLoading] = useState(false)
  const [likesFetched, setLikesFetched] = useState(false)

  const handleFollowChange = (following: boolean) => {
    setFollowersCount((prev) => (following ? prev + 1 : prev - 1))
  }

  const fetchLikedMiniatures = useCallback(async () => {
    if (likesFetched || likesLoading) return
    setLikesLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('miniature_likes')
      .select(`
        miniature:miniatures(
          id, title, thumbnail_url, images,
          miniature_likes(count),
          miniature_comments(count)
        )
      `)
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      const miniatures = data
        .map((item) => item.miniature)
        .filter((m): m is Record<string, unknown> => m !== null)
        .map((m) => ({
          id: m.id as string,
          title: m.title as string,
          thumbnail_url: m.thumbnail_url as string | null,
          images: m.images as string[],
          likes_count: (m.miniature_likes as { count: number }[])?.[0]?.count || 0,
          comments_count: (m.miniature_comments as { count: number }[])?.[0]?.count || 0,
        }))
      setLikedMiniatures(miniatures)
    }

    setLikesLoading(false)
    setLikesFetched(true)
  }, [profile.id, likesFetched, likesLoading])

  useEffect(() => {
    if (activeTab === 'likes' && !likesFetched) {
      fetchLikedMiniatures()
    }
  }, [activeTab, likesFetched, fetchLikedMiniatures])

  // Generate gradient based on factions
  const getGradient = () => {
    if (factions.length === 0) return 'linear-gradient(135deg, #c9a227 0%, #8b0000 100%)'
    if (factions.length === 1) return `linear-gradient(135deg, ${factions[0].primary_color} 0%, ${factions[0].secondary_color} 100%)`
    return `linear-gradient(135deg, ${factions[0].primary_color} 0%, ${factions[factions.length - 1].primary_color} 100%)`
  }

  const tabs = [
    { id: 'miniatures' as TabType, label: 'Miniaturas', icon: Grid3X3, count: miniaturesCount },
    { id: 'likes' as TabType, label: 'Likes', icon: Heart, count: null },
    { id: 'info' as TabType, label: 'Información', icon: Info, count: null },
  ]

  return (
    <div className="min-h-screen bg-void pt-20">
      {/* Scan line effect */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
        <motion.div
          className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-imperial-gold/20 to-transparent"
          animate={{ y: ['0vh', '100vh'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Hero Banner */}
      <div className="relative">
        {/* Gradient banner */}
        <motion.div
          className="h-48 md:h-64 relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="absolute inset-0"
            animate={{ background: getGradient() }}
            transition={{ duration: 1 }}
            style={{ opacity: 0.4 }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-void" />

          {/* Animated grid pattern */}
          <motion.div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(201, 162, 39, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(201, 162, 39, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
            animate={{ backgroundPosition: ['0px 0px', '40px 40px'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />

          {/* Faction badges in corner */}
          {factions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute top-4 right-4 md:top-6 md:right-6 flex gap-2"
            >
              {factions.map((faction, idx) => {
                const iconPath = FACTION_ICONS[faction.slug]
                return (
                  <motion.div
                    key={faction.id}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1, type: 'spring' }}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center backdrop-blur-sm"
                    style={{
                      background: `linear-gradient(135deg, ${faction.primary_color}CC, ${faction.secondary_color}99)`,
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                    title={faction.name}
                  >
                    {iconPath ? (
                      <Image src={iconPath} alt="" width={24} height={24} className="invert opacity-90" />
                    ) : (
                      <Shield className="w-5 h-5 md:w-6 md:h-6 text-white/90" />
                    )}
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {/* Edit button for own profile */}
          {isOwnProfile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-4 left-4 md:top-6 md:left-6"
            >
              <Link
                href="/perfil"
                className="flex items-center gap-2 px-4 py-2 bg-void/60 backdrop-blur-sm border border-bone/20 rounded-lg text-bone/80 hover:text-imperial-gold hover:border-imperial-gold/50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-mono">Editar</span>
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Profile Card - overlapping banner */}
        <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            {/* Corner brackets */}
            <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-imperial-gold/50" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-imperial-gold/50" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-imperial-gold/50" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-imperial-gold/50" />

            <div className="bg-void-light/80 backdrop-blur-xl border border-bone/10 rounded-xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="flex-shrink-0 self-center md:self-start"
                >
                  <div className="relative">
                    <motion.div
                      className="absolute -inset-2 rounded-full opacity-50"
                      animate={{
                        background: factions.length > 0
                          ? `conic-gradient(from 0deg, ${factions[0].primary_color}, ${factions[factions.length-1]?.secondary_color || factions[0].secondary_color}, ${factions[0].primary_color})`
                          : 'conic-gradient(from 0deg, #c9a227, #8b0000, #c9a227)',
                        rotate: 360,
                      }}
                      transition={{ rotate: { duration: 10, repeat: Infinity, ease: 'linear' } }}
                    />
                    <Avatar
                      src={profile.avatar_url}
                      alt={profile.display_name || profile.username}
                      size="xl"
                      className="w-28 h-28 md:w-36 md:h-36 ring-4 ring-void-light relative"
                    />
                  </div>
                </motion.div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  {/* Header label */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                    className="flex items-center justify-center md:justify-start gap-2 mb-2"
                  >
                    <Cpu className="w-4 h-4 text-imperial-gold/60" />
                    <span className="text-xs font-mono text-imperial-gold/60 tracking-widest">
                      PERFIL DE USUARIO
                    </span>
                  </motion.div>

                  {/* Name */}
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-3xl md:text-4xl font-display font-bold text-bone mb-1"
                  >
                    {profile.display_name || profile.username}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="text-bone/50 font-mono mb-4"
                  >
                    @{profile.username}
                  </motion.p>

                  {/* Bio */}
                  {profile.bio && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-bone/70 mb-4 max-w-xl leading-relaxed"
                    >
                      {profile.bio}
                    </motion.p>
                  )}

                  {/* Meta info */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-bone/50 mb-4"
                  >
                    {profile.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-imperial-gold/70" />
                        {profile.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-bone/40" />
                      Miembro desde {new Date(profile.created_at).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                    </span>
                  </motion.div>

                  {/* Social Links */}
                  {(profile.instagram || profile.twitter || profile.youtube) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex flex-wrap justify-center md:justify-start gap-2 mb-4"
                    >
                      {profile.instagram && (
                        <a
                          href={`https://instagram.com/${profile.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-pink-500/30 rounded-lg text-sm text-pink-400 hover:bg-pink-500/30 transition-all hover:scale-105"
                        >
                          <Instagram className="w-4 h-4" />
                          @{profile.instagram}
                        </a>
                      )}
                      {profile.twitter && (
                        <a
                          href={`https://x.com/${profile.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-bone/10 border border-bone/20 rounded-lg text-sm text-bone/80 hover:bg-bone/20 transition-all hover:scale-105"
                        >
                          <XIcon className="w-4 h-4" />
                          @{profile.twitter}
                        </a>
                      )}
                      {profile.youtube && (
                        <a
                          href={`https://youtube.com/@${profile.youtube}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-400 hover:bg-red-500/30 transition-all hover:scale-105"
                        >
                          <Youtube className="w-4 h-4" />
                          @{profile.youtube}
                        </a>
                      )}
                    </motion.div>
                  )}

                  {/* Action buttons */}
                  {!isOwnProfile && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.65 }}
                      className="flex justify-center md:justify-start gap-3"
                    >
                      <FollowButton userId={profile.id} onFollowChange={handleFollowChange} />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-3 gap-3 md:gap-4"
        >
          {[
            { label: 'Miniaturas', value: miniaturesCount, color: 'imperial-gold' },
            { label: 'Seguidores', value: followersCount, color: 'blue-400', onClick: () => setShowFollowersModal(true) },
            { label: 'Siguiendo', value: followingCount, color: 'purple-400', onClick: () => setShowFollowingModal(true) },
          ].map((stat, idx) => (
            <motion.button
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 + idx * 0.1 }}
              onClick={stat.onClick}
              disabled={!stat.onClick}
              className={`relative bg-void-light/50 backdrop-blur-sm border border-bone/10 rounded-xl p-4 md:p-6 text-center group ${stat.onClick ? 'cursor-pointer hover:border-imperial-gold/30' : ''} transition-colors`}
            >
              <p className="text-xs font-mono text-bone/50 mb-1 tracking-wider uppercase">{stat.label}</p>
              <p className={`text-2xl md:text-3xl font-display font-bold text-${stat.color}`}>
                <AnimatedCounter value={stat.value} />
              </p>
              {stat.onClick && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-imperial-gold to-transparent"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Tabs Section */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 mt-8">
        {/* Tab buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex gap-1 p-1 bg-void-light/30 backdrop-blur-sm border border-bone/10 rounded-xl mb-6"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-mono text-sm transition-all ${
                  isActive
                    ? 'bg-imperial-gold text-void'
                    : 'text-bone/60 hover:text-bone hover:bg-bone/5'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.count !== null && (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${isActive ? 'bg-void/20' : 'bg-bone/10'}`}>
                    {tab.count}
                  </span>
                )}
              </motion.button>
            )
          })}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-[300px] pb-16"
          >
            {activeTab === 'miniatures' && (
              recentMiniatures.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {recentMiniatures.map((miniature, idx) => (
                    <MiniatureCard key={miniature.id} miniature={miniature} index={idx} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={ImageIcon}
                  title="Sin miniaturas"
                  description={isOwnProfile ? 'Aún no has subido ninguna miniatura' : 'Este usuario aún no ha compartido miniaturas'}
                  action={isOwnProfile && (
                    <Link href="/mi-galeria/subir">
                      <motion.button
                        className="px-6 py-3 bg-gradient-to-r from-imperial-gold to-yellow-500 text-void font-display font-bold rounded-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Subir Miniatura
                      </motion.button>
                    </Link>
                  )}
                />
              )
            )}

            {activeTab === 'likes' && (
              likesLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Spinner size="lg" />
                </div>
              ) : likedMiniatures.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {likedMiniatures.map((miniature, idx) => (
                    <MiniatureCard key={miniature.id} miniature={miniature} index={idx} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Heart}
                  title="Sin likes"
                  description={isOwnProfile ? 'Aún no has dado like a ninguna miniatura' : 'Este usuario aún no ha dado likes'}
                />
              )
            )}

            {activeTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Info Card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-void-light/30 backdrop-blur-sm border border-bone/10 rounded-xl p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-imperial-gold" />
                    <h3 className="font-display font-bold text-bone">Información</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-bone/5">
                      <span className="text-bone/50 font-mono">USUARIO</span>
                      <span className="text-bone">@{profile.username}</span>
                    </div>
                    {profile.location && (
                      <div className="flex justify-between py-2 border-b border-bone/5">
                        <span className="text-bone/50 font-mono">UBICACIÓN</span>
                        <span className="text-bone">{profile.location}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-bone/5">
                      <span className="text-bone/50 font-mono">REGISTRO</span>
                      <span className="text-bone">
                        {new Date(profile.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Factions Card */}
                {factions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-void-light/30 backdrop-blur-sm border border-bone/10 rounded-xl p-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="w-5 h-5 text-imperial-gold" />
                      <h3 className="font-display font-bold text-bone">Facciones</h3>
                    </div>
                    <div className="space-y-3">
                      {factions.map((faction) => {
                        const iconPath = FACTION_ICONS[faction.slug]
                        return (
                          <Link
                            key={faction.id}
                            href={`/facciones/${faction.slug}`}
                            className="flex items-center gap-3 p-3 bg-void/50 rounded-lg border border-bone/5 hover:border-imperial-gold/30 transition-all group"
                          >
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{
                                background: `linear-gradient(135deg, ${faction.primary_color}40, ${faction.secondary_color}20)`,
                              }}
                            >
                              {iconPath ? (
                                <Image src={iconPath} alt="" width={20} height={20} className="invert opacity-80" />
                              ) : (
                                <Shield className="w-5 h-5" style={{ color: faction.primary_color || '#c9a227' }} />
                              )}
                            </div>
                            <span className="text-bone/80 group-hover:text-bone transition-colors">{faction.name}</span>
                            <ExternalLink className="w-4 h-4 text-bone/30 ml-auto group-hover:text-imperial-gold transition-colors" />
                          </Link>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modals */}
      <UserListModal
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        title="Seguidores"
        userId={profile.id}
        type="followers"
      />
      <UserListModal
        isOpen={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        title="Siguiendo"
        userId={profile.id}
        type="following"
      />
    </div>
  )
}

interface UserProfileClientProps {
  data: ProfileData
}

// Miniature Card
function MiniatureCard({ miniature, index }: { miniature: Miniature; index: number }) {
  const imageUrl = miniature.thumbnail_url || miniature.images?.[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/galeria/${miniature.id}`}>
        <motion.div
          className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer bg-void-light border border-bone/10"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={miniature.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-bone/20" />
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Info on hover */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
          >
            <p className="text-sm font-medium text-bone truncate mb-1">{miniature.title}</p>
            <div className="flex items-center gap-3 text-xs text-bone/70">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-400" />
                {miniature.likes_count}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3 text-imperial-gold" />
                {miniature.comments_count}
              </span>
            </div>
          </motion.div>

          {/* Border glow */}
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-imperial-gold pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </motion.div>
      </Link>
    </motion.div>
  )
}

// Empty State
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="text-center py-16">
      <motion.div
        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-imperial-gold/10 border border-imperial-gold/30 mb-6"
        animate={{
          boxShadow: [
            '0 0 20px rgba(201, 162, 39, 0.2)',
            '0 0 40px rgba(201, 162, 39, 0.4)',
            '0 0 20px rgba(201, 162, 39, 0.2)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Icon className="w-10 h-10 text-imperial-gold" />
      </motion.div>
      <h3 className="text-xl font-display font-bold text-bone mb-2">{title}</h3>
      <p className="text-bone/60 mb-6 max-w-md mx-auto">{description}</p>
      {action}
    </div>
  )
}
