'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flag, AlertTriangle, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'

export type ReportContentType = 'miniature' | 'listing' | 'comment' | 'message' | 'profile'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  contentType: ReportContentType
  contentId: string
  reportedUserId?: string
}

const reasonOptions = [
  { value: 'spam', label: 'Spam o publicidad no deseada' },
  { value: 'inappropriate', label: 'Contenido inapropiado' },
  { value: 'harassment', label: 'Acoso o amenazas' },
  { value: 'scam', label: 'Estafa o fraude' },
  { value: 'copyright', label: 'Violacion de derechos de autor' },
  { value: 'other', label: 'Otro motivo' },
]

const contentTypeLabels: Record<ReportContentType, string> = {
  miniature: 'esta miniatura',
  listing: 'este anuncio',
  comment: 'este comentario',
  message: 'este mensaje',
  profile: 'este perfil',
}

export function ReportModal({
  isOpen,
  onClose,
  contentType,
  contentId,
  reportedUserId,
}: ReportModalProps) {
  const { user } = useAuth()
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError('Debes iniciar sesion para reportar contenido')
      return
    }

    if (!reason) {
      setError('Selecciona un motivo para el reporte')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error: insertError } = await supabase.from('reports').insert({
        content_type: contentType,
        content_id: contentId,
        reason,
        description: description.trim() || null,
        reporter_id: user.id,
        reported_user_id: reportedUserId || null,
        status: 'pending',
      })

      if (insertError) throw insertError

      setSuccess(true)

      // Auto close after success
      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (err) {
      console.error('Error submitting report:', err)
      setError('Error al enviar el reporte. Intentalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setReason('')
    setDescription('')
    setError(null)
    setSuccess(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-void/85 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md overflow-hidden rounded-xl border border-red-500/20 bg-void-light shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header glow */}
            <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-bone/10 bg-red-500/5 px-6 py-4">
              <div className="rounded-lg bg-red-500/10 p-2">
                <Flag className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-bone">Reportar contenido</h2>
                <p className="font-body text-xs text-bone/50">
                  Reportar {contentTypeLabels[contentType]}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="ml-auto p-1 text-bone/40 transition-colors hover:text-bone"
                aria-label="Cerrar"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-6 text-center"
                >
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-semibold text-bone">
                    Reporte enviado
                  </h3>
                  <p className="font-body text-sm text-bone/60">
                    Gracias por ayudar a mantener la comunidad segura.
                    <br />
                    Revisaremos tu reporte lo antes posible.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Warning */}
                  <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                    <p className="font-body text-xs text-bone/70">
                      Los reportes falsos o abusivos pueden resultar en sanciones. Usa esta funcion
                      solo para contenido que viole las normas de la comunidad.
                    </p>
                  </div>

                  {/* Reason select */}
                  <div>
                    <label className="mb-2 block font-body text-sm font-medium text-bone/80">
                      Motivo del reporte <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full rounded-lg border border-bone/20 bg-void px-4 py-3 font-body text-sm text-bone transition-colors focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/20"
                      required
                    >
                      <option value="">Selecciona un motivo...</option>
                      {reasonOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description textarea */}
                  <div>
                    <label className="mb-2 block font-body text-sm font-medium text-bone/80">
                      Descripcion adicional <span className="text-bone/40">(opcional)</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Proporciona mas detalles sobre el problema..."
                      rows={3}
                      maxLength={500}
                      className="w-full resize-none rounded-lg border border-bone/20 bg-void px-4 py-3 font-body text-sm text-bone transition-colors placeholder:text-bone/30 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/20"
                    />
                    <p className="mt-1 text-right font-mono text-xs text-bone/40">
                      {description.length}/500
                    </p>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                      <p className="font-body text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 rounded-lg border border-bone/20 bg-void px-4 py-3 font-body text-sm text-bone/70 transition-colors hover:border-bone/30 hover:bg-bone/5"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !reason}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 font-body text-sm text-red-400 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Flag className="h-4 w-4" />
                          Enviar reporte
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
