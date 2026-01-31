'use client'

import * as React from 'react'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Palette,
  Youtube,
  Instagram,
  Twitter,
  Globe,
  CheckCircle,
  XCircle,
  Eye,
  ExternalLink,
  Users,
} from 'lucide-react'
import { DataTable, StatusBadge, FilterTabs, type Column, type Action } from '../components/ui/data-table'
import { Modal, ConfirmDialog } from '../components/ui/modal'
import { Button } from '../components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { createClient } from '@/lib/supabase/client'

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

interface CreatorProfile {
  [key: string]: unknown
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  creator_status: 'none' | 'pending' | 'approved' | 'rejected' | null
  creator_type: 'painter' | 'streamer' | 'youtuber' | 'blogger' | 'podcaster' | 'artist' | 'instructor' | null
  creator_bio: string | null
  youtube: string | null
  instagram: string | null
  twitter: string | null
  website: string | null
  created_at: string
  _count?: {
    miniatures: number
    followers: number
  }
}

type CreatorStatus = 'all' | 'pending' | 'approved' | 'rejected'

const creatorTypeLabels: Record<string, string> = {
  painter: 'Pintor',
  streamer: 'Streamer',
  youtuber: 'YouTuber',
  blogger: 'Blogger',
  podcaster: 'Podcaster',
}

const creatorTypeColors: Record<string, string> = {
  painter: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  streamer: 'bg-red-500/10 text-red-400 border-red-500/20',
  youtuber: 'bg-red-500/10 text-red-400 border-red-500/20',
  blogger: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  podcaster: 'bg-green-500/10 text-green-400 border-green-500/20',
}

// ══════════════════════════════════════════════════════════════
// CREADORES PAGE
// ══════════════════════════════════════════════════════════════

