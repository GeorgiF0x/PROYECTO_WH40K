'use client'

import * as React from 'react'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ShoppingBag,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  Tag,
  Package,
  RefreshCw,
  MapPin,
  Calendar,
  User,
  Ban,
  Star,
} from 'lucide-react'
import { DataTable, StatusBadge, FilterTabs, type Column, type Action } from '../components/ui/data-table'
import { Modal, ConfirmDialog, FormField, Textarea } from '../components/ui/modal'
import { Button } from '../components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { createClient } from '@/lib/supabase/client'

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

interface ListingItem {
  [key: string]: unknown
  id: string
  title: string
  description: string | null
  price: number | null
  listing_type: 'sale' | 'trade' | 'both'
  condition: string
  category: string
  faction?: string | null
  status: string
  images: string[]
  location?: string | null
  views_count: number
  created_at: string
  updated_at: string
  seller_id: string
  seller: {
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

type ListingStatus = 'all' | 'active' | 'sold' | 'reserved' | 'inactive' | 'deleted'

const statusLabels: Record<string, string> = {
  active: 'Activo',
  sold: 'Vendido',
  reserved: 'Reservado',
  inactive: 'Inactivo',
  deleted: 'Eliminado',
}

const typeLabels: Record<string, string> = {
  sale: 'Venta',
  trade: 'Intercambio',
  both: 'Venta/Intercambio',
}

const typeIcons: Record<string, React.ReactNode> = {
  sale: <Tag className="w-3.5 h-3.5" />,
  trade: <RefreshCw className="w-3.5 h-3.5" />,
  both: <Package className="w-3.5 h-3.5" />,
}

const conditionLabels: Record<string, string> = {
  nib: 'Nuevo en caja',
  nos: 'Nuevo sin caja',
  assembled: 'Montado',
  painted: 'Pintado',
  pro_painted: 'Pro Painted',
}

const categoryLabels: Record<string, string> = {
  miniatures: 'Miniaturas',
  novels: 'Novelas',
  codex: 'Codex/Reglas',
  paints: 'Pinturas',
  tools: 'Herramientas',
  terrain: 'Terreno',
  accessories: 'Accesorios',
  other: 'Otros',
}

// ══════════════════════════════════════════════════════════════
// MERCADO PAGE
// ══════════════════════════════════════════════════════════════

export default function MercadoPage() {
  const searchParams = useSearchParams()
  const initialStatus = (searchParams.get('status') as ListingStatus) || 'all'

  const [listings, setListings] = useState<ListingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<ListingStatus>(initialStatus)
  const [counts, setCounts] = useState({
    all: 0,
    active: 0,
    sold: 0,
    reserved: 0,
    inactive: 0,
  })

  // Modal states
  const [viewListing, setViewListing] = useState<ListingItem | null>(null)
  const [deleteListing, setDeleteListing] = useState<ListingItem | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Fetch listings
  const fetchListings = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      let query = supabase
        .from('listings')
        .select(`
          *,
          seller:profiles!listings_seller_id_fkey(username, display_name, avatar_url)
        `)
        .neq('status', 'deleted' as unknown as 'active' | 'sold' | 'reserved' | 'inactive')
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all' && statusFilter !== 'deleted') {
        query = query.eq('status', statusFilter as 'active' | 'sold' | 'reserved' | 'inactive')
      }

      const { data, error } = await query

      if (error) throw error
      setListings((data as ListingItem[]) || [])

      // Get counts
      const [
        { count: allCount },
        { count: activeCount },
        { count: soldCount },
        { count: reservedCount },
        { count: inactiveCount },
      ] = await Promise.all([
        supabase.from('listings').select('*', { count: 'exact', head: true }).neq('status', 'deleted' as unknown as 'active'),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'sold'),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'reserved'),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'inactive'),
      ])

      setCounts({
        all: allCount || 0,
        active: activeCount || 0,
        sold: soldCount || 0,
        reserved: reservedCount || 0,
        inactive: inactiveCount || 0,
      })
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  // Handle delete
  const handleDelete = async () => {
    if (!deleteListing) return

    setActionLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'deleted' as unknown as 'inactive' })
        .eq('id', deleteListing.id)

      if (error) throw error

      setDeleteListing(null)
      fetchListings()
    } catch (error) {
      console.error('Error deleting listing:', error)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle status change
  const handleStatusChange = async (listing: ListingItem, newStatus: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: newStatus as 'active' | 'sold' | 'reserved' | 'inactive' })
        .eq('id', listing.id)

      if (error) throw error
      fetchListings()
    } catch (error) {
      console.error('Error updating listing status:', error)
    }
  }

  // Format price
  const formatPrice = (price: number | null) => {
    if (price === null) return 'A convenir'
    return `${price.toLocaleString('es-ES')} €`
  }

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  // Table columns
  const columns: Column<ListingItem>[] = [
    {
      key: 'title',
      header: 'Anuncio',
      render: (listing) => (
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
            {listing.images?.[0] ? (
              <Image
                src={listing.images[0]}
                alt={listing.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-zinc-600" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-white truncate">{listing.title}</p>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                {typeIcons[listing.listing_type]}
                {typeLabels[listing.listing_type]}
              </span>
              <span>•</span>
              <span>{categoryLabels[listing.category] || listing.category}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'seller',
      header: 'Vendedor',
      render: (listing) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={listing.seller?.avatar_url || undefined} />
            <AvatarFallback className="text-xs">
              {(listing.seller?.display_name || listing.seller?.username)?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-zinc-300">
            {listing.seller?.display_name || listing.seller?.username || 'Usuario'}
          </span>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Precio',
      sortable: true,
      width: '120px',
      render: (listing) => (
        <span className="font-medium text-amber-500">
          {formatPrice(listing.price)}
        </span>
      ),
    },
    {
      key: 'views_count',
      header: 'Vistas',
      sortable: true,
      width: '80px',
      render: (listing) => (
        <span className="text-zinc-400 flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" />
          {listing.views_count || 0}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Fecha',
      sortable: true,
      width: '100px',
      render: (listing) => (
        <span className="text-zinc-500">{formatDate(listing.created_at)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      width: '120px',
      render: (listing) => (
        <StatusBadge
          status={
            listing.status === 'active' ? 'approved' :
            listing.status === 'sold' ? 'closed' :
            listing.status === 'reserved' ? 'pending' :
            'inactive'
          }
          labels={statusLabels}
        />
      ),
    },
  ]

  // Table actions
  const actions: Action<ListingItem>[] = [
    {
      label: 'Ver detalles',
      icon: <Eye className="w-4 h-4" />,
      onClick: (listing) => setViewListing(listing),
    },
    {
      label: 'Ver en mercado',
      icon: <ExternalLink className="w-4 h-4" />,
      onClick: (listing) => window.open(`/mercado/${listing.id}`, '_blank'),
    },
    {
      label: 'Marcar vendido',
      icon: <CheckCircle className="w-4 h-4" />,
      onClick: (listing) => handleStatusChange(listing, 'sold'),
      show: (listing) => listing.status === 'active' || listing.status === 'reserved',
    },
    {
      label: 'Reactivar',
      icon: <RefreshCw className="w-4 h-4" />,
      onClick: (listing) => handleStatusChange(listing, 'active'),
      show: (listing) => listing.status === 'inactive' || listing.status === 'sold',
    },
    {
      label: 'Desactivar',
      icon: <Ban className="w-4 h-4" />,
      onClick: (listing) => handleStatusChange(listing, 'inactive'),
      show: (listing) => listing.status === 'active',
    },
    {
      label: 'Eliminar',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (listing) => setDeleteListing(listing),
      variant: 'danger',
    },
  ]

  // Filter tabs
  const filterTabs = [
    { key: 'all', label: 'Todos', count: counts.all },
    { key: 'active', label: 'Activos', count: counts.active },
    { key: 'reserved', label: 'Reservados', count: counts.reserved },
    { key: 'sold', label: 'Vendidos', count: counts.sold },
    { key: 'inactive', label: 'Inactivos', count: counts.inactive },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Mercado P2P</h1>
          <p className="text-sm text-zinc-400">Gestiona los anuncios del mercado</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{counts.active}</p>
            <p className="text-xs text-zinc-500">anuncios activos</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <ShoppingBag className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{counts.all}</p>
              <p className="text-xs text-zinc-500">Total anuncios</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {listings.reduce((sum, l) => sum + (l.views_count || 0), 0).toLocaleString()}
              </p>
              <p className="text-xs text-zinc-500">Total vistas</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <CheckCircle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{counts.sold}</p>
              <p className="text-xs text-zinc-500">Vendidos</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Tag className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {counts.active > 0
                  ? `${Math.round((counts.sold / (counts.sold + counts.active)) * 100)}%`
                  : '0%'
                }
              </p>
              <p className="text-xs text-zinc-500">Tasa de venta</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterTabs
        tabs={filterTabs}
        activeTab={statusFilter}
        onChange={(key) => setStatusFilter(key as ListingStatus)}
      />

      {/* Table */}
      <DataTable
        data={listings}
        columns={columns}
        actions={actions}
        keyField="id"
        searchPlaceholder="Buscar por titulo, vendedor..."
        searchFields={['title', 'description']}
        loading={loading}
        emptyMessage="No hay anuncios"
        emptyIcon={<ShoppingBag className="w-8 h-8 text-zinc-600 mx-auto" />}
        pageSize={10}
      />

      {/* View Modal */}
      <Modal
        open={!!viewListing}
        onClose={() => setViewListing(null)}
        title="Detalles del anuncio"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setViewListing(null)}>
              Cerrar
            </Button>
            <Button asChild>
              <a href={`/mercado/${viewListing?.id}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver en mercado
              </a>
            </Button>
          </>
        }
      >
        {viewListing && (
          <div className="space-y-6">
            {/* Images */}
            {viewListing.images && viewListing.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {viewListing.images.slice(0, 4).map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-zinc-800">
                    <Image src={img} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Title and status */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{viewListing.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-zinc-500 flex items-center gap-1">
                    {typeIcons[viewListing.listing_type]}
                    {typeLabels[viewListing.listing_type]}
                  </span>
                  <span className="text-zinc-700">•</span>
                  <span className="text-xs text-zinc-500">
                    {categoryLabels[viewListing.category]}
                  </span>
                  <span className="text-zinc-700">•</span>
                  <span className="text-xs text-zinc-500">
                    {conditionLabels[viewListing.condition] || viewListing.condition}
                  </span>
                </div>
              </div>
              <StatusBadge
                status={
                  viewListing.status === 'active' ? 'approved' :
                  viewListing.status === 'sold' ? 'closed' :
                  viewListing.status === 'reserved' ? 'pending' :
                  'inactive'
                }
                labels={statusLabels}
              />
            </div>

            {/* Price */}
            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <p className="text-sm text-zinc-400 mb-1">Precio</p>
              <p className="text-2xl font-bold text-amber-500">{formatPrice(viewListing.price)}</p>
            </div>

            {/* Description */}
            {viewListing.description && (
              <div>
                <p className="text-xs font-medium text-[#E8E8F0]/40 uppercase tracking-wider mb-1.5">
                  Descripcion
                </p>
                <div className="max-h-36 overflow-y-auto rounded-lg bg-[#0a0a12]/80 border border-[#C9A227]/10 p-3">
                  <p className="text-sm text-[#E8E8F0]/70 whitespace-pre-wrap break-words">
                    {viewListing.description}
                  </p>
                </div>
              </div>
            )}

            {/* Seller */}
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                Vendedor
              </p>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={viewListing.seller?.avatar_url || undefined} />
                  <AvatarFallback>
                    {(viewListing.seller?.display_name || viewListing.seller?.username)?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-white">
                    {viewListing.seller?.display_name || viewListing.seller?.username}
                  </p>
                  <p className="text-xs text-zinc-500">@{viewListing.seller?.username}</p>
                </div>
                <Link
                  href={`/usuarios/${viewListing.seller?.username}`}
                  target="_blank"
                  className="ml-auto text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1"
                >
                  Ver perfil
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Meta info */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Eye className="w-4 h-4" />
                <span>{viewListing.views_count || 0} vistas</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(viewListing.created_at)}</span>
              </div>
              {viewListing.location && (
                <div className="flex items-center gap-2 text-sm text-zinc-400 col-span-2">
                  <MapPin className="w-4 h-4" />
                  <span>{viewListing.location}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteListing}
        onClose={() => setDeleteListing(null)}
        onConfirm={handleDelete}
        title="Eliminar anuncio"
        description={`¿Estas seguro de que quieres eliminar el anuncio "${deleteListing?.title}"? Esta accion no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  )
}
