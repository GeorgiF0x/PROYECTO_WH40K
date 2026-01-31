'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Sidebar } from './components/Sidebar'
import { useAuth } from '@/lib/hooks/useAuth'
import { cn } from '@/lib/utils'
import {
  Bell,
  Search,
  ExternalLink,
  ChevronRight,
  Home,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu'
import './dashboard.css'

// Page titles mapping
const pageTitles: Record<string, { title: string; description: string }> = {
  '/dashboard': { title: 'Dashboard', description: 'Resumen general de la plataforma' },
  '/dashboard/tiendas': { title: 'Tiendas', description: 'Gestiona las tiendas de la comunidad' },
  '/dashboard/creadores': { title: 'Creadores', description: 'Solicitudes y perfiles de creadores' },
  '/dashboard/usuarios': { title: 'Usuarios', description: 'Administra los usuarios registrados' },
  '/dashboard/eventos': { title: 'Eventos', description: 'Gestiona eventos de la comunidad' },
  '/dashboard/reportes': { title: 'Reportes', description: 'Modera contenido reportado' },
  '/dashboard/analiticas': { title: 'Analiticas', description: 'Estadisticas y metricas' },
  '/dashboard/configuracion': { title: 'Configuracion', description: 'Ajustes del sistema' },
}

// Breadcrumb generator
function getBreadcrumbs(pathname: string) {
  const parts = pathname.split('/').filter(Boolean)
  const breadcrumbs = []

  let currentPath = ''
  for (const part of parts) {
    currentPath += `/${part}`
    const title = pageTitles[currentPath]?.title || part.charAt(0).toUpperCase() + part.slice(1)
    breadcrumbs.push({ title, href: currentPath })
  }

  return breadcrumbs
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { user, profile, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const pageInfo = pageTitles[pathname] || { title: 'Dashboard', description: '' }
  const breadcrumbs = getBreadcrumbs(pathname)

  // Check if user has admin/moderator access
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard')
    }

    if (!isLoading && profile && profile.role !== 'admin' && profile.role !== 'moderator') {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, profile, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="dashboard-root flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-2 border-blue-500/20" />
            <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-blue-500" />
          </div>
          <p className="text-sm text-zinc-500">Cargando panel...</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (!isAuthenticated || (profile && profile.role !== 'admin' && profile.role !== 'moderator')) {
    return null
  }

  return (
    <div className="dashboard-root flex h-screen overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="dashboard-header sticky top-0 z-40 flex h-16 items-center justify-between gap-4 px-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/dashboard"
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <Home className="h-4 w-4" />
            </Link>
            {breadcrumbs.slice(1).map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-700" />
                {index === breadcrumbs.length - 2 ? (
                  <span className="text-white font-medium">{crumb.title}</span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    {crumb.title}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 text-sm hover:bg-white/10 hover:text-white transition-colors">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Buscar...</span>
              <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] text-zinc-500">
                ⌘K
              </kbd>
            </button>

            {/* View site */}
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-zinc-400 text-sm hover:bg-white/5 hover:text-white transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Ver sitio</span>
            </Link>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-zinc-900 border-zinc-800">
                <div className="px-4 py-3 border-b border-zinc-800">
                  <h4 className="text-sm font-medium text-white">Notificaciones</h4>
                </div>
                <div className="py-6 text-center">
                  <Bell className="h-8 w-8 mx-auto text-zinc-700 mb-2" />
                  <p className="text-sm text-zinc-500">No hay notificaciones</p>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-7xl p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
