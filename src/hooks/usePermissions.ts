'use client'

import { useMemo } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import type { UserRole, CreatorStatus } from '@/lib/types/database.types'

interface UsePermissionsReturn {
  isAdmin: boolean
  isModerator: boolean
  isCreator: boolean
  isStoreOwner: boolean
  hasDashboardAccess: boolean
  displayRole: { name: string; type: 'role' | 'creator' | 'store' } | null
  isLoading: boolean
}

export function usePermissions(): UsePermissionsReturn {
  const { profile, isLoading } = useAuth()

  const permissions = useMemo(() => {
    if (!profile) {
      return {
        isAdmin: false,
        isModerator: false,
        isCreator: false,
        isStoreOwner: false,
        hasDashboardAccess: false,
        displayRole: null,
      }
    }

    const role = (profile.role as UserRole) || 'user'
    const creatorStatus = (profile.creator_status as CreatorStatus) || 'none'
    const isStoreOwner = profile.is_store_owner || false

    const isAdmin = role === 'admin'
    const isModerator = role === 'moderator' || role === 'admin'
    const isCreator = creatorStatus === 'approved'
    const hasDashboardAccess = isAdmin || isModerator

    // Determine display role
    let displayRole: { name: string; type: 'role' | 'creator' | 'store' } | null = null
    if (isAdmin) {
      displayRole = { name: 'Lord Inquisidor', type: 'role' }
    } else if (role === 'moderator') {
      displayRole = { name: 'Comisario', type: 'role' }
    } else if (isCreator) {
      displayRole = { name: 'Rememorizador', type: 'creator' }
    } else if (isStoreOwner) {
      displayRole = { name: 'Rogue Trader', type: 'store' }
    }

    return {
      isAdmin,
      isModerator,
      isCreator,
      isStoreOwner,
      hasDashboardAccess,
      displayRole,
    }
  }, [profile])

  return {
    ...permissions,
    isLoading,
  }
}
