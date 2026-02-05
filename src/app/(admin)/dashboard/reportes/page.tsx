'use client'

import * as React from 'react'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Flag,
  Image,
  ShoppingBag,
  MessageSquare,
  User,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react'
import { DataTable, StatusBadge, FilterTabs, type Column, type Action } from '../components/ui/data-table'
import { Modal, ConfirmDialog, FormField, Textarea, Select } from '../components/ui/modal'
import { Button } from '../components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { createClient } from '@/lib/supabase/client'

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

interface ReportItem {
  [key: string]: unknown
  id: string
  content_type: 'miniature' | 'listing' | 'comment' | 'message' | 'profile'
  content_id: string
  reason: string
  description: string | null
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  created_at: string
  resolved_at: string | null
  reporter_id: string
  reported_user_id: string | null
  resolved_by: string | null
  reporter: {
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
  reported_user: {
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
  resolver: {
    username: string
    display_name: string | null
  } | null
}

type ReportStatus = 'all' | 'pending' | 'reviewed' | 'resolved' | 'dismissed'

const contentTypeLabels: Record<string, string> = {
  miniature: 'Miniatura',
  listing: 'Anuncio',
  comment: 'Comentario',
  message: 'Mensaje',
  profile: 'Perfil',
}

const contentTypeIcons: Record<string, React.ReactNode> = {
  miniature: <Image className="w-3.5 h-3.5" />,
  listing: <ShoppingBag className="w-3.5 h-3.5" />,
  comment: <MessageSquare className="w-3.5 h-3.5" />,
  message: <MessageSquare className="w-3.5 h-3.5" />,
  profile: <User className="w-3.5 h-3.5" />,
}

const contentTypeColors: Record<string, string> = {
  miniature: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  listing: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  comment: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  message: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  profile: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  reviewed: 'En revisión',
  resolved: 'Resuelto',
  dismissed: 'Descartado',
}

const reasonLabels: Record<string, string> = {
  spam: 'Spam',
  inappropriate: 'Contenido inapropiado',
  harassment: 'Acoso',
  scam: 'Estafa/Fraude',
  copyright: 'Derechos de autor',
  other: 'Otro',
}

// ══════════════════════════════════════════════════════════════
// REPORTES PAGE
// ══════════════════════════════════════════════════════════════

export default function ReportesPage() {
  const searchParams = useSearchParams()
  const initialStatus = (searchParams.get('status') as ReportStatus) || 'pending'

  const [reports, setReports] = useState<ReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<ReportStatus>(initialStatus)
  const [counts, setCounts] = useState({
    all: 0,
    pending: 0,
    reviewed: 0,
    resolved: 0,
    dismissed: 0,
  })

  // Modal states
  const [viewReport, setViewReport] = useState<ReportItem | null>(null)
  const [updateReport, setUpdateReport] = useState<ReportItem | null>(null)
  const [newStatus, setNewStatus] = useState<'reviewed' | 'resolved' | 'dismissed'>('reviewed')
  const [resolution, setResolution] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Fetch reports
  const fetchReports = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      let query = supabase
        .from('reports')
        .select(`
          *,
          reporter:profiles!reports_reporter_id_fkey(username, display_name, avatar_url),
          reported_user:profiles!reports_reported_user_id_fkey(username, display_name, avatar_url),
          resolver:profiles!reports_resolved_by_fkey(username, display_name)
        `)
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setReports(data || [])

      // Get counts
      const [
        { count: allCount },
        { count: pendingCount },
        { count: reviewedCount },
        { count: resolvedCount },
        { count: dismissedCount },
      ] = await Promise.all([
        supabase.from('reports').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'reviewed'),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'dismissed'),
      ])