export default function CreadoresPage() {
  const searchParams = useSearchParams()
  const initialStatus = (searchParams.get('status') as CreatorStatus) || 'all'

  const [creators, setCreators] = useState<CreatorProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<CreatorStatus>(initialStatus)
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 })

  // Modal states
  const [viewCreator, setViewCreator] = useState<CreatorProfile | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    creator: CreatorProfile
    action: 'approve' | 'reject'
  } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Fetch creators
  const fetchCreators = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('creator_status', 'none')
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('creator_status', statusFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setCreators(data || [])

      // Get counts
      const [
        { count: allCount },
        { count: pendingCount },
        { count: approvedCount },
        { count: rejectedCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('creator_status', 'none'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('creator_status', 'pending'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('creator_status', 'approved'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('creator_status', 'rejected'),
      ])

      setCounts({
        all: allCount || 0,
        pending: pendingCount || 0,
        approved: approvedCount || 0,
        rejected: rejectedCount || 0,
      })
    } catch (error) {
      console.error('Error fetching creators:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchCreators()
  }, [fetchCreators])

  // Handle actions
  const handleAction = async () => {
    if (!confirmAction) return

    setActionLoading(true)
    const supabase = createClient()

    try {
      const newStatus = confirmAction.action === 'approve' ? 'approved' : 'rejected'
      const { error } = await supabase
        .from('profiles')
        .update({ creator_status: newStatus })
        .eq('id', confirmAction.creator.id)

      if (error) throw error

      setConfirmAction(null)
      fetchCreators()
    } catch (error) {
      console.error('Error performing action:', error)
    } finally {
      setActionLoading(false)
    }
  }

  // Table columns
  const columns: Column<CreatorProfile>[] = [
    {
      key: 'username',
      header: 'Creador',
      sortable: true,
      render: (creator) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={creator.avatar_url || undefined} />
            <AvatarFallback>
              {(creator.display_name || creator.username)?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-white">
              {creator.display_name || creator.username}
            </p>
            <p className="text-xs text-zinc-500">@{creator.username}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'creator_type',
      header: 'Tipo',
      sortable: true,
      width: '130px',
      render: (creator) =>
        creator.creator_type ? (
          <span
            className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${
              creatorTypeColors[creator.creator_type] || 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {creatorTypeLabels[creator.creator_type] || creator.creator_type}
          </span>
        ) : (
          <span className="text-zinc-500">-</span>
        ),
    },
    {
      key: 'creator_status',
      header: 'Estado',
      sortable: true,
      width: '120px',
      render: (creator) => (
        <StatusBadge
          status={creator.creator_status as 'pending' | 'approved' | 'rejected'}
        />
      ),
    },
    {
      key: 'social',
      header: 'Redes',
      width: '100px',
      render: (creator) => (
        <div className="flex items-center gap-1.5">
          {creator.youtube && (
            <a
              href={creator.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-zinc-500 hover:text-red-500 transition-colors"
            >
              <Youtube className="w-4 h-4" />
            </a>
          )}
          {creator.instagram && (
            <a
              href={creator.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-zinc-500 hover:text-pink-500 transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
          )}
          {creator.twitter && (
            <a
              href={creator.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-zinc-500 hover:text-blue-400 transition-colors"
            >
              <Twitter className="w-4 h-4" />
            </a>
          )}
          {!creator.youtube &&
            !creator.instagram &&
            !creator.twitter && (
              <span className="text-zinc-600 text-xs">-</span>
            )}
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Solicitud',
      sortable: true,
      width: '120px',
      render: (creator) => (
        <span className="text-zinc-500">
          {new Date(creator.created_at).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
          })}
        </span>
      ),
    },
  ]

  // Table actions
  const actions: Action<CreatorProfile>[] = [
    {
      label: 'Ver perfil',
      icon: <Eye className="w-4 h-4" />,
      onClick: (creator) => setViewCreator(creator),
    },
    {
      label: 'Aprobar',
      icon: <CheckCircle className="w-4 h-4" />,
      onClick: (creator) => setConfirmAction({ creator, action: 'approve' }),
      show: (creator) => creator.creator_status !== 'approved',
    },
    {
      label: 'Rechazar',
      icon: <XCircle className="w-4 h-4" />,
      onClick: (creator) => setConfirmAction({ creator, action: 'reject' }),
      show: (creator) => creator.creator_status !== 'rejected',
    },
  ]

  // Filter tabs
  const filterTabs = [
    { key: 'all', label: 'Todos', count: counts.all },
    { key: 'pending', label: 'Pendientes', count: counts.pending },
    { key: 'approved', label: 'Aprobados', count: counts.approved },
    { key: 'rejected', label: 'Rechazados', count: counts.rejected },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Creadores</h1>
          <p className="text-sm text-zinc-400">Gestiona las solicitudes de creador</p>
        </div>
      </div>

      {/* Filters */}
      <FilterTabs
        tabs={filterTabs}
        activeTab={statusFilter}
        onChange={(key) => setStatusFilter(key as CreatorStatus)}
      />

      {/* Table */}
      <DataTable
        data={creators}
        columns={columns}
        actions={actions}
        keyField="id"
        searchPlaceholder="Buscar por nombre, username..."
        searchFields={['username', 'display_name']}
        loading={loading}
        emptyMessage="No hay solicitudes de creador"
        emptyIcon={<Palette className="w-8 h-8 text-zinc-600 mx-auto" />}
        pageSize={10}
      />

      {/* View Modal */}
      <Modal
        open={!!viewCreator}
        onClose={() => setViewCreator(null)}
        title="Solicitud de Creador"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setViewCreator(null)}>
              Cerrar
            </Button>
            {viewCreator?.creator_status === 'pending' && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setViewCreator(null)
                    setConfirmAction({ creator: viewCreator, action: 'reject' })
                  }}
                >
                  Rechazar
                </Button>
                <Button
                  onClick={() => {
                    setViewCreator(null)
                    setConfirmAction({ creator: viewCreator, action: 'approve' })
                  }}
                >
                  Aprobar
                </Button>
              </>
            )}
          </>
        }
      >
        {viewCreator && (
          <div className="space-y-5">
            {/* Profile header */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={viewCreator.avatar_url || undefined} />
                <AvatarFallback className="text-lg">
                  {(viewCreator.display_name || viewCreator.username)
                    ?.slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium text-white">
                  {viewCreator.display_name || viewCreator.username}
                </h3>
                <p className="text-sm text-zinc-500">@{viewCreator.username}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge
                    status={viewCreator.creator_status as 'pending' | 'approved' | 'rejected'}
                  />
                  {viewCreator.creator_type && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${
                        creatorTypeColors[viewCreator.creator_type]
                      }`}
                    >
                      {creatorTypeLabels[viewCreator.creator_type]}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {viewCreator.creator_bio && (
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
                  Descripción como creador
                </p>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                  {viewCreator.creator_bio}
                </p>
              </div>
            )}

            {viewCreator.bio && (
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
                  Bio del perfil
                </p>
                <p className="text-sm text-zinc-400">{viewCreator.bio}</p>
              </div>
            )}

            {/* Social links */}
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                Redes sociales
              </p>
              <div className="grid gap-2">
                {viewCreator.youtube && (
                  <a
                    href={viewCreator.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 bg-zinc-800/50 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                  >
                    <Youtube className="w-4 h-4 text-red-500" />
                    <span className="flex-1 truncate">{viewCreator.youtube}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                  </a>
                )}
                {viewCreator.instagram && (
                  <a
                    href={viewCreator.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 bg-zinc-800/50 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                  >
                    <Instagram className="w-4 h-4 text-pink-500" />
                    <span className="flex-1 truncate">{viewCreator.instagram}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                  </a>
                )}
                {viewCreator.twitter && (
                  <a
                    href={viewCreator.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 bg-zinc-800/50 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                  >
                    <Twitter className="w-4 h-4 text-blue-400" />
                    <span className="flex-1 truncate">{viewCreator.twitter}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                  </a>
                )}
                {viewCreator.website && (
                  <a
                    href={viewCreator.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 bg-zinc-800/50 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                  >
                    <Globe className="w-4 h-4 text-zinc-400" />
                    <span className="flex-1 truncate">{viewCreator.website}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                  </a>
                )}
                {!viewCreator.youtube &&
                  !viewCreator.instagram &&
                  !viewCreator.twitter &&
                  !viewCreator.website && (
                    <p className="text-sm text-zinc-500">Sin redes sociales</p>
                  )}
              </div>
            </div>

            {/* Link to public profile */}
            <div className="pt-2 border-t border-zinc-800">
              <Link
                href={`/usuarios/${viewCreator.username}`}
                target="_blank"
                className="flex items-center gap-2 text-sm text-amber-500 hover:text-amber-400"
              >
                <Users className="w-4 h-4" />
                Ver perfil público
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleAction}
        title={
          confirmAction?.action === 'approve'
            ? 'Aprobar creador'
            : 'Rechazar creador'
        }
        description={
          confirmAction?.action === 'approve'
            ? `¿Aprobar a "${
                confirmAction?.creator.display_name || confirmAction?.creator.username
              }" como creador? Tendrá acceso a funciones exclusivas.`
            : `¿Rechazar la solicitud de "${
                confirmAction?.creator.display_name || confirmAction?.creator.username
              }"? Se le notificará del rechazo.`
        }
        confirmLabel={confirmAction?.action === 'approve' ? 'Aprobar' : 'Rechazar'}
        loading={actionLoading}
      />
    </div>
  )
}
