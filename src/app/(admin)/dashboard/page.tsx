'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users,
  Image,
  Store,
  Palette,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  ShoppingBag,
} from 'lucide-react'
import {
  MultiLineChart,
  SimpleBarChart,
  DonutChart,
  StatCard,
  ChartCard,
  CHART_COLORS,
} from './components/charts'
import { Button } from './components/ui/button'
import { createClient } from '@/lib/supabase/client'

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

interface DashboardStats {
  totalUsers: number
  totalMiniatures: number
  activeListings: number
  totalStores: number
  pendingStores: number
  pendingCreators: number
  approvedCreators: number
}

interface RecentActivity {
  id: string
  type: 'user' | 'miniature' | 'store' | 'listing' | 'creator'
  title: string
  description: string
  timestamp: string
  status?: 'pending' | 'approved' | 'rejected'
}

// ══════════════════════════════════════════════════════════════
// MOCK DATA - Replace with real Supabase queries
// ══════════════════════════════════════════════════════════════

const mockGrowthData = [
  { name: 'Ene', usuarios: 45, miniaturas: 120, anuncios: 18 },
  { name: 'Feb', usuarios: 52, miniaturas: 145, anuncios: 24 },
  { name: 'Mar', usuarios: 61, miniaturas: 189, anuncios: 31 },
  { name: 'Abr', usuarios: 78, miniaturas: 234, anuncios: 38 },
  { name: 'May', usuarios: 95, miniaturas: 298, anuncios: 45 },
  { name: 'Jun', usuarios: 112, miniaturas: 356, anuncios: 52 },
]

const mockFactionData = [
  { name: 'Space Marines', value: 245 },
  { name: 'Chaos', value: 189 },
  { name: 'Orks', value: 156 },
  { name: 'Aeldari', value: 134 },
  { name: 'Necrons', value: 98 },
]

const mockContentStatus = [
  { name: 'Publicado', value: 856, fill: CHART_COLORS.success },
  { name: 'Pendiente', value: 45, fill: CHART_COLORS.warning },
  { name: 'Rechazado', value: 12, fill: CHART_COLORS.danger },
]

// ══════════════════════════════════════════════════════════════
// DASHBOARD PAGE
// ══════════════════════════════════════════════════════════════

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      const supabase = createClient()

      try {
        const [
          { count: usersCount },
          { count: miniaturesCount },
          { count: listingsCount },
          { count: storesCount },
          { count: pendingStoresCount },
          { count: pendingCreatorsCount },
          { count: approvedCreatorsCount },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('miniatures').select('*', { count: 'exact', head: true }),
          supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('stores').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
          supabase.from('stores').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('creator_status', 'pending'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('creator_status', 'approved'),
        ])

        setStats({
          totalUsers: usersCount || 0,
          totalMiniatures: miniaturesCount || 0,
          activeListings: listingsCount || 0,
          totalStores: storesCount || 0,
          pendingStores: pendingStoresCount || 0,
          pendingCreators: pendingCreatorsCount || 0,
          approvedCreators: approvedCreatorsCount || 0,
        })

        // Fetch recent activity
        const { data: recentUsers } = await supabase
          .from('profiles')
          .select('id, username, display_name, created_at')
          .order('created_at', { ascending: false })
          .limit(3)

        const { data: recentStores } = await supabase
          .from('stores')
          .select('id, name, status, created_at')
          .order('created_at', { ascending: false })
          .limit(3)

        const formattedActivities: RecentActivity[] = [
          ...(recentUsers || []).map((user) => ({
            id: user.id,
            type: 'user' as const,
            title: user.display_name || user.username,
            description: 'Nuevo usuario registrado',
            timestamp: user.created_at,
          })),
          ...(recentStores || []).filter(store => store.created_at).map((store) => ({
            id: store.id,
            type: 'store' as const,
            title: store.name,
            description: 'Tienda registrada',
            timestamp: store.created_at!,
            status: store.status as 'pending' | 'approved' | 'rejected',
          })),
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5)

        setActivities(formattedActivities)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-zinc-400">Cargando estadísticas...</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-zinc-900/50 border border-zinc-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const pendingTotal = (stats?.pendingStores || 0) + (stats?.pendingCreators || 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-zinc-400">Resumen general de la plataforma</p>
        </div>
        {pendingTotal > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-amber-500">{pendingTotal} pendientes</span>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Usuarios"
          value={stats?.totalUsers || 0}
          icon={<Users className="w-5 h-5" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Miniaturas"
          value={stats?.totalMiniatures || 0}
          icon={<Image className="w-5 h-5" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Anuncios Activos"
          value={stats?.activeListings || 0}
          icon={<ShoppingBag className="w-5 h-5" />}
        />
        <StatCard
          title="Creadores"
          value={stats?.approvedCreators || 0}
          description={`${stats?.pendingCreators || 0} pendientes`}
          icon={<Palette className="w-5 h-5" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Crecimiento"
          description="Usuarios, miniaturas y anuncios por mes"
          className="lg:col-span-2"
        >
          <MultiLineChart
            data={mockGrowthData}
            lines={[
              { dataKey: 'usuarios', color: CHART_COLORS.primary, name: 'Usuarios' },
              { dataKey: 'miniaturas', color: CHART_COLORS.success, name: 'Miniaturas' },
              { dataKey: 'anuncios', color: CHART_COLORS.tertiary, name: 'Anuncios' },
            ]}
            height={240}
          />
        </ChartCard>

        <ChartCard title="Estado del contenido">
          <DonutChart data={mockContentStatus} height={200} showLegend={false} />
          <div className="flex justify-center gap-4 mt-2">
            {mockContentStatus.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="text-zinc-400">{item.name}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Pending Items */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Pendientes de revisión</h3>
          </div>
          <div className="space-y-3">
            <Link
              href="/dashboard/tiendas?status=pending"
              className="flex items-center justify-between p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Store className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Tiendas</p>
                  <p className="text-xs text-zinc-500">{stats?.pendingStores || 0} pendientes</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </Link>

            <Link
              href="/dashboard/creadores?status=pending"
              className="flex items-center justify-between p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Palette className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Creadores</p>
                  <p className="text-xs text-zinc-500">{stats?.pendingCreators || 0} pendientes</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </Link>

            {pendingTotal === 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                <p className="text-sm text-zinc-400">Todo al día</p>
              </div>
            )}
          </div>
        </div>

        {/* Factions Chart */}
        <ChartCard title="Miniaturas por facción" description="Top 5 facciones">
          <SimpleBarChart data={mockFactionData} height={200} layout="horizontal" />
        </ChartCard>

        {/* Recent Activity */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Actividad reciente</h3>
            <Link href="/dashboard/reportes" className="text-xs text-zinc-500 hover:text-zinc-300">
              Ver todo
            </Link>
          </div>
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div
                  className={`p-1.5 rounded-full ${
                    activity.status === 'pending'
                      ? 'bg-amber-500/10 text-amber-500'
                      : activity.status === 'approved'
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {activity.type === 'user' && <Users className="w-3 h-3" />}
                  {activity.type === 'store' && <Store className="w-3 h-3" />}
                  {activity.type === 'miniature' && <Image className="w-3 h-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{activity.title}</p>
                  <p className="text-xs text-zinc-500">{activity.description}</p>
                </div>
                <span className="text-xs text-zinc-600 whitespace-nowrap">
                  {new Date(activity.timestamp).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Eye className="w-6 h-6 text-zinc-600 mb-2" />
                <p className="text-sm text-zinc-500">Sin actividad reciente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
