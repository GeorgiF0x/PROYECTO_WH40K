'use client'

import { useState, useEffect, useCallback, useMemo, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { compressImage } from '@/lib/utils/compressImage'
import { FACTION_ICONS, CATEGORIES, SLUG_TO_CATEGORY } from '@/components/user'
import type { Faction } from '@/components/user'
import {
  Save,
  X,
  Image as ImageIcon,
  Plus,
  Check,
  AlertCircle,
  ArrowLeft,
  Trash2,
  GripVertical,
  Search,
} from 'lucide-react'
import type { Miniature } from '@/lib/types/database.types'

const editSchema = z.object({
  title: z
    .string()
    .min(3, 'El titulo debe tener al menos 3 caracteres')
    .max(100, 'Maximo 100 caracteres'),
  description: z.string().max(2000, 'Maximo 2000 caracteres').optional(),
  faction_id: z.string().optional(),
})

type EditFormData = z.infer<typeof editSchema>

interface ExistingImage {
  url: string
  isNew: false
}

interface NewImage {
  id: string
  file: File
  preview: string
  uploading: boolean
  uploaded: boolean
  error?: string
  url?: string
  isNew: true
}

type ImageItem = ExistingImage | NewImage

export default function EditMiniaturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [miniature, setMiniature] = useState<Miniature | null>(null)
  const [images, setImages] = useState<ImageItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
    reset,
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
  })

  const selectedFaction = watch('faction_id')

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

  // Load miniature data
  useEffect(() => {
    const loadMiniature = async () => {
      if (!id) return

      const { data, error } = await supabase.from('miniatures').select('*').eq('id', id).single()

      if (error || !data) {
        setError('No se encontro la miniatura')
        setIsLoading(false)
        return
      }

      // Check ownership
      if (data.user_id !== user?.id) {
        setError('No tienes permiso para editar esta miniatura')
        setIsLoading(false)
        return
      }

      setMiniature(data)
      reset({
        title: data.title,
        description: data.description || '',
        faction_id: data.faction_id || undefined,
      })

      // Load existing images
      setImages(
        (data.images || []).map((url: string) => ({
          url,
          isNew: false,
        }))
      )

      setIsLoading(false)
    }

    if (user?.id) {
      loadMiniature()
    }
  }, [id, user?.id, reset])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/mi-galeria/editar/${id}`)
    }
  }, [authLoading, isAuthenticated, router, id])

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
    const newImages: NewImage[] = files.slice(0, 10 - images.length).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      uploaded: false,
      isNew: true,
    }))

    setImages((prev) => [...prev, ...newImages])
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      const img = prev[index]
      if (img.isNew && 'preview' in img) {
        URL.revokeObjectURL(img.preview)
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  const moveImage = (from: number, to: number) => {
    setImages((prev) => {
      const newImages = [...prev]
      const [removed] = newImages.splice(from, 1)
      newImages.splice(to, 0, removed)
      return newImages
    })
  }

  const uploadImage = async (image: NewImage): Promise<string | null> => {
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

  const onSubmit = async (data: EditFormData) => {
    if (images.length === 0 || !user?.id || !miniature) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    // Upload new images
    const finalUrls: string[] = []
    for (const img of images) {
      if (img.isNew) {
        setImages((prev) =>
          prev.map((p) => (p.isNew && p.id === img.id ? { ...p, uploading: true } : p))
        )

        const url = await uploadImage(img)

        if (url) {
          finalUrls.push(url)
          setImages((prev) =>
            prev.map((p) =>
              p.isNew && p.id === img.id ? { ...p, uploading: false, uploaded: true, url } : p
            )
          )
        } else {
          setImages((prev) =>
            prev.map((p) =>
              p.isNew && p.id === img.id ? { ...p, uploading: false, error: 'Error al subir' } : p
            )
          )
        }
      } else {
        finalUrls.push(img.url)
      }
    }

    if (finalUrls.length === 0) {
      setError('No se pudieron subir las imagenes')
      setIsSubmitting(false)
      return
    }

    // Check if title/description changed for embedding regeneration
    const contentChanged =
      data.title !== miniature.title || data.description !== miniature.description

    // Update miniature record
    const { error: updateError } = await supabase
      .from('miniatures')
      .update({
        title: data.title,
        description: data.description || null,
        images: finalUrls,
        thumbnail_url: finalUrls[0],
        faction_id: data.faction_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', miniature.id)

    if (updateError) {
      console.error('Error updating miniature:', updateError)
      setError('Error al actualizar la miniatura')
      setIsSubmitting(false)
      return
    }

    // Regenerate embedding if content changed
    if (contentChanged) {
      fetch('/api/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ miniatureId: miniature.id }),
      }).catch(console.error)
    }

    setSubmitSuccess(true)
    setTimeout(() => {
      router.push('/mi-galeria')
    }, 2000)
  }

  const handleDelete = async () => {
    if (!miniature) return

    setIsDeleting(true)

    // Delete images from storage
    for (const img of images) {
      if (!img.isNew) {
        try {
          // Extract path from URL
          const url = new URL(img.url)
          const path = url.pathname.split('/storage/v1/object/public/miniatures/')[1]
          if (path) {
            await supabase.storage.from('miniatures').remove([path])
          }
        } catch (e) {
          console.error('Error deleting image:', e)
        }
      }
    }

    // Delete miniature record
    const { error } = await supabase.from('miniatures').delete().eq('id', miniature.id)

    if (error) {
      console.error('Error deleting miniature:', error)
      setError('Error al eliminar la miniatura')
      setIsDeleting(false)
      return
    }

    router.push('/mi-galeria')
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center pb-16 pt-24">
        <motion.div
          className="h-8 w-8 rounded-full border-2 border-bone/20 border-t-imperial-gold"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }

  if (error && !miniature) {
    return (
      <div className="flex min-h-screen items-center justify-center pb-16 pt-24">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-400" />
          <h1 className="mb-2 font-display text-2xl font-bold text-bone">Error</h1>
          <p className="mb-6 text-bone/60">{error}</p>
          <button
            onClick={() => router.push('/mi-galeria')}
            className="rounded-lg bg-imperial-gold px-6 py-3 font-display font-bold text-void"
          >
            Volver a Mi Galeria
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-16 pt-24">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.05)_0%,transparent_60%)]" />
      </div>

      <div className="relative z-10 px-6">
        <div className="mx-auto max-w-4xl">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="mb-8 flex items-center gap-2 text-bone/60 transition-colors hover:text-imperial-gold"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-body">Volver</span>
          </motion.button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 flex items-center justify-between"
          >
            <div>
              <h1 className="mb-2 font-display text-3xl font-bold tracking-wide md:text-4xl">
                <span className="text-bone">Editar </span>
                <span className="text-gradient">Miniatura</span>
              </h1>
              <p className="font-body text-bone/60">Modifica los detalles de tu miniatura</p>
            </div>

            <motion.button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-red-400 transition-colors hover:bg-red-500/10"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Trash2 className="h-5 w-5" />
              <span className="hidden font-body sm:inline">Eliminar</span>
            </motion.button>
          </motion.div>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-void/90 p-6 backdrop-blur-xl"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-md rounded-2xl border border-bone/20 bg-void-light p-8"
                >
                  <div className="mb-6 text-center">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-red-500/40 bg-red-500/20">
                      <Trash2 className="h-8 w-8 text-red-400" />
                    </div>
                    <h2 className="mb-2 font-display text-xl font-bold text-bone">
                      Eliminar miniatura
                    </h2>
                    <p className="font-body text-bone/60">
                      Esta accion no se puede deshacer. Se eliminaran todas las imagenes y
                      comentarios asociados.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 rounded-lg border border-bone/20 px-4 py-3 font-body text-bone transition-colors hover:bg-bone/5"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-3 font-body text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <>
                          <motion.div
                            className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                          Eliminando...
                        </>
                      ) : (
                        'Eliminar'
                      )}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

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
                    Cambios Guardados
                  </h2>
                  <p className="text-bone/60">Redirigiendo a tu galeria...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
              <p className="font-body text-red-400">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8"
          >
            {/* Image Upload Area */}
            <div>
              <label className="mb-4 block font-display text-lg font-semibold text-bone">
                Imagenes <span className="text-imperial-gold">*</span>
              </label>

              {/* Image Grid with Drag & Drop Reorder */}
              <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                <AnimatePresence>
                  {images.map((img, index) => (
                    <div
                      key={img.isNew ? img.id : img.url}
                      className="group relative aspect-square cursor-move overflow-hidden rounded-xl"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', index.toString())
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        const from = parseInt(e.dataTransfer.getData('text/plain'))
                        if (from !== index) {
                          moveImage(from, index)
                        }
                      }}
                    >
                      <img
                        src={img.isNew ? img.preview : img.url}
                        alt=""
                        className="h-full w-full object-cover"
                      />

                      {/* Drag handle */}
                      <div className="absolute left-2 top-2 rounded bg-void/60 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <GripVertical className="h-4 w-4 text-bone" />
                      </div>

                      {/* Remove button */}
                      <div className="absolute inset-0 flex items-center justify-center bg-void/60 opacity-0 transition-opacity group-hover:opacity-100">
                        <motion.button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="rounded-full bg-red-500/80 p-2 text-white"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X className="h-4 w-4" />
                        </motion.button>
                      </div>

                      {/* Status indicators for new images */}
                      {img.isNew && img.uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-void/80">
                          <motion.div
                            className="h-8 w-8 rounded-full border-2 border-bone/20 border-t-imperial-gold"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                        </div>
                      )}

                      {img.isNew && img.uploaded && (
                        <div className="absolute right-2 top-2 rounded-full bg-green-500 p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}

                      {img.isNew && img.error && (
                        <div className="absolute right-2 top-2 rounded-full bg-red-500 p-1">
                          <AlertCircle className="h-3 w-3 text-white" />
                        </div>
                      )}

                      {/* Main image badge */}
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 rounded bg-imperial-gold px-2 py-1 text-xs font-bold text-void">
                          Principal
                        </div>
                      )}
                    </div>
                  ))}
                </AnimatePresence>

                {/* Add more button */}
                {images.length < 10 && (
                  <motion.label
                    className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-bone/20 transition-colors hover:border-imperial-gold/50"
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
              </div>

              <p className="font-body text-sm text-bone/40">
                Arrastra para reordenar. La primera imagen sera la portada.
              </p>

              {images.length === 0 && (
                <p className="mt-2 flex items-center gap-1 text-sm text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  Debes tener al menos una imagen
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="mb-2 block font-display text-lg font-semibold text-bone">
                Titulo <span className="text-imperial-gold">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Ultramarines Captain"
                className={`w-full rounded-xl border bg-void-light px-4 py-4 font-body text-bone transition-colors placeholder:text-bone/30 focus:outline-none ${
                  errors.title
                    ? 'border-red-500/50'
                    : 'border-bone/10 focus:border-imperial-gold/50'
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
                Descripcion
              </label>
              <textarea
                rows={4}
                placeholder="Describe tu miniatura, tecnicas usadas, historia..."
                className="w-full resize-none rounded-xl border border-bone/10 bg-void-light px-4 py-4 font-body text-bone transition-colors placeholder:text-bone/30 focus:border-imperial-gold/50 focus:outline-none"
                {...register('description')}
              />
            </div>

            {/* Faction Selection */}
            <div className="rounded-2xl border border-bone/10 bg-void-light/30 p-6">
              <label className="mb-4 block font-display text-lg font-semibold text-bone">
                Faccion
              </label>

              {/* Selected faction badge */}
              {selectedFactionDetails && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 flex items-center gap-3 rounded-xl border border-imperial-gold/30 p-3"
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
                  <span className="flex-1 font-body text-sm font-medium text-imperial-gold">
                    {selectedFactionDetails.name}
                  </span>
                  <motion.button
                    type="button"
                    onClick={() => setValue('faction_id', undefined)}
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
                        ? 'bg-imperial-gold text-void'
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
                  placeholder="Buscar faccion..."
                  value={factionSearch}
                  onChange={(e) => setFactionSearch(e.target.value)}
                  className="w-full rounded-lg border border-bone/10 bg-void py-2 pl-9 pr-4 font-body text-sm text-bone placeholder:text-bone/30 focus:border-imperial-gold/50 focus:outline-none"
                />
              </div>

              {/* Faction grid */}
              {factionsLoading ? (
                <div className="flex h-[200px] items-center justify-center">
                  <motion.div
                    className="h-6 w-6 rounded-full border-2 border-bone/20 border-t-imperial-gold"
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
                          onClick={() =>
                            setValue('faction_id', isSelected ? undefined : faction.id)
                          }
                          className={`relative rounded-xl border p-3 text-left transition-all ${
                            isSelected
                              ? 'border-imperial-gold'
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
                                  isSelected ? 'text-imperial-gold' : 'text-bone/80'
                                }`}
                              >
                                {faction.name}
                              </p>
                            </div>

                            {isSelected && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <Check className="h-4 w-4 text-imperial-gold" />
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
                        className="mt-2 text-xs text-imperial-gold hover:underline"
                      >
                        Limpiar filtros
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting || images.length === 0}
              className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-imperial-gold via-yellow-500 to-imperial-gold py-4 font-display text-sm font-bold uppercase tracking-wider text-void disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundSize: '200% 100%' }}
              whileHover={
                !isSubmitting && images.length > 0
                  ? { scale: 1.01, backgroundPosition: '100% 0' }
                  : {}
              }
              whileTap={!isSubmitting && images.length > 0 ? { scale: 0.99 } : {}}
            >
              <span className="relative flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <motion.div
                      className="h-5 w-5 rounded-full border-2 border-void/30 border-t-void"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Guardar Cambios
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
