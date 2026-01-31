'use client'

import * as React from 'react'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Ban,
  UserCog,
  ExternalLink,
  Mail,
  Calendar,
} from 'lucide-react'
import { DataTable, StatusBadge, FilterTabs, type Column, type Action } from '../components/ui/data-table'
import { Modal, ConfirmDialog, FormField, Select } from '../components/ui/modal'
import { Button } from '../components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { createClient } from '@/lib/supabase/client'

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

interface UserProfile {
  [key: string]: unknown
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  role: 'user' | 'moderator' | 'admin'
  is_banned: boolean | null
  creator_status: 'none' | 'pending' | 'approved' | 'rejected' | null
  created_at: string
  email?: string
  _count?: {
    miniatures: number
    followers: number
  }
}

type UserFilter = 'all' | 'admin' | 'moderator' | 'user' | 'banned'

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  moderator: 'Moderador',
  user: 'Usuario',
}

const roleColors: Record<string, string> = {
  admin: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  moderator: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  user: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
}

const roleIcons: Record<string, React.ReactNode> = {
  admin: <ShieldCheck className="w-3.5 h-3.5" />,
  moderator: <Shield className="w-3.5 h-3.5" />,
  user: <Users className="w-3.5 h-3.5" />,
}

// ══════════════════════════════════════════════════════════════
// USUARIOS PAGE
// ══════════════════════════════════════════════════════════════

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<UserFilter>('all')
  const [counts, setCounts] = useState({
    all: 0,
    admin: 0,
    moderator: 0,
    user: 0,
    banned: 0,
  })

  // Modal states
  const [viewUser, setViewUser] = useState<UserProfile | null>(null)
  const [editRole, setEditRole] = useState<UserProfile | null>(null)
  const [newRole, setNewRole] = useState<'user' | 'moderator' | 'admin'>('user')
  const [confirmBan, setConfirmBan] = useState<UserProfile | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter === 'banned') {
        query = query.eq('is_banned', true)
      } else if (filter !== 'all') {
        query = query.eq('role', filter).eq('is_banned', false)
      }

      const { data, error } = await query

      if (error) throw error
      setUsers(data || [])

      // Get counts
      const [
        { count: allCount },
        { count: adminCount },
        { count: modCount },
        { count: userCount },
        { count: bannedCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'moderator'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_banned', true),
      ])

      setCounts({
        all: allCount || 0,
        admin: adminCount || 0,
        moderator: modCount || 0,
        user: userCount || 0,
        banned: bannedCount || 0,
      })
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Handle role change
  const handleRoleChange = async () => {
    if (!editRole) return

    setActionLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', editRole.id)

      if (error) throw error

      setEditRole(null)
      fetchUsers()
    } catch (error) {
      console.error('Error changing role:', error)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle ban/unban
  const handleBan = async () => {
    if (!confirmBan) return

    setActionLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: !confirmBan.is_banned })
        .eq('id', confirmBan.id)

      if (error) throw error

      setConfirmBan(null)
      fetchUsers()
    } catch (error) {
      console.error('Error banning/unbanning user:', error)
    } finally {
      setActionLoading(false)
    }
  }

  // Table columns
  const columns: Column<UserProfile>[] = [
    {
      key: 'username',
      header: 'Usuario',
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback>
              {(user.display_name || user.username)?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-white">
                {user.display_name || user.username}
              </p>
              {user.is_banned && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-500/10 text-red-500 rounded">
                  BANEADO
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500">@{user.username}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Rol',
      sortable: true,
      width: '140px',
      render: (user) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border ${
            roleColors[user.role]
          }`}
        >
          {roleIcons[user.role]}
          {roleLabels[user.role]}
        </span>
      ),
    },
    {
      key: 'creator_status',
      header: 'Creador',
      width: '100px',
      render: (user) =>
        user.creator_status === 'approved' ? (
          <span className="text-xs text-purple-400">✓ Creador</span>
        ) : user.creator_status === 'pending' ? (
          <span className="text-xs text-amber-500">Pendiente</span>
        ) : (
          <span className="text-xs text-zinc-600">-</span>
        ),
    },
    {
      key: 'created_at',
      header: 'Registro',
      sortable: true,
      width: '120px',
      render: (user) => (
        <span className="text-zinc-500">
          {new Date(user.created_at).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
  ]

  // Table actions
  const actions: Action<UserProfile>[] = [
    {
      label: 'Ver perfil',
      icon: <Eye className="w-4 h-4" />,
      onClick: (user) => setViewUser(user),
    },
    {
      label: 'Cambiar rol',
      icon: <UserCog className="w-4 h-4" />,
      onClick: (user) => {
        setEditRole(user)
        setNewRole(user.role)
      },
    },
    {
      label: user => user.is_banned ? 'Desbanear' : 'Banear',
      icon: <Ban className="w-4 h-4" />,
      onClick: (user) => setConfirmBan(user),
      variant: 'danger',
    },
  ]

  // Filter tabs
  const filterTabs = [
    { key: 'all', label: 'Todos', count: counts.all },
    { key: 'admin', label: 'Admins', count: counts.admin },
    { key: 'moderator', label: 'Mods', count: counts.moderator },
    { key: 'user', label: 'Usuarios', count: counts.user },
    { key: 'banned', label: 'Baneados', count: counts.banned },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Usuarios</h1>
          <p className="text-sm text-zinc-400">Gestiona los usuarios de la plataforma</p>
        </div>
      </div>

      {/* Filters */}
      <FilterTabs
        tabs={filterTabs}
        activeTab={filter}
        onChange={(key) => setFilter(key as UserFilter)}
      />

      {/* Table */}
      <DataTable
        data={users}
        columns={columns}
        actions={actions}
        keyField="id"
        searchPlaceholder="Buscar por nombre, username..."
        searchFields={['username', 'display_name']}
        loading={loading}
        emptyMessage="No hay usuarios"
        emptyIcon={<Users className="w-8 h-8 text-zinc-600 mx-auto" />}
        pageSize={15}
      />

      {/* View Modal */}
      <Modal
        open={!!viewUser}
        onClose={() => setViewUser(null)}
        title="Detalles del Usuario"
        size="md"
        footer={
          <Button variant="ghost" onClick={() => setViewUser(null)}>
            Cerrar
          </Button>
        }
      >
        {viewUser && (
          <div className="space-y-4">
            {/* Profile header */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={viewUser.avatar_url || undefined} />
                <AvatarFallback className="text-lg">
                  {(viewUser.display_name || viewUser.username)
                    ?.slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium text-white">
                  {viewUser.display_name || viewUser.username}
                </h3>
                <p className="text-sm text-zinc-500">@{viewUser.username}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border ${
                      roleColors[viewUser.role]
                    }`}
                  >
                    {roleIcons[viewUser.role]}
                    {roleLabels[viewUser.role]}
                  </span>
                  {viewUser.is_banned && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-red-500/10 text-red-500 rounded-full border border-red-500/20">
                      Baneado
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {viewUser.bio && (
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
                  Bio
                </p>
                <p className="text-sm text-zinc-300">{viewUser.bio}</p>
              </div>
            )}

            {/* Info */}
            <div className="grid gap-2 pt-2">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-400">Registrado el</span>
                <span className="text-zinc-300">
                  {new Date(viewUser.created_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              {viewUser.creator_status === 'approved' && (
                <div className="flex items-center gap-3 text-sm">
                  <ShieldCheck className="w-4 h-4 text-purple-500" />
                  <span className="text-purple-400">Creador verificado</span>
                </div>
              )}
            </div>

            {/* Link to public profile */}
            <div className="pt-2 border-t border-zinc-800">
              <Link
                href={`/usuarios/${viewUser.username}`}
                target="_blank"
                className="flex items-center gap-2 text-sm text-amber-500 hover:text-amber-400"
              >
                <Eye className="w-4 h-4" />
                Ver perfil público
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        open={!!editRole}
        onClose={() => setEditRole(null)}
        title="Cambiar rol"
        description={`Cambiar rol de ${editRole?.display_name || editRole?.username}`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditRole(null)}>
              Cancelar
            </Button>
            <Button onClick={handleRoleChange} disabled={actionLoading}>
              {actionLoading ? 'Guardando...' : 'Guardar'}
            </Button>
          </>
        }
      >
        <FormField label="Rol">
          <Select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as 'user' | 'moderator' | 'admin')}
            options={[
              { value: 'user', label: 'Usuario' },
              { value: 'moderator', label: 'Moderador' },
              { value: 'admin', label: 'Administrador' },
            ]}
          />
        </FormField>
      </Modal>

      {/* Confirm Ban Dialog */}
      <ConfirmDialog
        open={!!confirmBan}
        onClose={() => setConfirmBan(null)}
        onConfirm={handleBan}
        title={confirmBan?.is_banned ? 'Desbanear usuario' : 'Banear usuario'}
        description={
          confirmBan?.is_banned
            ? `¿Desbanear a "${
                confirmBan?.display_name || confirmBan?.username
              }"? Podrá volver a acceder a la plataforma.`
            : `¿Banear a "${
                confirmBan?.display_name || confirmBan?.username
              }"? No podrá acceder a la plataforma.`
        }
        confirmLabel={confirmBan?.is_banned ? 'Desbanear' : 'Banear'}
        variant={confirmBan?.is_banned ? 'default' : 'danger'}
        loading={actionLoading}
      />
    </div>
  )
}
