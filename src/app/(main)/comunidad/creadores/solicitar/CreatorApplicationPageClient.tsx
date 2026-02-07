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
  Feather
} from 'lucide-react'
import {
  ServitorBootSequence,
  DataslateContainer,
  CreatorEligibility,
  CreatorApplicationForm,
  CreatorBadge
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
  rejectionReason
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
  if (pageState === 'boot' && !hasSeenBoot && creatorStatus !== 'pending' && creatorStatus !== 'approved') {
    return <ServitorBootSequence onComplete={handleBootComplete} />
  }

  // Show approved status page
  if (creatorStatus === 'approved') {
    return (
      <div className="min-h-screen py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/comunidad/creadores"
            className="inline-flex items-center gap-2 text-bone/40 hover:text-bone/70 transition-colors mb-8 font-mono text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/comunidad/creadores"
          className="inline-flex items-center gap-2 text-bone/40 hover:text-bone/70 transition-colors mb-8 font-mono text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          RETORNAR AL DIRECTORIO
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
            {/* Animated rings — CSS animation to avoid JS RAF loops */}
            <div className="absolute inset-0 rounded-full border-2 border-imperial-gold/30 animate-[factionPulse_3s_ease-in-out_infinite]" />
            <div className="absolute inset-2 rounded-full border border-imperial-gold/20 animate-[factionPulse_2.5s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }} />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-imperial-gold/20 to-imperial-gold/5 border border-imperial-gold/50 flex items-center justify-center">
              <Scroll className="w-8 h-8 text-imperial-gold" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold text-bone mb-2">
            PETICION AL ADMINISTRATUM
          </h1>
          <p className="text-bone/50 font-mono text-sm tracking-wide">
            PROTOCOLO DE VERIFICACION DE CREADOR
          </p>
        </motion.div>

        {/* Status based content — min-height prevents CLS during AnimatePresence transitions */}
        <div style={{ minHeight: '400px' }}>
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
                <ApplicationContent userId={userId} isEligible={isEligible} onEligible={handleEligible} />
              </motion.div>
            ) : (
              <motion.div
                key="application"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ApplicationContent userId={userId} isEligible={isEligible} onEligible={handleEligible} />
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
  verifiedAt
}: {
  username?: string | null
  displayName?: string | null
  creatorType?: CreatorType | null
  verifiedAt?: string | null
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Main approved card */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-void-light/90 to-void/80 border border-emerald-500/30">
        {/* Corner decorations */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-emerald-500/40" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-emerald-500/40" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-emerald-500/40" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-emerald-500/40" />

        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none" />

        <div className="relative p-8 text-center">
          {/* Success icon with seal */}
          <div className="relative inline-block mb-6">
            <div
              className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center animate-[approvedGlow_3s_ease-in-out_infinite]"
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </div>

            {/* Purity seal overlay */}
            <motion.div
              className="absolute -top-2 -right-2"
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
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-bone mb-2">
            YA ERES REMEMORIZADOR
          </h1>
          <p className="text-bone/60 font-body mb-6 max-w-md mx-auto">
            Tu expediente ha sido aprobado por el Administratum. Portas el sello
            de verificacion que te acredita como cronista del Imperium.
          </p>

          {/* Creator badge */}
          {creatorType && (
            <div className="flex justify-center mb-6">
              <CreatorBadge type={creatorType} variant="title-ribbon" />
            </div>
          )}

          {/* Verification date */}
          {verifiedAt && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-void/50 border border-emerald-500/20 text-emerald-400/80 text-xs font-mono">
              <Shield className="w-4 h-4" />
              VERIFICADO: {new Date(verifiedAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* View profile */}
        <Link
          href={username ? `/usuarios/${username}` : '/perfil'}
          className="group flex items-center gap-4 p-4 rounded-xl bg-void-light/60 border border-imperial-gold/20 hover:border-imperial-gold/50 transition-all"
        >
          <div className="w-12 h-12 rounded-lg bg-imperial-gold/10 border border-imperial-gold/30 flex items-center justify-center group-hover:bg-imperial-gold/20 transition-colors">
            <User className="w-6 h-6 text-imperial-gold" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-bone group-hover:text-imperial-gold transition-colors">
              Ver mi perfil
            </h3>
            <p className="text-xs text-bone/40 font-mono">
              {displayName || username || 'Tu expediente'}
            </p>
          </div>
          <ExternalLink className="w-4 h-4 text-bone/30 group-hover:text-imperial-gold/60 transition-colors" />
        </Link>

        {/* View directory */}
        <Link
          href="/comunidad/creadores"
          className="group flex items-center gap-4 p-4 rounded-xl bg-void-light/60 border border-imperial-gold/20 hover:border-imperial-gold/50 transition-all"
        >
          <div className="w-12 h-12 rounded-lg bg-imperial-gold/10 border border-imperial-gold/30 flex items-center justify-center group-hover:bg-imperial-gold/20 transition-colors">
            <Scroll className="w-6 h-6 text-imperial-gold" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-bone group-hover:text-imperial-gold transition-colors">
              Directorio de Creadores
            </h3>
            <p className="text-xs text-bone/40 font-mono">
              Orden de Rememoradores
            </p>
          </div>
          <ExternalLink className="w-4 h-4 text-bone/30 group-hover:text-imperial-gold/60 transition-colors" />
        </Link>
      </div>

      {/* Help section */}
      <div className="relative p-5 rounded-xl bg-void-light/40 border border-bone/10">
        {/* Decorative feather */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="px-3 py-1 bg-void-light rounded-full border border-bone/10">
            <Feather className="w-4 h-4 text-imperial-gold/40" />
          </div>
        </div>

        <div className="text-center pt-2">
          <h3 className="text-sm font-display font-semibold text-bone/70 mb-2">
            ¿Necesitas modificar tu estado de creador?
          </h3>
          <p className="text-xs text-bone/40 font-body mb-3">
            Si deseas actualizar tu tipo de creador, servicios, o darte de baja del programa,
            contacta con el Administratum.
          </p>
          <a
            href="mailto:soporte@grimdarklegion.com?subject=Consulta%20Programa%20Creadores"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-void/50 border border-bone/10 text-bone/50 hover:text-bone/80 hover:border-bone/30 transition-all text-sm font-mono"
          >
            <Mail className="w-4 h-4" />
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
      <div className="text-center py-8">
        <div
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center animate-[pendingGlow_2s_ease-in-out_infinite]"
        >
          <Clock className="w-10 h-10 text-amber-400" />
        </div>

        <h2 className="text-xl font-display font-bold text-bone mb-3">
          Solicitud en Revision
        </h2>
        <p className="text-bone/60 mb-6 max-w-md mx-auto">
          Tu peticion ha sido recibida por el Administratum. Un Inquisidor
          revisara tu expediente y te notificara el veredicto via Vox.
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
    </DataslateContainer>
  )
}

function RejectedStatus({ reason }: { reason?: string | null }) {
  return (
    <DataslateContainer variant="warning">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-blood-red/20 border border-blood-red/30 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-6 h-6 text-blood-red" />
        </div>
        <div>
          <h2 className="text-lg font-display font-bold text-bone mb-1">
            Peticion Anterior Denegada
          </h2>
          <p className="text-bone/60 text-sm font-body">
            {reason || 'El Inquisitorium ha determinado que no cumples los requisitos actuales. Puedes presentar una nueva peticion cuando hayas rectificado las deficiencias.'}
          </p>
        </div>
      </div>
    </DataslateContainer>
  )
}

function ApplicationContent({ userId, isEligible, onEligible }: { userId: string, isEligible: boolean, onEligible: () => void }) {
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
            { icon: FileText, text: 'Indicador de "Acepta encargos" si ofreces servicios' }
          ].map((benefit, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3"
            >
              <benefit.icon className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="text-bone/70 text-sm">{benefit.text}</span>
            </motion.li>
          ))}
        </ul>
      </DataslateContainer>

      {/* Eligibility check */}
      <DataslateContainer
        title="VERIFICACION DE REQUISITOS"
        subtitle="Estado del expediente"
      >
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
