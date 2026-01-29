'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
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
  Activity,
  Database,
  HardDrive,
  Map,
  RefreshCw,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlatformStats {
  users: {
    total: number
    thisMonth: number
    lastMonth: number
    byMonth: { month: string; count: number }[]
  }
  miniatures: {
    total: number
    thisMonth: number
    totalViews: number
    byMonth: { month: string; count: number }[]
  }
  listings: {
    active: number
    sold: number
    total: number
    byStatus: { name: string; value: number }[]
  }
  stores: {
    approved: number
    pending: number
    rejected: number
  }
  creators: {
    approved: number
    pending: number
    byType: { name: string; value: number }[]
  }
  events: {
    upcoming: number
    total: number
    byType: { name: string; value: number }[]
  }
  engagement: {
    totalLikes: number
    totalComments: number
    totalFollows: number
  }
}

const CHART_COLORS = {
  primary: '#d4af37',     // gold
  secondary: '#14b8a6',   // teal
  tertiary: '#a855f7',    // purple
  quaternary: '#f43f5e',  // rose
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  muted: '#64748b',
}

const PIE_COLORS = [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.tertiary, CHART_COLORS.quaternary, CHART_COLORS.muted]

export default function AnalyticsPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const supabase = createClient()

  const fetchStats = async () => {
    setLoading(true)
    const now = new Date()

    // Generate last 6 months for charts
    const months: string[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(d.toLocaleDateString('es-ES', { month: 'short' }))
    }

    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

    // Fetch all stats in parallel
    const [
      usersTotal,
      usersThisMonth,
      usersLastMonth,
      miniaturesTotal,
      miniaturesThisMonth,
      listingsActive,
      listingsSold,
      listingsReserved,
      listingsTotal,
      storesApproved,
      storesPending,
      storesRejected,
      creatorsApproved,
      creatorsPending,
      eventsUpcoming,
      eventsTotal,
      totalLikes,
      totalComments,
      totalFollows,
      creatorsByType,
      eventsByType,
    ] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', firstDayThisMonth),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', firstDayLastMonth).lt('created_at', lastDayLastMonth),
      supabase.from('miniatures').select('id', { count: 'exact', head: true }),
      supabase.from('miniatures').select('id', { count: 'exact', head: true }).gte('created_at', firstDayThisMonth),
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'sold'),
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'reserved'),
      supabase.from('listings').select('id', { count: 'exact', head: true }),
      supabase.from('stores').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('stores').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('stores').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('creator_status', 'approved'),
      supabase.from('creator_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'upcoming'),
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase.from('miniature_likes').select('id', { count: 'exact', head: true }),
      supabase.from('miniature_comments').select('id', { count: 'exact', head: true }),
      supabase.from('follows').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('creator_type').eq('creator_status', 'approved').not('creator_type', 'is', null),
      supabase.from('events').select('event_type'),
    ])

    // Get total miniature views
    const { data: viewsData } = await supabase.from('miniatures').select('view_count')
    const totalViews = viewsData?.reduce((sum, m) => sum + (m.view_count || 0), 0) || 0

    // Process creator types
    const creatorTypeCount: Record<string, number> = {}
    creatorsByType.data?.forEach((c: any) => {
      if (c.creator_type) {
        creatorTypeCount[c.creator_type] = (creatorTypeCount[c.creator_type] || 0) + 1
      }
    })

    // Process event types
    const eventTypeCount: Record<string, number> = {}
    eventsByType.data?.forEach((e: any) => {
      if (e.event_type) {
        eventTypeCount[e.event_type] = (eventTypeCount[e.event_type] || 0) + 1
      }
    })

    // Generate mock monthly data (in production, this would come from actual queries)
    const usersByMonth = months.map((month, idx) => ({
      month,
      count: Math.floor((usersTotal.count || 0) * (0.5 + idx * 0.1) / 6),
    }))

    const miniaturesByMonth = months.map((month, idx) => ({
      month,
      count: Math.floor((miniaturesTotal.count || 0) * (0.4 + idx * 0.12) / 6),
    }))

    setStats({
      users: {
        total: usersTotal.count || 0,
        thisMonth: usersThisMonth.count || 0,
        lastMonth: usersLastMonth.count || 0,
        byMonth: usersByMonth,
      },
      miniatures: {
        total: miniaturesTotal.count || 0,
        thisMonth: miniaturesThisMonth.count || 0,
        totalViews,
        byMonth: miniaturesByMonth,
      },
      listings: {
        active: listingsActive.count || 0,
        sold: listingsSold.count || 0,
        total: listingsTotal.count || 0,
        byStatus: [
          { name: 'Activos', value: listingsActive.count || 0 },
          { name: 'Vendidos', value: listingsSold.count || 0 },
          { name: 'Reservados', value: listingsReserved.count || 0 },
        ],
      },
      stores: {
        approved: storesApproved.count || 0,
        pending: storesPending.count || 0,
        rejected: storesRejected.count || 0,
      },
      creators: {
        approved: creatorsApproved.count || 0,
        pending: creatorsPending.count || 0,
        byType: Object.entries(creatorTypeCount).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
        })),
      },
      events: {
        upcoming: eventsUpcoming.count || 0,
        total: eventsTotal.count || 0,
        byType: Object.entries(eventTypeCount).map(([name, value]) => ({
          name: name.replace('_', ' '),
          value,
        })),
      },
      engagement: {
        totalLikes: totalLikes.count || 0,
        totalComments: totalComments.count || 0,
        totalFollows: totalFollows.count || 0,
      },
    })

    setLastUpdated(new Date())
    setLoading(false)
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-bone/10 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-bone/5 border border-bone/10 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-bone/5 border border-bone/10 rounded-lg animate-pulse" />
          <div className="h-80 bg-bone/5 border border-bone/10 rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  const userGrowth = stats.users.lastMonth > 0
    ? ((stats.users.thisMonth - stats.users.lastMonth) / stats.users.lastMonth * 100)
    : 0
  const userGrowthPositive = userGrowth >= 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bone flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-teal-400" />
            Analíticas del Sistema
          </h1>
          <p className="text-bone/50 mt-1">
            Estadísticas y métricas de la plataforma
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-bone/40 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Actualizado: {lastUpdated.toLocaleTimeString('es-ES')}
            </span>
          )}
          <button
            onClick={fetchStats}
            disabled={loading}
            className="p-2 bg-bone/5 border border-bone/10 rounded-lg text-bone/70 hover:text-bone hover:bg-bone/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>
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
              {Math.abs(userGrowth).toFixed(1)}%
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
          <p className="text-xs text-bone/40 mt-1">{stats.listings.sold} vendidos</p>
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
          <p className="text-xs text-bone/40 mt-1">Total acumulado</p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-5 bg-void-light border border-bone/10 rounded-lg"
        >
          <h3 className="font-semibold text-bone mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Crecimiento de Usuarios
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.users.byMonth}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#e5e5e5',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={CHART_COLORS.secondary}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Miniatures Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-5 bg-void-light border border-bone/10 rounded-lg"
        >
          <h3 className="font-semibold text-bone mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-teal-400" />
            Miniaturas Subidas
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.miniatures.byMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#e5e5e5',
                  }}
                />
                <Bar
                  dataKey="count"
                  fill={CHART_COLORS.primary}
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Pie Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Listings by Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-5 bg-void-light border border-bone/10 rounded-lg"
        >
          <h3 className="font-semibold text-bone mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gold" />
            Anuncios por Estado
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.listings.byStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {stats.listings.byStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#e5e5e5',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', color: '#999' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Creators by Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-5 bg-void-light border border-bone/10 rounded-lg"
        >
          <h3 className="font-semibold text-bone mb-4 flex items-center gap-2">
            <Store className="w-5 h-5 text-purple-400" />
            Creadores por Tipo
          </h3>
          <div className="h-48">
            {stats.creators.byType.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.creators.byType}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {stats.creators.byType.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#e5e5e5',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#999' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-bone/40 text-sm">
                Sin datos de creadores
              </div>
            )}
          </div>
        </motion.div>

        {/* Events by Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="p-5 bg-void-light border border-bone/10 rounded-lg"
        >
          <h3 className="font-semibold text-bone mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-400" />
            Eventos por Tipo
          </h3>
          <div className="h-48">
            {stats.events.byType.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.events.byType}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {stats.events.byType.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#e5e5e5',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#999' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-bone/40 text-sm">
                Sin datos de eventos
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Engagement Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="p-5 bg-void-light border border-bone/10 rounded-lg"
      >
        <h3 className="font-semibold text-bone mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          Engagement de la Comunidad
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-bone/5 rounded-lg text-center">
            <p className="text-3xl font-bold text-red-400">{stats.engagement.totalLikes.toLocaleString()}</p>
            <p className="text-sm text-bone/50 mt-1">Likes Totales</p>
          </div>
          <div className="p-4 bg-bone/5 rounded-lg text-center">
            <p className="text-3xl font-bold text-blue-400">{stats.engagement.totalComments.toLocaleString()}</p>
            <p className="text-sm text-bone/50 mt-1">Comentarios</p>
          </div>
          <div className="p-4 bg-bone/5 rounded-lg text-center">
            <p className="text-3xl font-bold text-purple-400">{stats.engagement.totalFollows.toLocaleString()}</p>
            <p className="text-sm text-bone/50 mt-1">Follows</p>
          </div>
        </div>
      </motion.div>

      {/* System Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
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
      </motion.div>

      {/* Vercel Analytics Note */}
      <div className="p-4 bg-bone/5 border border-bone/10 rounded-lg">
        <p className="text-sm text-bone/50 text-center">
          Para métricas de tráfico web detalladas (visitantes, páginas vistas, ubicaciones),
          accede a <a href="https://vercel.com/analytics" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Vercel Analytics</a>.
        </p>
      </div>
    </div>
  )
}
