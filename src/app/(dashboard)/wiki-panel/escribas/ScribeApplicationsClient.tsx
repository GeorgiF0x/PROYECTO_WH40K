'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Feather,
  BookOpen,
  MessageSquare,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { ScribeApplication } from '@/lib/supabase/wiki.types'

export function ScribeApplicationsClient() {
  const [applications, setApplications] = useState<ScribeApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [selectedApp, setSelectedApp] = useState<ScribeApplication | null>(null)

  useEffect(() => {
    loadApplications()
  }, [statusFilter])

  async function loadApplications() {
    setLoading(true)
    try {
      const res = await fetch(`/api/wiki/scribe-applications?status=${statusFilter}`)
      if (res.ok) {
        const data = await res.json()
        setApplications(data.data || [])
      }
    } catch (error) {
      console.error('Error loading applications:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(appId: string, action: 'approve' | 'reject') {
    setProcessingId(appId)
    try {
      const res = await fetch(`/api/wiki/scribe-applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes: reviewNotes || null }),
      })

      if (res.ok) {
        setApplications(applications.filter((a) => a.id !== appId))
        setSelectedApp(null)
        setReviewNotes('')
      }
    } catch (error) {
      console.error('Error processing application:', error)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/wiki-panel"
          className="mb-4 inline-flex items-center gap-2 font-mono text-sm text-bone/40 transition-colors hover:text-bone/70"
        >
          <ArrowLeft className="h-4 w-4" />
          VOLVER AL ARCHIVO
        </Link>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="mb-2 font-display text-3xl font-bold text-white">
              Solicitudes de Escribas
            </h1>
            <p className="font-body text-bone/60">
              Gestiona las peticiones para unirse a la Orden de Lexicanum Scribes
            </p>
          </div>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2">
        {(['pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-lg px-4 py-2 font-mono text-sm transition-all ${
              statusFilter === status
                ? 'border border-amber-500/30 bg-amber-500/20 text-amber-400'
                : 'border border-transparent bg-void-light/50 text-bone/50 hover:border-bone/10'
            }`}
          >
            {status === 'pending' && <Clock className="mr-2 inline h-4 w-4" />}
            {status === 'approved' && <CheckCircle2 className="mr-2 inline h-4 w-4" />}
            {status === 'rejected' && <XCircle className="mr-2 inline h-4 w-4" />}
            {status === 'pending'
              ? 'Pendientes'
              : status === 'approved'
                ? 'Aprobadas'
                : 'Rechazadas'}
          </button>
        ))}
      </div>

      {/* Applications list */}
      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-void-light" />
          ))
        ) : applications.length === 0 ? (
          <Card className="py-12 text-center">
            <Feather className="mx-auto mb-4 h-12 w-12 text-bone/30" />
            <h3 className="mb-2 font-display text-xl text-white">
              No hay solicitudes{' '}
              {statusFilter === 'pending'
                ? 'pendientes'
                : statusFilter === 'approved'
                  ? 'aprobadas'
                  : 'rechazadas'}
            </h3>
            <p className="font-body text-bone/60">
              {statusFilter === 'pending'
                ? 'Las nuevas solicitudes apareceran aqui.'
                : `Las solicitudes ${statusFilter === 'approved' ? 'aprobadas' : 'rechazadas'} se mostraran aqui.`}
            </p>
          </Card>
        ) : (
          applications.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-6">
                <div className="flex flex-col gap-6 lg:flex-row">
                  {/* User info */}
                  <div className="flex items-start gap-4 lg:w-1/3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-bone/10 bg-void-light">
                      {app.user?.avatar_url ? (
                        <Image
                          src={app.user.avatar_url}
                          alt={app.user.username || ''}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-bone/40" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-white">
                        {app.user?.display_name || app.user?.username || 'Usuario'}
                      </h3>
                      <p className="font-mono text-sm text-bone/50">@{app.user?.username}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-bone/40">
                        <Calendar className="h-3 w-3" />
                        {new Date(app.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Application content */}
                  <div className="flex-1 space-y-4">
                    {/* Motivation */}
                    <div>
                      <h4 className="mb-1 flex items-center gap-1 font-mono text-xs text-bone/50">
                        <MessageSquare className="h-3 w-3" />
                        MOTIVACION
                      </h4>
                      <p className="rounded-lg border border-bone/5 bg-void/30 p-3 text-sm text-bone/80">
                        {app.motivation}
                      </p>
                    </div>

                    {/* Experience */}
                    {app.experience && (
                      <div>
                        <h4 className="mb-1 flex items-center gap-1 font-mono text-xs text-bone/50">
                          <BookOpen className="h-3 w-3" />
                          EXPERIENCIA
                        </h4>
                        <p className="text-sm text-bone/70">{app.experience}</p>
                      </div>
                    )}

                    {/* Sample topic */}
                    {app.sample_topic && (
                      <div>
                        <h4 className="mb-1 flex items-center gap-1 font-mono text-xs text-bone/50">
                          <Feather className="h-3 w-3" />
                          TEMA DE INTERES
                        </h4>
                        <p className="text-sm text-bone/70">{app.sample_topic}</p>
                      </div>
                    )}

                    {/* Review notes (for processed) */}
                    {app.status !== 'pending' && app.reviewer_notes && (
                      <div className="mt-4 rounded-lg border border-bone/10 bg-void/50 p-3">
                        <h4 className="mb-1 font-mono text-xs text-bone/50">NOTAS DEL REVISOR</h4>
                        <p className="text-sm text-bone/70">{app.reviewer_notes}</p>
                      </div>
                    )}

                    {/* Actions for pending */}
                    {app.status === 'pending' && (
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        {selectedApp?.id === app.id ? (
                          <div className="flex-1 space-y-3">
                            <textarea
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                              placeholder="Notas para el solicitante (opcional)..."
                              className="h-20 w-full resize-none rounded-lg border border-bone/10 bg-void/50 px-3 py-2 text-sm text-bone placeholder-bone/30 focus:border-amber-500/50 focus:outline-none"
                            />
                            <div className="flex gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-500"
                                onClick={() => handleAction(app.id, 'approve')}
                                disabled={processingId === app.id}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Aprobar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-blood-red/50 text-blood-red hover:bg-blood-red/10 flex-1 gap-2"
                                onClick={() => handleAction(app.id, 'reject')}
                                disabled={processingId === app.id}
                              >
                                <XCircle className="h-4 w-4" />
                                Rechazar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedApp(null)
                                  setReviewNotes('')
                                }}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => setSelectedApp(app)}
                          >
                            <AlertCircle className="h-4 w-4" />
                            Revisar solicitud
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
