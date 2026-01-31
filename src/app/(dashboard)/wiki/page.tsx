'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Filter,
  BookOpen,
  Eye,
  Edit3,
  Trash2,
  Globe,
  FileText,
  Archive,
  MoreVertical,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { factions } from '@/lib/data'
import type { WikiPage, WikiCategory } from '@/lib/supabase/wiki.types'

export default function WikiDashboardPage() {
  const router = useRouter()
  const [pages, setPages] = useState<WikiPage[]>([])
  const [categories, setCategories] = useState<WikiCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [factionFilter, setFactionFilter] = useState<string>('')
  const [pendingContributions, setPendingContributions] = useState(0)

  useEffect(() => {
    loadData()
  }, [statusFilter, factionFilter])

  async function loadData() {
    setLoading(true)
    try {
      // Load categories
      const catRes = await fetch('/api/wiki/categories')
      if (catRes.ok) {
        setCategories(await catRes.json())
      }

      // Load pages
      let url = '/api/wiki?limit=50'
      if (statusFilter) url += `&status=${statusFilter}`
      if (factionFilter) url += `&faction_id=${factionFilter}`

      const pagesRes = await fetch(url)
      if (pagesRes.ok) {
        const data = await pagesRes.json()
        setPages(data.pages || [])
      }

      // Load pending contributions count
      const contribRes = await fetch('/api/wiki/contributions?status=pending&limit=1')
      if (contribRes.ok) {
        const contribData = await contribRes.json()
        setPendingContributions(contribData.total || 0)
      }
    } catch (error) {
      console.error('Error loading wiki data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPages = search
    ? pages.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    : pages

  const statusColors = {
    draft: 'bg-yellow-500/20 text-yellow-400',
    published: 'bg-green-500/20 text-green-400',
    archived: 'bg-gray-500/20 text-gray-400',
  }

  const statusIcons = {
    draft: FileText,
    published: Globe,
    archived: Archive,
  }

  async function handleDelete(pageId: string) {
    if (!confirm('Estas seguro de que quieres eliminar este articulo?')) return

    try {
      const res = await fetch(`/api/wiki/${pageId}`, { method: 'DELETE' })
      if (res.ok) {
        setPages(pages.filter(p => p.id !== pageId))
      }
    } catch (error) {
      console.error('Error deleting page:', error)
    }
  }

  async function handleStatusChange(pageId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/wiki/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        loadData()
      }
    } catch (error) {
      console.error('Error updating page status:', error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            Wiki Manager
          </h1>
          <p className="font-body text-bone/60">
            Gestiona los articulos de la wiki de facciones
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingContributions > 0 && (
            <Link href="/wiki/contribuciones">
              <Button variant="outline" className="gap-2 relative">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                Contribuciones
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blood text-white text-xs flex items-center justify-center">
                  {pendingContributions}
                </span>
              </Button>
            </Link>
          )}
          <Link href="/wiki/nuevo">
            <Button variant="primary" className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Articulo
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bone/40" />
              <Input
                type="text"
                placeholder="Buscar articulos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-void-light border border-bone/10 text-bone font-body focus:outline-none focus:ring-2 focus:ring-imperial-gold"
            >
              <option value="">Todos los estados</option>
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="archived">Archivado</option>
            </select>
            <select
              value={factionFilter}
              onChange={(e) => setFactionFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-void-light border border-bone/10 text-bone font-body focus:outline-none focus:ring-2 focus:ring-imperial-gold"
            >
              <option value="">Todas las facciones</option>
              {factions.map(f => (
                <option key={f.id} value={f.id}>{f.shortName}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      <div className="space-y-4">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-void-light rounded-lg animate-pulse" />
          ))
        ) : filteredPages.length === 0 ? (
          <Card className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-bone/30" />
            <h3 className="font-display text-xl text-white mb-2">
              No hay articulos
            </h3>
            <p className="font-body text-bone/60 mb-6">
              {search ? 'No se encontraron resultados.' : 'Crea tu primer articulo de wiki.'}
            </p>
            <Link href="/wiki/nuevo">
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Crear Articulo
              </Button>
            </Link>
          </Card>
        ) : (
          filteredPages.map((page, i) => {
            const faction = factions.find(f => f.id === page.faction_id)
            const StatusIcon = statusIcons[page.status]

            return (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card hover className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-body ${statusColors[page.status]}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {page.status === 'draft' ? 'Borrador' :
                         page.status === 'published' ? 'Publicado' : 'Archivado'}
                      </span>
                      {faction && (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-body"
                          style={{ background: `${faction.color}20`, color: faction.color }}
                        >
                          {faction.shortName}
                        </span>
                      )}
                      {page.category && (
                        <span className="text-xs text-bone/40 font-body">
                          {page.category.name}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-lg font-bold text-white truncate">
                      {page.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-xs text-bone/50 font-body">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {page.views_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(page.updated_at).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {page.status === 'published' && (
                      <Link href={`/facciones/${page.faction_id}/wiki/${page.slug}`} target="_blank">
                        <Button variant="ghost" size="sm" title="Ver publicado">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                    <Link href={`/wiki/${page.id}`}>
                      <Button variant="ghost" size="sm" title="Editar">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </Link>
                    {page.status === 'draft' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Publicar"
                        onClick={() => handleStatusChange(page.id, 'published')}
                      >
                        <Globe className="w-4 h-4 text-green-400" />
                      </Button>
                    )}
                    {page.status === 'published' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Archivar"
                        onClick={() => handleStatusChange(page.id, 'archived')}
                      >
                        <Archive className="w-4 h-4 text-yellow-400" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Eliminar"
                      onClick={() => handleDelete(page.id)}
                    >
                      <Trash2 className="w-4 h-4 text-blood" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
