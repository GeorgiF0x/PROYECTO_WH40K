import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import type { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-void">
      <Navigation />
      <main className="relative flex-1">
        <div className="container mx-auto max-w-4xl px-4 pb-8 pt-20">{children}</div>
      </main>
      <Footer />
    </div>
  )
}
