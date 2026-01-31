'use client'

import * as React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts'
import { motion } from 'framer-motion'

// ══════════════════════════════════════════════════════════════
// THEME COLORS - Imperial Strategium Palette
// ══════════════════════════════════════════════════════════════

export const CHART_COLORS = {
  primary: '#C9A227',      // Imperial Gold
  secondary: '#8B0000',    // Blood Red
  tertiary: '#6B1C5F',     // Warp Purple
  success: '#0D9B8A',      // Necron Teal
  warning: '#f59e0b',      // Amber
  danger: '#8B0000',       // Blood Red
  bone: '#E8E8F0',         // Bone
  muted: 'rgba(232, 232, 240, 0.4)',
  grid: 'rgba(201, 162, 39, 0.08)',
  void: '#030308',
}

export const CHART_PALETTE = [
  CHART_COLORS.primary,    // Imperial Gold
  CHART_COLORS.success,    // Necron Teal
  CHART_COLORS.tertiary,   // Warp Purple
  CHART_COLORS.warning,    // Amber
  CHART_COLORS.secondary,  // Blood Red
  '#00d4aa',               // Bright Teal
]

// ══════════════════════════════════════════════════════════════
// CUSTOM TOOLTIP
// ══════════════════════════════════════════════════════════════

interface TooltipPayload {
  name: string
  value: number
  color: string
  dataKey?: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-void-light/95 backdrop-blur-xl border border-imperial-gold/30 rounded-lg px-4 py-3 shadow-lg shadow-imperial-gold/10"
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-imperial-gold/10">
          <div className="w-1.5 h-1.5 rounded-full bg-necron-teal animate-pulse" />
          <p className="text-[10px] font-mono text-imperial-gold/60 tracking-widest">{label}</p>
        </div>
        {/* Data rows */}
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-3 text-sm py-0.5">
            <motion.span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
              animate={{
                boxShadow: [`0 0 4px ${entry.color}`, `0 0 8px ${entry.color}`, `0 0 4px ${entry.color}`],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-bone/60 font-mono text-xs">{entry.name}:</span>
            <span className="text-bone font-mono font-medium">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </motion.div>
    )
  }
  return null
}

// ══════════════════════════════════════════════════════════════
// AREA CHART
// ══════════════════════════════════════════════════════════════

interface AreaChartProps {
  data: Array<Record<string, string | number>>
  dataKey: string
  xAxisKey?: string
  color?: string
  height?: number
  showGrid?: boolean
}

