import { Navigation, Footer } from '@/components'
import type { ReactNode } from 'react'

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-void flex flex-col">
      <div className="noise-overlay" />
      <Navigation />
      <main className="flex-1 relative">
        {children}
      </main>
      <Footer />
    </div>
  )
}
