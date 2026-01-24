'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const footerLinks = {
  tienda: [
    { label: 'Todas las Miniaturas', href: '#' },
    { label: 'Pinturas y Herramientas', href: '#' },
    { label: 'Ofertas', href: '#' },
    { label: 'Novedades', href: '#' },
  ],
  facciones: [
    { label: 'Imperium', href: '/facciones/imperium' },
    { label: 'Chaos', href: '/facciones/chaos' },
    { label: 'Necrons', href: '/facciones/necrons' },
  ],
  info: [
    { label: 'Sobre Nosotros', href: '#' },
    { label: 'Envíos', href: '#' },
    { label: 'Devoluciones', href: '#' },
    { label: 'Contacto', href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="relative bg-void-light/50 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <div className="relative w-10 h-10">
                <div
                  className="absolute inset-0 bg-gradient-to-br from-imperial-gold to-yellow-600"
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  }}
                />
                <div
                  className="absolute inset-1 bg-void-light"
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  }}
                />
                <div
                  className="absolute inset-2 bg-gradient-to-br from-imperial-gold/80 to-yellow-600/80"
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  }}
                />
              </div>
              <span className="font-display text-xl font-bold text-white">
                FORGE <span className="text-imperial-gold">OF WAR</span>
              </span>
            </Link>
            <p className="font-body text-bone/60 leading-relaxed mb-6">
              Tu tienda de confianza para Warhammer 40,000. Miniaturas, pinturas
              y todo lo que necesitas para el hobby.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              {['twitter', 'instagram', 'youtube'].map((social) => (
                <motion.a
                  key={social}
                  href="#"
                  whileHover={{ scale: 1.1, color: '#C9A227' }}
                  className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-bone/60 hover:bg-white/10 transition-colors"
                >
                  <span className="sr-only">{social}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    {social === 'twitter' && (
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    )}
                    {social === 'instagram' && (
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    )}
                    {social === 'youtube' && (
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    )}
                  </svg>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-sm font-bold text-white tracking-wider uppercase mb-6">
              Tienda
            </h4>
            <ul className="space-y-3">
              {footerLinks.tienda.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-body text-bone/60 hover:text-imperial-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold text-white tracking-wider uppercase mb-6">
              Facciones
            </h4>
            <ul className="space-y-3">
              {footerLinks.facciones.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-body text-bone/60 hover:text-imperial-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold text-white tracking-wider uppercase mb-6">
              Información
            </h4>
            <ul className="space-y-3">
              {footerLinks.info.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-body text-bone/60 hover:text-imperial-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <p className="font-body text-sm text-bone/40">
              © 2025 Forge of War. Todos los derechos reservados.
            </p>
            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="font-body text-xs text-bone/50">Sistema Online</span>
            </div>
          </div>
          <p className="font-body text-xs text-bone/30">
            Warhammer 40,000 es una marca registrada de Games Workshop Ltd.
          </p>
        </div>
      </div>
    </footer>
  )
}
