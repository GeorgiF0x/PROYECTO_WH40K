import dynamic from 'next/dynamic'
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'

const Factions = dynamic(() => import('@/components/Factions'))
const Products = dynamic(() => import('@/components/Products'))
const Features = dynamic(() => import('@/components/Features'))
const Newsletter = dynamic(() => import('@/components/Newsletter'))
const Footer = dynamic(() => import('@/components/Footer'))

export default function Home() {
  return (
    <main className="relative min-h-screen bg-void">
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
