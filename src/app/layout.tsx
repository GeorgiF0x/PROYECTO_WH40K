import type { Metadata } from 'next'
import { Orbitron, Rajdhani, Exo_2 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Providers } from '@/components/Providers'
import { CookieConsent } from '@/components/legal'
import './globals.css'

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
})

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

const exo2 = Exo_2({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-accent',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Grimdark Legion | Comunidad Warhammer 40K',
  description: 'En la oscuridad del lejano futuro, solo existe la guerra. Comunidad de Warhammer 40k.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${orbitron.variable} ${rajdhani.variable} ${exo2.variable}`}>
      <head>
        <link rel="preconnect" href="https://yvjflhvbtjjmdwkgqqfs.supabase.co" />
        <link rel="preconnect" href="https://api.mapbox.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <div className="noise-overlay" />
        <Providers>
          {children}
          <CookieConsent />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
