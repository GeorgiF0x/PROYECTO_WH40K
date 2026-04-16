'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/hooks/useAuth'
import { useDeferredNotifications } from '@/lib/hooks/useNotifications'
import { useDeferredUnreadMessages } from '@/lib/hooks/useMessages'
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
  MessageCircle,
  MapPin,
  LayoutDashboard,
  BookOpen,
} from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'

// Dynamic import for Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

// Lottie animation data loaded lazily from public files
let _loginAnim: object | null = null
let _sparkleAnim: object | null = null

function useLottieData(path: string, cacheRef: 'login' | 'sparkle') {
  const [data, setData] = useState<object | null>(cacheRef === 'login' ? _loginAnim : _sparkleAnim)
  useEffect(() => {
    if (data) return
    fetch(path)
      .then((r) => r.json())
      .then((json) => {
        if (cacheRef === 'login') _loginAnim = json
        else _sparkleAnim = json
        setData(json)
      })
      .catch(() => {})
  }, [path, cacheRef, data])
  return data
}

const navLinks = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/galeria', label: 'Galería', icon: Palette },
  { href: '/comunidad', label: 'Comunidad', icon: MapPin },
  { href: '/wiki', label: 'Wiki', icon: BookOpen },
  { href: '/usuarios', label: 'Usuarios', icon: Users },
  { href: '/mercado', label: 'Mercado', icon: Scale },
  { href: '/mensajes', label: 'Mensajes', icon: MessageCircle },
  { href: '/facciones', label: 'Facciones', icon: Shield },
]

