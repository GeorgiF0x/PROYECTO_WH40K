'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  Save,
  Globe,
  FileText,
  Archive,
  Trash2,
  History,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { TiptapEditor, type TiptapEditorRef } from '@/components/wiki'
import { factions } from '@/lib/data'
import type { WikiPage, WikiCategory, TiptapContent, WikiPageUpdateInput, WikiRevision } from '@/lib/supabase/wiki.types'

export default function EditWikiArticlePage() {
  const params = useParams()
  const router = useRouter()
  const pageId = params.id as string
  const editorRef = useRef<TiptapEditorRef>(null)

  const [page, setPage] = useState<WikiPage | null>(null)
  const [categories, setCategories] = useState<WikiCategory[]>([])
  const [revisions, setRevisions] = useState<WikiRevision[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRevisions, setShowRevisions] = useState(false)

  // Form state
  const [categoryId, setCategoryId] = useState('')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [heroImage, setHeroImage] = useState('')
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft')

  const selectedFaction = page ? factions.find(f => f.id === page.faction_id) : null

  useEffect(() => {
    loadData()
  }, [pageId])

  async function loadData() {
    setLoading(true)
    try {
      // Load categories
      const catRes = await fetch('/api/wiki/categories')
      if (catRes.ok) {
        setCategories(await catRes.json())
      }

      // Load page
      const pageRes = await fetch(`/api/wiki/${pageId}`)
      if (!pageRes.ok) {
        throw new Error('Articulo no encontrado')
      }
      const pageData = await pageRes.json()
      setPage(pageData)

      // Set form state
      setCategoryId(pageData.category_id || '')
      setTitle(pageData.title)
      setSlug(pageData.slug)
      setExcerpt(pageData.excerpt || '')
      setHeroImage(pageData.hero_image || '')
      setStatus(pageData.status)

      // Set editor content after a brief delay to ensure editor is mounted
      setTimeout(() => {
        editorRef.current?.setContent(pageData.content)
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el articulo')
    } finally {
      setLoading(false)
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
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/wiki">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">
              Editar Articulo
            </h1>
            <p className="font-body text-sm text-bone/60">
              {selectedFaction?.shortName} / {page?.title}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {status === 'published' && (
            <Link href={`/facciones/${page?.faction_id}/wiki/${page?.slug}`} target="_blank">
              <Button variant="ghost" size="sm" className="gap-2">
                <Eye className="w-4 h-4" />
                Ver
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRevisions(!showRevisions)}
            className="gap-2"
          >
            <History className="w-4 h-4" />
            Historial
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="gap-2 text-blood hover:text-blood-light"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave()}
            disabled={saving}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Guardar
          </Button>
          {status !== 'published' && (
            <Button
              variant="primary"
              onClick={() => handleSave('published')}
              disabled={saving}
              className="gap-2"
            >
              <Globe className="w-4 h-4" />
              Publicar
            </Button>
          )}
          {status === 'published' && (
            <Button
              variant="secondary"
              onClick={() => handleSave('archived')}
              disabled={saving}
              className="gap-2"
            >
              <Archive className="w-4 h-4" />
              Archivar
            </Button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-blood/20 border border-blood/40 text-blood-light font-body">
          {error}
        </div>
      )}

      {/* Status indicator */}
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-body ${
            status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
            status === 'published' ? 'bg-green-500/20 text-green-400' :
            'bg-gray-500/20 text-gray-400'
          }`}
        >
          {status === 'draft' ? <FileText className="w-4 h-4" /> :
           status === 'published' ? <Globe className="w-4 h-4" /> :
           <Archive className="w-4 h-4" />}
          {status === 'draft' ? 'Borrador' :
           status === 'published' ? 'Publicado' : 'Archivado'}
        </span>
        {page?.published_at && (
          <span className="text-sm text-bone/50 font-body">
            Publicado el {new Date(page.published_at).toLocaleDateString('es-ES')}
          </span>
        )}
      </div>

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
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titulo del articulo"
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
                  placeholder="slug-del-articulo"
                />
                <p className="mt-1 text-xs text-bone/40 font-body">
                  URL: /facciones/{page?.faction_id}/wiki/{slug}
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
              content={page?.content}
              factionColor={selectedFaction?.color || '#C9A227'}
              placeholder="Escribe el contenido del articulo..."
            />
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Clasificacion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block font-body text-sm text-bone/70 mb-2">
                  Faccion
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
            </CardContent>
          </Card>

          {/* Meta info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informacion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm font-body text-bone/60">
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
        </div>
      </div>
    </div>
  )
}
