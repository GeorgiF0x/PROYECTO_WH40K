'use client'

import { ReactNode } from 'react'
import { LazyMotion, domAnimation } from 'framer-motion'
import { ToastProvider } from '@/components/ui'
import { AuthProvider } from '@/lib/hooks/useAuth'
import { SmoothScroll } from '@/components/SmoothScroll'

// NOTE: `strict` mode on LazyMotion would require every child to use the short
// `m.*` components instead of `motion.*`. The rest of the codebase uses
// `motion.*` in dozens of files, so strict is disabled. LazyMotion still
// lazy-loads ~30KB of animation features on demand.
export function Providers({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <AuthProvider>
        <ToastProvider>
          <SmoothScroll />
          {children}
        </ToastProvider>
      </AuthProvider>
    </LazyMotion>
  )
}
