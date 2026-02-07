import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import type { ReactNode } from 'react'

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-void flex flex-col">
      <Navigation />
      <main className="flex-1 relative">
        {children}
      </main>
      <Footer />
    </div>
  )
}
