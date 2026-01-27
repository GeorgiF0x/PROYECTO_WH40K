'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
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
  Loader2,
  Swords,
  BookOpen,
  BookMarked,
  Paintbrush,
  Wrench,
  Mountain,
  Dice5,
} from 'lucide-react'
import ListingFactionPicker from '@/components/marketplace/ListingFactionPicker'
import type { ListingCategory, Listing } from '@/lib/types/database.types'

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

export default function EditListingPage() {
  const router = useRouter()
  const params = useParams()
  const listingId = params.id as string
  const { user, isLoading: authLoading } = useAuth()
  const supabase = createClient()

  const [isLoadingListing, setIsLoadingListing] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  // Images: existing URLs + new files
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])

  // Load existing listing
  useEffect(() => {
    if (!user || !listingId) return

    const loadListing = async () => {
      const { data, error: fetchError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .eq('seller_id', user.id)
        .single()

      if (fetchError || !data) {
        setError('No se encontro el anuncio o no tienes permiso para editarlo.')
        setIsLoadingListing(false)
        return
      }

      setTitle(data.title)
      setDescription(data.description || '')
      setPrice(String(data.price))
      setCondition(data.condition as ListingCondition)
      setListingType(data.listing_type as ListingType)
      setCategory((data.category as ListingCategory) || 'miniatures')
      setLocation(data.location || '')
      setFactionId(data.faction_id || null)
      setExistingImages(data.images || [])
      setIsLoadingListing(false)
    }

    loadListing()
  }, [user, listingId, supabase])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/mercado/mis-anuncios')
    }
  }, [user, authLoading, router])

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalImages = existingImages.length + newImages.length + files.length
    if (totalImages > 6) {
      setError('Maximo 6 imagenes permitidas')
      return
    }

    setNewImages((prev) => [...prev, ...files])
    const previews = files.map((f) => URL.createObjectURL(f))
    setNewImagePreviews((prev) => [...prev, ...previews])
  }

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index])
    setNewImages((prev) => prev.filter((_, i) => i !== index))
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (!title.trim()) throw new Error('El titulo es obligatorio')
      if (!description.trim()) throw new Error('La descripcion es obligatoria')
      if (!price || parseFloat(price) < 0) throw new Error('El precio debe ser valido')

      const totalImages = existingImages.length + newImages.length
      if (totalImages === 0) throw new Error('Anade al menos una imagen')

      if (!user) throw new Error('Debes iniciar sesion')

      // Upload new images
      const uploadedUrls: string[] = []
      for (const image of newImages) {
        const compressed = await compressImage(image)
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webp`
        const { error: uploadError } = await supabase.storage
          .from('listings')
          .upload(fileName, compressed, { contentType: compressed.type })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('listings')
          .getPublicUrl(fileName)

        uploadedUrls.push(publicUrl)
      }

      const allImages = [...existingImages, ...uploadedUrls]

      // Update listing — seller_id is NOT included so it can't be overwritten
      const { error: updateError } = await supabase
        .from('listings')
        .update({
          title: title.trim(),
          description: description.trim(),
          price: parseFloat(price),
          condition,
          listing_type: listingType,
          category,
          location: location.trim() || null,
          faction_id: factionId,
          images: allImages,
        })
        .eq('id', listingId)
        .eq('seller_id', user.id)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => {
        router.push('/mercado/mis-anuncios')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el anuncio')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || isLoadingListing) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-imperial-gold animate-spin" />
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
            onClick={() => router.push('/mercado/mis-anuncios')}
            className="inline-flex items-center gap-2 text-bone/60 hover:text-imperial-gold transition-colors font-body mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a mis anuncios
          </button>

          <h1 className="text-3xl md:text-4xl font-display font-bold text-bone">
            Editar Anuncio
          </h1>
        </motion.div>

        {/* Success */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-3"
            >
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-body">Anuncio actualizado. Redirigiendo...</span>
            </motion.div>
          )}
        </AnimatePresence>

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
              Imagenes
            </h2>
            <p className="text-sm text-bone/50 font-body mb-4">
              Maximo 6 fotos. La primera sera la imagen principal.
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {/* Existing images */}
              {existingImages.map((url, index) => (
                <div key={`existing-${index}`} className="relative aspect-square rounded-xl overflow-hidden bg-void border border-bone/10">
                  <Image src={url} alt={`Imagen ${index + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {index === 0 && !newImages.length && (
                    <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-imperial-gold text-void text-xs font-bold rounded">
                      Principal
                    </span>
                  )}
                </div>
              ))}

              {/* New image previews */}
              {newImagePreviews.map((url, index) => (
                <div key={`new-${index}`} className="relative aspect-square rounded-xl overflow-hidden bg-void border border-imperial-gold/30">
                  <Image src={url} alt={`Nueva ${index + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-green-500/80 text-white text-xs font-bold rounded">
                    Nueva
                  </span>
                </div>
              ))}

              {/* Add button */}
              {existingImages.length + newImages.length < 6 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-bone/20 hover:border-imperial-gold/50 cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors">
                  <Upload className="w-6 h-6 text-bone/40" />
                  <span className="text-xs text-bone/40 font-body">Anadir</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleNewImageChange}
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
              Informacion basica
            </h2>

            <div>
              <label className="block text-sm text-bone/60 mb-2 font-body">Titulo *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Ejercito Necrones 2000pts pintado"
                maxLength={200}
                className="w-full px-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 transition-colors"
              />
              <span className="text-xs text-bone/40 mt-1 block">{title.length}/200</span>
            </div>

            <div>
              <label className="block text-sm text-bone/60 mb-2 font-body">Descripcion *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el contenido, estado, que incluye..."
                rows={5}
                className="w-full px-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-bone/60 mb-2 font-body">Precio (EUR) *</label>
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
            </div>
          </div>

          {/* Category */}
          <div className="p-6 bg-void-light rounded-2xl border border-bone/10">
            <h2 className="text-lg font-display font-semibold text-bone mb-4 flex items-center gap-2">
              <Swords className="w-5 h-5 text-imperial-gold" />
              Categoria de producto
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categoryOptions.map((option) => {
                const CatIcon = option.icon
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => setCategory(option.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-colors ${
                      category === option.value
                        ? 'bg-imperial-gold/20 border-imperial-gold/50'
                        : 'bg-void border-bone/10 hover:border-bone/30'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CatIcon className={`w-6 h-6 ${category === option.value ? 'text-imperial-gold' : 'text-bone/60'}`} />
                    <span className={`text-sm font-body ${category === option.value ? 'text-imperial-gold font-semibold' : 'text-bone/70'}`}>
                      {option.label}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Faction */}
          <div className="p-6 bg-void-light rounded-2xl border border-bone/10">
            <h2 className="text-lg font-display font-semibold text-bone mb-4 flex items-center gap-2">
              <Swords className="w-5 h-5 text-imperial-gold" />
              Faccion
            </h2>
            <p className="text-sm text-bone/50 font-body mb-4">
              Asocia una faccion al anuncio para que los compradores puedan filtrar.
            </p>
            <ListingFactionPicker
              selectedFactionId={factionId}
              onChange={setFactionId}
            />
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
                  <p className={`font-display font-semibold ${condition === option.value ? 'text-imperial-gold' : 'text-bone'}`}>
                    {option.label}
                  </p>
                  <p className="text-sm text-bone/50 font-body mt-1">{option.description}</p>
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
              Ubicacion
            </h2>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ciudad o provincia (opcional)"
              className="w-full px-4 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 transition-colors"
            />
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
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </span>
            ) : (
              'Guardar cambios'
            )}
          </motion.button>
        </motion.form>
      </div>
    </div>
  )
}
