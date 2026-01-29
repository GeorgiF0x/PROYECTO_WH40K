'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Palette,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  User,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Eye,
  AlertTriangle,
  RefreshCw,
  Youtube,
  Instagram,
  Globe,
  FileText,
  Briefcase,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui'
import type { CreatorApplication, CreatorStatus, CreatorType, Profile } from '@/lib/types/database.types'

type ApplicationWithUser = CreatorApplication & {
  user: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'bio' | 'instagram' | 'youtube' | 'website'> | null
}

const STATUS_LABELS: Record<CreatorStatus, { label: string; color: string; icon: typeof Clock }> = {
  none: { label: 'Sin solicitud', color: 'text-bone/50 bg-bone/5 border-bone/10', icon: User },
  pending: { label: 'Pendiente', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: Clock },
  approved: { label: 'Aprobado', color: 'text-green-500 bg-green-500/10 border-green-500/20', icon: CheckCircle },
  rejected: { label: 'Rechazado', color: 'text-red-500 bg-red-500/10 border-red-500/20', icon: XCircle },
}

const CREATOR_TYPE_LABELS: Record<CreatorType, { label: string; icon: typeof Palette; color: string }> = {
  painter: { label: 'Pintor', icon: Palette, color: 'text-purple-400' },
  youtuber: { label: 'YouTuber', icon: Youtube, color: 'text-red-400' },
  artist: { label: 'Artista', icon: Palette, color: 'text-pink-400' },
  blogger: { label: 'Blogger', icon: FileText, color: 'text-blue-400' },
  instructor: { label: 'Instructor', icon: Briefcase, color: 'text-green-400' },
}

