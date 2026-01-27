'use client'

import { ReactNode } from 'react'
import { ToastProvider } from '@/components/ui'
import { AuthProvider } from '@/lib/hooks/useAuth'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  )
}
