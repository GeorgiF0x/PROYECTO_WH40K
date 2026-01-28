/**
 * Server-side Permission Utilities
 * Use these functions in Server Components and API routes
 */

import {
  buildUserPermissions,
  type UserPermissions,
} from './permissions'
import type { UserRole, CreatorStatus, CreatorType } from '@/lib/types/database.types'

// Server-side permission check helper
export function checkServerPermissions(
  profile: {
    role?: UserRole | string
    creator_status?: CreatorStatus | string
    creator_type?: CreatorType | string | null
    is_store_owner?: boolean
  } | null
): UserPermissions | null {
  if (!profile) return null

  const role: UserRole = (profile.role as UserRole) || 'user'
  const creatorStatus: CreatorStatus = (profile.creator_status as CreatorStatus) || 'none'
  const creatorType: CreatorType | null = profile.creator_type as CreatorType | null
  const isStoreOwner: boolean = profile.is_store_owner || false

  return buildUserPermissions(role, creatorStatus, creatorType, isStoreOwner)
}
