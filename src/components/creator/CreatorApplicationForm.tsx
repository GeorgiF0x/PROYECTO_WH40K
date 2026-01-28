'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Palette,
  Video,
  Brush,
  BookOpen,
  GraduationCap,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Link as LinkIcon,
  ExternalLink,
  Cog,
  Radio,
  Feather,
  ScrollText,
  Wrench
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { CreatorType } from '@/lib/types/database.types'
import { DataslateSuccess } from './DataslateContainer'

interface CreatorApplicationFormProps {
  userId: string
  isEligible?: boolean
  onSuccess?: () => void
}

const creatorTypes: {
  value: CreatorType
  title: string
  tagline: string
  description: string
  icon: typeof Palette
  secondaryIcon: typeof Cog
  color: string
  examples: string
}[] = [
  {
    value: 'painter',
    title: 'Adepto de la Forja',
    tagline: 'Artesano del Omnissiah',
    description: 'Tu arte da vida al plástico y al metal. El Espíritu Máquina reconoce tu maestría.',
    icon: Palette,
    secondaryIcon: Cog,
    color: 'purple',
    examples: 'Instagram, Reddit, Discord showcases'
  },
  {
    value: 'youtuber',
    title: 'Vox-Emisor Imperial',
    tagline: 'Portavoz del Imperium',
    description: 'Tu voz resuena por el Vox-Net. El Imperium escucha tu mensaje.',
    icon: Video,
    secondaryIcon: Radio,
    color: 'red',
    examples: 'Videos de YouTube, VODs de Twitch'
  },
  {
    value: 'artist',
    title: 'Rememorador',
    tagline: 'Cronista Imperial',
    description: 'Tus ilustraciones inmortalizan la gloria del Imperium para la eternidad.',
    icon: Brush,
    secondaryIcon: Feather,
    color: 'cyan',
    examples: 'ArtStation, DeviantArt, Behance'
  },
  {
    value: 'blogger',
    title: 'Escriba del Lexicanum',
    tagline: 'Custodio del Conocimiento',
    description: 'Tus escritos preservan el saber sagrado. El Conocimiento es poder.',
    icon: BookOpen,
    secondaryIcon: ScrollText,
    color: 'amber',
    examples: 'Blog posts, artículos, threads'
  },
  {
    value: 'instructor',
    title: 'Tecnosacerdote',
    tagline: 'Maestro del Rito',
    description: 'Transmites los ritos sagrados a los neófitos. Bendito sea el conocimiento compartido.',
    icon: GraduationCap,
    secondaryIcon: Wrench,
    color: 'emerald',
    examples: 'Tutoriales, guías, cursos'
  }
]

const MIN_LINKS = 5

