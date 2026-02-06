'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { BlockNoteEditor, type WikiEditorRef, WikiGallery, FactionPicker } from '@/components/wiki'
import { factions } from '@/lib/data'
import { compressImage } from '@/lib/utils/compressImage'
import type { WikiPage, WikiCategory, WikiPageUpdateInput, WikiRevision } from '@/lib/supabase/wiki.types'

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

export default function EditWikiArticlePage() {
  const params = useParams()
  const router = useRouter()
  const pageId = params.id as string
  const editorRef = useRef<WikiEditorRef>(null)

  const [page, setPage] = useState<WikiPage | null>(null)
  const [categories, setCategories] = useState<WikiCategory[]>([])
  const [revisions, setRevisions] = useState<WikiRevision[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRevisions, setShowRevisions] = useState(false)

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
  const heroFileRef = useRef<HTMLInputElement>(null)

  const selectedFaction = page ? factions.find(f => f.id === page.faction_id) : null
  const currentColor = selectedFaction?.color || '#C9A227'

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

  async function handleHeroUpload(file: File) {
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
    if (!confirm('Estas seguro de que quieres eliminar este articulo? Esta accion no se puede deshacer.')) {
      return
    }

    try {
      const res = await fetch(`/api/wiki/${pageId}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/wiki')
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
        <div className="h-10 w-64 bg-bone/10 rounded animate-pulse" />
        <div className="h-96 bg-bone/10 rounded-lg animate-pulse" />
      </div>
    )
  }

  if (error && !page) {
    return (
      <div className="text-center py-20">
        <h2 className="font-display text-2xl text-white mb-4">{error}</h2>
        <Link href="/wiki">
          <Button variant="outline">Volver al listado</Button>
        </Link>
      </div>
    )
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
                EDITAR ARTICULO // ARCHIVO LEXICANUM
              </span>
            </div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-display font-bold text-bone tracking-wide">
                Editar Articulo
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono tracking-wider border bg-imperial-gold/15 border-imperial-gold/40 text-imperial-gold shadow-[0_0_12px_rgba(201,162,39,0.2)]">
                <Feather className="w-3 h-3" />
                SCRIBE
              </span>
            </div>
            <p className="text-bone/40 font-mono text-sm">
              {selectedFaction?.shortName} / {page?.title}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {status === 'published' && (
            <Link href={`/facciones/${page?.faction_id}/wiki/${page?.slug}`} target="_blank">
              <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-void-light/60 border border-bone/10 text-bone/60 hover:bg-bone/5 hover:text-bone transition-all duration-200 active:scale-[0.97]">
                <Eye className="w-4 h-4" />
                Ver
              </button>
            </Link>
          )}
          <button
            type="button"
            onClick={() => setShowRevisions(!showRevisions)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-void-light/60 border border-bone/10 text-bone/60 hover:bg-bone/5 hover:text-bone transition-all duration-200 active:scale-[0.97]"
          >
            <History className="w-4 h-4" />
            Historial
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-void-light/60 border border-blood/20 text-blood/70 hover:bg-blood/10 hover:border-blood/40 hover:text-blood-light transition-all duration-200 active:scale-[0.97]"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-void-light/60 border border-bone/15 text-bone/70 hover:bg-bone/5 hover:border-bone/30 hover:text-bone transition-all duration-200 active:scale-[0.97] disabled:opacity-40"
          >
            <Save className="w-4 h-4" />
            Guardar
          </button>
          {status !== 'published' && (
            <button
              type="button"
              onClick={() => handleSave('published')}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-imperial-gold/80 to-imperial-gold/60 text-void border border-imperial-gold/30 hover:from-imperial-gold hover:to-imperial-gold/80 shadow-[0_0_20px_rgba(201,162,39,0.2)] hover:shadow-[0_0_30px_rgba(201,162,39,0.4)] transition-all duration-200 active:scale-[0.97] disabled:opacity-40"
            >
              <Globe className="w-4 h-4" />
              Publicar
            </button>
          )}
          {status === 'published' && (
            <button
              type="button"
              onClick={() => handleSave('archived')}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-void-light/60 border border-bone/15 text-bone/60 hover:bg-bone/5 hover:text-bone transition-all duration-200 active:scale-[0.97] disabled:opacity-40"
            >
              <Archive className="w-4 h-4" />
              Archivar
            </button>
          )}
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

      {/* Status indicator */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-mono tracking-wider ${
            status === 'draft' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
            status === 'published' ? 'bg-green-500/15 text-green-400 border border-green-500/30' :
            'bg-gray-500/15 text-gray-400 border border-gray-500/30'
          }`}
        >
          {status === 'draft' ? <FileText className="w-4 h-4" /> :
           status === 'published' ? <Globe className="w-4 h-4" /> :
           <Archive className="w-4 h-4" />}
          {status === 'draft' ? 'BORRADOR' :
           status === 'published' ? 'PUBLICADO' : 'ARCHIVADO'}
        </span>
        {page?.published_at && (
          <span className="text-sm text-bone/50 font-mono">
            Publicado el {new Date(page.published_at).toLocaleDateString('es-ES')}
          </span>
        )}
      </motion.div>

      {/* ── Faction Picker (read-only display for edit, showing subfaction selector) ── */}
      {page?.faction_id && (
        <motion.div variants={itemVariants}>
          <FactionPicker
            factionId={page.faction_id}
            subFaction={subFaction}
            onFactionChange={() => {}} // Faction is locked on edit
            onSubFactionChange={setSubFaction}
            factionColor={currentColor}
          />
        </motion.div>
      )}

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
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Titulo del articulo"
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
                      placeholder="slug-del-articulo"
                    />
                    <p className="mt-1 text-xs text-bone/40 font-mono">
                      /facciones/{page?.faction_id}/wiki/{slug}
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
                  <CardTitle className="text-base font-mono text-[10px] text-imperial-gold/50 tracking-[0.2em]">CLASIFICACION</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block font-mono text-[10px] text-bone/40 tracking-[0.15em] uppercase mb-2">
                      FACCION
                    </label>
                    <div
                      className="px-4 py-2 rounded-lg border font-body"
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
                    <label className="block font-mono text-[10px] text-bone/40 tracking-[0.15em] uppercase mb-2">
                      CATEGORIA
                    </label>
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
                  <CardTitle className="text-base font-mono text-[10px] text-imperial-gold/50 tracking-[0.2em]">EXTRACTO</CardTitle>
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
                </CardContent>
              </Card>
            </TacticalCard>
          </motion.div>

          {/* Meta info */}
          <motion.div variants={itemVariants}>
            <TacticalCard color={`${currentColor}30`}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-mono text-[10px] text-imperial-gold/50 tracking-[0.2em]">INFORMACION</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm font-mono text-bone/60">
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
            Volver al listado
          </button>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-void-light/60 border border-bone/15 text-bone/70 hover:bg-bone/5 hover:border-bone/30 hover:text-bone transition-all duration-200 active:scale-[0.97] disabled:opacity-40"
          >
            <Save className="w-4 h-4" />
            Guardar
          </button>
          {status !== 'published' && (
            <button
              type="button"
              onClick={() => handleSave('published')}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-imperial-gold/80 to-imperial-gold/60 text-void border border-imperial-gold/30 hover:from-imperial-gold hover:to-imperial-gold/80 shadow-[0_0_20px_rgba(201,162,39,0.2)] hover:shadow-[0_0_30px_rgba(201,162,39,0.4)] transition-all duration-200 active:scale-[0.97] disabled:opacity-40"
            >
              <Globe className="w-4 h-4" />
              Publicar
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
