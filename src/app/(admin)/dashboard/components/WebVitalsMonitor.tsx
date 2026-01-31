'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { onCLS, onLCP, onTTFB, onINP, type Metric } from 'web-vitals'
import {
  Zap,
  Clock,
  MousePointer,
  Layout,
  Timer,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Cpu,
} from 'lucide-react'
import { RadialProgress, CHART_COLORS } from './charts'

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

interface WebVital {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
}

interface WebVitalsState {
  LCP: WebVital | null  // Largest Contentful Paint
  CLS: WebVital | null  // Cumulative Layout Shift
  TTFB: WebVital | null // Time to First Byte
  INP: WebVital | null  // Interaction to Next Paint
}

// ══════════════════════════════════════════════════════════════════════════════
// THRESHOLDS (from web.dev)
// ══════════════════════════════════════════════════════════════════════════════

const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },   // ms
  CLS: { good: 0.1, poor: 0.25 },    // score
  TTFB: { good: 800, poor: 1800 },   // ms
  INP: { good: 200, poor: 500 },     // ms
}

// ══════════════════════════════════════════════════════════════════════════════
// HOOK: useWebVitals
// ══════════════════════════════════════════════════════════════════════════════

export function useWebVitals() {
  const [vitals, setVitals] = useState<WebVitalsState>({
    LCP: null,
    CLS: null,
    TTFB: null,
    INP: null,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handleMetric = (metric: Metric) => {
      setVitals(prev => ({
        ...prev,
        [metric.name]: {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
        },
      }))
      setIsLoading(false)
    }

    // Register all Web Vitals observers
    onLCP(handleMetric)
    onCLS(handleMetric)
    onTTFB(handleMetric)
    onINP(handleMetric)

    // Set loading to false after a timeout if no metrics arrive
    const timeout = setTimeout(() => setIsLoading(false), 5000)

    return () => clearTimeout(timeout)
  }, [])

  return { vitals, isLoading }
}

// ══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════════

function formatValue(name: string, value: number): string {
  switch (name) {
    case 'CLS':
      return value.toFixed(3)
    case 'LCP':
    case 'TTFB':
    case 'INP':
      return value < 1000 ? `${Math.round(value)}ms` : `${(value / 1000).toFixed(2)}s`
    default:
      return String(Math.round(value))
  }
}

function getRatingColor(rating: string): string {
  switch (rating) {
    case 'good':
      return '#0D9B8A' // necron-teal
    case 'needs-improvement':
      return '#F59E0B' // amber
    case 'poor':
      return '#8B0000' // blood-red
    default:
      return '#71717a'
  }
}

function getRatingIcon(rating: string) {
  switch (rating) {
    case 'good':
      return <CheckCircle className="w-4 h-4" />
    case 'needs-improvement':
      return <AlertTriangle className="w-4 h-4" />
    case 'poor':
      return <XCircle className="w-4 h-4" />
    default:
      return <Activity className="w-4 h-4" />
  }
}

function getVitalIcon(name: string) {
  switch (name) {
    case 'LCP':
      return <Layout className="w-4 h-4" />
    case 'INP':
      return <MousePointer className="w-4 h-4" />
    case 'CLS':
      return <Activity className="w-4 h-4" />
    case 'TTFB':
      return <Timer className="w-4 h-4" />
    default:
      return <Zap className="w-4 h-4" />
  }
}

function getVitalDescription(name: string): string {
  switch (name) {
    case 'LCP':
      return 'Largest Contentful Paint - Tiempo de carga del contenido principal'
    case 'CLS':
      return 'Cumulative Layout Shift - Estabilidad visual de la pagina'
    case 'TTFB':
      return 'Time to First Byte - Tiempo de respuesta del servidor'
    case 'INP':
      return 'Interaction to Next Paint - Latencia de interacciones'
    default:
      return ''
  }
}

function calculateOverallScore(vitals: WebVitalsState): number {
  const metrics = [vitals.LCP, vitals.CLS, vitals.TTFB, vitals.INP].filter(Boolean)
  if (metrics.length === 0) return 0

  let score = 0
  metrics.forEach(metric => {
    if (metric?.rating === 'good') score += 100
    else if (metric?.rating === 'needs-improvement') score += 50
  })

  return Math.round(score / metrics.length)
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

interface VitalCardProps {
  vital: WebVital
  index: number
}

function VitalCard({ vital, index }: VitalCardProps) {
  const color = getRatingColor(vital.rating)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative p-4 rounded-xl bg-void/50 border border-imperial-gold/10 hover:border-imperial-gold/30 transition-all group"
    >
      {/* Corner brackets */}
      <span className="absolute top-1 left-1 w-2 h-2 border-l border-t border-imperial-gold/20 group-hover:border-imperial-gold/50 transition-colors" />
      <span className="absolute top-1 right-1 w-2 h-2 border-r border-t border-imperial-gold/20 group-hover:border-imperial-gold/50 transition-colors" />
      <span className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-imperial-gold/20 group-hover:border-imperial-gold/50 transition-colors" />
      <span className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-imperial-gold/20 group-hover:border-imperial-gold/50 transition-colors" />

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            className="p-1.5 rounded-lg"
            style={{ backgroundColor: `${color}20`, color }}
            animate={{
              boxShadow: [`0 0 5px ${color}30`, `0 0 15px ${color}50`, `0 0 5px ${color}30`],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {getVitalIcon(vital.name)}
          </motion.div>
          <div>
            <span className="text-xs font-mono text-imperial-gold/60 tracking-wider">{vital.name}</span>
          </div>
        </div>
        <div style={{ color }}>
          {getRatingIcon(vital.rating)}
        </div>
      </div>

      <motion.p
        className="text-2xl font-display font-bold text-bone mb-1"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 + index * 0.1, type: 'spring' }}
      >
        {formatValue(vital.name, vital.value)}
      </motion.p>

      <p className="text-[10px] text-bone/40 leading-tight">
        {getVitalDescription(vital.name)}
      </p>

      {/* Rating bar */}
      <div className="mt-3 h-1 bg-void rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{
            width: vital.rating === 'good' ? '100%' : vital.rating === 'needs-improvement' ? '50%' : '25%',
          }}
          transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
        />
      </div>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT: WebVitalsMonitor
