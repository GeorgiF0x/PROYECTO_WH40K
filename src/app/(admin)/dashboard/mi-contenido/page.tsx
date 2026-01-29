'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import {
  Palette,
  Image as ImageIcon,
  Users,
  Eye,
  Heart,
  MessageSquare,
  Settings,
  Plus,
  Pin,
  PinOff,
  ExternalLink,
  TrendingUp,
  Edit,
  Briefcase,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui'
import type { Profile, Miniature } from '@/lib/types/database.types'

interface CreatorStats {
  totalMiniatures: number
  totalViews: number
  totalLikes: number
  totalFollowers: number
}

export default function MyContentPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [miniatures, setMiniatures] = useState<Miniature[]>([])
  const [stats, setStats] = useState<CreatorStats>({
    totalMiniatures: 0,
    totalViews: 0,
    totalLikes: 0,
    totalFollowers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [commissionStatus, setCommissionStatus] = useState(false)
  const [commissionInfo, setCommissionInfo] = useState('')
  const [showCommissionEdit, setShowCommissionEdit] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setCommissionStatus(profileData.accepts_commissions || false)
        setCommissionInfo(profileData.commission_info || '')
      }

      // Fetch miniatures
      const { data: miniaturesData } = await supabase
        .from('miniatures')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (miniaturesData) {
        setMiniatures(miniaturesData)
      }

      // Fetch stats
      const [likesResult, followersResult] = await Promise.all([
        supabase
          .from('miniature_likes')
          .select('id', { count: 'exact', head: true })
          .in('miniature_id', miniaturesData?.map(m => m.id) || []),
        supabase
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('following_id', user.id),
      ])

      const totalViews = miniaturesData?.reduce((sum, m) => sum + (m.view_count || 0), 0) || 0

      setStats({
        totalMiniatures: miniaturesData?.length || 0,
        totalViews,
        totalLikes: likesResult.count || 0,
        totalFollowers: followersResult.count || 0,
      })

      setLoading(false)
    }

    fetchData()
  }, [supabase])

  const handleTogglePinned = async (miniatureId: string) => {
    if (!profile) return

    const currentPinned = profile.pinned_miniatures || []
    const isPinned = currentPinned.includes(miniatureId)

    let newPinned: string[]
    if (isPinned) {
      newPinned = currentPinned.filter(id => id !== miniatureId)
    } else {
      if (currentPinned.length >= 6) {
        alert('Máximo 6 miniaturas fijadas')
        return
      }
      newPinned = [...currentPinned, miniatureId]
    }

    const { error } = await supabase
      .from('profiles')
      .update({ pinned_miniatures: newPinned })
      .eq('id', profile.id)

    if (!error) {
      setProfile({ ...profile, pinned_miniatures: newPinned })
    }
  }

  const handleUpdateCommissions = async () => {
    if (!profile) return
    setUpdating(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        accepts_commissions: commissionStatus,
        commission_info: commissionInfo,
      })
      .eq('id', profile.id)

    if (error) {
      alert('Error al actualizar')
    } else {
      setProfile({
        ...profile,
        accepts_commissions: commissionStatus,
        commission_info: commissionInfo,
      })
      setShowCommissionEdit(false)
    }
    setUpdating(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-bone/10 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-bone/5 border border-bone/10 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!profile || profile.creator_status !== 'approved') {
    return (
      <div className="text-center py-12">
        <Palette className="w-16 h-16 text-bone/30 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-bone mb-2">Acceso Restringido</h2>
        <p className="text-bone/50 mb-4">
          Esta sección es solo para creadores verificados.
        </p>
        <Link
          href="/comunidad/creadores/solicitar"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 hover:bg-purple-500/20 transition-colors"
        >
          Solicitar ser Creador
        </Link>
      </div>
    )
  }

  const pinnedIds = profile.pinned_miniatures || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bone flex items-center gap-3">
            <Palette className="w-7 h-7 text-purple-400" />
            Mi Contenido
          </h1>
          <p className="text-bone/50 mt-1">
            Gestiona tu perfil de creador y contenido
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-sm text-purple-400">
            {profile.creator_type || 'Creador'}
          </span>
          <Link
            href={`/usuarios/${profile.username}`}
            className="flex items-center gap-2 px-3 py-1.5 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone/70 hover:text-bone hover:bg-bone/10 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Ver Perfil
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-void-light border border-bone/10 rounded-lg"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <ImageIcon className="w-5 h-5 text-teal-400" />
            </div>
            <span className="text-sm text-bone/50">Miniaturas</span>
          </div>
          <p className="text-2xl font-bold text-bone">{stats.totalMiniatures}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-void-light border border-bone/10 rounded-lg"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm text-bone/50">Visualizaciones</span>
          </div>
          <p className="text-2xl font-bold text-bone">{stats.totalViews.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-void-light border border-bone/10 rounded-lg"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Heart className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-sm text-bone/50">Likes Totales</span>
          </div>
          <p className="text-2xl font-bold text-bone">{stats.totalLikes.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-void-light border border-bone/10 rounded-lg"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm text-bone/50">Seguidores</span>
          </div>
          <p className="text-2xl font-bold text-bone">{stats.totalFollowers.toLocaleString()}</p>
        </motion.div>
      </div>

      {/* Commission Status */}
      <div className="p-4 bg-void-light border border-bone/10 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-gold" />
            <h2 className="font-semibold text-bone">Estado de Comisiones</h2>
          </div>
          <button
            onClick={() => setShowCommissionEdit(!showCommissionEdit)}
            className="p-2 bg-bone/5 rounded-lg text-bone/50 hover:text-bone hover:bg-bone/10 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>

        {showCommissionEdit ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCommissionStatus(!commissionStatus)}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors',
                  commissionStatus ? 'bg-green-500' : 'bg-bone/20'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                    commissionStatus ? 'left-7' : 'left-1'
                  )}
                />
              </button>
              <span className="text-sm text-bone">
                {commissionStatus ? 'Aceptando comisiones' : 'No acepto comisiones'}
              </span>
            </div>
            <textarea
              value={commissionInfo}
              onChange={(e) => setCommissionInfo(e.target.value)}
              placeholder="Información sobre tus comisiones (precios, tiempos, etc.)"
              rows={3}
              className="w-full px-3 py-2 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone placeholder:text-bone/40 focus:outline-none focus:border-gold/30 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCommissionEdit(false)}
                className="px-4 py-2 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone/70 hover:bg-bone/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateCommissions}
                disabled={updating}
                className="px-4 py-2 bg-gold/10 border border-gold/20 rounded-lg text-sm text-gold hover:bg-gold/20 transition-colors disabled:opacity-50"
              >
                {updating ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {profile.accepts_commissions ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-green-400">Aceptando comisiones</p>
                  {profile.commission_info && (
                    <p className="text-xs text-bone/50 mt-1">{profile.commission_info}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-bone/40" />
                <p className="text-sm text-bone/50">No estás aceptando comisiones</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Pinned Miniatures */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-bone flex items-center gap-2">
            <Pin className="w-5 h-5 text-gold" />
            Miniaturas Fijadas ({pinnedIds.length}/6)
          </h2>
        </div>
        <p className="text-sm text-bone/50 mb-4">
          Las miniaturas fijadas aparecen destacadas en tu perfil de creador.
        </p>

        {pinnedIds.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {miniatures
              .filter(m => pinnedIds.includes(m.id))
              .map((mini) => (
                <div
                  key={mini.id}
                  className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gold/30"
                >
                  {mini.thumbnail_url ? (
                    <Image
                      src={mini.thumbnail_url}
                      alt={mini.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-bone/10 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-bone/30" />
                    </div>
                  )}
                  <button
                    onClick={() => handleTogglePinned(mini.id)}
                    className="absolute top-1 right-1 p-1.5 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <PinOff className="w-4 h-4 text-gold" />
                  </button>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-sm text-bone/40 italic">No tienes miniaturas fijadas</p>
        )}
      </div>

      {/* All Miniatures */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-bone flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-teal-400" />
            Todas tus Miniaturas ({miniatures.length})
          </h2>
          <Link
            href="/galeria/subir"
            className="flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-lg text-sm text-teal-400 hover:bg-teal-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Subir Nueva
          </Link>
        </div>

        {miniatures.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {miniatures.map((mini) => {
              const isPinned = pinnedIds.includes(mini.id)
              return (
                <div
                  key={mini.id}
                  className={cn(
                    'relative group aspect-square rounded-lg overflow-hidden border',
                    isPinned ? 'border-gold/30' : 'border-bone/10'
                  )}
                >
                  {mini.thumbnail_url ? (
                    <Image
                      src={mini.thumbnail_url}
                      alt={mini.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-bone/10 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-bone/30" />
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-xs text-white truncate">{mini.title}</p>
                      <div className="flex items-center gap-2 text-xs text-white/70 mt-1">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {mini.view_count}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleTogglePinned(mini.id)}
                      className={cn(
                        'p-1.5 rounded-lg transition-colors',
                        isPinned
                          ? 'bg-gold/80 text-void'
                          : 'bg-black/60 text-white hover:bg-gold/80 hover:text-void'
                      )}
                      title={isPinned ? 'Desfijar' : 'Fijar'}
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <Link
                      href={`/galeria/${mini.id}`}
                      className="p-1.5 bg-black/60 rounded-lg text-white hover:bg-bone/20 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  {isPinned && (
                    <div className="absolute top-1 left-1">
                      <Pin className="w-4 h-4 text-gold drop-shadow-lg" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-bone/5 border border-bone/10 rounded-lg">
            <ImageIcon className="w-12 h-12 text-bone/30 mx-auto mb-3" />
            <p className="text-bone/50 mb-3">Aún no has subido miniaturas</p>
            <Link
              href="/galeria/subir"
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-400 hover:bg-teal-500/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Subir tu primera miniatura
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
