/**
 * Permission System - Warhammer Forge
 *
 * Hierarchical Roles:
 * - admin (Lord Inquisidor): Full system access
 * - moderator (Comisario): Content moderation, approve stores/creators
 * - user: Basic user access
 *
 * Special Attributes:
 * - creator (Rememorizador): Approved content creator
 * - store_owner (Rogue Trader): Has approved store(s)
 */

import type { UserRole, CreatorStatus, CreatorType } from '@/lib/types/database.types'

// Permission constants
export const ROLES = {
  ADMIN: 'admin' as UserRole,
  MODERATOR: 'moderator' as UserRole,
  USER: 'user' as UserRole,
} as const

// Role hierarchy levels (higher = more permissions)
const ROLE_LEVELS: Record<UserRole, number> = {
  user: 0,
  moderator: 1,
  admin: 2,
}

// Thematic role names (for display)
export const ROLE_DISPLAY_NAMES: Record<UserRole, { name: string; title: string; icon: string }> = {
  admin: {
    name: 'Lord Inquisidor',
    title: 'Autoridad Suprema del Ordo Hereticus',
    icon: '/icons/Imperium/Inquisition 2 [Imperium].svg',
  },
  moderator: {
    name: 'Comisario',
    title: 'Guardián del Orden Imperial',
    icon: '/icons/Imperium/Adeptus Arbites [Imperium].svg',
  },
  user: {
    name: 'Ciudadano Imperial',
    title: 'Servidor del Trono Dorado',
    icon: '/icons/Imperium/Imperial Aquila [Imperium].svg',
  },
}

// Special attribute display names
export const ATTRIBUTE_DISPLAY_NAMES = {
  creator: {
    name: 'Rememorizador',
    title: 'Cronista del Imperium',
    icon: '/icons/Imperium/librarius-01.svg',
  },
  store_owner: {
    name: 'Rogue Trader',
    title: 'Mercader de las Estrellas',
    icon: '/icons/Imperium/Rogue Traders [Imperium, Astra Cartographica].svg',
  },
}

// Permission definitions
export type Permission =
  | 'manage_users'        // Admin only: Ban/unban users, change roles
  | 'manage_stores'       // Mod+: Approve/reject stores
  | 'manage_creators'     // Mod+: Approve/reject creator applications
  | 'manage_events'       // Mod+: Approve/reject/feature events
  | 'manage_listings'     // Mod+: Remove listings, ban sellers
  | 'manage_reports'      // Mod+: View and resolve reports
  | 'manage_content'      // Mod+: Edit/delete any miniature, comment, article
  | 'view_analytics'      // Admin only: Access analytics dashboard
  | 'system_settings'     // Admin only: Change system settings

// Permission to minimum role mapping
const PERMISSION_REQUIREMENTS: Record<Permission, UserRole> = {
  manage_users: 'admin',
  manage_stores: 'moderator',
  manage_creators: 'moderator',
  manage_events: 'moderator',
  manage_listings: 'moderator',
  manage_reports: 'moderator',
  manage_content: 'moderator',
  view_analytics: 'admin',
  system_settings: 'admin',
}

// User permissions interface
export interface UserPermissions {
  role: UserRole
  isAdmin: boolean
  isModerator: boolean
  isCreator: boolean
  isStoreOwner: boolean
  hasDashboardAccess: boolean
  creatorType: CreatorType | null
  permissions: Permission[]
}

// Check if role meets minimum requirement
export function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole]
}

// Check if user is admin
export function isAdmin(role: UserRole): boolean {
  return role === 'admin'
}

// Check if user is moderator or higher
export function isModeratorOrAbove(role: UserRole): boolean {
  return hasMinimumRole(role, 'moderator')
}

// Check specific permission
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const requiredRole = PERMISSION_REQUIREMENTS[permission]
  return hasMinimumRole(role, requiredRole)
}

// Check if user has dashboard access
export function hasDashboardAccess(
  role: UserRole,
  creatorStatus: CreatorStatus,
  isStoreOwner: boolean
): boolean {
  return (
    isModeratorOrAbove(role) ||
    creatorStatus === 'approved' ||
    isStoreOwner
  )
}

// Get all permissions for a role
export function getPermissionsForRole(role: UserRole): Permission[] {
  return (Object.entries(PERMISSION_REQUIREMENTS) as [Permission, UserRole][])
    .filter(([_, requiredRole]) => hasMinimumRole(role, requiredRole))
    .map(([permission]) => permission)
}

// Build full user permissions object
export function buildUserPermissions(
  role: UserRole,
  creatorStatus: CreatorStatus,
  creatorType: CreatorType | null,
  isStoreOwner: boolean
): UserPermissions {
  return {
    role,
    isAdmin: isAdmin(role),
    isModerator: isModeratorOrAbove(role),
    isCreator: creatorStatus === 'approved',
    isStoreOwner,
    hasDashboardAccess: hasDashboardAccess(role, creatorStatus, isStoreOwner),
    creatorType,
    permissions: getPermissionsForRole(role),
  }
}

