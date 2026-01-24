import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FORGE OF WAR | Tienda Warhammer',
  description: 'En la oscuridad del lejano futuro, solo existe la guerra. Tu tienda de Warhammer 40k.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  )
}
