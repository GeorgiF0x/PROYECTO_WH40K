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
  Send,
  Crosshair,
} from 'lucide-react'
import {
  WikiPageBackground,
  FloatingParticles,
  GothicCorners,
  ImperialDivider,
  SectionLabel,
} from '@/components/wiki/WikiDecorations'
import type { WikiRole, ScribeApplication } from '@/lib/supabase/wiki.types'

interface ScribeApplicationPageClientProps {
  userId: string
  username?: string | null
  displayName?: string | null
  wikiRole: WikiRole | null
  isAdmin: boolean
  application?: ScribeApplication | null
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100 } },
}

export function ScribeApplicationPageClient({
  userId,
  username,
  displayName,
  wikiRole,
  isAdmin,
  application,
}: ScribeApplicationPageClientProps) {
  if (wikiRole || isAdmin) {
    return (
      <div className="relative min-h-screen py-8 sm:py-12">
        <WikiPageBackground />
        <FloatingParticles />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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
    <div className="relative min-h-screen py-8 sm:py-12">
      <WikiPageBackground />
      <FloatingParticles />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackLink />

        {/* ── Hero Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl mb-10 p-8 sm:p-10"
          style={{
            background: 'linear-gradient(180deg, rgba(201,162,39,0.08) 0%, rgba(3,3,8,0.6) 100%)',
            border: '1px solid rgba(201,162,39,0.15)',
          }}
        >
          <GothicCorners className="text-imperial-gold/30" size={50} />

          {/* Ruled manuscript lines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, rgba(201,162,39,0.5) 0px, rgba(201,162,39,0.5) 1px, transparent 1px, transparent 28px)',
              backgroundPosition: '0 20px',
            }}
          />

          {/* Radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,162,39,0.08)_0%,transparent_70%)] pointer-events-none" />

          <div className="relative text-center">
            {/* Animated quill icon */}
            <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-amber-500/30"
                animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.15, 0.4] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-2 rounded-full border border-amber-500/20"
                animate={{ scale: [1.1, 1, 1.1], opacity: [0.25, 0.45, 0.25] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              />
              <motion.div
                className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/50 flex items-center justify-center"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(245,158,11,0.15)',
                    '0 0 40px rgba(245,158,11,0.25)',
                    '0 0 20px rgba(245,158,11,0.15)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Feather className="w-10 h-10 text-amber-400" />
              </motion.div>
            </div>

            <SectionLabel icon={Crosshair} className="justify-center mb-3">
              PETICION IMPERIAL // ARCHIVO LEXICANUM
            </SectionLabel>

            <h1 className="text-3xl sm:text-4xl font-display font-bold text-bone mb-3 tracking-wide">
              ORDEN DE ESCRIBAS
            </h1>
            <p className="text-bone/50 font-mono text-sm tracking-wider max-w-md mx-auto">
              PETICION PARA EL ARCHIVO LEXICANUM
            </p>
          </div>
        </motion.div>

        <ImperialDivider className="mb-8" />

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
      className="group inline-flex items-center gap-2 text-bone/40 hover:text-bone/70 transition-colors mb-8 font-mono text-sm"
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      RETORNAR AL ARCHIVO
    </Link>
  )
}

function ApprovedStatus({
  username,
  displayName,
  wikiRole,
  isAdmin,
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-void-light/90 to-void/80 border border-amber-500/30">
        <GothicCorners className="text-amber-500/30" size={44} />

        {/* Top accent glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

        {/* Parchment texture */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent pointer-events-none" />

        <div className="relative p-8 sm:p-10 text-center">
          {/* Success icon with quill */}
          <div className="relative inline-block mb-6">
            <motion.div
              className="w-24 h-24 rounded-full bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(245, 158, 11, 0.2)',
                  '0 0 40px rgba(245, 158, 11, 0.3)',
                  '0 0 20px rgba(245, 158, 11, 0.2)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Feather className="w-12 h-12 text-amber-400" />
            </motion.div>

            <motion.div
              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-blood-red flex items-center justify-center border-2 border-blood-red/80"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle2 className="w-5 h-5 text-bone" />
            </motion.div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold text-bone mb-2">
            {roleLabel} DEL LEXICANUM
          </h1>
          <p className="text-bone/60 font-body mb-6 max-w-md mx-auto">
            Tu pluma ha sido bendecida por el Archivista Mayor. Tienes permiso para
            inscribir conocimiento en los sagrados registros del Archivo Imperial.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-mono">
            <BookOpen className="w-4 h-4" />
            ACCESO CONCEDIDO AL LEXICANUM
          </div>
        </div>
      </div>

      <ImperialDivider />

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Link
            href="/wiki-panel"
            className="group flex items-center gap-4 p-5 rounded-xl bg-void-light/60 border border-amber-500/20 hover:border-amber-500/50 transition-all relative overflow-hidden"
          >
            <GothicCorners className="text-amber-500/20 group-hover:text-amber-500/40 transition-colors" size={24} />
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
        </motion.div>

        <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Link
            href="/facciones"
            className="group flex items-center gap-4 p-5 rounded-xl bg-void-light/60 border border-amber-500/20 hover:border-amber-500/50 transition-all relative overflow-hidden"
          >
            <GothicCorners className="text-amber-500/20 group-hover:text-amber-500/40 transition-colors" size={24} />
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
        </motion.div>
      </div>
    </motion.div>
  )
}

function PendingStatus({ applicationDate }: { applicationDate?: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-void-light/90 to-void/80 border border-amber-500/30">
      <GothicCorners className="text-amber-500/25" size={44} />

      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      <div className="relative p-8 sm:p-10 text-center">
        <motion.div
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center"
          animate={{
            boxShadow: [
              '0 0 20px rgba(245, 158, 11, 0.2)',
              '0 0 40px rgba(245, 158, 11, 0.3)',
              '0 0 20px rgba(245, 158, 11, 0.2)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Clock className="w-10 h-10 text-amber-400" />
        </motion.div>

        <h2 className="text-xl sm:text-2xl font-display font-bold text-bone mb-3">
          Peticion en Revision
        </h2>
        <p className="text-bone/60 mb-6 max-w-md mx-auto font-body">
          Tu solicitud ha sido recibida por el Archivista Mayor. Un Lexicanum senior
          revisara tu expediente y determinara si eres digno de portar la pluma sagrada.
        </p>

        {applicationDate && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-void/50 border border-void-light text-bone/50 text-xs font-mono">
            <FileText className="w-4 h-4" />
            REGISTRADA: {new Date(applicationDate).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  )
}

function RejectedStatus({ reason }: { reason?: string | null }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-void-light/90 to-void/80 border border-blood-red/30">
      <GothicCorners className="text-blood-red/25" size={36} />

      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blood-red/40 to-transparent" />

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
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Benefits */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-void-light/90 to-void/80 border border-amber-500/20"
      >
        <GothicCorners className="text-amber-500/25" size={36} />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

        <div className="relative p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-semibold text-bone tracking-wide">
              PRIVILEGIOS DEL ESCRIBA
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: PenTool, text: 'Crear y editar articulos en el Archivo del Lexicanum' },
              { icon: BookOpen, text: 'Acceso a borradores y articulos no publicados' },
              { icon: Feather, text: 'Insignia de Lexicanum Scribe en tu perfil' },
              { icon: Library, text: 'Contribuir al conocimiento colectivo del Imperium' },
              { icon: Scroll, text: 'Tu nombre inscrito como autor en cada articulo' },
              { icon: Shield, text: 'Participar en la revision de contribuciones' },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg border border-amber-500/10 bg-amber-500/[0.02] hover:border-amber-500/25 transition-colors"
              >
                <benefit.icon className="w-5 h-5 text-amber-400/70 flex-shrink-0 mt-0.5" />
                <span className="text-bone/70 text-sm">{benefit.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <ImperialDivider />

      {/* Application form */}
      <motion.div variants={itemVariants}>
        <ScribeApplicationForm userId={userId} />
      </motion.div>
    </motion.div>
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
          sample_topic: sampleTopic.trim() || null,
        }),
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
        className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-void-light/90 to-void/80 border border-emerald-500/30"
      >
        <GothicCorners className="text-emerald-500/30" size={36} />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        <div className="p-8 sm:p-10 text-center">
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
          <p className="text-bone/60 text-sm font-body">
            Tu solicitud ha sido registrada en el Archivo. El Archivista Mayor
            revisara tu expediente y te notificara el veredicto.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-void-light/90 to-void/80 border border-amber-500/20">
      <GothicCorners className="text-amber-500/25" size={36} />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      {/* Subtle ruled lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(201,162,39,0.5) 0px, rgba(201,162,39,0.5) 1px, transparent 1px, transparent 32px)',
          backgroundPosition: '0 24px',
        }}
      />

      <div className="relative p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Scroll className="w-5 h-5 text-amber-400" />
          <h3 className="font-display font-semibold text-bone tracking-wide">
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
              className="w-full h-32 px-4 py-3 bg-void/50 border border-bone/10 rounded-lg text-bone placeholder-bone/30 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 resize-none transition-all"
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
              className="w-full h-24 px-4 py-3 bg-void/50 border border-bone/10 rounded-lg text-bone placeholder-bone/30 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 resize-none transition-all"
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
              className="w-full px-4 py-3 bg-void/50 border border-bone/10 rounded-lg text-bone placeholder-bone/30 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-blood-red/10 border border-blood-red/30 text-blood-red text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:from-bone/10 disabled:to-bone/10 disabled:text-bone/30 text-void font-display font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]"
            whileHover={isValid ? { scale: 1.01 } : undefined}
            whileTap={isValid ? { scale: 0.98 } : undefined}
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
          </motion.button>

          <p className="text-xs text-bone/40 text-center font-mono">
            El Archivista Mayor revisara tu peticion en los proximos dias
          </p>
        </form>
      </div>
    </div>
  )
}
