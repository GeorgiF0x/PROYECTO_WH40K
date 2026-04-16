'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView, useSpring, useTransform, AnimatePresence } from 'framer-motion'
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
  Scroll,
  Instagram,
  Youtube,
  ChevronRight,
  Crosshair,
  Users,
  Sparkles,
  ExternalLink,
  Star,
} from 'lucide-react'
import { optimizeImageUrl } from '@/lib/utils'
import type { Profile, CreatorType } from '@/lib/types/database.types'
import { CreatorBadge, getCreatorTypeConfig, PortfolioGrid } from '@/components/creator'
import { ScribeBadge } from '@/components/wiki'

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

// ═══════════════════════════════════════════════════════════════════
// DECORATIVE COMPONENTS - ADMINISTRATUM THEME
// ═══════════════════════════════════════════════════════════════════

// Gothic corner filigree
function AdministratumCorner({
  position,
  color = 'rgba(201,162,39,0.45)',
}: {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  color?: string
}) {
  const flip = {
    'top-left': '',
    'top-right': 'scaleX(-1)',
    'bottom-left': 'scaleY(-1)',
    'bottom-right': 'scale(-1)',
  }[position]

  const posClass = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
  }[position]

  return (
    <div
      className={`absolute ${posClass} pointer-events-none z-10 h-[60px] w-[60px]`}
      style={{ transform: flip }}
    >
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
        <path d="M0 60 V16 L8 8 L16 0 H60" stroke={color} strokeWidth="1.2" fill="none" />
        <path
          d="M4 60 V19 L11 11 L19 4 H60"
          stroke={color.replace('0.45', '0.18')}
          strokeWidth="0.8"
          fill="none"
        />
        <line
          x1="8"
          y1="4"
          x2="8"
          y2="14"
          stroke={color.replace('0.45', '0.3')}
          strokeWidth="0.8"
        />
        <line
          x1="3"
          y1="9"
          x2="13"
          y2="9"
          stroke={color.replace('0.45', '0.3')}
          strokeWidth="0.8"
        />
        <line
          x1="56"
          y1="-2"
          x2="56"
          y2="4"
          stroke={color.replace('0.45', '0.3')}
          strokeWidth="0.8"
        />
        <line
          x1="-2"
          y1="56"
          x2="4"
          y2="56"
          stroke={color.replace('0.45', '0.3')}
          strokeWidth="0.8"
        />
        <rect
          x="27"
          y="-2"
          width="4"
          height="4"
          transform="rotate(45 29 0)"
          fill={color.replace('0.45', '0.3')}
        />
        <rect
          x="-2"
          y="27"
          width="4"
          height="4"
          transform="rotate(45 0 29)"
          fill={color.replace('0.45', '0.3')}
        />
      </svg>
    </div>
  )
}

// Ink motes — archive dust & ink droplets floating
const INK_MOTES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  left: `${((i * 10 + 5) % 90) + 5}%`,
  top: `${((i * 12 + 8) % 80) + 10}%`,
  color:
    i % 3 === 0
      ? 'rgba(201,162,39,0.4)'
      : i % 3 === 1
        ? 'rgba(180,130,30,0.35)'
        : 'rgba(139,0,0,0.3)',
  size: 3 + (i % 4) * 2,
  drift: 15 + (i % 5) * 5,
  dur: 10 + (i % 7) * 2,
  delay: i * 0.8,
}))

