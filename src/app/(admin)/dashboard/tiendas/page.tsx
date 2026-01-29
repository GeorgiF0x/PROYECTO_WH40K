'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Store,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Instagram,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Eye,
  Building2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Store as StoreType, StoreStatus } from '@/lib/types/database.types'

type StoreWithSubmitter = StoreType & {
  submitter: {
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

const STATUS_LABELS: Record<StoreStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pendiente', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: Clock },
  approved: { label: 'Aprobada', color: 'text-green-500 bg-green-500/10 border-green-500/20', icon: CheckCircle },
  rejected: { label: 'Rechazada', color: 'text-red-500 bg-red-500/10 border-red-500/20', icon: XCircle },
  closed: { label: 'Cerrada', color: 'text-bone/50 bg-bone/5 border-bone/10', icon: Building2 },
}

const STORE_TYPE_LABELS: Record<string, string> = {
  specialist: 'Tienda Especializada',
  comics_games: 'Comics y Juegos',
  general_hobby: 'Hobby General',
  online_only: 'Solo Online',
}

export default function StoresManagementPage() {
  const [stores, setStores] = useState<StoreWithSubmitter[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StoreStatus | 'all'>('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedStore, setExpandedStore] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null)

  const supabase = createClient()

  const fetchStores = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('stores')
      .select(`
        *,
        submitter:profiles!stores_submitted_by_fkey(
          username,
          display_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching stores:', error)
    } else {
      setStores(data as StoreWithSubmitter[])
    }
    setLoading(false)
  }, [supabase, statusFilter, searchQuery])

  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  const handleApprove = async (storeId: string) => {
    setActionLoading(storeId)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('stores')
      .update({
        status: 'approved',
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', storeId)

    if (error) {
      console.error('Error approving store:', error)
      alert('Error al aprobar la tienda')
    } else {
      fetchStores()
    }
    setActionLoading(null)
  }

  const handleReject = async (storeId: string) => {
    if (!rejectionReason.trim()) {
      alert('Por favor, indica el motivo del rechazo')
      return
    }

    setActionLoading(storeId)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('stores')
      .update({
        status: 'rejected',
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: rejectionReason,
      })
      .eq('id', storeId)

    if (error) {
      console.error('Error rejecting store:', error)
      alert('Error al rechazar la tienda')
    } else {
      setShowRejectModal(null)
      setRejectionReason('')
      fetchStores()
    }
    setActionLoading(null)
  }

  const toggleExpanded = (storeId: string) => {
    setExpandedStore(expandedStore === storeId ? null : storeId)
  }

  const pendingCount = stores.filter(s => s.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bone flex items-center gap-3">
            <Store className="w-7 h-7 text-gold" />
            Gestión de Tiendas
          </h1>
          <p className="text-bone/50 mt-1">
            Revisa y aprueba las tiendas enviadas por la comunidad
          </p>
        </div>
        {statusFilter === 'pending' && pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-amber-500">
              {pendingCount} {pendingCount === 1 ? 'tienda pendiente' : 'tiendas pendientes'}
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bone/40" />
          <input
            type="text"
            placeholder="Buscar por nombre o ciudad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone placeholder:text-bone/40 focus:outline-none focus:border-gold/30"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                statusFilter === status
                  ? 'bg-gold/10 text-gold border border-gold/20'
                  : 'bg-bone/5 text-bone/70 border border-bone/10 hover:bg-bone/10'
              )}
            >
              {status === 'all' ? 'Todas' : STATUS_LABELS[status].label}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={fetchStores}
          disabled={loading}
          className="p-2.5 bg-bone/5 border border-bone/10 rounded-lg text-bone/70 hover:text-bone hover:bg-bone/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Stores List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-bone/5 border border-bone/10 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-12 bg-bone/5 border border-bone/10 rounded-lg">
            <Store className="w-12 h-12 text-bone/30 mx-auto mb-4" />
            <p className="text-bone/50">No hay tiendas {statusFilter !== 'all' ? STATUS_LABELS[statusFilter].label.toLowerCase() + 's' : ''}</p>
          </div>
        ) : (
          <AnimatePresence>
            {stores.map((store) => {
              const statusInfo = STATUS_LABELS[store.status]
              const StatusIcon = statusInfo.icon
              const isExpanded = expandedStore === store.id

              return (
                <motion.div
                  key={store.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-void-light border border-bone/10 rounded-lg overflow-hidden"
                >
                  {/* Main Row */}
                  <div
                    className="p-4 cursor-pointer hover:bg-bone/5 transition-colors"
                    onClick={() => toggleExpanded(store.id)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Store Image */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-bone/10 flex-shrink-0">
                        {store.images?.[0] ? (
                          <Image
                            src={store.images[0]}
                            alt={store.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Store className="w-6 h-6 text-bone/30" />
                          </div>
                        )}
                      </div>

                      {/* Store Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-bone truncate">{store.name}</h3>
                          <span className={cn('px-2 py-0.5 rounded text-xs border flex items-center gap-1', statusInfo.color)}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-bone/50">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {store.city}, {store.country}
                          </span>
                          <span>{STORE_TYPE_LABELS[store.store_type]}</span>
                        </div>
                        <p className="text-xs text-bone/40 mt-1">
                          Enviado por @{store.submitter?.username || 'desconocido'} · {new Date(store.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {store.status === 'pending' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleApprove(store.id)
                              }}
                              disabled={actionLoading === store.id}
                              className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                              title="Aprobar"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowRejectModal(store.id)
                              }}
                              disabled={actionLoading === store.id}
                              className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                              title="Rechazar"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <Link
                          href={`/comunidad/tiendas/${store.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 bg-bone/5 border border-bone/10 rounded-lg text-bone/50 hover:text-bone hover:bg-bone/10 transition-colors"
                          title="Ver tienda"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-bone/30" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-bone/30" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-2 border-t border-bone/10 space-y-4">
                          {/* Description */}
                          {store.description && (
                            <div>
                              <h4 className="text-xs font-medium text-bone/50 uppercase tracking-wider mb-1">Descripción</h4>
                              <p className="text-sm text-bone/70">{store.description}</p>
                            </div>
                          )}

                          {/* Contact Info */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {store.phone && (
                              <div className="flex items-center gap-2 text-sm text-bone/70">
                                <Phone className="w-4 h-4 text-bone/40" />
                                {store.phone}
                              </div>
                            )}
                            {store.email && (
                              <div className="flex items-center gap-2 text-sm text-bone/70">
                                <Mail className="w-4 h-4 text-bone/40" />
                                {store.email}
                              </div>
                            )}
                            {store.website && (
                              <a href={store.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gold hover:underline">
                                <Globe className="w-4 h-4" />
                                Sitio web
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {store.instagram && (
                              <a href={`https://instagram.com/${store.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-pink-400 hover:underline">
                                <Instagram className="w-4 h-4" />
                                @{store.instagram}
                              </a>
                            )}
                          </div>

                          {/* Address */}
                          <div>
                            <h4 className="text-xs font-medium text-bone/50 uppercase tracking-wider mb-1">Dirección Completa</h4>
                            <p className="text-sm text-bone/70">
                              {store.address}, {store.postal_code} {store.city}, {store.province}, {store.country}
                            </p>
                            <p className="text-xs text-bone/40 mt-1">
                              Coordenadas: {store.latitude.toFixed(6)}, {store.longitude.toFixed(6)}
                            </p>
                          </div>

                          {/* Services */}
                          {store.services && store.services.length > 0 && (
                            <div>
                              <h4 className="text-xs font-medium text-bone/50 uppercase tracking-wider mb-2">Servicios</h4>
                              <div className="flex flex-wrap gap-2">
                                {store.services.map((service, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-bone/5 border border-bone/10 rounded text-xs text-bone/70">
                                    {service}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Images */}
                          {store.images && store.images.length > 0 && (
                            <div>
                              <h4 className="text-xs font-medium text-bone/50 uppercase tracking-wider mb-2">Imágenes</h4>
                              <div className="flex gap-2 overflow-x-auto pb-2">
                                {store.images.map((img, idx) => (
                                  <Image
                                    key={idx}
                                    src={img}
                                    alt={`${store.name} ${idx + 1}`}
                                    width={120}
                                    height={80}
                                    className="rounded-lg object-cover flex-shrink-0"
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Rejection Reason (if rejected) */}
                          {store.status === 'rejected' && store.rejection_reason && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                              <h4 className="text-xs font-medium text-red-500 uppercase tracking-wider mb-1">Motivo del Rechazo</h4>
                              <p className="text-sm text-red-400">{store.rejection_reason}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRejectModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-void-light border border-bone/20 rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-bone mb-2">Rechazar Tienda</h3>
              <p className="text-sm text-bone/50 mb-4">
                Por favor, indica el motivo del rechazo. Este mensaje será visible para el usuario.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Motivo del rechazo..."
                rows={4}
                className="w-full px-3 py-2 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone placeholder:text-bone/40 focus:outline-none focus:border-red-500/30 resize-none"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowRejectModal(null)
                    setRejectionReason('')
                  }}
                  className="px-4 py-2 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone/70 hover:text-bone hover:bg-bone/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleReject(showRejectModal)}
                  disabled={actionLoading === showRejectModal || !rejectionReason.trim()}
                  className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  {actionLoading === showRejectModal ? 'Rechazando...' : 'Confirmar Rechazo'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
