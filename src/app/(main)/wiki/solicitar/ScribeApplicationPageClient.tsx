'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Shield,
  Scroll,
  FileText,
  ExternalLink,
  Feather,
  PenTool,
  Library,
  XCircle,
  Send
} from 'lucide-react'
import type { WikiRole, ScribeApplication } from '@/lib/supabase/wiki.types'

interface ScribeApplicationPageClientProps {
  userId: string
  username?: string | null
  displayName?: string | null
  wikiRole: WikiRole | null
  isAdmin: boolean
  application?: ScribeApplication | null
}

export function ScribeApplicationPageClient({
  userId,
  username,
  displayName,
  wikiRole,
  isAdmin,
  application
}: ScribeApplicationPageClientProps) {
  // If user already has wiki role or is admin, show approved status
  if (wikiRole || isAdmin) {
    return (
      <div className="min-h-screen py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <BackLink />
          <ApprovedStatus
            username={username}
            displayName={displayName}
            wikiRole={wikiRole}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackLink />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
            {/* Animated rings */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-amber-500/30"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border border-amber-500/20"
              animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/50 flex items-center justify-center">
              <Feather className="w-8 h-8 text-amber-400" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold text-bone mb-2">
            ORDEN DE ESCRIBAS
          </h1>
          <p className="text-bone/50 font-mono text-sm tracking-wide">
            PETICION PARA EL ARCHIVO LEXICANUM
          </p>
        </motion.div>

        {/* Status based content */}
        <AnimatePresence mode="wait">
          {application?.status === 'pending' ? (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PendingStatus applicationDate={application.created_at} />
            </motion.div>
          ) : application?.status === 'rejected' ? (
            <motion.div
              key="rejected"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <RejectedStatus reason={application.reviewer_notes} />
              <ApplicationContent userId={userId} />
            </motion.div>
          ) : (
            <motion.div
              key="application"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ApplicationContent userId={userId} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function BackLink() {
  return (
    <Link
      href="/facciones"
      className="inline-flex items-center gap-2 text-bone/40 hover:text-bone/70 transition-colors mb-8 font-mono text-sm"
    >
      <ArrowLeft className="w-4 h-4" />
      RETORNAR AL ARCHIVO
    </Link>
  )
}

function ApprovedStatus({
  username,
  displayName,
  wikiRole,
  isAdmin
}: {
  username?: string | null
  displayName?: string | null
  wikiRole: WikiRole | null
  isAdmin: boolean
}) {
  const roleLabel = isAdmin ? 'ARCHIVISTA MAYOR' : wikiRole === 'lexicanum' ? 'LEXICANUM' : 'ESCRIBA'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Main approved card */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-void-light/90 to-void/80 border border-amber-500/30">
        {/* Corner decorations - parchment style */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-500/30 rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-amber-500/30 rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-amber-500/30 rounded-bl-xl" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-500/30 rounded-br-xl" />

        {/* Subtle paper texture overlay */}
        <div className="absolute inset-0 opacity-5 bg-[url('/noise.png')] pointer-events-none" />

        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent pointer-events-none" />

        <div className="relative p-8 text-center">
          {/* Success icon with quill */}
          <div className="relative inline-block mb-6">
            <motion.div
              className="w-24 h-24 rounded-full bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(245, 158, 11, 0.2)',
                  '0 0 40px rgba(245, 158, 11, 0.3)',
                  '0 0 20px rgba(245, 158, 11, 0.2)',
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Feather className="w-12 h-12 text-amber-400" />
            </motion.div>

            {/* Seal overlay */}
            <motion.div
              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-blood-red flex items-center justify-center border-2 border-blood-red/80"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle2 className="w-5 h-5 text-bone" />
            </motion.div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-bone mb-2">
            {roleLabel} DEL LEXICANUM
          </h1>
          <p className="text-bone/60 font-body mb-6 max-w-md mx-auto">
            Tu pluma ha sido bendecida por el Archivista Mayor. Tienes permiso para
            inscribir conocimiento en los sagrados registros del Archivo Imperial.
          </p>

          {/* Role badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-mono">
            <BookOpen className="w-4 h-4" />
            ACCESO CONCEDIDO AL LEXICANUM
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Go to wiki */}
        <Link
          href="/wiki"
          className="group flex items-center gap-4 p-4 rounded-xl bg-void-light/60 border border-amber-500/20 hover:border-amber-500/50 transition-all"
        >
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
            <PenTool className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-bone group-hover:text-amber-400 transition-colors">
              Crear Articulo
            </h3>
            <p className="text-xs text-bone/40 font-mono">
              Comenzar a escribir
            </p>
          </div>
          <ExternalLink className="w-4 h-4 text-bone/30 group-hover:text-amber-400/60 transition-colors" />
        </Link>

        {/* Browse factions */}
        <Link
          href="/facciones"
          className="group flex items-center gap-4 p-4 rounded-xl bg-void-light/60 border border-amber-500/20 hover:border-amber-500/50 transition-all"
        >
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
            <Library className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-bone group-hover:text-amber-400 transition-colors">
              Explorar Archivo
            </h3>
            <p className="text-xs text-bone/40 font-mono">
              Ver facciones
            </p>
          </div>
          <ExternalLink className="w-4 h-4 text-bone/30 group-hover:text-amber-400/60 transition-colors" />
        </Link>
      </div>
    </motion.div>
  )
}

function PendingStatus({ applicationDate }: { applicationDate?: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-void-light/90 to-void/80 border border-amber-500/30">
      {/* Corner decorations */}
      <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-amber-500/40" />
      <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-amber-500/40" />
      <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-amber-500/40" />
      <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-amber-500/40" />

      <div className="relative p-8 text-center">
        <motion.div
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center"
          animate={{
            boxShadow: [
              '0 0 20px rgba(245, 158, 11, 0.2)',
              '0 0 40px rgba(245, 158, 11, 0.3)',
              '0 0 20px rgba(245, 158, 11, 0.2)',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Clock className="w-10 h-10 text-amber-400" />
        </motion.div>

        <h2 className="text-xl font-display font-bold text-bone mb-3">
          Peticion en Revision
        </h2>
        <p className="text-bone/60 mb-6 max-w-md mx-auto">
          Tu solicitud ha sido recibida por el Archivista Mayor. Un Lexicanum senior
          revisara tu expediente y determinara si eres digno de portar la pluma sagrada.
        </p>

        {applicationDate && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-void/50 border border-void-light text-bone/50 text-xs font-mono">
            <FileText className="w-4 h-4" />
            REGISTRADA: {new Date(applicationDate).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  )
}

function RejectedStatus({ reason }: { reason?: string | null }) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-void-light/90 to-void/80 border border-blood-red/30">
      <div className="p-6 flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-blood-red/20 border border-blood-red/30 flex items-center justify-center flex-shrink-0">
          <XCircle className="w-6 h-6 text-blood-red" />
        </div>
        <div>
          <h2 className="text-lg font-display font-bold text-bone mb-1">
            Peticion Anterior Denegada
          </h2>
          <p className="text-bone/60 text-sm font-body">
            {reason || 'El Archivista Mayor ha determinado que aun no estas preparado para portar la pluma. Puedes presentar una nueva peticion demostrando mayor conocimiento del lore.'}
          </p>
        </div>
      </div>
    </div>
  )
}

function ApplicationContent({ userId }: { userId: string }) {
  return (
    <div className="space-y-6">
      {/* Benefits */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-void-light/90 to-void/80 border border-amber-500/20">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-semibold text-bone">
              PRIVILEGIOS DEL ESCRIBA
            </h3>
          </div>

          <ul className="space-y-3">
            {[
              { icon: PenTool, text: 'Crear y editar articulos en el Archivo del Lexicanum' },
              { icon: BookOpen, text: 'Acceso a borradores y articulos no publicados' },
              { icon: Feather, text: 'Insignia de Lexicanum Scribe en tu perfil' },
              { icon: Library, text: 'Contribuir al conocimiento colectivo del Imperium' },
              { icon: Scroll, text: 'Tu nombre inscrito como autor en cada articulo' }
            ].map((benefit, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3"
              >
                <benefit.icon className="w-5 h-5 text-amber-400/70 flex-shrink-0 mt-0.5" />
                <span className="text-bone/70 text-sm">{benefit.text}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {/* Application form */}
      <ScribeApplicationForm userId={userId} />
    </div>
  )
}

function ScribeApplicationForm({ userId }: { userId: string }) {
  const [motivation, setMotivation] = useState('')
  const [experience, setExperience] = useState('')
  const [sampleTopic, setSampleTopic] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isValid = motivation.trim().length >= 50

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/wiki/scribe-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motivation: motivation.trim(),
          experience: experience.trim() || null,
          sample_topic: sampleTopic.trim() || null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al enviar la solicitud')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-b from-void-light/90 to-void/80 border border-emerald-500/30"
      >
        <div className="p-8 text-center">
          <motion.div
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Send className="w-8 h-8 text-emerald-400" />
          </motion.div>
          <h3 className="text-xl font-display font-bold text-bone mb-2">
            Peticion Enviada
          </h3>
          <p className="text-bone/60 text-sm">
            Tu solicitud ha sido registrada en el Archivo. El Archivista Mayor
            revisara tu expediente y te notificara el veredicto.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-void-light/90 to-void/80 border border-amber-500/20">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Scroll className="w-5 h-5 text-amber-400" />
          <h3 className="font-display font-semibold text-bone">
            FORMULARIO DE PETICION
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Motivation (required) */}
          <div>
            <label className="block text-sm font-mono text-bone/70 mb-2">
              ¿Por que deseas unirte a la Orden de Escribas? *
            </label>
            <textarea
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Describe tu motivacion para contribuir al Archivo del Lexicanum..."
              className="w-full h-32 px-4 py-3 bg-void/50 border border-bone/10 rounded-lg text-bone placeholder-bone/30 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 resize-none"
              required
              minLength={50}
            />
            <p className="text-xs text-bone/40 mt-1 font-mono">
              Minimo 50 caracteres ({motivation.length}/50)
            </p>
          </div>

          {/* Experience (optional) */}
          <div>
            <label className="block text-sm font-mono text-bone/70 mb-2">
              Experiencia con el lore de Warhammer 40K (opcional)
            </label>
            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Libros leidos, ejercitos coleccionados, tiempo en el hobby..."
              className="w-full h-24 px-4 py-3 bg-void/50 border border-bone/10 rounded-lg text-bone placeholder-bone/30 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 resize-none"
            />
          </div>

          {/* Sample topic (optional) */}
          <div>
            <label className="block text-sm font-mono text-bone/70 mb-2">
              ¿Sobre que te gustaria escribir primero? (opcional)
            </label>
            <input
              type="text"
              value={sampleTopic}
              onChange={(e) => setSampleTopic(e.target.value)}
              placeholder="Ej: La Herejia de Horus, Los Primarcas, Los Tiranidos..."
              className="w-full px-4 py-3 bg-void/50 border border-bone/10 rounded-lg text-bone placeholder-bone/30 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blood-red/10 border border-blood-red/30 text-blood-red text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full py-3 px-6 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:from-bone/10 disabled:to-bone/10 disabled:text-bone/30 text-void font-display font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-void/30 border-t-void rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Enviando...
              </>
            ) : (
              <>
                <Feather className="w-5 h-5" />
                Enviar Peticion
              </>
            )}
          </button>

          <p className="text-xs text-bone/40 text-center font-mono">
            El Archivista Mayor revisara tu peticion en los proximos dias
          </p>
        </form>
      </div>
    </div>
  )
}
