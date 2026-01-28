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
  Store,
  MapPin,
  Phone,
  Mail,
  Globe,
  ImagePlus,
  AlertCircle,
  Check,
  Shield,
  BookOpen,
  Palette,
  Clock,
  Swords,
  Paintbrush,
  Trophy,
  RefreshCw,
  Dice5,
} from 'lucide-react'
import type { StoreType } from '@/lib/types/database.types'
import dynamic from 'next/dynamic'

const LocationPicker = dynamic(() => import('./LocationPicker'), { ssr: false })

interface LocationResult {
  address: string
  city: string
  province: string
  postal_code: string
  latitude: number
  longitude: number
}

const storeTypeOptions: { value: StoreType; label: string; description: string; icon: typeof Shield }[] = [
  { value: 'specialist', label: 'Especialista Warhammer/GW', description: 'Tienda dedicada a Warhammer y productos Games Workshop', icon: Shield },
  { value: 'comics_games', label: 'Comics y juegos', description: 'Tienda de comics, juegos de mesa y rol que vende Warhammer', icon: BookOpen },
  { value: 'general_hobby', label: 'Hobby general', description: 'Tienda de modelismo y hobby que incluye Warhammer', icon: Palette },
  { value: 'online_only', label: 'Solo online', description: 'Tienda sin local fisico, solo venta online', icon: Globe },
]

const serviceOptions = [
  { key: 'gaming_tables', label: 'Mesas de juego', icon: Swords },
  { key: 'painting_workshops', label: 'Talleres de pintura', icon: Paintbrush },
  { key: 'tournaments', label: 'Torneos', icon: Trophy },
  { key: 'painting_service', label: 'Servicio de pintura', icon: Palette },
  { key: 'online_sales', label: 'Venta online', icon: Globe },
  { key: 'secondhand', label: 'Segunda mano', icon: RefreshCw },
  { key: 'board_games', label: 'Juegos de mesa', icon: Dice5 },
  { key: 'rpg', label: 'Juegos de rol', icon: BookOpen },
]

