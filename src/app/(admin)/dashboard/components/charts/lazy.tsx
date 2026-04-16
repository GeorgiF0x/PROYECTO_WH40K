'use client'

import dynamic from 'next/dynamic'

// Charts that pull in the full recharts bundle (~31 KB gzipped) are loaded
// lazily so the dashboard shell renders before the chart library arrives.
// `ssr: false` is safe here: the entire admin route is client-only, so we
// gain nothing from server-rendering an SVG that React will rehydrate
// anyway.
//
// NOTE: Next.js' static analyzer REQUIRES the options object to be an inline
// object literal at each `dynamic()` call site. Hoisting it to a const
// breaks tree-shaking / chunk-splitting detection and throws at compile.
// That's why each call below repeats `{ ssr: false, loading: ... }`.

const ChartSkeleton = () => <div className="h-[280px] animate-pulse rounded bg-void-light/30" />

export const MultiLineChart = dynamic(
  () => import('./CogitatorChart').then((m) => ({ default: m.MultiLineChart })),
  { ssr: false, loading: ChartSkeleton }
)

export const SimpleBarChart = dynamic(
  () => import('./CogitatorChart').then((m) => ({ default: m.SimpleBarChart })),
  { ssr: false, loading: ChartSkeleton }
)

export const DonutChart = dynamic(
  () => import('./CogitatorChart').then((m) => ({ default: m.DonutChart })),
  { ssr: false, loading: ChartSkeleton }
)

export const SimpleAreaChart = dynamic(
  () => import('./CogitatorChart').then((m) => ({ default: m.SimpleAreaChart })),
  { ssr: false, loading: ChartSkeleton }
)

export const StackedBarChart = dynamic(
  () => import('./CogitatorChart').then((m) => ({ default: m.StackedBarChart })),
  { ssr: false, loading: ChartSkeleton }
)

export const Sparkline = dynamic(
  () => import('./CogitatorChart').then((m) => ({ default: m.Sparkline })),
  { ssr: false, loading: ChartSkeleton }
)
