'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  HelpCircle,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { BlockNoteEditor, type WikiEditorRef, WikiGallery, FactionPicker, EditorGuide } from '@/components/wiki'
import {
  WikiPageBackground,
  GothicCorners,
  ImperialDivider,
  SectionLabel,
} from '@/components/wiki/WikiDecorations'
import { factions } from '@/lib/data'
import { compressImage } from '@/lib/utils/compressImage'
import type { WikiCategory, WikiContent, WikiPageCreateInput } from '@/lib/supabase/wiki.types'

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

/* ── Card wrapper with gothic corners + glow ── */
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
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(to right, transparent, ${c}, transparent)`,
        }}
      />
      <GothicCorners className={`text-[${c}]`} size={24} />
      {children}
    </div>
  )
}

export default function NewWikiArticlePage() {
  const router = useRouter()
  const editorRef = useRef<WikiEditorRef>(null)

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
  const [content, setContent] = useState<WikiContent | null>(null)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [heroUploading, setHeroUploading] = useState(false)
  const [heroDragOver, setHeroDragOver] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
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

  const handleHeroUpload = useCallback(async (file: File) => {
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
  }, [factionId])

  function handleHeroDrop(e: React.DragEvent) {
    e.preventDefault()
    setHeroDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleHeroUpload(file)
    }
  }

  async function handleSubmit(status: 'draft' | 'published') {
    if (!factionId || !title || !slug) {
      setError('Faccion, titulo y slug son requeridos')
      return
    }

    const editorContent = editorRef.current?.getContent()
    if (!editorContent) {
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
    <div className="relative">
      <WikiPageBackground />

      <motion.div
        className="relative z-10 space-y-8 max-w-6xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Header Banner ── */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl p-6"
          style={{
            background: 'linear-gradient(180deg, rgba(201,162,39,0.05) 0%, rgba(3,3,8,0.4) 100%)',
            border: '1px solid rgba(201,162,39,0.1)',
          }}
        >
          <GothicCorners className="text-imperial-gold/20" size={36} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(201,162,39,0.06)_0%,transparent_60%)] pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <Link href="/wiki">
                <Button variant="ghost" size="sm" className="mt-1">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <SectionLabel icon={Crosshair} className="mb-2">
                  NUEVO ARTICULO // ARCHIVO LEXICANUM
                </SectionLabel>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-display font-bold text-bone tracking-wide">
                    Redaccion Imperial
                  </h1>
                  <div className="flex items-center gap-1.5">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-amber-500"
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono tracking-wider border bg-imperial-gold/15 border-imperial-gold/40 text-imperial-gold shadow-[0_0_12px_rgba(201,162,39,0.2)]">
                      <Feather className="w-3 h-3" />
                      SCRIBE
                    </span>
                  </div>
                </div>
                <p className="text-bone/40 font-mono text-sm">
                  Crea un nuevo registro para el Archivo Imperial
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <motion.button
                type="button"
                onClick={() => handleSubmit('draft')}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-void-light/60 border border-bone/15 text-bone/70 hover:bg-bone/5 hover:border-bone/30 hover:text-bone transition-all duration-200 disabled:opacity-40"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FileText className="w-4 h-4" />
                Guardar Borrador
              </motion.button>
              <motion.button
                type="button"
                onClick={() => handleSubmit('published')}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-imperial-gold/80 to-imperial-gold/60 text-void border border-imperial-gold/30 hover:from-imperial-gold hover:to-imperial-gold/80 shadow-[0_0_20px_rgba(201,162,39,0.2)] hover:shadow-[0_0_30px_rgba(201,162,39,0.4)] transition-all duration-200 disabled:opacity-40"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Globe className="w-4 h-4" />
                Publicar
              </motion.button>
            </div>
          </div>
        </motion.div>

        <ImperialDivider />

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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
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
                    <CardTitle className="text-base flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-6 w-1 rounded-full"
                          style={{ background: `linear-gradient(180deg, ${currentColor}, ${currentColor}40)` }}
                        />
                        <span className="font-mono text-[10px] text-imperial-gold/50 tracking-[0.2em]">CONTENIDO</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowGuide(!showGuide)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono text-bone/40 hover:text-imperial-gold/70 hover:bg-imperial-gold/5 transition-colors"
                        title="Guia del editor"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">AYUDA</span>
                      </button>
                    </CardTitle>
                  </CardHeader>
                  <EditorGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />
                  <div className="px-4 py-2 border-b border-bone/5">
                    <span className="text-[11px] font-mono text-bone/25 italic">
                      Escribe <span className="text-imperial-gold/40">/</span> para insertar bloques especiales
                    </span>
                  </div>
                  <BlockNoteEditor
                    ref={editorRef}
                    onChange={setContent}
                    factionColor={currentColor}
                    factionId={factionId || undefined}
                    placeholder="Escribe / para ver comandos..."
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
                    {heroImage ? (
                      <div className="relative aspect-video rounded-lg overflow-hidden border border-bone/10 group/preview">
                        <img
                          src={heroImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setHeroImage('')}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-void/80 border border-bone/20 text-bone/60 hover:text-blood-light hover:border-blood/40 transition-colors opacity-0 group-hover/preview:opacity-100"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => heroFileRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setHeroDragOver(true) }}
                        onDragLeave={() => setHeroDragOver(false)}
                        onDrop={handleHeroDrop}
                        disabled={heroUploading}
                        className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-lg border-2 border-dashed text-xs font-mono transition-all duration-200 hover:bg-bone/5 disabled:opacity-50"
                        style={{
                          borderColor: heroDragOver ? currentColor : `${currentColor}30`,
                          color: currentColor,
                          background: heroDragOver ? `${currentColor}08` : undefined,
                        }}
                      >
                        {heroUploading ? (
                          <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>Subiendo...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 opacity-60" />
                            <span>Arrastra o haz clic para subir</span>
                          </>
                        )}
                      </button>
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

        <ImperialDivider />

        {/* ── Bottom action bar ── */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between pt-4"
        >
          <Link href="/wiki">
            <motion.button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-bone/50 hover:text-bone transition-colors"
              whileHover={{ x: -4 }}
            >
              <ChevronLeft className="w-4 h-4" />
              Cancelar
            </motion.button>
          </Link>
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              onClick={() => handleSubmit('draft')}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-void-light/60 border border-bone/15 text-bone/70 hover:bg-bone/5 hover:border-bone/30 hover:text-bone transition-all duration-200 disabled:opacity-40"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FileText className="w-4 h-4" />
              Guardar Borrador
            </motion.button>
            <motion.button
              type="button"
              onClick={() => handleSubmit('published')}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-imperial-gold/80 to-imperial-gold/60 text-void border border-imperial-gold/30 hover:from-imperial-gold hover:to-imperial-gold/80 shadow-[0_0_20px_rgba(201,162,39,0.2)] hover:shadow-[0_0_30px_rgba(201,162,39,0.4)] transition-all duration-200 disabled:opacity-40"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Globe className="w-4 h-4" />
              Publicar
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
