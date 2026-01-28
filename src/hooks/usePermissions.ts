'use client'

import { useMemo } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  buildUserPermissions,
  hasPermission,
  hasDashboardAccess,
  getAccessibleDashboardSections,
  getDisplayRole,
  getUserBadges,
  type UserPermissions,
  type Permission,
} from '@/lib/permissions'
import type { UserRole, CreatorStatus, CreatorType } from '@/lib/types/database.types'

interface UsePermissionsReturn {
  // Full permissions object
  permissions: UserPermissions | null

  // Quick access helpers
  isAdmin: boolean
  isModerator: boolean
  isCreator: boolean
  isStoreOwner: boolean
  hasDashboardAccess: boolean

  // Permission checks
  can: (permission: Permission) => boolean
  canAccessDashboard: boolean

  // Display helpers
  displayRole: ReturnType<typeof getDisplayRole> | null
  badges: ReturnType<typeof getUserBadges>

  // Dashboard sections
  accessibleSections: ReturnType<typeof getAccessibleDashboardSections>

  // Loading state
  isLoading: boolean
}

export function usePermissions(): UsePermissionsReturn {
  const { user, profile, isLoading } = useAuth()

  const permissions = useMemo(() => {
    if (!user || !profile) return null

    // Default values for backwards compatibility
    const role: UserRole = (profile.role as UserRole) || 'user'
    const creatorStatus: CreatorStatus = (profile.creator_status as CreatorStatus) || 'none'
    const creatorType: CreatorType | null = profile.creator_type as CreatorType | null
    const isStoreOwner: boolean = profile.is_store_owner || false

    return buildUserPermissions(role, creatorStatus, creatorType, isStoreOwner)
  }, [user, profile])

  const displayRole = useMemo(() => {
    if (!permissions || !profile) return null
    return getDisplayRole(
      permissions.role,
      (profile.creator_status as CreatorStatus) || 'none',
      profile.is_store_owner || false
    )
  }, [permissions, profile])

  const badges = useMemo(() => {
    if (!permissions || !profile) return []
    return getUserBadges(
      permissions.role,
      (profile.creator_status as CreatorStatus) || 'none',
      profile.is_store_owner || false
    )
  }, [permissions, profile])

  const accessibleSections = useMemo(() => {
    if (!permissions) return []
    return getAccessibleDashboardSections(permissions)
  }, [permissions])

  const can = (permission: Permission): boolean => {
    if (!permissions) return false
    return hasPermission(permissions.role, permission)
  }

  return {
    permissions,
    isAdmin: permissions?.isAdmin || false,
    isModerator: permissions?.isModerator || false,
    isCreator: permissions?.isCreator || false,
    isStoreOwner: permissions?.isStoreOwner || false,
    hasDashboardAccess: permissions?.hasDashboardAccess || false,
    can,
    canAccessDashboard: permissions?.hasDashboardAccess || false,
    displayRole,
    badges,
    accessibleSections,
    isLoading,
  }
}
