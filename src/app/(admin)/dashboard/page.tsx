'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users,
  Image,
  Store,
  Palette,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowUpRight,
  AlertCircle,
  Eye,
  ShoppingBag,
  Flag,
  Calendar,
  Sparkles,
  Cpu,
  Target,
  Crosshair,
  Radio,
} from 'lucide-react'
// Lightweight wrappers stay sync — they're a few <div>s of JSX.
import { ChartCard, CHART_COLORS } from './components/charts'
// Recharts-backed components are split off into a separate chunk so the
// dashboard shell paints before ~31 KB of charting code is fetched.
import { MultiLineChart, SimpleBarChart, DonutChart } from './components/charts/lazy'
import { TacticalFrame, RadarPulse, StrategiumHeader } from './components/ImperialEffects'
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
  // Growth percentages (current month vs previous)
  usersGrowth: string | null
  miniaturesGrowth: string | null
}

interface GrowthDataPoint {
  [key: string]: string | number
  name: string
  usuarios: number
  miniaturas: number
  anuncios: number
}

interface FactionDataPoint {
  name: string
  value: number
}

interface ContentStatusPoint {
  name: string
  value: number
  fill: string
}

interface RecentActivity {
  id: string
  type: 'user' | 'miniature' | 'store' | 'listing' | 'creator'
  title: string
  description: string
  timestamp: string
  status?: 'pending' | 'approved' | 'rejected'
}

// Shape returned by the get_dashboard_stats() Postgres RPC.
interface DashboardStatsPayload {
  counts: {
    total_users: number
    total_miniatures: number
    active_listings: number
    total_stores: number
    pending_stores: number
    rejected_stores: number
    pending_creators: number
    approved_creators: number
    pending_reports: number
  }
  growth: Array<{
    bucket: string // YYYY-MM
    usuarios: number
    miniaturas: number
    anuncios: number
  }>
  factions: Array<{ name: string; value: number }>
  recent_users: Array<{
    id: string
    username: string
    display_name: string | null
    created_at: string
  }>
  recent_stores: Array<{
    id: string
    name: string
    status: string
    created_at: string
  }>
}

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════

const MONTH_NAMES = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
]

function calcGrowthPct(current: number, previous: number): string | null {
  if (previous === 0) return current > 0 ? '+100%' : null
  const pct = Math.round(((current - previous) / previous) * 100)
  if (pct === 0) return null
  return `${pct > 0 ? '+' : ''}${pct}% vs mes anterior`
}

// ══════════════════════════════════════════════════════════════
// COMPONENTS
// ══════════════════════════════════════════════════════════════

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 100 },
  },
}

