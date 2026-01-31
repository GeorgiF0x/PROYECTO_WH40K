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
  ShieldCheck,
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
}

const mainNavItems: NavItem[] = [
  { title: 'Inicio', href: '/dashboard', icon: Home },
  { title: 'Tiendas', href: '/dashboard/tiendas', icon: Store },
  { title: 'Creadores', href: '/dashboard/creadores', icon: Palette },
  { title: 'Usuarios', href: '/dashboard/usuarios', icon: Users },
  { title: 'Eventos', href: '/dashboard/eventos', icon: Calendar },
  { title: 'Reportes', href: '/dashboard/reportes', icon: Flag },
]

const secondaryNavItems: NavItem[] = [
  { title: 'Analíticas', href: '/dashboard/analiticas', icon: BarChart3 },
  { title: 'Configuración', href: '/dashboard/configuracion', icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href
    const Icon = item.icon

    const linkContent = (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent',
          isActive
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:text-foreground',
          collapsed && 'justify-center px-2'
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span>{item.title}</span>}
        {!collapsed && item.badge && (
          <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {item.badge}
          </span>
        )}
      </Link>
    )

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.title}
            {item.badge && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
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
          'flex h-screen flex-col border-r bg-background transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center border-b px-4">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="h-6 w-6 text-[#C9A227]" />
              <span className="text-[#E8E8F0]">Grimdark Legion</span>
            </Link>
          )}
          {collapsed && (
            <Link href="/dashboard" className="mx-auto">
              <ShieldCheck className="h-6 w-6" />
            </Link>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {!collapsed && (
              <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Principal
              </h4>
            )}
            {mainNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-1">
            {!collapsed && (
              <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sistema
              </h4>
            )}
            {secondaryNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn('w-full justify-center', !collapsed && 'justify-start')}
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform',
                collapsed && 'rotate-180'
              )}
            />
            {!collapsed && <span className="ml-2">Colapsar</span>}
          </Button>
        </div>

        {/* User Section */}
        <div className="border-t p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-2',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {profile?.username?.slice(0, 2).toUpperCase() || 'AD'}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium">
                      {profile?.display_name || profile?.username || 'Admin'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {profile?.role || 'admin'}
                    </span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align={collapsed ? 'center' : 'start'} className="w-56">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Volver al sitio
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </TooltipProvider>
  )
}
