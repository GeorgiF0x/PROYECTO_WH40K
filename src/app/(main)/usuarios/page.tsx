'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, Spinner } from '@/components/ui'
import { FollowButton } from '@/components/user/FollowButton'
import { FACTION_ICONS } from '@/components/user'
import { useAuth } from '@/lib/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import {
  Search,
  Users,
  Shield,
  Sparkles,
  Clock,
  Filter,
  X,
  MapPin,
  ImageIcon,
  ScrollText,
  Grid3X3,
  ChevronDown,
} from 'lucide-react'

interface Faction {
  id: string
  name: string
  slug: string
  primary_color: string | null
  secondary_color: string | null
}

interface UserProfile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  location: string | null
  created_at: string
  favorite_factions: string[] | null
  miniatures_count: number
  followers_count: number
}

// --- Decorative components: Registros del Administratum ---

// Gothic corner filigree — pointed junction with gothic cross motif
function AdministratumCorner({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
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
    <div className={`absolute ${posClass} w-[60px] h-[60px] pointer-events-none`} style={{ transform: flip }}>
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
        {/* Main angular path — pointed gothic junction */}
        <path
          d="M0 60 V16 L8 8 L16 0 H60"
          stroke="rgba(201,162,39,0.45)"
          strokeWidth="1.2"
          fill="none"
        />
        {/* Inner parallel trace */}
        <path
          d="M4 60 V19 L11 11 L19 4 H60"
          stroke="rgba(201,162,39,0.18)"
          strokeWidth="0.8"
          fill="none"
        />
        {/* Gothic cross near junction */}
        <line x1="8" y1="4" x2="8" y2="14" stroke="rgba(201,162,39,0.3)" strokeWidth="0.8" />
        <line x1="3" y1="9" x2="13" y2="9" stroke="rgba(201,162,39,0.3)" strokeWidth="0.8" />
        {/* Serif terminals */}
        <line x1="56" y1="-2" x2="56" y2="4" stroke="rgba(201,162,39,0.3)" strokeWidth="0.8" />
        <line x1="-2" y1="56" x2="4" y2="56" stroke="rgba(201,162,39,0.3)" strokeWidth="0.8" />
        {/* Diamond accent nodes (rotated rect) */}
        <rect x="27" y="-2" width="4" height="4" transform="rotate(45 29 0)" fill="rgba(201,162,39,0.3)" />
        <rect x="-2" y="27" width="4" height="4" transform="rotate(45 0 29)" fill="rgba(201,162,39,0.3)" />
      </svg>
    </div>
  )
}

