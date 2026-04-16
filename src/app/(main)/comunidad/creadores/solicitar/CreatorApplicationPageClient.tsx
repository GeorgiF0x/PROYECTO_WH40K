'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle2,
  Scroll,
  Shield,
  Sparkles,
  FileText,
  ExternalLink,
  User,
  Mail,
  Feather,
} from 'lucide-react'
import {
  ServitorBootSequence,
  DataslateContainer,
  CreatorEligibility,
  CreatorApplicationForm,
  CreatorBadge,
} from '@/components/creator'
import type { CreatorType } from '@/lib/types/database.types'

interface CreatorApplicationPageClientProps {
  userId: string
  username?: string | null
  displayName?: string | null
  creatorStatus: string
  creatorType?: CreatorType | null
  verifiedAt?: string | null
  applicationDate?: string | null
  rejectionReason?: string | null
}

type PageState = 'boot' | 'form'

export function CreatorApplicationPageClient({
  userId,
  username,
  displayName,
  creatorStatus,
  creatorType,
  verifiedAt,
  applicationDate,
  rejectionReason,
}: CreatorApplicationPageClientProps) {
  const [pageState, setPageState] = useState<PageState>('boot')
  const [hasSeenBoot, setHasSeenBoot] = useState(false)
  const [isEligible, setIsEligible] = useState(false)

  const handleEligible = useCallback(() => {
    setIsEligible(true)
  }, [])

  // Check if user has seen boot sequence before (in this session)
  useEffect(() => {
    const seen = sessionStorage.getItem('creator-boot-seen')
    if (seen) {
      setHasSeenBoot(true)
      setPageState('form')
    }
  }, [])

  const handleBootComplete = () => {
    sessionStorage.setItem('creator-boot-seen', 'true')
    setHasSeenBoot(true)
    setPageState('form')
  }

  // Show boot sequence for first-time visitors (not for approved or pending)
  if (
    pageState === 'boot' &&
    !hasSeenBoot &&
    creatorStatus !== 'pending' &&
    creatorStatus !== 'approved'
  ) {
    return <ServitorBootSequence onComplete={handleBootComplete} />
  }

  // Show approved status page
  if (creatorStatus === 'approved') {
    return (
      <div className="min-h-screen py-8 sm:py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/comunidad/creadores"
            className="mb-8 inline-flex items-center gap-2 font-mono text-sm text-bone/40 transition-colors hover:text-bone/70"
          >
            <ArrowLeft className="h-4 w-4" />
            RETORNAR AL DIRECTORIO
          </Link>

          <ApprovedStatus
            username={username}
            displayName={displayName}
            creatorType={creatorType}
            verifiedAt={verifiedAt}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/comunidad/creadores"
          className="mb-8 inline-flex items-center gap-2 font-mono text-sm text-bone/40 transition-colors hover:text-bone/70"
        >
          <ArrowLeft className="h-4 w-4" />
          RETORNAR AL DIRECTORIO
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 text-center">
          <div className="relative mb-4 inline-flex h-20 w-20 items-center justify-center">
            {/* Animated rings — CSS animation to avoid JS RAF loops */}
            <div className="absolute inset-0 animate-[factionPulse_3s_ease-in-out_infinite] rounded-full border-2 border-imperial-gold/30" />
            <div
              className="absolute inset-2 animate-[factionPulse_2.5s_ease-in-out_infinite] rounded-full border border-imperial-gold/20"
              style={{ animationDelay: '0.5s' }}
            />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-imperial-gold/50 bg-gradient-to-br from-imperial-gold/20 to-imperial-gold/5">
              <Scroll className="h-8 w-8 text-imperial-gold" />
            </div>
          </div>

          <h1 className="mb-2 font-display text-2xl font-bold text-bone sm:text-3xl">
            PETICION AL ADMINISTRATUM
          </h1>
          <p className="font-mono text-sm tracking-wide text-bone/50">
            PROTOCOLO DE VERIFICACION DE CREADOR
          </p>
        </motion.div>

        {/* Status based content — min-height prevents CLS during AnimatePresence transitions */}
        <div style={{ minHeight: '600px' }}>
          <AnimatePresence mode="wait">
            {creatorStatus === 'pending' ? (
              <motion.div
                key="pending"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <PendingStatus applicationDate={applicationDate} />
              </motion.div>
            ) : creatorStatus === 'rejected' ? (
              <motion.div
                key="rejected"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <RejectedStatus reason={rejectionReason} />
                <ApplicationContent
                  userId={userId}
                  isEligible={isEligible}
                  onEligible={handleEligible}
                />
              </motion.div>
            ) : (
              <motion.div
                key="application"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ApplicationContent
                  userId={userId}
                  isEligible={isEligible}
                  onEligible={handleEligible}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function ApprovedStatus({
  username,
  displayName,
  creatorType,
  verifiedAt,
}: {
  username?: string | null
  displayName?: string | null
  creatorType?: CreatorType | null
  verifiedAt?: string | null
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Main approved card */}
      <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-b from-void-light/90 to-void/80">
        {/* Corner decorations */}
        <div className="absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2 border-emerald-500/40" />
        <div className="absolute right-3 top-3 h-6 w-6 border-r-2 border-t-2 border-emerald-500/40" />
        <div className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-emerald-500/40" />
        <div className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-emerald-500/40" />

        {/* Glow effect */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent" />

        <div className="relative p-8 text-center">
          {/* Success icon with seal */}
          <div className="relative mb-6 inline-block">
            <div className="flex h-24 w-24 animate-[approvedGlow_3s_ease-in-out_infinite] items-center justify-center rounded-full border-2 border-emerald-500/40 bg-emerald-500/10">
              <CheckCircle2 className="h-12 w-12 text-emerald-400" />
            </div>

            {/* Purity seal overlay */}
            <motion.div
              className="absolute -right-2 -top-2"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 8 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
              <Image
                src="/purity-seal-large.svg"
                alt="Sello de Pureza"
                width={48}
                height={48}
                className="drop-shadow-lg"
              />
            </motion.div>
          </div>

          {/* Title */}
          <h1 className="mb-2 font-display text-2xl font-bold text-bone sm:text-3xl">
            YA ERES REMEMORIZADOR
          </h1>
          <p className="mx-auto mb-6 max-w-md font-body text-bone/60">
            Tu expediente ha sido aprobado por el Administratum. Portas el sello de verificacion que
            te acredita como cronista del Imperium.
          </p>

          {/* Creator badge */}
          {creatorType && (
            <div className="mb-6 flex justify-center">
              <CreatorBadge type={creatorType} variant="title-ribbon" />
            </div>
          )}

          {/* Verification date */}
          {verifiedAt && (
            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-void/50 px-4 py-2 font-mono text-xs text-emerald-400/80">
              <Shield className="h-4 w-4" />
              VERIFICADO:{' '}
              {new Date(verifiedAt)
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

      {/* Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* View profile */}
        <Link
          href={username ? `/usuarios/${username}` : '/perfil'}
          className="group flex items-center gap-4 rounded-xl border border-imperial-gold/20 bg-void-light/60 p-4 transition-all hover:border-imperial-gold/50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-imperial-gold/30 bg-imperial-gold/10 transition-colors group-hover:bg-imperial-gold/20">
            <User className="h-6 w-6 text-imperial-gold" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-bone transition-colors group-hover:text-imperial-gold">
              Ver mi perfil
            </h3>
            <p className="font-mono text-xs text-bone/40">
              {displayName || username || 'Tu expediente'}
            </p>
          </div>
          <ExternalLink className="h-4 w-4 text-bone/30 transition-colors group-hover:text-imperial-gold/60" />
        </Link>

        {/* View directory */}
        <Link
          href="/comunidad/creadores"
          className="group flex items-center gap-4 rounded-xl border border-imperial-gold/20 bg-void-light/60 p-4 transition-all hover:border-imperial-gold/50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-imperial-gold/30 bg-imperial-gold/10 transition-colors group-hover:bg-imperial-gold/20">
            <Scroll className="h-6 w-6 text-imperial-gold" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-bone transition-colors group-hover:text-imperial-gold">
              Directorio de Creadores
            </h3>
            <p className="font-mono text-xs text-bone/40">Orden de Rememoradores</p>
          </div>
          <ExternalLink className="h-4 w-4 text-bone/30 transition-colors group-hover:text-imperial-gold/60" />
        </Link>
      </div>

      {/* Help section */}
      <div className="relative rounded-xl border border-bone/10 bg-void-light/40 p-5">
        {/* Decorative feather */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="rounded-full border border-bone/10 bg-void-light px-3 py-1">
            <Feather className="h-4 w-4 text-imperial-gold/40" />
          </div>
        </div>

        <div className="pt-2 text-center">
          <h3 className="mb-2 font-display text-sm font-semibold text-bone/70">
            ¿Necesitas modificar tu estado de creador?
          </h3>
          <p className="mb-3 font-body text-xs text-bone/40">
            Si deseas actualizar tu tipo de creador, servicios, o darte de baja del programa,
            contacta con el Administratum.
          </p>
          <a
            href="mailto:soporte@grimdarklegion.com?subject=Consulta%20Programa%20Creadores"
            className="inline-flex items-center gap-2 rounded-lg border border-bone/10 bg-void/50 px-4 py-2 font-mono text-sm text-bone/50 transition-all hover:border-bone/30 hover:text-bone/80"
          >
            <Mail className="h-4 w-4" />
            CONTACTAR ADMINISTRATUM
          </a>
        </div>
      </div>
    </motion.div>
  )
}

function PendingStatus({ applicationDate }: { applicationDate?: string | null }) {
  return (
    <DataslateContainer
      title="PETICION EN PROCESO"
      subtitle="Aguardando revision del Inquisitorium"
      variant="warning"
    >
      <div className="py-8 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 animate-[pendingGlow_2s_ease-in-out_infinite] items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
          <Clock className="h-10 w-10 text-amber-400" />
        </div>

        <h2 className="mb-3 font-display text-xl font-bold text-bone">Solicitud en Revision</h2>
        <p className="mx-auto mb-6 max-w-md text-bone/60">
          Tu peticion ha sido recibida por el Administratum. Un Inquisidor revisara tu expediente y
          te notificara el veredicto via Vox.
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
    </DataslateContainer>
  )
}

function RejectedStatus({ reason }: { reason?: string | null }) {
  return (
    <DataslateContainer variant="warning">
      <div className="flex items-start gap-4">
        <div className="bg-blood-red/20 border-blood-red/30 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border">
          <AlertCircle className="text-blood-red h-6 w-6" />
        </div>
        <div>
          <h2 className="mb-1 font-display text-lg font-bold text-bone">
            Peticion Anterior Denegada
          </h2>
          <p className="font-body text-sm text-bone/60">
            {reason ||
              'El Inquisitorium ha determinado que no cumples los requisitos actuales. Puedes presentar una nueva peticion cuando hayas rectificado las deficiencias.'}
          </p>
        </div>
      </div>
    </DataslateContainer>
  )
}

function ApplicationContent({
  userId,
  isEligible,
  onEligible,
}: {
  userId: string
  isEligible: boolean
  onEligible: () => void
}) {
  return (
    <div className="space-y-6">
      {/* Benefits */}
      <DataslateContainer
        title="PRIVILEGIOS DE CREADOR VERIFICADO"
        subtitle="Bendiciones del Administratum"
      >
        <ul className="space-y-3">
          {[
            { icon: Shield, text: 'Sello de verificacion en tu expediente personal' },
            { icon: Sparkles, text: 'Visibilidad elevada en el Directorio Imperial' },
            { icon: Scroll, text: 'Seccion dedicada para exhibir tus servicios' },
            { icon: CheckCircle2, text: 'Posibilidad de destacar como Creador Ejemplar' },
            { icon: FileText, text: 'Indicador de "Acepta encargos" si ofreces servicios' },
          ].map((benefit, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3"
            >
              <benefit.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
              <span className="text-sm text-bone/70">{benefit.text}</span>
            </motion.li>
          ))}
        </ul>
      </DataslateContainer>

      {/* Eligibility check */}
      <DataslateContainer title="VERIFICACION DE REQUISITOS" subtitle="Estado del expediente">
        <CreatorEligibility userId={userId} onEligible={onEligible} />
      </DataslateContainer>

      {/* Application form */}
      <DataslateContainer
        title="FORMULARIO ADMINISTRATUM"
        subtitle="Peticion de registro como Creador"
        variant="processing"
      >
        <CreatorApplicationForm userId={userId} isEligible={isEligible} />
      </DataslateContainer>
    </div>
  )
}
