'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flag,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Eye,
  Image as ImageIcon,
  ShoppingBag,
  MessageSquare,
  User,
  Ban,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui'
import type { Profile } from '@/lib/types/database.types'

type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed'
type ContentType = 'miniature' | 'listing' | 'comment' | 'message' | 'profile'

interface Report {
  id: string
  reporter_id: string
  reported_user_id: string | null
  content_type: ContentType
  content_id: string
  reason: string
  description: string | null
  status: ReportStatus
  created_at: string
  resolved_at: string | null
  resolved_by: string | null
}

type ReportWithUsers = Report & {
  reporter: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'> | null
  reported_user: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'> | null
}

const STATUS_LABELS: Record<ReportStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pendiente', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: Clock },
  reviewed: { label: 'En revisión', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: Eye },
  resolved: { label: 'Resuelto', color: 'text-green-500 bg-green-500/10 border-green-500/20', icon: CheckCircle },
  dismissed: { label: 'Desestimado', color: 'text-bone/50 bg-bone/5 border-bone/10', icon: XCircle },
}

const CONTENT_TYPE_LABELS: Record<ContentType, { label: string; icon: typeof ImageIcon; color: string }> = {
  miniature: { label: 'Miniatura', icon: ImageIcon, color: 'text-teal-400' },
  listing: { label: 'Anuncio', icon: ShoppingBag, color: 'text-gold' },
  comment: { label: 'Comentario', icon: MessageSquare, color: 'text-blue-400' },
  message: { label: 'Mensaje', icon: MessageSquare, color: 'text-purple-400' },
  profile: { label: 'Perfil', icon: User, color: 'text-pink-400' },
}

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam',
  inappropriate: 'Contenido inapropiado',
  harassment: 'Acoso',
  scam: 'Estafa',
  copyright: 'Infracción de derechos',
  other: 'Otro',
}

