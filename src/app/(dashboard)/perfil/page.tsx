'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar } from '@/components/ui'
import { FactionSelector, generateGradient, type Faction, FACTION_ICONS } from '@/components/user'
import { useAuth } from '@/lib/hooks/useAuth'
import { compressAvatar } from '@/lib/utils/compressImage'
import { createClient } from '@/lib/supabase/client'
import {
  Camera,
  Check,
  AlertCircle,
  MapPin,
  Loader2,
  Shield,
  Instagram,
  Youtube,
  User,
  FileText,
  Share2,
  ChevronDown,
  Zap,
  CircleDot,
  ExternalLink,
  Cpu,
  Sparkles,
  ArrowRight,
  Clock,
} from 'lucide-react'
import { CreatorBadge, CreatorEligibility } from '@/components/creator'
import type { CreatorType, CreatorStatus } from '@/lib/types/database.types'

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

// Debounce hook for auto-save
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

interface ProfileFormData {
  username: string
  display_name: string
  bio: string
  location: string
  instagram: string
  twitter: string
  youtube: string
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export default function EditProfilePage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading, updateProfile } = useAuth()
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>(
    'idle'
  )
  const [favoriteFactions, setFavoriteFactions] = useState<string[]>([])
  const [factionDetails, setFactionDetails] = useState<Faction[]>([])
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [expandedSection, setExpandedSection] = useState<string | null>('identity')
  const [formData, setFormData] = useState<ProfileFormData>({
    username: '',
    display_name: '',
    bio: '',
    location: '',
    instagram: '',
    twitter: '',
    youtube: '',
  })
  const lastSavedData = useRef<string>('')

  const supabase = createClient()
  const debouncedFormData = useDebounce(formData, 1500)
  const debouncedFactions = useDebounce(favoriteFactions, 1500)

  // Initialize form data from profile
  useEffect(() => {
    if (profile) {
      const p = profile as typeof profile & {
        favorite_factions?: string[]
        instagram?: string
        twitter?: string
        youtube?: string
      }
      const initialData = {
        username: p.username || '',
        display_name: p.display_name || '',
        bio: p.bio || '',
        location: p.location || '',
        instagram: p.instagram || '',
        twitter: p.twitter || '',
        youtube: p.youtube || '',
      }
      setFormData(initialData)
      lastSavedData.current = JSON.stringify({
        ...initialData,
        factions: p.favorite_factions || [],
      })
      if (p.favorite_factions) {
        setFavoriteFactions(p.favorite_factions)
      }
    }
  }, [profile])

  // Fetch faction details
  useEffect(() => {
    const fetchFactionDetails = async () => {
      if (favoriteFactions.length === 0) {
        setFactionDetails([])
        return
      }
      const { data } = await supabase
        .from('tags')
        .select('id, name, slug, primary_color, secondary_color')
        .in('id', favoriteFactions)
      if (data) {
        const ordered = favoriteFactions
          .map((id) => data.find((f) => f.id === id))
          .filter(Boolean) as Faction[]
        setFactionDetails(ordered)
      }
    }
    fetchFactionDetails()
  }, [favoriteFactions])

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (!formData.username || formData.username === profile?.username) {
        setUsernameStatus('idle')
        return
      }
      if (formData.username.length < 3 || !/^[a-z0-9_]+$/.test(formData.username)) {
        setUsernameStatus('idle')
        return
      }
      setUsernameStatus('checking')
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', formData.username)
        .neq('id', user?.id || '')
        .single()
      setUsernameStatus(data ? 'taken' : 'available')
    }
    const timeout = setTimeout(checkUsername, 500)
    return () => clearTimeout(timeout)
  }, [formData.username, profile?.username, user?.id])

  // Auto-save effect
  useEffect(() => {
    const currentData = JSON.stringify({ ...debouncedFormData, factions: debouncedFactions })

    if (currentData === lastSavedData.current || !user || !profile) return
    if (usernameStatus === 'taken') return
    if (debouncedFormData.username.length < 3) return

    const saveData = async () => {
      setSaveStatus('saving')

      const { error } = await updateProfile({
        username: debouncedFormData.username,
        display_name: debouncedFormData.display_name || null,
        bio: debouncedFormData.bio || null,
        location: debouncedFormData.location || null,
        instagram: debouncedFormData.instagram || null,
        twitter: debouncedFormData.twitter || null,
        youtube: debouncedFormData.youtube || null,
        favorite_factions: debouncedFactions.length > 0 ? debouncedFactions : null,
      } as Parameters<typeof updateProfile>[0])

      if (error) {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        lastSavedData.current = currentData
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      }
    }

    saveData()
  }, [debouncedFormData, debouncedFactions, user, profile, usernameStatus, updateProfile])

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/perfil')
    }
  }, [authLoading, user, router])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setAvatarFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)

    // Compress & upload avatar with fixed filename (avoids orphaned files)
    setAvatarUploading(true)
    const compressed = await compressAvatar(file)
    const filePath = `${user.id}/avatar.webp`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, compressed, { upsert: true, contentType: 'image/webp' })

    if (!uploadError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath)

      // Append cache-bust param to force refresh
      const url = `${publicUrl}?v=${Date.now()}`
      await updateProfile({ avatar_url: url } as Parameters<typeof updateProfile>[0])
    }

    setAvatarUploading(false)
  }

  const updateField = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  // Calculate profile completeness
  const calculateCompleteness = () => {
    let score = 0
    const total = 7
    if (formData.display_name) score++
    if (formData.bio) score++
    if (formData.location) score++
    if (profile?.avatar_url || avatarPreview) score++
    if (favoriteFactions.length > 0) score++
    if (formData.instagram || formData.twitter || formData.youtube) score++
    if (formData.username) score++
    return Math.round((score / total) * 100)
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-12 w-12 rounded-full border-2 border-bone/20 border-t-imperial-gold"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="font-mono text-sm text-bone/50">INICIALIZANDO COGITADOR...</p>
        </motion.div>
      </div>
    )
  }

  if (!user || !profile) return null

  const completeness = calculateCompleteness()

  return (
    <div className="min-h-screen bg-void">
      {/* Scan line effect - single pass on load */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        <motion.div
          className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-imperial-gold/30 to-transparent"
          initial={{ y: '-10vh' }}
          animate={{ y: '110vh' }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
      </div>

      {/* Background texture */}
      <div
        className="fixed inset-0 opacity-[0.02]"
        style={{ backgroundImage: 'url(/noise.png)' }}
      />

      {/* Status indicator - fixed top right */}
      <AnimatePresence>
        {saveStatus !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed right-6 top-20 z-40"
          >
            <div
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 backdrop-blur-xl ${
                saveStatus === 'saving'
                  ? 'border-imperial-gold/30 bg-imperial-gold/10 text-imperial-gold'
                  : saveStatus === 'saved'
                    ? 'border-green-500/30 bg-green-500/10 text-green-400'
                    : 'border-red-500/30 bg-red-500/10 text-red-400'
              }`}
            >
              {saveStatus === 'saving' && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="font-mono text-sm">SINCRONIZANDO...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <Check className="h-4 w-4" />
                  <span className="font-mono text-sm">GUARDADO</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-mono text-sm">ERROR DE SINCRONIZACIÓN</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-1 flex items-center gap-3">
            <Cpu className="h-5 w-5 text-imperial-gold" />
            <span className="font-mono text-xs tracking-widest text-imperial-gold/60">
              ADMINISTRATUM // REGISTRO DE PERSONAL
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-wide text-bone">
            Manifiesto de Identidad
          </h1>
        </motion.div>

        {/* Main content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column - Avatar & Status */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6 lg:col-span-1"
          >
            {/* Avatar Card */}
            <div className="group relative">
              {/* Decorative corner brackets */}
              <div className="absolute -left-1 -top-1 h-4 w-4 border-l-2 border-t-2 border-imperial-gold/40" />
              <div className="absolute -right-1 -top-1 h-4 w-4 border-r-2 border-t-2 border-imperial-gold/40" />
              <div className="absolute -bottom-1 -left-1 h-4 w-4 border-b-2 border-l-2 border-imperial-gold/40" />
              <div className="absolute -bottom-1 -right-1 h-4 w-4 border-b-2 border-r-2 border-imperial-gold/40" />

              <div className="rounded-lg border border-bone/10 bg-void-light/30 p-6 backdrop-blur-sm">
                {/* Avatar */}
                <div className="relative mx-auto mb-6 w-fit">
                  <motion.div
                    className="absolute -inset-2 rounded-full opacity-40"
                    animate={{
                      background:
                        factionDetails.length > 0
                          ? `conic-gradient(from 0deg, ${factionDetails[0].primary_color}, ${factionDetails[factionDetails.length - 1]?.secondary_color || factionDetails[0].secondary_color}, ${factionDetails[0].primary_color})`
                          : 'conic-gradient(from 0deg, #c9a227, #8b0000, #c9a227)',
                      rotate: 360,
                    }}
                    transition={{ rotate: { duration: 10, repeat: Infinity, ease: 'linear' } }}
                  />
                  <div className="relative">
                    <Avatar
                      src={avatarPreview || profile.avatar_url}
                      alt={formData.display_name || formData.username}
                      size="xl"
                      className="h-32 w-32 ring-2 ring-void"
                    />
                    <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-void/60 opacity-0 transition-opacity group-hover:opacity-100">
                      {avatarUploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-imperial-gold" />
                      ) : (
                        <Camera className="h-8 w-8 text-bone" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        disabled={avatarUploading}
                      />
                    </label>
                  </div>
                </div>

                {/* Name display */}
                <div className="mb-6 text-center">
                  <h2 className="font-display text-xl font-bold text-bone">
                    {formData.display_name || formData.username}
                  </h2>
                  <p className="text-sm text-bone/50">@{formData.username}</p>
                </div>

                {/* Faction badges */}
                {factionDetails.length > 0 && (
                  <div className="mb-6 flex justify-center gap-2">
                    {factionDetails.map((faction) => {
                      const iconPath = FACTION_ICONS[faction.slug]
                      return (
                        <motion.div
                          key={faction.id}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex h-10 w-10 items-center justify-center rounded-lg"
                          style={{
                            background: `linear-gradient(135deg, ${faction.primary_color}40, ${faction.secondary_color}20)`,
                            border: `1px solid ${faction.primary_color}50`,
                          }}
                          title={faction.name}
                        >
                          {iconPath ? (
                            <Image
                              src={iconPath}
                              alt=""
                              width={20}
                              height={20}
                              className="opacity-80 invert"
                            />
                          ) : (
                            <Shield
                              className="h-5 w-5"
                              style={{ color: faction.primary_color || '#c9a227' }}
                            />
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                )}

                {/* View public profile */}
                <Link
                  href={`/usuarios/${formData.username}`}
                  className="flex w-full items-center justify-center gap-2 py-2 text-sm text-bone/60 transition-colors hover:text-imperial-gold"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver perfil público
                </Link>
              </div>
            </div>

            {/* Completeness indicator */}
            <div className="rounded-lg border border-bone/10 bg-void-light/30 p-4 backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-xs tracking-wider text-bone/50">
                  INTEGRIDAD DEL PERFIL
                </span>
                <span className="font-mono text-sm text-imperial-gold">{completeness}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-void">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background:
                      completeness === 100
                        ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                        : 'linear-gradient(90deg, #c9a227, #fbbf24)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${completeness}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              {completeness < 100 && (
                <p className="mt-2 text-xs text-bone/40">
                  Completa tu perfil para aumentar tu visibilidad
                </p>
              )}
            </div>

            {/* Live Preview */}
            <div className="relative">
              {/* Header */}
              <div className="mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-imperial-gold/60" />
                <span className="font-mono text-xs tracking-widest text-imperial-gold/60">
                  VISTA PREVIA EN VIVO
                </span>
              </div>

              {/* Preview Card */}
              <motion.div
                layout
                className="relative overflow-hidden rounded-xl border border-bone/10"
              >
                {/* Corner brackets */}
                <div className="absolute -left-0.5 -top-0.5 z-10 h-3 w-3 border-l border-t border-imperial-gold/40" />
                <div className="absolute -right-0.5 -top-0.5 z-10 h-3 w-3 border-r border-t border-imperial-gold/40" />
                <div className="absolute -bottom-0.5 -left-0.5 z-10 h-3 w-3 border-b border-l border-imperial-gold/40" />
                <div className="absolute -bottom-0.5 -right-0.5 z-10 h-3 w-3 border-b border-r border-imperial-gold/40" />

                {/* Mini Banner */}
                <motion.div
                  className="relative h-16 overflow-hidden"
                  animate={{
                    background:
                      factionDetails.length > 0
                        ? factionDetails.length === 1
                          ? `linear-gradient(135deg, ${factionDetails[0].primary_color}90 0%, rgba(26,26,46,1) 50%, ${factionDetails[0].secondary_color}60 100%)`
                          : `linear-gradient(135deg, ${factionDetails[0].primary_color}90 0%, rgba(26,26,46,1) 50%, ${factionDetails[factionDetails.length - 1].primary_color}60 100%)`
                        : 'linear-gradient(135deg, rgba(139,0,0,0.4) 0%, rgba(26,26,46,1) 50%, rgba(201,162,39,0.3) 100%)',
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Grid pattern */}
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: `
                        linear-gradient(rgba(201, 162, 39, 0.2) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(201, 162, 39, 0.2) 1px, transparent 1px)
                      `,
                      backgroundSize: '20px 20px',
                    }}
                  />

                  {/* Faction badges mini */}
                  {factionDetails.length > 0 && (
                    <div className="absolute right-2 top-2 flex gap-1">
                      {factionDetails.map((faction) => {
                        const iconPath = FACTION_ICONS[faction.slug]
                        return (
                          <motion.div
                            key={faction.id}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex h-6 w-6 items-center justify-center rounded backdrop-blur-sm"
                            style={{
                              background: `linear-gradient(135deg, ${faction.primary_color}CC, ${faction.secondary_color}99)`,
                              border: '1px solid rgba(255,255,255,0.2)',
                            }}
                          >
                            {iconPath ? (
                              <Image
                                src={iconPath}
                                alt=""
                                width={12}
                                height={12}
                                className="opacity-90 invert"
                              />
                            ) : (
                              <Shield className="h-3 w-3 text-white/90" />
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </motion.div>

                {/* Preview Content */}
                <div className="relative -mt-6 bg-void-light/50 p-4">
                  {/* Avatar mini */}
                  <div className="relative mb-3 w-fit">
                    <motion.div
                      className="absolute -inset-1 rounded-full opacity-40"
                      animate={{
                        background:
                          factionDetails.length > 0
                            ? `conic-gradient(from 0deg, ${factionDetails[0].primary_color}, ${factionDetails[factionDetails.length - 1]?.secondary_color || factionDetails[0].secondary_color}, ${factionDetails[0].primary_color})`
                            : 'conic-gradient(from 0deg, #c9a227, #8b0000, #c9a227)',
                        rotate: 360,
                      }}
                      transition={{ rotate: { duration: 10, repeat: Infinity, ease: 'linear' } }}
                    />
                    <Avatar
                      src={avatarPreview || profile.avatar_url}
                      alt={formData.display_name || formData.username}
                      size="md"
                      className="relative h-12 w-12 ring-2 ring-void-light"
                    />
                  </div>

                  {/* Name & Username */}
                  <div className="mb-1 flex items-center gap-2">
                    <Cpu className="h-3 w-3 text-imperial-gold/50" />
                    <span className="font-mono text-[10px] tracking-widest text-imperial-gold/50">
                      PERFIL DE USUARIO
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold leading-tight text-bone">
                    {formData.display_name || formData.username || 'Tu Nombre'}
                  </h3>
                  <p className="mb-2 font-mono text-xs text-bone/50">
                    @{formData.username || 'usuario'}
                  </p>

                  {/* Bio preview */}
                  {formData.bio && (
                    <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-bone/60">
                      {formData.bio}
                    </p>
                  )}

                  {/* Location */}
                  {formData.location && (
                    <div className="mb-2 flex items-center gap-1 text-xs text-bone/40">
                      <MapPin className="h-3 w-3 text-imperial-gold/50" />
                      {formData.location}
                    </div>
                  )}

                  {/* Social Links mini */}
                  {(formData.instagram || formData.twitter || formData.youtube) && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {formData.instagram && (
                        <div className="flex items-center gap-1 rounded border border-pink-500/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-2 py-1 text-[10px] text-pink-400">
                          <Instagram className="h-3 w-3" />@{formData.instagram}
                        </div>
                      )}
                      {formData.twitter && (
                        <div className="flex items-center gap-1 rounded border border-bone/10 bg-bone/5 px-2 py-1 text-[10px] text-bone/60">
                          <XIcon className="h-3 w-3" />@{formData.twitter}
                        </div>
                      )}
                      {formData.youtube && (
                        <div className="flex items-center gap-1 rounded border border-red-500/20 bg-red-500/10 px-2 py-1 text-[10px] text-red-400">
                          <Youtube className="h-3 w-3" />@{formData.youtube}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* View full profile link */}
              <Link
                href={`/usuarios/${formData.username}`}
                className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-bone/10 py-2 text-xs text-bone/50 transition-colors hover:border-imperial-gold/30 hover:text-imperial-gold"
              >
                <ExternalLink className="h-3 w-3" />
                Ver perfil completo
              </Link>
            </div>
          </motion.div>

          {/* Right column - Form sections */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 lg:col-span-2"
          >
            {/* Identity Section */}
            <AccordionSection
              id="identity"
              title="Designación de Identidad"
              icon={User}
              isExpanded={expandedSection === 'identity'}
              onToggle={() => toggleSection('identity')}
              status={formData.username.length >= 3 ? 'complete' : 'incomplete'}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-mono text-xs tracking-wider text-bone/50">
                    IDENTIFICADOR
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-bone/30">
                      @
                    </span>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        updateField(
                          'username',
                          e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
                        )
                      }
                      className="w-full rounded-lg border border-bone/10 bg-void/50 py-3 pl-8 pr-10 font-mono text-bone transition-colors placeholder:text-bone/20 focus:border-imperial-gold/50 focus:outline-none"
                      placeholder="usuario"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {usernameStatus === 'checking' && (
                        <Loader2 className="h-4 w-4 animate-spin text-bone/40" />
                      )}
                      {usernameStatus === 'available' && (
                        <Check className="h-4 w-4 text-green-400" />
                      )}
                      {usernameStatus === 'taken' && (
                        <AlertCircle className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  </div>
                  {usernameStatus === 'taken' && (
                    <p className="mt-1 font-mono text-xs text-red-400">
                      IDENTIFICADOR NO DISPONIBLE
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block font-mono text-xs tracking-wider text-bone/50">
                    NOMBRE VISIBLE
                  </label>
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={(e) => updateField('display_name', e.target.value)}
                    className="w-full rounded-lg border border-bone/10 bg-void/50 px-4 py-3 text-bone transition-colors placeholder:text-bone/20 focus:border-imperial-gold/50 focus:outline-none"
                    placeholder="Tu Nombre"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block font-mono text-xs tracking-wider text-bone/50">
                    UBICACIÓN DEL SECTOR
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/30" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      className="w-full rounded-lg border border-bone/10 bg-void/50 py-3 pl-10 pr-4 text-bone transition-colors placeholder:text-bone/20 focus:border-imperial-gold/50 focus:outline-none"
                      placeholder="Ciudad, País"
                    />
                  </div>
                </div>
              </div>
            </AccordionSection>

            {/* Biography Section */}
            <AccordionSection
              id="biography"
              title="Expediente Personal"
              icon={FileText}
              isExpanded={expandedSection === 'biography'}
              onToggle={() => toggleSection('biography')}
              status={formData.bio ? 'complete' : 'incomplete'}
            >
              <div className="relative">
                <textarea
                  value={formData.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  className="min-h-[120px] w-full resize-none rounded-lg border border-bone/10 bg-void/50 px-4 py-3 text-bone transition-colors placeholder:text-bone/20 focus:border-imperial-gold/50 focus:outline-none"
                  placeholder="Registra tu historial de servicio, especializaciones y logros notables..."
                  maxLength={500}
                />
                <div className="absolute bottom-3 right-3 font-mono text-xs text-bone/30">
                  {formData.bio.length}/500
                </div>
              </div>
            </AccordionSection>

            {/* Social Links Section */}
            <AccordionSection
              id="social"
              title="Canales Vox"
              icon={Share2}
              isExpanded={expandedSection === 'social'}
              onToggle={() => toggleSection('social')}
              status={
                formData.instagram || formData.twitter || formData.youtube
                  ? 'complete'
                  : 'incomplete'
              }
            >
              <div className="space-y-4">
                {/* Instagram */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-pink-500/30 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <Instagram className="h-5 w-5 text-pink-400" />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-bone/30">
                      @
                    </span>
                    <input
                      type="text"
                      value={formData.instagram}
                      onChange={(e) => updateField('instagram', e.target.value.replace('@', ''))}
                      className="w-full rounded-lg border border-bone/10 bg-void/50 py-2.5 pl-8 pr-4 text-sm text-bone transition-colors placeholder:text-bone/20 focus:border-pink-500/50 focus:outline-none"
                      placeholder="instagram"
                    />
                  </div>
                </div>

                {/* Twitter/X */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-bone/20 bg-bone/5">
                    <XIcon className="h-5 w-5 text-bone/70" />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-bone/30">
                      @
                    </span>
                    <input
                      type="text"
                      value={formData.twitter}
                      onChange={(e) => updateField('twitter', e.target.value.replace('@', ''))}
                      className="w-full rounded-lg border border-bone/10 bg-void/50 py-2.5 pl-8 pr-4 text-sm text-bone transition-colors placeholder:text-bone/20 focus:border-bone/50 focus:outline-none"
                      placeholder="twitter"
                    />
                  </div>
                </div>

                {/* YouTube */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/20">
                    <Youtube className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-bone/30">
                      @
                    </span>
                    <input
                      type="text"
                      value={formData.youtube}
                      onChange={(e) => updateField('youtube', e.target.value.replace('@', ''))}
                      className="w-full rounded-lg border border-bone/10 bg-void/50 py-2.5 pl-8 pr-4 text-sm text-bone transition-colors placeholder:text-bone/20 focus:border-red-500/50 focus:outline-none"
                      placeholder="canal"
                    />
                  </div>
                </div>
              </div>
            </AccordionSection>

            {/* Factions Section */}
            <AccordionSection
              id="factions"
              title="Declaración de Lealtad"
              icon={Shield}
              isExpanded={expandedSection === 'factions'}
              onToggle={() => toggleSection('factions')}
              status={favoriteFactions.length > 0 ? 'complete' : 'incomplete'}
              badge={`${favoriteFactions.length}/3`}
            >
              <p className="mb-4 text-sm text-bone/50">
                Declara tu lealtad a hasta 3 facciones. Esto personalizará la apariencia de tu
                perfil.
              </p>
              <FactionSelector
                selectedFactions={favoriteFactions}
                onChange={setFavoriteFactions}
                maxSelections={3}
              />
            </AccordionSection>

            {/* Creator Section */}
            <AccordionSection
              id="creator"
              title="Programa de Creadores"
              icon={Sparkles}
              isExpanded={expandedSection === 'creator'}
              onToggle={() => toggleSection('creator')}
              status={profile?.creator_status === 'approved' ? 'complete' : 'incomplete'}
              badge={profile?.creator_status === 'approved' ? 'Verificado' : undefined}
            >
              <CreatorSection
                userId={user?.id || ''}
                username={formData.username}
                creatorStatus={(profile?.creator_status || 'none') as CreatorStatus}
                creatorType={profile?.creator_type as CreatorType | null}
              />
            </AccordionSection>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Creator Section Component
function CreatorSection({
  userId,
  username,
  creatorStatus,
  creatorType,
}: {
  userId: string
  username: string
  creatorStatus: CreatorStatus
  creatorType: CreatorType | null
}) {
  if (creatorStatus === 'approved' && creatorType) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4">
          <CreatorBadge type={creatorType} size="md" />
          <div>
            <p className="font-medium text-bone">Eres un creador verificado</p>
            <p className="text-sm text-bone/50">Tu badge aparece en tu perfil publico</p>
          </div>
        </div>
        <Link
          href={`/usuarios/${username}`}
          className="flex items-center gap-2 text-sm text-imperial-gold transition-colors hover:text-imperial-gold/80"
        >
          Ver mi perfil publico
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  if (creatorStatus === 'pending') {
    return (
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-amber-400" />
          <div>
            <p className="font-medium text-bone">Solicitud en revision</p>
            <p className="text-sm text-bone/50">
              Te notificaremos cuando sea revisada por nuestro equipo.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (creatorStatus === 'rejected') {
    return (
      <div className="space-y-4">
        <div className="bg-blood-red/10 border-blood-red/20 rounded-lg border p-4">
          <p className="text-sm text-bone/70">
            Tu solicitud anterior fue rechazada. Puedes volver a intentarlo cuando cumplas todos los
            requisitos.
          </p>
        </div>
        <CreatorEligibility userId={userId} />
        <Link
          href="/comunidad/creadores/solicitar"
          className="inline-flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/20 px-4 py-2 text-purple-400 transition-colors hover:bg-purple-500/30"
        >
          <Sparkles className="h-4 w-4" />
          Volver a solicitar
        </Link>
      </div>
    )
  }

  // Default: none status
  return (
    <div className="space-y-4">
      <p className="text-sm text-bone/50">
        Conviertete en creador verificado para obtener mayor visibilidad, un badge especial y
        mostrar tus servicios en tu perfil.
      </p>
      <CreatorEligibility userId={userId} />
      <Link
        href="/comunidad/creadores/solicitar"
        className="inline-flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/20 px-4 py-2 text-purple-400 transition-all hover:border-purple-500/50 hover:bg-purple-500/30"
      >
        <Sparkles className="h-4 w-4" />
        Solicitar ser creador
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

// Accordion Section Component
interface AccordionSectionProps {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  isExpanded: boolean
  onToggle: () => void
  status: 'complete' | 'incomplete'
  badge?: string
  children: React.ReactNode
}

function AccordionSection({
  id,
  title,
  icon: Icon,
  isExpanded,
  onToggle,
  status,
  badge,
  children,
}: AccordionSectionProps) {
  return (
    <motion.div
      layout
      className="overflow-hidden rounded-lg border border-bone/10 bg-void-light/30 backdrop-blur-sm"
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 transition-colors hover:bg-bone/5"
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              status === 'complete' ? 'bg-green-500/10 text-green-400' : 'bg-bone/5 text-bone/40'
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <span className="font-display font-medium text-bone">{title}</span>
          {badge && (
            <span className="rounded bg-void px-2 py-0.5 font-mono text-xs text-bone/40">
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {status === 'complete' && <CircleDot className="h-4 w-4 text-green-400" />}
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-5 w-5 text-bone/40" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-bone/5 px-4 pb-4 pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
