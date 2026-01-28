'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/utils/compressImage'
import {
  ArrowLeft,
  Upload,
  X,
  Calendar,
  MapPin,
  Clock,
  Users,
  Trophy,
  Paintbrush,
  Swords,
  BookOpen,
  PartyPopper,
  Users2,
  AlertCircle,
  Check,
  ImagePlus,
  Banknote,
  Gamepad2,
  Shield,
  Store,
} from 'lucide-react'
import type { EventType } from '@/lib/types/database.types'
import dynamic from 'next/dynamic'

const LocationPicker = dynamic(() => import('@/components/community/LocationPicker'), { ssr: false })

interface LocationResult {
  address: string
  city: string
  province: string
  postal_code: string
  latitude: number
  longitude: number
}

const eventTypeOptions: {
  value: EventType
  label: string
  description: string
  icon: typeof Trophy
  color: string
}[] = [
  {
    value: 'tournament',
    label: 'Torneo',
    description: 'Competicion oficial o casual con rankings',
    icon: Trophy,
    color: 'text-amber-400 border-amber-500/50 bg-amber-500/10'
  },
  {
    value: 'painting_workshop',
    label: 'Taller de Pintura',
    description: 'Clases, demos o sesiones de pintura',
    icon: Paintbrush,
    color: 'text-purple-400 border-purple-500/50 bg-purple-500/10'
  },
  {
    value: 'casual_play',
    label: 'Partidas Casuales',
    description: 'Partidas amistosas sin presion',
    icon: Swords,
    color: 'text-blue-400 border-blue-500/50 bg-blue-500/10'
  },
  {
    value: 'campaign',
    label: 'Campaña',
    description: 'Campaña narrativa con varias sesiones',
    icon: BookOpen,
    color: 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10'
  },
  {
    value: 'release_event',
    label: 'Lanzamiento',
    description: 'Evento de lanzamiento de producto',
    icon: PartyPopper,
    color: 'text-red-400 border-red-500/50 bg-red-500/10'
  },
  {
    value: 'meetup',
    label: 'Quedada',
    description: 'Encuentro social de la comunidad',
    icon: Users2,
    color: 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10'
  },
]