// Get display role/badge for user (highest priority)
export function getDisplayRole(
  role: UserRole,
  creatorStatus: CreatorStatus,
  isStoreOwner: boolean
): { name: string; title: string; icon: string; type: 'role' | 'creator' | 'store' } {
  // Admin and moderator roles take priority
  if (role === 'admin' || role === 'moderator') {
    return { ...ROLE_DISPLAY_NAMES[role], type: 'role' }
  }

  // Then creator status
  if (creatorStatus === 'approved') {
    return { ...ATTRIBUTE_DISPLAY_NAMES.creator, type: 'creator' }
  }

  // Then store owner
  if (isStoreOwner) {
    return { ...ATTRIBUTE_DISPLAY_NAMES.store_owner, type: 'store' }
  }

  // Default user
  return { ...ROLE_DISPLAY_NAMES.user, type: 'role' }
}

// Get all badges for a user (can have multiple)
export function getUserBadges(
  role: UserRole,
  creatorStatus: CreatorStatus,
  isStoreOwner: boolean
): Array<{ name: string; title: string; icon: string; type: 'role' | 'creator' | 'store' }> {
  const badges: Array<{ name: string; title: string; icon: string; type: 'role' | 'creator' | 'store' }> = []

  // Add role badge if mod or admin
  if (role === 'admin' || role === 'moderator') {
    badges.push({ ...ROLE_DISPLAY_NAMES[role], type: 'role' })
  }

  // Add creator badge
  if (creatorStatus === 'approved') {
    badges.push({ ...ATTRIBUTE_DISPLAY_NAMES.creator, type: 'creator' })
  }

  // Add store owner badge
  if (isStoreOwner) {
    badges.push({ ...ATTRIBUTE_DISPLAY_NAMES.store_owner, type: 'store' })
  }

  return badges
}

// Dashboard sections configuration
export interface DashboardSection {
  id: string
  name: string
  description: string
  icon: string
  href: string
  requiredRole?: UserRole
  requiredAttribute?: 'creator' | 'store_owner'
  permissions?: Permission[]
}

export const DASHBOARD_SECTIONS: DashboardSection[] = [
  {
    id: 'overview',
    name: 'Visión General',
    description: 'Panel principal del dashboard',
    icon: 'LayoutDashboard',
    href: '/dashboard',
  },
  {
    id: 'my-store',
    name: 'Mi Tienda',
    description: 'Gestiona tu tienda',
    icon: 'Store',
    href: '/dashboard/mi-tienda',
    requiredAttribute: 'store_owner',
  },
  {
    id: 'my-content',
    name: 'Mi Contenido',
    description: 'Gestiona tu contenido de creador',
    icon: 'Palette',
    href: '/dashboard/mi-contenido',
    requiredAttribute: 'creator',
  },
  {
    id: 'stores',
    name: 'Tiendas',
    description: 'Gestiona tiendas pendientes',
    icon: 'Building2',
    href: '/dashboard/tiendas',
    requiredRole: 'moderator',
    permissions: ['manage_stores'],
  },
  {
    id: 'creators',
    name: 'Creadores',
    description: 'Gestiona solicitudes de creadores',
    icon: 'Users',
    href: '/dashboard/creadores',
    requiredRole: 'moderator',
    permissions: ['manage_creators'],
  },
  {
    id: 'events',
    name: 'Eventos',
    description: 'Gestiona eventos',
    icon: 'Calendar',
    href: '/dashboard/eventos',
    requiredRole: 'moderator',
    permissions: ['manage_events'],
  },
  {
    id: 'reports',
    name: 'Reportes',
    description: 'Gestiona reportes de usuarios',
    icon: 'Flag',
    href: '/dashboard/reportes',
    requiredRole: 'moderator',
    permissions: ['manage_reports'],
  },
  {
    id: 'users',
    name: 'Usuarios',
    description: 'Administrar usuarios',
    icon: 'UserCog',
    href: '/dashboard/usuarios',
    requiredRole: 'admin',
    permissions: ['manage_users'],
  },
  {
    id: 'analytics',
    name: 'Analíticas',
    description: 'Estadísticas del sistema',
    icon: 'BarChart3',
    href: '/dashboard/analiticas',
    requiredRole: 'admin',
    permissions: ['view_analytics'],
  },
  {
    id: 'settings',
    name: 'Configuración',
    description: 'Configuración del sistema',
    icon: 'Settings',
    href: '/dashboard/configuracion',
    requiredRole: 'admin',
    permissions: ['system_settings'],
  },
]

// Get accessible dashboard sections for user
export function getAccessibleDashboardSections(
  userPermissions: UserPermissions
): DashboardSection[] {
  return DASHBOARD_SECTIONS.filter(section => {
    // Check role requirement
    if (section.requiredRole && !hasMinimumRole(userPermissions.role, section.requiredRole)) {
      return false
    }

    // Check attribute requirements
    if (section.requiredAttribute === 'creator' && !userPermissions.isCreator) {
      return false
    }
    if (section.requiredAttribute === 'store_owner' && !userPermissions.isStoreOwner) {
      return false
    }

    // Check permission requirements
    if (section.permissions) {
      const hasAllPermissions = section.permissions.every(p =>
        userPermissions.permissions.includes(p)
      )
      if (!hasAllPermissions) {
        return false
      }
    }

    return true
  })
}