function LoginButton() {
  const [isHovered, setIsHovered] = useState(false)
  const loginAnim = useLottieData('/lottie/login.json', 'login')
  const sparkleAnim = useLottieData('/lottie/sparkle.json', 'sparkle')

  return (
    <Link href="/login">
      <motion.button
        className="group relative overflow-hidden"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
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
        <div className="relative flex items-center gap-3 rounded-lg bg-void px-5 py-2.5">
          {/* Lottie icon */}
          <div className="relative h-5 w-5">
            {loginAnim && (
              <Lottie
                animationData={loginAnim}
                loop={true}
                style={{ width: '100%', height: '100%' }}
              />
            )}
          </div>

          <span className="font-display text-sm font-bold tracking-wider text-imperial-gold transition-colors group-hover:text-white">
            ENTRAR
          </span>

          {/* Sparkle effect on hover */}
          <AnimatePresence>
            {isHovered && sparkleAnim && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute -right-1 -top-1 h-8 w-8"
              >
                <Lottie
                  animationData={sparkleAnim}
                  loop={false}
                  style={{ width: '100%', height: '100%' }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Glow effect */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-lg"
          animate={{
            boxShadow: isHovered
              ? '0 0 30px rgba(201, 162, 39, 0.6), 0 0 60px rgba(201, 162, 39, 0.3)'
              : '0 0 15px rgba(201, 162, 39, 0.3)',
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>
    </Link>
  )
}

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const { user, profile, isLoading, isAuthenticated, signOut } = useAuth()
  const { unreadCount } = useDeferredNotifications(user?.id)
  const { unreadCount: unreadMessages } = useDeferredUnreadMessages(user?.id)
  const { hasDashboardAccess, displayRole } = usePermissions()

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'fixed left-0 top-0 z-50 w-full transition-all duration-500',
        scrolled
          ? 'border-b border-imperial-gold/10 bg-void/80 py-3 backdrop-blur-xl'
          : 'bg-transparent py-5'
      )}
    >
      {/* Animated top border on scroll */}
      <motion.div
        className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-imperial-gold to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{
          scaleX: scrolled ? 1 : 0,
          opacity: scrolled ? 1 : 0,
        }}
        transition={{ duration: 0.5 }}
      />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/">
          <motion.div
            className="group flex cursor-pointer items-center gap-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Hexagonal Logo - static with pulsing glow */}
            <div className="relative h-11 w-11">
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
              <span className="font-display text-lg font-bold tracking-[0.2em] text-bone transition-colors group-hover:text-white">
                FORGE
              </span>
              <span className="font-display text-sm font-bold tracking-[0.3em] text-imperial-gold">
                OF WAR
              </span>
            </div>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-2 md:flex">
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
                className="group relative px-4 py-2 font-body text-sm font-medium text-bone/70 transition-colors hover:text-white"
              >
                {/* Hover background */}
                <motion.div
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-imperial-gold/0 via-imperial-gold/10 to-imperial-gold/0"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: hoveredLink === link.href ? 1 : 0,
                    scale: hoveredLink === link.href ? 1 : 0.8,
                  }}
                  transition={{ duration: 0.2 }}
                />

                <span className="relative flex items-center gap-2">
                  <motion.span
                    className="relative flex items-center justify-center"
                    animate={{
                      scale: hoveredLink === link.href ? [1, 1.2, 1] : 1,
                      rotate: hoveredLink === link.href ? [0, 10, -10, 0] : 0,
                      color: hoveredLink === link.href ? '#C9A227' : 'inherit',
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.href === '/mensajes' && unreadMessages > 0 && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blood text-[10px] font-bold text-white">
                        {unreadMessages > 9 ? '9+' : unreadMessages}
                      </span>
                    )}
                  </motion.span>
                  {link.label}
                </span>

                {/* Underline effect */}
                <motion.div
                  className="absolute -bottom-1 left-1/2 h-[2px] bg-gradient-to-r from-transparent via-imperial-gold to-transparent"
                  initial={{ width: 0, x: '-50%' }}
                  animate={{
                    width: hoveredLink === link.href ? '80%' : '0%',
                    x: '-50%',
                  }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </motion.div>
          ))}

          {/* Divider */}
          <div className="mx-2 h-6 w-px bg-gradient-to-b from-transparent via-bone/20 to-transparent" />

          {/* User Menu */}
          <div className="relative ml-2">
            {isLoading ? (
              <div className="h-10 w-10 animate-pulse rounded-full bg-bone/10" />
            ) : isAuthenticated ? (
              <>
                <motion.button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-full border border-transparent p-1.5 transition-all duration-300 hover:border-imperial-gold/30 hover:bg-imperial-gold/5"
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
                      className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-void bg-green-500"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <motion.div
                    animate={{ rotate: userMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 text-bone/60" />
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
                        className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-xl border border-bone/10 bg-void-light/95 py-2 shadow-2xl shadow-black/50 backdrop-blur-xl"
                      >
                        {/* Decorative top gradient */}
                        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-imperial-gold via-yellow-500 to-imperial-gold" />

                        <div className="border-b border-bone/10 px-4 py-3">
                          <p className="truncate text-sm font-semibold text-bone">
                            {profile?.display_name || profile?.username}
                          </p>
                          <p className="truncate text-xs text-bone/50">@{profile?.username}</p>
                          {displayRole && displayRole.type !== 'role' && (
                            <p className="mt-1 text-xs font-medium text-imperial-gold">
                              {displayRole.name}
                            </p>
                          )}
                        </div>

                        {/* Dashboard Link - Only for users with access */}
                        {hasDashboardAccess && (
                          <div className="border-b border-bone/10 py-2">
                            <Link
                              href="/dashboard"
                              onClick={() => setUserMenuOpen(false)}
                              className="group flex items-center gap-3 px-4 py-2.5 text-sm text-imperial-gold transition-colors hover:bg-imperial-gold/10 hover:text-yellow-400"
                            >
                              <LayoutDashboard className="h-4 w-4" />
                              <span className="flex-1 font-medium">Panel de Control</span>
                              <span className="rounded border border-imperial-gold/30 bg-imperial-gold/20 px-2 py-0.5 text-[10px] font-bold text-imperial-gold">
                                STAFF
                              </span>
                            </Link>
                          </div>
                        )}

                        <div className="py-2">
                          {[
                            {
                              href: `/usuarios/${profile?.username}`,
                              icon: User,
                              label: 'Mi Perfil',
                            },
                            { href: '/mi-galeria', icon: Image, label: 'Mis Miniaturas' },
                            { href: '/mercado/mis-anuncios', icon: Store, label: 'Mis Anuncios' },
                            {
                              href: '/mensajes',
                              icon: MessageCircle,
                              label: 'Mensajes',
                              badge: unreadMessages > 0 ? unreadMessages : undefined,
                            },
                            {
                              href: '/notificaciones',
                              icon: Bell,
                              label: 'Notificaciones',
                              badge: unreadCount > 0 ? unreadCount : undefined,
                            },
                            { href: '/perfil', icon: Settings, label: 'Configuración' },
                          ].map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setUserMenuOpen(false)}
                              className="group flex items-center gap-3 px-4 py-2.5 text-sm text-bone/70 transition-colors hover:bg-imperial-gold/10 hover:text-bone"
                            >
                              <item.icon className="h-4 w-4 transition-colors group-hover:text-imperial-gold" />
                              <span className="flex-1">{item.label}</span>
                              {item.badge && (
                                <span className="rounded-full bg-blood px-2 py-0.5 text-xs font-bold text-white">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>

                        <div className="border-t border-bone/10 pt-2">
                          <button
                            onClick={handleSignOut}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                          >
                            <LogOut className="h-4 w-4" />
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
              <LoginButton />
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          className="relative flex h-10 w-10 items-center justify-center md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          whileTap={{ scale: 0.95 }}
        >
          <div className="relative flex h-5 w-6 flex-col justify-between">
            <motion.span
              className="block h-0.5 w-full origin-center bg-imperial-gold"
              animate={mobileMenuOpen ? { rotate: 45, y: 9 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="block h-0.5 w-full bg-imperial-gold"
              animate={mobileMenuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="block h-0.5 w-full origin-center bg-imperial-gold"
              animate={mobileMenuOpen ? { rotate: -45, y: -9 } : { rotate: 0, y: 0 }}
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
            className="overflow-hidden md:hidden"
          >
            <div className="mt-3 border-t border-imperial-gold/20 bg-void/95 backdrop-blur-xl">
              <div className="space-y-2 px-6 py-6">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 font-body text-lg text-bone transition-all hover:bg-imperial-gold/10 hover:text-imperial-gold"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile User Section */}
                <div className="mt-4 border-t border-bone/10 pt-4">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 px-4 py-3">
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
                          className="flex items-center gap-3 rounded-lg px-4 py-3 text-bone/70 transition-all hover:bg-imperial-gold/10 hover:text-imperial-gold"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      ))}

                      <button
                        onClick={() => {
                          handleSignOut()
                          setMobileMenuOpen(false)
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-400 transition-all hover:bg-red-500/10"
                      >
                        <LogOut className="h-5 w-5" />
                        Cerrar Sesión
                      </button>
                    </div>
                  ) : (
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <motion.button
                        className="relative w-full overflow-hidden rounded-lg"
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
                          <Sparkles className="h-5 w-5" />
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
