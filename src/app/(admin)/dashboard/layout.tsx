'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './components/Sidebar'
import { useAuth } from '@/lib/hooks/useAuth'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { user, profile, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  // Check if user has admin/moderator access
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard')
    }

    if (!isLoading && profile && profile.role !== 'admin' && profile.role !== 'moderator') {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, profile, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="dashboard-root dark flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (!isAuthenticated || (profile && profile.role !== 'admin' && profile.role !== 'moderator')) {
    return null
  }

  return (
    <div className="dashboard-root dark flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main
        className={cn(
          'flex-1 overflow-y-auto transition-all duration-300',
          sidebarCollapsed ? 'ml-0' : 'ml-0'
        )}
      >
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
