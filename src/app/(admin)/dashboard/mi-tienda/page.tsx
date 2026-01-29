'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Globe,
  Instagram,
  Facebook,
  Star,
  Eye,
  Edit,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Calendar,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Store as StoreType, StoreReview, Profile } from '@/lib/types/database.types'

const STORE_TYPE_LABELS: Record<string, string> = {
  specialist: 'Tienda Especializada',
  comics_games: 'Comics y Juegos',
  general_hobby: 'Hobby General',
  online_only: 'Solo Online',
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  pending: { label: 'Pendiente de Aprobación', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: Clock },
  approved: { label: 'Aprobada', color: 'text-green-500 bg-green-500/10 border-green-500/20', icon: CheckCircle },
  rejected: { label: 'Rechazada', color: 'text-red-500 bg-red-500/10 border-red-500/20', icon: AlertCircle },
  closed: { label: 'Cerrada', color: 'text-bone/50 bg-bone/5 border-bone/10', icon: Store },
}

export default function MyStorePage() {
  const [store, setStore] = useState<StoreType | null>(null)
  const [reviews, setReviews] = useState<(StoreReview & { reviewer: Pick<Profile, 'username' | 'display_name' | 'avatar_url'> })[]>([])
  const [loading, setLoading] = useState(true)
  const [hasStore, setHasStore] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch user's store
      const { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .eq('submitted_by', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (storeData) {
        setStore(storeData)
        setHasStore(true)

        // Fetch reviews for this store
        const { data: reviewsData } = await supabase
          .from('store_reviews')
          .select(`
            *,
            reviewer:profiles!store_reviews_reviewer_id_fkey(
              username,
              display_name,
              avatar_url
            )
          `)
          .eq('store_id', storeData.id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (reviewsData) {
          setReviews(reviewsData as any)
        }
      }

      setLoading(false)
    }

    fetchData()
  }, [supabase])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-bone/10 rounded animate-pulse" />
        <div className="h-48 bg-bone/5 border border-bone/10 rounded-lg animate-pulse" />
      </div>
    )
  }

  if (!hasStore) {
    return (
      <div className="text-center py-12">
        <Store className="w-16 h-16 text-bone/30 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-bone mb-2">No tienes una tienda registrada</h2>
        <p className="text-bone/50 mb-6">
          Registra tu tienda para aparecer en el mapa de la comunidad.
        </p>
        <Link
          href="/comunidad/tiendas/enviar"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gold/10 border border-gold/20 rounded-lg text-gold hover:bg-gold/20 transition-colors"
        >
          <Store className="w-5 h-5" />
          Registrar mi Tienda
        </Link>
      </div>
    )
  }

  if (!store) return null

  const statusInfo = STATUS_LABELS[store.status] || STATUS_LABELS.pending
  const StatusIcon = statusInfo.icon

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bone flex items-center gap-3">
            <Store className="w-7 h-7 text-gold" />
            Mi Tienda
          </h1>
          <p className="text-bone/50 mt-1">
            Gestiona la información de tu tienda
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn('px-3 py-1.5 rounded-lg text-sm border flex items-center gap-2', statusInfo.color)}>
            <StatusIcon className="w-4 h-4" />
            {statusInfo.label}
          </span>
          {store.status === 'approved' && (
            <Link
              href={`/comunidad/tiendas/${store.slug}`}
              className="flex items-center gap-2 px-3 py-1.5 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone/70 hover:text-bone hover:bg-bone/10 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Ver Página
            </Link>
          )}
        </div>
      </div>

      {/* Rejection Notice */}
      {store.status === 'rejected' && store.rejection_reason && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-400">Tienda Rechazada</h3>
              <p className="text-sm text-red-400/80 mt-1">{store.rejection_reason}</p>
              <p className="text-xs text-bone/50 mt-2">
                Puedes editar la información y volver a enviar para revisión.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      {store.status === 'approved' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-void-light border border-bone/10 rounded-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gold/10 rounded-lg">
                <Star className="w-5 h-5 text-gold" />
              </div>
              <span className="text-sm text-bone/50">Valoración</span>
            </div>
            <p className="text-2xl font-bold text-bone">
              {store.avg_rating ? store.avg_rating.toFixed(1) : '—'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 bg-void-light border border-bone/10 rounded-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-sm text-bone/50">Reseñas</span>
            </div>
            <p className="text-2xl font-bold text-bone">{store.review_count || 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 bg-void-light border border-bone/10 rounded-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-teal-500/10 rounded-lg">
                <Eye className="w-5 h-5 text-teal-400" />
              </div>
              <span className="text-sm text-bone/50">Visitas</span>
            </div>
            <p className="text-2xl font-bold text-bone">—</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-void-light border border-bone/10 rounded-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-sm text-bone/50">Eventos</span>
            </div>
            <p className="text-2xl font-bold text-bone">—</p>
          </motion.div>
        </div>
      )}

      {/* Store Info Card */}
      <div className="p-6 bg-void-light border border-bone/10 rounded-lg">
        <div className="flex items-start gap-6">
          {/* Store Image */}
          <div className="w-32 h-32 rounded-lg overflow-hidden bg-bone/10 flex-shrink-0">
            {store.images?.[0] ? (
              <Image
                src={store.images[0]}
                alt={store.name}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Store className="w-12 h-12 text-bone/30" />
              </div>
            )}
          </div>

          {/* Store Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-bone">{store.name}</h2>
                <p className="text-sm text-bone/50">{STORE_TYPE_LABELS[store.store_type]}</p>
              </div>
              <button
                className="p-2 bg-bone/5 border border-bone/10 rounded-lg text-bone/50 hover:text-bone hover:bg-bone/10 transition-colors"
                title="Editar (próximamente)"
              >
                <Edit className="w-5 h-5" />
              </button>
            </div>

            {store.description && (
              <p className="text-sm text-bone/70 mt-3 line-clamp-2">{store.description}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="flex items-center gap-2 text-sm text-bone/70">
                <MapPin className="w-4 h-4 text-bone/40" />
                <span className="truncate">{store.address}, {store.city}</span>
              </div>
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
                <a
                  href={store.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gold hover:underline"
                >
                  <Globe className="w-4 h-4" />
                  Sitio web
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Social Links */}
            <div className="flex gap-2 mt-4">
              {store.instagram && (
                <a
                  href={`https://instagram.com/${store.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-pink-500/10 border border-pink-500/20 rounded-lg text-pink-400 hover:bg-pink-500/20 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {store.facebook && (
                <a
                  href={store.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Services */}
        {store.services && store.services.length > 0 && (
          <div className="mt-6 pt-4 border-t border-bone/10">
            <h3 className="text-sm font-medium text-bone/50 uppercase tracking-wider mb-3">Servicios</h3>
            <div className="flex flex-wrap gap-2">
              {store.services.map((service, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-bone/5 border border-bone/10 rounded-full text-sm text-bone/70"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Opening Hours */}
        {store.opening_hours && typeof store.opening_hours === 'object' && (
          <div className="mt-6 pt-4 border-t border-bone/10">
            <h3 className="text-sm font-medium text-bone/50 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Horario
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              {Object.entries(store.opening_hours as Record<string, string>).map(([day, hours]) => (
                <div key={day} className="p-2 bg-bone/5 rounded">
                  <span className="text-bone/50 capitalize">{day}:</span>
                  <span className="text-bone ml-2">{hours || 'Cerrado'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Images Gallery */}
        {store.images && store.images.length > 1 && (
          <div className="mt-6 pt-4 border-t border-bone/10">
            <h3 className="text-sm font-medium text-bone/50 uppercase tracking-wider mb-3">Galería</h3>
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
      </div>

      {/* Recent Reviews */}
      {store.status === 'approved' && (
        <div>
          <h2 className="font-semibold text-bone flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            Reseñas Recientes
          </h2>

          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 bg-void-light border border-bone/10 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-bone/10 flex items-center justify-center overflow-hidden">
                      {review.reviewer?.avatar_url ? (
                        <Image
                          src={review.reviewer.avatar_url}
                          alt={review.reviewer.username}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-bone/50 text-sm">
                          {review.reviewer?.username?.[0]?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-bone">
                            {review.reviewer?.display_name || review.reviewer?.username || 'Usuario'}
                          </p>
                          <p className="text-xs text-bone/50">
                            {new Date(review.created_at).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                'w-4 h-4',
                                i < review.rating ? 'text-gold fill-gold' : 'text-bone/20'
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      {review.content && (
                        <p className="text-sm text-bone/70 mt-2">{review.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-bone/5 border border-bone/10 rounded-lg">
              <MessageSquare className="w-10 h-10 text-bone/30 mx-auto mb-2" />
              <p className="text-bone/50">Aún no tienes reseñas</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
