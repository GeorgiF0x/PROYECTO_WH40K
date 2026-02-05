'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  Save,
  Globe,
  FileText,
  Image as ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { TiptapEditor, type TiptapEditorRef, WikiGallery } from '@/components/wiki'
import { factions } from '@/lib/data'
import type { WikiCategory, TiptapContent, WikiPageCreateInput } from '@/lib/supabase/wiki.types'

export default function NewWikiArticlePage() {
  const router = useRouter()
  const editorRef = useRef<TiptapEditorRef>(null)

  const [categories, setCategories] = useState<WikiCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [factionId, setFactionId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [heroImage, setHeroImage] = useState('')
  const [content, setContent] = useState<TiptapContent | null>(null)
  const [galleryImages, setGalleryImages] = useState<string[]>([])

  const selectedFaction = factions.find(f => f.id === factionId)

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
    // Auto-generate slug if not manually edited
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value))
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
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/wiki">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">
              Nuevo Articulo
            </h1>
            <p className="font-body text-sm text-bone/60">
              Crea un nuevo articulo para la wiki
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => handleSubmit('draft')}
            disabled={loading}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            Guardar Borrador
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSubmit('published')}
            disabled={loading}
            className="gap-2"
          >
            <Globe className="w-4 h-4" />
            Publicar
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-blood/20 border border-blood/40 text-blood-light font-body">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Slug */}
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div>
                <label className="block font-body text-sm text-bone/70 mb-2">
                  Titulo *
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Ej: La Herejia de Horus"
                />
              </div>
              <div>
                <label className="block font-body text-sm text-bone/70 mb-2">
                  Slug (URL) *
                </label>
                <Input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="la-herejia-de-horus"
                />
                <p className="mt-1 text-xs text-bone/40 font-body">
                  URL: /facciones/{factionId || '[faccion]'}/wiki/{slug || '[slug]'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Editor */}
          <Card padding="none">
            <CardHeader className="border-b border-bone/10 p-4">
              <CardTitle className="text-base">Contenido</CardTitle>
            </CardHeader>
            <TiptapEditor
              ref={editorRef}
              onChange={setContent}
              factionColor={selectedFaction?.color || '#C9A227'}
              placeholder="Escribe el contenido del articulo..."
            />
          </Card>

          {/* Gallery */}
          <WikiGallery
            images={galleryImages}
            onChange={setGalleryImages}
            factionId={factionId || undefined}
            factionColor={selectedFaction?.color || '#C9A227'}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Faction & Category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Clasificacion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block font-body text-sm text-bone/70 mb-2">
                  Faccion *
                </label>
                <select
                  value={factionId}
                  onChange={(e) => setFactionId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-void-light border border-bone/10 text-bone font-body focus:outline-none focus:ring-2 focus:ring-imperial-gold"
                >
                  <option value="">Seleccionar faccion</option>
                  {factions.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-body text-sm text-bone/70 mb-2">
                  Categoria
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-void-light border border-bone/10 text-bone font-body focus:outline-none focus:ring-2 focus:ring-imperial-gold"
                >
                  <option value="">Sin categoria</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Excerpt */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Extracto</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Breve descripcion para listados..."
                rows={3}
              />
              <p className="mt-2 text-xs text-bone/40 font-body">
                Opcional. Se muestra en las tarjetas del listado.
              </p>
            </CardContent>
          </Card>

          {/* Hero Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Imagen Principal</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                placeholder="URL de la imagen..."
              />
              {heroImage && (
                <div className="mt-3 relative aspect-video rounded-lg overflow-hidden border border-bone/10">
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
              <p className="mt-2 text-xs text-bone/40 font-body">
                Recomendado: 1200x630px
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
