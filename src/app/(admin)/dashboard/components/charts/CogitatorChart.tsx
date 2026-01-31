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
// THEME COLORS
// ══════════════════════════════════════════════════════════════

export const CHART_COLORS = {
  primary: '#C9A227',
  secondary: '#8B0000',
  tertiary: '#6B46C1',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  bone: '#E8E8F0',
  muted: '#71717a',
  grid: 'rgba(113, 113, 122, 0.2)',
}

export const CHART_PALETTE = [
  CHART_COLORS.primary,
  CHART_COLORS.success,
  CHART_COLORS.tertiary,
  CHART_COLORS.warning,
  CHART_COLORS.secondary,
  '#00d4aa',
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
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs text-zinc-400 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-zinc-300">{entry.name}:</span>
            <span className="text-white font-medium">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
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
      className={`bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-zinc-400">{title}</p>
          <p className="text-2xl font-semibold text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {description && (
            <p className="text-xs text-zinc-500">{description}</p>
          )}
          {trend && (
            <p className={`text-xs font-medium ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% vs mes anterior
            </p>
          )}
        </div>
        {icon && (
          <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
            {icon}
          </div>
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
      className={`bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-white">{title}</h3>
          {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  )
}
