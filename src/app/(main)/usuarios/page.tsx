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
  Cpu,
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
        .eq('type', 'faction')
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

  return (
    <div className="min-h-screen bg-void pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Cpu className="w-5 h-5 text-imperial-gold" />
            <span className="text-xs font-mono text-imperial-gold/60 tracking-widest">
              ADMINISTRATUM // DIRECTORIO DE PERSONAL
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-bone tracking-wide">
            Descubrir Usuarios
          </h1>
          <p className="text-bone/50 mt-2 font-body">
            Encuentra pintores con intereses similares y conecta con la comunidad
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bone/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o usuario..."
                className="w-full pl-12 pr-4 py-3 bg-void-light/50 backdrop-blur-sm border border-bone/10 rounded-xl text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 transition-colors font-mono"
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
                    title="Sin resultados"
                    description="No se encontraron usuarios con estos criterios"
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
                        title="Sin usuarios"
                        description="Aun no hay usuarios registrados"
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
                        description="Aun no hay usuarios destacados"
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
                        description="No hay nuevos miembros recientes"
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

// User Card Component
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
    >
      {/* Corner brackets */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-l border-t border-imperial-gold/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute -top-1 -right-1 w-3 h-3 border-r border-t border-imperial-gold/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-l border-b border-imperial-gold/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r border-b border-imperial-gold/30 opacity-0 group-hover:opacity-100 transition-opacity" />

      <Link href={`/usuarios/${user.username}`}>
        <motion.div
          className="bg-void-light/50 backdrop-blur-sm border border-bone/10 rounded-xl overflow-hidden hover:border-imperial-gold/30 transition-colors"
          whileHover={{ y: -2 }}
        >
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

// Empty State Component
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
        <Users className="w-10 h-10 text-imperial-gold" />
      </motion.div>
      <h3 className="text-xl font-display font-bold text-bone mb-2">{title}</h3>
      <p className="text-bone/60">{description}</p>
    </div>
  )
}