export const SimpleAreaChart: React.FC<AreaChartProps> = ({
  data,
  dataKey,
  xAxisKey = 'name',
  color = CHART_COLORS.primary,
  height = 200,
  showGrid = true,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
          )}
          <XAxis
            dataKey={xAxisKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: CHART_COLORS.muted, fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: CHART_COLORS.muted, fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${dataKey})`}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════════
// LINE CHART (Multiple Lines)
// ══════════════════════════════════════════════════════════════

interface LineChartProps {
  data: Array<Record<string, string | number>>
  lines: Array<{ dataKey: string; color: string; name?: string }>
  xAxisKey?: string
  height?: number
  showLegend?: boolean
}

export const MultiLineChart: React.FC<LineChartProps> = ({
  data,
  lines,
  xAxisKey = 'name',
  height = 250,
  showLegend = true,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis
            dataKey={xAxisKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: CHART_COLORS.muted, fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: CHART_COLORS.muted, fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              iconType="line"
              iconSize={10}
              wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
            />
          )}
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name || line.dataKey}
              stroke={line.color}
              strokeWidth={2}
              dot={{ r: 3, fill: line.color }}
              activeDot={{ r: 5 }}
              animationDuration={800}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════════
// BAR CHART
// ══════════════════════════════════════════════════════════════

interface BarChartProps {
  data: Array<{ name: string; value: number; fill?: string }>
  height?: number
  layout?: 'horizontal' | 'vertical'
  showValues?: boolean
}

export const SimpleBarChart: React.FC<BarChartProps> = ({
  data,
  height = 250,
  layout = 'vertical',
  showValues = false,
}) => {
  const isHorizontal = layout === 'horizontal'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={isHorizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 10, right: showValues ? 40 : 10, left: isHorizontal ? 80 : -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={CHART_COLORS.grid}
            horizontal={!isHorizontal}
            vertical={isHorizontal}
          />
          {isHorizontal ? (
            <>
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.muted, fontSize: 11 }} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.bone, fontSize: 12 }} width={75} />
            </>
          ) : (
            <>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.muted, fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.muted, fontSize: 11 }} />
            </>
          )}
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[4, 4, 4, 4]} animationDuration={800}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill || CHART_PALETTE[index % CHART_PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════════
// DONUT CHART
// ══════════════════════════════════════════════════════════════

interface DonutChartProps {
  data: Array<{ name: string; value: number; fill?: string }>
  height?: number
  showLegend?: boolean
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  height = 220,
  showLegend = true,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={2}
            dataKey="value"
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill || CHART_PALETTE[index % CHART_PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              iconType="circle"
              iconSize={8}
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{ fontSize: 12, paddingLeft: 20 }}
            />
          )}
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
            <tspan x="50%" dy="-5" fontSize="20" fontWeight="600" fill={CHART_COLORS.bone}>
              {total.toLocaleString()}
            </tspan>
            <tspan x="50%" dy="18" fontSize="10" fill={CHART_COLORS.muted}>
              Total
            </tspan>
          </text>
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════════
// STAT CARD
// ══════════════════════════════════════════════════════════════

interface StatCardProps {
  title: string
  value: number | string
  description?: string
  icon?: React.ReactNode
  trend?: { value: number; isPositive: boolean }
  className?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-void-light/50 backdrop-blur-sm border border-imperial-gold/15 rounded-lg p-5 hover:border-imperial-gold/30 transition-colors ${className}`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-mono text-imperial-gold/50 tracking-wider uppercase">{title}</p>
          <p className="text-2xl font-display font-bold text-bone">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {description && (
            <p className="text-xs text-bone/40">{description}</p>
          )}
          {trend && (
            <p className={`text-xs font-mono ${trend.isPositive ? 'text-necron-teal' : 'text-blood-red'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% vs ciclo anterior
            </p>
          )}
        </div>
        {icon && (
          <motion.div
            className="p-2 bg-imperial-gold/10 border border-imperial-gold/20 rounded-lg text-imperial-gold"
            animate={{
              boxShadow: ['0 0 5px rgba(201, 162, 39, 0.2)', '0 0 15px rgba(201, 162, 39, 0.3)', '0 0 5px rgba(201, 162, 39, 0.2)'],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {icon}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════════
// CHART CARD WRAPPER
// ══════════════════════════════════════════════════════════════

interface ChartCardProps {
  title: string
  description?: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  children,
  action,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-void-light/50 backdrop-blur-sm border border-imperial-gold/15 rounded-lg p-5 hover:border-imperial-gold/30 transition-colors relative overflow-hidden ${className}`}
    >
      {/* Corner accents */}
      <span className="absolute top-2 left-2 w-2 h-2 border-l border-t border-imperial-gold/30" />
      <span className="absolute top-2 right-2 w-2 h-2 border-r border-t border-imperial-gold/30" />
      <span className="absolute bottom-2 left-2 w-2 h-2 border-l border-b border-imperial-gold/30" />
      <span className="absolute bottom-2 right-2 w-2 h-2 border-r border-b border-imperial-gold/30" />

      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-necron-teal animate-pulse" />
            <h3 className="text-sm font-medium text-bone">{title}</h3>
          </div>
          {description && <p className="text-xs text-bone/40 font-mono">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════════
// SPARKLINE CHART
// ══════════════════════════════════════════════════════════════

interface SparklineProps {
  data: number[]
  color?: string
  height?: number
  showArea?: boolean
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = CHART_COLORS.primary,
  height = 40,
  showArea = true,
}) => {
  const chartData = data.map((value, index) => ({ index, value }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <defs>
          <linearGradient id={`sparkline-gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={showArea ? `url(#sparkline-gradient-${color.replace('#', '')})` : 'transparent'}
          animationDuration={500}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ══════════════════════════════════════════════════════════════
// RADIAL PROGRESS
// ══════════════════════════════════════════════════════════════

interface RadialProgressProps {
  value: number
  max?: number
  color?: string
  size?: number
  strokeWidth?: number
  label?: string
}

export const RadialProgress: React.FC<RadialProgressProps> = ({
  value,
  max = 100,
  color = CHART_COLORS.primary,
  size = 120,
  strokeWidth = 8,
  label,
}) => {
  const percentage = Math.min((value / max) * 100, 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ border: `1px dashed ${color}30` }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(201, 162, 39, 0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-2xl font-display font-bold text-bone"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {Math.round(percentage)}%
        </motion.span>
        {label && <span className="text-[10px] text-imperial-gold/60 font-mono uppercase tracking-wider">{label}</span>}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// STACKED BAR CHART
// ══════════════════════════════════════════════════════════════

interface StackedBarChartProps {
  data: Array<Record<string, string | number>>
  bars: Array<{ dataKey: string; color: string; name?: string }>
  xAxisKey?: string
  height?: number
}

export const StackedBarChart: React.FC<StackedBarChartProps> = ({
  data,
  bars,
  xAxisKey = 'name',
  height = 250,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis
            dataKey={xAxisKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: CHART_COLORS.muted, fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: CHART_COLORS.muted, fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
          {bars.map((bar) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name || bar.dataKey}
              stackId="stack"
              fill={bar.color}
              radius={[0, 0, 0, 0]}
              animationDuration={800}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════════
// COMPARISON BAR
// ══════════════════════════════════════════════════════════════

interface ComparisonBarProps {
  label: string
  value: number
  maxValue: number
  color?: string
  showPercentage?: boolean
}

export const ComparisonBar: React.FC<ComparisonBarProps> = ({
  label,
  value,
  maxValue,
  color = CHART_COLORS.primary,
  showPercentage = true,
}) => {
  const percentage = (value / maxValue) * 100

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-bone/60 font-mono">{label}</span>
        <span className="text-bone font-mono font-medium">
          {value.toLocaleString()}
          {showPercentage && <span className="text-bone/30 ml-1">({percentage.toFixed(1)}%)</span>}
        </span>
      </div>
      <div className="h-2 bg-void rounded-full overflow-hidden border border-imperial-gold/10">
        <motion.div
          className="h-full rounded-full relative"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}50`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          {/* Animated glow at the end */}
          <motion.div
            className="absolute right-0 top-0 bottom-0 w-2"
            style={{
              background: `linear-gradient(90deg, transparent, ${color})`,
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </div>
    </div>
  )
}
