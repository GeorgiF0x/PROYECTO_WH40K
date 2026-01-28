'use client'

import Link from 'next/link'
import {
  Users,
  Image,
  Store,
  Calendar,
  ShoppingBag,
  Flag,
  Palette,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import type { UserPermissions } from '@/lib/permissions'

interface Stats {
  totalUsers: number
  totalMiniatures: number
  activeListings: number
  totalStores: number
  totalEvents: number
  pendingStores: number
  pendingCreators: number
  pendingReports: number
}

interface DashboardHomeProps {
  stats: Stats
  permissions: UserPermissions | null
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon: Icon,
  href,
  trend,
  trendValue,
  color = 'default',
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  href?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: 'default' | 'success' | 'warning' | 'danger'
}) {
  const colorStyles = {
    default: {
      icon: 'text-bone/70',
      bg: 'bg-bone/5',
    },
    success: {
      icon: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    warning: {
      icon: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    danger: {
      icon: 'text-red-500',
      bg: 'bg-red-500/10',
    },
  }

  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-bone/50',
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  const content = (
    <Card className="relative overflow-hidden hover:border-gold/30 transition-colors">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className={cn('p-2.5 rounded-lg', colorStyles[color].bg)}>
            <Icon className={cn('w-5 h-5', colorStyles[color].icon)} />
          </div>
          {href && (
            <ExternalLink className="w-4 h-4 text-bone/30" />
          )}
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold text-bone tabular-nums">
            {value.toLocaleString()}
          </p>
          <p className="text-sm text-bone/50 mt-1">{label}</p>
        </div>
        {trend && trendValue && (
          <div className={cn('flex items-center gap-1 mt-3 text-xs', trendColors[trend])}>
            <TrendIcon className="w-3 h-3" />
            <span>{trendValue}</span>
            <span className="text-bone/40">vs mes anterior</span>
          </div>
        )}
      </div>
    </Card>
  )

  return href ? <Link href={href}>{content}</Link> : content
}

// Pending Item Card
function PendingCard({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  href: string
}) {
  const isUrgent = value > 0

  return (
    <Link href={href}>
      <div
        className={cn(
          'flex items-center gap-4 p-4 rounded-lg border transition-all duration-200',
          isUrgent
            ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
            : 'bg-bone/5 border-bone/10 hover:border-bone/20'
        )}
      >
        <div className={cn(
          'p-2.5 rounded-lg',
          isUrgent ? 'bg-amber-500/10' : 'bg-bone/5'
        )}>
          <Icon className={cn('w-5 h-5', isUrgent ? 'text-amber-500' : 'text-bone/50')} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-bone/70">{label}</p>
          <p className={cn(
            'text-xl font-bold tabular-nums',
            isUrgent ? 'text-amber-500' : 'text-bone/30'
          )}>
            {value}
          </p>
        </div>
        {isUrgent && (
          <div className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </div>
        )}
        <ArrowRight className={cn('w-4 h-4', isUrgent ? 'text-amber-500/50' : 'text-bone/30')} />
      </div>
    </Link>
  )
}

// Quick Action Button
function QuickAction({
  label,
  icon: Icon,
  href,
}: {
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}) {
  return (
    <Link href={href}>
      <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-bone/10 bg-bone/5 hover:bg-bone/10 hover:border-bone/20 transition-colors text-sm text-bone/70 hover:text-bone">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </button>
    </Link>
  )
}

export default function DashboardHome({ stats, permissions }: DashboardHomeProps) {
  const isModerator = permissions?.isModerator || false
  const isAdmin = permissions?.isAdmin || false

  const totalPending = stats.pendingStores + stats.pendingCreators + stats.pendingReports

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bone">Panel de Control</h1>
          <p className="text-bone/50 mt-1">
            Bienvenido al Administratum. Aquí tienes un resumen de la plataforma.
          </p>
        </div>
        {isModerator && totalPending > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-amber-500">
              {totalPending} {totalPending === 1 ? 'elemento pendiente' : 'elementos pendientes'}
            </span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-sm font-medium text-bone/50 uppercase tracking-wider mb-4">
          Estadísticas Generales
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isAdmin && (
            <StatCard
              label="Usuarios Totales"
              value={stats.totalUsers}
              icon={Users}
              href="/dashboard/usuarios"
              trend="up"
              trendValue="+12%"
              color="success"
            />
          )}
          <StatCard
            label="Miniaturas"
            value={stats.totalMiniatures}
            icon={Image}
            href="/galeria"
            trend="up"
            trendValue="+8%"
          />
          <StatCard
            label="Anuncios Activos"
            value={stats.activeListings}
            icon={ShoppingBag}
            href="/mercado"
            trend="neutral"
            trendValue="0%"
            color="warning"
          />
          <StatCard
            label="Tiendas Aprobadas"
            value={stats.totalStores}
            icon={Store}
            href="/comunidad/tiendas"
            trend="up"
            trendValue="+3"
            color="success"
          />
          <StatCard
            label="Eventos"
            value={stats.totalEvents}
            icon={Calendar}
            href="/comunidad/eventos"
          />
        </div>
      </div>

      {/* Pending Reviews - Moderators Only */}
      {isModerator && (
        <div>
          <h2 className="text-sm font-medium text-bone/50 uppercase tracking-wider mb-4">
            Pendientes de Revisión
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PendingCard
              label="Tiendas Pendientes"
              value={stats.pendingStores}
              icon={Store}
              href="/dashboard/tiendas"
            />
            <PendingCard
              label="Solicitudes de Creador"
              value={stats.pendingCreators}
              icon={Palette}
              href="/dashboard/creadores"
            />
            <PendingCard
              label="Reportes"
              value={stats.pendingReports}
              icon={Flag}
              href="/dashboard/reportes"
            />
          </div>
        </div>
      )}

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <QuickAction label="Subir Miniatura" icon={Image} href="/galeria/subir" />
              <QuickAction label="Crear Anuncio" icon={ShoppingBag} href="/mercado/crear" />
              <QuickAction label="Registrar Tienda" icon={Store} href="/comunidad/tiendas/enviar" />
              <QuickAction label="Crear Evento" icon={Calendar} href="/comunidad/eventos/crear" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ActivityItem
                icon={CheckCircle}
                iconColor="text-green-500"
                title="Tienda aprobada"
                description="Games Workshop Madrid fue aprobada"
                time="Hace 2 horas"
              />
              <ActivityItem
                icon={Users}
                iconColor="text-blue-500"
                title="Nuevo usuario"
                description="3 nuevos usuarios se registraron"
                time="Hace 4 horas"
              />
              <ActivityItem
                icon={Flag}
                iconColor="text-amber-500"
                title="Nuevo reporte"
                description="Contenido reportado en galería"
                time="Hace 6 horas"
              />
              <ActivityItem
                icon={Image}
                iconColor="text-purple-500"
                title="Nuevas miniaturas"
                description="12 miniaturas subidas hoy"
                time="Hace 8 horas"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status - Admin Only */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estado del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SystemStatus
                label="Base de Datos"
                status="operational"
                detail="Supabase - Healthy"
              />
              <SystemStatus
                label="Almacenamiento"
                status="operational"
                detail="85% disponible"
              />
              <SystemStatus
                label="API"
                status="operational"
                detail="Latencia: 45ms"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Activity Item Component
function ActivityItem({
  icon: Icon,
  iconColor,
  title,
  description,
  time,
}: {
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  title: string
  description: string
  time: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-1.5 rounded bg-bone/5">
        <Icon className={cn('w-4 h-4', iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-bone">{title}</p>
        <p className="text-xs text-bone/50 truncate">{description}</p>
      </div>
      <div className="flex items-center gap-1 text-xs text-bone/40">
        <Clock className="w-3 h-3" />
        <span>{time}</span>
      </div>
    </div>
  )
}

// System Status Component
function SystemStatus({
  label,
  status,
  detail,
}: {
  label: string
  status: 'operational' | 'degraded' | 'down'
  detail: string
}) {
  const statusStyles = {
    operational: {
      dot: 'bg-green-500',
      text: 'text-green-500',
      label: 'Operativo',
    },
    degraded: {
      dot: 'bg-amber-500',
      text: 'text-amber-500',
      label: 'Degradado',
    },
    down: {
      dot: 'bg-red-500',
      text: 'text-red-500',
      label: 'Caído',
    },
  }

  const style = statusStyles[status]

  return (
    <div className="p-4 rounded-lg bg-bone/5 border border-bone/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-bone">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className={cn('w-2 h-2 rounded-full', style.dot)} />
          <span className={cn('text-xs', style.text)}>{style.label}</span>
        </div>
      </div>
      <p className="text-xs text-bone/50">{detail}</p>
    </div>
  )
}
