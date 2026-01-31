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
import {
  MultiLineChart,
  SimpleBarChart,
  DonutChart,
  ChartCard,
  CHART_COLORS,
} from './components/charts'
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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
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
        className="group relative overflow-hidden rounded-xl bg-void-light/50 backdrop-blur-sm border border-imperial-gold/10 p-5 block transition-all duration-300 hover:border-imperial-gold/30"
      >
        {/* Corner brackets */}
        <span className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-imperial-gold/20 group-hover:border-imperial-gold/50 transition-colors" />
        <span className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-imperial-gold/20 group-hover:border-imperial-gold/50 transition-colors" />
        <span className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-imperial-gold/20 group-hover:border-imperial-gold/50 transition-colors" />
        <span className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-imperial-gold/20 group-hover:border-imperial-gold/50 transition-colors" />

        {/* Glow line */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />

        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <motion.div
              className="p-2.5 rounded-lg"
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
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-blood-red/20 text-blood-red border border-blood-red/30 text-xs font-mono"
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

          <h3 className="text-bone font-semibold mb-1 group-hover:text-imperial-gold transition-colors">
            {title}
          </h3>
          <p className="text-sm text-bone/40 group-hover:text-bone/60 transition-colors">
            {description}
          </p>

          <div className="mt-4 flex items-center gap-2 text-sm text-bone/30 group-hover:text-imperial-gold/70 transition-colors">
            <Target className="h-3 w-3" />
            <span className="font-mono text-xs tracking-wider">ACCEDER</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
      className="stat-card relative overflow-hidden rounded-xl bg-void-light/50 backdrop-blur-sm border border-imperial-gold/15 p-5"
      style={{ '--accent-color': color } as React.CSSProperties}
      whileHover={{
        scale: 1.02,
        borderColor: 'rgba(201, 162, 39, 0.4)',
        boxShadow: `0 0 30px ${color}20`,
      }}
    >
      {/* Glow line */}
      <div className="glow-line" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="h-3 w-3 text-imperial-gold/40" />
            <p className="text-[10px] font-mono text-imperial-gold/50 tracking-widest uppercase">{title}</p>
          </div>
          <motion.p
            className="text-3xl font-display font-bold text-bone tracking-tight"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </motion.p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              {changeType === 'positive' ? (
                <TrendingUp className="h-3.5 w-3.5 text-necron-teal" />
              ) : changeType === 'negative' ? (
                <TrendingDown className="h-3.5 w-3.5 text-blood-red" />
              ) : null}
              <span
                className={`text-xs font-mono ${
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
          className="p-3 rounded-lg relative"
          style={{
            background: `linear-gradient(135deg, ${color}30, ${color}10)`,
            border: `1px solid ${color}40`,
          }}
          animate={{
            boxShadow: [
              `0 0 10px ${color}20`,
              `0 0 20px ${color}40`,
              `0 0 10px ${color}20`,
            ],
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
      <div className="space-y-8">
        {/* Header skeleton */}
        <div>
          <div className="h-8 w-48 bg-imperial-gold/10 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-64 bg-imperial-gold/5 rounded animate-pulse" />
        </div>

        {/* Stats skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="h-32 bg-void-light/50 border border-imperial-gold/10 rounded-xl"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid gap-4 lg:grid-cols-3">
          <motion.div
            className="lg:col-span-2 h-80 bg-void-light/50 border border-imperial-gold/10 rounded-xl"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="h-80 bg-void-light/50 border border-imperial-gold/10 rounded-xl"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        </div>
      </div>
    )
  }

  const pendingTotal = (stats?.pendingStores || 0) + (stats?.pendingCreators || 0) + (stats?.pendingReports || 0)

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header - Strategium Display */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        variants={itemVariants}
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Crosshair className="h-4 w-4 text-imperial-gold/60" />
            <span className="text-[10px] font-mono text-imperial-gold/60 tracking-[0.3em]">
              STRATEGIUM IMPERIAL // CENTRO DE COMANDO
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-bone tracking-wide">
            Panel de Control
          </h1>
          <p className="text-bone/40 mt-1 font-mono text-sm">
            Estado operacional de la plataforma
          </p>
        </div>
        {pendingTotal > 0 && (
          <motion.div
            className="flex items-center gap-3 px-4 py-2 bg-blood-red/10 border border-blood-red/30 rounded-lg"
            animate={{
              borderColor: ['rgba(139, 0, 0, 0.3)', 'rgba(139, 0, 0, 0.6)', 'rgba(139, 0, 0, 0.3)'],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="relative">
              <Radio className="w-4 h-4 text-blood-red" />
              <motion.span
                className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-blood-red"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>
            <span className="text-sm font-mono text-blood-red">
              {pendingTotal} ALERTAS PENDIENTES
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* KPI Cards - Data Slates */}
      <motion.div variants={containerVariants}>
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="h-4 w-4 text-necron-teal/60" />
          <span className="text-[10px] font-mono text-necron-teal/60 tracking-widest">
            LECTURAS DE AUSPEX
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DataSlateCard
            title="Efectivos"
            value={stats?.totalUsers || 0}
            change="+12% ciclo actual"
            changeType="positive"
            icon={Users}
            href="/dashboard/usuarios"
            color="#0D9B8A"
            index={0}
          />
          <DataSlateCard
            title="Reliquias"
            value={stats?.totalMiniatures || 0}
            change="+8% ciclo actual"
            changeType="positive"
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
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-4 w-4 text-imperial-gold/60" />
          <span className="text-[10px] font-mono text-imperial-gold/60 tracking-widest">
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
            className="bg-void-light/50 backdrop-blur-sm border-imperial-gold/15 hover:border-imperial-gold/30 transition-colors"
          >
            <MultiLineChart
              data={mockGrowthData}
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
            className="bg-void-light/50 backdrop-blur-sm border-imperial-gold/15 hover:border-imperial-gold/30 transition-colors"
          >
            <DonutChart data={mockContentStatus} height={220} showLegend={false} />
            <div className="flex justify-center gap-4 mt-4">
              {mockContentStatus.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <motion.span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.fill }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}
                  />
                  <span className="text-bone/60 font-mono">{item.name}</span>
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
            className="bg-void-light/50 backdrop-blur-sm border-imperial-gold/15 hover:border-imperial-gold/30 transition-colors"
          >
            <SimpleBarChart data={mockFactionData} height={220} layout="horizontal" />
          </ChartCard>
        </motion.div>

        {/* Recent Activity - Transmission Log */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 rounded-xl bg-void-light/50 backdrop-blur-sm border border-imperial-gold/15 p-6 hover:border-imperial-gold/30 transition-colors"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Radio className="h-3 w-3 text-necron-teal/60" />
                <span className="text-[10px] font-mono text-necron-teal/60 tracking-widest">
                  REGISTRO VOX
                </span>
              </div>
              <h3 className="text-bone font-semibold">Transmisiones Recientes</h3>
            </div>
            <Link
              href="/dashboard/usuarios"
              className="text-sm text-imperial-gold hover:text-imperial-gold/80 flex items-center gap-1 font-mono"
            >
              <span className="text-xs tracking-wider">VER TODO</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-void/50 border border-transparent hover:border-imperial-gold/20 transition-all"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ x: 4 }}
              >
                <motion.div
                  className={`p-2 rounded-lg ${
                    activity.status === 'pending'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : activity.status === 'approved'
                      ? 'bg-necron-teal/10 text-necron-teal border border-necron-teal/30'
                      : 'bg-void-light text-bone/40 border border-bone/10'
                  }`}
                  animate={activity.status === 'pending' ? {
                    boxShadow: ['0 0 5px rgba(245, 158, 11, 0.2)', '0 0 15px rgba(245, 158, 11, 0.4)', '0 0 5px rgba(245, 158, 11, 0.2)'],
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {activity.type === 'user' && <Users className="w-4 h-4" />}
                  {activity.type === 'store' && <Store className="w-4 h-4" />}
                  {activity.type === 'miniature' && <Image className="w-4 h-4" />}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-bone truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-bone/40 font-mono">{activity.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {activity.status === 'pending' && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-mono uppercase border border-amber-500/20">
                      En Espera
                    </span>
                  )}
                  <span className="text-xs text-bone/30 font-mono whitespace-nowrap">
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
                  className="p-4 rounded-full bg-void border border-imperial-gold/20 mb-4"
                  animate={{
                    boxShadow: ['0 0 10px rgba(201, 162, 39, 0.1)', '0 0 20px rgba(201, 162, 39, 0.2)', '0 0 10px rgba(201, 162, 39, 0.1)'],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Eye className="w-8 h-8 text-imperial-gold/40" />
                </motion.div>
                <p className="text-bone/60 font-medium">Canal silencioso</p>
                <p className="text-sm text-bone/30 mt-1 font-mono">
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
