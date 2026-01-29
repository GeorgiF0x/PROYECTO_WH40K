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
  Edit,
  Trash2,
  Save,
  X,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
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
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<UserWithStats | null>(null)
  const [editForm, setEditForm] = useState({
    display_name: '',
    bio: '',
    location: '',
    website: '',
    instagram: '',
    twitter: '',
    youtube: '',
    creator_status: 'none' as CreatorStatus,
    is_store_owner: false,
  })
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
      toast.error('Error al cambiar el rol')
    } else {
      setShowRoleModal(null)
      fetchUsers()
    }
    setActionLoading(null)
  }

  const toggleExpanded = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId)
  }

  const handleEdit = (user: UserWithStats) => {
    setEditForm({
      display_name: user.display_name || '',
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      instagram: user.instagram || '',
      twitter: user.twitter || '',
      youtube: user.youtube || '',
      creator_status: user.creator_status,
      is_store_owner: user.is_store_owner,
    })
    setEditingUser(user)
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return
    setActionLoading(editingUser.id)

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: editForm.display_name || null,
        bio: editForm.bio || null,
        location: editForm.location || null,
        website: editForm.website || null,
        instagram: editForm.instagram || null,
        twitter: editForm.twitter || null,
        youtube: editForm.youtube || null,
        creator_status: editForm.creator_status,
        is_store_owner: editForm.is_store_owner,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingUser.id)

    if (error) {
      console.error('Error updating user:', error)
      toast.error('Error al actualizar el usuario')
    } else {
      setEditingUser(null)
      fetchUsers()
    }
    setActionLoading(null)
  }

  const handleDelete = async (userId: string) => {
    setActionLoading(userId)

    // Note: This deletes the profile but the auth user remains
    // In production, you'd also call a server action to delete the auth user
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (error) {
      console.error('Error deleting user:', error)
      toast.error('Error al eliminar el usuario. Puede que haya datos relacionados.')
    } else {
      setShowDeleteModal(null)
      fetchUsers()
    }
    setActionLoading(null)
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
                            handleEdit(user)
                          }}
                          disabled={actionLoading === user.id}
                          className="p-2 bg-bone/5 border border-bone/10 rounded-lg text-bone/50 hover:text-blue-400 hover:border-blue-400/20 transition-colors disabled:opacity-50"
                          title="Editar usuario"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
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
                              onClick={() => handleEdit(user)}
                              disabled={actionLoading === user.id}
                              className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded text-sm text-blue-400 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                            >
                              <Edit className="w-4 h-4" />
                              Editar
                            </button>
                            <button
                              onClick={() => setShowDeleteModal(user.id)}
                              disabled={actionLoading === user.id}
                              className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-void-light border border-bone/10 rounded-lg p-6 max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-bone">Eliminar Usuario</h3>
              </div>
              <p className="text-sm text-bone/70 mb-6">
                ¿Estás seguro de que deseas eliminar este usuario? Se borrarán todos sus datos de perfil. Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="px-4 py-2 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone/70 hover:bg-bone/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal)}
                  disabled={actionLoading === showDeleteModal}
                  className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  {actionLoading === showDeleteModal ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setEditingUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-void-light border border-bone/10 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-bone flex items-center gap-2">
                  <Edit className="w-5 h-5 text-blue-400" />
                  Editar Usuario: @{editingUser.username}
                </h3>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-1.5 bg-bone/5 rounded-lg hover:bg-bone/10 transition-colors"
                >
                  <X className="w-5 h-5 text-bone/50" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Display Name */}
                <div>
                  <label className="block text-sm text-bone/70 mb-1">Nombre para mostrar</label>
                  <input
                    type="text"
                    value={editForm.display_name}
                    onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone placeholder:text-bone/40 focus:outline-none focus:border-gold/30"
                    placeholder="Nombre para mostrar"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm text-bone/70 mb-1">Biografía</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone placeholder:text-bone/40 focus:outline-none focus:border-gold/30 resize-none"
                    placeholder="Biografía del usuario"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm text-bone/70 mb-1">Ubicación</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-4 py-2.5 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone placeholder:text-bone/40 focus:outline-none focus:border-gold/30"
                    placeholder="Ciudad, País"
                  />
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-bone/70 mb-1">Sitio Web</label>
                    <input
                      type="url"
                      value={editForm.website}
                      onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                      className="w-full px-4 py-2.5 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone placeholder:text-bone/40 focus:outline-none focus:border-gold/30"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-bone/70 mb-1">Instagram</label>
                    <input
                      type="text"
                      value={editForm.instagram}
                      onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })}
                      className="w-full px-4 py-2.5 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone placeholder:text-bone/40 focus:outline-none focus:border-gold/30"
                      placeholder="usuario"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-bone/70 mb-1">Twitter/X</label>
                    <input
                      type="text"
                      value={editForm.twitter}
                      onChange={(e) => setEditForm({ ...editForm, twitter: e.target.value })}
                      className="w-full px-4 py-2.5 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone placeholder:text-bone/40 focus:outline-none focus:border-gold/30"
                      placeholder="usuario"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-bone/70 mb-1">YouTube</label>
                    <input
                      type="text"
                      value={editForm.youtube}
                      onChange={(e) => setEditForm({ ...editForm, youtube: e.target.value })}
                      className="w-full px-4 py-2.5 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone placeholder:text-bone/40 focus:outline-none focus:border-gold/30"
                      placeholder="canal"
                    />
                  </div>
                </div>

                {/* Status Controls */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-bone/70 mb-1">Estado Creador</label>
                    <select
                      value={editForm.creator_status}
                      onChange={(e) => setEditForm({ ...editForm, creator_status: e.target.value as CreatorStatus })}
                      className="w-full px-4 py-2.5 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone focus:outline-none focus:border-gold/30"
                    >
                      {Object.entries(CREATOR_STATUS_LABELS).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-bone/70 mb-1">Propietario de Tienda</label>
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, is_store_owner: !editForm.is_store_owner })}
                      className={cn(
                        'w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        editForm.is_store_owner
                          ? 'bg-gold/10 border border-gold/20 text-gold'
                          : 'bg-bone/5 border border-bone/10 text-bone/70'
                      )}
                    >
                      {editForm.is_store_owner ? 'Sí - Es propietario' : 'No'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-bone/10">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone/70 hover:bg-bone/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={actionLoading === editingUser.id}
                  className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-400 hover:bg-blue-500/20 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {actionLoading === editingUser.id ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