// ══════════════════════════════════════════════════════════════════════════════

interface WebVitalsMonitorProps {
  className?: string
}

export function WebVitalsMonitor({ className = '' }: WebVitalsMonitorProps) {
  const { vitals, isLoading } = useWebVitals()
  const [refreshKey, setRefreshKey] = useState(0)

  const overallScore = calculateOverallScore(vitals)
  const scoreColor = overallScore >= 75 ? CHART_COLORS.success : overallScore >= 50 ? '#F59E0B' : CHART_COLORS.danger

  const vitalsList = [
    vitals.LCP,
    vitals.INP,
    vitals.CLS,
    vitals.TTFB,
  ].filter(Boolean) as WebVital[]

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1)
    // Force page reload to get fresh metrics
    window.location.reload()
  }, [])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className="p-2 rounded-lg bg-necron-teal/10 border border-necron-teal/30"
            animate={{
              boxShadow: ['0 0 10px rgba(13, 155, 138, 0.2)', '0 0 20px rgba(13, 155, 138, 0.4)', '0 0 10px rgba(13, 155, 138, 0.2)'],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Zap className="w-5 h-5 text-necron-teal" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-3 h-3 text-imperial-gold/50" />
              <span className="text-[10px] font-mono text-imperial-gold/50 tracking-widest">DIAGNOSTICO AUSPEX</span>
            </div>
            <h3 className="text-lg font-display font-bold text-bone">Core Web Vitals</h3>
          </div>
        </div>

        <motion.button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-void border border-imperial-gold/20 text-bone/60 text-xs font-mono hover:border-imperial-gold/40 hover:text-bone transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <RefreshCw className="w-3 h-3" />
          REESCANEAR
        </motion.button>
      </div>

      {/* Overall Score + Vitals Grid */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-1 relative p-6 rounded-xl bg-void-light/50 backdrop-blur-sm border border-imperial-gold/15 flex flex-col items-center justify-center"
        >
          {/* Corner brackets */}
          <span className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-imperial-gold/30" />
          <span className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-imperial-gold/30" />
          <span className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-imperial-gold/30" />
          <span className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-imperial-gold/30" />

          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <motion.div
                className="w-12 h-12 border-2 border-imperial-gold/20 border-t-imperial-gold rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <span className="text-xs font-mono text-imperial-gold/50">ESCANEANDO...</span>
            </div>
          ) : (
            <>
              <RadialProgress
                value={overallScore}
                color={scoreColor}
                size={100}
                strokeWidth={6}
                label="SCORE"
              />
              <p className="mt-3 text-xs font-mono text-bone/40 text-center">
                {overallScore >= 75 ? 'OPTIMO' : overallScore >= 50 ? 'MEJORABLE' : 'CRITICO'}
              </p>
            </>
          )}
        </motion.div>

        {/* Vitals Grid */}
        <div className="lg:col-span-4 grid gap-3 grid-cols-2 lg:grid-cols-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              // Loading skeletons
              [...Array(4)].map((_, i) => (
                <motion.div
                  key={`skeleton-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 rounded-xl bg-void/50 border border-imperial-gold/10"
                >
                  <div className="h-4 w-12 bg-imperial-gold/10 rounded animate-pulse mb-3" />
                  <div className="h-8 w-20 bg-imperial-gold/5 rounded animate-pulse mb-2" />
                  <div className="h-3 w-full bg-imperial-gold/5 rounded animate-pulse" />
                </motion.div>
              ))
            ) : vitalsList.length > 0 ? (
              vitalsList.map((vital, index) => (
                <VitalCard key={vital.id} vital={vital} index={index} />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full p-8 rounded-xl bg-void/50 border border-imperial-gold/10 text-center"
              >
                <Activity className="w-8 h-8 text-imperial-gold/30 mx-auto mb-3" />
                <p className="text-bone/50 text-sm">Navegando para capturar metricas...</p>
                <p className="text-bone/30 text-xs mt-1">Las metricas se capturan durante la navegacion</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-necron-teal" />
          <span className="text-xs text-bone/50 font-mono">OPTIMO</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-xs text-bone/50 font-mono">MEJORABLE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blood-red" />
          <span className="text-xs text-bone/50 font-mono">CRITICO</span>
        </div>
      </div>

      {/* Info note */}
      <div className="p-3 rounded-lg bg-necron-teal/5 border border-necron-teal/20">
        <p className="text-xs text-bone/50 font-mono">
          <span className="text-necron-teal">INFO:</span> Las metricas se capturan en tiempo real desde tu navegador.
          Para datos historicos agregados, visita{' '}
          <a
            href="https://vercel.com/ge0rgid3v-4766s-projects/proyecto-wh-40-k/speed-insights"
            target="_blank"
            rel="noopener noreferrer"
            className="text-necron-teal hover:underline"
          >
            Vercel Speed Insights
          </a>
        </p>
      </div>
    </div>
  )
}
