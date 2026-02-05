import { Navigation, Footer } from '@/components'
import type { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-void flex flex-col">
      <div className="noise-overlay" />
      <Navigation />
      <main className="flex-1 relative">
        <div className="container mx-auto px-4 pt-20 pb-8 max-w-4xl">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
