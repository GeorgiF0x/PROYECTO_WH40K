'use client'

import * as React from 'react'
import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Image,
  ShoppingBag,
  Heart,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Activity,
  Zap,
  Target,
  BarChart3,
  Layers,
  Crosshair,
  Shield,
  Palette,
  Store,
} from 'lucide-react'
import {
  MultiLineChart,
  SimpleBarChart,
  StackedBarChart,
  ComparisonBar,
  Sparkline,
  CHART_COLORS,
  CHART_PALETTE,
} from '../components/charts'
import { WebVitalsMonitor } from '../components/WebVitalsMonitor'
import { createClient } from '@/lib/supabase/client'

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']

type TimeRange = '7d' | '30d' | '90d'

function getDateRange(range: TimeRange) {
  const now = new Date()
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const previous = new Date(since.getTime() - days * 24 * 60 * 60 * 1000)
  return {
    sinceISO: since.toISOString(),
    previousISO: previous.toISOString(),
    nowISO: now.toISOString(),
    days,
    label: range === '7d' ? 'vs 7d anteriores' : range === '30d' ? 'vs 30d anteriores' : 'vs 90d anteriores',
  }
}

function calcGrowthPct(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null
  const pct = Math.round(((current - previous) / previous) * 100)
  return pct === 0 ? null : pct
}

function groupByDay(dates: string[], numDays: number): number[] {
  const now = new Date()
  const buckets: number[] = new Array(numDays).fill(0)
  for (const iso of dates) {
    const d = new Date(iso)
    const diffMs = now.getTime() - d.getTime()
    const dayIndex = numDays - 1 - Math.floor(diffMs / (24 * 60 * 60 * 1000))
    if (dayIndex >= 0 && dayIndex < numDays) buckets[dayIndex]++
  }
  return buckets
}

function bucketKey(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function countByField(data: Array<Record<string, unknown>>, field: string): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const item of data) {
    const val = String(item[field] ?? 'unknown')
    counts[val] = (counts[val] || 0) + 1
  }
  return counts
}

// Label translations
const LISTING_CATEGORY_LABELS: Record<string, string> = {
  miniatures: 'Miniaturas',
  novels: 'Novelas',
  codex: 'Codex',
  paints: 'Pinturas',
  tools: 'Herramientas',
  terrain: 'Escenografia',
  accessories: 'Accesorios',
  other: 'Otros',
}

const CREATOR_TYPE_LABELS: Record<string, string> = {
  painter: 'Pintor',
  youtuber: 'YouTuber',
  artist: 'Artista',
  blogger: 'Blogger',
  instructor: 'Instructor',
}

const STORE_STATUS_LABELS: Record<string, string> = {
  approved: 'Aprobada',
  pending: 'Pendiente',
  rejected: 'Rechazada',
  closed: 'Cerrada',
}

