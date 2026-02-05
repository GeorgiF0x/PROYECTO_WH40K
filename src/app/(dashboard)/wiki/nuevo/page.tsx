'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Globe,
  FileText,
  Crosshair,
  Feather,
  Upload,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { TiptapEditor, type TiptapEditorRef, WikiGallery, FactionPicker } from '@/components/wiki'
import { factions } from '@/lib/data'
import { compressImage } from '@/lib/utils/compressImage'
import type { WikiCategory, TiptapContent, WikiPageCreateInput } from '@/lib/supabase/wiki.types'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 100 },
  },
}

/* ── Tactical frame corners ── */
function TacticalCorners({ color = 'rgba(201,162,39,0.25)' }: { color?: string }) {
  return (
    <>
      <span className="absolute top-0 left-0 w-5 h-5 border-t border-l pointer-events-none" style={{ borderColor: color }} />
      <span className="absolute top-0 right-0 w-5 h-5 border-t border-r pointer-events-none" style={{ borderColor: color }} />
      <span className="absolute bottom-0 left-0 w-5 h-5 border-b border-l pointer-events-none" style={{ borderColor: color }} />
      <span className="absolute bottom-0 right-0 w-5 h-5 border-b border-r pointer-events-none" style={{ borderColor: color }} />
    </>
  )
}

