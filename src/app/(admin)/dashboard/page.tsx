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
  TrendingDown,
  ArrowRight,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  ShoppingBag,
  Flag,
  Calendar,
  Sparkles,
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
  pendingReports: number
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
// COMPONENTS
// ══════════════════════════════════════════════════════════════

function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
  count,
  color,
}: {
  title: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  count?: number
  color: string
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-white/5 p-5 transition-all duration-300 hover:border-white/10 hover:shadow-lg hover:shadow-black/20"
    >
      {/* Gradient overlay on hover */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${color}`}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`p-2.5 rounded-xl bg-gradient-to-br ${color} shadow-lg`}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
          {count !== undefined && count > 0 && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium">
              <AlertCircle className="h-3 w-3" />
              {count}
            </span>
          )}
        </div>

        <h3 className="text-white font-semibold mb-1 group-hover:text-white transition-colors">
          {title}
        </h3>
        <p className="text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors">
          {description}
        </p>

        <div className="mt-4 flex items-center gap-2 text-sm text-zinc-600 group-hover:text-zinc-400 transition-colors">
          <span>Ver detalles</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}

function StatCardEnhanced({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  href,
  color,
}: {
  title: string
  value: number | string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  href?: string
  color: string
}) {
  const content = (
    <div className="stat-card relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-white/5 p-5 transition-all duration-300 hover:border-white/10"
      style={{ '--accent-color': color } as React.CSSProperties}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              {changeType === 'positive' ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : changeType === 'negative' ? (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              ) : null}
              <span
                className={`text-xs font-medium ${
                  changeType === 'positive'
                    ? 'text-emerald-500'
                    : changeType === 'negative'
                    ? 'text-red-500'
                    : 'text-zinc-500'
                }`}
              >
                {change}
              </span>
            </div>
          )}
        </div>
        <div
          className="p-3 rounded-xl"
          style={{ backgroundColor: `${color}20` }}
        >
          <div style={{ color }}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}

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
          { count: pendingReportsCount },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('miniatures').select('*', { count: 'exact', head: true }),
          supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('stores').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
          supabase.from('stores').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('creator_status', 'pending'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('creator_status', 'approved'),
          supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        ])

        setStats({
          totalUsers: usersCount || 0,
          totalMiniatures: miniaturesCount || 0,
          activeListings: listingsCount || 0,
          totalStores: storesCount || 0,
          pendingStores: pendingStoresCount || 0,
          pendingCreators: pendingCreatorsCount || 0,
          approvedCreators: approvedCreatorsCount || 0,
          pendingReports: pendingReportsCount || 0,
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
      <div className="space-y-8 animate-fade-in">
        {/* Header skeleton */}
        <div>
          <div className="h-8 w-48 bg-zinc-800/50 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-64 bg-zinc-800/30 rounded animate-pulse" />
        </div>

        {/* Stats skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-zinc-900/50 border border-zinc-800/50 rounded-xl animate-pulse"
            />
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 h-80 bg-zinc-900/50 border border-zinc-800/50 rounded-xl animate-pulse" />
          <div className="h-80 bg-zinc-900/50 border border-zinc-800/50 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  const pendingTotal = (stats?.pendingStores || 0) + (stats?.pendingCreators || 0) + (stats?.pendingReports || 0)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Bienvenido al Panel
          </h1>
          <p className="text-zinc-500 mt-1">
            Aqui tienes un resumen de la actividad de la plataforma
          </p>
        </div>
        {pendingTotal > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <div className="relative">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <span className="text-sm font-medium text-amber-500">
              {pendingTotal} elementos pendientes de revision
            </span>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardEnhanced
          title="Total Usuarios"
          value={stats?.totalUsers || 0}
          change="+12% este mes"
          changeType="positive"
          icon={Users}
          href="/dashboard/usuarios"
          color="#3B82F6"
        />
        <StatCardEnhanced
          title="Miniaturas"
          value={stats?.totalMiniatures || 0}
          change="+8% este mes"
          changeType="positive"
          icon={Image}
          color="#10B981"
        />
        <StatCardEnhanced
          title="Anuncios Activos"
          value={stats?.activeListings || 0}
          icon={ShoppingBag}
          color="#F59E0B"
        />
        <StatCardEnhanced
          title="Creadores"
          value={stats?.approvedCreators || 0}
          change={stats?.pendingCreators ? `${stats.pendingCreators} pendientes` : undefined}
          changeType="neutral"
          icon={Palette}
          href="/dashboard/creadores"
          color="#8B5CF6"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Acciones rapidas</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            title="Tiendas"
            description="Gestiona tiendas de la comunidad"
            href="/dashboard/tiendas"
            icon={Store}
            count={stats?.pendingStores}
            color="from-amber-500/20 to-amber-600/5"
          />
          <QuickActionCard
            title="Creadores"
            description="Revisa solicitudes de creadores"
            href="/dashboard/creadores"
            icon={Sparkles}
            count={stats?.pendingCreators}
            color="from-purple-500/20 to-purple-600/5"
          />
          <QuickActionCard
            title="Reportes"
            description="Modera contenido reportado"
            href="/dashboard/reportes"
            icon={Flag}
            count={stats?.pendingReports}
            color="from-red-500/20 to-red-600/5"
          />
          <QuickActionCard
            title="Eventos"
            description="Administra eventos de la comunidad"
            href="/dashboard/eventos"
            icon={Calendar}
            color="from-emerald-500/20 to-emerald-600/5"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard
          title="Crecimiento de la plataforma"
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
            height={280}
          />
        </ChartCard>

        <ChartCard title="Estado del contenido">
          <DonutChart data={mockContentStatus} height={220} showLegend={false} />
          <div className="flex justify-center gap-4 mt-4">
            {mockContentStatus.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-zinc-400">{item.name}</span>
                <span className="text-zinc-600">({item.value})</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Factions Chart */}
        <ChartCard title="Miniaturas por faccion" description="Top 5 facciones mas populares">
          <SimpleBarChart data={mockFactionData} height={220} layout="horizontal" />
        </ChartCard>

        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-white/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold">Actividad reciente</h3>
              <p className="text-sm text-zinc-500">Ultimas acciones en la plataforma</p>
            </div>
            <Link
              href="/dashboard/usuarios"
              className="text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1"
            >
              Ver todo
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`p-2 rounded-lg ${
                    activity.status === 'pending'
                      ? 'bg-amber-500/10 text-amber-500'
                      : activity.status === 'approved'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {activity.type === 'user' && <Users className="w-4 h-4" />}
                  {activity.type === 'store' && <Store className="w-4 h-4" />}
                  {activity.type === 'miniature' && <Image className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-zinc-500">{activity.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {activity.status === 'pending' && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-medium uppercase">
                      Pendiente
                    </span>
                  )}
                  <span className="text-xs text-zinc-600 whitespace-nowrap">
                    {new Date(activity.timestamp).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              </div>
            ))}

            {activities.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-zinc-800/50 mb-4">
                  <Eye className="w-8 h-8 text-zinc-600" />
                </div>
                <p className="text-zinc-400 font-medium">Sin actividad reciente</p>
                <p className="text-sm text-zinc-600 mt-1">
                  Las nuevas acciones apareceran aqui
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
