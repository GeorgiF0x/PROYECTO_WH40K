'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
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
  Search,
  Plus,
  Globe,
  ImageIcon,
  ShoppingBag,
  Sparkles,
  Cpu,
  Target,
} from 'lucide-react'
import { Button } from './ui/button'
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
  { title: 'Comando', href: '/dashboard', icon: Home, color: 'text-imperial-gold' },
  { title: 'Tiendas', href: '/dashboard/tiendas', icon: Store, color: 'text-amber-400' },
  { title: 'Mercado', href: '/dashboard/mercado', icon: ShoppingBag, color: 'text-orange-400' },
  { title: 'Creadores', href: '/dashboard/creadores', icon: Palette, color: 'text-purple-400' },
  { title: 'Usuarios', href: '/dashboard/usuarios', icon: Users, color: 'text-necron-teal' },
  { title: 'Eventos', href: '/dashboard/eventos', icon: Calendar, color: 'text-emerald-400' },
  { title: 'Reportes', href: '/dashboard/reportes', icon: Flag, color: 'text-blood-red' },
]

const secondaryNavItems: NavItem[] = [
  { title: 'Analiticas', href: '/dashboard/analiticas', icon: BarChart3, color: 'text-necron-teal' },
  { title: 'Configuracion', href: '/dashboard/configuracion', icon: Settings, color: 'text-bone/60' },
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
      <motion.div
        whileHover={{ x: collapsed ? 0 : 4 }}
        transition={{ duration: 0.2 }}
      >
        <Link
          href={item.href}
          className={cn(
            'nav-item flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative',
            isActive
              ? 'bg-imperial-gold/10 text-bone'
              : 'text-bone/50 hover:bg-imperial-gold/5 hover:text-bone',
            collapsed && 'justify-center px-2'
          )}
        >
          {/* Target lock indicator for active item */}
          {isActive && (
            <motion.span
              className="absolute right-2 top-1/2 -translate-y-1/2"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Target className="h-3 w-3 text-imperial-gold/60" />
            </motion.span>
          )}
          <motion.div
            animate={isActive ? {
              filter: 'drop-shadow(0 0 4px rgba(201, 162, 39, 0.5))',
            } : {}}
          >
            <Icon className={cn('h-[18px] w-[18px] shrink-0', isActive ? item.color : '')} />
          </motion.div>
          {!collapsed && <span>{item.title}</span>}
          {!collapsed && item.badge && item.badge > 0 && (
            <motion.span
              className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-blood-red px-1.5 text-[10px] font-bold text-bone"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {item.badge}
            </motion.span>
          )}
        </Link>
      </motion.div>
    )

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2 bg-void-light border-imperial-gold/20 text-bone">
            {item.title}
            {item.badge && item.badge > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blood-red px-1.5 text-[10px] font-bold text-bone">
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
        style={{ zIndex: 50 }}
      >
        {/* Logo Header - Imperial Command */}
        <div className={cn(
          'flex h-16 items-center border-b border-imperial-gold/10 px-4',
          collapsed && 'justify-center px-2'
        )}>
          {!collapsed ? (
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <motion.div
                className="relative flex h-10 w-10 items-center justify-center"
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(201, 162, 39, 0.3)',
                    '0 0 20px rgba(201, 162, 39, 0.5)',
                    '0 0 10px rgba(201, 162, 39, 0.3)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {/* Hexagonal frame */}
                <div className="absolute inset-0 bg-gradient-to-br from-imperial-gold to-imperial-gold/60 clip-hexagon" />
                <div className="absolute inset-[2px] bg-void-dark clip-hexagon" />
                <Shield className="h-5 w-5 text-imperial-gold relative z-10" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-sm font-display font-bold text-bone tracking-wide">STRATEGIUM</span>
                <span className="text-[10px] text-imperial-gold/60 font-mono tracking-widest">CENTRO DE COMANDO</span>
              </div>
            </Link>
          ) : (
            <Link href="/dashboard">
              <motion.div
                className="relative flex h-10 w-10 items-center justify-center"
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(201, 162, 39, 0.3)',
                    '0 0 20px rgba(201, 162, 39, 0.5)',
                    '0 0 10px rgba(201, 162, 39, 0.3)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-imperial-gold to-imperial-gold/60 rounded-lg" />
                <div className="absolute inset-[2px] bg-void-dark rounded-md" />
                <Shield className="h-5 w-5 text-imperial-gold relative z-10" />
              </motion.div>
            </Link>
          )}
        </div>

        {/* Quick Actions (only when expanded) */}
        {!collapsed && (
          <div className="px-3 py-4 border-b border-imperial-gold/10">
            <div className="flex gap-2">
              <motion.button
                className="quick-action flex-1 justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Search className="h-4 w-4" />
                <span className="text-xs">Buscar</span>
              </motion.button>
              <motion.button
                className="quick-action-primary quick-action justify-center px-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {!collapsed && (
              <div className="flex items-center gap-2 mb-3 px-3">
                <Cpu className="h-3 w-3 text-imperial-gold/40" />
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-imperial-gold/40">
                  Modulos
                </h4>
              </div>
            )}
            {mainNavItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <NavLink item={item} />
              </motion.div>
            ))}
          </div>

          {/* Energy separator */}
          <div className="my-4 energy-separator" />

          <div className="space-y-1">
            {!collapsed && (
              <div className="flex items-center gap-2 mb-3 px-3">
                <Settings className="h-3 w-3 text-imperial-gold/40" />
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-imperial-gold/40">
                  Sistema
                </h4>
              </div>
            )}
            {secondaryNavItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <NavLink item={item} />
              </motion.div>
            ))}
          </div>

          {/* Quick Links (only when expanded) */}
          {!collapsed && (
            <>
              <div className="my-4 energy-separator" />
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-3 px-3">
                  <Globe className="h-3 w-3 text-necron-teal/40" />
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-necron-teal/40">
                    Portal
                  </h4>
                </div>
                {quickLinks.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      target={item.external ? '_blank' : undefined}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-bone/40 hover:bg-necron-teal/5 hover:text-necron-teal transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t border-imperial-gold/10 p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              'w-full justify-center text-bone/40 hover:text-imperial-gold hover:bg-imperial-gold/5',
              !collapsed && 'justify-start'
            )}
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.div>
            {!collapsed && <span className="ml-2 text-sm">Minimizar</span>}
          </Button>
        </div>

        {/* User Section */}
        <div className="border-t border-imperial-gold/10 p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-imperial-gold/5',
                  collapsed && 'justify-center'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative">
                  <Avatar className="h-9 w-9 border-2 border-imperial-gold/30">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-imperial-gold to-imperial-gold/60 text-void-dark text-sm font-bold">
                      {profile?.username?.slice(0, 2).toUpperCase() || 'AD'}
                    </AvatarFallback>
                  </Avatar>
                  <motion.span
                    className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-void-dark bg-necron-teal"
                    animate={{
                      boxShadow: [
                        '0 0 4px rgba(13, 155, 138, 0.5)',
                        '0 0 8px rgba(13, 155, 138, 0.8)',
                        '0 0 4px rgba(13, 155, 138, 0.5)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                {!collapsed && (
                  <div className="flex flex-1 flex-col items-start text-left min-w-0">
                    <span className="text-sm font-medium text-bone truncate w-full">
                      {profile?.display_name || profile?.username || 'Comandante'}
                    </span>
                    <span className="text-[10px] text-imperial-gold/60 font-mono uppercase tracking-wider">
                      {profile?.role === 'admin' ? 'ALTO MANDO' : 'OFICIAL'}
                    </span>
                  </div>
                )}
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="right"
              align="end"
              sideOffset={8}
              className="w-56 bg-void-light/95 backdrop-blur-xl border-imperial-gold/20"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-bone">
                    {profile?.display_name || profile?.username}
                  </p>
                  <p className="text-[10px] text-imperial-gold/60 font-mono">
                    {profile?.role === 'admin' ? 'ADMINISTRADOR IMPERIAL' : 'MODERADOR'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-imperial-gold/10" />
              <DropdownMenuItem asChild className="text-bone/70 focus:text-bone focus:bg-imperial-gold/5">
                <Link href={`/usuarios/${profile?.username}`} className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Ver mi perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-bone/70 focus:text-bone focus:bg-imperial-gold/5">
                <Link href="/perfil" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configuracion
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-imperial-gold/10" />
              <DropdownMenuItem asChild className="text-bone/70 focus:text-bone focus:bg-imperial-gold/5">
                <Link href="/" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Volver al portal
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-imperial-gold/10" />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-blood-red focus:text-blood-red focus:bg-blood-red/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Desconectar terminal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </TooltipProvider>
  )
}
