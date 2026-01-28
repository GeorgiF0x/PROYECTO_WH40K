'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Store,
  Users,
  Calendar,
  Flag,
  BarChart3,
  Settings,
  Palette,
  Building2,
  UserCog,
  ChevronRight,
  ChevronLeft,
  Home,
  LogOut,
  Bell,
  Search,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui'
import {
  getAccessibleDashboardSections,
  ROLE_DISPLAY_NAMES,
  type UserPermissions,
} from '@/lib/permissions'
import type { UserRole, CreatorStatus, CreatorType } from '@/lib/types/database.types'

interface DashboardShellProps {
  profile: {
    username: string
    display_name: string | null
    avatar_url: string | null
    role?: UserRole | string
    creator_status?: CreatorStatus | string
    creator_type?: CreatorType | string | null
    is_store_owner?: boolean
  }
  permissions: UserPermissions
  children: React.ReactNode
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Store,
  Users,
  Calendar,
  Flag,
  BarChart3,
  Settings,
  Palette,
  Building2,
  UserCog,
}

export default function DashboardShell({ profile, permissions, children }: DashboardShellProps) {
  const pathname = usePathname()
  const accessibleSections = getAccessibleDashboardSections(permissions)
  const roleDisplay = ROLE_DISPLAY_NAMES[permissions.role] || ROLE_DISPLAY_NAMES.user
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Group sections by type
  const mainSections = accessibleSections.filter(s =>
    ['overview'].includes(s.id)
  )
  const personalSections = accessibleSections.filter(s =>
    ['my-store', 'my-content'].includes(s.id)
  )
  const modSections = accessibleSections.filter(s =>
    ['stores', 'creators', 'events', 'reports'].includes(s.id)
  )
  const adminSections = accessibleSections.filter(s =>
    ['users', 'analytics', 'settings'].includes(s.id)
  )

  const NavSection = ({ title, sections }: { title?: string; sections: typeof accessibleSections }) => {
    if (sections.length === 0) return null

    return (
      <div className="space-y-1">
        {title && !sidebarCollapsed && (
          <p className="px-3 py-2 text-xs font-medium text-bone/40 uppercase tracking-wider">
            {title}
          </p>
        )}
        {sections.map((section) => {
          const Icon = ICON_MAP[section.icon] || LayoutDashboard
          const isActive = pathname === section.href

          return (
            <Link key={section.id} href={section.href}>
              <div
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-gold/10 text-gold border border-gold/20'
                    : 'text-bone/70 hover:text-bone hover:bg-bone/5',
                  sidebarCollapsed && 'justify-center px-2'
                )}
                title={sidebarCollapsed ? section.name : undefined}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-gold')} />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-sm font-medium">{section.name}</span>
                    {isActive && <ChevronRight className="w-4 h-4 text-gold/50" />}
                  </>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo/Brand */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-bone/10',
        sidebarCollapsed && 'justify-center px-2'
      )}>
        <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
          <LayoutDashboard className="w-5 h-5 text-gold" />
        </div>
        {!sidebarCollapsed && (
          <div>
            <h1 className="font-bold text-bone">Administratum</h1>
            <p className="text-xs text-bone/50">Panel de Control</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        <NavSection sections={mainSections} />
        <NavSection title="Personal" sections={personalSections} />
        <NavSection title="Moderación" sections={modSections} />
        <NavSection title="Administración" sections={adminSections} />
      </nav>

      {/* User Profile */}
      <div className={cn(
        'border-t border-bone/10 p-3',
        sidebarCollapsed && 'flex justify-center'
      )}>
        {sidebarCollapsed ? (
          <Avatar
            src={profile.avatar_url}
            alt={profile.display_name || profile.username}
            size="sm"
            className="cursor-pointer"
          />
        ) : (
          <div className="flex items-center gap-3">
            <Avatar
              src={profile.avatar_url}
              alt={profile.display_name || profile.username}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-bone truncate">
                {profile.display_name || profile.username}
              </p>
              <p className="text-xs text-bone/50 truncate">
                {roleDisplay.name}
              </p>
            </div>
            <Link href="/perfil" className="p-1.5 rounded hover:bg-bone/5 text-bone/50 hover:text-bone">
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Collapse Button - Desktop */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-void-light border border-bone/20 items-center justify-center text-bone/50 hover:text-bone hover:border-bone/40 transition-colors"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-void text-bone">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-void-light border-b border-bone/10 z-40 flex items-center justify-between px-4">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-lg hover:bg-bone/5 text-bone/70"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-gold" />
          <span className="font-bold text-bone">Administratum</span>
        </div>
        <Avatar
          src={profile.avatar_url}
          alt={profile.display_name || profile.username}
          size="sm"
        />
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-void-light border-r border-bone/10 z-50"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:block fixed left-0 top-0 bottom-0 bg-void-light border-r border-bone/10 z-30 transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'min-h-screen transition-all duration-300',
          'pt-14 lg:pt-0',
          sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        )}
      >
        {/* Top Bar */}
        <header className="hidden lg:flex sticky top-0 h-14 bg-void/80 backdrop-blur-sm border-b border-bone/10 z-20 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bone/40" />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-64 pl-9 pr-4 py-2 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone placeholder:text-bone/40 focus:outline-none focus:border-gold/30"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-bone/5 text-bone/50 hover:text-bone relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blood-red rounded-full" />
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-bone/70 hover:text-bone hover:bg-bone/5"
            >
              <Home className="w-4 h-4" />
              <span>Volver al sitio</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
