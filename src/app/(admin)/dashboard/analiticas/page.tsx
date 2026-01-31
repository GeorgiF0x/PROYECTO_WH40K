'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Eye,
  Clock,
  MousePointer,
  Globe,
  Smartphone,
  Monitor,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Calendar,
  Activity,
  Zap,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Map,
  Layers,
} from 'lucide-react'
import {
  SimpleAreaChart,
  MultiLineChart,
  SimpleBarChart,
  DonutChart,
  Sparkline,
  RadialProgress,
  StackedBarChart,
  ComparisonBar,
  CHART_COLORS,
  CHART_PALETTE,
} from '../components/charts'
import { createClient } from '@/lib/supabase/client'

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

interface AnalyticsData {
  totalUsers: number
  newUsersThisMonth: number
  totalMiniatures: number
  totalListings: number
  totalStores: number
  totalViews: number
}

// ══════════════════════════════════════════════════════════════
// MOCK DATA - In production, fetch from Vercel Analytics API
// ══════════════════════════════════════════════════════════════

const trafficData = [
  { name: '00:00', visitors: 45, pageviews: 120 },
  { name: '04:00', visitors: 23, pageviews: 65 },
  { name: '08:00', visitors: 89, pageviews: 234 },
  { name: '12:00', visitors: 156, pageviews: 423 },
  { name: '16:00', visitors: 198, pageviews: 512 },
  { name: '20:00', visitors: 167, pageviews: 398 },
  { name: '23:59', visitors: 78, pageviews: 187 },
]

const weeklyData = [
  { name: 'Lun', usuarios: 234, sesiones: 456, rebote: 32 },
  { name: 'Mar', usuarios: 267, sesiones: 523, rebote: 28 },
  { name: 'Mie', usuarios: 312, sesiones: 598, rebote: 25 },
  { name: 'Jue', usuarios: 289, sesiones: 567, rebote: 30 },
  { name: 'Vie', usuarios: 345, sesiones: 689, rebote: 27 },
  { name: 'Sab', usuarios: 198, sesiones: 378, rebote: 35 },
  { name: 'Dom', usuarios: 167, sesiones: 312, rebote: 38 },
]

const monthlyGrowthData = [
  { name: 'Ene', usuarios: 1200, miniaturas: 3400, anuncios: 450 },
  { name: 'Feb', usuarios: 1450, miniaturas: 4200, anuncios: 520 },
  { name: 'Mar', usuarios: 1800, miniaturas: 5100, anuncios: 610 },
  { name: 'Abr', usuarios: 2100, miniaturas: 6200, anuncios: 720 },
  { name: 'May', usuarios: 2500, miniaturas: 7400, anuncios: 850 },
  { name: 'Jun', usuarios: 2900, miniaturas: 8800, anuncios: 980 },
]

const deviceData = [
  { name: 'Desktop', value: 58, fill: CHART_COLORS.primary },
  { name: 'Mobile', value: 35, fill: CHART_COLORS.success },
  { name: 'Tablet', value: 7, fill: CHART_COLORS.tertiary },
]

const browserData = [
  { name: 'Chrome', value: 64, fill: '#4285F4' },
  { name: 'Safari', value: 19, fill: '#000000' },
  { name: 'Firefox', value: 10, fill: '#FF7139' },
  { name: 'Edge', value: 5, fill: '#0078D7' },
  { name: 'Otros', value: 2, fill: CHART_COLORS.muted },
]

const topPagesData = [
  { name: '/galeria', value: 12453 },
  { name: '/mercado', value: 8765 },
  { name: '/comunidad', value: 6234 },
  { name: '/facciones', value: 4521 },
  { name: '/usuarios', value: 3210 },
]

const countryData = [
  { name: 'Espana', value: 4521, percentage: 45 },
  { name: 'Mexico', value: 1856, percentage: 19 },
  { name: 'Argentina', value: 1234, percentage: 12 },
  { name: 'Colombia', value: 987, percentage: 10 },
  { name: 'Chile', value: 654, percentage: 7 },
  { name: 'Otros', value: 723, percentage: 7 },
]