      setCounts({
        all: allCount || 0,
        pending: pendingCount || 0,
        reviewed: reviewedCount || 0,
        resolved: resolvedCount || 0,
        dismissed: dismissedCount || 0,
      })
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  // Handle status update
  const handleUpdateStatus = async () => {
    if (!updateReport) return

    setActionLoading(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const updateData: Record<string, unknown> = {
        status: newStatus,
      }

      if (newStatus === 'resolved' || newStatus === 'dismissed') {
        updateData.resolved_at = new Date().toISOString()
        updateData.resolved_by = user?.id
      }

      const { error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', updateReport.id)

      if (error) throw error

      setUpdateReport(null)
      setResolution('')
      fetchReports()
    } catch (error) {
      console.error('Error updating report:', error)
    } finally {
      setActionLoading(false)
    }
  }

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Get content link
  const getContentLink = (report: ReportItem): string | null => {
    switch (report.content_type) {
      case 'miniature':
        return `/galeria/${report.content_id}`
      case 'listing':
        return `/mercado/${report.content_id}`
      case 'profile':
        return `/usuarios/${report.reported_user?.username || report.content_id}`
      default:
        return null
    }
  }

  // Table columns
  const columns: Column<ReportItem>[] = [
    {
      key: 'content_type',
      header: 'Tipo',
      sortable: true,
      width: '130px',
      render: (report) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border ${
            contentTypeColors[report.content_type] || 'bg-zinc-800 text-zinc-400'
          }`}
        >
          {contentTypeIcons[report.content_type]}
          {contentTypeLabels[report.content_type] || report.content_type}
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Motivo',
      sortable: true,
      render: (report) => (
        <div>
          <p className="font-medium text-white">
            {reasonLabels[report.reason] || report.reason}
          </p>
          {report.description && (
            <p className="text-xs text-zinc-500 line-clamp-1">{report.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'reporter',
      header: 'Reportado por',
      render: (report) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={report.reporter?.avatar_url || undefined} />
            <AvatarFallback className="text-xs">
              {(report.reporter?.display_name || report.reporter?.username)?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-zinc-300">
            {report.reporter?.display_name || report.reporter?.username || 'Anónimo'}
          </span>
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Fecha',
      sortable: true,
      width: '120px',
      render: (report) => (
        <span className="text-zinc-500">{formatDate(report.created_at)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      width: '120px',
      render: (report) => (
        <StatusBadge
          status={report.status === 'reviewed' ? 'pending' : report.status === 'resolved' ? 'approved' : report.status === 'dismissed' ? 'inactive' : 'pending'}
          labels={statusLabels}
        />
      ),
    },
  ]

  // Table actions
  const actions: Action<ReportItem>[] = [
    {
      label: 'Ver detalles',
      icon: <Eye className="w-4 h-4" />,
      onClick: (report) => setViewReport(report),
    },
    {
      label: 'Marcar en revisión',
      icon: <Clock className="w-4 h-4" />,
      onClick: (report) => {
        setUpdateReport(report)
        setNewStatus('reviewed')
      },
      show: (report) => report.status === 'pending',
    },
    {
      label: 'Resolver',
      icon: <CheckCircle className="w-4 h-4" />,
      onClick: (report) => {
        setUpdateReport(report)
        setNewStatus('resolved')
      },
      show: (report) => report.status !== 'resolved' && report.status !== 'dismissed',
    },
    {
      label: 'Descartar',
      icon: <XCircle className="w-4 h-4" />,
      onClick: (report) => {
        setUpdateReport(report)
        setNewStatus('dismissed')
      },
      show: (report) => report.status !== 'resolved' && report.status !== 'dismissed',
    },
  ]

  // Filter tabs
  const filterTabs = [
    { key: 'all', label: 'Todos', count: counts.all },
    { key: 'pending', label: 'Pendientes', count: counts.pending },
    { key: 'reviewed', label: 'En revisión', count: counts.reviewed },
    { key: 'resolved', label: 'Resueltos', count: counts.resolved },
    { key: 'dismissed', label: 'Descartados', count: counts.dismissed },
  ]

  const pendingCount = counts.pending

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Reportes</h1>
          <p className="text-sm text-zinc-400">Gestiona los reportes de la comunidad</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-500">{pendingCount} pendientes</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <FilterTabs
        tabs={filterTabs}
        activeTab={statusFilter}
        onChange={(key) => setStatusFilter(key as ReportStatus)}
      />

      {/* Table */}
      <DataTable
        data={reports}
        columns={columns}
        actions={actions}
        keyField="id"
        searchPlaceholder="Buscar por motivo, descripción..."
        searchFields={['reason', 'description']}
        loading={loading}
        emptyMessage="No hay reportes"
        emptyIcon={<Flag className="w-8 h-8 text-zinc-600 mx-auto" />}
        pageSize={10}
      />

      {/* View Modal */}
      <Modal
        open={!!viewReport}
        onClose={() => setViewReport(null)}
        title="Detalles del reporte"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setViewReport(null)}>
              Cerrar
            </Button>
            {viewReport && viewReport.status === 'pending' && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setViewReport(null)
                    setUpdateReport(viewReport)
                    setNewStatus('dismissed')
                  }}
                >
                  Descartar
                </Button>
                <Button
                  onClick={() => {
                    setViewReport(null)
                    setUpdateReport(viewReport)
                    setNewStatus('resolved')
                  }}
                >
                  Resolver
                </Button>
              </>
            )}
          </>
        }
      >
        {viewReport && (
          <div className="space-y-5">
            {/* Status and type */}
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge
                status={viewReport.status === 'reviewed' ? 'pending' : viewReport.status === 'resolved' ? 'approved' : viewReport.status === 'dismissed' ? 'inactive' : 'pending'}
                labels={statusLabels}
              />
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border ${
                  contentTypeColors[viewReport.content_type]
                }`}
              >
                {contentTypeIcons[viewReport.content_type]}
                {contentTypeLabels[viewReport.content_type]}
              </span>
              <span className="text-xs text-zinc-500">
                {formatDateTime(viewReport.created_at)}
              </span>
            </div>

            {/* Reason */}
            <div>
              <p className="text-xs font-medium text-[#E8E8F0]/40 uppercase tracking-wider mb-1.5">
                Motivo del reporte
              </p>
              <p className="text-sm text-white font-medium mb-2">
                {reasonLabels[viewReport.reason] || viewReport.reason}
              </p>
              {viewReport.description && (
                <div className="max-h-32 overflow-y-auto rounded-lg bg-[#0a0a12]/80 border border-[#C9A227]/10 p-3">
                  <p className="text-sm text-[#E8E8F0]/60 whitespace-pre-wrap break-words">{viewReport.description}</p>
                </div>
              )}
            </div>

            {/* Reporter */}
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                Reportado por
              </p>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={viewReport.reporter?.avatar_url || undefined} />
                  <AvatarFallback>
                    {(viewReport.reporter?.display_name || viewReport.reporter?.username)?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-white">
                    {viewReport.reporter?.display_name || viewReport.reporter?.username}
                  </p>
                  <p className="text-xs text-zinc-500">@{viewReport.reporter?.username}</p>
                </div>
              </div>
            </div>

            {/* Reported user (if applicable) */}
            {viewReport.reported_user && (
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                  Usuario reportado
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={viewReport.reported_user?.avatar_url || undefined} />
                    <AvatarFallback>
                      {(viewReport.reported_user?.display_name || viewReport.reported_user?.username)?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-white">
                      {viewReport.reported_user?.display_name || viewReport.reported_user?.username}
                    </p>
                    <p className="text-xs text-zinc-500">@{viewReport.reported_user?.username}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Link to content */}
            {getContentLink(viewReport) && (
              <div className="pt-2 border-t border-zinc-800">
                <a
                  href={getContentLink(viewReport)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-amber-500 hover:text-amber-400"
                >
                  {contentTypeIcons[viewReport.content_type]}
                  Ver contenido reportado
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Resolution info (if resolved) */}
            {(viewReport.status === 'resolved' || viewReport.status === 'dismissed') && viewReport.resolved_at && (
              <div className="pt-2 border-t border-zinc-800">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
                  {viewReport.status === 'resolved' ? 'Resuelto' : 'Descartado'}
                </p>
                <p className="text-sm text-zinc-400">
                  {formatDateTime(viewReport.resolved_at)}
                  {viewReport.resolver && (
                    <> por {viewReport.resolver.display_name || viewReport.resolver.username}</>
                  )}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        open={!!updateReport}
        onClose={() => {
          setUpdateReport(null)
          setResolution('')
        }}
        title={
          newStatus === 'reviewed'
            ? 'Marcar en revisión'
            : newStatus === 'resolved'
            ? 'Resolver reporte'
            : 'Descartar reporte'
        }
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setUpdateReport(null)
                setResolution('')
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={actionLoading}
              className={newStatus === 'dismissed' ? 'bg-zinc-600 hover:bg-zinc-500' : ''}
            >
              {actionLoading ? 'Procesando...' : newStatus === 'reviewed' ? 'Marcar en revisión' : newStatus === 'resolved' ? 'Resolver' : 'Descartar'}
            </Button>
          </>
        }
      >
        {updateReport && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300">
              {newStatus === 'reviewed'
                ? `¿Marcar el reporte sobre "${contentTypeLabels[updateReport.content_type]}" como en revisión?`
                : newStatus === 'resolved'
                ? `¿Marcar el reporte sobre "${contentTypeLabels[updateReport.content_type]}" como resuelto?`
                : `¿Descartar el reporte sobre "${contentTypeLabels[updateReport.content_type]}"? Esto indica que no se tomará ninguna acción.`}
            </p>

            {(newStatus === 'resolved' || newStatus === 'dismissed') && (
              <FormField label="Notas (opcional)">
                <Textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Añade notas sobre la resolución..."
                  rows={3}
                />
              </FormField>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