export default function ReportsManagementPage() {
  const [reports, setReports] = useState<ReportWithUsers[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('pending')
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedReport, setExpandedReport] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const supabase = createClient()

  const fetchReports = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('reports')
      .select(`
        *,
        reporter:profiles!reports_reporter_id_fkey(
          id,
          username,
          display_name,
          avatar_url
        ),
        reported_user:profiles!reports_reported_user_id_fkey(
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    if (contentTypeFilter !== 'all') {
      query = query.eq('content_type', contentTypeFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching reports:', error)
    } else {
      let filteredData = data as ReportWithUsers[]
      if (searchQuery) {
        const search = searchQuery.toLowerCase()
        filteredData = filteredData.filter(report =>
          report.reporter?.username?.toLowerCase().includes(search) ||
          report.reported_user?.username?.toLowerCase().includes(search) ||
          report.reason.toLowerCase().includes(search)
        )
      }
      setReports(filteredData)
    }
    setLoading(false)
  }, [supabase, statusFilter, contentTypeFilter, searchQuery])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const handleResolve = async (reportId: string) => {
    setActionLoading(reportId)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('reports')
      .update({
        status: 'resolved',
        resolved_by: user?.id,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', reportId)

    if (error) {
      console.error('Error resolving report:', error)
      alert('Error al resolver el reporte')
    } else {
      fetchReports()
    }
    setActionLoading(null)
  }

  const handleDismiss = async (reportId: string) => {
    setActionLoading(reportId)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('reports')
      .update({
        status: 'dismissed',
        resolved_by: user?.id,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', reportId)

    if (error) {
      console.error('Error dismissing report:', error)
      alert('Error al desestimar el reporte')
    } else {
      fetchReports()
    }
    setActionLoading(null)
  }

  const handleMarkReviewing = async (reportId: string) => {
    setActionLoading(reportId)

    const { error } = await supabase
      .from('reports')
      .update({
        status: 'reviewed',
      })
      .eq('id', reportId)

    if (error) {
      console.error('Error marking report as reviewing:', error)
    } else {
      fetchReports()
    }
    setActionLoading(null)
  }

  const getContentLink = (contentType: ContentType, contentId: string): string => {
    switch (contentType) {
      case 'miniature':
        return `/galeria/${contentId}`
      case 'listing':
        return `/mercado/${contentId}`
      case 'profile':
        return `/usuarios/${contentId}`
      default:
        return '#'
    }
  }

  const toggleExpanded = (reportId: string) => {
    setExpandedReport(expandedReport === reportId ? null : reportId)
  }

  const pendingCount = reports.filter(r => r.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bone flex items-center gap-3">
            <Flag className="w-7 h-7 text-red-400" />
            Gestión de Reportes
          </h1>
          <p className="text-bone/50 mt-1">
            Revisa y gestiona los reportes de contenido de la comunidad
          </p>
        </div>
        {statusFilter === 'pending' && pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-500">
              {pendingCount} {pendingCount === 1 ? 'reporte pendiente' : 'reportes pendientes'}
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bone/40" />
            <input
              type="text"
              placeholder="Buscar por usuario o razón..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone placeholder:text-bone/40 focus:outline-none focus:border-gold/30"
            />
          </div>

          {/* Refresh */}
          <button
            onClick={fetchReports}
            disabled={loading}
            className="p-2.5 bg-bone/5 border border-bone/10 rounded-lg text-bone/70 hover:text-bone hover:bg-bone/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-4">
          {/* Status Filter */}
          <div className="flex gap-2">
            <span className="text-xs text-bone/50 uppercase tracking-wider self-center mr-2">Estado:</span>
            {(['all', 'pending', 'reviewed', 'resolved', 'dismissed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  statusFilter === status
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-bone/5 text-bone/70 border border-bone/10 hover:bg-bone/10'
                )}
              >
                {status === 'all' ? 'Todos' : STATUS_LABELS[status].label}
              </button>
            ))}
          </div>

          {/* Content Type Filter */}
          <div className="flex gap-2">
            <span className="text-xs text-bone/50 uppercase tracking-wider self-center mr-2">Tipo:</span>
            {(['all', 'miniature', 'listing', 'comment', 'profile'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setContentTypeFilter(type)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  contentTypeFilter === type
                    ? 'bg-bone/10 text-bone border border-bone/20'
                    : 'bg-bone/5 text-bone/70 border border-bone/10 hover:bg-bone/10'
                )}
              >
                {type === 'all' ? 'Todos' : CONTENT_TYPE_LABELS[type].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-bone/5 border border-bone/10 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 bg-bone/5 border border-bone/10 rounded-lg">
            <Shield className="w-12 h-12 text-bone/30 mx-auto mb-4" />
            <p className="text-bone/50">No hay reportes {statusFilter !== 'all' ? STATUS_LABELS[statusFilter].label.toLowerCase() + 's' : ''}</p>
          </div>
        ) : (
          <AnimatePresence>
            {reports.map((report) => {
              const statusInfo = STATUS_LABELS[report.status]
              const StatusIcon = statusInfo.icon
              const typeInfo = CONTENT_TYPE_LABELS[report.content_type]
              const TypeIcon = typeInfo.icon
              const isExpanded = expandedReport === report.id

              return (
                <motion.div
                  key={report.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={cn(
                    'bg-void-light border rounded-lg overflow-hidden',
                    report.status === 'pending' ? 'border-red-500/20' : 'border-bone/10'
                  )}
                >
                  {/* Main Row */}
                  <div
                    className="p-4 cursor-pointer hover:bg-bone/5 transition-colors"
                    onClick={() => toggleExpanded(report.id)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Content Type Icon */}
                      <div className={cn('p-3 rounded-lg bg-bone/5', typeInfo.color)}>
                        <TypeIcon className="w-5 h-5" />
                      </div>

                      {/* Report Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn('px-2 py-0.5 rounded text-xs', typeInfo.color, 'bg-current/10')}>
                            {typeInfo.label}
                          </span>
                          <span className="text-sm font-medium text-bone">
                            {REASON_LABELS[report.reason] || report.reason}
                          </span>
                          <span className={cn('px-2 py-0.5 rounded text-xs border flex items-center gap-1', statusInfo.color)}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-bone/50">
                          <span className="flex items-center gap-1">
                            Reportado por @{report.reporter?.username || 'desconocido'}
                          </span>
                          {report.reported_user && (
                            <span className="flex items-center gap-1">
                              → @{report.reported_user.username}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-bone/40 mt-1">
                          {new Date(report.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {report.status === 'pending' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMarkReviewing(report.id)
                              }}
                              disabled={actionLoading === report.id}
                              className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-500 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                              title="Marcar en revisión"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleResolve(report.id)
                              }}
                              disabled={actionLoading === report.id}
                              className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                              title="Resolver"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDismiss(report.id)
                              }}
                              disabled={actionLoading === report.id}
                              className="p-2 bg-bone/5 border border-bone/10 rounded-lg text-bone/50 hover:text-bone hover:bg-bone/10 transition-colors disabled:opacity-50"
                              title="Desestimar"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {report.status === 'reviewed' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleResolve(report.id)
                              }}
                              disabled={actionLoading === report.id}
                              className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                              title="Resolver"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDismiss(report.id)
                              }}
                              disabled={actionLoading === report.id}
                              className="p-2 bg-bone/5 border border-bone/10 rounded-lg text-bone/50 hover:text-bone hover:bg-bone/10 transition-colors disabled:opacity-50"
                              title="Desestimar"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
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
                          {/* Description */}
                          {report.description && (
                            <div>
                              <h4 className="text-xs font-medium text-bone/50 uppercase tracking-wider mb-1">Descripción del Reporte</h4>
                              <p className="text-sm text-bone/70 whitespace-pre-wrap">{report.description}</p>
                            </div>
                          )}

                          {/* Users Involved */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Reporter */}
                            <div className="p-3 bg-bone/5 rounded-lg">
                              <h4 className="text-xs font-medium text-bone/50 uppercase tracking-wider mb-2">Reportado por</h4>
                              <div className="flex items-center gap-3">
                                <Avatar
                                  src={report.reporter?.avatar_url}
                                  alt={report.reporter?.username || 'Usuario'}
                                  size="sm"
                                />
                                <div>
                                  <p className="text-sm font-medium text-bone">
                                    {report.reporter?.display_name || report.reporter?.username || 'Usuario'}
                                  </p>
                                  <p className="text-xs text-bone/50">@{report.reporter?.username}</p>
                                </div>
                                {report.reporter && (
                                  <Link
                                    href={`/usuarios/${report.reporter.username}`}
                                    className="ml-auto p-1.5 bg-bone/5 rounded hover:bg-bone/10 transition-colors"
                                  >
                                    <Eye className="w-4 h-4 text-bone/50" />
                                  </Link>
                                )}
                              </div>
                            </div>

                            {/* Reported User */}
                            {report.reported_user && (
                              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                                <h4 className="text-xs font-medium text-red-400 uppercase tracking-wider mb-2">Usuario Reportado</h4>
                                <div className="flex items-center gap-3">
                                  <Avatar
                                    src={report.reported_user.avatar_url}
                                    alt={report.reported_user.username || 'Usuario'}
                                    size="sm"
                                  />
                                  <div>
                                    <p className="text-sm font-medium text-bone">
                                      {report.reported_user.display_name || report.reported_user.username || 'Usuario'}
                                    </p>
                                    <p className="text-xs text-bone/50">@{report.reported_user.username}</p>
                                  </div>
                                  <div className="ml-auto flex gap-2">
                                    <Link
                                      href={`/usuarios/${report.reported_user.username}`}
                                      className="p-1.5 bg-bone/5 rounded hover:bg-bone/10 transition-colors"
                                    >
                                      <Eye className="w-4 h-4 text-bone/50" />
                                    </Link>
                                    <button
                                      className="p-1.5 bg-red-500/10 rounded hover:bg-red-500/20 transition-colors"
                                      title="Banear usuario (próximamente)"
                                    >
                                      <Ban className="w-4 h-4 text-red-400" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* View Content Link */}
                          <div className="flex justify-end">
                            <Link
                              href={getContentLink(report.content_type, report.content_id)}
                              className="flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-lg text-sm text-gold hover:bg-gold/20 transition-colors"
                            >
                              <TypeIcon className="w-4 h-4" />
                              Ver {typeInfo.label.toLowerCase()} reportado
                            </Link>
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
    </div>
  )
}