const gameSystemOptions = [
  'Warhammer 40,000',
  'Age of Sigmar',
  'Horus Heresy',
  'Kill Team',
  'Warcry',
  'Necromunda',
  'Blood Bowl',
  'Adeptus Titanicus',
  'Aeronautica Imperialis',
  'The Old World',
  'Otro',
]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function EventSubmitForm() {
  const router = useRouter()
  const supabase = createClient()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isCreator, setIsCreator] = useState(false)
  const [userStores, setUserStores] = useState<{ id: string; name: string }[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [eventType, setEventType] = useState<EventType>('casual_play')
  const [gameSystem, setGameSystem] = useState('')
  const [customGameSystem, setCustomGameSystem] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('10:00')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [venueName, setVenueName] = useState('')
  const [location, setLocation] = useState<LocationResult | null>(null)
  const [maxParticipants, setMaxParticipants] = useState<number | ''>('')
  const [entryFee, setEntryFee] = useState<number | ''>('')
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [isOfficial, setIsOfficial] = useState(false)
  const [selectedStoreId, setSelectedStoreId] = useState<string | ''>('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login?redirect=/comunidad/eventos/nuevo')
      return
    }

    setUserId(user.id)
    setIsAuthenticated(true)

    // Check if user is a creator
    const { data: profile } = await supabase
      .from('profiles')
      .select('creator_status')
      .eq('id', user.id)
      .single()

    if (profile?.creator_status === 'approved') {
      setIsCreator(true)
    }

    // Check if user has any approved stores
    const { data: stores } = await supabase
      .from('stores')
      .select('id, name')
      .eq('submitted_by', user.id)
      .eq('status', 'approved')

    if (stores && stores.length > 0) {
      setUserStores(stores)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImage(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const removeCoverImage = () => {
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview)
    }
    setCoverImage(null)
    setCoverPreview(null)
  }

  const canCreateOfficial = isCreator || userStores.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (!name.trim()) throw new Error('El nombre del evento es obligatorio')
      if (!startDate) throw new Error('La fecha de inicio es obligatoria')
      if (!location) throw new Error('Selecciona la ubicacion del evento')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Debes iniciar sesion')

      // Upload cover image if exists
      let coverImageUrl: string | null = null
      if (coverImage) {
        const compressed = await compressImage(coverImage)
        const fileName = `events/${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webp`
        const { error: uploadError } = await supabase.storage
          .from('stores')
          .upload(fileName, compressed, { contentType: compressed.type })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('stores')
          .getPublicUrl(fileName)

        coverImageUrl = publicUrl
      }

      const slug = slugify(name) + '-' + Math.random().toString(36).substr(2, 4)

      // Combine date and time
      const startDateTime = `${startDate}T${startTime}:00`
      const endDateTime = endDate && endTime ? `${endDate}T${endTime}:00` : null

      const finalGameSystem = gameSystem === 'Otro' ? customGameSystem : gameSystem

      const { error: insertError } = await supabase
        .from('events')
        .insert({
          organizer_id: user.id,
          store_id: selectedStoreId || null,
          name: name.trim(),
          slug,
          description: description.trim() || null,
          event_type: eventType,
          game_system: finalGameSystem || null,
          start_date: startDateTime,
          end_date: endDateTime,
          venue_name: venueName.trim() || null,
          address: location.address,
          city: location.city,
          province: location.province || null,
          postal_code: location.postal_code || null,
          latitude: location.latitude,
          longitude: location.longitude,
          max_participants: maxParticipants || null,
          entry_fee: entryFee || null,
          cover_image: coverImageUrl,
          is_official: isOfficial && canCreateOfficial,
          status: 'upcoming',
        })

      if (insertError) throw insertError

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el evento')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="animate-pulse text-bone/60">Verificando sesion...</div>
      </div>
    )
  }

  // Success page
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center py-12"
      >
        <div className="relative p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-void-light/90 to-void/80 border border-amber-500/30 overflow-hidden">
          {/* Corner decorations */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-amber-500/40" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-amber-500/40" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-amber-500/40" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-amber-500/40" />

          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent pointer-events-none" />

          <div className="relative">
            {/* Success icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
              >
                <Check className="w-12 h-12 text-amber-400" />
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-display font-bold text-bone mb-3"
            >
              Evento Registrado
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-bone/60 font-body mb-6 max-w-md mx-auto"
            >
              Tu evento ha sido inscrito en el Chronus Eventus.
              Los guerreros del Imperium podran verlo y unirse.
            </motion.p>

            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-mono mb-8"
            >
              <Clock className="w-4 h-4" />
              ESTADO: PUBLICADO
            </motion.div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
              <Calendar className="w-4 h-4 text-amber-500/40" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
            </div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={() => router.push('/comunidad/eventos')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-void font-display font-bold rounded-xl hover:bg-amber-400 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                Ver Calendario
              </button>
              <button
                onClick={() => {
                  setSuccess(false)
                  setName('')
                  setDescription('')
                  setStartDate('')
                  setEndDate('')
                  setLocation(null)
                  setCoverImage(null)
                  setCoverPreview(null)
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-void-light border border-bone/20 text-bone font-display rounded-xl hover:border-bone/40 transition-colors"
              >
                Crear Otro Evento
              </button>
            </motion.div>
          </div>
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xs text-bone/30 font-mono mt-6 tracking-wider"
        >
          CHRONUS EVENTUS • REGISTRO TEMPORAL • ADMINISTRATUM
        </motion.p>
      </motion.div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-bone/60 hover:text-amber-400 transition-colors font-body mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-xs font-mono text-amber-500/80 tracking-widest">CHRONUS EVENTUS</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-display font-bold text-bone">
          Crear Nuevo Evento
        </h1>
        <p className="text-bone/60 font-body mt-2">
          Registra un evento en el calendario imperial para que otros guerreros puedan unirse.
        </p>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-body">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        {/* Cover image */}
        <div className="p-6 bg-void-light rounded-2xl border border-bone/10">
          <h2 className="text-lg font-display font-semibold text-bone mb-4 flex items-center gap-2">
            <ImagePlus className="w-5 h-5 text-amber-500" />
            Imagen de Portada
          </h2>
          <p className="text-sm text-bone/50 font-body mb-4">
            Opcional. Una imagen atractiva puede aumentar la asistencia.
          </p>
          {coverPreview ? (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-void border border-bone/10">
              <Image src={coverPreview} alt="Cover preview" fill className="object-cover" />
              <button
                type="button"
                onClick={removeCoverImage}
                className="absolute top-2 right-2 p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="block aspect-video rounded-xl border-2 border-dashed border-bone/20 hover:border-amber-500/50 cursor-pointer flex flex-col items-center justify-center gap-3 transition-colors bg-void/50">
              <Upload className="w-8 h-8 text-bone/40" />
              <span className="text-sm text-bone/40 font-body">Click para subir imagen</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>

        {/* Event type */}
        <div className="p-6 bg-void-light rounded-2xl border border-bone/10">
          <h2 className="text-lg font-display font-semibold text-bone mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Tipo de Evento *
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {eventTypeOptions.map((option) => {
              const Icon = option.icon
              const isSelected = eventType === option.value
              return (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => setEventType(option.value)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? option.color
                      : 'bg-void border-bone/10 hover:border-bone/30'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-5 h-5 ${isSelected ? '' : 'text-bone/60'}`} />
                    <span className={`font-display font-semibold ${isSelected ? '' : 'text-bone'}`}>
                      {option.label}
                    </span>
                  </div>
                  <p className="text-xs text-bone/50 font-body">{option.description}</p>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Basic info */}
        <div className="p-6 bg-void-light rounded-2xl border border-bone/10 space-y-6">
          <h2 className="text-lg font-display font-semibold text-bone flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            Informacion del Evento
          </h2>

          <div>
            <label className="block text-sm text-bone/60 mb-2 font-body">Nombre del evento *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Torneo de Primavera 40K"
              maxLength={200}
              className="w-full px-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-bone/60 mb-2 font-body">Descripcion</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el evento, reglas, premios, etc..."
              rows={4}
              className="w-full px-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-bone/60 mb-2 font-body">Sistema de juego</label>
            <select
              value={gameSystem}
              onChange={(e) => setGameSystem(e.target.value)}
              className="w-full px-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone focus:outline-none focus:border-amber-500/50 transition-colors"
            >
              <option value="">Selecciona un sistema...</option>
              {gameSystemOptions.map((system) => (
                <option key={system} value={system}>{system}</option>
              ))}
            </select>
            {gameSystem === 'Otro' && (
              <input
                type="text"
                value={customGameSystem}
                onChange={(e) => setCustomGameSystem(e.target.value)}
                placeholder="Especifica el sistema..."
                className="mt-3 w-full px-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            )}
          </div>
        </div>

        {/* Date & Time */}
        <div className="p-6 bg-void-light rounded-2xl border border-bone/10 space-y-4">
          <h2 className="text-lg font-display font-semibold text-bone flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Fecha y Hora
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-bone/60 mb-2 font-body">Fecha inicio *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-bone/60 mb-2 font-body">Hora inicio</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-bone/60 mb-2 font-body">Fecha fin (opcional)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-bone/60 mb-2 font-body">Hora fin</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={!endDate}
                className="w-full px-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone focus:outline-none focus:border-amber-500/50 transition-colors disabled:opacity-40"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="p-6 bg-void-light rounded-2xl border border-bone/10 space-y-4">
          <h2 className="text-lg font-display font-semibold text-bone flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-500" />
            Ubicacion *
          </h2>

          <div>
            <label className="block text-sm text-bone/60 mb-2 font-body">Nombre del lugar</label>
            <input
              type="text"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="Ej: Centro Cultural, Tienda X, Local..."
              className="w-full px-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>

          <LocationPicker value={location} onChange={setLocation} />
        </div>

        {/* Capacity & Fee */}
        <div className="p-6 bg-void-light rounded-2xl border border-bone/10 space-y-4">
          <h2 className="text-lg font-display font-semibold text-bone flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            Capacidad y Precio
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-bone/60 mb-2 font-body">Maximo participantes</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-bone/40" />
                <input
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Sin limite"
                  min={1}
                  className="w-full pl-11 pr-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-bone/60 mb-2 font-body">Precio entrada (EUR)</label>
              <div className="relative">
                <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-bone/40" />
                <input
                  type="number"
                  value={entryFee}
                  onChange={(e) => setEntryFee(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Gratis"
                  min={0}
                  step={0.01}
                  className="w-full pl-11 pr-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Official toggle - only for creators/store owners */}
        {canCreateOfficial && (
          <div className="p-6 bg-void-light rounded-2xl border border-imperial-gold/20 space-y-4">
            <h2 className="text-lg font-display font-semibold text-bone flex items-center gap-2">
              <Shield className="w-5 h-5 text-imperial-gold" />
              Evento Oficial
            </h2>
            <p className="text-sm text-bone/50 font-body">
              Como {isCreator ? 'creador verificado' : 'propietario de tienda'}, puedes marcar este evento como oficial.
            </p>

            <motion.button
              type="button"
              onClick={() => setIsOfficial(!isOfficial)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                isOfficial
                  ? 'bg-imperial-gold/20 border-imperial-gold/50 text-imperial-gold'
                  : 'bg-void border-bone/10 text-bone/60 hover:border-bone/30'
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className={`w-3 h-3 rounded-full transition-colors ${isOfficial ? 'bg-imperial-gold' : 'bg-bone/30'}`} />
              <span className="font-body">Marcar como evento oficial</span>
            </motion.button>

            {/* Store selector if user has stores */}
            {userStores.length > 0 && isOfficial && (
              <div className="mt-4">
                <label className="block text-sm text-bone/60 mb-2 font-body">Organizado por tienda (opcional)</label>
                <select
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  className="w-full px-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone focus:outline-none focus:border-imperial-gold/50 transition-colors"
                >
                  <option value="">Sin tienda asociada</option>
                  {userStores.map((store) => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={isSubmitting || success}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-400 text-void font-display font-bold text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div
                className="w-5 h-5 border-2 border-void/30 border-t-void rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              Registrando en el Chronus...
            </span>
          ) : (
            'Crear Evento'
          )}
        </motion.button>
      </motion.form>
    </div>
  )
}
