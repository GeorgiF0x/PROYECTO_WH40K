'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { compressImage } from '@/lib/utils/compressImage'
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
} from 'lucide-react'
import type { Miniature } from '@/lib/types/database.types'

const editSchema = z.object({
  title: z.string().min(3, 'El titulo debe tener al menos 3 caracteres').max(100, 'Maximo 100 caracteres'),
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

const factions = [
  { id: 'imperium', name: 'Imperium of Man', color: '#C9A227' },
  { id: 'chaos', name: 'Forces of Chaos', color: '#DC143C' },
  { id: 'xenos', name: 'Xenos', color: '#00FF87' },
  { id: 'necrons', name: 'Necrons', color: '#00FFFF' },
  { id: 'other', name: 'Otros', color: '#888888' },
]

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

  // Load miniature data
  useEffect(() => {
    const loadMiniature = async () => {
      if (!id) return

      const { data, error } = await supabase
        .from('miniatures')
        .select('*')
        .eq('id', id)
        .single()

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

    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/')
    )
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

    const { data, error } = await supabase.storage
      .from('miniatures')
      .upload(fileName, compressed, {
        cacheControl: '3600',
        upsert: false,
        contentType: compressed.type,
      })

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    const { data: urlData } = supabase.storage
      .from('miniatures')
      .getPublicUrl(data.path)

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
          prev.map((p) =>
            p.isNew && p.id === img.id ? { ...p, uploading: true } : p
          )
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
      data.title !== miniature.title ||
      data.description !== miniature.description

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
    const { error } = await supabase
      .from('miniatures')
      .delete()
      .eq('id', miniature.id)

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
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <motion.div
          className="w-8 h-8 border-2 border-bone/20 border-t-imperial-gold rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }

  if (error && !miniature) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-bone mb-2">Error</h1>
          <p className="text-bone/60 mb-6">{error}</p>
          <button
            onClick={() => router.push('/mi-galeria')}
            className="px-6 py-3 bg-imperial-gold text-void font-display font-bold rounded-lg"
          >
            Volver a Mi Galeria
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.05)_0%,transparent_60%)]" />
      </div>

      <div className="relative z-10 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-bone/60 hover:text-imperial-gold transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-body">Volver</span>
          </motion.button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold tracking-wide mb-2">
                <span className="text-bone">Editar </span>
                <span className="text-gradient">Miniatura</span>
              </h1>
              <p className="text-bone/60 font-body">
                Modifica los detalles de tu miniatura
              </p>
            </div>

            <motion.button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Trash2 className="w-5 h-5" />
              <span className="hidden sm:inline font-body">Eliminar</span>
            </motion.button>
          </motion.div>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-void/90 backdrop-blur-xl p-6"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-void-light border border-bone/20 rounded-2xl p-8 max-w-md w-full"
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 mb-4">
                      <Trash2 className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-xl font-display font-bold text-bone mb-2">
                      Eliminar miniatura
                    </h2>
                    <p className="text-bone/60 font-body">
                      Esta accion no se puede deshacer. Se eliminaran todas las imagenes y comentarios asociados.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-4 py-3 border border-bone/20 text-bone rounded-lg font-body hover:bg-bone/5 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-body hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isDeleting ? (
                        <>
                          <motion.div
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
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
                    className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 border border-green-500/40 mb-6"
                  >
                    <Check className="w-12 h-12 text-green-400" />
                  </motion.div>
                  <h2 className="text-2xl font-display font-bold text-bone mb-2">
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
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 font-body">{error}</p>
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
              <label className="block text-lg font-display font-semibold text-bone mb-4">
                Imagenes <span className="text-imperial-gold">*</span>
              </label>

              {/* Image Grid with Drag & Drop Reorder */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                <AnimatePresence>
                  {images.map((img, index) => (
                    <div
                      key={img.isNew ? img.id : img.url}
                      className="relative aspect-square rounded-xl overflow-hidden group cursor-move"
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
                        className="w-full h-full object-cover"
                      />

                      {/* Drag handle */}
                      <div className="absolute top-2 left-2 p-1 bg-void/60 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="w-4 h-4 text-bone" />
                      </div>

                      {/* Remove button */}
                      <div className="absolute inset-0 bg-void/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <motion.button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-2 bg-red-500/80 rounded-full text-white"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </div>

                      {/* Status indicators for new images */}
                      {img.isNew && img.uploading && (
                        <div className="absolute inset-0 bg-void/80 flex items-center justify-center">
                          <motion.div
                            className="w-8 h-8 border-2 border-bone/20 border-t-imperial-gold rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                        </div>
                      )}

                      {img.isNew && img.uploaded && (
                        <div className="absolute top-2 right-2 p-1 bg-green-500 rounded-full">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}

                      {img.isNew && img.error && (
                        <div className="absolute top-2 right-2 p-1 bg-red-500 rounded-full">
                          <AlertCircle className="w-3 h-3 text-white" />
                        </div>
                      )}

                      {/* Main image badge */}
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-imperial-gold text-void text-xs font-bold rounded">
                          Principal
                        </div>
                      )}
                    </div>
                  ))}
                </AnimatePresence>

                {/* Add more button */}
                {images.length < 10 && (
                  <motion.label
                    className="aspect-square rounded-xl border-2 border-dashed border-bone/20 hover:border-imperial-gold/50 flex items-center justify-center cursor-pointer transition-colors"
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
                    <Plus className="w-8 h-8 text-bone/40" />
                  </motion.label>
                )}
              </div>

              <p className="text-bone/40 text-sm font-body">
                Arrastra para reordenar. La primera imagen sera la portada.
              </p>

              {images.length === 0 && (
                <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Debes tener al menos una imagen
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-lg font-display font-semibold text-bone mb-2">
                Titulo <span className="text-imperial-gold">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Ultramarines Captain"
                className={`w-full px-4 py-4 bg-void-light border rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none transition-colors ${
                  errors.title ? 'border-red-500/50' : 'border-bone/10 focus:border-imperial-gold/50'
                }`}
                {...register('title')}
              />
              {errors.title && (
                <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-lg font-display font-semibold text-bone mb-2">
                Descripcion
              </label>
              <textarea
                rows={4}
                placeholder="Describe tu miniatura, tecnicas usadas, historia..."
                className="w-full px-4 py-4 bg-void-light border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 transition-colors resize-none"
                {...register('description')}
              />
            </div>

            {/* Faction Selection */}
            <div>
              <label className="block text-lg font-display font-semibold text-bone mb-4">
                Faccion
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {factions.map((faction) => (
                  <motion.button
                    key={faction.id}
                    type="button"
                    onClick={() =>
                      setValue('faction_id', selectedFaction === faction.id ? undefined : faction.id)
                    }
                    className={`relative p-4 rounded-xl border transition-all ${
                      selectedFaction === faction.id
                        ? 'border-imperial-gold/50 bg-imperial-gold/10'
                        : 'border-bone/10 bg-void-light hover:border-bone/30'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className="w-4 h-4 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: faction.color }}
                    />
                    <p className={`text-sm font-body ${
                      selectedFaction === faction.id ? 'text-bone' : 'text-bone/60'
                    }`}>
                      {faction.name}
                    </p>

                    {selectedFaction === faction.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2"
                      >
                        <Check className="w-4 h-4 text-imperial-gold" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting || images.length === 0}
              className="relative w-full py-4 bg-gradient-to-r from-imperial-gold via-yellow-500 to-imperial-gold text-void font-display font-bold tracking-wider uppercase text-sm overflow-hidden rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundSize: '200% 100%' }}
              whileHover={!isSubmitting && images.length > 0 ? { scale: 1.01, backgroundPosition: '100% 0' } : {}}
              whileTap={!isSubmitting && images.length > 0 ? { scale: 0.99 } : {}}
            >
              <span className="relative flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-void/30 border-t-void rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
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
