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
        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
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

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <BackLink />

        {/* ── Hero Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-10 overflow-hidden rounded-2xl p-8 sm:p-10"
          style={{
            background: 'linear-gradient(180deg, rgba(201,162,39,0.08) 0%, rgba(3,3,8,0.6) 100%)',
            border: '1px solid rgba(201,162,39,0.15)',
          }}
        >
          <GothicCorners className="text-imperial-gold/30" size={50} />

          {/* Ruled manuscript lines */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(201,162,39,0.5) 0px, rgba(201,162,39,0.5) 1px, transparent 1px, transparent 28px)',
              backgroundPosition: '0 20px',
            }}
          />

          {/* Radial glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,162,39,0.08)_0%,transparent_70%)]" />

          <div className="relative text-center">
            {/* Animated quill icon */}
            <div className="relative mb-6 inline-flex h-24 w-24 items-center justify-center">
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
                className="relative flex h-20 w-20 items-center justify-center rounded-full border border-amber-500/50 bg-gradient-to-br from-amber-500/20 to-amber-600/5"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(245,158,11,0.15)',
                    '0 0 40px rgba(245,158,11,0.25)',
                    '0 0 20px rgba(245,158,11,0.15)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Feather className="h-10 w-10 text-amber-400" />
              </motion.div>
            </div>

            <SectionLabel icon={Crosshair} className="mb-3 justify-center">
              PETICION IMPERIAL // ARCHIVO LEXICANUM
            </SectionLabel>

            <h1 className="mb-3 font-display text-3xl font-bold tracking-wide text-bone sm:text-4xl">
              ORDEN DE ESCRIBAS
            </h1>
            <p className="mx-auto max-w-md font-mono text-sm tracking-wider text-bone/50">
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
      className="group mb-8 inline-flex items-center gap-2 font-mono text-sm text-bone/40 transition-colors hover:text-bone/70"
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
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
  const roleLabel = isAdmin
    ? 'ARCHIVISTA MAYOR'
    : wikiRole === 'lexicanum'
      ? 'LEXICANUM'
      : 'ESCRIBA'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Main approved card */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-b from-void-light/90 to-void/80">
        <GothicCorners className="text-amber-500/30" size={44} />

        {/* Top accent glow */}
        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

        {/* Parchment texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent" />

        <div className="relative p-8 text-center sm:p-10">
          {/* Success icon with quill */}
          <div className="relative mb-6 inline-block">
            <motion.div
              className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-amber-500/40 bg-amber-500/10"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(245, 158, 11, 0.2)',
                  '0 0 40px rgba(245, 158, 11, 0.3)',
                  '0 0 20px rgba(245, 158, 11, 0.2)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Feather className="h-12 w-12 text-amber-400" />
            </motion.div>

            <motion.div
              className="bg-blood-red border-blood-red/80 absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full border-2"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle2 className="h-5 w-5 text-bone" />
            </motion.div>
          </div>

          <h1 className="mb-2 font-display text-2xl font-bold text-bone sm:text-3xl">
            {roleLabel} DEL LEXICANUM
          </h1>
          <p className="mx-auto mb-6 max-w-md font-body text-bone/60">
            Tu pluma ha sido bendecida por el Archivista Mayor. Tienes permiso para inscribir
            conocimiento en los sagrados registros del Archivo Imperial.
          </p>

          <div className="inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 font-mono text-sm text-amber-400">
            <BookOpen className="h-4 w-4" />
            ACCESO CONCEDIDO AL LEXICANUM
          </div>
        </div>
      </div>

      <ImperialDivider />

      {/* Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Link
            href="/wiki-panel"
            className="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-amber-500/20 bg-void-light/60 p-5 transition-all hover:border-amber-500/50"
          >
            <GothicCorners
              className="text-amber-500/20 transition-colors group-hover:text-amber-500/40"
              size={24}
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 transition-colors group-hover:bg-amber-500/20">
              <PenTool className="h-6 w-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-bone transition-colors group-hover:text-amber-400">
                Crear Articulo
              </h3>
              <p className="font-mono text-xs text-bone/40">Comenzar a escribir</p>
            </div>
            <ExternalLink className="h-4 w-4 text-bone/30 transition-colors group-hover:text-amber-400/60" />
          </Link>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Link
            href="/facciones"
            className="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-amber-500/20 bg-void-light/60 p-5 transition-all hover:border-amber-500/50"
          >
            <GothicCorners
              className="text-amber-500/20 transition-colors group-hover:text-amber-500/40"
              size={24}
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 transition-colors group-hover:bg-amber-500/20">
              <Library className="h-6 w-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-bone transition-colors group-hover:text-amber-400">
                Explorar Archivo
              </h3>
              <p className="font-mono text-xs text-bone/40">Ver facciones</p>
            </div>
            <ExternalLink className="h-4 w-4 text-bone/30 transition-colors group-hover:text-amber-400/60" />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}

function PendingStatus({ applicationDate }: { applicationDate?: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-b from-void-light/90 to-void/80">
      <GothicCorners className="text-amber-500/25" size={44} />

      {/* Top accent */}
      <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      <div className="relative p-8 text-center sm:p-10">
        <motion.div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10"
          animate={{
            boxShadow: [
              '0 0 20px rgba(245, 158, 11, 0.2)',
              '0 0 40px rgba(245, 158, 11, 0.3)',
              '0 0 20px rgba(245, 158, 11, 0.2)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Clock className="h-10 w-10 text-amber-400" />
        </motion.div>

        <h2 className="mb-3 font-display text-xl font-bold text-bone sm:text-2xl">
          Peticion en Revision
        </h2>
        <p className="mx-auto mb-6 max-w-md font-body text-bone/60">
          Tu solicitud ha sido recibida por el Archivista Mayor. Un Lexicanum senior revisara tu
          expediente y determinara si eres digno de portar la pluma sagrada.
        </p>

        {applicationDate && (
          <div className="inline-flex items-center gap-2 rounded-lg border border-void-light bg-void/50 px-4 py-2 font-mono text-xs text-bone/50">
            <FileText className="h-4 w-4" />
            REGISTRADA:{' '}
            {new Date(applicationDate)
              .toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
              .toUpperCase()}
          </div>
        )}
      </div>
    </div>
  )
}

function RejectedStatus({ reason }: { reason?: string | null }) {
  return (
    <div className="border-blood-red/30 relative overflow-hidden rounded-2xl border bg-gradient-to-b from-void-light/90 to-void/80">
      <GothicCorners className="text-blood-red/25" size={36} />

      <div className="via-blood-red/40 absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent to-transparent" />

      <div className="flex items-start gap-4 p-6">
        <div className="bg-blood-red/20 border-blood-red/30 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border">
          <XCircle className="text-blood-red h-6 w-6" />
        </div>
        <div>
          <h2 className="mb-1 font-display text-lg font-bold text-bone">
            Peticion Anterior Denegada
          </h2>
          <p className="font-body text-sm text-bone/60">
            {reason ||
              'El Archivista Mayor ha determinado que aun no estas preparado para portar la pluma. Puedes presentar una nueva peticion demostrando mayor conocimiento del lore.'}
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
        className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-b from-void-light/90 to-void/80"
      >
        <GothicCorners className="text-amber-500/25" size={36} />
        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

        <div className="relative p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <Shield className="h-5 w-5 text-amber-400" />
            <h3 className="font-display font-semibold tracking-wide text-bone">
              PRIVILEGIOS DEL ESCRIBA
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                className="flex items-start gap-3 rounded-lg border border-amber-500/10 bg-amber-500/[0.02] p-3 transition-colors hover:border-amber-500/25"
              >
                <benefit.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400/70" />
                <span className="text-sm text-bone/70">{benefit.text}</span>
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
        className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-void-light/90 to-void/80"
      >
        <GothicCorners className="text-emerald-500/30" size={36} />
        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        <div className="p-8 text-center sm:p-10">
          <motion.div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Send className="h-8 w-8 text-emerald-400" />
          </motion.div>
          <h3 className="mb-2 font-display text-xl font-bold text-bone">Peticion Enviada</h3>
          <p className="font-body text-sm text-bone/60">
            Tu solicitud ha sido registrada en el Archivo. El Archivista Mayor revisara tu
            expediente y te notificara el veredicto.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-b from-void-light/90 to-void/80">
      <GothicCorners className="text-amber-500/25" size={36} />
      <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      {/* Subtle ruled lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(201,162,39,0.5) 0px, rgba(201,162,39,0.5) 1px, transparent 1px, transparent 32px)',
          backgroundPosition: '0 24px',
        }}
      />

      <div className="relative p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <Scroll className="h-5 w-5 text-amber-400" />
          <h3 className="font-display font-semibold tracking-wide text-bone">
            FORMULARIO DE PETICION
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Motivation (required) */}
          <div>
            <label className="mb-2 block font-mono text-sm text-bone/70">
              ¿Por que deseas unirte a la Orden de Escribas? *
            </label>
            <textarea
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Describe tu motivacion para contribuir al Archivo del Lexicanum..."
              className="h-32 w-full resize-none rounded-lg border border-bone/10 bg-void/50 px-4 py-3 text-bone placeholder-bone/30 transition-all focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              required
              minLength={50}
            />
            <p className="mt-1 font-mono text-xs text-bone/40">
              Minimo 50 caracteres ({motivation.length}/50)
            </p>
          </div>

          {/* Experience (optional) */}
          <div>
            <label className="mb-2 block font-mono text-sm text-bone/70">
              Experiencia con el lore de Warhammer 40K (opcional)
            </label>
            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Libros leidos, ejercitos coleccionados, tiempo en el hobby..."
              className="h-24 w-full resize-none rounded-lg border border-bone/10 bg-void/50 px-4 py-3 text-bone placeholder-bone/30 transition-all focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Sample topic (optional) */}
          <div>
            <label className="mb-2 block font-mono text-sm text-bone/70">
              ¿Sobre que te gustaria escribir primero? (opcional)
            </label>
            <input
              type="text"
              value={sampleTopic}
              onChange={(e) => setSampleTopic(e.target.value)}
              placeholder="Ej: La Herejia de Horus, Los Primarcas, Los Tiranidos..."
              className="w-full rounded-lg border border-bone/10 bg-void/50 px-4 py-3 text-bone placeholder-bone/30 transition-all focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blood-red/10 border-blood-red/30 text-blood-red flex items-center gap-2 rounded-lg border p-3 text-sm"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-3.5 font-display font-semibold text-void shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-all hover:from-amber-500 hover:to-amber-600 hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] disabled:from-bone/10 disabled:to-bone/10 disabled:text-bone/30"
            whileHover={isValid ? { scale: 1.01 } : undefined}
            whileTap={isValid ? { scale: 0.98 } : undefined}
          >
            {isSubmitting ? (
              <>
                <motion.div
                  className="h-5 w-5 rounded-full border-2 border-void/30 border-t-void"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Enviando...
              </>
            ) : (
              <>
                <Feather className="h-5 w-5" />
                Enviar Peticion
              </>
            )}
          </motion.button>

          <p className="text-center font-mono text-xs text-bone/40">
            El Archivista Mayor revisara tu peticion en los proximos dias
          </p>
        </form>
      </div>
    </div>
  )
}
