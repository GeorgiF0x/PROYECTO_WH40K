'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Store,
  Users,
  Palette,
  Calendar,
  Flag,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ExternalLink,
  Shield,
  Bell,
  Search,
  Plus,
  Globe,
  ImageIcon,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { useAuth } from '@/lib/hooks/useAuth'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  color?: string
}

const mainNavItems: NavItem[] = [
  { title: 'Inicio', href: '/dashboard', icon: Home },
  { title: 'Tiendas', href: '/dashboard/tiendas', icon: Store, color: 'text-amber-500' },
  { title: 'Mercado', href: '/dashboard/mercado', icon: ShoppingBag, color: 'text-orange-500' },
  { title: 'Creadores', href: '/dashboard/creadores', icon: Palette, color: 'text-purple-500' },
  { title: 'Usuarios', href: '/dashboard/usuarios', icon: Users, color: 'text-blue-500' },
  { title: 'Eventos', href: '/dashboard/eventos', icon: Calendar, color: 'text-emerald-500' },
  { title: 'Reportes', href: '/dashboard/reportes', icon: Flag, color: 'text-red-500' },
]

const secondaryNavItems: NavItem[] = [
  { title: 'Analiticas', href: '/dashboard/analiticas', icon: BarChart3 },
  { title: 'Configuracion', href: '/dashboard/configuracion', icon: Settings },
]

const quickLinks = [
  { title: 'Ver sitio', href: '/', icon: Globe, external: false },
  { title: 'Galeria', href: '/galeria', icon: ImageIcon, external: false },
  { title: 'Mercado', href: '/mercado', icon: ShoppingBag, external: false },
  { title: 'Comunidad', href: '/comunidad', icon: Sparkles, external: false },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
    const Icon = item.icon

    const linkContent = (
      <Link
        href={item.href}
        className={cn(
          'nav-item flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
          isActive
            ? 'bg-white/5 text-white'
            : 'text-zinc-400 hover:bg-white/5 hover:text-white',
          collapsed && 'justify-center px-2'
        )}
      >
        <Icon className={cn('h-[18px] w-[18px] shrink-0', isActive && item.color)} />
        {!collapsed && <span>{item.title}</span>}
        {!collapsed && item.badge && item.badge > 0 && (
          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-bold text-white">
            {item.badge}
          </span>
        )}
      </Link>
    )

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2 bg-zinc-900 border-zinc-800">
            {item.title}
            {item.badge && item.badge > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-bold text-white">
                {item.badge}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      )
    }

    return linkContent
  }

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'dashboard-sidebar relative flex h-screen flex-col transition-all duration-300 ease-in-out',
          collapsed ? 'w-[70px]' : 'w-[260px]'
        )}
      >
        {/* Logo Header */}
        <div className={cn(
          'flex h-16 items-center border-b border-white/5 px-4',
          collapsed && 'justify-center px-2'
        )}>
          {!collapsed ? (
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">Grimdark Legion</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Admin Panel</span>
              </div>
            </Link>
          ) : (
            <Link href="/dashboard">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
                <Shield className="h-5 w-5 text-white" />
              </div>
            </Link>
          )}
        </div>

        {/* Quick Actions (only when expanded) */}
        {!collapsed && (
          <div className="px-3 py-4 border-b border-white/5">
            <div className="flex gap-2">
              <button className="quick-action flex-1 justify-center">
                <Search className="h-4 w-4" />
                <span className="text-xs">Buscar</span>
              </button>
              <button className="quick-action-primary quick-action justify-center px-3">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {!collapsed && (
              <h4 className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                Gestion
              </h4>
            )}
            {mainNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>

          <Separator className="my-4 bg-white/5" />

          <div className="space-y-1">
            {!collapsed && (
              <h4 className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                Sistema
              </h4>
            )}
            {secondaryNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>

          {/* Quick Links (only when expanded) */}
          {!collapsed && (
            <>
              <Separator className="my-4 bg-white/5" />
              <div className="space-y-1">
                <h4 className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                  Accesos rapidos
                </h4>
                {quickLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-500 hover:bg-white/5 hover:text-zinc-300 transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                  </Link>
                ))}
              </div>
            </>
          )}
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t border-white/5 p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              'w-full justify-center text-zinc-500 hover:text-white hover:bg-white/5',
              !collapsed && 'justify-start'
            )}
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform duration-300',
                collapsed && 'rotate-180'
              )}
            />
            {!collapsed && <span className="ml-2 text-sm">Colapsar</span>}
          </Button>
        </div>

        {/* User Section */}
        <div className="border-t border-white/5 p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5',
                  collapsed && 'justify-center'
                )}
              >
                <div className="relative">
                  <Avatar className="h-9 w-9 border-2 border-white/10">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                      {profile?.username?.slice(0, 2).toUpperCase() || 'AD'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-zinc-950 bg-emerald-500" />
                </div>
                {!collapsed && (
                  <div className="flex flex-1 flex-col items-start text-left min-w-0">
                    <span className="text-sm font-medium text-white truncate w-full">
                      {profile?.display_name || profile?.username || 'Admin'}
                    </span>
                    <span className="text-[11px] text-zinc-500 capitalize">
                      {profile?.role || 'admin'}
                    </span>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="right"
              align="end"
              sideOffset={8}
              className="w-56 bg-zinc-900 border-zinc-800"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-white">
                    {profile?.display_name || profile?.username}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {profile?.role === 'admin' ? 'Administrador' : 'Moderador'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem asChild className="text-zinc-300 focus:text-white focus:bg-white/5">
                <Link href={`/usuarios/${profile?.username}`} className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Ver mi perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-zinc-300 focus:text-white focus:bg-white/5">
                <Link href="/perfil" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configuracion
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem asChild className="text-zinc-300 focus:text-white focus:bg-white/5">
                <Link href="/" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Volver al sitio
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </TooltipProvider>
  )
}
