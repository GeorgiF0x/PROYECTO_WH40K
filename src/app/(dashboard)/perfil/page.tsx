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
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
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
      lastSavedData.current = JSON.stringify({ ...initialData, factions: p.favorite_factions || [] })
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
          .map(id => data.find(f => f.id === id))
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
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Append cache-bust param to force refresh
      const url = `${publicUrl}?v=${Date.now()}`
      await updateProfile({ avatar_url: url } as Parameters<typeof updateProfile>[0])
    }

    setAvatarUploading(false)
  }

  const updateField = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
      <div className="min-h-screen flex items-center justify-center bg-void">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-12 h-12 border-2 border-bone/20 border-t-imperial-gold rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-bone/50 font-mono text-sm">INICIALIZANDO COGITADOR...</p>
        </motion.div>
      </div>
    )
  }

  if (!user || !profile) return null

  const completeness = calculateCompleteness()

  return (
    <div className="min-h-screen bg-void">
      {/* Scan line effect - single pass on load */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <motion.div
          className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-imperial-gold/30 to-transparent"
          initial={{ y: '-10vh' }}
          animate={{ y: '110vh' }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
      </div>

      {/* Background texture */}
      <div className="fixed inset-0 opacity-[0.02]" style={{ backgroundImage: 'url(/noise.png)' }} />

      {/* Status indicator - fixed top right */}
      <AnimatePresence>
        {saveStatus !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-40"
          >
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-xl border ${
              saveStatus === 'saving' ? 'bg-imperial-gold/10 border-imperial-gold/30 text-imperial-gold' :
              saveStatus === 'saved' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
              'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {saveStatus === 'saving' && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-mono">SINCRONIZANDO...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-mono">GUARDADO</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-mono">ERROR DE SINCRONIZACIÓN</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <Cpu className="w-5 h-5 text-imperial-gold" />
            <span className="text-xs font-mono text-imperial-gold/60 tracking-widest">
              ADMINISTRATUM // REGISTRO DE PERSONAL
            </span>
          </div>
          <h1 className="text-3xl font-display font-bold text-bone tracking-wide">
            Manifiesto de Identidad
          </h1>
        </motion.div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column - Avatar & Status */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Avatar Card */}
            <div className="relative group">
              {/* Decorative corner brackets */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-imperial-gold/40" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-imperial-gold/40" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-imperial-gold/40" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-imperial-gold/40" />

              <div className="bg-void-light/30 backdrop-blur-sm border border-bone/10 rounded-lg p-6">
                {/* Avatar */}
                <div className="relative mx-auto w-fit mb-6">
                  <motion.div
                    className="absolute -inset-2 rounded-full opacity-40"
                    animate={{
                      background: factionDetails.length > 0
                        ? `conic-gradient(from 0deg, ${factionDetails[0].primary_color}, ${factionDetails[factionDetails.length-1]?.secondary_color || factionDetails[0].secondary_color}, ${factionDetails[0].primary_color})`
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
                      className="w-32 h-32 ring-2 ring-void"
                    />
                    <label className="absolute inset-0 flex items-center justify-center bg-void/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                      {avatarUploading ? (
                        <Loader2 className="w-8 h-8 text-imperial-gold animate-spin" />
                      ) : (
                        <Camera className="w-8 h-8 text-bone" />
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
                <div className="text-center mb-6">
                  <h2 className="text-xl font-display font-bold text-bone">
                    {formData.display_name || formData.username}
                  </h2>
                  <p className="text-bone/50 text-sm">@{formData.username}</p>
                </div>

                {/* Faction badges */}
                {factionDetails.length > 0 && (
                  <div className="flex justify-center gap-2 mb-6">
                    {factionDetails.map((faction) => {
                      const iconPath = FACTION_ICONS[faction.slug]
                      return (
                        <motion.div
                          key={faction.id}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${faction.primary_color}40, ${faction.secondary_color}20)`,
                            border: `1px solid ${faction.primary_color}50`,
                          }}
                          title={faction.name}
                        >
                          {iconPath ? (
                            <Image src={iconPath} alt="" width={20} height={20} className="invert opacity-80" />
                          ) : (
                            <Shield className="w-5 h-5" style={{ color: faction.primary_color || '#c9a227' }} />
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                )}

                {/* View public profile */}
                <Link
                  href={`/usuarios/${formData.username}`}
                  className="flex items-center justify-center gap-2 w-full py-2 text-sm text-bone/60 hover:text-imperial-gold transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver perfil público
                </Link>
              </div>
            </div>

            {/* Completeness indicator */}
            <div className="bg-void-light/30 backdrop-blur-sm border border-bone/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-bone/50 tracking-wider">INTEGRIDAD DEL PERFIL</span>
                <span className="text-sm font-mono text-imperial-gold">{completeness}%</span>
              </div>
              <div className="h-2 bg-void rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: completeness === 100
                      ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                      : 'linear-gradient(90deg, #c9a227, #fbbf24)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${completeness}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              {completeness < 100 && (
                <p className="text-xs text-bone/40 mt-2">
                  Completa tu perfil para aumentar tu visibilidad
                </p>
              )}
            </div>

            {/* Live Preview */}
            <div className="relative">
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-imperial-gold/60" />
                <span className="text-xs font-mono text-imperial-gold/60 tracking-widest">
                  VISTA PREVIA EN VIVO
                </span>
              </div>

              {/* Preview Card */}
              <motion.div
                layout
                className="relative overflow-hidden rounded-xl border border-bone/10"
              >
                {/* Corner brackets */}
                <div className="absolute -top-0.5 -left-0.5 w-3 h-3 border-l border-t border-imperial-gold/40 z-10" />
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 border-r border-t border-imperial-gold/40 z-10" />
                <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-l border-b border-imperial-gold/40 z-10" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-r border-b border-imperial-gold/40 z-10" />

                {/* Mini Banner */}
                <motion.div
                  className="h-16 relative overflow-hidden"
                  animate={{
                    background: factionDetails.length > 0
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
                    <div className="absolute top-2 right-2 flex gap-1">
                      {factionDetails.map((faction) => {
                        const iconPath = FACTION_ICONS[faction.slug]
                        return (
                          <motion.div
                            key={faction.id}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-6 h-6 rounded flex items-center justify-center backdrop-blur-sm"
                            style={{
                              background: `linear-gradient(135deg, ${faction.primary_color}CC, ${faction.secondary_color}99)`,
                              border: '1px solid rgba(255,255,255,0.2)',
                            }}
                          >
                            {iconPath ? (
                              <Image src={iconPath} alt="" width={12} height={12} className="invert opacity-90" />
                            ) : (
                              <Shield className="w-3 h-3 text-white/90" />
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </motion.div>

                {/* Preview Content */}
                <div className="bg-void-light/50 p-4 -mt-6 relative">
                  {/* Avatar mini */}
                  <div className="relative w-fit mb-3">
                    <motion.div
                      className="absolute -inset-1 rounded-full opacity-40"
                      animate={{
                        background: factionDetails.length > 0
                          ? `conic-gradient(from 0deg, ${factionDetails[0].primary_color}, ${factionDetails[factionDetails.length-1]?.secondary_color || factionDetails[0].secondary_color}, ${factionDetails[0].primary_color})`
                          : 'conic-gradient(from 0deg, #c9a227, #8b0000, #c9a227)',
                        rotate: 360,
                      }}
                      transition={{ rotate: { duration: 10, repeat: Infinity, ease: 'linear' } }}
                    />
                    <Avatar
                      src={avatarPreview || profile.avatar_url}
                      alt={formData.display_name || formData.username}
                      size="md"
                      className="w-12 h-12 ring-2 ring-void-light relative"
                    />
                  </div>

                  {/* Name & Username */}
                  <div className="flex items-center gap-2 mb-1">
                    <Cpu className="w-3 h-3 text-imperial-gold/50" />
                    <span className="text-[10px] font-mono text-imperial-gold/50 tracking-widest">
                      PERFIL DE USUARIO
                    </span>
                  </div>
                  <h3 className="text-lg font-display font-bold text-bone leading-tight">
                    {formData.display_name || formData.username || 'Tu Nombre'}
                  </h3>
                  <p className="text-xs text-bone/50 font-mono mb-2">
                    @{formData.username || 'usuario'}
                  </p>

                  {/* Bio preview */}
                  {formData.bio && (
                    <p className="text-xs text-bone/60 mb-2 line-clamp-2 leading-relaxed">
                      {formData.bio}
                    </p>
                  )}

                  {/* Location */}
                  {formData.location && (
                    <div className="flex items-center gap-1 text-xs text-bone/40 mb-2">
                      <MapPin className="w-3 h-3 text-imperial-gold/50" />
                      {formData.location}
                    </div>
                  )}

                  {/* Social Links mini */}
                  {(formData.instagram || formData.twitter || formData.youtube) && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {formData.instagram && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-pink-500/20 rounded text-[10px] text-pink-400">
                          <Instagram className="w-3 h-3" />
                          @{formData.instagram}
                        </div>
                      )}
                      {formData.twitter && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-bone/5 border border-bone/10 rounded text-[10px] text-bone/60">
                          <XIcon className="w-3 h-3" />
                          @{formData.twitter}
                        </div>
                      )}
                      {formData.youtube && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400">
                          <Youtube className="w-3 h-3" />
                          @{formData.youtube}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* View full profile link */}
              <Link
                href={`/usuarios/${formData.username}`}
                className="flex items-center justify-center gap-2 mt-3 py-2 text-xs text-bone/50 hover:text-imperial-gold transition-colors border border-bone/10 rounded-lg hover:border-imperial-gold/30"
              >
                <ExternalLink className="w-3 h-3" />
                Ver perfil completo
              </Link>
            </div>
          </motion.div>

          {/* Right column - Form sections */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-bone/50 mb-2 tracking-wider">
                    IDENTIFICADOR
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-bone/30 font-mono">@</span>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => updateField('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className="w-full pl-8 pr-10 py-3 bg-void/50 border border-bone/10 rounded-lg text-bone font-mono placeholder:text-bone/20 focus:outline-none focus:border-imperial-gold/50 transition-colors"
                      placeholder="usuario"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {usernameStatus === 'checking' && <Loader2 className="w-4 h-4 text-bone/40 animate-spin" />}
                      {usernameStatus === 'available' && <Check className="w-4 h-4 text-green-400" />}
                      {usernameStatus === 'taken' && <AlertCircle className="w-4 h-4 text-red-400" />}
                    </div>
                  </div>
                  {usernameStatus === 'taken' && (
                    <p className="text-red-400 text-xs mt-1 font-mono">IDENTIFICADOR NO DISPONIBLE</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono text-bone/50 mb-2 tracking-wider">
                    NOMBRE VISIBLE
                  </label>
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={(e) => updateField('display_name', e.target.value)}
                    className="w-full px-4 py-3 bg-void/50 border border-bone/10 rounded-lg text-bone placeholder:text-bone/20 focus:outline-none focus:border-imperial-gold/50 transition-colors"
                    placeholder="Tu Nombre"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono text-bone/50 mb-2 tracking-wider">
                    UBICACIÓN DEL SECTOR
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bone/30" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-void/50 border border-bone/10 rounded-lg text-bone placeholder:text-bone/20 focus:outline-none focus:border-imperial-gold/50 transition-colors"
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
                  className="w-full px-4 py-3 bg-void/50 border border-bone/10 rounded-lg text-bone placeholder:text-bone/20 focus:outline-none focus:border-imperial-gold/50 transition-colors resize-none min-h-[120px]"
                  placeholder="Registra tu historial de servicio, especializaciones y logros notables..."
                  maxLength={500}
                />
                <div className="absolute bottom-3 right-3 text-xs font-mono text-bone/30">
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
              status={formData.instagram || formData.twitter || formData.youtube ? 'complete' : 'incomplete'}
            >
              <div className="space-y-4">
                {/* Instagram */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-pink-500/30 flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-pink-400" />
                  </div>
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-bone/30 font-mono text-sm">@</span>
                    <input
                      type="text"
                      value={formData.instagram}
                      onChange={(e) => updateField('instagram', e.target.value.replace('@', ''))}
                      className="w-full pl-8 pr-4 py-2.5 bg-void/50 border border-bone/10 rounded-lg text-bone text-sm placeholder:text-bone/20 focus:outline-none focus:border-pink-500/50 transition-colors"
                      placeholder="instagram"
                    />
                  </div>
                </div>

                {/* Twitter/X */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-bone/5 border border-bone/20 flex items-center justify-center">
                    <XIcon className="w-5 h-5 text-bone/70" />
                  </div>
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-bone/30 font-mono text-sm">@</span>
                    <input
                      type="text"
                      value={formData.twitter}
                      onChange={(e) => updateField('twitter', e.target.value.replace('@', ''))}
                      className="w-full pl-8 pr-4 py-2.5 bg-void/50 border border-bone/10 rounded-lg text-bone text-sm placeholder:text-bone/20 focus:outline-none focus:border-bone/50 transition-colors"
                      placeholder="twitter"
                    />
                  </div>
                </div>

                {/* YouTube */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                    <Youtube className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-bone/30 font-mono text-sm">@</span>
                    <input
                      type="text"
                      value={formData.youtube}
                      onChange={(e) => updateField('youtube', e.target.value.replace('@', ''))}
                      className="w-full pl-8 pr-4 py-2.5 bg-void/50 border border-bone/10 rounded-lg text-bone text-sm placeholder:text-bone/20 focus:outline-none focus:border-red-500/50 transition-colors"
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
              <p className="text-sm text-bone/50 mb-4">
                Declara tu lealtad a hasta 3 facciones. Esto personalizará la apariencia de tu perfil.
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
  creatorType
}: {
  userId: string
  username: string
  creatorStatus: CreatorStatus
  creatorType: CreatorType | null
}) {
  if (creatorStatus === 'approved' && creatorType) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
          <CreatorBadge type={creatorType} size="md" />
          <div>
            <p className="text-bone font-medium">Eres un creador verificado</p>
            <p className="text-sm text-bone/50">Tu badge aparece en tu perfil publico</p>
          </div>
        </div>
        <Link
          href={`/usuarios/${username}`}
          className="flex items-center gap-2 text-sm text-imperial-gold hover:text-imperial-gold/80 transition-colors"
        >
          Ver mi perfil publico
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  if (creatorStatus === 'pending') {
    return (
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-400" />
          <div>
            <p className="text-bone font-medium">Solicitud en revision</p>
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
        <div className="p-4 bg-blood-red/10 border border-blood-red/20 rounded-lg">
          <p className="text-bone/70 text-sm">
            Tu solicitud anterior fue rechazada. Puedes volver a intentarlo
            cuando cumplas todos los requisitos.
          </p>
        </div>
        <CreatorEligibility userId={userId} />
        <Link
          href="/comunidad/creadores/solicitar"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Volver a solicitar
        </Link>
      </div>
    )
  }

  // Default: none status
  return (
    <div className="space-y-4">
      <p className="text-sm text-bone/50">
        Conviertete en creador verificado para obtener mayor visibilidad,
        un badge especial y mostrar tus servicios en tu perfil.
      </p>
      <CreatorEligibility userId={userId} />
      <Link
        href="/comunidad/creadores/solicitar"
        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-500/30 hover:border-purple-500/50 transition-all"
      >
        <Sparkles className="w-4 h-4" />
        Solicitar ser creador
        <ArrowRight className="w-4 h-4" />
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
      className="bg-void-light/30 backdrop-blur-sm border border-bone/10 rounded-lg overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-bone/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            status === 'complete' ? 'bg-green-500/10 text-green-400' : 'bg-bone/5 text-bone/40'
          }`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-display font-medium text-bone">{title}</span>
          {badge && (
            <span className="text-xs font-mono text-bone/40 bg-void px-2 py-0.5 rounded">
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {status === 'complete' && (
            <CircleDot className="w-4 h-4 text-green-400" />
          )}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-bone/40" />
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
            <div className="px-4 pb-4 pt-2 border-t border-bone/5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
