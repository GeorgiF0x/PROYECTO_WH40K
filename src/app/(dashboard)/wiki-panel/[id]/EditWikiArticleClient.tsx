'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Save,
  Globe,
  FileText,
  Archive,
  Trash2,
  History,
  Eye,
  Crosshair,
  Feather,
  Upload,
  Loader2,
  HelpCircle,
  X,
  ShieldAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import {
  BlockNoteEditor,
  type WikiEditorRef,
  WikiGallery,
  FactionPicker,
  EditorGuide,
} from '@/components/wiki'
import {
  WikiPageBackground,
  GothicCorners,
  ImperialDivider,
  SectionLabel,
} from '@/components/wiki/WikiDecorations'
import { factions } from '@/lib/data'
import { compressImage } from '@/lib/utils/compressImage'
import type {
  WikiPage,
  WikiCategory,
  WikiPageUpdateInput,
  WikiRevision,
} from '@/lib/supabase/wiki.types'

interface EditWikiArticleClientProps {
  pageId: string
  currentUserId: string
  isAdmin: boolean
  isLexicanum: boolean
}

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
    <div className={`group relative ${className}`}>
      <div
        className="absolute left-0 right-0 top-0 h-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `linear-gradient(to right, transparent, ${c}, transparent)`,
        }}
      />
      <GothicCorners className={`text-[${c}]`} size={24} />
      {children}
    </div>
  )
}