const DAYS = [
  { key: 'mon', label: 'Lunes' },
  { key: 'tue', label: 'Martes' },
  { key: 'wed', label: 'Miercoles' },
  { key: 'thu', label: 'Jueves' },
  { key: 'fri', label: 'Viernes' },
  { key: 'sat', label: 'Sabado' },
  { key: 'sun', label: 'Domingo' },
]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function StoreSubmitForm() {
  const router = useRouter()
  const supabase = createClient()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [storeType, setStoreType] = useState<StoreType>('specialist')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [instagram, setInstagram] = useState('')
  const [facebook, setFacebook] = useState('')
  const [services, setServices] = useState<string[]>([])
  const [location, setLocation] = useState<LocationResult | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [openingHours, setOpeningHours] = useState<Record<string, { open: string; close: string }>>({})

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login?redirect=/comunidad/tiendas/nueva')
    } else {
      setIsAuthenticated(true)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 6) {
      setError('Maximo 6 imagenes permitidas')
      return
    }
    const newImages = [...images, ...files]
    setImages(newImages)
    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setImagePreviewUrls([...imagePreviewUrls, ...newPreviews])
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
    const newPreviews = [...imagePreviewUrls]
    URL.revokeObjectURL(newPreviews[index])
    newPreviews.splice(index, 1)
    setImagePreviewUrls(newPreviews)
  }

  const toggleService = (key: string) => {
    setServices((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    )
  }

  const updateHours = (day: string, field: 'open' | 'close', value: string) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
  }

  const toggleDay = (day: string) => {
    setOpeningHours((prev) => {
      if (prev[day]) {
        const next = { ...prev }
        delete next[day]
        return next
      }
      return { ...prev, [day]: { open: '10:00', close: '20:00' } }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (!name.trim()) throw new Error('El nombre es obligatorio')
      if (!location) throw new Error('Selecciona la ubicacion de la tienda')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Debes iniciar sesion')

      // Upload images
      const uploadedUrls: string[] = []
      for (const image of images) {
        const compressed = await compressImage(image)
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webp`
        const { error: uploadError } = await supabase.storage
          .from('stores')
          .upload(fileName, compressed, { contentType: compressed.type })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('stores')
          .getPublicUrl(fileName)

        uploadedUrls.push(publicUrl)
      }

      const slug = slugify(name) + '-' + Math.random().toString(36).substr(2, 4)

      const { error: insertError } = await supabase
        .from('stores')
        .insert({
          submitted_by: user.id,
          name: name.trim(),
          slug,
          description: description.trim() || null,
          store_type: storeType,
          status: 'pending',
          phone: phone.trim() || null,
          email: email.trim() || null,
          website: website.trim() || null,
          instagram: instagram.trim() || null,
          facebook: facebook.trim() || null,
          address: location.address,
          city: location.city,
          province: location.province || null,
          postal_code: location.postal_code || null,
          latitude: location.latitude,
          longitude: location.longitude,
          images: uploadedUrls,
          services,
          opening_hours: openingHours,
        })

      if (insertError) throw insertError

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar la tienda')
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
        {/* Success card */}
        <div className="relative p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-void-light/90 to-void/80 border border-emerald-500/30 overflow-hidden">
          {/* Corner decorations */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-emerald-500/40" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-emerald-500/40" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-emerald-500/40" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-emerald-500/40" />

          {/* Grid bg */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(16, 185, 129, 0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(16, 185, 129, 0.5) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none" />

          <div className="relative">
            {/* Success icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
              >
                <Check className="w-12 h-12 text-emerald-400" />
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-display font-bold text-bone mb-3"
            >
              Solicitud Enviada
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-bone/60 font-body mb-6 max-w-md mx-auto"
            >
              Tu puesto comercial ha sido registrado en los archivos del Administratum.
              Un escriba revisará tu solicitud y te notificará cuando sea aprobada.
            </motion.p>

            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-mono mb-8"
            >
              <Clock className="w-4 h-4" />
              ESTADO: PENDIENTE DE REVISION
            </motion.div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
              <MapPin className="w-4 h-4 text-emerald-500/40" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
            </div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={() => router.push('/comunidad/tiendas')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-imperial-gold text-void font-display font-bold rounded-xl hover:bg-imperial-gold/90 transition-colors"
              >
                <Store className="w-5 h-5" />
                Ver Directorio
              </button>
              <button
                onClick={() => router.push('/comunidad')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-void-light border border-bone/20 text-bone font-display rounded-xl hover:border-bone/40 transition-colors"
              >
                Volver a Comunidad
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
          REGISTRO IMPERIAL • COMMERCIA IMPERIALIS • SECTOR HISPANIA
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
          className="inline-flex items-center gap-2 text-bone/60 hover:text-imperial-gold transition-colors font-body mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <h1 className="text-3xl md:text-4xl font-display font-bold text-bone">
          Registra tu tienda
        </h1>
        <p className="text-bone/60 font-body mt-2">
          Envia los datos de tu tienda para revision. Una vez aprobada, aparecera en el mapa.
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
        {/* Images */}
        <div className="p-6 bg-void-light rounded-2xl border border-bone/10">
          <h2 className="text-lg font-display font-semibold text-bone mb-4 flex items-center gap-2">
            <ImagePlus className="w-5 h-5 text-imperial-gold" />
            Fotos de la tienda
          </h2>
          <p className="text-sm text-bone/50 font-body mb-4">
            Anade hasta 6 fotos. La primera sera la imagen principal.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {imagePreviewUrls.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-void border border-bone/10">
                <Image src={url} alt={`Preview ${index + 1}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white"
                >
                  <X className="w-3 h-3" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-imperial-gold text-void text-xs font-bold rounded">
                    Principal
                  </span>
                )}
              </div>
            ))}
            {images.length < 6 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-bone/20 hover:border-imperial-gold/50 cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors">
                <Upload className="w-6 h-6 text-bone/40" />
                <span className="text-xs text-bone/40 font-body">Anadir</span>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Basic info */}
        <div className="p-6 bg-void-light rounded-2xl border border-bone/10 space-y-6">
          <h2 className="text-lg font-display font-semibold text-bone flex items-center gap-2">
            <Store className="w-5 h-5 text-imperial-gold" />
            Informacion basica
          </h2>

          <div>
            <label className="block text-sm text-bone/60 mb-2 font-body">Nombre de la tienda *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Wargames Store Madrid"
              maxLength={200}
              className="w-full px-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-bone/60 mb-2 font-body">Descripcion</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe la tienda, que productos ofrece, especialidades..."
              rows={4}
              className="w-full px-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Store type */}
        <div className="p-6 bg-void-light rounded-2xl border border-bone/10">
          <h2 className="text-lg font-display font-semibold text-bone mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-imperial-gold" />
            Tipo de tienda
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {storeTypeOptions.map((option) => {
              const Icon = option.icon
              return (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => setStoreType(option.value)}
                  className={`p-4 rounded-xl border text-left transition-colors ${
                    storeType === option.value
                      ? 'bg-imperial-gold/20 border-imperial-gold/50'
                      : 'bg-void border-bone/10 hover:border-bone/30'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-5 h-5 ${storeType === option.value ? 'text-imperial-gold' : 'text-bone/60'}`} />
                    <span className={`font-display font-semibold ${storeType === option.value ? 'text-imperial-gold' : 'text-bone'}`}>
                      {option.label}
                    </span>
                  </div>
                  <p className="text-xs text-bone/50 font-body">{option.description}</p>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Contact */}
        <div className="p-6 bg-void-light rounded-2xl border border-bone/10 space-y-4">
          <h2 className="text-lg font-display font-semibold text-bone flex items-center gap-2">
            <Phone className="w-5 h-5 text-imperial-gold" />
            Contacto
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-bone/60 mb-2 font-body">Telefono</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-bone/40" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+34 600 000 000"
                  className="w-full pl-11 pr-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-bone/60 mb-2 font-body">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-bone/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tienda@ejemplo.com"
                  className="w-full pl-11 pr-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-bone/60 mb-2 font-body">Web</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-bone/40" />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://tutienda.com"
                  className="w-full pl-11 pr-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-bone/60 mb-2 font-body">Instagram</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@tutienda"
                className="w-full px-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="p-6 bg-void-light rounded-2xl border border-bone/10">
          <h2 className="text-lg font-display font-semibold text-bone mb-4 flex items-center gap-2">
            <Swords className="w-5 h-5 text-imperial-gold" />
            Servicios
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {serviceOptions.map((svc) => {
              const Icon = svc.icon
              const selected = services.includes(svc.key)
              return (
                <motion.button
                  key={svc.key}
                  type="button"
                  onClick={() => toggleService(svc.key)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-colors ${
                    selected
                      ? 'bg-imperial-gold/20 border-imperial-gold/50'
                      : 'bg-void border-bone/10 hover:border-bone/30'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className={`w-5 h-5 ${selected ? 'text-imperial-gold' : 'text-bone/60'}`} />
                  <span className={`text-xs font-body ${selected ? 'text-imperial-gold font-semibold' : 'text-bone/70'}`}>
                    {svc.label}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Location */}
        <div className="p-6 bg-void-light rounded-2xl border border-bone/10">
          <h2 className="text-lg font-display font-semibold text-bone mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-imperial-gold" />
            Ubicacion *
          </h2>
          <LocationPicker value={location} onChange={setLocation} />
        </div>

        {/* Opening Hours */}
        <div className="p-6 bg-void-light rounded-2xl border border-bone/10">
          <h2 className="text-lg font-display font-semibold text-bone mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-imperial-gold" />
            Horario de apertura
          </h2>
          <div className="space-y-2">
            {DAYS.map((day) => {
              const isOpen = !!openingHours[day.key]
              return (
                <div key={day.key} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleDay(day.key)}
                    className={`w-24 text-left text-sm font-body py-2 px-3 rounded-lg border transition-colors ${
                      isOpen
                        ? 'bg-imperial-gold/10 border-imperial-gold/20 text-imperial-gold'
                        : 'bg-void border-bone/10 text-bone/40'
                    }`}
                  >
                    {day.label}
                  </button>
                  {isOpen ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={openingHours[day.key]?.open || '10:00'}
                        onChange={(e) => updateHours(day.key, 'open', e.target.value)}
                        className="px-3 py-2 bg-void border border-bone/10 rounded-lg font-body text-bone text-sm focus:outline-none focus:border-imperial-gold/50 transition-colors"
                      />
                      <span className="text-bone/40 text-sm">-</span>
                      <input
                        type="time"
                        value={openingHours[day.key]?.close || '20:00'}
                        onChange={(e) => updateHours(day.key, 'close', e.target.value)}
                        className="px-3 py-2 bg-void border border-bone/10 rounded-lg font-body text-bone text-sm focus:outline-none focus:border-imperial-gold/50 transition-colors"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-bone/30 font-body">Cerrado</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={isSubmitting || success}
          className="w-full py-4 bg-gradient-to-r from-imperial-gold to-yellow-500 text-void font-display font-bold text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
              Enviando...
            </span>
          ) : (
            'Enviar para revision'
          )}
        </motion.button>
      </motion.form>
    </div>
  )
}