function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
  count,
  color,
  accentColor,
}: {
  title: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  count?: number
  color: string
  accentColor: string
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{
        scale: 1.02,
        boxShadow: `0 0 30px ${accentColor}30`,
      }}
      transition={{ duration: 0.3 }}
    >
      <Link
        href={href}
        className="group relative block overflow-hidden rounded-xl border border-imperial-gold/10 bg-void-light/50 p-5 backdrop-blur-sm transition-all duration-300 hover:border-imperial-gold/30"
      >
        {/* Corner brackets */}
        <span className="absolute left-2 top-2 h-3 w-3 border-l-2 border-t-2 border-imperial-gold/20 transition-colors group-hover:border-imperial-gold/50" />
        <span className="absolute right-2 top-2 h-3 w-3 border-r-2 border-t-2 border-imperial-gold/20 transition-colors group-hover:border-imperial-gold/50" />
        <span className="absolute bottom-2 left-2 h-3 w-3 border-b-2 border-l-2 border-imperial-gold/20 transition-colors group-hover:border-imperial-gold/50" />
        <span className="absolute bottom-2 right-2 h-3 w-3 border-b-2 border-r-2 border-imperial-gold/20 transition-colors group-hover:border-imperial-gold/50" />

        {/* Glow line */}
        <motion.div
          className="absolute left-0 right-0 top-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />

        <div className="relative">
          <div className="mb-4 flex items-start justify-between">
            <motion.div
              className="rounded-lg p-2.5"
              style={{
                background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}10)`,
                border: `1px solid ${accentColor}40`,
              }}
              whileHover={{
                boxShadow: `0 0 15px ${accentColor}50`,
              }}
            >
              <div style={{ color: accentColor }}>
                <Icon className="h-5 w-5" />
              </div>
            </motion.div>
            {count !== undefined && count > 0 && (
              <motion.span
                className="bg-blood-red/20 text-blood-red border-blood-red/30 flex items-center gap-1 rounded-full border px-2 py-1 font-mono text-xs"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AlertCircle className="h-3 w-3" />
                {count}
              </motion.span>
            )}
          </div>

          <h3 className="mb-1 font-semibold text-bone transition-colors group-hover:text-imperial-gold">
            {title}
          </h3>
          <p className="text-sm text-bone/40 transition-colors group-hover:text-bone/60">
            {description}
          </p>

          <div className="mt-4 flex items-center gap-2 text-sm text-bone/30 transition-colors group-hover:text-imperial-gold/70">
            <Target className="h-3 w-3" />
            <span className="font-mono text-xs tracking-wider">ACCEDER</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function DataSlateCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  href,
  color,
  index = 0,
}: {
  title: string
  value: number | string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  href?: string
  color: string
  index?: number
}) {
  const content = (
    <motion.div
      variants={itemVariants}
      className="stat-card relative overflow-hidden rounded-xl border border-imperial-gold/15 bg-void-light/50 p-5 backdrop-blur-sm"
      style={{ '--accent-color': color } as React.CSSProperties}
      whileHover={{
        scale: 1.02,
        borderColor: 'rgba(201, 162, 39, 0.4)',
        boxShadow: `0 0 30px ${color}20`,
      }}
    >
      {/* Glow line */}
      <div
        className="glow-line"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />

      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Cpu className="h-3 w-3 text-imperial-gold/40" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-imperial-gold/50">
              {title}
            </p>
          </div>
          <motion.p
            className="font-display text-3xl font-bold tracking-tight text-bone"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </motion.p>
          {change && (
            <div className="mt-2 flex items-center gap-1">
              {changeType === 'positive' ? (
                <TrendingUp className="h-3.5 w-3.5 text-necron-teal" />
              ) : changeType === 'negative' ? (
                <TrendingDown className="text-blood-red h-3.5 w-3.5" />
              ) : null}
              <span
                className={`font-mono text-xs ${
                  changeType === 'positive'
                    ? 'text-necron-teal'
                    : changeType === 'negative'
                      ? 'text-blood-red'
                      : 'text-bone/40'
                }`}
              >
                {change}
              </span>
            </div>
          )}
        </div>
        <motion.div
          className="relative rounded-lg p-3"
          style={{
            background: `linear-gradient(135deg, ${color}30, ${color}10)`,
            border: `1px solid ${color}40`,
          }}
          animate={{
            boxShadow: [`0 0 10px ${color}20`, `0 0 20px ${color}40`, `0 0 10px ${color}20`],
          }}
          transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
        >
          <div style={{ color }}>
            <Icon className="h-6 w-6" />
          </div>
        </motion.div>
      </div>
    </motion.div>
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
  const [growthData, setGrowthData] = useState<GrowthDataPoint[]>([])
  const [factionData, setFactionData] = useState<FactionDataPoint[]>([])
  const [contentStatus, setContentStatus] = useState<ContentStatusPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      const supabase = createClient()

      try {
        // Single round-trip — get_dashboard_stats() runs all counts, growth
        // series, top factions and recent activity inside Postgres via CTEs.
        // The RPC name is cast because database.types.ts is regenerated after
        // the migration is deployed.
        const { data, error } = await supabase.rpc('get_dashboard_stats' as never)

        if (error || !data) {
          console.error('Error fetching dashboard data:', error)
          return
        }

        const payload = data as unknown as DashboardStatsPayload
        const counts = payload.counts
        const growthRows = payload.growth ?? []

        // ── Growth chart data ──
        const growth: GrowthDataPoint[] = growthRows.map((row) => ({
          name: MONTH_NAMES[parseInt(row.bucket.split('-')[1]) - 1],
          usuarios: row.usuarios,
          miniaturas: row.miniaturas,
          anuncios: row.anuncios,
        }))
        setGrowthData(growth)

        // ── Growth percentages (current vs previous month) ──
        const current = growthRows[growthRows.length - 1]
        const previous = growthRows[growthRows.length - 2]
        const usersGrowth = previous ? calcGrowthPct(current.usuarios, previous.usuarios) : null
        const miniaturesGrowth = previous
          ? calcGrowthPct(current.miniaturas, previous.miniaturas)
          : null

        setStats({
          totalUsers: counts.total_users,
          totalMiniatures: counts.total_miniatures,
          activeListings: counts.active_listings,
          totalStores: counts.total_stores,
          pendingStores: counts.pending_stores,
          pendingCreators: counts.pending_creators,
          approvedCreators: counts.approved_creators,
          pendingReports: counts.pending_reports,
          usersGrowth,
          miniaturesGrowth,
        })

        // ── Faction distribution ──
        setFactionData(payload.factions ?? [])

        // ── Content status donut ──
        setContentStatus([
          { name: 'Activo', value: counts.active_listings, fill: CHART_COLORS.success },
          {
            name: 'Pendiente',
            value: counts.pending_stores + counts.pending_reports,
            fill: CHART_COLORS.warning,
          },
          { name: 'Rechazado', value: counts.rejected_stores, fill: CHART_COLORS.danger },
        ])

        // ── Recent activity ──
        const recentUsers = payload.recent_users ?? []
        const recentStores = payload.recent_stores ?? []
        const formattedActivities: RecentActivity[] = [
          ...recentUsers.map((user) => ({
            id: user.id,
            type: 'user' as const,
            title: user.display_name || user.username,
            description: 'Nuevo usuario registrado',
            timestamp: user.created_at,
          })),
          ...recentStores.map((store) => ({
            id: store.id,
            type: 'store' as const,
            title: store.name,
            description: 'Tienda registrada',
            timestamp: store.created_at,
            status: store.status as 'pending' | 'approved' | 'rejected',
          })),
        ]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5)

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
      <div className="space-y-8">
        {/* Header skeleton */}
        <div>
          <div className="mb-2 h-8 w-48 animate-pulse rounded-lg bg-imperial-gold/10" />
          <div className="h-4 w-64 animate-pulse rounded bg-imperial-gold/5" />
        </div>

        {/* Stats skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="h-32 rounded-xl border border-imperial-gold/10 bg-void-light/50"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid gap-4 lg:grid-cols-3">
          <motion.div
            className="h-80 rounded-xl border border-imperial-gold/10 bg-void-light/50 lg:col-span-2"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="h-80 rounded-xl border border-imperial-gold/10 bg-void-light/50"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        </div>
      </div>
    )
  }

  const pendingTotal =
    (stats?.pendingStores || 0) + (stats?.pendingCreators || 0) + (stats?.pendingReports || 0)

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header - Strategium Display */}
      <motion.div
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        variants={itemVariants}
      >
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-imperial-gold/60" />
            <span className="font-mono text-[10px] tracking-[0.3em] text-imperial-gold/60">
              STRATEGIUM IMPERIAL // CENTRO DE COMANDO
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-wide text-bone">
            Panel de Control
          </h1>
          <p className="mt-1 font-mono text-sm text-bone/40">Estado operacional de la plataforma</p>
        </div>
        {pendingTotal > 0 && (
          <motion.div
            className="bg-blood-red/10 border-blood-red/30 flex items-center gap-3 rounded-lg border px-4 py-2"
            animate={{
              borderColor: ['rgba(139, 0, 0, 0.3)', 'rgba(139, 0, 0, 0.6)', 'rgba(139, 0, 0, 0.3)'],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="relative">
              <Radio className="text-blood-red h-4 w-4" />
              <motion.span
                className="bg-blood-red absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>
            <span className="text-blood-red font-mono text-sm">
              {pendingTotal} ALERTAS PENDIENTES
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* KPI Cards - Data Slates */}
      <motion.div variants={containerVariants}>
        <div className="mb-4 flex items-center gap-2">
          <Cpu className="h-4 w-4 text-necron-teal/60" />
          <span className="font-mono text-[10px] tracking-widest text-necron-teal/60">
            LECTURAS DE AUSPEX
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DataSlateCard
            title="Efectivos"
            value={stats?.totalUsers || 0}
            change={stats?.usersGrowth || undefined}
            changeType={
              stats?.usersGrowth?.startsWith('+')
                ? 'positive'
                : stats?.usersGrowth
                  ? 'negative'
                  : undefined
            }
            icon={Users}
            href="/dashboard/usuarios"
            color="#0D9B8A"
            index={0}
          />
          <DataSlateCard
            title="Reliquias"
            value={stats?.totalMiniatures || 0}
            change={stats?.miniaturesGrowth || undefined}
            changeType={
              stats?.miniaturesGrowth?.startsWith('+')
                ? 'positive'
                : stats?.miniaturesGrowth
                  ? 'negative'
                  : undefined
            }
            icon={Image}
            color="#C9A227"
            index={1}
          />
          <DataSlateCard
            title="Transmisiones"
            value={stats?.activeListings || 0}
            icon={ShoppingBag}
            color="#F59E0B"
            index={2}
          />
          <DataSlateCard
            title="Artesanos"
            value={stats?.approvedCreators || 0}
            change={stats?.pendingCreators ? `${stats.pendingCreators} en espera` : undefined}
            changeType="neutral"
            icon={Palette}
            href="/dashboard/creadores"
            color="#8B5CF6"
            index={3}
          />
        </div>
      </motion.div>

      {/* Quick Actions - Tactical Options */}
      <motion.div variants={containerVariants}>
        <div className="mb-4 flex items-center gap-2">
          <Target className="h-4 w-4 text-imperial-gold/60" />
          <span className="font-mono text-[10px] tracking-widest text-imperial-gold/60">
            OPCIONES TACTICAS
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            title="Tiendas"
            description="Gestiona enclaves comerciales"
            href="/dashboard/tiendas"
            icon={Store}
            count={stats?.pendingStores}
            color="from-amber-500/20 to-amber-600/5"
            accentColor="#F59E0B"
          />
          <QuickActionCard
            title="Creadores"
            description="Evalua solicitudes de artesanos"
            href="/dashboard/creadores"
            icon={Sparkles}
            count={stats?.pendingCreators}
            color="from-purple-500/20 to-purple-600/5"
            accentColor="#8B5CF6"
          />
          <QuickActionCard
            title="Reportes"
            description="Modera contenido sospechoso"
            href="/dashboard/reportes"
            icon={Flag}
            count={stats?.pendingReports}
            color="from-red-500/20 to-red-600/5"
            accentColor="#8B0000"
          />
          <QuickActionCard
            title="Eventos"
            description="Coordina eventos de la legion"
            href="/dashboard/eventos"
            icon={Calendar}
            color="from-emerald-500/20 to-emerald-600/5"
            accentColor="#10B981"
          />
        </div>
      </motion.div>

      {/* Charts Row - Cogitator Readings */}
      <motion.div variants={containerVariants} className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <ChartCard
            title="Crecimiento de la Legion"
            description="Tendencias por ciclo temporal"
            className="border-imperial-gold/15 bg-void-light/50 backdrop-blur-sm transition-colors hover:border-imperial-gold/30"
          >
            <MultiLineChart
              data={growthData}
              lines={[
                { dataKey: 'usuarios', color: '#0D9B8A', name: 'Efectivos' },
                { dataKey: 'miniaturas', color: '#C9A227', name: 'Reliquias' },
                { dataKey: 'anuncios', color: '#6B1C5F', name: 'Transmisiones' },
              ]}
              height={280}
            />
          </ChartCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ChartCard
            title="Estado Operacional"
            className="border-imperial-gold/15 bg-void-light/50 backdrop-blur-sm transition-colors hover:border-imperial-gold/30"
          >
            <DonutChart data={contentStatus} height={220} showLegend={false} />
            <div className="mt-4 flex justify-center gap-4">
              {contentStatus.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <motion.span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.fill }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}
                  />
                  <span className="font-mono text-bone/60">{item.name}</span>
                  <span className="text-bone/30">({item.value})</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </motion.div>
      </motion.div>

      {/* Bottom Row */}
      <motion.div variants={containerVariants} className="grid gap-6 lg:grid-cols-3">
        {/* Factions Chart */}
        <motion.div variants={itemVariants}>
          <ChartCard
            title="Lealtades Declaradas"
            description="Distribucion por faccion"
            className="border-imperial-gold/15 bg-void-light/50 backdrop-blur-sm transition-colors hover:border-imperial-gold/30"
          >
            <SimpleBarChart
              data={factionData.length > 0 ? factionData : [{ name: 'Sin datos', value: 0 }]}
              height={220}
              layout="horizontal"
            />
          </ChartCard>
        </motion.div>

        {/* Recent Activity - Transmission Log */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl border border-imperial-gold/15 bg-void-light/50 p-6 backdrop-blur-sm transition-colors hover:border-imperial-gold/30 lg:col-span-2"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Radio className="h-3 w-3 text-necron-teal/60" />
                <span className="font-mono text-[10px] tracking-widest text-necron-teal/60">
                  REGISTRO VOX
                </span>
              </div>
              <h3 className="font-semibold text-bone">Transmisiones Recientes</h3>
            </div>
            <Link
              href="/dashboard/usuarios"
              className="flex items-center gap-1 font-mono text-sm text-imperial-gold hover:text-imperial-gold/80"
            >
              <span className="text-xs tracking-wider">VER TODO</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                className="flex items-center gap-4 rounded-lg border border-transparent bg-void/50 p-3 transition-all hover:border-imperial-gold/20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ x: 4 }}
              >
                <motion.div
                  className={`rounded-lg p-2 ${
                    activity.status === 'pending'
                      ? 'border border-amber-500/30 bg-amber-500/10 text-amber-400'
                      : activity.status === 'approved'
                        ? 'border border-necron-teal/30 bg-necron-teal/10 text-necron-teal'
                        : 'border border-bone/10 bg-void-light text-bone/40'
                  }`}
                  animate={
                    activity.status === 'pending'
                      ? {
                          boxShadow: [
                            '0 0 5px rgba(245, 158, 11, 0.2)',
                            '0 0 15px rgba(245, 158, 11, 0.4)',
                            '0 0 5px rgba(245, 158, 11, 0.2)',
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {activity.type === 'user' && <Users className="h-4 w-4" />}
                  {activity.type === 'store' && <Store className="h-4 w-4" />}
                  {activity.type === 'miniature' && <Image className="h-4 w-4" />}
                </motion.div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-bone">{activity.title}</p>
                  <p className="font-mono text-xs text-bone/40">{activity.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {activity.status === 'pending' && (
                    <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] uppercase text-amber-400">
                      En Espera
                    </span>
                  )}
                  <span className="whitespace-nowrap font-mono text-xs text-bone/30">
                    {new Date(activity.timestamp).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              </motion.div>
            ))}

            {activities.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <motion.div
                  className="mb-4 rounded-full border border-imperial-gold/20 bg-void p-4"
                  animate={{
                    boxShadow: [
                      '0 0 10px rgba(201, 162, 39, 0.1)',
                      '0 0 20px rgba(201, 162, 39, 0.2)',
                      '0 0 10px rgba(201, 162, 39, 0.1)',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Eye className="h-8 w-8 text-imperial-gold/40" />
                </motion.div>
                <p className="font-medium text-bone/60">Canal silencioso</p>
                <p className="mt-1 font-mono text-sm text-bone/30">
                  Las transmisiones apareceran aqui
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
