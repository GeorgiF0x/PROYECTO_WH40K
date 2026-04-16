'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { compressImage } from '@/lib/utils/compressImage'
import { FACTION_ICONS, CATEGORIES, SLUG_TO_CATEGORY } from '@/components/user'
import type { Faction } from '@/components/user'
import {
  Upload,
  X,
  Image as ImageIcon,
  Plus,
  Sparkles,
  Check,
  AlertCircle,
  ArrowLeft,
  Info,
  Search,
} from 'lucide-react'

const uploadSchema = z.object({
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  description: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
  faction_id: z.string().uuid('Facción inválida').optional().or(z.literal('')),
})

type UploadFormData = z.infer<typeof uploadSchema>

interface UploadedImage {
  id: string
  file: File
  preview: string
  uploading: boolean
  uploaded: boolean
  error?: string
  url?: string
}

export default function UploadMiniaturePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Faction state
  const [factions, setFactions] = useState<Faction[]>([])
  const [factionsLoading, setFactionsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [factionSearch, setFactionSearch] = useState('')

  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
  })

  const selectedFaction = watch('faction_id')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/mi-galeria/subir')
    }
  }, [authLoading, isAuthenticated, router])

  // Fetch factions from DB
  useEffect(() => {
    const fetchFactions = async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('id, name, slug, primary_color, secondary_color')
        .eq('category', 'faction')
        .order('name')

      if (!error && data) {
        setFactions(data)
      }
      setFactionsLoading(false)
    }
    fetchFactions()
  }, [])

  // Filter factions by category and search
  const filteredFactions = useMemo(() => {
    let filtered = factions

    if (activeCategory !== 'all') {
      filtered = filtered.filter((f) => SLUG_TO_CATEGORY[f.slug] === activeCategory)
    }

    if (factionSearch) {
      const query = factionSearch.toLowerCase()
      filtered = filtered.filter(
        (f) => f.name.toLowerCase().includes(query) || f.slug.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [factions, activeCategory, factionSearch])

  // Get selected faction details
  const selectedFactionDetails = useMemo(() => {
    if (!selectedFaction) return null
    return factions.find((f) => f.id === selectedFaction) || null
  }, [selectedFaction, factions])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
    addImages(files)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      addImages(files)
    }
  }

  const addImages = (files: File[]) => {
    const newImages: UploadedImage[] = files.slice(0, 10 - images.length).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      uploaded: false,
    }))

    setImages((prev) => [...prev, ...newImages])
  }

  const removeImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id)
      if (img?.preview) {
        URL.revokeObjectURL(img.preview)
      }
      return prev.filter((i) => i.id !== id)
    })
  }

  const uploadImage = async (image: UploadedImage): Promise<string | null> => {
    const compressed = await compressImage(image.file)
    const fileName = `${user?.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webp`

    const { data, error } = await supabase.storage.from('miniatures').upload(fileName, compressed, {
      cacheControl: '3600',
      upsert: false,
      contentType: compressed.type,
    })

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    const { data: urlData } = supabase.storage.from('miniatures').getPublicUrl(data.path)

    return urlData.publicUrl
  }

  const onSubmit = async (data: UploadFormData) => {
    if (images.length === 0 || !user?.id) {
      return
    }

    setIsSubmitting(true)
    setUploadProgress(0)
    setSubmitError(null)

    // Upload all images
    const uploadedUrls: string[] = []
    for (let i = 0; i < images.length; i++) {
      const img = images[i]
      setImages((prev) => prev.map((p) => (p.id === img.id ? { ...p, uploading: true } : p)))

      const url = await uploadImage(img)

      if (url) {
        uploadedUrls.push(url)
        setImages((prev) =>
          prev.map((p) => (p.id === img.id ? { ...p, uploading: false, uploaded: true, url } : p))
        )
      } else {
        setImages((prev) =>
          prev.map((p) =>
            p.id === img.id ? { ...p, uploading: false, error: 'Error al subir' } : p
          )
        )
      }

      setUploadProgress(((i + 1) / images.length) * 100)
    }

    if (uploadedUrls.length === 0) {
      setIsSubmitting(false)
      setSubmitError('No se pudo subir ninguna imagen')
      return
    }

    // Create miniature record
    const factionId = data.faction_id || null
    const { data: newMiniature, error } = await supabase
      .from('miniatures')
      .insert({
        user_id: user.id,
        title: data.title,
        description: data.description || null,
        images: uploadedUrls,
        thumbnail_url: uploadedUrls[0],
        faction_id: factionId,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating miniature:', error)
      setSubmitError(error.message + (error.details ? ` — ${error.details}` : ''))
      setIsSubmitting(false)
      return
    }

    // Generate embedding for semantic search (async, don't wait)
    if (newMiniature?.id) {
      fetch('/api/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ miniatureId: newMiniature.id }),
      }).catch(console.error)
    }

    setSubmitSuccess(true)
    setTimeout(() => {
      router.push('/mi-galeria')
    }, 2000)
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center pb-16 pt-24">
        <motion.div
          className="h-8 w-8 rounded-full border-2 border-bone/20 border-t-necron-dark"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-16 pt-24">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(13,155,138,0.05)_0%,transparent_60%)]" />
      </div>

      <div className="relative z-10 px-6">
        <div className="mx-auto max-w-4xl">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="mb-8 flex items-center gap-2 text-bone/60 transition-colors hover:text-necron-dark"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-body">Volver</span>
          </motion.button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="relative mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-necron-teal/30 bg-necron-teal/10"
            >
              <motion.div
                className="absolute inset-0 rounded-full bg-necron-teal/15 blur-md"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <svg
                width="28"
                height="37"
                viewBox="0 0 24 32"
                fill="none"
                className="relative text-necron-dark"
              >
                <ellipse
                  cx="12"
                  cy="9"
                  rx="6"
                  ry="8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                <line x1="12" y1="17" x2="12" y2="30" stroke="currentColor" strokeWidth="1.5" />
                <line x1="6" y1="22" x2="18" y2="22" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1" fill="none" />
              </svg>
            </motion.div>

            <h1 className="mb-2 font-display text-3xl font-bold tracking-wide md:text-4xl">
              <span className="mb-1 block text-lg text-necron-dark/50">SOLEMNACE //</span>
              <span className="bg-gradient-to-r from-necron-dark via-necron to-necron-dark bg-clip-text text-transparent">
                Registro de Espécimen
              </span>
            </h1>
            <p className="font-body text-bone/60">Preserva tu obra en las Galerías Prismáticas</p>
          </motion.div>

          {/* Success State */}
          <AnimatePresence>
            {submitSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-void/90 backdrop-blur-xl"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full border border-green-500/40 bg-green-500/20"
                  >
                    <Check className="h-12 w-12 text-green-400" />
                  </motion.div>
                  <h2 className="mb-2 font-display text-2xl font-bold text-bone">
                    Registro Completado
                  </h2>
                  <p className="text-bone/60">Redirigiendo a tu galería...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8"
          >
            {/* Image Upload Area */}
            <div className="rounded-2xl border border-bone/10 bg-void-light/30 p-6">
              <label className="mb-4 block font-display text-lg font-semibold text-bone">
                Imágenes <span className="text-necron-dark">*</span>
              </label>

              {/* Drop Zone with corner brackets */}
              <motion.div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
                  isDragging
                    ? 'border-necron-teal bg-necron-teal/10'
                    : 'border-bone/20 hover:border-necron-teal/50'
                }`}
                animate={{
                  scale: isDragging ? 1.02 : 1,
                }}
              >
                {/* Corner brackets */}
                <div className="absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-necron-teal/40" />
                <div className="absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-necron-teal/40" />
                <div className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-necron-teal/40" />
                <div className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-necron-teal/40" />

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />

                <motion.div animate={{ y: isDragging ? -5 : 0 }} className="pointer-events-none">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-bone/5">
                    <ImageIcon className="h-8 w-8 text-bone/40" />
                  </div>

                  <p className="mb-2 font-body text-bone/80">
                    Arrastra tus imágenes aquí o{' '}
                    <span className="text-necron-dark">haz clic para seleccionar</span>
                  </p>
                  <p className="text-sm text-bone/40">PNG, JPG o WEBP. Máximo 10 imágenes.</p>
                </motion.div>
              </motion.div>

              {/* Image Preview Grid */}
              {images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5"
                >
                  <AnimatePresence>
                    {images.map((img, index) => (
                      <motion.div
                        key={img.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="group relative aspect-square overflow-hidden rounded-xl"
                      >
                        <img src={img.preview} alt="" className="h-full w-full object-cover" />

                        {/* Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-void/60 opacity-0 transition-opacity group-hover:opacity-100">
                          <motion.button
                            type="button"
                            onClick={() => removeImage(img.id)}
                            className="rounded-full bg-red-500/80 p-2 text-white"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <X className="h-4 w-4" />
                          </motion.button>
                        </div>

                        {/* Status indicator */}
                        {img.uploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-void/80">
                            <motion.div
                              className="h-8 w-8 rounded-full border-2 border-bone/20 border-t-necron-dark"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                          </div>
                        )}

                        {img.uploaded && (
                          <div className="absolute right-2 top-2 rounded-full bg-green-500 p-1">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}

                        {img.error && (
                          <div className="absolute right-2 top-2 rounded-full bg-red-500 p-1">
                            <AlertCircle className="h-3 w-3 text-white" />
                          </div>
                        )}

                        {/* Main image badge */}
                        {index === 0 && (
                          <div className="absolute left-2 top-2 rounded bg-necron-teal px-2 py-1 text-xs font-bold text-void">
                            Principal
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Add more button */}
                  {images.length < 10 && (
                    <motion.label
                      className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-bone/20 transition-colors hover:border-necron-teal/50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Plus className="h-8 w-8 text-bone/40" />
                    </motion.label>
                  )}
                </motion.div>
              )}

              {images.length === 0 && (
                <p className="mt-2 flex items-center gap-1 text-sm text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  Debes subir al menos una imagen
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="mb-2 block font-display text-lg font-semibold text-bone">
                Título <span className="text-necron-dark">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Ultramarines Captain"
                className={`w-full rounded-xl border bg-void/50 px-4 py-4 font-body text-bone transition-colors placeholder:text-bone/30 focus:outline-none ${
                  errors.title ? 'border-red-500/50' : 'border-bone/10 focus:border-necron-teal/50'
                }`}
                {...register('title')}
              />
              {errors.title && (
                <p className="mt-2 flex items-center gap-1 text-sm text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block font-display text-lg font-semibold text-bone">
                Descripción
              </label>
              <textarea
                rows={4}
                placeholder="Describe tu miniatura, técnicas usadas, historia..."
                className="w-full resize-none rounded-xl border border-bone/10 bg-void/50 px-4 py-4 font-body text-bone transition-colors placeholder:text-bone/30 focus:border-necron-teal/50 focus:outline-none"
                {...register('description')}
              />
            </div>

            {/* Faction Selection */}
            <div className="rounded-2xl border border-bone/10 bg-void-light/30 p-6">
              <label className="mb-4 block font-display text-lg font-semibold text-bone">
                Facción
              </label>

              {/* Selected faction badge */}
              {selectedFactionDetails && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 flex items-center gap-3 rounded-xl border border-necron-teal/30 p-3"
                  style={{
                    background: `linear-gradient(135deg, ${selectedFactionDetails.primary_color}20, ${selectedFactionDetails.secondary_color || selectedFactionDetails.primary_color}10)`,
                  }}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background: `linear-gradient(135deg, ${selectedFactionDetails.primary_color || '#666'}, ${selectedFactionDetails.secondary_color || '#333'})`,
                    }}
                  >
                    {FACTION_ICONS[selectedFactionDetails.slug] ? (
                      <Image
                        src={FACTION_ICONS[selectedFactionDetails.slug]}
                        alt={selectedFactionDetails.name}
                        width={20}
                        height={20}
                        className="invert"
                      />
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-white/30" />
                    )}
                  </div>
                  <span className="flex-1 font-body text-sm font-medium text-necron-dark">
                    {selectedFactionDetails.name}
                  </span>
                  <motion.button
                    type="button"
                    onClick={() => setValue('faction_id', '')}
                    className="p-1 text-bone/40 transition-colors hover:text-bone"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </motion.div>
              )}

              {/* Category tabs */}
              <div className="scrollbar-none mb-3 flex gap-1 overflow-x-auto pb-2">
                {CATEGORIES.map((cat) => (
                  <motion.button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-body text-xs transition-all ${
                      activeCategory === cat.id
                        ? 'bg-necron-teal text-void'
                        : 'border border-bone/10 bg-void text-bone/60 hover:border-bone/30 hover:text-bone'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {cat.icon && (
                      <div className="relative h-4 w-4">
                        <Image
                          src={cat.icon}
                          alt={cat.label}
                          fill
                          className={activeCategory === cat.id ? '' : 'opacity-60 invert'}
                        />
                      </div>
                    )}
                    {cat.label}
                  </motion.button>
                ))}
              </div>

              {/* Faction search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/40" />
                <input
                  type="text"
                  placeholder="Buscar facción..."
                  value={factionSearch}
                  onChange={(e) => setFactionSearch(e.target.value)}
                  className="w-full rounded-lg border border-bone/10 bg-void py-2 pl-9 pr-4 font-body text-sm text-bone placeholder:text-bone/30 focus:border-necron-teal/50 focus:outline-none"
                />
              </div>

              {/* Faction grid */}
              {factionsLoading ? (
                <div className="flex h-[200px] items-center justify-center">
                  <motion.div
                    className="h-6 w-6 rounded-full border-2 border-bone/20 border-t-necron-dark"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              ) : (
                <div className="scrollbar-thin scrollbar-thumb-bone/20 h-[220px] overflow-y-auto pr-1">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {filteredFactions.map((faction) => {
                      const isSelected = selectedFaction === faction.id
                      const iconPath = FACTION_ICONS[faction.slug]

                      return (
                        <motion.button
                          key={faction.id}
                          type="button"
                          onClick={() => setValue('faction_id', isSelected ? '' : faction.id)}
                          className={`relative rounded-xl border p-3 text-left transition-all ${
                            isSelected
                              ? 'border-necron-teal'
                              : 'border-bone/10 hover:border-bone/30'
                          }`}
                          style={{
                            background: isSelected
                              ? `linear-gradient(135deg, ${faction.primary_color}20, ${faction.secondary_color}10)`
                              : 'rgba(26,26,46,0.5)',
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                              style={{
                                background: `linear-gradient(135deg, ${faction.primary_color || '#666'}, ${faction.secondary_color || '#333'})`,
                              }}
                            >
                              {iconPath ? (
                                <Image
                                  src={iconPath}
                                  alt={faction.name}
                                  width={20}
                                  height={20}
                                  className="invert"
                                />
                              ) : (
                                <div className="h-4 w-4 rounded-full bg-white/30" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p
                                className={`truncate font-body text-xs font-medium ${
                                  isSelected ? 'text-necron-dark' : 'text-bone/80'
                                }`}
                              >
                                {faction.name}
                              </p>
                            </div>

                            {isSelected && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <Check className="h-4 w-4 text-necron-dark" />
                              </motion.div>
                            )}
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>

                  {filteredFactions.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center py-8">
                      <p className="font-body text-sm text-bone/50">No se encontraron facciones</p>
                      <button
                        type="button"
                        onClick={() => {
                          setFactionSearch('')
                          setActiveCategory('all')
                        }}
                        className="mt-2 text-xs text-necron-dark hover:underline"
                      >
                        Limpiar filtros
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Info Box */}
            <motion.div
              className="flex items-start gap-3 rounded-xl border border-necron-teal/20 bg-necron-teal/5 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-necron-dark" />
              <div className="font-body text-sm text-bone/70">
                <p className="mb-1 font-semibold text-bone">Consejos para mejores fotos:</p>
                <ul className="list-inside list-disc space-y-1 text-bone/60">
                  <li>Usa buena iluminación, preferiblemente luz natural</li>
                  <li>Fondo neutro para destacar la miniatura</li>
                  <li>Múltiples ángulos muestran mejor tu trabajo</li>
                </ul>
              </div>
            </motion.div>

            {/* Error message */}
            <AnimatePresence>
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4"
                >
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                  <div className="font-body text-sm">
                    <p className="mb-1 font-semibold text-red-400">Error al registrar miniatura</p>
                    <p className="text-red-400/80">{submitError}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upload Progress */}
            {isSubmitting && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-bone/60">Subiendo imágenes...</span>
                  <span className="font-semibold text-necron-dark">
                    {Math.round(uploadProgress)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full border border-bone/10 bg-void-light">
                  <motion.div
                    className="h-full bg-gradient-to-r from-necron-dark to-yellow-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting || images.length === 0}
              className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-necron-dark via-necron to-necron-dark py-4 font-display text-sm font-bold uppercase tracking-wider text-void disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundSize: '200% 100%' }}
              whileHover={
                !isSubmitting && images.length > 0
                  ? { scale: 1.01, backgroundPosition: '100% 0' }
                  : {}
              }
              whileTap={!isSubmitting && images.length > 0 ? { scale: 0.99 } : {}}
              animate={
                !isSubmitting && images.length > 0
                  ? {
                      boxShadow: [
                        '0 4px 20px rgba(13, 155, 138, 0.3)',
                        '0 4px 40px rgba(13, 155, 138, 0.5)',
                        '0 4px 20px rgba(13, 155, 138, 0.3)',
                      ],
                    }
                  : {}
              }
              transition={{ duration: 2, repeat: Infinity }}
            >
              {/* Shimmer */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{ backgroundSize: '200% 100%' }}
                animate={
                  !isSubmitting && images.length > 0
                    ? { backgroundPosition: ['200% 0', '-200% 0'] }
                    : {}
                }
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />

              <span className="relative flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <motion.div
                      className="h-5 w-5 rounded-full border-2 border-void/30 border-t-void"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Publicar Miniatura
                  </>
                )}
              </span>
            </motion.button>
          </motion.form>
        </div>
      </div>
    </div>
  )
}
