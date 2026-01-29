'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Users,
  Image as ImageIcon,
  Store,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Calendar,
  Eye,
  Heart,
  MessageSquare,
  Palette,
  Map,
  Activity,
  Database,
  HardDrive,
  Cpu,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlatformStats {
  users: {
    total: number
    thisMonth: number
    lastMonth: number
  }
  miniatures: {
    total: number
    thisMonth: number
    totalViews: number
  }
  listings: {
    active: number
    sold: number
    total: number
  }
  stores: {
    approved: number
    pending: number
  }
  creators: {
    approved: number
    pending: number
  }
  events: {
    upcoming: number
    total: number
  }
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      const now = new Date()
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

      const [
        usersTotal,
        usersThisMonth,
        usersLastMonth,
        miniaturesTotal,
        miniaturesThisMonth,
        listingsActive,
        listingsSold,
        listingsTotal,
        storesApproved,
        storesPending,
        creatorsApproved,
        creatorsPending,
        eventsUpcoming,
        eventsTotal,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', firstDayThisMonth),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', firstDayLastMonth).lt('created_at', lastDayLastMonth),
        supabase.from('miniatures').select('id', { count: 'exact', head: true }),
        supabase.from('miniatures').select('id', { count: 'exact', head: true }).gte('created_at', firstDayThisMonth),
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'sold'),
        supabase.from('listings').select('id', { count: 'exact', head: true }),
        supabase.from('stores').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('stores').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('creator_status', 'approved'),
        supabase.from('creator_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'upcoming'),
        supabase.from('events').select('id', { count: 'exact', head: true }),
      ])

      // Get total miniature views
      const { data: viewsData } = await supabase
        .from('miniatures')
        .select('view_count')

      const totalViews = viewsData?.reduce((sum, m) => sum + (m.view_count || 0), 0) || 0

      setStats({
        users: {
          total: usersTotal.count || 0,
          thisMonth: usersThisMonth.count || 0,
          lastMonth: usersLastMonth.count || 0,
        },
        miniatures: {
          total: miniaturesTotal.count || 0,
          thisMonth: miniaturesThisMonth.count || 0,
          totalViews,
        },
        listings: {
          active: listingsActive.count || 0,
          sold: listingsSold.count || 0,
          total: listingsTotal.count || 0,
        },
        stores: {
          approved: storesApproved.count || 0,
          pending: storesPending.count || 0,
        },
        creators: {
          approved: creatorsApproved.count || 0,
          pending: creatorsPending.count || 0,
        },
        events: {
          upcoming: eventsUpcoming.count || 0,
          total: eventsTotal.count || 0,
        },
      })

      setLoading(false)
    }

    fetchStats()
  }, [supabase])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-bone/10 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-bone/5 border border-bone/10 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) return null

  const userGrowth = stats.users.lastMonth > 0
    ? ((stats.users.thisMonth - stats.users.lastMonth) / stats.users.lastMonth * 100).toFixed(1)
    : '—'

  const userGrowthPositive = stats.users.thisMonth >= stats.users.lastMonth

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-bone flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-teal-400" />
          Analíticas del Sistema
        </h1>
        <p className="text-bone/50 mt-1">
          Estadísticas y métricas de la plataforma
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-void-light border border-bone/10 rounded-lg"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 bg-blue-500/10 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div className={cn('flex items-center gap-1 text-xs', userGrowthPositive ? 'text-green-500' : 'text-red-500')}>
              {userGrowthPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {userGrowth}%
            </div>
          </div>
          <p className="text-2xl font-bold text-bone mt-3">{stats.users.total.toLocaleString()}</p>
          <p className="text-sm text-bone/50">Usuarios Totales</p>
          <p className="text-xs text-bone/40 mt-1">+{stats.users.thisMonth} este mes</p>
        </motion.div>

        {/* Miniatures */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 bg-void-light border border-bone/10 rounded-lg"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 bg-teal-500/10 rounded-lg">
              <ImageIcon className="w-5 h-5 text-teal-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-bone mt-3">{stats.miniatures.total.toLocaleString()}</p>
          <p className="text-sm text-bone/50">Miniaturas</p>
          <p className="text-xs text-bone/40 mt-1">+{stats.miniatures.thisMonth} este mes</p>
        </motion.div>

        {/* Listings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 bg-void-light border border-bone/10 rounded-lg"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 bg-gold/10 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-gold" />
            </div>
          </div>
          <p className="text-2xl font-bold text-bone mt-3">{stats.listings.active.toLocaleString()}</p>
          <p className="text-sm text-bone/50">Anuncios Activos</p>
          <p className="text-xs text-bone/40 mt-1">{stats.listings.sold} vendidos • {stats.listings.total} totales</p>
        </motion.div>

        {/* Views */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 bg-void-light border border-bone/10 rounded-lg"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 bg-purple-500/10 rounded-lg">
              <Eye className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-bone mt-3">{stats.miniatures.totalViews.toLocaleString()}</p>
          <p className="text-sm text-bone/50">Visualizaciones</p>
          <p className="text-xs text-bone/40 mt-1">Total de miniaturas</p>
        </motion.div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-5 bg-void-light border border-bone/10 rounded-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-amber-500/10 rounded-lg">
              <Store className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-semibold text-bone">Tiendas</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-bone/50">Aprobadas</span>
              <span className="text-sm font-medium text-green-400">{stats.stores.approved}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-bone/50">Pendientes</span>
              <span className="text-sm font-medium text-amber-400">{stats.stores.pending}</span>
            </div>
            <div className="h-2 bg-bone/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: `${(stats.stores.approved / (stats.stores.approved + stats.stores.pending)) * 100 || 0}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Creators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-5 bg-void-light border border-bone/10 rounded-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-purple-500/10 rounded-lg">
              <Palette className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-semibold text-bone">Creadores</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-bone/50">Verificados</span>
              <span className="text-sm font-medium text-purple-400">{stats.creators.approved}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-bone/50">Solicitudes</span>
              <span className="text-sm font-medium text-amber-400">{stats.creators.pending}</span>
            </div>
            <div className="h-2 bg-bone/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500"
                style={{ width: `${(stats.creators.approved / (stats.creators.approved + stats.creators.pending)) * 100 || 0}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-5 bg-void-light border border-bone/10 rounded-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-pink-500/10 rounded-lg">
              <Calendar className="w-5 h-5 text-pink-400" />
            </div>
            <h3 className="font-semibold text-bone">Eventos</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-bone/50">Próximos</span>
              <span className="text-sm font-medium text-blue-400">{stats.events.upcoming}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-bone/50">Total</span>
              <span className="text-sm font-medium text-bone">{stats.events.total}</span>
            </div>
            <div className="h-2 bg-bone/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${(stats.events.upcoming / stats.events.total) * 100 || 0}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* System Health */}
      <div>
        <h2 className="text-lg font-semibold text-bone mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          Estado del Sistema
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-void-light border border-bone/10 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-bone/50" />
                <span className="text-sm text-bone">Base de Datos</span>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-green-500">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Operativo
              </span>
            </div>
            <p className="text-xs text-bone/50">Supabase PostgreSQL</p>
          </div>

          <div className="p-4 bg-void-light border border-bone/10 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-bone/50" />
                <span className="text-sm text-bone">Almacenamiento</span>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-green-500">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Operativo
              </span>
            </div>
            <p className="text-xs text-bone/50">Supabase Storage</p>
          </div>

          <div className="p-4 bg-void-light border border-bone/10 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-bone/50" />
                <span className="text-sm text-bone">Mapas</span>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-green-500">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Operativo
              </span>
            </div>
            <p className="text-xs text-bone/50">Mapbox GL JS</p>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="p-4 bg-bone/5 border border-bone/10 rounded-lg">
        <p className="text-sm text-bone/50 text-center">
          Datos actualizados en tiempo real desde Supabase. Para métricas detalladas de tráfico, consulta Vercel Analytics.
        </p>
      </div>
    </div>
  )
}
