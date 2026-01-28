import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { checkServerPermissions } from '@/lib/permissions.server'
import DashboardHome from './components/DashboardHome'

async function getStats() {
  const supabase = await createClient()

  const [
    profilesResult,
    miniaturesResult,
    listingsResult,
    storesResult,
    pendingStoresResult,
    pendingCreatorsResult,
    pendingReportsResult,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('miniatures').select('id', { count: 'exact', head: true }),
    supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('stores').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('stores').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('creator_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  return {
    totalUsers: profilesResult.count || 0,
    totalMiniatures: miniaturesResult.count || 0,
    activeListings: listingsResult.count || 0,
    totalStores: storesResult.count || 0,
    totalEvents: 0, // TODO: Add events table
    pendingStores: pendingStoresResult.count || 0,
    pendingCreators: pendingCreatorsResult.count || 0,
    pendingReports: pendingReportsResult.count || 0,
  }
}

async function getUserPermissions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, creator_status, creator_type, is_store_owner')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  return checkServerPermissions(profile)
}

export default async function DashboardPage() {
  const [stats, permissions] = await Promise.all([
    getStats(),
    getUserPermissions(),
  ])

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardHome stats={stats} permissions={permissions} />
    </Suspense>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 bg-bone/10 rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-32 bg-bone/5 border border-bone/10 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  )
}
