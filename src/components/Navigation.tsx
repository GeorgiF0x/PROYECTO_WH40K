'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/hooks/useAuth'
import { Avatar } from '@/components/ui'
import {
  User,
  Users,
  LogOut,
  Image,
  Store,
  Bell,
  Settings,
  ChevronDown,
  Sword,
  Sparkles,
  Home,
  Palette,
  Scale,
  Shield,
} from 'lucide-react'

// Dynamic import for Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

// Inline Lottie animation data for login icon (sword/enter effect)
const loginAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  layers: [{
    ty: 4,
    nm: "arrow",
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: { a: 0, k: 0 },
      p: { a: 1, k: [
        { t: 0, s: [30, 50], e: [50, 50], i: { x: 0.4, y: 1 }, o: { x: 0.6, y: 0 } },
        { t: 30, s: [50, 50], e: [30, 50], i: { x: 0.4, y: 1 }, o: { x: 0.6, y: 0 } },
        { t: 60, s: [30, 50] }
      ]},
      s: { a: 0, k: [100, 100] }
    },
    shapes: [{
      ty: "gr",
      it: [
        { ty: "rc", d: 1, s: { a: 0, k: [30, 6] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 3 } },
        { ty: "fl", c: { a: 0, k: [1, 0.84, 0.2, 1] }, o: { a: 0, k: 100 } },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
      ]
    }, {
      ty: "gr",
      it: [
        { ty: "sr", sy: 1, d: 1, pt: { a: 0, k: 3 }, p: { a: 0, k: [20, 0] }, r: { a: 0, k: 0 }, or: { a: 0, k: 8 }, os: { a: 0, k: 0 }, ix: 1 },
        { ty: "fl", c: { a: 0, k: [1, 0.84, 0.2, 1] }, o: { a: 0, k: 100 } },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 90 }, o: { a: 0, k: 100 } }
      ]
    }]
  }, {
    ty: 4,
    nm: "door",
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      p: { a: 0, k: [65, 50] }
    },
    shapes: [{
      ty: "gr",
      it: [
        { ty: "rc", d: 1, s: { a: 0, k: [6, 40] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 2 } },
        { ty: "fl", c: { a: 0, k: [0.9, 0.9, 0.95, 1] }, o: { a: 0, k: 60 } },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
      ]
    }]
  }]
}

// Sparkle burst animation
const sparkleAnimation = {
  v: "5.7.4",
  fr: 60,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  layers: [{
    ty: 4,
    nm: "sparkles",
    sr: 1,
    ks: { o: { a: 0, k: 100 }, p: { a: 0, k: [50, 50] } },
    shapes: [
      ...[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => ({
        ty: "gr",
        it: [
          { ty: "el", s: { a: 1, k: [
            { t: 0, s: [0, 0], e: [6, 6], i: { x: 0.4, y: 1 }, o: { x: 0.6, y: 0 } },
            { t: 20, s: [6, 6], e: [0, 0], i: { x: 0.4, y: 1 }, o: { x: 0.6, y: 0 } },
            { t: 40, s: [0, 0] }
          ]}, p: { a: 0, k: [0, 0] } },
          { ty: "fl", c: { a: 0, k: [1, 0.84, 0.2, 1] }, o: { a: 1, k: [
            { t: 0, s: [100], e: [100] },
            { t: 20, s: [100], e: [0] },
            { t: 40, s: [0] }
          ]} },
          { ty: "tr",
            p: { a: 1, k: [
              { t: 0, s: [0, 0], e: [Math.cos(angle * Math.PI / 180) * 30, Math.sin(angle * Math.PI / 180) * 30], i: { x: 0.2, y: 1 }, o: { x: 0.8, y: 0 } },
              { t: 40, s: [Math.cos(angle * Math.PI / 180) * 30, Math.sin(angle * Math.PI / 180) * 30] }
            ]},
            s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }
          }
        ]
      }))
    ]
  }]
}