const contentTypeData = [
  { name: 'Ene', miniaturas: 450, anuncios: 120, tiendas: 15 },
  { name: 'Feb', miniaturas: 520, anuncios: 145, tiendas: 18 },
  { name: 'Mar', miniaturas: 610, anuncios: 168, tiendas: 22 },
  { name: 'Abr', miniaturas: 580, anuncios: 156, tiendas: 20 },
  { name: 'May', miniaturas: 720, anuncios: 198, tiendas: 28 },
  { name: 'Jun', miniaturas: 850, anuncios: 234, tiendas: 35 },
]

const realtimeSparkline = [45, 52, 48, 61, 55, 67, 72, 68, 75, 82, 78, 85, 91, 88, 95]

// ══════════════════════════════════════════════════════════════
// BENTO CARD COMPONENT
// ══════════════════════════════════════════════════════════════

interface BentoCardProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

function BentoCard({ children, className = '', title, subtitle, icon, action }: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900/90 to-zinc-900/50 border border-white/5 p-5 ${className}`}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

      {(title || icon) && (
        <div className="relative flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 rounded-xl bg-white/5">
                {icon}
              </div>
            )}
            <div>
              {title && <h3 className="text-sm font-semibold text-white">{title}</h3>}
              {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
      )}
      <div className="relative">{children}</div>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════════
// METRIC CARD COMPONENT
// ══════════════════════════════════════════════════════════════

interface MetricCardProps {
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  sparklineData?: number[]
  color?: string
}

function MetricCard({ label, value, change, changeLabel, icon, sparklineData, color = CHART_COLORS.primary }: MetricCardProps) {
  const isPositive = change && change > 0

  return (
    <BentoCard>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-zinc-400">{icon}</div>
            <span className="text-xs text-zinc-500 uppercase tracking-wider">{label}</span>
          </div>
          <p className="text-3xl font-bold text-white tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1.5 mt-2">
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-red-500" />
              )}
              <span className={`text-xs font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                {isPositive ? '+' : ''}{change}%
              </span>
              {changeLabel && <span className="text-xs text-zinc-600">{changeLabel}</span>}
            </div>
          )}
        </div>
        {sparklineData && (
          <div className="w-24 h-12">
            <Sparkline data={sparklineData} color={color} height={48} />
          </div>
        )}
      </div>
    </BentoCard>
  )
}

// ══════════════════════════════════════════════════════════════
// ANALYTICS PAGE
// ══════════════════════════════════════════════════════════════

