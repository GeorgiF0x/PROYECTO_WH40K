'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  CheckCircle2,
  XCircle,
  User,
  FileText,
  Share2,
  Loader2,
  ArrowRight,
  LinkIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface EligibilityCheck {
  has_avatar: boolean
  has_bio: boolean
  has_social: boolean
}

interface EligibilityResult {
  eligible: boolean
  checks: EligibilityCheck
}

interface CreatorEligibilityProps {
  userId: string
  onEligible?: () => void
}

const checkItems = [
  {
    key: 'has_avatar' as const,
    label: 'Avatar de perfil',
    description: 'Sube una foto de perfil',
    icon: User,
    link: '/perfil'
  },
  {
    key: 'has_bio' as const,
    label: 'Biografía completa',
    description: 'Escribe al menos 10 caracteres',
    icon: FileText,
    link: '/perfil'
  },
  {
    key: 'has_social' as const,
    label: 'Red social vinculada',
    description: 'Conecta al menos una red social',
    icon: Share2,
    link: '/perfil'
  }
]

export function CreatorEligibility({ userId, onEligible }: CreatorEligibilityProps) {
  const [loading, setLoading] = useState(true)
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkEligibility() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.rpc('check_creator_eligibility', {
          user_uuid: userId
        })

        if (error) throw error

        const result = data as unknown as EligibilityResult
        setEligibility(result)

        if (result.eligible && onEligible) {
          onEligible()
        }
      } catch (err) {
        console.error('Error checking eligibility:', err)
        setError('Error al verificar elegibilidad')
      } finally {
        setLoading(false)
      }
    }

    checkEligibility()
  }, [userId, onEligible])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-imperial-gold" />
        <span className="ml-2 text-bone/50">Verificando requisitos...</span>
      </div>
    )
  }

  if (error || !eligibility) {
    return (
      <div className="p-4 rounded-lg bg-blood-red/10 border border-blood-red/30 text-blood-red">
        {error || 'Error desconocido'}
      </div>
    )
  }

  const { checks } = eligibility
  const completedCount = [checks.has_avatar, checks.has_bio, checks.has_social].filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Status header */}
      <div className={cn(
        'p-4 rounded-lg border',
        eligibility.eligible
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : 'bg-void/50 border-bone/10'
      )}>
        <div className="flex items-center gap-3">
          {eligibility.eligible ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          ) : (
            <div className="w-6 h-6 rounded-full border-2 border-bone/30" />
          )}
          <div>
            <h4 className={cn(
              'font-medium',
              eligibility.eligible ? 'text-emerald-400' : 'text-bone/80'
            )}>
              {eligibility.eligible
                ? 'Perfil completo'
                : 'Completa tu perfil para solicitar'
              }
            </h4>
            <p className="text-sm text-bone/50">
              {eligibility.eligible
                ? 'Ahora necesitas añadir 5 enlaces a tu contenido'
                : 'Completa estos requisitos básicos primero'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        {checkItems.map((item, index) => {
          const isComplete = checks[item.key]
          const Icon = item.icon

          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border transition-colors',
                isComplete
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-void/50 border-bone/10 hover:border-bone/20'
              )}
            >
              <div className="flex items-center gap-3">
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-bone/30" />
                )}
                <Icon className={cn(
                  'w-4 h-4',
                  isComplete ? 'text-emerald-400' : 'text-bone/50'
                )} />
                <div>
                  <p className={cn(
                    'text-sm font-medium',
                    isComplete ? 'text-bone/90' : 'text-bone/60'
                  )}>
                    {item.label}
                  </p>
                  <p className="text-xs text-bone/40">{item.description}</p>
                </div>
              </div>
              {!isComplete && (
                <Link
                  href={item.link}
                  className="text-xs text-imperial-gold hover:underline flex items-center gap-1"
                >
                  Completar
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </motion.div>
          )
        })}

        {/* Content links info - shown when profile is complete */}
        {eligibility.eligible && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between p-3 rounded-lg border bg-purple-500/5 border-purple-500/20"
          >
            <div className="flex items-center gap-3">
              <LinkIcon className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm font-medium text-bone/90">
                  5 enlaces de contenido
                </p>
                <p className="text-xs text-bone/40">
                  Se solicitan en el formulario siguiente
                </p>
              </div>
            </div>
            <span className="text-xs text-purple-400 font-medium">Requerido</span>
          </motion.div>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-bone/50">
          <span>Progreso del perfil</span>
          <span>{completedCount} / 3</span>
        </div>
        <div className="h-2 rounded-full bg-bone/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / 3) * 100}%` }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={cn(
              'h-full rounded-full',
              eligibility.eligible
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                : 'bg-gradient-to-r from-imperial-gold to-amber-500'
            )}
          />
        </div>
      </div>
    </div>
  )
}
