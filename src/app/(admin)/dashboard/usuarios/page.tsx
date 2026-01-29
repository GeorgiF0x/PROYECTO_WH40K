'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Eye,
  Ban,
  UserX,
  Crown,
  Palette,
  Store,
  Calendar,
  Image as ImageIcon,
  MessageSquare,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui'
import type { Profile, UserRole, CreatorStatus } from '@/lib/types/database.types'

type UserWithStats = Profile & {
  miniatures_count?: number
  listings_count?: number
  followers_count?: number
}

const ROLE_LABELS: Record<UserRole, { label: string; icon: typeof Shield; color: string }> = {
  user: { label: 'Usuario', icon: Shield, color: 'text-bone/50 bg-bone/5 border-bone/10' },
  moderator: { label: 'Comisario', icon: ShieldAlert, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  admin: { label: 'Inquisidor', icon: ShieldCheck, color: 'text-red-500 bg-red-500/10 border-red-500/20' },
}

const CREATOR_STATUS_LABELS: Record<CreatorStatus, { label: string; color: string }> = {
  none: { label: 'No creador', color: 'text-bone/30' },
  pending: { label: 'Pendiente', color: 'text-amber-500' },
  approved: { label: 'Creador', color: 'text-purple-400' },
  rejected: { label: 'Rechazado', color: 'text-red-400' },
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showRoleModal, setShowRoleModal] = useState<{ userId: string; currentRole: UserRole } | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(0)
  const pageSize = 20

  const supabase = createClient()

  const fetchUsers = useCallback(async () => {
    setLoading(true)

    // Get total count
    let countQuery = supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })

    if (roleFilter !== 'all') {
      countQuery = countQuery.eq('role', roleFilter)
    }

    if (searchQuery) {
      countQuery = countQuery.or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
    }

    const { count } = await countQuery
    setTotalCount(count || 0)

    // Get paginated users
    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (roleFilter !== 'all') {
      query = query.eq('role', roleFilter)
    }

    if (searchQuery) {
      query = query.or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching users:', error)
    } else {
      setUsers(data as UserWithStats[])
    }
    setLoading(false)
  }, [supabase, roleFilter, searchQuery, page])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    setPage(0)
  }, [roleFilter, searchQuery])

  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    setActionLoading(userId)

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      console.error('Error changing role:', error)
      alert('Error al cambiar el rol')
    } else {
      setShowRoleModal(null)
      fetchUsers()
    }
    setActionLoading(null)
  }

  const toggleExpanded = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId)
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bone flex items-center gap-3">
            <UserCog className="w-7 h-7 text-gold" />
            Gestión de Usuarios
          </h1>
          <p className="text-bone/50 mt-1">
            Administra los usuarios de la plataforma
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-bone/5 border border-bone/10 rounded-lg">
          <Users className="w-4 h-4 text-bone/50" />
          <span className="text-sm text-bone/70">
            {totalCount.toLocaleString()} usuarios
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bone/40" />
          <input
            type="text"
            placeholder="Buscar por nombre o username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone placeholder:text-bone/40 focus:outline-none focus:border-gold/30"
          />
        </div>

        {/* Role Filter */}
        <div className="flex gap-2">
          {(['all', 'user', 'moderator', 'admin'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                roleFilter === role
                  ? 'bg-gold/10 text-gold border border-gold/20'
                  : 'bg-bone/5 text-bone/70 border border-bone/10 hover:bg-bone/10'
              )}
            >
              {role === 'all' ? 'Todos' : ROLE_LABELS[role].label}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="p-2.5 bg-bone/5 border border-bone/10 rounded-lg text-bone/70 hover:text-bone hover:bg-bone/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-bone/5 border border-bone/10 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 bg-bone/5 border border-bone/10 rounded-lg">
            <Users className="w-12 h-12 text-bone/30 mx-auto mb-4" />
            <p className="text-bone/50">No se encontraron usuarios</p>
          </div>
        ) : (
          <AnimatePresence>
            {users.map((user) => {
              const roleInfo = ROLE_LABELS[user.role]
              const RoleIcon = roleInfo.icon
              const creatorInfo = CREATOR_STATUS_LABELS[user.creator_status]
              const isExpanded = expandedUser === user.id

              return (
                <motion.div
                  key={user.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-void-light border border-bone/10 rounded-lg overflow-hidden"
                >
                  {/* Main Row */}
                  <div
                    className="p-4 cursor-pointer hover:bg-bone/5 transition-colors"
                    onClick={() => toggleExpanded(user.id)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <Avatar
                        src={user.avatar_url}
                        alt={user.display_name || user.username}
                        size="lg"
                      />

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-bone truncate">
                            {user.display_name || user.username}
                          </h3>
                          <span className={cn('px-2 py-0.5 rounded text-xs border flex items-center gap-1', roleInfo.color)}>
                            <RoleIcon className="w-3 h-3" />
                            {roleInfo.label}
                          </span>
                          {user.creator_status === 'approved' && (
                            <span className="px-2 py-0.5 rounded text-xs bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center gap-1">
                              <Palette className="w-3 h-3" />
                              Creador
                            </span>
                          )}
                          {user.is_store_owner && (
                            <span className="px-2 py-0.5 rounded text-xs bg-gold/10 border border-gold/20 text-gold flex items-center gap-1">
                              <Store className="w-3 h-3" />
                              Tienda
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-bone/50">
                          <span>@{user.username}</span>
                          {user.location && (
                            <span className="truncate">{user.location}</span>
                          )}
                        </div>
                        <p className="text-xs text-bone/40 mt-1">
                          Registrado el {new Date(user.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/usuarios/${user.username}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 bg-bone/5 border border-bone/10 rounded-lg text-bone/50 hover:text-bone hover:bg-bone/10 transition-colors"
                          title="Ver perfil"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowRoleModal({ userId: user.id, currentRole: user.role })
                          }}
                          className="p-2 bg-gold/10 border border-gold/20 rounded-lg text-gold hover:bg-gold/20 transition-colors"
                          title="Cambiar rol"
                        >
                          <Crown className="w-5 h-5" />
                        </button>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-bone/30" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-bone/30" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-2 border-t border-bone/10 space-y-4">
                          {/* Bio */}
                          {user.bio && (
                            <div>
                              <h4 className="text-xs font-medium text-bone/50 uppercase tracking-wider mb-1">Bio</h4>
                              <p className="text-sm text-bone/70">{user.bio}</p>
                            </div>
                          )}

                          {/* User Details Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-3 bg-bone/5 rounded-lg text-center">
                              <ImageIcon className="w-5 h-5 text-teal-400 mx-auto mb-1" />
                              <p className="text-xs text-bone/50">Miniaturas</p>
                              <p className="text-lg font-bold text-bone">—</p>
                            </div>
                            <div className="p-3 bg-bone/5 rounded-lg text-center">
                              <Store className="w-5 h-5 text-gold mx-auto mb-1" />
                              <p className="text-xs text-bone/50">Anuncios</p>
                              <p className="text-lg font-bold text-bone">—</p>
                            </div>
                            <div className="p-3 bg-bone/5 rounded-lg text-center">
                              <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                              <p className="text-xs text-bone/50">Seguidores</p>
                              <p className="text-lg font-bold text-bone">—</p>
                            </div>
                            <div className="p-3 bg-bone/5 rounded-lg text-center">
                              <MessageSquare className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                              <p className="text-xs text-bone/50">Mensajes</p>
                              <p className="text-lg font-bold text-bone">—</p>
                            </div>
                          </div>

                          {/* Status Info */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-3 bg-bone/5 rounded-lg">
                              <h4 className="text-xs text-bone/50 mb-1">Rol</h4>
                              <p className={cn('text-sm font-medium', roleInfo.color.split(' ')[0])}>
                                {roleInfo.label}
                              </p>
                            </div>
                            <div className="p-3 bg-bone/5 rounded-lg">
                              <h4 className="text-xs text-bone/50 mb-1">Estado Creador</h4>
                              <p className={cn('text-sm font-medium', creatorInfo.color)}>
                                {creatorInfo.label}
                                {user.creator_type && ` (${user.creator_type})`}
                              </p>
                            </div>
                            <div className="p-3 bg-bone/5 rounded-lg">
                              <h4 className="text-xs text-bone/50 mb-1">Propietario Tienda</h4>
                              <p className="text-sm font-medium text-bone">
                                {user.is_store_owner ? 'Sí' : 'No'}
                              </p>
                            </div>
                          </div>

                          {/* Favorite Factions */}
                          {user.favorite_factions && user.favorite_factions.length > 0 && (
                            <div>
                              <h4 className="text-xs font-medium text-bone/50 uppercase tracking-wider mb-2">Facciones Favoritas</h4>
                              <div className="flex flex-wrap gap-2">
                                {user.favorite_factions.map((faction, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-bone/5 border border-bone/10 rounded text-xs text-bone/70">
                                    {faction}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Social Links */}
                          <div className="flex flex-wrap gap-2">
                            {user.website && (
                              <a href={user.website} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-bone/5 border border-bone/10 rounded text-xs text-gold hover:bg-bone/10 transition-colors">
                                Sitio Web
                              </a>
                            )}
                            {user.instagram && (
                              <a href={`https://instagram.com/${user.instagram}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-pink-500/10 border border-pink-500/20 rounded text-xs text-pink-400 hover:bg-pink-500/20 transition-colors">
                                @{user.instagram}
                              </a>
                            )}
                            {user.twitter && (
                              <a href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400 hover:bg-blue-500/20 transition-colors">
                                @{user.twitter}
                              </a>
                            )}
                            {user.youtube && (
                              <a href={`https://youtube.com/${user.youtube}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400 hover:bg-red-500/20 transition-colors">
                                YouTube
                              </a>
                            )}
                          </div>

                          {/* Admin Actions */}
                          <div className="flex justify-end gap-2 pt-2 border-t border-bone/10">
                            <button
                              className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                              title="Función próximamente"
                            >
                              <Ban className="w-4 h-4" />
                              Banear
                            </button>
                            <button
                              className="flex items-center gap-2 px-3 py-1.5 bg-bone/5 border border-bone/10 rounded text-sm text-bone/70 hover:bg-bone/10 transition-colors"
                              title="Función próximamente"
                            >
                              <UserX className="w-4 h-4" />
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-bone/50">
            Mostrando {page * pageSize + 1}-{Math.min((page + 1) * pageSize, totalCount)} de {totalCount}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone/70 hover:bg-bone/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone/70 hover:bg-bone/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      <AnimatePresence>
        {showRoleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRoleModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-void-light border border-bone/20 rounded-lg p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-bone mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-gold" />
                Cambiar Rol
              </h3>
              <div className="space-y-3">
                {(['user', 'moderator', 'admin'] as const).map((role) => {
                  const info = ROLE_LABELS[role]
                  const Icon = info.icon
                  const isCurrentRole = showRoleModal.currentRole === role

                  return (
                    <button
                      key={role}
                      onClick={() => handleChangeRole(showRoleModal.userId, role)}
                      disabled={actionLoading === showRoleModal.userId || isCurrentRole}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-lg border transition-colors',
                        isCurrentRole
                          ? 'bg-gold/10 border-gold/30 text-gold cursor-default'
                          : 'bg-bone/5 border-bone/10 text-bone/70 hover:bg-bone/10 hover:text-bone'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="flex-1 text-left font-medium">{info.label}</span>
                      {isCurrentRole && (
                        <span className="text-xs bg-gold/20 px-2 py-0.5 rounded">Actual</span>
                      )}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => setShowRoleModal(null)}
                className="w-full mt-4 px-4 py-2 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone/70 hover:text-bone hover:bg-bone/10 transition-colors"
              >
                Cancelar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
