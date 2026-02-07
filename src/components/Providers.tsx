'use client'

import { ReactNode } from 'react'
import { LazyMotion, domAnimation } from 'framer-motion'
import { ToastProvider } from '@/components/ui'
import { AuthProvider } from '@/lib/hooks/useAuth'
import { SmoothScroll } from '@/components/SmoothScroll'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <AuthProvider>
        <ToastProvider>
          <SmoothScroll />
          {children}
        </ToastProvider>
      </AuthProvider>
    </LazyMotion>
  )
}
