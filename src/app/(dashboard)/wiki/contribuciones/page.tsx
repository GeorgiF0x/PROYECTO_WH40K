'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Check,
  X,
  Eye,
  Clock,
  User,
  FileText,
  ChevronLeft,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { WikiRenderer } from '@/components/wiki'
import { factions } from '@/lib/data'
import type { WikiContribution, TiptapContent } from '@/lib/supabase/wiki.types'

export default function WikiContributionsPage() {
  const [contributions, setContributions] = useState<WikiContribution[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [selectedContribution, setSelectedContribution] = useState<WikiContribution | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewing, setReviewing] = useState(false)

  useEffect(() => {
    loadContributions()
  }, [statusFilter])

  async function loadContributions() {
    setLoading(true)
    try {
      const res = await fetch(`/api/wiki/contributions?status=${statusFilter}&limit=50`)
      if (res.ok) {
        const data = await res.json()
        setContributions(data.contributions || [])
      }
    } catch (error) {
      console.error('Error loading contributions:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleReview(contributionId: string, status: 'approved' | 'rejected') {
    setReviewing(true)
    try {
      const res = await fetch(`/api/wiki/contributions/${contributionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reviewer_notes: reviewNotes || undefined,
        }),
      })

      if (res.ok) {
        setSelectedContribution(null)
        setReviewNotes('')
        loadContributions()
      }
    } catch (error) {
      console.error('Error reviewing contribution:', error)
    } finally {
      setReviewing(false)
    }
  }

  const statusLabels = {
    pending: { label: 'Pendiente', color: 'text-yellow-400 bg-yellow-500/20' },
    approved: { label: 'Aprobada', color: 'text-green-400 bg-green-500/20' },
    rejected: { label: 'Rechazada', color: 'text-red-400 bg-red-500/20' },
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/wiki">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Contribuciones
          </h1>
          <p className="font-body text-bone/60">
            Revisa las sugerencias de la comunidad
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg font-body text-sm transition-all ${
              statusFilter === status
                ? statusLabels[status].color
                : 'text-bone/60 hover:text-bone hover:bg-bone/10'
            }`}
          >
            {statusLabels[status].label}
          </button>
        ))}
      </div>

      {/* Contributions List */}
      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-void-light rounded-lg animate-pulse" />
          ))
        ) : contributions.length === 0 ? (
          <Card className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-bone/30" />
            <h3 className="font-display text-xl text-white mb-2">
              No hay contribuciones {statusFilter === 'pending' ? 'pendientes' : ''}
            </h3>
            <p className="font-body text-bone/60">
              {statusFilter === 'pending'
                ? 'Todas las sugerencias han sido revisadas.'
                : 'No hay contribuciones con este estado.'}
            </p>
          </Card>
        ) : (
          contributions.map((contrib, i) => {
            const faction = contrib.page?.faction_id
              ? factions.find(f => f.id === contrib.page?.faction_id)
              : contrib.faction_id
              ? factions.find(f => f.id === contrib.faction_id)
              : null

            return (
              <motion.div
                key={contrib.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card hover className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-body ${statusLabels[contrib.status].color}`}>
                        {statusLabels[contrib.status].label}
                      </span>
                      {faction && (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-body"
                          style={{ background: `${faction.color}20`, color: faction.color }}
                        >
                          {faction.shortName}
                        </span>
                      )}
                      {contrib.page ? (
                        <span className="text-xs text-bone/50 font-body">
                          Edicion de: {contrib.page.title}
                        </span>
                      ) : (
                        <span className="text-xs text-green-400 font-body">
                          Nuevo articulo: {contrib.suggested_title}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-bone/50 font-body">
                      {contrib.contributor && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {contrib.contributor.display_name || contrib.contributor.username}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(contrib.created_at).toLocaleDateString('es-ES')}
                      </span>
                    </div>

                    {contrib.reviewer_notes && (
                      <p className="mt-2 text-sm text-bone/60 font-body italic">
                        Notas: {contrib.reviewer_notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedContribution(contrib)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {contrib.status === 'pending' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedContribution(contrib)
                          }}
                          className="text-green-400 hover:text-green-300"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedContribution(contrib)
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={!!selectedContribution}
        onClose={() => {
          setSelectedContribution(null)
          setReviewNotes('')
        }}
        title={
          selectedContribution?.page
            ? `Revisar edicion: ${selectedContribution.page.title}`
            : `Nuevo articulo: ${selectedContribution?.suggested_title}`
        }
      >
        {selectedContribution && (
          <div className="space-y-6">
            {/* Content Preview */}
            <div
              className="max-h-96 overflow-y-auto p-4 rounded-lg"
              style={{ background: 'rgba(10, 10, 18, 0.5)', border: '1px solid rgba(232,232,240,0.1)' }}
            >
              <WikiRenderer
                content={selectedContribution.content as TiptapContent}
                factionColor={
                  factions.find(f =>
                    f.id === selectedContribution.page?.faction_id ||
                    f.id === selectedContribution.faction_id
                  )?.color || '#C9A227'
                }
              />
            </div>

            {/* Contributor info */}
            <div className="text-sm text-bone/60 font-body">
              <span>Enviado por: </span>
              <span className="text-bone">
                {selectedContribution.contributor?.display_name ||
                 selectedContribution.contributor?.username}
              </span>
              <span> el </span>
              <span className="text-bone">
                {new Date(selectedContribution.created_at).toLocaleString('es-ES')}
              </span>
            </div>

            {/* Review actions */}
            {selectedContribution.status === 'pending' && (
              <>
                <div>
                  <label className="block font-body text-sm text-bone/70 mb-2">
                    Notas de revision (opcional)
                  </label>
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Motivo de la decision, sugerencias de mejora..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="danger"
                    onClick={() => handleReview(selectedContribution.id, 'rejected')}
                    disabled={reviewing}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Rechazar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleReview(selectedContribution.id, 'approved')}
                    disabled={reviewing}
                    className="gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Aprobar
                  </Button>
                </div>
              </>
            )}

            {selectedContribution.status !== 'pending' && selectedContribution.reviewer_notes && (
              <div className="p-4 rounded-lg bg-void-light border border-bone/10">
                <h4 className="font-body text-sm font-semibold text-bone mb-2">
                  Notas del revisor:
                </h4>
                <p className="font-body text-sm text-bone/70">
                  {selectedContribution.reviewer_notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