function InkMotes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {INK_MOTES.map((m) => (
        <motion.div
          key={m.id}
          className="absolute rounded-full"
          style={{
            left: m.left,
            top: m.top,
            width: m.size,
            height: m.size,
            background: `radial-gradient(circle, ${m.color}, transparent 70%)`,
            filter: 'blur(1px)',
          }}
          animate={{
            y: [0, -m.drift, 0],
            opacity: [0, 0.7, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: m.dur,
            repeat: Infinity,
            delay: m.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// Aquila Imperial watermark
function AquilaWatermark({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      <motion.div
        animate={{ opacity: [opacity, opacity * 2, opacity] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg
          width="400"
          height="280"
          viewBox="0 0 300 200"
          fill="none"
          className="text-imperial-gold"
        >
          <path
            d="M150 100 Q110 60 40 30 Q70 55 60 80 Q50 60 20 50 Q50 75 45 95 Q35 80 10 75 Q40 95 55 110 Z"
            stroke="currentColor"
            strokeWidth="0.6"
            fill="none"
          />
          <path
            d="M150 100 Q190 60 260 30 Q230 55 240 80 Q250 60 280 50 Q250 75 255 95 Q265 80 290 75 Q260 95 245 110 Z"
            stroke="currentColor"
            strokeWidth="0.6"
            fill="none"
          />
          <path
            d="M120 80 Q110 65 100 60 Q108 62 115 70 Q112 68 105 70"
            stroke="currentColor"
            strokeWidth="0.5"
            fill="none"
          />
          <path
            d="M180 80 Q190 65 200 60 Q192 62 185 70 Q188 68 195 70"
            stroke="currentColor"
            strokeWidth="0.5"
            fill="none"
          />
          <path
            d="M140 110 L150 170 L160 110"
            stroke="currentColor"
            strokeWidth="0.6"
            fill="none"
          />
          <path
            d="M135 115 L150 180 L165 115"
            stroke="currentColor"
            strokeWidth="0.4"
            fill="none"
          />
          <circle cx="150" cy="95" r="8" stroke="currentColor" strokeWidth="0.6" fill="none" />
          <circle cx="147" cy="93" r="1.5" fill="currentColor" opacity="0.4" />
          <circle cx="153" cy="93" r="1.5" fill="currentColor" opacity="0.4" />
          <path d="M148 98 L150 100 L152 98" stroke="currentColor" strokeWidth="0.4" fill="none" />
        </svg>
      </motion.div>
    </div>
  )
}

// Ledger lines — ruled background like an accountant's book
function LedgerLines() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={i}
          className="absolute h-px w-full bg-imperial-gold/[0.04]"
          style={{ top: `${(i + 1) * 8}%` }}
        />
      ))}
      <div className="bg-blood-red/[0.06] absolute bottom-0 top-0 w-px" style={{ left: '6%' }} />
    </div>
  )
}

// Section divider with gothic cross
function AdministratumDivider() {
  return (
    <div className="relative flex items-center justify-center py-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-imperial-gold/20" />
      <motion.div
        className="mx-2 h-1.5 w-1.5 bg-imperial-gold"
        style={{ transform: 'rotate(45deg)' }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <div className="mx-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-imperial-gold">
          <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
          <line
            x1="12"
            y1="4"
            x2="12"
            y2="20"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.5"
          />
          <line
            x1="4"
            y1="12"
            x2="20"
            y2="12"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.5"
          />
        </svg>
      </div>
      <motion.div
        className="mx-2 h-1.5 w-1.5 bg-imperial-gold"
        style={{ transform: 'rotate(45deg)' }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
      />
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-imperial-gold/20" />
    </div>
  )
}

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

// ═══════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════

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
    wiki_role?: 'scribe' | 'lexicanum' | null
  }
  followersCount: number
  followingCount: number
  miniaturesCount: number
  factions: Faction[]
  recentMiniatures: Miniature[]
  isOwnProfile: boolean
  currentUserId: string | null
}

interface UserProfileClientProps {
  data: ProfileData
}

// Get classification based on creator status
function getClassification(profile: Profile): {
  title: string
  subtitle: string
  icon: typeof Crosshair
} {
  if (profile.creator_status === 'approved' && profile.creator_type) {
    const titles: Record<CreatorType, { title: string; subtitle: string; icon: typeof Crosshair }> =
      {
        painter: { title: 'ADEPTO DE LA FORJA', subtitle: 'Artesano del Omnissiah', icon: Star },
        youtuber: {
          title: 'VOX-EMISOR IMPERIAL',
          subtitle: 'Portavoz del Imperium',
          icon: Sparkles,
        },
        artist: { title: 'REMEMORADOR', subtitle: 'Cronista Imperial', icon: Star },
        blogger: {
          title: 'ESCRIBA DEL LEXICANUM',
          subtitle: 'Custodio del Conocimiento',
          icon: Scroll,
        },
        instructor: { title: 'TECNOSACERDOTE', subtitle: 'Maestro del Rito', icon: Star },
      }
    return (
      titles[profile.creator_type as CreatorType] || {
        title: 'CREADOR VERIFICADO',
        subtitle: 'Portador del Sello Imperial',
        icon: Star,
      }
    )
  }
  return { title: 'CIUDADANO IMPERIAL', subtitle: 'Leal Servidor del Trono Dorado', icon: Shield }
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

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
  const [likedMiniatures, setLikedMiniatures] = useState<Miniature[]>([])
  const [likesLoading, setLikesLoading] = useState(false)
  const [showLikes, setShowLikes] = useState(false)

  const handleFollowChange = (following: boolean) => {
    setFollowersCount((prev) => (following ? prev + 1 : prev - 1))
  }

  const fetchLikedMiniatures = useCallback(async () => {
    if (likesLoading || likedMiniatures.length > 0) return
    setLikesLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('miniature_likes')
      .select(
        `
        miniature:miniatures(
          id, title, thumbnail_url, images,
          miniature_likes(count),
          miniature_comments(count)
        )
      `
      )
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(8)

    if (!error && data) {
      const miniatures = data
        .map((item) => item.miniature)
        .filter((m) => m !== null)
        .map((m) => {
          const mini = m as {
            id: string
            title: string
            thumbnail_url: string | null
            images: string[]
            miniature_likes: { count: number }[]
            miniature_comments: { count: number }[]
          }
          return {
            id: mini.id,
            title: mini.title,
            thumbnail_url: mini.thumbnail_url,
            images: mini.images,
            likes_count: mini.miniature_likes?.[0]?.count || 0,
            comments_count: mini.miniature_comments?.[0]?.count || 0,
          }
        })
      setLikedMiniatures(miniatures)
    }

    setLikesLoading(false)
  }, [profile.id, likesLoading, likedMiniatures.length])

  useEffect(() => {
    if (showLikes && likedMiniatures.length === 0) {
      fetchLikedMiniatures()
    }
  }, [showLikes, fetchLikedMiniatures, likedMiniatures.length])

  // Generate gradient based on factions
  const getGradient = () => {
    if (factions.length === 0) return 'linear-gradient(135deg, #c9a227 0%, #8b0000 100%)'
    if (factions.length === 1)
      return `linear-gradient(135deg, ${factions[0].primary_color} 0%, ${factions[0].secondary_color} 100%)`
    return `linear-gradient(135deg, ${factions[0].primary_color} 0%, ${factions[factions.length - 1].primary_color} 100%)`
  }

  const classification = getClassification(profile)
  const ClassificationIcon = classification.icon
  const primaryFactionColor = factions[0]?.primary_color || '#c9a227'
  const currentDate = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <div className="relative min-h-screen bg-void pb-16 pt-20">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ATMOSPHERIC BACKGROUND */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* Ambient aurora */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 30% 20%, ${primaryFactionColor}12 0%, transparent 50%),
              radial-gradient(ellipse at 70% 80%, rgba(139,0,0,0.08) 0%, transparent 50%)
            `,
          }}
        />
        {/* Candlelight breathing 1 */}
        <motion.div
          className="absolute left-[20%] top-[10%] h-[600px] w-[600px]"
          style={{
            background: `radial-gradient(circle, ${primaryFactionColor}08 0%, transparent 70%)`,
          }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Candlelight breathing 2 */}
        <motion.div
          className="absolute bottom-[15%] right-[15%] h-[500px] w-[500px]"
          style={{
            background: 'radial-gradient(circle, rgba(139,0,0,0.06) 0%, transparent 70%)',
          }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Ink motes */}
        <InkMotes />
        {/* Parchment horizontal lines */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(201,162,39,0.03) 79px, rgba(201,162,39,0.03) 80px)',
          }}
        />
        {/* Slow scan line */}
        <motion.div
          className="absolute left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${primaryFactionColor}20 50%, transparent 100%)`,
          }}
          animate={{ top: ['0%', '100%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 md:px-6">
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* HEADER BAR - ADMINISTRATUM STYLE */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6 overflow-hidden rounded-xl border border-imperial-gold/20 bg-void-light/60 backdrop-blur-md"
        >
          <AdministratumCorner position="top-left" />
          <AdministratumCorner position="top-right" />
          <AdministratumCorner position="bottom-left" />
          <AdministratumCorner position="bottom-right" />
          <LedgerLines />

          {/* Shimmer effect */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(105deg, transparent 40%, rgba(201,162,39,0.08) 50%, transparent 60%)',
            }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3 }}
          />

          <div className="relative z-10 flex items-center gap-4 px-6 py-4">
            <motion.div
              animate={{
                filter: [
                  'drop-shadow(0 0 4px rgba(201,162,39,0.4))',
                  'drop-shadow(0 0 12px rgba(201,162,39,0.8))',
                  'drop-shadow(0 0 4px rgba(201,162,39,0.4))',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Scroll className="h-6 w-6 text-imperial-gold" />
            </motion.div>

            <div className="min-w-0 flex-1">
              <div className="font-mono text-xs font-semibold tracking-[0.25em] text-imperial-gold/80">
                EXPEDIENTE IMPERIAL <span className="text-imperial-gold/40">&#9670;</span> REGISTRO
                PERSONAL
              </div>
              <div className="mt-0.5 font-mono text-[10px] tracking-wider text-bone/30">
                REF: ADM/USR/{profile.username.toUpperCase().slice(0, 8)} — ULTIMA CONSULTA:{' '}
                {currentDate}
              </div>
            </div>

            {/* Classification badge */}
            <motion.div
              className="hidden items-center gap-2 rounded-lg border px-3 py-1.5 sm:flex"
              style={{
                borderColor: `${primaryFactionColor}30`,
                background: `linear-gradient(135deg, ${primaryFactionColor}10, transparent)`,
              }}
              animate={{
                boxShadow: [
                  `0 0 10px ${primaryFactionColor}00`,
                  `0 0 20px ${primaryFactionColor}20`,
                  `0 0 10px ${primaryFactionColor}00`,
                ],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <motion.div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: primaryFactionColor }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span
                className="font-mono text-[10px] tracking-widest"
                style={{ color: primaryFactionColor }}
              >
                {classification.title}
              </span>
            </motion.div>

            {/* Edit button */}
            {isOwnProfile && (
              <Link
                href="/perfil"
                className="flex items-center gap-2 rounded-lg border border-bone/20 bg-void/50 px-3 py-2 text-bone/70 transition-all hover:border-imperial-gold/40 hover:text-imperial-gold"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden font-mono text-xs sm:inline">Editar</span>
              </Link>
            )}
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* HERO BANNER + PROFILE CARD */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-6 overflow-hidden rounded-2xl border border-imperial-gold/20 bg-void-light/50 backdrop-blur-md"
        >
          {/* Corner filigrees with faction color */}
          <AdministratumCorner position="top-left" color={`${primaryFactionColor}60`} />
          <AdministratumCorner position="top-right" color={`${primaryFactionColor}60`} />
          <AdministratumCorner position="bottom-left" color={`${primaryFactionColor}60`} />
          <AdministratumCorner position="bottom-right" color={`${primaryFactionColor}60`} />

          {/* Aquila watermark */}
          <AquilaWatermark opacity={0.02} />

          {/* Faction gradient banner */}
          <div className="relative h-32 overflow-hidden md:h-40">
            <motion.div
              className="absolute inset-0"
              animate={{ background: getGradient() }}
              transition={{ duration: 1 }}
              style={{ opacity: 0.5 }}
            />
            {/* Animated grid */}
            <motion.div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '30px 30px',
              }}
              animate={{ backgroundPosition: ['0px 0px', '30px 30px'] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            />
            {/* Scanlines */}
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-void-light/50" />

            {/* Faction badges - WHITE icons */}
            {factions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute right-4 top-4 flex gap-2"
              >
                {factions.slice(0, 3).map((faction, idx) => {
                  const iconPath = FACTION_ICONS[faction.slug]
                  return (
                    <motion.div
                      key={faction.id}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1, type: 'spring' }}
                      whileHover={{ scale: 1.15, y: -2 }}
                      className="group flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg backdrop-blur-sm md:h-11 md:w-11"
                      style={{
                        background: `linear-gradient(135deg, ${faction.primary_color}DD, ${faction.secondary_color}AA)`,
                        boxShadow: `0 4px 20px ${faction.primary_color}40`,
                      }}
                      title={faction.name}
                    >
                      {iconPath ? (
                        <Image
                          src={iconPath}
                          alt={faction.name}
                          width={22}
                          height={22}
                          className="opacity-95 brightness-0 invert transition-opacity group-hover:opacity-100"
                        />
                      ) : (
                        <Shield className="h-5 w-5 text-white" />
                      )}
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </div>

          {/* Profile content */}
          <div className="relative -mt-16 px-6 pb-6 md:px-8">
            <div className="flex flex-col gap-6 md:flex-row">
              {/* Avatar with overlapping Purity Seal */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="flex-shrink-0 self-center md:self-start"
              >
                <div className="relative">
                  {/* Outer glowing ring */}
                  <motion.div
                    className="absolute -inset-3 rounded-full"
                    style={{
                      background: `conic-gradient(from 0deg, ${primaryFactionColor}, ${factions[factions.length - 1]?.secondary_color || primaryFactionColor}, ${primaryFactionColor})`,
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute -inset-3 rounded-full"
                    style={{
                      background:
                        'radial-gradient(circle, transparent 60%, rgba(10,10,15,0.9) 100%)',
                    }}
                  />
                  {/* Inner pulsing glow */}
                  <motion.div
                    className="absolute -inset-1 rounded-full"
                    style={{ backgroundColor: primaryFactionColor }}
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <Avatar
                    src={profile.avatar_url}
                    alt={profile.display_name || profile.username}
                    size="xl"
                    className="relative z-10 h-28 w-28 ring-4 ring-void-light md:h-32 md:w-32"
                  />

                  {/* Purity Seal - overlapping bottom-right corner like a medal */}
                  {profile.creator_status === 'approved' && profile.creator_type && (
                    <div className="absolute -bottom-4 -right-4 z-20">
                      <CreatorBadge
                        type={profile.creator_type as CreatorType}
                        variant="avatar-badge"
                        size="md"
                      />
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Info section */}
              <div className="flex-1 pt-4 text-center md:pt-8 md:text-left">
                {/* Name */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-1"
                >
                  <h1 className="font-display text-2xl font-bold text-bone md:text-3xl">
                    {profile.display_name || profile.username}
                  </h1>
                </motion.div>

                {/* Creator Title Ribbon - elegant inline display */}
                {profile.creator_status === 'approved' && profile.creator_type && (
                  <div className="mb-2 flex justify-center md:justify-start">
                    <CreatorBadge
                      type={profile.creator_type as CreatorType}
                      variant="title-ribbon"
                    />
                  </div>
                )}

                {/* Wiki Scribe Badge */}
                {profile.wiki_role && (
                  <div className="mb-2 flex justify-center md:justify-start">
                    <ScribeBadge role={profile.wiki_role} size="md" />
                  </div>
                )}

                {/* Username */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  className="mb-3 font-mono text-sm text-bone/50"
                >
                  @{profile.username}
                </motion.p>

                {/* Bio */}
                {profile.bio && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mb-4 max-w-xl leading-relaxed text-bone/70"
                  >
                    {profile.bio}
                  </motion.p>
                )}

                {/* Stats row */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="mb-4 flex flex-wrap justify-center gap-5 md:justify-start"
                >
                  {[
                    {
                      label: 'Miniaturas',
                      value: miniaturesCount,
                      icon: ImageIcon,
                      color: 'imperial-gold',
                    },
                    {
                      label: 'Seguidores',
                      value: followersCount,
                      icon: Users,
                      color: 'blue-400',
                      onClick: () => setShowFollowersModal(true),
                    },
                    {
                      label: 'Siguiendo',
                      value: followingCount,
                      icon: Users,
                      color: 'purple-400',
                      onClick: () => setShowFollowingModal(true),
                    },
                  ].map((stat, idx) => {
                    const Icon = stat.icon
                    return (
                      <motion.button
                        key={stat.label}
                        onClick={stat.onClick}
                        disabled={!stat.onClick}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-all ${
                          stat.onClick
                            ? 'cursor-pointer border-bone/10 hover:border-imperial-gold/30 hover:bg-imperial-gold/5'
                            : 'cursor-default border-bone/10'
                        }`}
                        whileHover={stat.onClick ? { scale: 1.02 } : {}}
                        whileTap={stat.onClick ? { scale: 0.98 } : {}}
                      >
                        <Icon className={`h-4 w-4 text-${stat.color}`} />
                        <span className={`font-bold text-${stat.color}`}>
                          <AnimatedCounter value={stat.value} />
                        </span>
                        <span className="font-mono text-xs text-bone/50">{stat.label}</span>
                      </motion.button>
                    )
                  })}
                </motion.div>

                {/* Location, date, socials, follow */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-wrap justify-center gap-4 text-sm text-bone/50 md:justify-start">
                    {profile.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" style={{ color: primaryFactionColor }} />
                        {profile.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-bone/40" />
                      {new Date(profile.created_at).toLocaleDateString('es-ES', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-2 md:justify-start">
                    {/* Social Links */}
                    {profile.instagram && (
                      <motion.a
                        href={`https://instagram.com/${profile.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-pink-500/30 bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-2.5 text-pink-400 transition-all hover:border-pink-400"
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        title={`@${profile.instagram}`}
                      >
                        <Instagram className="h-4 w-4" />
                      </motion.a>
                    )}
                    {profile.twitter && (
                      <motion.a
                        href={`https://x.com/${profile.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-bone/20 bg-bone/10 p-2.5 text-bone/80 transition-all hover:border-bone/40"
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        title={`@${profile.twitter}`}
                      >
                        <XIcon className="h-4 w-4" />
                      </motion.a>
                    )}
                    {profile.youtube && (
                      <motion.a
                        href={`https://youtube.com/@${profile.youtube}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-red-500/30 bg-red-500/20 p-2.5 text-red-400 transition-all hover:border-red-400"
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        title={`@${profile.youtube}`}
                      >
                        <Youtube className="h-4 w-4" />
                      </motion.a>
                    )}

                    {!isOwnProfile && (
                      <FollowButton userId={profile.id} onFollowChange={handleFollowChange} />
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Bottom accent line */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{
              background: `linear-gradient(90deg, transparent, ${primaryFactionColor}60, transparent)`,
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* CREATOR SHOWCASE - VITRINA DE CONDECORACIONES */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {profile.creator_status === 'approved' && profile.creator_type && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="relative mb-6 overflow-hidden rounded-2xl border border-purple-500/30 bg-void-light/50 backdrop-blur-md"
          >
            <AdministratumCorner position="top-left" color="rgba(168,85,247,0.5)" />
            <AdministratumCorner position="top-right" color="rgba(168,85,247,0.5)" />
            <AdministratumCorner position="bottom-left" color="rgba(236,72,153,0.4)" />
            <AdministratumCorner position="bottom-right" color="rgba(236,72,153,0.4)" />

            {/* Gradient background */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, transparent 50%, rgba(236,72,153,0.08) 100%)',
              }}
            />

            {/* Animated mesh */}
            <motion.div
              className="absolute inset-0 opacity-20"
              animate={{
                background: [
                  'radial-gradient(circle at 20% 30%, rgba(168,85,247,0.2) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 70%, rgba(236,72,153,0.2) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 30%, rgba(168,85,247,0.2) 0%, transparent 50%)',
                ],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Header strip */}
            <div className="relative border-b border-purple-500/20 bg-purple-500/5 px-6 py-3">
              <div className="flex items-center justify-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-purple-500/30" />
                <span className="font-mono text-[10px] tracking-[0.3em] text-purple-400/70">
                  SERVICIOS DEL CREADOR
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-purple-500/30" />
              </div>
            </div>

            <div className="relative p-6">
              {/* Creator content - Commission status, bio, portfolio */}
              <div className="flex flex-col gap-4">
                {/* Top row: Commission status + Portfolio */}
                <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
                  {/* Commission status */}
                  {profile.accepts_commissions && (
                    <motion.div
                      className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-4 py-2"
                      animate={{
                        boxShadow: [
                          '0 0 10px rgba(16,185,129,0)',
                          '0 0 20px rgba(16,185,129,0.3)',
                          '0 0 10px rgba(16,185,129,0)',
                        ],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <motion.span
                        className="h-2.5 w-2.5 rounded-full bg-emerald-400"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <span className="font-mono text-sm tracking-wide text-emerald-400">
                        ACEPTA ENCARGOS
                      </span>
                    </motion.div>
                  )}

                  {/* Portfolio URL */}
                  {profile.portfolio_url && (
                    <motion.a
                      href={profile.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/15 px-4 py-2.5 text-purple-300 transition-all hover:border-purple-400 hover:bg-purple-500/25"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Sparkles className="h-4 w-4 group-hover:text-purple-200" />
                      <span className="font-mono text-sm">VER PORTFOLIO PRINCIPAL</span>
                      <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                    </motion.a>
                  )}
                </div>

                {/* Creator bio */}
                {profile.creator_bio && (
                  <p className="text-center leading-relaxed text-bone/70 md:text-left">
                    {profile.creator_bio}
                  </p>
                )}

                {/* Commission info */}
                {profile.commission_info && (
                  <div className="rounded-lg border border-purple-500/20 bg-void/40 p-4">
                    <h4 className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-purple-400/70">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-400/50" />
                      INFORMACION DE ENCARGOS
                    </h4>
                    <p className="text-sm leading-relaxed text-bone/60">
                      {profile.commission_info}
                    </p>
                  </div>
                )}
              </div>

              {/* Portfolio Grid */}
              {profile.creator_services && profile.creator_services.length > 0 && (
                <div className="mt-6 border-t border-purple-500/20 pt-6">
                  <PortfolioGrid
                    links={profile.creator_services}
                    creatorType={profile.creator_type}
                    maxVisible={4}
                    showYouTubeVideos={true}
                  />
                </div>
              )}
            </div>

            {/* Bottom accent */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/40 via-pink-500/30 to-purple-500/40" />
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* FACTIONS SECTION */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {factions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="relative mb-6 overflow-hidden rounded-2xl border border-imperial-gold/20 bg-void-light/50 backdrop-blur-md"
          >
            <AdministratumCorner position="top-left" color={`${primaryFactionColor}50`} />
            <AdministratumCorner position="top-right" color={`${primaryFactionColor}50`} />
            <AdministratumCorner position="bottom-left" color={`${primaryFactionColor}50`} />
            <AdministratumCorner position="bottom-right" color={`${primaryFactionColor}50`} />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-imperial-gold/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    filter: [
                      'drop-shadow(0 0 4px rgba(201,162,39,0.4))',
                      'drop-shadow(0 0 8px rgba(201,162,39,0.7))',
                      'drop-shadow(0 0 4px rgba(201,162,39,0.4))',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Shield className="h-5 w-5 text-imperial-gold" />
                </motion.div>
                <div>
                  <h3 className="font-mono text-sm font-bold tracking-wider text-imperial-gold">
                    DECLARACION DE LEALTAD
                  </h3>
                  <p className="font-mono text-[10px] text-bone/40">
                    {factions.length}{' '}
                    {factions.length === 1 ? 'faccion jurada' : 'facciones juradas'}
                  </p>
                </div>
              </div>
            </div>

            {/* Faction cards */}
            <div className="p-6">
              <div
                className={`grid gap-4 ${factions.length === 1 ? 'max-w-md grid-cols-1' : factions.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}
              >
                {factions.map((faction, idx) => (
                  <FactionCard key={faction.id} faction={faction} index={idx} />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* MINIATURES SECTION */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="relative mb-6 overflow-hidden rounded-2xl border border-imperial-gold/20 bg-void-light/50 backdrop-blur-md"
        >
          <AdministratumCorner position="top-left" />
          <AdministratumCorner position="top-right" />
          <AdministratumCorner position="bottom-left" />
          <AdministratumCorner position="bottom-right" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-imperial-gold/10 px-6 py-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  filter: [
                    'drop-shadow(0 0 4px rgba(201,162,39,0.4))',
                    'drop-shadow(0 0 8px rgba(201,162,39,0.7))',
                    'drop-shadow(0 0 4px rgba(201,162,39,0.4))',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <ImageIcon className="h-5 w-5 text-imperial-gold" />
              </motion.div>
              <div>
                <h3 className="font-mono text-sm font-bold tracking-wider text-imperial-gold">
                  REGISTRO DE MINIATURAS
                </h3>
                <p className="font-mono text-[10px] text-bone/40">
                  {miniaturesCount} entradas catalogadas
                </p>
              </div>
            </div>

            {miniaturesCount > 0 && (
              <Link
                href={`/galeria?user=${profile.username}`}
                className="group flex items-center gap-1 font-mono text-xs text-imperial-gold/70 transition-colors hover:text-imperial-gold"
              >
                Ver todas
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {recentMiniatures.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {recentMiniatures.map((miniature, idx) => (
                  <MiniatureCard
                    key={miniature.id}
                    miniature={miniature}
                    index={idx}
                    factionColor={primaryFactionColor}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={ImageIcon}
                title="Archivos vacios"
                description={
                  isOwnProfile
                    ? 'Aun no has subido ninguna miniatura a los registros'
                    : 'Este ciudadano aun no ha registrado miniaturas'
                }
                action={
                  isOwnProfile && (
                    <Link href="/mi-galeria/subir">
                      <motion.button
                        className="rounded-lg bg-gradient-to-r from-imperial-gold to-yellow-500 px-6 py-3 font-display font-bold text-void"
                        whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(201,162,39,0.4)' }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Registrar Miniatura
                      </motion.button>
                    </Link>
                  )
                }
              />
            )}
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* LIKED MINIATURES SECTION */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="relative overflow-hidden rounded-2xl border border-bone/10 bg-void-light/30 backdrop-blur-md"
        >
          <AdministratumCorner position="top-left" color="rgba(201,162,39,0.3)" />
          <AdministratumCorner position="top-right" color="rgba(201,162,39,0.3)" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-bone/10 px-6 py-4">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-red-400" />
              <h3 className="font-mono text-sm font-bold tracking-wider text-bone/70">
                MINIATURAS FAVORITAS
              </h3>
            </div>

            <motion.button
              onClick={() => setShowLikes(!showLikes)}
              className="flex items-center gap-1 font-mono text-xs text-bone/50 transition-colors hover:text-bone"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {showLikes ? 'Ocultar' : 'Mostrar'}
              <motion.div animate={{ rotate: showLikes ? 90 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            </motion.button>
          </div>

          {/* Content */}
          <AnimatePresence>
            {showLikes && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-6">
                  {likesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Spinner size="lg" />
                    </div>
                  ) : likedMiniatures.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                      {likedMiniatures.map((miniature, idx) => (
                        <MiniatureCard
                          key={miniature.id}
                          miniature={miniature}
                          index={idx}
                          factionColor={primaryFactionColor}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Heart}
                      title="Sin favoritos"
                      description={
                        isOwnProfile
                          ? 'Aun no has marcado ninguna miniatura como favorita'
                          : 'Este ciudadano no tiene favoritos registrados'
                      }
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!showLikes && (
            <div className="px-6 py-8 text-center font-mono text-xs text-bone/30">
              Haz clic en &quot;Mostrar&quot; para consultar los favoritos
            </div>
          )}
        </motion.div>
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

// ═══════════════════════════════════════════════════════════════════
// FACTION CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════

function FactionCard({ faction, index }: { faction: Faction; index: number }) {
  const iconPath = FACTION_ICONS[faction.slug]
  const primaryColor = faction.primary_color || '#c9a227'
  const secondaryColor = faction.secondary_color || '#8b0000'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
    >
      <Link href={`/facciones/${faction.slug}`}>
        <motion.div
          className="group relative cursor-pointer overflow-hidden rounded-xl p-4"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}30 0%, rgba(10,10,15,0.9) 50%, ${secondaryColor}20 100%)`,
            border: `1px solid ${primaryColor}40`,
          }}
          whileHover={{
            y: -4,
            boxShadow: `0 10px 40px ${primaryColor}30`,
            borderColor: `${primaryColor}70`,
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Shimmer on hover */}
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100"
            style={{
              background: `linear-gradient(105deg, transparent 40%, ${primaryColor}15 50%, transparent 60%)`,
            }}
            initial={{ x: '-100%' }}
            whileHover={{ x: '200%' }}
            transition={{ duration: 0.8 }}
          />

          <div className="relative flex items-center gap-4">
            {/* Icon container */}
            <motion.div
              className="relative flex h-14 w-14 items-center justify-center rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}80, ${secondaryColor}60)`,
                boxShadow: `0 4px 20px ${primaryColor}40`,
              }}
              whileHover={{ scale: 1.1 }}
            >
              {iconPath ? (
                <Image
                  src={iconPath}
                  alt={faction.name}
                  width={28}
                  height={28}
                  className="opacity-95 brightness-0 invert"
                />
              ) : (
                <Shield className="h-7 w-7 text-white" />
              )}
            </motion.div>

            {/* Name */}
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg font-bold text-bone transition-colors group-hover:text-white">
                {faction.name}
              </p>
              {/* Color bar */}
              <motion.div
                className="mt-2 h-1 overflow-hidden rounded-full"
                style={{ background: `${primaryColor}30` }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
                  }}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                />
              </motion.div>
            </div>

            {/* Arrow */}
            <ChevronRight className="h-5 w-5 text-bone/30 transition-all group-hover:translate-x-1 group-hover:text-white" />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MINIATURE CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════

function MiniatureCard({
  miniature,
  index,
  factionColor,
}: {
  miniature: Miniature
  index: number
  factionColor: string
}) {
  const imageUrl = optimizeImageUrl(miniature.thumbnail_url || miniature.images?.[0], 400, 75)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/galeria/${miniature.id}`}>
        <motion.div
          className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(20,20,25,0.9), rgba(15,15,20,0.95))',
            border: '1px solid rgba(201,162,39,0.15)',
          }}
          whileHover={{
            scale: 1.03,
            boxShadow: `0 8px 30px ${factionColor}25`,
          }}
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
              <ImageIcon className="h-12 w-12 text-bone/20" />
            </div>
          )}

          {/* Overlay */}
          <motion.div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100" />

          {/* Info */}
          <motion.div className="absolute bottom-0 left-0 right-0 translate-y-full p-3 transition-transform duration-300 group-hover:translate-y-0">
            <p className="mb-1 truncate text-sm font-medium text-bone">{miniature.title}</p>
            <div className="flex items-center gap-3 text-xs text-bone/70">
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3 text-red-400" />
                {miniature.likes_count}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3 text-imperial-gold" />
                {miniature.comments_count}
              </span>
            </div>
          </motion.div>

          {/* Border glow */}
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-all group-hover:opacity-100"
            style={{
              border: `2px solid ${factionColor}`,
              boxShadow: `inset 0 0 30px ${factionColor}20`,
            }}
          />
        </motion.div>
      </Link>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// EMPTY STATE COMPONENT
// ═══════════════════════════════════════════════════════════════════

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="py-12 text-center">
      <motion.div
        className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-imperial-gold/30 bg-imperial-gold/10"
        animate={{
          boxShadow: [
            '0 0 15px rgba(201,162,39,0.2)',
            '0 0 30px rgba(201,162,39,0.4)',
            '0 0 15px rgba(201,162,39,0.2)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Icon className="h-8 w-8 text-imperial-gold" />
      </motion.div>
      <h3 className="mb-2 font-display text-lg font-bold text-imperial-gold/60">{title}</h3>
      <p className="mx-auto mb-4 max-w-md text-sm text-bone/50">{description}</p>
      {action}
    </div>
  )
}
