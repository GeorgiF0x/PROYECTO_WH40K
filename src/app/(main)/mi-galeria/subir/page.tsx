'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { compressImage } from '@/lib/utils/compressImage'
import {
  Upload,
  X,
  Image as ImageIcon,
  Plus,
  Sparkles,
  Check,
  AlertCircle,
  GripVertical,
  ArrowLeft,
  Info,
} from 'lucide-react'

const uploadSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(100, 'Máximo 100 caracteres'),
  description: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
  faction_id: z.string().optional(),
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

const factions = [
  { id: 'imperium', name: 'Imperium of Man', color: '#C9A227' },
  { id: 'chaos', name: 'Forces of Chaos', color: '#DC143C' },
  { id: 'xenos', name: 'Xenos', color: '#00FF87' },
  { id: 'necrons', name: 'Necrons', color: '#00FFFF' },
  { id: 'other', name: 'Otros', color: '#888888' },
]

export default function UploadMiniaturePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [submitSuccess, setSubmitSuccess] = useState(false)

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

  const onSubmit = async (data: UploadFormData) => {
    if (images.length === 0 || !user?.id) {
      return
    }

    setIsSubmitting(true)
    setUploadProgress(0)

    // Upload all images
    const uploadedUrls: string[] = []
    for (let i = 0; i < images.length; i++) {
      const img = images[i]
      setImages((prev) =>
        prev.map((p) => (p.id === img.id ? { ...p, uploading: true } : p))
      )

      const url = await uploadImage(img)

      if (url) {
        uploadedUrls.push(url)
        setImages((prev) =>
          prev.map((p) =>
            p.id === img.id ? { ...p, uploading: false, uploaded: true, url } : p
          )
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
      return
    }

    // Create miniature record
    const { data: newMiniature, error } = await supabase
      .from('miniatures')
      .insert({
        user_id: user.id,
        title: data.title,
        description: data.description || null,
        images: uploadedUrls,
        thumbnail_url: uploadedUrls[0],
        faction_id: data.faction_id || null,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating miniature:', error)
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
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <motion.div
          className="w-8 h-8 border-2 border-bone/20 border-t-imperial-gold rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
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
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-imperial-gold/10 border border-imperial-gold/30 mb-4"
            >
              <Upload className="w-8 h-8 text-imperial-gold" />
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-wide mb-2">
              <span className="text-bone">Subir </span>
              <span className="text-gradient">Miniatura</span>
            </h1>
            <p className="text-bone/60 font-body">
              Comparte tu obra con la comunidad
            </p>
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
                    className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 border border-green-500/40 mb-6"
                  >
                    <Check className="w-12 h-12 text-green-400" />
                  </motion.div>
                  <h2 className="text-2xl font-display font-bold text-bone mb-2">
                    ¡Miniatura Subida!
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
            <div>
              <label className="block text-lg font-display font-semibold text-bone mb-4">
                Imágenes <span className="text-imperial-gold">*</span>
              </label>

              {/* Drop Zone */}
              <motion.div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  isDragging
                    ? 'border-imperial-gold bg-imperial-gold/10'
                    : 'border-bone/20 hover:border-imperial-gold/50'
                }`}
                animate={{
                  scale: isDragging ? 1.02 : 1,
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <motion.div
                  animate={{ y: isDragging ? -5 : 0 }}
                  className="pointer-events-none"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bone/5 mb-4">
                    <ImageIcon className="w-8 h-8 text-bone/40" />
                  </div>

                  <p className="text-bone/80 font-body mb-2">
                    Arrastra tus imágenes aquí o{' '}
                    <span className="text-imperial-gold">haz clic para seleccionar</span>
                  </p>
                  <p className="text-bone/40 text-sm">
                    PNG, JPG o WEBP. Máximo 10 imágenes.
                  </p>
                </motion.div>
              </motion.div>

              {/* Image Preview Grid */}
              {images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
                >
                  <AnimatePresence>
                    {images.map((img, index) => (
                      <motion.div
                        key={img.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative aspect-square rounded-xl overflow-hidden group"
                      >
                        <img
                          src={img.preview}
                          alt=""
                          className="w-full h-full object-cover"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-void/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <motion.button
                            type="button"
                            onClick={() => removeImage(img.id)}
                            className="p-2 bg-red-500/80 rounded-full text-white"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <X className="w-4 h-4" />
                          </motion.button>
                        </div>

                        {/* Status indicator */}
                        {img.uploading && (
                          <div className="absolute inset-0 bg-void/80 flex items-center justify-center">
                            <motion.div
                              className="w-8 h-8 border-2 border-bone/20 border-t-imperial-gold rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                          </div>
                        )}

                        {img.uploaded && (
                          <div className="absolute top-2 right-2 p-1 bg-green-500 rounded-full">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}

                        {img.error && (
                          <div className="absolute top-2 right-2 p-1 bg-red-500 rounded-full">
                            <AlertCircle className="w-3 h-3 text-white" />
                          </div>
                        )}

                        {/* Main image badge */}
                        {index === 0 && (
                          <div className="absolute top-2 left-2 px-2 py-1 bg-imperial-gold text-void text-xs font-bold rounded">
                            Principal
                          </div>
                        )}
                      </motion.div>
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
                </motion.div>
              )}

              {images.length === 0 && (
                <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Debes subir al menos una imagen
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-lg font-display font-semibold text-bone mb-2">
                Título <span className="text-imperial-gold">*</span>
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
                Descripción
              </label>
              <textarea
                rows={4}
                placeholder="Describe tu miniatura, técnicas usadas, historia..."
                className="w-full px-4 py-4 bg-void-light border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 transition-colors resize-none"
                {...register('description')}
              />
            </div>

            {/* Faction Selection */}
            <div>
              <label className="block text-lg font-display font-semibold text-bone mb-4">
                Facción
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

            {/* Info Box */}
            <motion.div
              className="flex items-start gap-3 p-4 bg-imperial-gold/5 border border-imperial-gold/20 rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Info className="w-5 h-5 text-imperial-gold flex-shrink-0 mt-0.5" />
              <div className="text-sm text-bone/70 font-body">
                <p className="font-semibold text-bone mb-1">Consejos para mejores fotos:</p>
                <ul className="list-disc list-inside space-y-1 text-bone/60">
                  <li>Usa buena iluminación, preferiblemente luz natural</li>
                  <li>Fondo neutro para destacar la miniatura</li>
                  <li>Múltiples ángulos muestran mejor tu trabajo</li>
                </ul>
              </div>
            </motion.div>

            {/* Upload Progress */}
            {isSubmitting && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-bone/60">Subiendo imágenes...</span>
                  <span className="text-imperial-gold font-semibold">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="h-2 bg-void-light rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-imperial-gold to-yellow-500"
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
              className="relative w-full py-4 bg-gradient-to-r from-imperial-gold via-yellow-500 to-imperial-gold text-void font-display font-bold tracking-wider uppercase text-sm overflow-hidden rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundSize: '200% 100%' }}
              whileHover={!isSubmitting && images.length > 0 ? { scale: 1.01, backgroundPosition: '100% 0' } : {}}
              whileTap={!isSubmitting && images.length > 0 ? { scale: 0.99 } : {}}
              animate={!isSubmitting && images.length > 0 ? {
                boxShadow: [
                  '0 4px 20px rgba(201, 162, 39, 0.3)',
                  '0 4px 40px rgba(201, 162, 39, 0.5)',
                  '0 4px 20px rgba(201, 162, 39, 0.3)',
                ],
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {/* Shimmer */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{ backgroundSize: '200% 100%' }}
                animate={!isSubmitting && images.length > 0 ? { backgroundPosition: ['200% 0', '-200% 0'] } : {}}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />

              <span className="relative flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-void/30 border-t-void rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
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