export default function AnaliticasPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d')

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      try {
        // Get last month date
        const lastMonth = new Date()
        lastMonth.setMonth(lastMonth.getMonth() - 1)

        const [
          { count: usersCount },
          { count: newUsersCount },
          { count: miniaturesCount },
          { count: listingsCount },
          { count: storesCount },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', lastMonth.toISOString()),
          supabase.from('miniatures').select('*', { count: 'exact', head: true }),
          supabase.from('listings').select('*', { count: 'exact', head: true }),
          supabase.from('stores').select('*', { count: 'exact', head: true }),
        ])

        setData({
          totalUsers: usersCount || 0,
          newUsersThisMonth: newUsersCount || 0,
          totalMiniatures: miniaturesCount || 0,
          totalListings: listingsCount || 0,
          totalStores: storesCount || 0,
          totalViews: 45678, // Mock - would come from Vercel Analytics
        })
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 bg-zinc-800/50 rounded-lg animate-pulse" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-zinc-900/50 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 h-80 bg-zinc-900/50 rounded-2xl animate-pulse" />
          <div className="h-80 bg-zinc-900/50 rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analiticas</h1>
          <p className="text-zinc-500 mt-1">Metricas y rendimiento de la plataforma</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-lg border border-white/5">
          {(['24h', '7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                timeRange === range
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time indicator */}
      <div className="flex items-center gap-2 text-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-zinc-400">
          <span className="text-emerald-500 font-medium">127</span> usuarios activos ahora
        </span>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* BENTO GRID */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Metric Cards Row */}
        <MetricCard
          label="Visitantes"
          value={data?.totalViews || 0}
          change={12.5}
          changeLabel="vs semana anterior"
          icon={<Users className="w-4 h-4" />}
          sparklineData={realtimeSparkline}
          color={CHART_COLORS.primary}
        />
        <MetricCard
          label="Paginas vistas"
          value="128.4K"
          change={8.2}
          changeLabel="vs semana anterior"
          icon={<Eye className="w-4 h-4" />}
          sparklineData={[65, 72, 68, 75, 82, 78, 85, 91, 88, 95, 102, 98, 105, 112, 108]}
          color={CHART_COLORS.success}
        />
        <MetricCard
          label="Tiempo medio"
          value="4m 32s"
          change={-3.1}
          changeLabel="vs semana anterior"
          icon={<Clock className="w-4 h-4" />}
          sparklineData={[45, 42, 48, 44, 41, 45, 43, 40, 42, 38, 41, 39, 42, 40, 38]}
          color={CHART_COLORS.warning}
        />
        <MetricCard
          label="Tasa rebote"
          value="32.4%"
          change={-5.8}
          changeLabel="vs semana anterior"
          icon={<MousePointer className="w-4 h-4" />}
          sparklineData={[38, 36, 34, 35, 33, 34, 32, 33, 31, 32, 30, 31, 29, 30, 28]}
          color={CHART_COLORS.tertiary}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Traffic Overview - Large */}
        <BentoCard
          className="lg:col-span-2"
          title="Trafico en tiempo real"
          subtitle="Visitantes y paginas vistas por hora"
          icon={<Activity className="w-4 h-4 text-blue-500" />}
          action={
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-zinc-400">Visitantes</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-zinc-400">Paginas</span>
              </span>
            </div>
          }
        >
          <MultiLineChart
            data={trafficData}
            lines={[
              { dataKey: 'visitors', color: CHART_COLORS.primary, name: 'Visitantes' },
              { dataKey: 'pageviews', color: CHART_COLORS.success, name: 'Paginas vistas' },
            ]}
            height={280}
            showLegend={false}
          />
        </BentoCard>

        {/* Devices - Custom visualization */}
        <BentoCard
          title="Dispositivos"
          subtitle="Distribucion por tipo"
          icon={<Smartphone className="w-4 h-4 text-purple-500" />}
        >
          <div className="space-y-4 mt-2">
            {deviceData.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {item.name === 'Desktop' && <Monitor className="w-4 h-4 text-zinc-400" />}
                    {item.name === 'Mobile' && <Smartphone className="w-4 h-4 text-zinc-400" />}
                    {item.name === 'Tablet' && <Smartphone className="w-4 h-4 text-zinc-400 rotate-90" />}
                    <span className="text-zinc-300">{item.name}</span>
                  </div>
                  <span className="text-white font-semibold">{item.value}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.fill }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Total de sesiones</span>
              <span className="text-white font-medium">24,856</span>
            </div>
          </div>
        </BentoCard>
      </div>

      {/* Second Row - Mixed Content */}
      <div className="grid gap-4 lg:grid-cols-4">
        {/* Growth Metrics */}
        <BentoCard
          className="lg:col-span-2"
          title="Crecimiento mensual"
          subtitle="Usuarios, miniaturas y anuncios"
          icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
        >
          <SimpleAreaChart
            data={monthlyGrowthData}
            dataKey="usuarios"
            color={CHART_COLORS.primary}
            height={200}
          />
        </BentoCard>

        {/* Performance Score */}
        <BentoCard
          title="Core Web Vitals"
          subtitle="Rendimiento del sitio"
          icon={<Zap className="w-4 h-4 text-amber-500" />}
        >
          <div className="flex flex-col items-center justify-center py-4">
            <RadialProgress value={92} color={CHART_COLORS.success} size={140} label="Score" />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-500">1.2s</p>
              <p className="text-[10px] text-zinc-500 uppercase">LCP</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-500">45ms</p>
              <p className="text-[10px] text-zinc-500 uppercase">FID</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-500">0.12</p>
              <p className="text-[10px] text-zinc-500 uppercase">CLS</p>
            </div>
          </div>
        </BentoCard>

        {/* Browsers */}
        <BentoCard
          title="Navegadores"
          subtitle="Distribucion de uso"
          icon={<Globe className="w-4 h-4 text-blue-500" />}
        >
          <div className="space-y-3 mt-2">
            {browserData.slice(0, 4).map((browser) => (
              <ComparisonBar
                key={browser.name}
                label={browser.name}
                value={browser.value}
                maxValue={100}
                color={browser.fill}
                showPercentage={false}
              />
            ))}
          </div>
        </BentoCard>
      </div>

      {/* Third Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Top Pages */}
        <BentoCard
          title="Paginas mas visitadas"
          subtitle="Top 5 rutas"
          icon={<Layers className="w-4 h-4 text-cyan-500" />}
        >
          <div className="space-y-3 mt-2">
            {topPagesData.map((page, index) => (
              <div key={page.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/5 text-xs font-medium text-zinc-400">
                    {index + 1}
                  </span>
                  <span className="text-sm text-zinc-300 font-mono">{page.name}</span>
                </div>
                <span className="text-sm text-white font-medium">{page.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </BentoCard>

        {/* Geographic Distribution */}
        <BentoCard
          title="Distribucion geografica"
          subtitle="Visitantes por pais"
          icon={<Map className="w-4 h-4 text-rose-500" />}
        >
          <div className="space-y-3 mt-2">
            {countryData.slice(0, 5).map((country) => (
              <div key={country.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-300">{country.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full"
                      style={{ width: `${country.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500 w-8 text-right">{country.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </BentoCard>

        {/* Content Creation */}
        <BentoCard
          title="Contenido creado"
          subtitle="Por tipo y mes"
          icon={<BarChart3 className="w-4 h-4 text-violet-500" />}
        >
          <StackedBarChart
            data={contentTypeData}
            bars={[
              { dataKey: 'miniaturas', color: CHART_COLORS.primary, name: 'Miniaturas' },
              { dataKey: 'anuncios', color: CHART_COLORS.success, name: 'Anuncios' },
              { dataKey: 'tiendas', color: CHART_COLORS.tertiary, name: 'Tiendas' },
            ]}
            height={180}
          />
        </BentoCard>
      </div>

      {/* Weekly Overview */}
      <div className="grid gap-4 lg:grid-cols-2">
        <BentoCard
          title="Resumen semanal"
          subtitle="Usuarios y sesiones por dia"
          icon={<Calendar className="w-4 h-4 text-indigo-500" />}
        >
          <MultiLineChart
            data={weeklyData}
            lines={[
              { dataKey: 'usuarios', color: CHART_COLORS.primary, name: 'Usuarios' },
              { dataKey: 'sesiones', color: CHART_COLORS.success, name: 'Sesiones' },
            ]}
            height={220}
          />
        </BentoCard>

        {/* Engagement Metrics */}
        <BentoCard
          title="Metricas de engagement"
          subtitle="Interaccion de usuarios"
          icon={<Target className="w-4 h-4 text-orange-500" />}
        >
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Paginas/Sesion</p>
              <p className="text-2xl font-bold text-white">4.2</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-xs text-emerald-500">+8.3%</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Duracion media</p>
              <p className="text-2xl font-bold text-white">3:45</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-xs text-emerald-500">+12.1%</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Usuarios nuevos</p>
              <p className="text-2xl font-bold text-white">67%</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-xs text-emerald-500">+5.2%</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Recurrentes</p>
              <p className="text-2xl font-bold text-white">33%</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown className="w-3 h-3 text-red-500" />
                <span className="text-xs text-red-500">-2.1%</span>
              </div>
            </div>
          </div>
        </BentoCard>
      </div>

      {/* Vercel Analytics Note */}
      <div className="rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Zap className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-white">Powered by Vercel Analytics</h4>
            <p className="text-xs text-zinc-400 mt-1">
              Las metricas de trafico y rendimiento se obtienen de Vercel Analytics.
              Para datos en tiempo real, visita el{' '}
              <a
                href="https://vercel.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
              >
                dashboard de Vercel
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
