'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
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
  Home,
  Search,
  FileText,
} from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './ui/command'
import {
  Dialog,
  DialogContent,
} from './ui/dialog'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const NAVIGATION_ITEMS = [
  {
    group: 'General',
    items: [
      { name: 'Panel General', href: '/dashboard', icon: LayoutDashboard, shortcut: '⌘1' },
      { name: 'Volver al Sitio', href: '/', icon: Home, shortcut: '⌘H' },
    ],
  },
  {
    group: 'Moderación',
    items: [
      { name: 'Gestión de Tiendas', href: '/dashboard/tiendas', icon: Store },
      { name: 'Solicitudes de Creadores', href: '/dashboard/creadores', icon: Palette },
      { name: 'Gestión de Eventos', href: '/dashboard/eventos', icon: Calendar },
      { name: 'Reportes', href: '/dashboard/reportes', icon: Flag },
    ],
  },
  {
    group: 'Administración',
    items: [
      { name: 'Gestión de Usuarios', href: '/dashboard/usuarios', icon: UserCog },
      { name: 'Analíticas', href: '/dashboard/analiticas', icon: BarChart3 },
      { name: 'Configuración', href: '/dashboard/configuracion', icon: Settings },
    ],
  },
  {
    group: 'Personal',
    items: [
      { name: 'Mi Tienda', href: '/dashboard/mi-tienda', icon: Building2 },
      { name: 'Mi Contenido', href: '/dashboard/mi-contenido', icon: FileText },
    ],
  },
]

const QUICK_ACTIONS = [
  { name: 'Buscar usuarios...', action: 'search-users', icon: Users },
  { name: 'Ver tiendas pendientes', action: 'pending-stores', icon: Store },
  { name: 'Ver reportes activos', action: 'active-reports', icon: Flag },
]

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  const runCommand = React.useCallback((command: () => void) => {
    onOpenChange(false)
    command()
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-lg max-w-xl">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-bone/50 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <CommandInput placeholder="Buscar páginas, acciones..." />
          <CommandList>
            <CommandEmpty>No se encontraron resultados.</CommandEmpty>

            {NAVIGATION_ITEMS.map((section) => (
              <CommandGroup key={section.group} heading={section.group}>
                {section.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <CommandItem
                      key={item.href}
                      value={item.name}
                      onSelect={() => runCommand(() => router.push(item.href))}
                    >
                      <Icon className="mr-2 h-4 w-4 text-bone/50" />
                      <span>{item.name}</span>
                      {item.shortcut && (
                        <CommandShortcut>{item.shortcut}</CommandShortcut>
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}

            <CommandSeparator />

            <CommandGroup heading="Acciones Rápidas">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon
                return (
                  <CommandItem
                    key={action.action}
                    value={action.name}
                    onSelect={() => {
                      runCommand(() => {
                        // Handle quick actions
                        if (action.action === 'search-users') {
                          router.push('/dashboard/usuarios')
                        } else if (action.action === 'pending-stores') {
                          router.push('/dashboard/tiendas?status=pending')
                        } else if (action.action === 'active-reports') {
                          router.push('/dashboard/reportes')
                        }
                      })
                    }}
                  >
                    <Icon className="mr-2 h-4 w-4 text-bone/50" />
                    <span>{action.name}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