const navLinks = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/galeria', label: 'Galería', icon: Palette },
  { href: '/usuarios', label: 'Usuarios', icon: Users },
  { href: '/mercado', label: 'Mercado', icon: Scale },
  { href: '/facciones', label: 'Facciones', icon: Shield },
]

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [isButtonHovered, setIsButtonHovered] = useState(false)
  const { profile, isLoading, isAuthenticated, signOut } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setUserMenuOpen(false)
  }

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'fixed top-0 left-0 w-full z-50 transition-all duration-500',
        scrolled
          ? 'py-3 bg-void/80 backdrop-blur-xl border-b border-imperial-gold/10'
          : 'bg-transparent py-5'
      )}
    >
      {/* Animated top border on scroll */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-imperial-gold to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{
          scaleX: scrolled ? 1 : 0,
          opacity: scrolled ? 1 : 0
        }}
        transition={{ duration: 0.5 }}
      />

      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <motion.div
            className="flex items-center gap-3 cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Hexagonal Logo - static with pulsing glow */}
            <div className="relative w-11 h-11">
              {/* Outer hexagon with gradient */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-imperial-gold via-yellow-500 to-imperial-gold"
                style={{
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                }}
              />

              {/* Pulsing glow effect */}
              <motion.div
                className="absolute inset-0"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(201, 162, 39, 0.3)',
                    '0 0 30px rgba(201, 162, 39, 0.5)',
                    '0 0 15px rgba(201, 162, 39, 0.3)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                }}
              />

              {/* Inner dark layer */}
              <div
                className="absolute inset-[3px] bg-void"
                style={{
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                }}
              />

              {/* Inner gold layer */}
              <div
                className="absolute inset-[6px] bg-gradient-to-br from-imperial-gold/80 to-yellow-600/80"
                style={{
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                }}
              />
            </div>

            {/* Logo text */}
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg font-bold tracking-[0.2em] text-bone group-hover:text-white transition-colors">
                FORGE
              </span>
              <span className="font-display text-sm font-bold tracking-[0.3em] text-imperial-gold">
                OF WAR
              </span>
            </div>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link, index) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              onHoverStart={() => setHoveredLink(link.href)}
              onHoverEnd={() => setHoveredLink(null)}
            >
              <Link
                href={link.href}
                className="relative px-4 py-2 font-body text-sm font-medium text-bone/70 hover:text-white transition-colors group"
              >
                {/* Hover background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-imperial-gold/0 via-imperial-gold/10 to-imperial-gold/0 rounded-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: hoveredLink === link.href ? 1 : 0,
                    scale: hoveredLink === link.href ? 1 : 0.8
                  }}
                  transition={{ duration: 0.2 }}
                />

                <span className="relative flex items-center gap-2">
                  <motion.span
                    className="flex items-center justify-center"
                    animate={{
                      scale: hoveredLink === link.href ? [1, 1.2, 1] : 1,
                      rotate: hoveredLink === link.href ? [0, 10, -10, 0] : 0,
                      color: hoveredLink === link.href ? '#C9A227' : 'inherit'
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    <link.icon className="w-4 h-4" />
                  </motion.span>
                  {link.label}
                </span>

                {/* Underline effect */}
                <motion.div
                  className="absolute -bottom-1 left-1/2 h-[2px] bg-gradient-to-r from-transparent via-imperial-gold to-transparent"
                  initial={{ width: 0, x: '-50%' }}
                  animate={{
                    width: hoveredLink === link.href ? '80%' : '0%',
                    x: '-50%'
                  }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </motion.div>
          ))}

          {/* Divider */}
          <div className="w-px h-6 bg-gradient-to-b from-transparent via-bone/20 to-transparent mx-2" />

          {/* User Menu */}
          <div className="ml-2 relative">
            {isLoading ? (
              <div className="w-10 h-10 rounded-full bg-bone/10 animate-pulse" />
            ) : isAuthenticated ? (
              <>
                <motion.button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full border border-transparent hover:border-imperial-gold/30 hover:bg-imperial-gold/5 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative">
                    <Avatar
                      src={profile?.avatar_url}
                      alt={profile?.display_name || profile?.username || 'Usuario'}
                      fallback={profile?.username}
                      size="sm"
                    />
                    {/* Online indicator */}
                    <motion.div
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-void"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <motion.div
                    animate={{ rotate: userMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-bone/60" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      {/* Backdrop */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />

                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 mt-3 w-64 py-2 bg-void-light/95 backdrop-blur-xl border border-bone/10 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden"
                      >
                        {/* Decorative top gradient */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-imperial-gold via-yellow-500 to-imperial-gold" />

                        <div className="px-4 py-3 border-b border-bone/10">
                          <p className="text-sm font-semibold text-bone truncate">
                            {profile?.display_name || profile?.username}
                          </p>
                          <p className="text-xs text-bone/50 truncate">
                            @{profile?.username}
                          </p>
                        </div>

                        <div className="py-2">
                          {[
                            { href: `/usuarios/${profile?.username}`, icon: User, label: 'Mi Perfil' },
                            { href: '/mi-galeria', icon: Image, label: 'Mis Miniaturas' },
                            { href: '/mercado/mis-anuncios', icon: Store, label: 'Mis Anuncios' },
                            { href: '/notificaciones', icon: Bell, label: 'Notificaciones', badge: 3 },
                            { href: '/perfil', icon: Settings, label: 'Configuración' },
                          ].map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-bone/70 hover:text-bone hover:bg-imperial-gold/10 transition-colors group"
                            >
                              <item.icon className="w-4 h-4 group-hover:text-imperial-gold transition-colors" />
                              <span className="flex-1">{item.label}</span>
                              {item.badge && (
                                <span className="px-2 py-0.5 text-xs font-bold bg-blood text-white rounded-full">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>

                        <div className="border-t border-bone/10 pt-2">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Cerrar Sesión
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </>
            ) : (
              /* Spectacular Login Button */
              <Link href="/login">
                <motion.button
                  className="relative group overflow-hidden"
                  onHoverStart={() => setIsButtonHovered(true)}
                  onHoverEnd={() => setIsButtonHovered(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Animated border */}
                  <motion.div
                    className="absolute -inset-[1px] rounded-lg"
                    style={{
                      background: 'linear-gradient(90deg, #C9A227, #FFD700, #C9A227, #FFD700)',
                      backgroundSize: '300% 100%',
                    }}
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />

                  {/* Button content */}
                  <div className="relative flex items-center gap-3 px-5 py-2.5 bg-void rounded-lg">
                    {/* Lottie icon */}
                    <div className="w-5 h-5 relative">
                      <Lottie
                        animationData={loginAnimation}
                        loop={true}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>

                    <span className="font-display font-bold tracking-wider text-sm text-imperial-gold group-hover:text-white transition-colors">
                      ENTRAR
                    </span>

                    {/* Sparkle effect on hover */}
                    <AnimatePresence>
                      {isButtonHovered && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className="absolute -right-1 -top-1 w-8 h-8"
                        >
                          <Lottie
                            animationData={sparkleAnimation}
                            loop={false}
                            style={{ width: '100%', height: '100%' }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    animate={{
                      boxShadow: isButtonHovered
                        ? '0 0 30px rgba(201, 162, 39, 0.6), 0 0 60px rgba(201, 162, 39, 0.3)'
                        : '0 0 15px rgba(201, 162, 39, 0.3)'
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          className="md:hidden relative w-10 h-10 flex items-center justify-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          whileTap={{ scale: 0.95 }}
        >
          <div className="relative w-6 h-5 flex flex-col justify-between">
            <motion.span
              className="w-full h-0.5 bg-imperial-gold block origin-center"
              animate={mobileMenuOpen
                ? { rotate: 45, y: 9 }
                : { rotate: 0, y: 0 }
              }
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="w-full h-0.5 bg-imperial-gold block"
              animate={mobileMenuOpen
                ? { opacity: 0, scaleX: 0 }
                : { opacity: 1, scaleX: 1 }
              }
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="w-full h-0.5 bg-imperial-gold block origin-center"
              animate={mobileMenuOpen
                ? { rotate: -45, y: -9 }
                : { rotate: 0, y: 0 }
              }
              transition={{ duration: 0.2 }}
            />
          </div>
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden"
          >
            <div className="bg-void/95 backdrop-blur-xl border-t border-imperial-gold/20 mt-3">
              <div className="px-6 py-6 space-y-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className="flex items-center gap-3 py-3 px-4 rounded-lg font-body text-lg text-bone hover:text-imperial-gold hover:bg-imperial-gold/10 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <link.icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile User Section */}
                <div className="pt-4 mt-4 border-t border-bone/10">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 py-3 px-4">
                        <Avatar
                          src={profile?.avatar_url}
                          alt={profile?.display_name || profile?.username || 'Usuario'}
                          fallback={profile?.username}
                          size="md"
                        />
                        <div>
                          <p className="font-semibold text-bone">
                            {profile?.display_name || profile?.username}
                          </p>
                          <p className="text-sm text-bone/50">@{profile?.username}</p>
                        </div>
                      </div>

                      {[
                        { href: `/usuarios/${profile?.username}`, icon: User, label: 'Mi Perfil' },
                        { href: '/mi-galeria', icon: Image, label: 'Mis Miniaturas' },
                        { href: '/perfil', icon: Settings, label: 'Configuración' },
                      ].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 py-3 px-4 rounded-lg text-bone/70 hover:text-imperial-gold hover:bg-imperial-gold/10 transition-all"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </Link>
                      ))}

                      <button
                        onClick={() => {
                          handleSignOut()
                          setMobileMenuOpen(false)
                        }}
                        className="flex items-center gap-3 w-full py-3 px-4 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <motion.button
                        className="w-full relative overflow-hidden rounded-lg"
                        whileTap={{ scale: 0.98 }}
                      >
                        <motion.div
                          className="absolute inset-0"
                          style={{
                            background: 'linear-gradient(90deg, #C9A227, #FFD700, #C9A227)',
                            backgroundSize: '200% 100%',
                          }}
                          animate={{
                            backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                        <div className="relative flex items-center justify-center gap-3 py-4 font-display font-bold tracking-wider text-void">
                          <Sparkles className="w-5 h-5" />
                          ENTRAR AL FORGE
                        </div>
                      </motion.button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
