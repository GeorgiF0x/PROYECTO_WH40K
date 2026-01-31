'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sidebar } from './components/Sidebar'
import { StarfieldBackground, NebulaOverlay } from './components/StarfieldBackground'
import { ScanLines, CogitatorLoading } from './components/ImperialEffects'
import { useAuth } from '@/lib/hooks/useAuth'
import { cn } from '@/lib/utils'
import {
  Bell,
  Search,
  ExternalLink,
  ChevronRight,
  Home,
  Cpu,
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
  '/dashboard/mercado': { title: 'Mercado', description: 'Gestiona los anuncios del mercado P2P' },
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
        <StarfieldBackground />
        <NebulaOverlay />
        <CogitatorLoading size="lg" text="INICIALIZANDO STRATEGIUM..." />
      </div>
    )
  }

  // Show nothing while redirecting
  if (!isAuthenticated || (profile && profile.role !== 'admin' && profile.role !== 'moderator')) {
    return null
  }

  return (
    <div className="dashboard-root flex h-screen overflow-hidden">
      {/* Background effects */}
      <StarfieldBackground />
      <NebulaOverlay />
      <ScanLines />

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <motion.div
        className="relative flex flex-1 flex-col overflow-hidden"
        style={{ zIndex: 10 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Header */}
        <header className="dashboard-header sticky top-0 z-40 flex h-16 items-center justify-between gap-4 px-6">
          {/* Breadcrumbs with imperial styling */}
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-2 mr-2">
              <Cpu className="h-4 w-4 text-imperial-gold/60" />
              <span className="text-[10px] font-mono text-imperial-gold/60 tracking-widest hidden md:inline">
                STRATEGIUM
              </span>
            </div>
            <Link
              href="/dashboard"
              className="text-bone/50 hover:text-imperial-gold transition-colors"
            >
              <Home className="h-4 w-4" />
            </Link>
            {breadcrumbs.slice(1).map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                <ChevronRight className="h-3.5 w-3.5 text-bone/20" />
                {index === breadcrumbs.length - 2 ? (
                  <span className="text-bone font-medium">{crumb.title}</span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-bone/50 hover:text-imperial-gold transition-colors"
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
            <motion.button
              className="quick-action"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Buscar...</span>
              <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-imperial-gold/20 bg-void-light px-1.5 font-mono text-[10px] text-bone/40">
                ⌘K
              </kbd>
            </motion.button>

            {/* View site */}
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-bone/50 text-sm hover:bg-imperial-gold/5 hover:text-imperial-gold transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Ver sitio</span>
            </Link>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  className="relative p-2 rounded-lg text-bone/50 hover:bg-imperial-gold/5 hover:text-imperial-gold transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell className="h-5 w-5" />
                  <motion.span
                    className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blood-red"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-void-light/95 backdrop-blur-xl border-imperial-gold/20">
                <div className="px-4 py-3 border-b border-imperial-gold/10">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-3 w-3 text-imperial-gold/60" />
                    <h4 className="text-xs font-mono text-imperial-gold/60 tracking-widest">TRANSMISIONES</h4>
                  </div>
                </div>
                <div className="py-6 text-center">
                  <Bell className="h-8 w-8 mx-auto text-bone/20 mb-2" />
                  <p className="text-sm text-bone/40">Sin transmisiones pendientes</p>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            className="container mx-auto max-w-7xl p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </motion.div>
    </div>
  )
}
