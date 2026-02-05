'use client'

import * as React from 'react'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ScrollText,
  CheckCircle,
  XCircle,
  Eye,
  ExternalLink,
  Feather,
  BookOpen,
  MessageSquare,
  Calendar,
} from 'lucide-react'
import { DataTable, StatusBadge, FilterTabs, type Column, type Action } from '../components/ui/data-table'
import { Modal, ConfirmDialog } from '../components/ui/modal'
import { Button } from '../components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { createClient } from '@/lib/supabase/client'

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

interface ScribeApplication {
  [key: string]: unknown
  id: string
  user_id: string
  motivation: string
  experience: string | null
  sample_topic: string | null
  status: 'pending' | 'approved' | 'rejected'
  reviewer_id: string | null
  reviewer_notes: string | null
  reviewed_at: string | null
  created_at: string
  user?: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
  reviewer?: {
    username: string
    display_name: string | null
  }
}

type ApplicationStatus = 'all' | 'pending' | 'approved' | 'rejected'

// ══════════════════════════════════════════════════════════════
// ESCRIBAS PAGE
// ══════════════════════════════════════════════════════════════

export default function EscribasPage() {
  const searchParams = useSearchParams()
  const initialStatus = (searchParams.get('status') as ApplicationStatus) || 'all'

  const [applications, setApplications] = useState<ScribeApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus>(initialStatus)
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 })

  // Modal states
  const [viewApp, setViewApp] = useState<ScribeApplication | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    app: ScribeApplication
    action: 'approve' | 'reject'
  } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    setLoading(true)
    try {
      const status = statusFilter === 'all' ? 'pending' : statusFilter
      const res = await fetch(`/api/wiki/scribe-applications?status=${status}`)

      if (res.ok) {
        const data = await res.json()
        setApplications(data.data || [])
      }

      // Get counts via separate calls
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        fetch('/api/wiki/scribe-applications?status=pending'),
        fetch('/api/wiki/scribe-applications?status=approved'),
        fetch('/api/wiki/scribe-applications?status=rejected'),
      ])

      const [pendingData, approvedData, rejectedData] = await Promise.all([
        pendingRes.ok ? pendingRes.json() : { data: [] },
        approvedRes.ok ? approvedRes.json() : { data: [] },
        rejectedRes.ok ? rejectedRes.json() : { data: [] },
      ])

      setCounts({
        all: (pendingData.data?.length || 0) + (approvedData.data?.length || 0) + (rejectedData.data?.length || 0),
        pending: pendingData.data?.length || 0,
        approved: approvedData.data?.length || 0,
        rejected: rejectedData.data?.length || 0,
      })

      // If "all", combine them
      if (statusFilter === 'all') {
        setApplications([
          ...(pendingData.data || []),
          ...(approvedData.data || []),
          ...(rejectedData.data || []),
        ])
      }
    } catch (error) {
      console.error('Error fetching scribe applications:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  // Handle approve/reject
  const handleAction = async () => {
    if (!confirmAction) return

    setActionLoading(true)
    try {
      const res = await fetch(`/api/wiki/scribe-applications/${confirmAction.app.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: confirmAction.action,
          notes: reviewNotes || null,
        }),
      })

      if (res.ok) {
        setConfirmAction(null)
        setReviewNotes('')
        fetchApplications()
      } else {
        const data = await res.json()
        console.error('Error:', data.error)
      }
    } catch (error) {
      console.error('Error processing application:', error)
    } finally {
      setActionLoading(false)
    }
  }

  // Table columns
  const columns: Column<ScribeApplication>[] = [
    {
      key: 'user',
      header: 'Solicitante',
      sortable: true,
      render: (app) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={app.user?.avatar_url || undefined} />
            <AvatarFallback>
              {(app.user?.display_name || app.user?.username)?.slice(0, 2).toUpperCase() || '??'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-white">
              {app.user?.display_name || app.user?.username || 'Usuario'}
            </p>
            <p className="text-xs text-zinc-500">@{app.user?.username}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'motivation',
      header: 'Motivacion',
      render: (app) => (
        <p className="text-sm text-zinc-400 truncate max-w-[300px]">
          {app.motivation}
        </p>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      width: '120px',
      render: (app) => (
        <StatusBadge status={app.status} />
      ),
    },
    {
      key: 'created_at',
      header: 'Fecha',
      sortable: true,
      width: '120px',
      render: (app) => (
        <span className="text-zinc-500">
          {new Date(app.created_at).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
          })}
        </span>
      ),
    },
  ]

  // Table actions
  const actions: Action<ScribeApplication>[] = [
    {
      label: 'Ver solicitud',
      icon: <Eye className="w-4 h-4" />,
      onClick: (app) => setViewApp(app),
    },
    {
      label: 'Aprobar',
      icon: <CheckCircle className="w-4 h-4" />,
      onClick: (app) => setConfirmAction({ app, action: 'approve' }),
      show: (app) => app.status === 'pending',
    },
    {
      label: 'Rechazar',
      icon: <XCircle className="w-4 h-4" />,
      onClick: (app) => setConfirmAction({ app, action: 'reject' }),
      show: (app) => app.status === 'pending',
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
          <h1 className="text-2xl font-semibold text-white">Lexicanum Scribes</h1>
          <p className="text-sm text-zinc-400">Gestiona las solicitudes para unirse a la Orden de Escribas</p>
        </div>
      </div>

      {/* Filters */}
      <FilterTabs
        tabs={filterTabs}
        activeTab={statusFilter}
        onChange={(key) => setStatusFilter(key as ApplicationStatus)}
      />

      {/* Table */}
      <DataTable
        data={applications}
        columns={columns}
        actions={actions}
        keyField="id"
        searchPlaceholder="Buscar por nombre, username..."
        searchFields={['motivation']}
        loading={loading}
        emptyMessage="No hay solicitudes de escriba"
        emptyIcon={<ScrollText className="w-8 h-8 text-zinc-600 mx-auto" />}
        pageSize={10}
      />

      {/* View Modal */}
      <Modal
        open={!!viewApp}
        onClose={() => setViewApp(null)}
        title="Solicitud de Escriba"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setViewApp(null)}>
              Cerrar
            </Button>
            {viewApp?.status === 'pending' && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setViewApp(null)
                    setConfirmAction({ app: viewApp, action: 'reject' })
                  }}
                >
                  Rechazar
                </Button>
                <Button
                  onClick={() => {
                    setViewApp(null)
                    setConfirmAction({ app: viewApp, action: 'approve' })
                  }}
                >
                  Aprobar
                </Button>
              </>
            )}
          </>
        }
      >
        {viewApp && (
          <div className="space-y-5">
            {/* Profile header */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={viewApp.user?.avatar_url || undefined} />
                <AvatarFallback className="text-lg">
                  {(viewApp.user?.display_name || viewApp.user?.username)
                    ?.slice(0, 2)
                    .toUpperCase() || '??'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium text-white">
                  {viewApp.user?.display_name || viewApp.user?.username || 'Usuario'}
                </h3>
                <p className="text-sm text-zinc-500">@{viewApp.user?.username}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={viewApp.status} />
                  <span className="text-xs text-zinc-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(viewApp.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Motivation */}
            <div>
              <p className="text-xs font-medium text-[#E8E8F0]/40 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                Motivacion
              </p>
              <div className="max-h-40 overflow-y-auto rounded-lg bg-[#0a0a12]/80 border border-[#C9A227]/10 p-3">
                <p className="text-sm text-[#E8E8F0]/70 whitespace-pre-wrap break-words">
                  {viewApp.motivation}
                </p>
              </div>
            </div>

            {/* Experience */}
            {viewApp.experience && (
              <div>
                <p className="text-xs font-medium text-[#E8E8F0]/40 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Experiencia con el lore de 40K
                </p>
                <div className="max-h-32 overflow-y-auto rounded-lg bg-[#0a0a12]/80 border border-[#C9A227]/10 p-3">
                  <p className="text-sm text-[#E8E8F0]/60 whitespace-pre-wrap break-words">
                    {viewApp.experience}
                  </p>
                </div>
              </div>
            )}

            {/* Sample topic */}
            {viewApp.sample_topic && (
              <div>
                <p className="text-xs font-medium text-[#E8E8F0]/40 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Feather className="w-3 h-3" />
                  Tema de interes
                </p>
                <div className="rounded-lg bg-[#0a0a12]/80 border border-[#C9A227]/10 p-3">
                  <p className="text-sm text-[#E8E8F0]/60 break-words">
                    {viewApp.sample_topic}
                  </p>
                </div>
              </div>
            )}

            {/* Reviewer notes (for processed) */}
            {viewApp.status !== 'pending' && viewApp.reviewer_notes && (
              <div className="pt-3 border-t border-[#C9A227]/10">
                <p className="text-xs font-medium text-[#E8E8F0]/40 uppercase tracking-wider mb-1.5">
                  Notas del revisor
                </p>
                <div className="max-h-28 overflow-y-auto rounded-lg bg-[#0a0a12]/80 border border-[#C9A227]/10 p-3">
                  <p className="text-sm text-[#E8E8F0]/60 whitespace-pre-wrap break-words">
                    {viewApp.reviewer_notes}
                  </p>
                </div>
                {viewApp.reviewer && (
                  <p className="text-xs text-zinc-600 mt-1">
                    Revisado por @{viewApp.reviewer.username}
                    {viewApp.reviewed_at && ` el ${new Date(viewApp.reviewed_at).toLocaleDateString('es-ES')}`}
                  </p>
                )}
              </div>
            )}

            {/* Link to public profile */}
            {viewApp.user?.username && (
              <div className="pt-2 border-t border-zinc-800">
                <Link
                  href={`/usuarios/${viewApp.user.username}`}
                  target="_blank"
                  className="flex items-center gap-2 text-sm text-amber-500 hover:text-amber-400"
                >
                  <Feather className="w-4 h-4" />
                  Ver perfil publico
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => {
          setConfirmAction(null)
          setReviewNotes('')
        }}
        onConfirm={handleAction}
        title={
          confirmAction?.action === 'approve'
            ? 'Aprobar escriba'
            : 'Rechazar solicitud'
        }
        description={
          confirmAction?.action === 'approve'
            ? `¿Aprobar a "${
                confirmAction?.app.user?.display_name || confirmAction?.app.user?.username || 'este usuario'
              }" como Lexicanum Scribe? Podra crear y editar articulos en la wiki.`
            : `¿Rechazar la solicitud de "${
                confirmAction?.app.user?.display_name || confirmAction?.app.user?.username || 'este usuario'
              }"?`
        }
        confirmLabel={confirmAction?.action === 'approve' ? 'Aprobar' : 'Rechazar'}
        loading={actionLoading}
      >
        <div className="mt-3">
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Notas (opcional)
          </label>
          <textarea
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Escribe una nota para el solicitante..."
            className="w-full mt-1 h-20 px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-300 text-sm placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 resize-none"
          />
        </div>
      </ConfirmDialog>
    </div>
  )
}
