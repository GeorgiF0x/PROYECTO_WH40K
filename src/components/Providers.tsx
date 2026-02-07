'use client'

import { ReactNode } from 'react'
import { LazyMotion, domAnimation } from 'framer-motion'
import { ToastProvider } from '@/components/ui'
import { AuthProvider } from '@/lib/hooks/useAuth'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </LazyMotion>
  )
}
