'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sidebar } from './components/Sidebar'
import { CommandPalette } from './components/CommandPalette'
import { StarfieldBackground, NebulaOverlay } from './components/StarfieldBackground'
import { ScanLines, CogitatorLoading } from './components/ImperialEffects'
import { useAuth } from '@/lib/hooks/useAuth'
import { useNotifications } from '@/lib/hooks/useNotifications'
import { cn } from '@/lib/utils'
import {
  Bell,
  Search,
  ExternalLink,
  ChevronRight,
  Home,
  Cpu,
  CheckCheck,
  MessageSquare,
  Heart,
  UserPlus,
  AtSign,
  Mail,
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

// Notification icon by type
function notificationIcon(type: string) {
  switch (type) {
    case 'like':
      return <Heart className="h-4 w-4 text-blood-red" />
    case 'comment':
      return <MessageSquare className="h-4 w-4 text-necron-teal" />
    case 'follow':
      return <UserPlus className="h-4 w-4 text-imperial-gold" />
    case 'message':
      return <Mail className="h-4 w-4 text-purple-400" />
    case 'mention':
      return <AtSign className="h-4 w-4 text-amber-400" />
    default:
      return <Bell className="h-4 w-4 text-bone/50" />
  }
}

// Relative time helper
function timeAgo(dateStr: string) {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)

  if (diff < 60) return 'ahora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`
  return `${Math.floor(diff / 604800)}sem`
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { user, profile, isLoading, isAuthenticated } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(user?.id)
  const router = useRouter()
  const pathname = usePathname()

  const pageInfo = pageTitles[pathname] || { title: 'Dashboard', description: '' }
  const breadcrumbs = getBreadcrumbs(pathname)

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

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

  const displayedNotifications = notifications.slice(0, 5)

  return (
    <div className="dashboard-root flex h-screen overflow-hidden">
      {/* Background effects */}
      <StarfieldBackground />
      <NebulaOverlay />
      <ScanLines />

      {/* Command Palette */}
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSearchOpen={() => setSearchOpen(true)}
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
              onClick={() => setSearchOpen(true)}
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
                  {unreadCount > 0 && (
                    <motion.span
                      className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blood-red px-1 text-[9px] font-bold text-bone"
                      animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.8, 1, 0.8],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-void-light/95 backdrop-blur-xl border-imperial-gold/20">
                <div className="px-4 py-3 border-b border-imperial-gold/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-3 w-3 text-imperial-gold/60" />
                    <h4 className="text-xs font-mono text-imperial-gold/60 tracking-widest">TRANSMISIONES</h4>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="flex items-center gap-1 text-[10px] font-mono text-necron-teal/60 hover:text-necron-teal transition-colors"
                    >
                      <CheckCheck className="h-3 w-3" />
                      Marcar todas
                    </button>
                  )}
                </div>

                {displayedNotifications.length === 0 ? (
                  <div className="py-6 text-center">
                    <Bell className="h-8 w-8 mx-auto text-bone/20 mb-2" />
                    <p className="text-sm text-bone/40">Sin transmisiones pendientes</p>
                  </div>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto">
                    {displayedNotifications.map((n) => (
                      <DropdownMenuItem
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={cn(
                          'flex items-start gap-3 px-4 py-3 cursor-pointer focus:bg-imperial-gold/5',
                          !n.read && 'bg-imperial-gold/5'
                        )}
                      >
                        <div className="mt-0.5 shrink-0">{notificationIcon(n.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-sm truncate',
                            n.read ? 'text-bone/50' : 'text-bone font-medium'
                          )}>
                            {n.title}
                          </p>
                          {n.body && (
                            <p className="text-xs text-bone/30 truncate mt-0.5">{n.body}</p>
                          )}
                        </div>
                        <span className="text-[10px] text-bone/30 font-mono shrink-0 mt-0.5">
                          {timeAgo(n.created_at)}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}

                {notifications.length > 0 && (
                  <div className="border-t border-imperial-gold/10 p-2">
                    <Link
                      href="/notificaciones"
                      className="block w-full rounded-lg px-3 py-2 text-center text-xs font-mono text-imperial-gold/60 hover:bg-imperial-gold/5 hover:text-imperial-gold transition-colors tracking-wider"
                    >
                      VER TODAS LAS TRANSMISIONES
                    </Link>
                  </div>
                )}
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