export default function CreatorsManagementPage() {
  const [applications, setApplications] = useState<ApplicationWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<CreatorStatus | 'all'>('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedApp, setExpandedApp] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null)

  const supabase = createClient()

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('creator_applications')
      .select(`
        *,
        user:profiles!creator_applications_user_id_fkey(
          id,
          username,
          display_name,
          avatar_url,
          bio,
          instagram,
          youtube,
          website
        )
      `)
      .order('created_at', { ascending: false })

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching applications:', error)
    } else {
      let filteredData = data as ApplicationWithUser[]
      if (searchQuery) {
        const search = searchQuery.toLowerCase()
        filteredData = filteredData.filter(app =>
          app.user?.username?.toLowerCase().includes(search) ||
          app.user?.display_name?.toLowerCase().includes(search)
        )
      }
      setApplications(filteredData)
    }
    setLoading(false)
  }, [supabase, statusFilter, searchQuery])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const handleApprove = async (applicationId: string, userId: string, creatorType: CreatorType) => {
    setActionLoading(applicationId)
    const { data: { user } } = await supabase.auth.getUser()

    // Update application status
    const { error: appError } = await supabase
      .from('creator_applications')
      .update({
        status: 'approved',
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', applicationId)

    if (appError) {
      console.error('Error approving application:', appError)
      alert('Error al aprobar la solicitud')
      setActionLoading(null)
      return
    }

    // Update user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        creator_status: 'approved',
        creator_type: creatorType,
        creator_verified_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      alert('Error al actualizar el perfil del usuario')
    }

    fetchApplications()
    setActionLoading(null)
  }

  const handleReject = async (applicationId: string, userId: string) => {
    if (!rejectionReason.trim()) {
      alert('Por favor, indica el motivo del rechazo')
      return
    }

    setActionLoading(applicationId)
    const { data: { user } } = await supabase.auth.getUser()

    // Update application status
    const { error: appError } = await supabase
      .from('creator_applications')
      .update({
        status: 'rejected',
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: rejectionReason,
      })
      .eq('id', applicationId)

    if (appError) {
      console.error('Error rejecting application:', appError)
      alert('Error al rechazar la solicitud')
      setActionLoading(null)
      return
    }

    // Update user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        creator_status: 'rejected',
        creator_rejection_reason: rejectionReason,
      })
      .eq('id', userId)

    if (profileError) {
      console.error('Error updating profile:', profileError)
    }

    setShowRejectModal(null)
    setRejectionReason('')
    fetchApplications()
    setActionLoading(null)
  }

  const toggleExpanded = (appId: string) => {
    setExpandedApp(expandedApp === appId ? null : appId)
  }

  const pendingCount = applications.filter(a => a.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bone flex items-center gap-3">
            <Palette className="w-7 h-7 text-purple-400" />
            Solicitudes de Creador
          </h1>
          <p className="text-bone/50 mt-1">
            Revisa y aprueba las solicitudes para el programa de creadores
          </p>
        </div>
        {statusFilter === 'pending' && pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-amber-500">
              {pendingCount} {pendingCount === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'}
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bone/40" />
          <input
            type="text"
            placeholder="Buscar por usuario..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone placeholder:text-bone/40 focus:outline-none focus:border-gold/30"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                statusFilter === status
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  : 'bg-bone/5 text-bone/70 border border-bone/10 hover:bg-bone/10'
              )}
            >
              {status === 'all' ? 'Todas' : STATUS_LABELS[status].label}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={fetchApplications}
          disabled={loading}
          className="p-2.5 bg-bone/5 border border-bone/10 rounded-lg text-bone/70 hover:text-bone hover:bg-bone/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 bg-bone/5 border border-bone/10 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 bg-bone/5 border border-bone/10 rounded-lg">
            <Palette className="w-12 h-12 text-bone/30 mx-auto mb-4" />
            <p className="text-bone/50">No hay solicitudes {statusFilter !== 'all' ? STATUS_LABELS[statusFilter].label.toLowerCase() + 's' : ''}</p>
          </div>
        ) : (
          <AnimatePresence>
            {applications.map((app) => {
              const statusInfo = STATUS_LABELS[app.status]
              const StatusIcon = statusInfo.icon
              const typeInfo = CREATOR_TYPE_LABELS[app.creator_type]
              const TypeIcon = typeInfo.icon
              const isExpanded = expandedApp === app.id

              return (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-void-light border border-bone/10 rounded-lg overflow-hidden"
                >
                  {/* Main Row */}
                  <div
                    className="p-4 cursor-pointer hover:bg-bone/5 transition-colors"
                    onClick={() => toggleExpanded(app.id)}
                  >
                    <div className="flex items-center gap-4">
                      {/* User Avatar */}
                      <Avatar
                        src={app.user?.avatar_url}
                        alt={app.user?.display_name || app.user?.username || 'Usuario'}
                        size="lg"
                      />

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-bone truncate">
                            {app.user?.display_name || app.user?.username || 'Usuario'}
                          </h3>
                          <span className={cn('px-2 py-0.5 rounded text-xs border flex items-center gap-1', statusInfo.color)}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-bone/50">
                          <span className="flex items-center gap-1">
                            @{app.user?.username || 'unknown'}
                          </span>
                          <span className={cn('flex items-center gap-1', typeInfo.color)}>
                            <TypeIcon className="w-3 h-3" />
                            {typeInfo.label}
                          </span>
                        </div>
                        <p className="text-xs text-bone/40 mt-1">
                          Solicitado el {new Date(app.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (app.user) {
                                  handleApprove(app.id, app.user.id, app.creator_type)
                                }
                              }}
                              disabled={actionLoading === app.id}
                              className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                              title="Aprobar"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowRejectModal(app.id)
                              }}
                              disabled={actionLoading === app.id}
                              className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                              title="Rechazar"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {app.user && (
                          <Link
                            href={`/usuarios/${app.user.username}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-bone/5 border border-bone/10 rounded-lg text-bone/50 hover:text-bone hover:bg-bone/10 transition-colors"
                            title="Ver perfil"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
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
                          {/* Motivation */}
                          <div>
                            <h4 className="text-xs font-medium text-bone/50 uppercase tracking-wider mb-1">Motivación</h4>
                            <p className="text-sm text-bone/70 whitespace-pre-wrap">{app.motivation}</p>
                          </div>

                          {/* User Bio */}
                          {app.user?.bio && (
                            <div>
                              <h4 className="text-xs font-medium text-bone/50 uppercase tracking-wider mb-1">Bio del Usuario</h4>
                              <p className="text-sm text-bone/70">{app.user.bio}</p>
                            </div>
                          )}

                          {/* Social Links */}
                          <div className="flex flex-wrap gap-3">
                            {app.user?.youtube && (
                              <a
                                href={`https://youtube.com/${app.user.youtube}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                              >
                                <Youtube className="w-4 h-4" />
                                YouTube
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {app.user?.instagram && (
                              <a
                                href={`https://instagram.com/${app.user.instagram}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-1.5 bg-pink-500/10 border border-pink-500/20 rounded-lg text-sm text-pink-400 hover:bg-pink-500/20 transition-colors"
                              >
                                <Instagram className="w-4 h-4" />
                                Instagram
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {app.user?.website && (
                              <a
                                href={app.user.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-400 hover:bg-blue-500/20 transition-colors"
                              >
                                <Globe className="w-4 h-4" />
                                Sitio Web
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          {/* Portfolio Links */}
                          {app.portfolio_links && app.portfolio_links.length > 0 && (
                            <div>
                              <h4 className="text-xs font-medium text-bone/50 uppercase tracking-wider mb-2">Portfolio</h4>
                              <div className="flex flex-wrap gap-2">
                                {app.portfolio_links.map((link, idx) => (
                                  <a
                                    key={idx}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 px-2 py-1 bg-bone/5 border border-bone/10 rounded text-xs text-gold hover:underline"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    {new URL(link).hostname}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Rejection Reason (if rejected) */}
                          {app.status === 'rejected' && app.rejection_reason && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                              <h4 className="text-xs font-medium text-red-500 uppercase tracking-wider mb-1">Motivo del Rechazo</h4>
                              <p className="text-sm text-red-400">{app.rejection_reason}</p>
                            </div>
                          )}
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

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRejectModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-void-light border border-bone/20 rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-bone mb-2">Rechazar Solicitud</h3>
              <p className="text-sm text-bone/50 mb-4">
                Por favor, indica el motivo del rechazo. Este mensaje será visible para el usuario.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Motivo del rechazo..."
                rows={4}
                className="w-full px-3 py-2 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone placeholder:text-bone/40 focus:outline-none focus:border-red-500/30 resize-none"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowRejectModal(null)
                    setRejectionReason('')
                  }}
                  className="px-4 py-2 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone/70 hover:text-bone hover:bg-bone/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    const app = applications.find(a => a.id === showRejectModal)
                    if (app?.user) {
                      handleReject(showRejectModal, app.user.id)
                    }
                  }}
                  disabled={actionLoading === showRejectModal || !rejectionReason.trim()}
                  className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  {actionLoading === showRejectModal ? 'Rechazando...' : 'Confirmar Rechazo'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