const REPORT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  reviewed: 'Revisado',
  resolved: 'Resuelto',
  dismissed: 'Descartado',
}

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
      className={`relative overflow-hidden rounded-xl bg-void-light/50 backdrop-blur-sm border border-imperial-gold/15 p-5 hover:border-imperial-gold/30 transition-colors ${className}`}
    >
      {/* Corner brackets */}
      <span className="absolute top-2 left-2 w-2 h-2 border-l border-t border-imperial-gold/30" />
      <span className="absolute top-2 right-2 w-2 h-2 border-r border-t border-imperial-gold/30" />
      <span className="absolute bottom-2 left-2 w-2 h-2 border-l border-b border-imperial-gold/30" />
      <span className="absolute bottom-2 right-2 w-2 h-2 border-r border-b border-imperial-gold/30" />

      {(title || icon) && (
        <div className="relative flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <motion.div
                className="p-2 rounded-lg bg-imperial-gold/10 border border-imperial-gold/20"
                animate={{
                  boxShadow: ['0 0 5px rgba(201, 162, 39, 0.2)', '0 0 15px rgba(201, 162, 39, 0.3)', '0 0 5px rgba(201, 162, 39, 0.2)'],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {icon}
              </motion.div>
            )}
            <div>
              {title && <h3 className="text-sm font-semibold text-bone">{title}</h3>}
              {subtitle && <p className="text-xs text-bone/40 font-mono">{subtitle}</p>}
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
  change?: number | null
  changeLabel?: string
  icon: React.ReactNode
  sparklineData?: number[]
  color?: string
}

function MetricCard({ label, value, change, changeLabel, icon, sparklineData, color = CHART_COLORS.primary }: MetricCardProps) {
  const isPositive = change != null && change > 0

  return (
    <BentoCard>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-imperial-gold/60">{icon}</div>
            <span className="text-[10px] text-imperial-gold/50 uppercase tracking-widest font-mono">{label}</span>
          </div>
          <motion.p
            className="text-3xl font-display font-bold text-bone tracking-tight"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </motion.p>
          {change != null && (
            <div className="flex items-center gap-1.5 mt-2">
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5 text-necron-teal" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-blood-red" />
              )}
              <span className={`text-xs font-mono ${isPositive ? 'text-necron-teal' : 'text-blood-red'}`}>
                {isPositive ? '+' : ''}{change}%
              </span>
              {changeLabel && <span className="text-xs text-bone/30 font-mono">{changeLabel}</span>}
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

interface AnalyticsState {
  // KPI totals
  totalUsers: number
  totalMiniatures: number
  totalListings: number
  totalInteractions: number
  // Growth percentages
  usersGrowth: number | null
  miniaturesGrowth: number | null
  listingsGrowth: number | null
  interactionsGrowth: number | null
  // Sparklines (14 days)
  usersSparkline: number[]
  miniaturesSparkline: number[]
  listingsSparkline: number[]
  interactionsSparkline: number[]
  // Monthly growth chart (6 months)
  monthlyGrowth: Array<{ name: string; usuarios: number; miniaturas: number; anuncios: number }>
  // Community breakdown
  communityBreakdown: Array<{ label: string; value: number; max: number; color: string }>
  // Content created (stacked bar, 6 months)
  contentCreated: Array<Record<string, string | number>>
  // Category distribution
  categoryDistribution: Array<{ name: string; value: number; fill?: string }>
  // Creator types
  creatorTypes: Array<{ name: string; value: number; fill?: string }>
  // Weekly activity (7 days)
  weeklyActivity: Array<Record<string, string | number>>
  // Platform metrics
  avgLikesPerMini: number
  avgCommentsPerMini: number
  totalFollows: number
  creatorConversionRate: number
  // Factions (top 5)
  factionData: Array<{ name: string; value: number }>
  // Operational status
  storeStatusData: Array<{ label: string; value: number; max: number; color: string }>
  reportStatusData: Array<{ label: string; value: number; max: number; color: string }>
}

export default function AnaliticasPage() {
  const [data, setData] = useState<AnalyticsState | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')

  const fetchData = useCallback(async (range: TimeRange) => {
    setLoading(true)
    const supabase = createClient()
    const { sinceISO, previousISO } = getDateRange(range)

    try {
      const now = new Date()
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

      // ── Batch 1: Total KPI counts ──
      const [
        { count: usersCount },
        { count: miniaturesCount },
        { count: listingsCount },
        { count: storesApproved },
        { count: followsCount },
        { count: likesCount },
        { count: commentsCount },
        { count: eventsCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('miniatures').select('*', { count: 'exact', head: true }),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('stores').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('follows').select('*', { count: 'exact', head: true }),
        supabase.from('miniature_likes').select('*', { count: 'exact', head: true }),
        supabase.from('miniature_comments').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
      ])

      // ── Batch 2: Period growth counts (current vs previous) ──
      const [
        { count: usersCurrent },
        { count: usersPrevious },
        { count: minisCurrent },
        { count: minisPrevious },
        { count: listingsCurrent },
        { count: listingsPrevious },
        { count: likesCurrent },
        { count: likesPrevious },
        { count: commentsCurrent },
        { count: commentsPrevious },
        { count: followsCurrent },
        { count: followsPrevious },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', sinceISO),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', previousISO).lt('created_at', sinceISO),
        supabase.from('miniatures').select('*', { count: 'exact', head: true }).gte('created_at', sinceISO),
        supabase.from('miniatures').select('*', { count: 'exact', head: true }).gte('created_at', previousISO).lt('created_at', sinceISO),
        supabase.from('listings').select('*', { count: 'exact', head: true }).gte('created_at', sinceISO),
        supabase.from('listings').select('*', { count: 'exact', head: true }).gte('created_at', previousISO).lt('created_at', sinceISO),
        supabase.from('miniature_likes').select('*', { count: 'exact', head: true }).gte('created_at', sinceISO),
        supabase.from('miniature_likes').select('*', { count: 'exact', head: true }).gte('created_at', previousISO).lt('created_at', sinceISO),
        supabase.from('miniature_comments').select('*', { count: 'exact', head: true }).gte('created_at', sinceISO),
        supabase.from('miniature_comments').select('*', { count: 'exact', head: true }).gte('created_at', previousISO).lt('created_at', sinceISO),
        supabase.from('follows').select('*', { count: 'exact', head: true }).gte('created_at', sinceISO),
        supabase.from('follows').select('*', { count: 'exact', head: true }).gte('created_at', previousISO).lt('created_at', sinceISO),
      ])

      const interactionsCurrent = (likesCurrent || 0) + (commentsCurrent || 0) + (followsCurrent || 0)
      const interactionsPrevious = (likesPrevious || 0) + (commentsPrevious || 0) + (followsPrevious || 0)

      // ── Batch 3: Dates for charts (6 months) ──
      const [
        { data: userDates },
        { data: miniatureDates },
        { data: listingDates },
        { data: likeDates },
        { data: commentDates },
        { data: followDates },
        { data: storeDates },
      ] = await Promise.all([
        supabase.from('profiles').select('created_at').gte('created_at', sixMonthsAgo.toISOString()),
        supabase.from('miniatures').select('created_at').gte('created_at', sixMonthsAgo.toISOString()),
        supabase.from('listings').select('created_at').gte('created_at', sixMonthsAgo.toISOString()),
        supabase.from('miniature_likes').select('created_at').gte('created_at', sevenDaysAgo),
        supabase.from('miniature_comments').select('created_at').gte('created_at', sevenDaysAgo),
        supabase.from('follows').select('created_at').gte('created_at', sevenDaysAgo),
        supabase.from('stores').select('created_at').gte('created_at', sixMonthsAgo.toISOString()),
      ])

      // Sparklines (14 days)
      const [
        { data: sparkUsers },
        { data: sparkMinis },
        { data: sparkListings },
        { data: sparkLikes },
        { data: sparkComments },
        { data: sparkFollows },
      ] = await Promise.all([
        supabase.from('profiles').select('created_at').gte('created_at', fourteenDaysAgo),
        supabase.from('miniatures').select('created_at').gte('created_at', fourteenDaysAgo),
        supabase.from('listings').select('created_at').gte('created_at', fourteenDaysAgo),
        supabase.from('miniature_likes').select('created_at').gte('created_at', fourteenDaysAgo),
        supabase.from('miniature_comments').select('created_at').gte('created_at', fourteenDaysAgo),
        supabase.from('follows').select('created_at').gte('created_at', fourteenDaysAgo),
      ])

      const usersSparkline = groupByDay((sparkUsers || []).map(r => r.created_at), 14)
      const miniaturesSparkline = groupByDay((sparkMinis || []).map(r => r.created_at), 14)
      const listingsSparkline = groupByDay((sparkListings || []).map(r => r.created_at), 14)
      // Interactions sparkline: sum of likes+comments+follows per day
      const likesDaily = groupByDay((sparkLikes || []).map(r => r.created_at), 14)
      const commentsDaily = groupByDay((sparkComments || []).map(r => r.created_at), 14)
      const followsDaily = groupByDay((sparkFollows || []).map(r => r.created_at), 14)
      const interactionsSparkline = likesDaily.map((v, i) => v + commentsDaily[i] + followsDaily[i])

      // ── Monthly growth (6 months) ──
      const monthBuckets: Record<string, { usuarios: number; miniaturas: number; anuncios: number }> = {}
      for (let i = 0; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        monthBuckets[key] = { usuarios: 0, miniaturas: 0, anuncios: 0 }
      }

      for (const row of userDates || []) {
        const k = bucketKey(row.created_at)
        if (monthBuckets[k]) monthBuckets[k].usuarios++
      }
      for (const row of miniatureDates || []) {
        const k = bucketKey(row.created_at)
        if (monthBuckets[k]) monthBuckets[k].miniaturas++
      }
      for (const row of listingDates || []) {
        const k = bucketKey(row.created_at)
        if (monthBuckets[k]) monthBuckets[k].anuncios++
      }

      const sortedMonths = Object.keys(monthBuckets).sort()
      const monthlyGrowth = sortedMonths.map((key) => ({
        name: MONTH_NAMES[parseInt(key.split('-')[1]) - 1],
        ...monthBuckets[key],
      }))

      // ── Content created (stacked bar: miniatures, listings, stores by month) ──
      const contentBuckets: Record<string, { miniaturas: number; anuncios: number; tiendas: number }> = {}
      for (const key of sortedMonths) {
        contentBuckets[key] = { miniaturas: 0, anuncios: 0, tiendas: 0 }
      }
      for (const row of miniatureDates || []) {
        const k = bucketKey(row.created_at)
        if (contentBuckets[k]) contentBuckets[k].miniaturas++
      }
      for (const row of listingDates || []) {
        const k = bucketKey(row.created_at)
        if (contentBuckets[k]) contentBuckets[k].anuncios++
      }
      for (const row of storeDates || []) {
        if (!row.created_at) continue
        const k = bucketKey(row.created_at)
        if (contentBuckets[k]) contentBuckets[k].tiendas++
      }
      const contentCreated = sortedMonths.map((key) => ({
        name: MONTH_NAMES[parseInt(key.split('-')[1]) - 1],
        ...contentBuckets[key],
      }))

      // ── Weekly activity (likes, comments, follows by day, last 7 days) ──
      const weeklyActivity: Array<Record<string, string | number>> = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const dayLabel = DAY_NAMES[d.getDay()]
        weeklyActivity.push({ name: dayLabel, likes: 0, comentarios: 0, follows: 0 })
      }
      const assignToDay = (dates: Array<{ created_at: string }>, field: string) => {
        for (const row of dates) {
          const d = new Date(row.created_at)
          const diffDays = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000))
          const idx = 6 - diffDays
          if (idx >= 0 && idx < 7) {
            ;(weeklyActivity[idx] as Record<string, string | number>)[field] =
              ((weeklyActivity[idx] as Record<string, string | number>)[field] as number) + 1
          }
        }
      }
      assignToDay(likeDates || [], 'likes')
      assignToDay(commentDates || [], 'comentarios')
      assignToDay(followDates || [], 'follows')

      // ── Batch 4: Categorical breakdowns ──
      const [
        { data: listingCategories },
        { data: creatorProfiles },
        { data: allStores },
        { data: allReports },
        { data: miniatureFactions },
      ] = await Promise.all([
        supabase.from('listings').select('category'),
        supabase.from('profiles').select('creator_type').neq('creator_status', 'none'),
        supabase.from('stores').select('status'),
        supabase.from('reports').select('status'),
        supabase.from('miniatures').select('faction_id, tags!miniatures_faction_id_fkey(name)').not('faction_id', 'is', null),
      ])

      // Category distribution
      const catCounts = countByField((listingCategories || []) as Array<Record<string, unknown>>, 'category')
      const categoryDistribution = Object.entries(catCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([key, value], i) => ({
          name: LISTING_CATEGORY_LABELS[key] || key,
          value,
          fill: CHART_PALETTE[i % CHART_PALETTE.length],
        }))

      // Creator types
      const creatorCounts = countByField(
        ((creatorProfiles || []).filter(p => p.creator_type)) as Array<Record<string, unknown>>,
        'creator_type',
      )
      const creatorTypes = Object.entries(creatorCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([key, value], i) => ({
          name: CREATOR_TYPE_LABELS[key] || key,
          value,
          fill: CHART_PALETTE[i % CHART_PALETTE.length],
        }))

      // Store status
      const storeCounts = countByField((allStores || []) as Array<Record<string, unknown>>, 'status')
      const maxStore = Math.max(...Object.values(storeCounts), 1)
      const storeStatusData = Object.entries(storeCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([key, value], i) => ({
          label: STORE_STATUS_LABELS[key] || key,
          value,
          max: maxStore,
          color: CHART_PALETTE[i % CHART_PALETTE.length],
        }))

      // Report status
      const reportCounts = countByField((allReports || []) as Array<Record<string, unknown>>, 'status')
      const maxReport = Math.max(...Object.values(reportCounts), 1)
      const reportStatusData = Object.entries(reportCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([key, value], i) => ({
          label: REPORT_STATUS_LABELS[key] || key,
          value,
          max: maxReport,
          color: CHART_PALETTE[i % CHART_PALETTE.length],
        }))

      // Faction distribution (top 5)
      const factionCounts: Record<string, { name: string; count: number }> = {}
      for (const row of miniatureFactions || []) {
        const fid = row.faction_id as string
        const tag = row.tags as unknown as { name: string } | null
        if (fid && tag?.name) {
          if (!factionCounts[fid]) factionCounts[fid] = { name: tag.name, count: 0 }
          factionCounts[fid].count++
        }
      }
      const factionData = Object.values(factionCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((f) => ({ name: f.name, value: f.count }))

      // ── Batch 5: Engagement averages ──
      const [
        { data: miniEngagement },
        { count: creatorApplicants },
        { count: creatorsApproved },
      ] = await Promise.all([
        supabase.from('miniatures').select('likes_count, comments_count'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('creator_status', 'none'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('creator_status', 'approved'),
      ])

      const totalMinis = (miniEngagement || []).length
      const sumLikes = (miniEngagement || []).reduce((s, m) => s + (m.likes_count || 0), 0)
      const sumComments = (miniEngagement || []).reduce((s, m) => s + (m.comments_count || 0), 0)
      const avgLikesPerMini = totalMinis > 0 ? Math.round((sumLikes / totalMinis) * 10) / 10 : 0
      const avgCommentsPerMini = totalMinis > 0 ? Math.round((sumComments / totalMinis) * 10) / 10 : 0
      const creatorConversionRate = (creatorApplicants || 0) > 0
        ? Math.round(((creatorsApproved || 0) / (creatorApplicants || 1)) * 100)
        : 0

      // Community breakdown
      const communityBreakdown = [
        { label: 'Usuarios', value: usersCount || 0, max: Math.max(usersCount || 0, 1), color: CHART_COLORS.success },
        { label: 'Creadores', value: creatorsApproved || 0, max: Math.max(usersCount || 0, 1), color: '#8B5CF6' },
        { label: 'Tiendas', value: storesApproved || 0, max: Math.max(usersCount || 0, 1), color: CHART_COLORS.warning },
        { label: 'Eventos', value: eventsCount || 0, max: Math.max(usersCount || 0, 1), color: CHART_COLORS.primary },
      ]

      setData({
        totalUsers: usersCount || 0,
        totalMiniatures: miniaturesCount || 0,
        totalListings: listingsCount || 0,
        totalInteractions: (likesCount || 0) + (commentsCount || 0) + (followsCount || 0),
        usersGrowth: calcGrowthPct(usersCurrent || 0, usersPrevious || 0),
        miniaturesGrowth: calcGrowthPct(minisCurrent || 0, minisPrevious || 0),
        listingsGrowth: calcGrowthPct(listingsCurrent || 0, listingsPrevious || 0),
        interactionsGrowth: calcGrowthPct(interactionsCurrent, interactionsPrevious),
        usersSparkline,
        miniaturesSparkline,
        listingsSparkline,
        interactionsSparkline,
        monthlyGrowth,
        communityBreakdown,
        contentCreated,
        categoryDistribution,
        creatorTypes,
        weeklyActivity,
        avgLikesPerMini,
        avgCommentsPerMini,
        totalFollows: followsCount || 0,
        creatorConversionRate,
        factionData,
        storeStatusData,
        reportStatusData,
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(timeRange)
  }, [timeRange, fetchData])

  const rangeInfo = getDateRange(timeRange)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-imperial-gold/10 rounded-lg animate-pulse" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="h-32 bg-void-light/50 border border-imperial-gold/10 rounded-xl"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
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

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* HEADER */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Crosshair className="h-4 w-4 text-necron-teal/60" />
            <span className="text-[10px] font-mono text-necron-teal/60 tracking-[0.3em]">
              MODULO AUSPEX // TELEMETRIA
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-bone tracking-wide">Analiticas</h1>
          <p className="text-bone/40 mt-1 font-mono text-sm">Metricas y rendimiento de la plataforma</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 p-1 bg-void rounded-lg border border-imperial-gold/20">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <motion.button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
                timeRange === range
                  ? 'bg-imperial-gold/20 text-imperial-gold border border-imperial-gold/30'
                  : 'text-bone/40 hover:text-bone/70'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {range}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ROW 1: KPI METRIC CARDS */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Usuarios"
          value={data?.totalUsers || 0}
          change={data?.usersGrowth}
          changeLabel={rangeInfo.label}
          icon={<Users className="w-4 h-4" />}
          sparklineData={data?.usersSparkline}
          color={CHART_COLORS.success}
        />
        <MetricCard
          label="Miniaturas"
          value={data?.totalMiniatures || 0}
          change={data?.miniaturesGrowth}
          changeLabel={rangeInfo.label}
          icon={<Image className="w-4 h-4" />}
          sparklineData={data?.miniaturesSparkline}
          color={CHART_COLORS.primary}
        />
        <MetricCard
          label="Anuncios activos"
          value={data?.totalListings || 0}
          change={data?.listingsGrowth}
          changeLabel={rangeInfo.label}
          icon={<ShoppingBag className="w-4 h-4" />}
          sparklineData={data?.listingsSparkline}
          color={CHART_COLORS.warning}
        />
        <MetricCard
          label="Interacciones"
          value={data?.totalInteractions || 0}
          change={data?.interactionsGrowth}
          changeLabel={rangeInfo.label}
          icon={<Heart className="w-4 h-4" />}
          sparklineData={data?.interactionsSparkline}
          color={CHART_COLORS.tertiary}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ROW 2: MONTHLY GROWTH + COMMUNITY */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="grid gap-4 lg:grid-cols-3">
        <BentoCard
          className="lg:col-span-2"
          title="Crecimiento mensual"
          subtitle="Usuarios, miniaturas y anuncios (6 meses)"
          icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
          action={
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0D9B8A]" />
                <span className="text-zinc-400">Usuarios</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#C9A227]" />
                <span className="text-zinc-400">Miniaturas</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#6B1C5F]" />
                <span className="text-zinc-400">Anuncios</span>
              </span>
            </div>
          }
        >
          <MultiLineChart
            data={data?.monthlyGrowth || []}
            lines={[
              { dataKey: 'usuarios', color: '#0D9B8A', name: 'Usuarios' },
              { dataKey: 'miniaturas', color: '#C9A227', name: 'Miniaturas' },
              { dataKey: 'anuncios', color: '#6B1C5F', name: 'Anuncios' },
            ]}
            height={280}
            showLegend={false}
          />
        </BentoCard>

        {/* Community Breakdown */}
        <BentoCard
          title="Comunidad"
          subtitle="Desglose de la plataforma"
          icon={<Users className="w-4 h-4 text-necron-teal" />}
        >
          <div className="space-y-4 mt-2">
            {(data?.communityBreakdown || []).map((item, index) => (
              <motion.div
                key={item.label}
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-bone/70 font-mono">{item.label}</span>
                  <span className="text-bone font-mono font-bold">{item.value.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-void rounded-full overflow-hidden border border-imperial-gold/10">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}50` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 + index * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </BentoCard>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ROW 3: CONTENT + CATEGORIES + CREATORS */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="grid gap-4 lg:grid-cols-4">
        <BentoCard
          className="lg:col-span-2"
          title="Contenido creado"
          subtitle="Por tipo y mes (6 meses)"
          icon={<BarChart3 className="w-4 h-4 text-violet-500" />}
        >
          <StackedBarChart
            data={data?.contentCreated || []}
            bars={[
              { dataKey: 'miniaturas', color: CHART_COLORS.primary, name: 'Miniaturas' },
              { dataKey: 'anuncios', color: CHART_COLORS.success, name: 'Anuncios' },
              { dataKey: 'tiendas', color: CHART_COLORS.tertiary, name: 'Tiendas' },
            ]}
            height={220}
          />
        </BentoCard>

        <BentoCard
          title="Categorias del mercado"
          subtitle="Distribucion de anuncios"
          icon={<Layers className="w-4 h-4 text-cyan-500" />}
        >
          <div className="space-y-3 mt-2">
            {(data?.categoryDistribution || []).map((cat) => (
              <ComparisonBar
                key={cat.name}
                label={cat.name}
                value={cat.value}
                maxValue={Math.max(...(data?.categoryDistribution || []).map(c => c.value), 1)}
                color={cat.fill}
              />
            ))}
            {(data?.categoryDistribution || []).length === 0 && (
              <p className="text-xs text-bone/30 font-mono text-center py-4">Sin datos</p>
            )}
          </div>
        </BentoCard>

        <BentoCard
          title="Tipos de creadores"
          subtitle="Creadores aprobados"
          icon={<Palette className="w-4 h-4 text-purple-500" />}
        >
          <div className="space-y-3 mt-2">
            {(data?.creatorTypes || []).map((ct) => (
              <ComparisonBar
                key={ct.name}
                label={ct.name}
                value={ct.value}
                maxValue={Math.max(...(data?.creatorTypes || []).map(c => c.value), 1)}
                color={ct.fill}
              />
            ))}
            {(data?.creatorTypes || []).length === 0 && (
              <p className="text-xs text-bone/30 font-mono text-center py-4">Sin datos</p>
            )}
          </div>
        </BentoCard>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ROW 4: WEEKLY ACTIVITY + PLATFORM METRICS */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="grid gap-4 lg:grid-cols-2">
        <BentoCard
          title="Actividad semanal"
          subtitle="Likes, comentarios y follows (7 dias)"
          icon={<Activity className="w-4 h-4 text-indigo-500" />}
        >
          <StackedBarChart
            data={data?.weeklyActivity || []}
            bars={[
              { dataKey: 'likes', color: CHART_COLORS.danger, name: 'Likes' },
              { dataKey: 'comentarios', color: CHART_COLORS.primary, name: 'Comentarios' },
              { dataKey: 'follows', color: CHART_COLORS.success, name: 'Follows' },
            ]}
            height={220}
          />
        </BentoCard>

        <BentoCard
          title="Metricas de la plataforma"
          subtitle="Engagement y conversion"
          icon={<Target className="w-4 h-4 text-orange-500" />}
        >
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-mono">Likes/miniatura</p>
              <p className="text-2xl font-bold text-bone">{data?.avgLikesPerMini ?? 0}</p>
              <p className="text-xs text-bone/30 mt-1 font-mono">promedio</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-mono">Comentarios/mini</p>
              <p className="text-2xl font-bold text-bone">{data?.avgCommentsPerMini ?? 0}</p>
              <p className="text-xs text-bone/30 mt-1 font-mono">promedio</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-mono">Follows totales</p>
              <p className="text-2xl font-bold text-bone">{(data?.totalFollows ?? 0).toLocaleString()}</p>
              <p className="text-xs text-bone/30 mt-1 font-mono">conexiones</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-mono">Conv. creadores</p>
              <p className="text-2xl font-bold text-bone">{data?.creatorConversionRate ?? 0}%</p>
              <p className="text-xs text-bone/30 mt-1 font-mono">aprobados/total</p>
            </div>
          </div>
        </BentoCard>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ROW 5: FACTIONS + OPERATIONAL STATUS */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="grid gap-4 lg:grid-cols-2">
        <BentoCard
          title="Facciones populares"
          subtitle="Top 5 por miniaturas"
          icon={<Shield className="w-4 h-4 text-rose-500" />}
        >
          <SimpleBarChart
            data={(data?.factionData || []).length > 0 ? data!.factionData : [{ name: 'Sin datos', value: 0 }]}
            height={220}
            layout="horizontal"
          />
        </BentoCard>

        <BentoCard
          title="Estado operacional"
          subtitle="Tiendas y reportes por estado"
          icon={<Store className="w-4 h-4 text-amber-500" />}
        >
          <div className="space-y-5">
            {/* Stores */}
            <div>
              <p className="text-xs text-bone/50 font-mono mb-3 uppercase tracking-wider">Tiendas</p>
              <div className="space-y-2">
                {(data?.storeStatusData || []).map((item) => (
                  <ComparisonBar
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    maxValue={item.max}
                    color={item.color}
                  />
                ))}
                {(data?.storeStatusData || []).length === 0 && (
                  <p className="text-xs text-bone/30 font-mono">Sin datos</p>
                )}
              </div>
            </div>
            {/* Reports */}
            <div>
              <p className="text-xs text-bone/50 font-mono mb-3 uppercase tracking-wider">Reportes</p>
              <div className="space-y-2">
                {(data?.reportStatusData || []).map((item) => (
                  <ComparisonBar
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    maxValue={item.max}
                    color={item.color}
                  />
                ))}
                {(data?.reportStatusData || []).length === 0 && (
                  <p className="text-xs text-bone/30 font-mono">Sin datos</p>
                )}
              </div>
            </div>
          </div>
        </BentoCard>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ROW 6: WEB VITALS */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <WebVitalsMonitor className="mt-8" />

      {/* Vercel Analytics Note */}
      <div className="rounded-xl bg-gradient-to-r from-necron-teal/10 to-imperial-gold/10 border border-necron-teal/20 p-4">
        <div className="flex items-start gap-3">
          <motion.div
            className="p-2 rounded-lg bg-necron-teal/20 border border-necron-teal/30"
            animate={{
              boxShadow: ['0 0 5px rgba(13, 155, 138, 0.3)', '0 0 15px rgba(13, 155, 138, 0.5)', '0 0 5px rgba(13, 155, 138, 0.3)'],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Zap className="w-4 h-4 text-necron-teal" />
          </motion.div>
          <div>
            <h4 className="text-sm font-medium text-bone">Sistema de Telemetria Vercel</h4>
            <p className="text-xs text-bone/40 mt-1 font-mono">
              Datos de trafico y rendimiento via Vercel Analytics + Speed Insights.
              Accede al{' '}
              <a
                href="https://vercel.com/ge0rgid3v-4766s-projects/proyecto-wh-40-k/speed-insights"
                target="_blank"
                rel="noopener noreferrer"
                className="text-necron-teal hover:text-necron-teal/80 inline-flex items-center gap-1"
              >
                modulo de telemetria completo
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
