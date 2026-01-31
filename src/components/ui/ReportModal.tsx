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
            className="relative w-full max-w-md bg-void-light border border-red-500/20 rounded-xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header glow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-bone/10 bg-red-500/5">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Flag className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-display font-semibold text-bone">
                  Reportar contenido
                </h2>
                <p className="text-xs text-bone/50 font-body">
                  Reportar {contentTypeLabels[contentType]}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="ml-auto p-1 text-bone/40 hover:text-bone transition-colors"
                aria-label="Cerrar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-6"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-bone mb-2">
                    Reporte enviado
                  </h3>
                  <p className="text-sm text-bone/60 font-body">
                    Gracias por ayudar a mantener la comunidad segura.
                    <br />
                    Revisaremos tu reporte lo antes posible.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Warning */}
                  <div className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-bone/70 font-body">
                      Los reportes falsos o abusivos pueden resultar en sanciones.
                      Usa esta funcion solo para contenido que viole las normas de la comunidad.
                    </p>
                  </div>

                  {/* Reason select */}
                  <div>
                    <label className="block text-sm font-medium text-bone/80 mb-2 font-body">
                      Motivo del reporte <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-4 py-3 bg-void border border-bone/20 rounded-lg text-bone font-body text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-colors"
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
                    <label className="block text-sm font-medium text-bone/80 mb-2 font-body">
                      Descripcion adicional <span className="text-bone/40">(opcional)</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Proporciona mas detalles sobre el problema..."
                      rows={3}
                      maxLength={500}
                      className="w-full px-4 py-3 bg-void border border-bone/20 rounded-lg text-bone font-body text-sm placeholder:text-bone/30 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-colors resize-none"
                    />
                    <p className="mt-1 text-xs text-bone/40 text-right font-mono">
                      {description.length}/500
                    </p>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-sm text-red-400 font-body">{error}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 px-4 py-3 bg-void border border-bone/20 rounded-lg text-bone/70 font-body text-sm hover:bg-bone/5 hover:border-bone/30 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !reason}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 font-body text-sm hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Flag className="w-4 h-4" />
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