export function CreatorApplicationForm({ userId, isEligible = true, onSuccess }: CreatorApplicationFormProps) {
  const [selectedType, setSelectedType] = useState<CreatorType | null>(null)
  const [motivation, setMotivation] = useState('')
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>(['', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedTypeConfig = creatorTypes.find(t => t.value === selectedType)

  const addPortfolioLink = () => {
    if (portfolioLinks.length < 10) {
      setPortfolioLinks([...portfolioLinks, ''])
    }
  }

  const removePortfolioLink = (index: number) => {
    if (portfolioLinks.length > MIN_LINKS) {
      setPortfolioLinks(portfolioLinks.filter((_, i) => i !== index))
    }
  }

  const updatePortfolioLink = (index: number, value: string) => {
    const updated = [...portfolioLinks]
    updated[index] = value
    setPortfolioLinks(updated)
  }

  const validLinks = portfolioLinks.filter(link => {
    try {
      if (!link.trim()) return false
      new URL(link)
      return true
    } catch {
      return false
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedType) {
      setError('Selecciona un tipo de creador')
      return
    }

    if (motivation.trim().length < 50) {
      setError('La motivación debe tener al menos 50 caracteres')
      return
    }

    if (validLinks.length < MIN_LINKS) {
      setError(`Debes añadir al menos ${MIN_LINKS} enlaces válidos a tu contenido`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: rpcError } = await supabase.rpc('apply_for_creator', {
        user_uuid: userId,
        p_creator_type: selectedType,
        p_motivation: motivation.trim(),
        p_portfolio_links: validLinks,
        p_social_links: null
      })

      if (rpcError) throw rpcError

      const result = data as unknown as { success: boolean; error?: string }

      if (!result.success) {
        throw new Error(result.error || 'Error al enviar solicitud')
      }

      setSuccess(true)
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error('Error submitting application:', err)
      setError(err instanceof Error ? err.message : 'Error al enviar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <DataslateSuccess
        title="PETICIÓN REGISTRADA"
        message="Tu solicitud ha sido enviada al Administratum. Aguarda revisión inquisitorial."
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Not eligible warning */}
      {!isEligible && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 font-medium text-sm">
                Completa los requisitos primero
              </p>
              <p className="text-amber-400/70 text-xs mt-1">
                Debes completar todos los requisitos del perfil antes de poder enviar tu solicitud.
                Revisa la sección "Verificación de requisitos" arriba.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Creator type selection */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-mono font-bold text-imperial-gold mb-1 tracking-wider">
            DESIGNACIÓN: <span className="text-blood-red">*</span>
          </label>
          <p className="text-sm text-bone/50">
            Selecciona la orden que mejor describe tu servicio al Imperium
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {creatorTypes.map((type) => {
            const Icon = type.icon
            const SecondaryIcon = type.secondaryIcon
            const isSelected = selectedType === type.value

            return (
              <motion.button
                key={type.value}
                type="button"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedType(type.value)}
                className={cn(
                  'relative p-5 rounded-xl border text-left transition-all overflow-hidden group',
                  isSelected
                    ? `bg-${type.color}-500/10 border-${type.color}-500/50 shadow-lg shadow-${type.color}-500/10`
                    : 'bg-void/50 border-bone/10 hover:border-bone/20 hover:bg-void/70'
                )}
                style={isSelected ? {
                  backgroundColor: `rgba(var(--${type.color}-rgb, 168, 85, 247), 0.1)`,
                  borderColor: `rgba(var(--${type.color}-rgb, 168, 85, 247), 0.5)`
                } : {}}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <motion.div
                    layoutId="selectedType"
                    className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"
                  />
                )}

                <div className="relative">
                  {isSelected && (
                    <div className="absolute -top-1 -right-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center transition-colors',
                      isSelected
                        ? 'bg-white/10'
                        : 'bg-bone/5 group-hover:bg-bone/10'
                    )}>
                      <Icon className={cn(
                        'w-6 h-6 transition-colors',
                        isSelected ? 'text-white' : 'text-bone/60 group-hover:text-bone/80'
                      )} />
                    </div>
                    <SecondaryIcon className={cn(
                      'w-4 h-4 transition-colors opacity-30',
                      isSelected ? 'text-white' : 'text-bone/40'
                    )} />
                  </div>

                  <h4 className={cn(
                    'font-heading font-bold mb-0.5 transition-colors',
                    isSelected ? 'text-white' : 'text-bone/90 group-hover:text-bone'
                  )}>
                    {type.title}
                  </h4>
                  <p className={cn(
                    'text-[10px] font-mono tracking-wide mb-2',
                    isSelected ? 'text-white/50' : 'text-bone/40'
                  )}>
                    {type.tagline}
                  </p>
                  <p className={cn(
                    'text-xs mb-2 transition-colors leading-relaxed',
                    isSelected ? 'text-white/70' : 'text-bone/50'
                  )}>
                    {type.description}
                  </p>
                  <p className="text-[10px] text-bone/40 font-mono">
                    EJ: {type.examples}
                  </p>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Motivation */}
      <div className="space-y-3">
        <div>
          <label htmlFor="motivation" className="block text-sm font-mono font-bold text-imperial-gold mb-1 tracking-wider">
            MOTIVACIÓN: <span className="text-blood-red">*</span>
          </label>
          <p className="text-sm text-bone/50">
            Relata tu servicio al hobby y cómo contribuirás a la comunidad
          </p>
        </div>
        <div className="relative">
          <textarea
            id="motivation"
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            placeholder="Mi servicio al Imperium comenzó hace X años. Me especializo en... Mi misión es compartir..."
            rows={4}
            className={cn(
              'w-full px-4 py-3 rounded-xl border bg-void/80 text-bone placeholder-bone/40 resize-none font-mono text-sm',
              'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50',
              'border-bone/10 hover:border-bone/20 transition-colors'
            )}
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span className={cn(
              'text-xs font-mono transition-colors',
              motivation.length >= 50 ? 'text-emerald-400' : 'text-bone/40'
            )}>
              DATOS: {motivation.length}/50
            </span>
            {motivation.length >= 50 && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
          </div>
        </div>
      </div>

      {/* Portfolio links */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-mono font-bold text-imperial-gold mb-1 tracking-wider">
            ENLACES DE CONTENIDO: <span className="text-blood-red">*</span>
          </label>
          <p className="text-sm text-bone/50">
            Mínimo {MIN_LINKS} enlaces a tu trabajo sobre Warhammer 40K
            {selectedTypeConfig && (
              <span className="text-bone/40"> ({selectedTypeConfig.examples})</span>
            )}
          </p>
        </div>

        {/* Links counter - styled as data upload bar */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-void/50 border border-bone/10">
          <LinkIcon className="w-5 h-5 text-purple-400" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-bone/50 font-mono tracking-wide">CARGA DE DATOS</span>
              <span className={cn(
                'text-xs font-mono font-bold',
                validLinks.length >= MIN_LINKS ? 'text-emerald-400' : 'text-bone/50'
              )}>
                {Math.min(Math.round((validLinks.length / MIN_LINKS) * 100), 100)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-bone/10 overflow-hidden">
              <motion.div
                className={cn(
                  'h-full rounded-full',
                  validLinks.length >= MIN_LINKS
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((validLinks.length / MIN_LINKS) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Links list */}
        <div className="space-y-2">
          <AnimatePresence>
            {portfolioLinks.map((link, index) => {
              let isValid = false
              try {
                if (link.trim()) {
                  new URL(link)
                  isValid = true
                }
              } catch {}

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-2 items-center"
                >
                  <div className="relative flex-1">
                    <div className={cn(
                      'absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                      isValid
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-bone/10 text-bone/50'
                    )}>
                      {isValid ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                    </div>
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => updatePortfolioLink(index, e.target.value)}
                      placeholder={`https://... (enlace ${index + 1})`}
                      className={cn(
                        'w-full pl-12 pr-10 py-3 rounded-lg border bg-void/80 text-bone placeholder-bone/40',
                        'focus:outline-none focus:ring-2 transition-all',
                        isValid
                          ? 'border-emerald-500/30 focus:ring-emerald-500/30 focus:border-emerald-500/50'
                          : 'border-bone/10 focus:ring-purple-500/30 focus:border-purple-500/50 hover:border-bone/20'
                      )}
                    />
                    {isValid && (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-bone/50 hover:text-purple-400 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  {portfolioLinks.length > MIN_LINKS && (
                    <button
                      type="button"
                      onClick={() => removePortfolioLink(index)}
                      className="p-2.5 rounded-lg border border-bone/10 text-bone/50 hover:text-blood-red hover:border-blood-red/50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {portfolioLinks.length < 10 && (
          <button
            type="button"
            onClick={addPortfolioLink}
            className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Añadir otro enlace
          </button>
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-blood-red/10 border border-blood-red/30"
          >
            <AlertCircle className="w-5 h-5 text-blood-red flex-shrink-0" />
            <span className="text-sm text-blood-red font-mono">ERROR DE COGITADOR: {error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading || !isEligible || !selectedType || motivation.trim().length < 50 || validLinks.length < MIN_LINKS}
          className={cn(
            'w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-heading font-bold text-lg transition-all',
            'bg-purple-500/20 border border-purple-500/40 text-purple-300',
            'hover:bg-purple-500/30 hover:border-purple-500/60 hover:text-purple-200',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-purple-500/20'
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-mono tracking-wide">TRANSMITIENDO DATOS...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>ENVIAR PETICIÓN AL ADMINISTRATUM</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-bone/40 text-center mt-4 font-mono tracking-wide">
          TU PETICIÓN SERÁ REVISADA POR EL INQUISITORIUM.
          RECIBIRÁS NOTIFICACIÓN VÍA VOX.
        </p>
      </div>
    </form>
  )
}
