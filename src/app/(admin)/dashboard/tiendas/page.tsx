'use client'

import * as React from 'react'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Store,
  MapPin,
  Globe,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import { DataTable, StatusBadge, FilterTabs, type Column, type Action } from '../components/ui/data-table'
import { Modal, ConfirmDialog, FormField, Input, Textarea, Select } from '../components/ui/modal'
import { Button } from '../components/ui/button'
import { createClient } from '@/lib/supabase/client'

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

interface CommunityStore {
  [key: string]: unknown
  id: string
  name: string
  description: string | null
  address: string | null
  city: string | null
  province: string | null
  country: string
  phone: string | null
  email: string | null
  website: string | null
  status: 'pending' | 'approved' | 'rejected' | 'closed'
  created_at: string | null
  submitted_by: string
  submitter?: {
    username: string
    display_name: string | null
  }
}

type StoreStatus = 'all' | 'pending' | 'approved' | 'rejected'

// ══════════════════════════════════════════════════════════════
// TIENDAS PAGE
// ══════════════════════════════════════════════════════════════

export default function TiendasPage() {
  const searchParams = useSearchParams()
  const initialStatus = (searchParams.get('status') as StoreStatus) || 'all'

  const [stores, setStores] = useState<CommunityStore[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StoreStatus>(initialStatus)
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 })

  // Modal states
  const [viewStore, setViewStore] = useState<CommunityStore | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    store: CommunityStore
    action: 'approve' | 'reject' | 'delete'
  } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Fetch stores
  const fetchStores = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      let query = supabase
        .from('stores')
        .select(`
          *,
          submitter:profiles!stores_submitted_by_fkey(username, display_name)
        `)
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setStores(data || [])

      // Get counts
      const [
        { count: allCount },
        { count: pendingCount },
        { count: approvedCount },
        { count: rejectedCount },
      ] = await Promise.all([
        supabase.from('stores').select('*', { count: 'exact', head: true }),
        supabase.from('stores').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('stores').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('stores').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      ])

      setCounts({
        all: allCount || 0,
        pending: pendingCount || 0,
        approved: approvedCount || 0,
        rejected: rejectedCount || 0,
      })
    } catch (error) {
      console.error('Error fetching stores:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  // Handle actions
  const handleAction = async () => {
    if (!confirmAction) return

    setActionLoading(true)
    const supabase = createClient()

    try {
      if (confirmAction.action === 'delete') {
        const { error } = await supabase
          .from('stores')
          .delete()
          .eq('id', confirmAction.store.id)
        if (error) throw error
      } else {
        const newStatus = confirmAction.action === 'approve' ? 'approved' : 'rejected'
        const { error } = await supabase
          .from('stores')
          .update({ status: newStatus })
          .eq('id', confirmAction.store.id)
        if (error) throw error
      }

      setConfirmAction(null)
      fetchStores()
    } catch (error) {
      console.error('Error performing action:', error)
    } finally {
      setActionLoading(false)
    }
  }

  // Table columns
  const columns: Column<CommunityStore>[] = [
    {
      key: 'name',
      header: 'Tienda',
      sortable: true,
      render: (store) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-zinc-800 rounded-lg flex items-center justify-center">
            <Store className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <p className="font-medium text-white">{store.name}</p>
            <p className="text-xs text-zinc-500">
              {store.submitter?.display_name || store.submitter?.username || 'Sin propietario'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'city',
      header: 'Ubicación',
      sortable: true,
      render: (store) => (
        <div className="flex items-center gap-2 text-zinc-400">
          <MapPin className="w-3.5 h-3.5" />
          <span>
            {[store.city, store.province].filter(Boolean).join(', ') || 'Sin ubicación'}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      width: '120px',
      render: (store) => <StatusBadge status={store.status} />,
    },
    {
      key: 'created_at',
      header: 'Fecha',
      sortable: true,
      width: '120px',
      render: (store) => (
        <span className="text-zinc-500">
          {store.created_at ? new Date(store.created_at).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }) : '-'}
        </span>
      ),
    },
  ]

  // Table actions
  const actions: Action<CommunityStore>[] = [
    {
      label: 'Ver detalles',
      icon: <Eye className="w-4 h-4" />,
      onClick: (store) => setViewStore(store),
    },
    {
      label: 'Aprobar',
      icon: <CheckCircle className="w-4 h-4" />,
      onClick: (store) => setConfirmAction({ store, action: 'approve' }),
      show: (store) => store.status !== 'approved',
    },
    {
      label: 'Rechazar',
      icon: <XCircle className="w-4 h-4" />,
      onClick: (store) => setConfirmAction({ store, action: 'reject' }),
      show: (store) => store.status !== 'rejected',
    },
    {
      label: 'Eliminar',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (store) => setConfirmAction({ store, action: 'delete' }),
      variant: 'danger',
    },
  ]

  // Filter tabs
  const filterTabs = [
    { key: 'all', label: 'Todas', count: counts.all },
    { key: 'pending', label: 'Pendientes', count: counts.pending },
    { key: 'approved', label: 'Aprobadas', count: counts.approved },
    { key: 'rejected', label: 'Rechazadas', count: counts.rejected },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Tiendas</h1>
          <p className="text-sm text-zinc-400">Gestiona las tiendas de la comunidad</p>
        </div>
      </div>

      {/* Filters */}
      <FilterTabs
        tabs={filterTabs}
        activeTab={statusFilter}
        onChange={(key) => setStatusFilter(key as StoreStatus)}
      />

      {/* Table */}
      <DataTable
        data={stores}
        columns={columns}
        actions={actions}
        keyField="id"
        searchPlaceholder="Buscar por nombre, ciudad..."
        searchFields={['name', 'city', 'province']}
        loading={loading}
        emptyMessage="No hay tiendas"
        emptyIcon={<Store className="w-8 h-8 text-zinc-600 mx-auto" />}
        pageSize={10}
      />

      {/* View Modal */}
      <Modal
        open={!!viewStore}
        onClose={() => setViewStore(null)}
        title={viewStore?.name || 'Detalles de tienda'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setViewStore(null)}>
              Cerrar
            </Button>
            {viewStore?.status === 'pending' && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setViewStore(null)
                    setConfirmAction({ store: viewStore, action: 'reject' })
                  }}
                >
                  Rechazar
                </Button>
                <Button
                  onClick={() => {
                    setViewStore(null)
                    setConfirmAction({ store: viewStore, action: 'approve' })
                  }}
                >
                  Aprobar
                </Button>
              </>
            )}
          </>
        }
      >
        {viewStore && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <StatusBadge status={viewStore.status} />
              <span className="text-xs text-zinc-500">
                {viewStore.created_at ? `Creada el ${new Date(viewStore.created_at).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}` : ''}
              </span>
            </div>

            {viewStore.description && (
              <p className="text-sm text-zinc-300">{viewStore.description}</p>
            )}

            <div className="grid gap-3 pt-2">
              {viewStore.address && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-zinc-500 mt-0.5" />
                  <div>
                    <p className="text-zinc-300">{viewStore.address}</p>
                    <p className="text-zinc-500">
                      {[viewStore.city, viewStore.province, viewStore.country]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {viewStore.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-300">{viewStore.phone}</span>
                </div>
              )}

              {viewStore.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-zinc-500" />
                  <a
                    href={`mailto:${viewStore.email}`}
                    className="text-zinc-300 hover:text-white"
                  >
                    {viewStore.email}
                  </a>
                </div>
              )}

              {viewStore.website && (
                <div className="flex items-center gap-3 text-sm">
                  <Globe className="w-4 h-4 text-zinc-500" />
                  <a
                    href={viewStore.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-300 hover:text-white flex items-center gap-1"
                  >
                    {viewStore.website}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-800">
              <p className="text-xs text-zinc-500">Propietario</p>
              <p className="text-sm text-zinc-300">
                {viewStore.submitter?.display_name || viewStore.submitter?.username || 'Desconocido'}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleAction}
        title={
          confirmAction?.action === 'approve'
            ? 'Aprobar tienda'
            : confirmAction?.action === 'reject'
            ? 'Rechazar tienda'
            : 'Eliminar tienda'
        }
        description={
          confirmAction?.action === 'approve'
            ? `¿Aprobar "${confirmAction?.store.name}"? La tienda será visible públicamente.`
            : confirmAction?.action === 'reject'
            ? `¿Rechazar "${confirmAction?.store.name}"? El propietario será notificado.`
            : `¿Eliminar "${confirmAction?.store.name}"? Esta acción no se puede deshacer.`
        }
        confirmLabel={
          confirmAction?.action === 'approve'
            ? 'Aprobar'
            : confirmAction?.action === 'reject'
            ? 'Rechazar'
            : 'Eliminar'
        }
        variant={confirmAction?.action === 'delete' ? 'danger' : 'default'}
        loading={actionLoading}
      />
    </div>
  )
}