export default function EditWikiArticleClient({
  pageId,
  currentUserId,
  isAdmin,
  isLexicanum,
}: EditWikiArticleClientProps) {
  const router = useRouter()
  const editorRef = useRef<WikiEditorRef>(null)

  const [page, setPage] = useState<WikiPage | null>(null)
  const [categories, setCategories] = useState<WikiCategory[]>([])
  const [revisions, setRevisions] = useState<WikiRevision[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRevisions, setShowRevisions] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)

  // Form state
  const [subFaction, setSubFaction] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [heroImage, setHeroImage] = useState('')
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft')
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [heroUploading, setHeroUploading] = useState(false)
  const [heroDragOver, setHeroDragOver] = useState(false)
  const heroFileRef = useRef<HTMLInputElement>(null)

  const selectedFaction = page ? factions.find((f) => f.id === page.faction_id) : null
  const currentColor = selectedFaction?.color || '#C9A227'

  const canEdit = isAdmin || isLexicanum || page?.author_id === currentUserId
  const canPublish = isAdmin || isLexicanum
  const canDelete = isAdmin

  useEffect(() => {
    loadData()
  }, [pageId])

  async function loadData() {
    setLoading(true)
    try {
      const catRes = await fetch('/api/wiki/categories')
      if (catRes.ok) {
        setCategories(await catRes.json())
      }

      const pageRes = await fetch(`/api/wiki/${pageId}`)
      if (!pageRes.ok) {
        throw new Error('Articulo no encontrado')
      }
      const pageData = await pageRes.json()
      setPage(pageData)

      // Check ownership after loading page data
      if (!isAdmin && !isLexicanum && pageData.author_id !== currentUserId) {
        setAccessDenied(true)
        return
      }

      setCategoryId(pageData.category_id || '')
      setTitle(pageData.title)
      setSlug(pageData.slug)
      setExcerpt(pageData.excerpt || '')
      setHeroImage(pageData.hero_image || '')
      setGalleryImages(pageData.gallery_images || [])
      setStatus(pageData.status)

      setTimeout(() => {
        editorRef.current?.setContent(pageData.content)
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el articulo')
    } finally {
      setLoading(false)
    }
  }

  const handleHeroUpload = useCallback(
    async (file: File) => {
      setHeroUploading(true)
      try {
        const compressed = await compressImage(file)
        const formData = new FormData()
        formData.append('file', compressed)
        if (page?.faction_id) formData.append('faction_id', page.faction_id)
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
    },
    [page?.faction_id]
  )

  function handleHeroDrop(e: React.DragEvent) {
    e.preventDefault()
    setHeroDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleHeroUpload(file)
    }
  }

  async function handleSave(newStatus?: 'draft' | 'published' | 'archived') {
    if (!title || !slug) {
      setError('Titulo y slug son requeridos')
      return
    }

    const editorContent = editorRef.current?.getContent()
    if (!editorContent) {
      setError('Error al obtener el contenido del editor')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const payload: WikiPageUpdateInput = {
        category_id: categoryId || undefined,
        title,
        slug,
        excerpt: excerpt || undefined,
        hero_image: heroImage || undefined,
        gallery_images: galleryImages,
        content: editorContent,
        status: newStatus || status,
      }

      const res = await fetch(`/api/wiki/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al guardar')
      }

      const data = await res.json()
      setPage(data)
      setStatus(data.status)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        'Estas seguro de que quieres eliminar este articulo? Esta accion no se puede deshacer.'
      )
    ) {
      return
    }

    try {
      const res = await fetch(`/api/wiki/${pageId}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/wiki-panel')
      } else {
        throw new Error('Error al eliminar')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded bg-bone/10" />
        <div className="h-96 animate-pulse rounded-lg bg-bone/10" />
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div className="relative">
        <WikiPageBackground />
        <div className="relative z-10 overflow-hidden rounded-2xl border border-blood/20 bg-void-light/30 py-20 text-center">
          <GothicCorners className="text-blood/20" size={36} />
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-blood/30 bg-blood/10">
            <ShieldAlert className="h-9 w-9 text-blood/70" />
          </div>
          <h2 className="mb-2 font-display text-2xl font-bold text-bone">Acceso Denegado</h2>
          <p className="mb-8 font-mono text-sm text-bone/40">
            Solo puedes editar articulos que hayas creado.
          </p>
          <Link href="/wiki-panel">
            <Button variant="outline">Volver al listado</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (error && !page) {
    return (
      <div className="py-20 text-center">
        <h2 className="mb-4 font-display text-2xl text-white">{error}</h2>
        <Link href="/wiki-panel">
          <Button variant="outline">Volver al listado</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="relative">
      <WikiPageBackground />

      <motion.div
        className="relative z-10 max-w-6xl space-y-8"
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
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(201,162,39,0.06)_0%,transparent_60%)]" />

          <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="flex items-start gap-4">
              <Link href="/wiki-panel">
                <Button variant="ghost" size="sm" className="mt-1">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <SectionLabel icon={Crosshair} className="mb-2">
                  EDITAR ARTICULO // ARCHIVO LEXICANUM
                </SectionLabel>
                <div className="mb-1 flex items-center gap-3">
                  <h1 className="font-display text-2xl font-bold tracking-wide text-bone">
                    Editar Articulo
                  </h1>
                  <div className="flex items-center gap-1.5">
                    <motion.div
                      className="h-2 w-2 rounded-full bg-necron-teal"
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-imperial-gold/40 bg-imperial-gold/15 px-2.5 py-1 font-mono text-[11px] tracking-wider text-imperial-gold shadow-[0_0_12px_rgba(201,162,39,0.2)]">
                      <Feather className="h-3 w-3" />
                      {isAdmin ? 'ARCHIVISTA' : isLexicanum ? 'LEXICANUM' : 'SCRIBE'}
                    </span>
                  </div>
                </div>
                <p className="font-mono text-sm text-bone/40">
                  {selectedFaction?.shortName} / {page?.title}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {status === 'published' && (
                <Link href={`/wiki/${page?.faction_id}/${page?.slug}`} target="_blank">
                  <motion.button
                    className="inline-flex items-center gap-2 rounded-lg border border-bone/10 bg-void-light/60 px-3 py-2 text-sm font-medium text-bone/60 transition-all duration-200 hover:bg-bone/5 hover:text-bone"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Eye className="h-4 w-4" />
                    Ver
                  </motion.button>
                </Link>
              )}
              <motion.button
                type="button"
                onClick={() => setShowRevisions(!showRevisions)}
                className="inline-flex items-center gap-2 rounded-lg border border-bone/10 bg-void-light/60 px-3 py-2 text-sm font-medium text-bone/60 transition-all duration-200 hover:bg-bone/5 hover:text-bone"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <History className="h-4 w-4" />
                Historial
              </motion.button>
              {canDelete && (
                <motion.button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 rounded-lg border border-blood/20 bg-void-light/60 px-3 py-2 text-sm font-medium text-blood/70 transition-all duration-200 hover:border-blood/40 hover:bg-blood/10 hover:text-blood-light"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </motion.button>
              )}
              <motion.button
                type="button"
                onClick={() => handleSave()}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg border border-bone/15 bg-void-light/60 px-4 py-2 text-sm font-medium text-bone/70 transition-all duration-200 hover:border-bone/30 hover:bg-bone/5 hover:text-bone disabled:opacity-40"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Save className="h-4 w-4" />
                Guardar
              </motion.button>
              {canPublish && status !== 'published' && (
                <motion.button
                  type="button"
                  onClick={() => handleSave('published')}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg border border-imperial-gold/30 bg-gradient-to-r from-imperial-gold/80 to-imperial-gold/60 px-5 py-2 text-sm font-semibold text-void shadow-[0_0_20px_rgba(201,162,39,0.2)] transition-all duration-200 hover:from-imperial-gold hover:to-imperial-gold/80 hover:shadow-[0_0_30px_rgba(201,162,39,0.4)] disabled:opacity-40"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Globe className="h-4 w-4" />
                  Publicar
                </motion.button>
              )}
              {canPublish && status === 'published' && (
                <motion.button
                  type="button"
                  onClick={() => handleSave('archived')}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg border border-bone/15 bg-void-light/60 px-4 py-2 text-sm font-medium text-bone/60 transition-all duration-200 hover:bg-bone/5 hover:text-bone disabled:opacity-40"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Archive className="h-4 w-4" />
                  Archivar
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        <ImperialDivider />

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-blood/40 bg-blood/20 p-4 font-body text-blood-light"
          >
            {error}
          </motion.div>
        )}

        {/* Status indicator */}
        <motion.div variants={itemVariants} className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-sm tracking-wider ${
              status === 'draft'
                ? 'border border-amber-500/30 bg-amber-500/15 text-amber-400'
                : status === 'published'
                  ? 'border border-green-500/30 bg-green-500/15 text-green-400'
                  : 'border border-gray-500/30 bg-gray-500/15 text-gray-400'
            }`}
          >
            {status === 'draft' ? (
              <FileText className="h-4 w-4" />
            ) : status === 'published' ? (
              <Globe className="h-4 w-4" />
            ) : (
              <Archive className="h-4 w-4" />
            )}
            {status === 'draft' ? 'BORRADOR' : status === 'published' ? 'PUBLICADO' : 'ARCHIVADO'}
          </span>
          {page?.published_at && (
            <span className="font-mono text-sm text-bone/50">
              Publicado el {new Date(page.published_at).toLocaleDateString('es-ES')}
            </span>
          )}
        </motion.div>

        {/* ── Faction Picker ── */}
        {page?.faction_id && (
          <motion.div variants={itemVariants}>
            <FactionPicker
              factionId={page.faction_id}
              subFaction={subFaction}
              onFactionChange={() => {}}
              onSubFactionChange={setSubFaction}
              factionColor={currentColor}
            />
          </motion.div>
        )}

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-3">
            {/* Title & Slug */}
            <motion.div variants={itemVariants}>
              <TacticalCard color={`${currentColor}40`}>
                <Card>
                  <CardContent className="space-y-4 pt-4">
                    <div>
                      <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-imperial-gold/50">
                        TITULO *
                      </label>
                      <Input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Titulo del articulo"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-imperial-gold/50">
                        SLUG (URL) *
                      </label>
                      <Input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="slug-del-articulo"
                      />
                      <p className="mt-1 font-mono text-xs text-bone/40">
                        /wiki/{page?.faction_id}/{slug}
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
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-6 w-1 rounded-full"
                          style={{
                            background: `linear-gradient(180deg, ${currentColor}, ${currentColor}40)`,
                          }}
                        />
                        <span className="font-mono text-[10px] tracking-[0.2em] text-imperial-gold/50">
                          CONTENIDO
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowGuide(!showGuide)}
                        className="flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[10px] text-bone/40 transition-colors hover:bg-imperial-gold/5 hover:text-imperial-gold/70"
                        title="Guia del editor"
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">AYUDA</span>
                      </button>
                    </CardTitle>
                  </CardHeader>
                  <EditorGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />
                  <div className="border-b border-bone/5 px-4 py-2">
                    <span className="font-mono text-[11px] italic text-bone/25">
                      Escribe <span className="text-imperial-gold/40">/</span> para insertar bloques
                      especiales
                    </span>
                  </div>
                  <BlockNoteEditor
                    ref={editorRef}
                    content={page?.content}
                    factionColor={currentColor}
                    factionId={page?.faction_id || undefined}
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
                factionId={page?.faction_id || undefined}
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
                    <CardTitle className="font-mono text-[10px] text-base tracking-[0.2em] text-imperial-gold/50">
                      CLASIFICACION
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-bone/40">
                        FACCION
                      </label>
                      <div
                        className="rounded-lg border px-4 py-2 font-body"
                        style={{
                          background: selectedFaction ? `${selectedFaction.color}10` : undefined,
                          borderColor: selectedFaction?.color || 'rgba(232,232,240,0.1)',
                          color: selectedFaction?.color || 'inherit',
                        }}
                      >
                        {selectedFaction?.name || 'Desconocida'}
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-bone/40">
                        CATEGORIA
                      </label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full rounded-lg border border-bone/10 bg-void-light px-4 py-2 font-body text-bone transition-all duration-200 focus:outline-none focus:ring-2"
                        style={{
                          ['--tw-ring-color' as string]: currentColor,
                        }}
                      >
                        <option value="">Sin categoria</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </TacticalCard>
            </motion.div>

            {/* Excerpt */}
            <motion.div variants={itemVariants}>
              <TacticalCard color={`${currentColor}30`}>
                <Card>
                  <CardHeader>
                    <CardTitle className="font-mono text-[10px] text-base tracking-[0.2em] text-imperial-gold/50">
                      EXTRACTO
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="Breve descripcion para listados..."
                      rows={3}
                    />
                  </CardContent>
                </Card>
              </TacticalCard>
            </motion.div>

            {/* Hero Image */}
            <motion.div variants={itemVariants}>
              <TacticalCard color={`${currentColor}30`}>
                <Card>
                  <CardHeader>
                    <CardTitle className="font-mono text-[10px] text-base tracking-[0.2em] text-imperial-gold/50">
                      IMAGEN PRINCIPAL
                    </CardTitle>
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
                      <div className="group/preview relative aspect-video overflow-hidden rounded-lg border border-bone/10">
                        <img
                          src={heroImage}
                          alt="Preview"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setHeroImage('')}
                          className="absolute right-2 top-2 rounded-full border border-bone/20 bg-void/80 p-1.5 text-bone/60 opacity-0 transition-colors hover:border-blood/40 hover:text-blood-light group-hover/preview:opacity-100"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => heroFileRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault()
                          setHeroDragOver(true)
                        }}
                        onDragLeave={() => setHeroDragOver(false)}
                        onDrop={handleHeroDrop}
                        disabled={heroUploading}
                        className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 font-mono text-xs transition-all duration-200 hover:bg-bone/5 disabled:opacity-50"
                        style={{
                          borderColor: heroDragOver ? currentColor : `${currentColor}30`,
                          color: currentColor,
                          background: heroDragOver ? `${currentColor}08` : undefined,
                        }}
                      >
                        {heroUploading ? (
                          <>
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>Subiendo...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 opacity-60" />
                            <span>Arrastra o haz clic para subir</span>
                          </>
                        )}
                      </button>
                    )}
                    <p className="font-mono text-xs text-bone/40">Recomendado: 1200x630px</p>
                  </CardContent>
                </Card>
              </TacticalCard>
            </motion.div>

            {/* Meta info */}
            <motion.div variants={itemVariants}>
              <TacticalCard color={`${currentColor}30`}>
                <Card>
                  <CardHeader>
                    <CardTitle className="font-mono text-[10px] text-base tracking-[0.2em] text-imperial-gold/50">
                      INFORMACION
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 font-mono text-sm text-bone/60">
                    <div className="flex justify-between">
                      <span>Vistas:</span>
                      <span className="text-bone">{page?.views_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Creado:</span>
                      <span className="text-bone">
                        {page?.created_at && new Date(page.created_at).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Actualizado:</span>
                      <span className="text-bone">
                        {page?.updated_at && new Date(page.updated_at).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TacticalCard>
            </motion.div>
          </div>
        </div>

        <ImperialDivider />

        {/* ── Bottom action bar ── */}
        <motion.div variants={itemVariants} className="flex items-center justify-between pt-4">
          <Link href="/wiki-panel">
            <motion.button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-bone/50 transition-colors hover:text-bone"
              whileHover={{ x: -4 }}
            >
              <ChevronLeft className="h-4 w-4" />
              Volver al listado
            </motion.button>
          </Link>
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg border border-bone/15 bg-void-light/60 px-4 py-2 text-sm font-medium text-bone/70 transition-all duration-200 hover:border-bone/30 hover:bg-bone/5 hover:text-bone disabled:opacity-40"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save className="h-4 w-4" />
              Guardar
            </motion.button>
            {canPublish && status !== 'published' && (
              <motion.button
                type="button"
                onClick={() => handleSave('published')}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg border border-imperial-gold/30 bg-gradient-to-r from-imperial-gold/80 to-imperial-gold/60 px-5 py-2 text-sm font-semibold text-void shadow-[0_0_20px_rgba(201,162,39,0.2)] transition-all duration-200 hover:from-imperial-gold hover:to-imperial-gold/80 hover:shadow-[0_0_30px_rgba(201,162,39,0.4)] disabled:opacity-40"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Globe className="h-4 w-4" />
                Publicar
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
