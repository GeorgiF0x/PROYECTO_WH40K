import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import type { ReactNode } from 'react'

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-void">
      <Navigation />
      <main className="relative flex-1">{children}</main>
      <Footer />
    </div>
  )
}
