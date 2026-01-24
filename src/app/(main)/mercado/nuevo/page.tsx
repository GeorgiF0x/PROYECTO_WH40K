'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Upload,
  X,
  Package,
  Tag,
  RefreshCw,
  MapPin,
  Euro,
  ImagePlus,
  AlertCircle,
  Check,
} from 'lucide-react'

type ListingCondition = 'nib' | 'nos' | 'assembled' | 'painted' | 'pro_painted'
type ListingType = 'sale' | 'trade' | 'both'

const conditionOptions: { value: ListingCondition; label: string; description: string }[] = [
  { value: 'nib', label: 'Nuevo en caja', description: 'Producto precintado, sin abrir' },
  { value: 'nos', label: 'Nuevo sin caja', description: 'Sin usar pero sin embalaje original' },
  { value: 'assembled', label: 'Montado', description: 'Ensamblado pero sin pintar' },
  { value: 'painted', label: 'Pintado', description: 'Pintado a nivel tabletop' },
  { value: 'pro_painted', label: 'Pro Painted', description: 'Pintura de alta calidad' },
]

const typeOptions: { value: ListingType; label: string; icon: typeof Tag }[] = [
  { value: 'sale', label: 'Venta', icon: Tag },
  { value: 'trade', label: 'Intercambio', icon: RefreshCw },
  { value: 'both', label: 'Ambos', icon: Package },
]

export default function NewListingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [condition, setCondition] = useState<ListingCondition>('assembled')
  const [listingType, setListingType] = useState<ListingType>('sale')
  const [location, setLocation] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login?redirect=/mercado/nuevo')
    } else {
      setIsAuthenticated(true)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 6) {
      setError('Máximo 6 imágenes permitidas')
      return
    }

    const newImages = [...images, ...files]
    setImages(newImages)

    // Create preview URLs
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Validate
      if (!title.trim()) throw new Error('El título es obligatorio')
      if (!description.trim()) throw new Error('La descripción es obligatoria')
      if (!price || parseFloat(price) < 0) throw new Error('El precio debe ser válido')
      if (images.length === 0) throw new Error('Añade al menos una imagen')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Debes iniciar sesión')

      // Upload images
      const uploadedUrls: string[] = []
      for (const image of images) {
        const fileName = `${user.id}/${Date.now()}-${image.name}`
        const { error: uploadError, data } = await supabase.storage
          .from('listings')
          .upload(fileName, image)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('listings')
          .getPublicUrl(fileName)

        uploadedUrls.push(publicUrl)
      }

      // Create listing
      const { error: insertError, data: listing } = await supabase
        .from('listings')
        .insert({
          seller_id: user.id,
          title: title.trim(),
          description: description.trim(),
          price: parseFloat(price),
          condition,
          listing_type: listingType,
          location: location.trim() || null,
          images: uploadedUrls,
          status: 'active',
        })
        .select()
        .single()

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => {
        router.push(`/mercado/${listing.id}`)
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el anuncio')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="animate-pulse text-bone/60">Verificando sesión...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
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
            Publicar Anuncio
          </h1>
          <p className="text-bone/60 font-body mt-2">
            Completa los datos de tu anuncio para publicarlo en el mercado.
          </p>
        </motion.div>

        {/* Success message */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-3"
            >
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-body">
                ¡Anuncio publicado! Redirigiendo...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
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
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
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
              Imágenes
            </h2>
            <p className="text-sm text-bone/50 font-body mb-4">
              Añade hasta 6 fotos. La primera será la imagen principal.
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {/* Image previews */}
              {imagePreviewUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-xl overflow-hidden bg-void border border-bone/10"
                >
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

              {/* Add button */}
              {images.length < 6 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-bone/20 hover:border-imperial-gold/50 cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors">
                  <Upload className="w-6 h-6 text-bone/40" />
                  <span className="text-xs text-bone/40 font-body">Añadir</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="p-6 bg-void-light rounded-2xl border border-bone/10 space-y-6">
            <h2 className="text-lg font-display font-semibold text-bone flex items-center gap-2">
              <Package className="w-5 h-5 text-imperial-gold" />
              Información básica
            </h2>

            {/* Title */}
            <div>
              <label className="block text-sm text-bone/60 mb-2 font-body">
                Título *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Ejército Necrones 2000pts pintado"
                maxLength={200}
                className="w-full px-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 transition-colors"
              />
              <span className="text-xs text-bone/40 mt-1 block">{title.length}/200</span>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-bone/60 mb-2 font-body">
                Descripción *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el contenido, estado, qué incluye..."
                rows={5}
                className="w-full px-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 transition-colors resize-none"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm text-bone/60 mb-2 font-body">
                Precio (EUR) *
              </label>
              <div className="relative">
                <Euro className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bone/40" />
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-12 pr-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 transition-colors"
                />
              </div>
              <span className="text-xs text-bone/40 mt-1 block">
                Pon 0 si solo aceptas intercambio
              </span>
            </div>
          </div>

          {/* Condition */}
          <div className="p-6 bg-void-light rounded-2xl border border-bone/10">
            <h2 className="text-lg font-display font-semibold text-bone mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-imperial-gold" />
              Estado
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {conditionOptions.map((option) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => setCondition(option.value)}
                  className={`p-4 rounded-xl border text-left transition-colors ${
                    condition === option.value
                      ? 'bg-imperial-gold/20 border-imperial-gold/50'
                      : 'bg-void border-bone/10 hover:border-bone/30'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <p className={`font-display font-semibold ${
                    condition === option.value ? 'text-imperial-gold' : 'text-bone'
                  }`}>
                    {option.label}
                  </p>
                  <p className="text-sm text-bone/50 font-body mt-1">
                    {option.description}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Listing Type */}
          <div className="p-6 bg-void-light rounded-2xl border border-bone/10">
            <h2 className="text-lg font-display font-semibold text-bone mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-imperial-gold" />
              Tipo de anuncio
            </h2>
            <div className="flex flex-wrap gap-3">
              {typeOptions.map((option) => {
                const Icon = option.icon
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => setListingType(option.value)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-colors ${
                      listingType === option.value
                        ? 'bg-imperial-gold text-void border-imperial-gold'
                        : 'bg-void border-bone/10 text-bone/60 hover:border-bone/30'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-4 h-4" />
                    {option.label}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Location */}
          <div className="p-6 bg-void-light rounded-2xl border border-bone/10">
            <h2 className="text-lg font-display font-semibold text-bone mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-imperial-gold" />
              Ubicación
            </h2>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ciudad o provincia (opcional)"
              className="w-full px-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 transition-colors"
            />
            <span className="text-xs text-bone/40 mt-1 block">
              Ayuda a otros usuarios a saber si están cerca para envíos o entregas en mano
            </span>
          </div>

          {/* Submit Button */}
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
                Publicando...
              </span>
            ) : (
              'Publicar Anuncio'
            )}
          </motion.button>
        </motion.form>
      </div>
    </div>
  )
}
