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
  Package,
  Tag,
  RefreshCw,
  MapPin,
  Euro,
  ImagePlus,
  AlertCircle,
  Check,
  Swords,
  BookOpen,
  BookMarked,
  Paintbrush,
  Wrench,
  Mountain,
  Dice5,
} from 'lucide-react'
import ListingFactionPicker from '@/components/marketplace/ListingFactionPicker'
import type { ListingCategory } from '@/lib/types/database.types'

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

const categoryOptions: { value: ListingCategory; label: string; icon: typeof Swords }[] = [
  { value: 'miniatures', label: 'Miniaturas', icon: Swords },
  { value: 'novels', label: 'Novelas', icon: BookOpen },
  { value: 'codex', label: 'Codex / Reglas', icon: BookMarked },
  { value: 'paints', label: 'Pinturas', icon: Paintbrush },
  { value: 'tools', label: 'Herramientas', icon: Wrench },
  { value: 'terrain', label: 'Terreno', icon: Mountain },
  { value: 'accessories', label: 'Accesorios', icon: Dice5 },
  { value: 'other', label: 'Otros', icon: Package },
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
  const [category, setCategory] = useState<ListingCategory>('miniatures')
  const [location, setLocation] = useState('')
  const [factionId, setFactionId] = useState<string | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
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

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Debes iniciar sesión')

      // Compress & upload images
      const uploadedUrls: string[] = []
      for (const image of images) {
        const compressed = await compressImage(image)
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webp`
        const { error: uploadError, data } = await supabase.storage
          .from('listings')
          .upload(fileName, compressed, { contentType: compressed.type })

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from('listings').getPublicUrl(fileName)

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
          category,
          location: location.trim() || null,
          faction_id: factionId,
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
      <div className="flex min-h-screen items-center justify-center pb-16 pt-24">
        <div className="animate-pulse text-bone/60">Verificando sesión...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-16 pt-24">
      <div className="mx-auto max-w-3xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 font-body text-bone/60 transition-colors hover:text-imperial-gold"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>

          <h1 className="font-display text-3xl font-bold text-bone md:text-4xl">
            Publicar Anuncio
          </h1>
          <p className="mt-2 font-body text-bone/60">
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
              className="mb-6 flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/20 p-4"
            >
              <Check className="h-5 w-5 text-green-400" />
              <span className="font-body text-green-400">¡Anuncio publicado! Redirigiendo...</span>
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
              className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/20 p-4"
            >
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="font-body text-red-400">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <X className="h-4 w-4" />
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
          <div className="rounded-2xl border border-bone/10 bg-void-light p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-bone">
              <ImagePlus className="h-5 w-5 text-imperial-gold" />
              Imágenes
            </h2>
            <p className="mb-4 font-body text-sm text-bone/50">
              Añade hasta 6 fotos. La primera será la imagen principal.
            </p>

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {/* Image previews */}
              {imagePreviewUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-xl border border-bone/10 bg-void"
                >
                  <Image src={url} alt={`Preview ${index + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-imperial-gold px-2 py-0.5 text-xs font-bold text-void">
                      Principal
                    </span>
                  )}
                </div>
              ))}

              {/* Add button */}
              {images.length < 6 && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-bone/20 transition-colors hover:border-imperial-gold/50">
                  <Upload className="h-6 w-6 text-bone/40" />
                  <span className="font-body text-xs text-bone/40">Añadir</span>
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
          <div className="space-y-6 rounded-2xl border border-bone/10 bg-void-light p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-bone">
              <Package className="h-5 w-5 text-imperial-gold" />
              Información básica
            </h2>

            {/* Title */}
            <div>
              <label className="mb-2 block font-body text-sm text-bone/60">Título *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Ejército Necrones 2000pts pintado"
                maxLength={200}
                className="w-full rounded-xl border border-bone/10 bg-void px-4 py-3 font-body text-bone transition-colors placeholder:text-bone/30 focus:border-imperial-gold/50 focus:outline-none"
              />
              <span className="mt-1 block text-xs text-bone/40">{title.length}/200</span>
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block font-body text-sm text-bone/60">Descripción *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el contenido, estado, qué incluye..."
                rows={5}
                className="w-full resize-none rounded-xl border border-bone/10 bg-void px-4 py-3 font-body text-bone transition-colors placeholder:text-bone/30 focus:border-imperial-gold/50 focus:outline-none"
              />
            </div>

            {/* Price */}
            <div>
              <label className="mb-2 block font-body text-sm text-bone/60">Precio (EUR) *</label>
              <div className="relative">
                <Euro className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-bone/40" />
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border border-bone/10 bg-void py-3 pl-12 pr-4 font-body text-bone transition-colors placeholder:text-bone/30 focus:border-imperial-gold/50 focus:outline-none"
                />
              </div>
              <span className="mt-1 block text-xs text-bone/40">
                Pon 0 si solo aceptas intercambio
              </span>
            </div>
          </div>

          {/* Category */}
          <div className="rounded-2xl border border-bone/10 bg-void-light p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-bone">
              <Swords className="h-5 w-5 text-imperial-gold" />
              Categoria de producto
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {categoryOptions.map((option) => {
                const CatIcon = option.icon
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => setCategory(option.value)}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors ${
                      category === option.value
                        ? 'border-imperial-gold/50 bg-imperial-gold/20'
                        : 'border-bone/10 bg-void hover:border-bone/30'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CatIcon
                      className={`h-6 w-6 ${
                        category === option.value ? 'text-imperial-gold' : 'text-bone/60'
                      }`}
                    />
                    <span
                      className={`font-body text-sm ${
                        category === option.value
                          ? 'font-semibold text-imperial-gold'
                          : 'text-bone/70'
                      }`}
                    >
                      {option.label}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Faction */}
          <div className="rounded-2xl border border-bone/10 bg-void-light p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-bone">
              <Swords className="h-5 w-5 text-imperial-gold" />
              Faccion
            </h2>
            <p className="mb-4 font-body text-sm text-bone/50">
              Asocia una faccion al anuncio para que los compradores puedan filtrar.
            </p>
            <ListingFactionPicker selectedFactionId={factionId} onChange={setFactionId} />
          </div>

          {/* Condition */}
          <div className="rounded-2xl border border-bone/10 bg-void-light p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-bone">
              <Package className="h-5 w-5 text-imperial-gold" />
              Estado
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {conditionOptions.map((option) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => setCondition(option.value)}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    condition === option.value
                      ? 'border-imperial-gold/50 bg-imperial-gold/20'
                      : 'border-bone/10 bg-void hover:border-bone/30'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <p
                    className={`font-display font-semibold ${
                      condition === option.value ? 'text-imperial-gold' : 'text-bone'
                    }`}
                  >
                    {option.label}
                  </p>
                  <p className="mt-1 font-body text-sm text-bone/50">{option.description}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Listing Type */}
          <div className="rounded-2xl border border-bone/10 bg-void-light p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-bone">
              <Tag className="h-5 w-5 text-imperial-gold" />
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
                    className={`flex items-center gap-2 rounded-xl border px-5 py-3 transition-colors ${
                      listingType === option.value
                        ? 'border-imperial-gold bg-imperial-gold text-void'
                        : 'border-bone/10 bg-void text-bone/60 hover:border-bone/30'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Location */}
          <div className="rounded-2xl border border-bone/10 bg-void-light p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-bone">
              <MapPin className="h-5 w-5 text-imperial-gold" />
              Ubicación
            </h2>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ciudad o provincia (opcional)"
              className="w-full rounded-xl border border-bone/10 bg-void px-4 py-3 font-body text-bone transition-colors placeholder:text-bone/30 focus:border-imperial-gold/50 focus:outline-none"
            />
            <span className="mt-1 block text-xs text-bone/40">
              Ayuda a otros usuarios a saber si están cerca para envíos o entregas en mano
            </span>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting || success}
            className="w-full rounded-xl bg-gradient-to-r from-imperial-gold to-yellow-500 py-4 font-display text-lg font-bold text-void disabled:cursor-not-allowed disabled:opacity-50"
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <motion.div
                  className="h-5 w-5 rounded-full border-2 border-void/30 border-t-void"
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