// Ink motes — archive dust & ink droplets floating
const INK_MOTES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${(i * 8.3 + 5) % 88 + 6}%`,
  top: `${(i * 11 + 7) % 78 + 11}%`,
  color: i % 3 === 0
    ? 'rgba(201,162,39,0.35)'   // golden ink drops
    : i % 3 === 1
      ? 'rgba(180,130,30,0.3)'  // amber dust
      : 'rgba(139,0,0,0.25)',   // dark ink stain
  size: 4 + (i % 4) * 2,
  drift: 12 + (i % 5) * 4,
  dur: 8 + (i % 7),
  delay: i * 0.7,
  blur: 2 + (i % 3),
}))

function InkMotes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
            filter: `blur(${m.blur}px)`,
          }}
          animate={{
            y: [0, -m.drift, 0],
            opacity: [0, 0.6, 0],
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

// Aquila Imperial watermark — simplified double-headed eagle
function AquilaWatermark() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      <motion.div
        animate={{ opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="500" height="350" viewBox="0 0 300 200" fill="none" className="text-imperial-gold">
          {/* Left wing — 3 feather layers */}
          <path d="M150 100 Q110 60 40 30 Q70 55 60 80 Q50 60 20 50 Q50 75 45 95 Q35 80 10 75 Q40 95 55 110 Z" stroke="currentColor" strokeWidth="0.6" fill="none" />
          {/* Right wing — mirrored */}
          <path d="M150 100 Q190 60 260 30 Q230 55 240 80 Q250 60 280 50 Q250 75 255 95 Q265 80 290 75 Q260 95 245 110 Z" stroke="currentColor" strokeWidth="0.6" fill="none" />
          {/* Left head */}
          <path d="M120 80 Q110 65 100 60 Q108 62 115 70 Q112 68 105 70" stroke="currentColor" strokeWidth="0.5" fill="none" />
          {/* Right head */}
          <path d="M180 80 Q190 65 200 60 Q192 62 185 70 Q188 68 195 70" stroke="currentColor" strokeWidth="0.5" fill="none" />
          {/* Central body / tail */}
          <path d="M140 110 L150 170 L160 110" stroke="currentColor" strokeWidth="0.6" fill="none" />
          <path d="M135 115 L150 180 L165 115" stroke="currentColor" strokeWidth="0.4" fill="none" />
          {/* Central skull */}
          <circle cx="150" cy="95" r="8" stroke="currentColor" strokeWidth="0.6" fill="none" />
          <circle cx="147" cy="93" r="1.5" fill="currentColor" opacity="0.4" />
          <circle cx="153" cy="93" r="1.5" fill="currentColor" opacity="0.4" />
          <path d="M148 98 L150 100 L152 98" stroke="currentColor" strokeWidth="0.4" fill="none" />
        </svg>
      </motion.div>
    </div>
  )
}

// Section divider with gothic cross
function AdministratumDivider() {
  return (
    <div className="relative flex items-center justify-center py-6">
      {/* Left line */}
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-imperial-gold/20" />
      {/* Left diamond */}
      <motion.div
        className="w-1.5 h-1.5 bg-imperial-gold mx-2"
        style={{ transform: 'rotate(45deg)' }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Gothic cross SVG */}
      <div className="mx-3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-imperial-gold">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
          <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
          <line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        </svg>
      </div>
      {/* Right diamond */}
      <motion.div
        className="w-1.5 h-1.5 bg-imperial-gold mx-2"
        style={{ transform: 'rotate(45deg)' }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      />
      {/* Right line */}
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-imperial-gold/20" />
    </div>
  )
}

// Ledger lines — ruled background like an accountant's book
function LedgerLines() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Horizontal ruled lines */}
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="absolute w-full h-px bg-imperial-gold/[0.06]"
          style={{ top: `${(i + 1) * 11.1}%` }}
        />
      ))}
      {/* Red margin line */}
      <div
        className="absolute top-0 bottom-0 w-px bg-blood-red/[0.08]"
        style={{ left: '8%' }}
      />
    </div>
  )
}

export default function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [featuredUsers, setFeaturedUsers] = useState<UserProfile[]>([])
  const [newUsers, setNewUsers] = useState<UserProfile[]>([])
  const [factions, setFactions] = useState<Faction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [activeSection, setActiveSection] = useState<'all' | 'featured' | 'new'>('all')
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

  const supabase = createClient()

  // Fetch factions for filter
  useEffect(() => {
    const fetchFactions = async () => {
      const { data } = await supabase
        .from('tags')
        .select('id, name, slug, primary_color, secondary_color')
        .eq('category', 'faction')
        .order('name')

      if (data) setFactions(data)
    }
    fetchFactions()
  }, [])

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true)

    // Base query - get profiles with counts
    let query = supabase
      .from('profiles')
      .select(`
        id, username, display_name, avatar_url, bio, location, created_at, favorite_factions,
        miniatures:miniatures(count),
        followers:follows!follows_following_id_fkey(count)
      `)
      .not('username', 'is', null)

    // Apply search filter
    if (searchQuery) {
      query = query.or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
    }

    // Apply faction filter
    if (selectedFaction) {
      query = query.contains('favorite_factions', [selectedFaction])
    }

    // Exclude current user
    if (user) {
      query = query.neq('id', user.id)
    }

    const { data, error } = await query.limit(50)

    if (!error && data) {
      const formatted = data.map((u) => ({
        id: u.id,
        username: u.username,
        display_name: u.display_name,
        avatar_url: u.avatar_url,
        bio: u.bio,
        location: u.location,
        created_at: u.created_at,
        favorite_factions: u.favorite_factions,
        miniatures_count: (u.miniatures as { count: number }[])?.[0]?.count || 0,
        followers_count: (u.followers as { count: number }[])?.[0]?.count || 0,
      }))

      setUsers(formatted)

      // Set featured (most followers/miniatures) - only on initial load
      if (!searchQuery && !selectedFaction) {
        const featured = [...formatted]
          .sort((a, b) => (b.followers_count + b.miniatures_count) - (a.followers_count + a.miniatures_count))
          .slice(0, 4)
        setFeaturedUsers(featured)

        // Set new users (most recent)
        const newest = [...formatted]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 4)
        setNewUsers(newest)
      }
    }

    setLoading(false)
  }, [searchQuery, selectedFaction, user])

  useEffect(() => {
    // Debounce search
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }
    searchTimeout.current = setTimeout(() => {
      fetchUsers()
    }, 300)

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
      }
    }
  }, [fetchUsers])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedFaction(null)
  }

  const hasFilters = searchQuery || selectedFaction

  const currentYear = new Date().getFullYear()
  const currentDate = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="min-h-screen bg-void pt-20 pb-16 relative">
      {/* === Atmospheric Background === */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Amber aurora */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 20% 20%, rgba(201,162,39,0.08) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 80%, rgba(139,0,0,0.05) 0%, transparent 60%)
            `,
          }}
        />
        {/* Candlelight breathing 1 */}
        <motion.div
          className="absolute top-[15%] left-[25%] w-[500px] h-[500px]"
          style={{
            background: 'radial-gradient(circle, rgba(201,162,39,0.06) 0%, transparent 70%)',
          }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Candlelight breathing 2 */}
        <motion.div
          className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px]"
          style={{
            background: 'radial-gradient(circle, rgba(139,0,0,0.04) 0%, transparent 70%)',
          }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Ink motes */}
        <InkMotes />
        {/* Aquila watermark */}
        <AquilaWatermark />
        {/* Parchment lines */}
        <div
          className="absolute inset-0"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(201,162,39,0.04) 79px, rgba(201,162,39,0.04) 80px)',
          }}
        />
        {/* Scan line */}
        <motion.div
          className="absolute left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(201,162,39,0.15) 50%, transparent 100%)',
          }}
          animate={{ top: ['0%', '100%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
        {/* === Header Bar === */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-xl border border-imperial-gold/20 bg-void-light/80 backdrop-blur-sm overflow-hidden mb-8"
        >
          {/* Corner filigrees */}
          <AdministratumCorner position="top-left" />
          <AdministratumCorner position="top-right" />
          <AdministratumCorner position="bottom-left" />
          <AdministratumCorner position="bottom-right" />
          {/* Ledger lines bg */}
          <LedgerLines />
          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(201,162,39,0.04) 100%)',
            }}
          />
          {/* Shimmer */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(201,162,39,0.06) 50%, transparent 60%)',
            }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative z-10 px-6 py-5 flex items-center gap-4">
            {/* Icon with halo */}
            <motion.div
              className="relative"
              animate={{
                filter: [
                  'drop-shadow(0 0 4px rgba(201,162,39,0.3))',
                  'drop-shadow(0 0 8px rgba(201,162,39,0.6))',
                  'drop-shadow(0 0 4px rgba(201,162,39,0.3))',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ScrollText className="w-6 h-6 text-imperial-gold" />
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="font-mono text-xs tracking-[0.3em] text-imperial-gold/80 font-semibold">
                ADMINISTRATUM <span className="text-imperial-gold/40">&#9670;</span> REGISTRO IMPERIAL
              </div>
              <div className="font-mono text-[10px] text-bone/30 tracking-wider mt-0.5">
                REF: ADM/{currentYear}/USR-DIR — ULTIMA REVISION: {currentDate}
              </div>
            </div>

            {/* Census badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-imperial-gold/20 bg-imperial-gold/5">
              <div className="w-1.5 h-1.5 rounded-full bg-imperial-gold animate-pulse" />
              <span className="font-mono text-[10px] text-imperial-gold/70 tracking-widest">CENSADOS</span>
            </div>
          </div>
        </motion.div>

        {/* === Hero Section === */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          {/* Badge */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-imperial-gold/10 border border-imperial-gold/30">
              <ScrollText className="w-3.5 h-3.5 text-imperial-gold" />
              <span className="text-xs font-mono text-imperial-gold/80 tracking-wider">
                Archivos del Administratum
              </span>
            </div>
          </div>
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-wide">
            <span className="text-bone">Registro </span>
            <span className="bg-gradient-to-r from-imperial-gold via-yellow-500 to-imperial-gold bg-clip-text text-transparent">
              Imperial
            </span>
          </h1>
          <p className="text-bone/50 mt-2 font-body">
            Consulta los expedientes del Administratum. Cada miembro, un archivo en las bovedas del Imperium.
          </p>
          {/* Ornament: 3 diamonds flanked by gradient lines */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-imperial-gold/20" />
            <div className="w-1.5 h-1.5 bg-imperial-gold/40 rotate-45" />
            <div className="w-2 h-2 bg-imperial-gold/60 rotate-45" />
            <div className="w-1.5 h-1.5 bg-imperial-gold/40 rotate-45" />
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-imperial-gold/20" />
          </div>
        </motion.div>

        {/* === Search & Filters === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative rounded-xl border border-imperial-gold/10 bg-void/50 backdrop-blur-sm p-4 overflow-hidden">
            {/* Corner filigrees */}
            <AdministratumCorner position="top-left" />
            <AdministratumCorner position="top-right" />
            <AdministratumCorner position="bottom-left" />
            <AdministratumCorner position="bottom-right" />

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bone/30" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre o usuario..."
                    className="w-full pl-12 pr-4 py-3 bg-void-light/50 backdrop-blur-sm border border-bone/10 rounded-xl text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 focus:shadow-[0_0_0_3px_rgba(201,162,39,0.06)] transition-all font-mono"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-bone/40 hover:text-bone transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filter Toggle */}
                <motion.button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                    showFilters || selectedFaction
                      ? 'bg-imperial-gold/10 border-imperial-gold/30 text-imperial-gold'
                      : 'bg-void-light/50 border-bone/10 text-bone/60 hover:text-bone'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <Filter className="w-5 h-5" />
                  <span className="font-mono text-sm">Filtros</span>
                  {selectedFaction && (
                    <span className="w-2 h-2 rounded-full bg-imperial-gold" />
                  )}
                </motion.button>
              </div>

              {/* Faction Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4">
                      <p className="text-xs font-mono text-bone/50 mb-3 tracking-wider">
                        FILTRAR POR FACCION
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {factions.map((faction) => {
                          const isSelected = selectedFaction === faction.id
                          const iconPath = FACTION_ICONS[faction.slug]
                          return (
                            <motion.button
                              key={faction.id}
                              onClick={() => setSelectedFaction(isSelected ? null : faction.id)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                                isSelected
                                  ? 'border-imperial-gold/50 bg-imperial-gold/10'
                                  : 'border-bone/10 bg-void-light/30 hover:border-bone/30'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div
                                className="w-6 h-6 rounded flex items-center justify-center"
                                style={{
                                  background: `linear-gradient(135deg, ${faction.primary_color}40, ${faction.secondary_color}20)`,
                                }}
                              >
                                {iconPath ? (
                                  <Image src={iconPath} alt="" width={14} height={14} className="invert opacity-80" />
                                ) : (
                                  <Shield className="w-3 h-3" style={{ color: faction.primary_color || '#c9a227' }} />
                                )}
                              </div>
                              <span className={`text-sm ${isSelected ? 'text-imperial-gold' : 'text-bone/70'}`}>
                                {faction.name}
                              </span>
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Clear filters */}
              {hasFilters && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 mt-4"
                >
                  <span className="text-sm text-bone/50">
                    {users.length} resultado{users.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-imperial-gold hover:text-imperial-gold/80 transition-colors"
                  >
                    Limpiar filtros
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Section Tabs (only show when no filters) */}
        {!hasFilters && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-1 p-1 bg-void-light/30 backdrop-blur-sm border border-bone/10 rounded-xl mb-8"
          >
            {[
              { id: 'all' as const, label: 'Todos', icon: Grid3X3 },
              { id: 'featured' as const, label: 'Destacados', icon: Sparkles },
              { id: 'new' as const, label: 'Nuevos', icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeSection === tab.id
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-mono text-sm transition-all ${
                    isActive
                      ? 'bg-imperial-gold text-void'
                      : 'text-bone/60 hover:text-bone hover:bg-bone/5'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </motion.button>
              )
            })}
          </motion.div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Spinner size="lg" />
              <p className="text-bone/50 font-mono text-sm">BUSCANDO EN ARCHIVOS...</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection + (hasFilters ? '-filtered' : '')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* When filtering, show all results */}
              {hasFilters ? (
                users.length > 0 ? (
                  <UserGrid users={users} currentUserId={user?.id} />
                ) : (
                  <EmptyState
                    title="Archivos vacios"
                    description="No se encontraron ciudadanos registrados en el Administratum con estos criterios"
                  />
                )
              ) : (
                <>
                  {/* All Users */}
                  {activeSection === 'all' && (
                    users.length > 0 ? (
                      <UserGrid users={users} currentUserId={user?.id} />
                    ) : (
                      <EmptyState
                        title="Archivos vacios"
                        description="Aun no hay ciudadanos registrados en el Administratum"
                      />
                    )
                  )}

                  {/* Featured Users */}
                  {activeSection === 'featured' && (
                    featuredUsers.length > 0 ? (
                      <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-imperial-gold" />
                          <h2 className="text-lg font-display font-bold text-bone">
                            Usuarios Destacados
                          </h2>
                        </div>
                        <UserGrid users={featuredUsers} currentUserId={user?.id} featured />
                      </div>
                    ) : (
                      <EmptyState
                        title="Sin destacados"
                        description="Aun no hay usuarios destacados en los registros"
                      />
                    )
                  )}

                  {/* New Users */}
                  {activeSection === 'new' && (
                    newUsers.length > 0 ? (
                      <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-imperial-gold" />
                          <h2 className="text-lg font-display font-bold text-bone">
                            Nuevos Miembros
                          </h2>
                        </div>
                        <UserGrid users={newUsers} currentUserId={user?.id} />
                      </div>
                    ) : (
                      <EmptyState
                        title="Sin nuevos miembros"
                        description="No hay nuevos ciudadanos censados recientemente"
                      />
                    )
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

// User Grid Component
function UserGrid({
  users,
  currentUserId,
  featured = false,
}: {
  users: UserProfile[]
  currentUserId?: string
  featured?: boolean
}) {
  return (
    <div className={`grid gap-4 ${featured ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
      {users.map((user, idx) => (
        <UserCard key={user.id} user={user} index={idx} currentUserId={currentUserId} featured={featured} />
      ))}
    </div>
  )
}

// User Card Component — with Administratum hover effects
function UserCard({
  user,
  index,
  currentUserId,
  featured = false,
}: {
  user: UserProfile
  index: number
  currentUserId?: string
  featured?: boolean
}) {
  const [factionDetails, setFactionDetails] = useState<Faction[]>([])
  const [isHovered, setIsHovered] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (user.favorite_factions && user.favorite_factions.length > 0) {
      const fetchFactions = async () => {
        const { data } = await supabase
          .from('tags')
          .select('id, name, slug, primary_color, secondary_color')
          .in('id', user.favorite_factions!)
        if (data) {
          const ordered = user.favorite_factions!
            .map((id) => data.find((f) => f.id === id))
            .filter(Boolean) as Faction[]
          setFactionDetails(ordered)
        }
      }
      fetchFactions()
    }
  }, [user.favorite_factions])

  const getGradient = () => {
    if (factionDetails.length === 0) return 'linear-gradient(135deg, #c9a227 0%, #8b0000 100%)'
    if (factionDetails.length === 1) return `linear-gradient(135deg, ${factionDetails[0].primary_color} 0%, ${factionDetails[0].secondary_color} 100%)`
    return `linear-gradient(135deg, ${factionDetails[0].primary_color} 0%, ${factionDetails[factionDetails.length - 1].primary_color} 100%)`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Animated border glow */}
      <motion.div
        className="absolute -inset-[1px] rounded-xl pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(201,162,39,0.4), rgba(139,0,0,0.3), rgba(201,162,39,0.4))',
        }}
        animate={{ opacity: isHovered ? 0.5 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <Link href={`/usuarios/${user.username}`}>
        <motion.div
          className="relative bg-void-light/50 backdrop-blur-sm border border-bone/10 rounded-xl overflow-hidden hover:border-imperial-gold/30 transition-colors"
          whileHover={{ y: -6 }}
        >
          {/* Inner warm glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at bottom, rgba(201,162,39,0.04), transparent 70%)',
            }}
          />

          {/* Mini Banner */}
          <div
            className="h-16 relative overflow-hidden"
            style={{ background: getGradient(), opacity: 0.6 }}
          >
            {/* Grid pattern */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
              }}
            />

            {/* Faction badges */}
            {factionDetails.length > 0 && (
              <div className="absolute top-2 right-2 flex gap-1">
                {factionDetails.slice(0, 3).map((faction) => {
                  const iconPath = FACTION_ICONS[faction.slug]
                  return (
                    <div
                      key={faction.id}
                      className="w-5 h-5 rounded flex items-center justify-center backdrop-blur-sm"
                      style={{
                        background: `linear-gradient(135deg, ${faction.primary_color}CC, ${faction.secondary_color}99)`,
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                      title={faction.name}
                    >
                      {iconPath ? (
                        <Image src={iconPath} alt="" width={10} height={10} className="invert opacity-90" />
                      ) : (
                        <Shield className="w-2.5 h-2.5 text-white/90" />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 -mt-8 relative">
            {/* Avatar */}
            <div className="relative w-fit mb-3">
              <motion.div
                className="absolute -inset-1 rounded-full opacity-30"
                style={{
                  background: factionDetails.length > 0
                    ? `conic-gradient(from 0deg, ${factionDetails[0].primary_color}, ${factionDetails[factionDetails.length-1]?.secondary_color || factionDetails[0].secondary_color}, ${factionDetails[0].primary_color})`
                    : 'conic-gradient(from 0deg, #c9a227, #8b0000, #c9a227)',
                }}
              />
              <Avatar
                src={user.avatar_url}
                alt={user.display_name || user.username}
                size="md"
                className="w-14 h-14 ring-2 ring-void-light relative"
              />
            </div>

            {/* Name */}
            <h3 className="font-display font-bold text-bone text-lg leading-tight group-hover:text-imperial-gold transition-colors">
              {user.display_name || user.username}
            </h3>
            <p className="text-xs text-bone/50 font-mono mb-2">@{user.username}</p>

            {/* Bio */}
            {user.bio && (
              <p className="text-sm text-bone/60 line-clamp-2 mb-3">
                {user.bio}
              </p>
            )}

            {/* Location */}
            {user.location && (
              <div className="flex items-center gap-1 text-xs text-bone/40 mb-3">
                <MapPin className="w-3 h-3" />
                {user.location}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-bone/50 pt-3 border-t border-bone/5">
              <span className="flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                {user.miniatures_count} miniaturas
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {user.followers_count} seguidores
              </span>
            </div>
          </div>

          {/* Bottom accent line */}
          <motion.div
            className="absolute bottom-0 left-0 h-[2px]"
            style={{
              background: 'linear-gradient(90deg, rgba(201,162,39,0.8), rgba(234,179,8,0.6), rgba(201,162,39,0.8))',
            }}
            animate={{ width: isHovered ? '100%' : '0%' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </motion.div>
      </Link>

      {/* Follow button (outside link to prevent navigation) */}
      {currentUserId && currentUserId !== user.id && (
        <div className="absolute top-20 right-4" onClick={(e) => e.stopPropagation()}>
          <FollowButton userId={user.id} />
        </div>
      )}
    </motion.div>
  )
}

// Empty State Component — Administratum themed
function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center py-20">
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
        <ScrollText className="w-10 h-10 text-imperial-gold" />
      </motion.div>
      <h3 className="text-xl font-display font-bold text-imperial-gold/40 mb-2">{title}</h3>
      <p className="text-bone/50">{description}</p>
    </div>
  )
}