/* ── Card wrapper with glow ── */
function TacticalCard({
  children,
  color,
  className = '',
}: {
  children: React.ReactNode
  color?: string
  className?: string
}) {
  const c = color || 'rgba(201,162,39,0.25)'
  return (
    <div className={`relative group ${className}`}>
      {/* Glow line on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(to right, transparent, ${c}, transparent)`,
        }}
      />
      <TacticalCorners color={c} />
      {children}
    </div>
  )
}

export default function NewWikiArticlePage() {
  const router = useRouter()
  const editorRef = useRef<TiptapEditorRef>(null)

  const [categories, setCategories] = useState<WikiCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [factionId, setFactionId] = useState('')
  const [subFaction, setSubFaction] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [heroImage, setHeroImage] = useState('')
  const [content, setContent] = useState<TiptapContent | null>(null)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [heroUploading, setHeroUploading] = useState(false)
  const heroFileRef = useRef<HTMLInputElement>(null)

  const selectedFaction = factions.find(f => f.id === factionId)
  const currentColor = selectedFaction?.color || '#C9A227'

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    try {
      const res = await fetch('/api/wiki/categories')
      if (res.ok) {
        setCategories(await res.json())
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value))
    }
  }

  async function handleHeroUpload(file: File) {
    setHeroUploading(true)
    try {
      const compressed = await compressImage(file)
      const formData = new FormData()
      formData.append('file', compressed)
      if (factionId) formData.append('faction_id', factionId)
      const res = await fetch('/api/wiki/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al subir')
      }
      const data = await res.json()
      setHeroImage(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir imagen')
    } finally {
      setHeroUploading(false)
      if (heroFileRef.current) heroFileRef.current.value = ''
    }
  }

  async function handleSubmit(status: 'draft' | 'published') {
    if (!factionId || !title || !slug) {
      setError('Faccion, titulo y slug son requeridos')
      return
    }

    const editorContent = editorRef.current?.getContent()
    if (!editorContent || editorContent.content.length === 0) {
      setError('El contenido no puede estar vacio')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const payload: WikiPageCreateInput = {
        faction_id: factionId,
        category_id: categoryId || undefined,
        title,
        slug,
        excerpt: excerpt || undefined,
        hero_image: heroImage || undefined,
        gallery_images: galleryImages.length ? galleryImages : undefined,
        content: editorContent,
        status,
      }

      const res = await fetch('/api/wiki', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al crear el articulo')
      }

      const data = await res.json()
      router.push(`/wiki/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="space-y-8 max-w-6xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Header Lexicanum ── */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/wiki">
            <Button variant="ghost" size="sm" className="mt-1">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crosshair className="h-4 w-4 text-imperial-gold/60" />
              <span className="text-[10px] font-mono text-imperial-gold/60 tracking-[0.3em] uppercase">
                NUEVO ARTICULO // ARCHIVO LEXICANUM
              </span>
            </div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-display font-bold text-bone tracking-wide">
                Redaccion Imperial
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono tracking-wider border bg-imperial-gold/15 border-imperial-gold/40 text-imperial-gold shadow-[0_0_12px_rgba(201,162,39,0.2)]">
                <Feather className="w-3 h-3" />
                SCRIBE
              </span>
            </div>
            <p className="text-bone/40 font-mono text-sm">
              Crea un nuevo registro para el Archivo Imperial
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-void-light/60 border border-bone/15 text-bone/70 hover:bg-bone/5 hover:border-bone/30 hover:text-bone transition-all duration-200 active:scale-[0.97] disabled:opacity-40"
          >
            <FileText className="w-4 h-4" />
            Guardar Borrador
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('published')}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-imperial-gold/80 to-imperial-gold/60 text-void border border-imperial-gold/30 hover:from-imperial-gold hover:to-imperial-gold/80 shadow-[0_0_20px_rgba(201,162,39,0.2)] hover:shadow-[0_0_30px_rgba(201,162,39,0.4)] transition-all duration-200 active:scale-[0.97] disabled:opacity-40"
          >
            <Globe className="w-4 h-4" />
            Publicar
          </button>
        </div>
      </motion.div>

      {/* ── Imperial divider ── */}
      <div className="h-px bg-gradient-to-r from-transparent via-imperial-gold/20 to-transparent" />

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-blood/20 border border-blood/40 text-blood-light font-body"
        >
          {error}
        </motion.div>
      )}

      {/* ── Faction Picker (full width) ── */}
      <motion.div variants={itemVariants}>
        <FactionPicker
          factionId={factionId}
          subFaction={subFaction}
          onFactionChange={setFactionId}
          onSubFactionChange={setSubFaction}
          factionColor={currentColor}
        />
      </motion.div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Slug */}
          <motion.div variants={itemVariants}>
            <TacticalCard color={`${currentColor}40`}>
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <div>
                    <label className="block font-mono text-[10px] text-imperial-gold/50 tracking-[0.2em] uppercase mb-2">
                      TITULO *
                    </label>
                    <Input
                      type="text"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Ej: La Herejia de Horus"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-imperial-gold/50 tracking-[0.2em] uppercase mb-2">
                      SLUG (URL) *
                    </label>
                    <Input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="la-herejia-de-horus"
                    />
                    <p className="mt-1 text-xs text-bone/40 font-mono">
                      /facciones/{factionId || '[faccion]'}/wiki/{slug || '[slug]'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TacticalCard>
          </motion.div>

          {/* Editor */}
          <motion.div variants={itemVariants}>
            <TacticalCard color={`${currentColor}40`}>
              <Card padding="none">
                <CardHeader className="border-b border-bone/10 p-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="font-mono text-[10px] text-imperial-gold/50 tracking-[0.2em]">CONTENIDO</span>
                  </CardTitle>
                </CardHeader>
                <TiptapEditor
                  ref={editorRef}
                  onChange={setContent}
                  factionColor={currentColor}
                  factionId={factionId || undefined}
                  placeholder="Escribe el contenido del articulo..."
                />
              </Card>
            </TacticalCard>
          </motion.div>

          {/* Gallery */}
          <motion.div variants={itemVariants}>
            <WikiGallery
              images={galleryImages}
              onChange={setGalleryImages}
              factionId={factionId || undefined}
              factionColor={currentColor}
            />
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category */}
          <motion.div variants={itemVariants}>
            <TacticalCard color={`${currentColor}30`}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-mono text-[10px] text-imperial-gold/50 tracking-[0.2em]">CATEGORIA</CardTitle>
                </CardHeader>
                <CardContent>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-void-light border border-bone/10 text-bone font-body focus:outline-none focus:ring-2 transition-all duration-200"
                    style={{
                      ['--tw-ring-color' as string]: currentColor,
                    }}
                  >
                    <option value="">Sin categoria</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </CardContent>
              </Card>
            </TacticalCard>
          </motion.div>

          {/* Excerpt */}
          <motion.div variants={itemVariants}>
            <TacticalCard color={`${currentColor}30`}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-mono text-[10px] text-imperial-gold/50 tracking-[0.2em]">EXTRACTO</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Breve descripcion para listados..."
                    rows={3}
                  />
                  <p className="mt-2 text-xs text-bone/40 font-mono">
                    Opcional. Se muestra en las tarjetas del listado.
                  </p>
                </CardContent>
              </Card>
            </TacticalCard>
          </motion.div>

          {/* Hero Image */}
          <motion.div variants={itemVariants}>
            <TacticalCard color={`${currentColor}30`}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-mono text-[10px] text-imperial-gold/50 tracking-[0.2em]">IMAGEN PRINCIPAL</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    type="text"
                    value={heroImage}
                    onChange={(e) => setHeroImage(e.target.value)}
                    placeholder="URL de la imagen..."
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-bone/30">o</span>
                    <input
                      ref={heroFileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleHeroUpload(file)
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => heroFileRef.current?.click()}
                      disabled={heroUploading}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed text-xs font-mono transition-colors hover:bg-bone/5 disabled:opacity-50"
                      style={{ borderColor: `${currentColor}30`, color: currentColor }}
                    >
                      {heroUploading ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Subiendo...</>
                      ) : (
                        <><Upload className="w-3.5 h-3.5" /> Subir imagen</>
                      )}
                    </button>
                  </div>
                  {heroImage && (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-bone/10">
                      <img
                        src={heroImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <p className="text-xs text-bone/40 font-mono">
                    Recomendado: 1200x630px
                  </p>
                </CardContent>
              </Card>
            </TacticalCard>
          </motion.div>

          {/* Selected faction/subfaction summary */}
          {factionId && (
            <motion.div variants={itemVariants}>
              <TacticalCard color={`${currentColor}30`}>
                <div className="rounded-xl bg-void-light/40 border border-bone/10 p-4">
                  <span className="block font-mono text-[10px] text-imperial-gold/50 tracking-[0.2em] uppercase mb-3">CLASIFICACION</span>
                  <div className="space-y-2 text-sm font-body">
                    <div className="flex justify-between items-center">
                      <span className="text-bone/50">Faccion:</span>
                      <span className="font-medium" style={{ color: currentColor }}>{selectedFaction?.name}</span>
                    </div>
                    {subFaction && (
                      <div className="flex justify-between items-center">
                        <span className="text-bone/50">Subfaccion:</span>
                        <span className="text-bone/80">{subFaction}</span>
                      </div>
                    )}
                  </div>
                </div>
              </TacticalCard>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Bottom action bar ── */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between pt-4 border-t border-bone/10"
      >
        <Link href="/wiki">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-bone/50 hover:text-bone transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Cancelar
          </button>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-void-light/60 border border-bone/15 text-bone/70 hover:bg-bone/5 hover:border-bone/30 hover:text-bone transition-all duration-200 active:scale-[0.97] disabled:opacity-40"
          >
            <FileText className="w-4 h-4" />
            Guardar Borrador
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('published')}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-imperial-gold/80 to-imperial-gold/60 text-void border border-imperial-gold/30 hover:from-imperial-gold hover:to-imperial-gold/80 shadow-[0_0_20px_rgba(201,162,39,0.2)] hover:shadow-[0_0_30px_rgba(201,162,39,0.4)] transition-all duration-200 active:scale-[0.97] disabled:opacity-40"
          >
            <Globe className="w-4 h-4" />
            Publicar
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
