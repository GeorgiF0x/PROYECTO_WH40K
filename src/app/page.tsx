'use client'

import {
  Navigation,
  Hero,
  Factions,
  Products,
  Features,
  Newsletter,
  Footer,
} from '@/components'

export default function Home() {
  return (
    <main className="relative min-h-screen bg-void">
      {/* Noise Overlay */}
      <div className="noise-overlay" />

      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <Hero />

      {/* Factions Section */}
      <Factions />

      {/* Products Section */}
      <Products />

      {/* Features Section */}
      <Features />

      {/* Newsletter Section */}
      <Newsletter />

      {/* Footer */}
      <Footer />
    </main>
  )
}
