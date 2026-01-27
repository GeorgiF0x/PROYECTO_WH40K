'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  Plus,
  Package,
  Edit3,
  Trash2,
  Eye,
  Heart,
  MapPin,
  AlertCircle,
  Store,
  Loader2,
} from 'lucide-react'
import type { Listing } from '@/lib/types/database.types'

const conditionLabels: Record<string, string> = {
  nib: 'Nuevo en caja',
  nos: 'Nuevo sin caja',
  assembled: 'Montado',
  painted: 'Pintado',
  pro_painted: 'Pro Painted',
}

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: 'Activo', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  sold: { label: 'Vendido', color: 'bg-imperial-gold/20 text-imperial-gold border-imperial-gold/30' },
  reserved: { label: 'Reservado', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  inactive: { label: 'Inactivo', color: 'bg-bone/10 text-bone/50 border-bone/20' },
}

export default function MisAnunciosPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const supabase = createClient()

  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null)

  const fetchListings = useCallback(async () => {
    if (!user) return
    setIsLoading(true)

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setListings(data)
    }
    setIsLoading(false)
  }, [user, supabase])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/mercado/mis-anuncios')
      return
    }
    if (user) {
      fetchListings()
    }
  }, [user, authLoading, router, fetchListings])

  const handleDelete = async (listingId: string) => {
    if (!confirm('¿Seguro que quieres eliminar este anuncio? Esta acción no se puede deshacer.')) return
    setDeletingId(listingId)

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId)
      .eq('seller_id', user!.id)

    if (!error) {
      setListings((prev) => prev.filter((l) => l.id !== listingId))
    }
    setDeletingId(null)
  }

  const handleStatusChange = async (listingId: string, newStatus: 'active' | 'reserved' | 'sold' | 'inactive') => {
    setStatusUpdatingId(listingId)

    const { error } = await supabase
      .from('listings')
      .update({ status: newStatus })
      .eq('id', listingId)
      .eq('seller_id', user!.id)

    if (!error) {
      setListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, status: newStatus } : l))
      )
    }
    setStatusUpdatingId(null)
  }

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-imperial-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-bone flex items-center gap-3">
              <Store className="w-8 h-8 text-imperial-gold" />
              Mis Anuncios
            </h1>
            <p className="text-bone/60 font-body mt-2">
              Gestiona tus publicaciones del mercado.
            </p>
          </div>
          <Link href="/mercado/nuevo">
            <motion.span
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-imperial-gold to-yellow-500 text-void font-display font-bold text-sm rounded-xl cursor-pointer"
              whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(201, 162, 39, 0.3)' }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4" />
              Nuevo anuncio
            </motion.span>
          </Link>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-imperial-gold animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && listings.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Package className="w-16 h-16 text-bone/20 mx-auto mb-4" />
            <h2 className="text-xl font-display font-bold text-bone mb-2">
              No tienes anuncios publicados
            </h2>
            <p className="text-bone/50 font-body mb-6">
              Publica tu primer anuncio y empieza a vender o intercambiar.
            </p>
            <Link href="/mercado/nuevo">
              <motion.span
                className="inline-flex items-center gap-2 px-6 py-3 bg-imperial-gold text-void font-display font-bold rounded-xl cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-4 h-4" />
                Publicar anuncio
              </motion.span>
            </Link>
          </motion.div>
        )}

        {/* Listings */}
        <div className="space-y-4">
          <AnimatePresence>
            {listings.map((listing, index) => {
              const status = statusLabels[listing.status] || statusLabels.active
              const thumbnail = listing.images?.[0] || '/placeholder-miniature.jpg'

              return (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-void-light rounded-xl border border-bone/10 overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Thumbnail */}
                    <Link href={`/mercado/${listing.id}`} className="relative w-full sm:w-48 aspect-video sm:aspect-square flex-shrink-0">
                      <Image
                        src={thumbnail}
                        alt={listing.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 192px"
                      />
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-md border ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                      <div>
                        <Link href={`/mercado/${listing.id}`}>
                          <h3 className="font-display font-bold text-bone text-lg hover:text-imperial-gold transition-colors line-clamp-1">
                            {listing.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-bone/50 font-body mt-1 line-clamp-2">
                          {listing.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <span className="text-lg font-display font-bold text-imperial-gold">
                            {listing.price}€
                          </span>
                          <span className="text-xs text-bone/40 font-body">
                            {conditionLabels[listing.condition] || listing.condition}
                          </span>
                          {listing.location && (
                            <span className="flex items-center gap-1 text-xs text-bone/40">
                              <MapPin className="w-3 h-3" />
                              {listing.location}
                            </span>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 mt-2 text-xs text-bone/40">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {listing.views_count || 0} visitas
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5" />
                            {(listing as any).favorites_count || 0} favoritos
                          </span>
                          <span>
                            {new Date(listing.created_at).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-bone/10">
                        {/* Status toggle */}
                        {listing.status === 'active' && (
                          <button
                            onClick={() => handleStatusChange(listing.id, 'sold')}
                            disabled={statusUpdatingId === listing.id}
                            className="px-3 py-1.5 text-xs font-body font-medium bg-imperial-gold/10 text-imperial-gold border border-imperial-gold/20 rounded-lg hover:bg-imperial-gold/20 transition-colors disabled:opacity-50"
                          >
                            {statusUpdatingId === listing.id ? 'Actualizando...' : 'Marcar vendido'}
                          </button>
                        )}
                        {listing.status === 'sold' && (
                          <button
                            onClick={() => handleStatusChange(listing.id, 'active')}
                            disabled={statusUpdatingId === listing.id}
                            className="px-3 py-1.5 text-xs font-body font-medium bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors disabled:opacity-50"
                          >
                            {statusUpdatingId === listing.id ? 'Actualizando...' : 'Reactivar'}
                          </button>
                        )}

                        <Link
                          href={`/mercado/${listing.id}`}
                          className="p-2 text-bone/40 hover:text-bone transition-colors"
                          title="Ver anuncio"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <Link
                          href={`/mercado/mis-anuncios/editar/${listing.id}`}
                          className="p-2 text-bone/40 hover:text-imperial-gold transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleDelete(listing.id)}
                          disabled={deletingId === listing.id}
                          className="p-2 text-bone/40 hover:text-red-400 transition-colors disabled:opacity-50"
                          title="Eliminar"
                        >
                          {deletingId === listing.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
