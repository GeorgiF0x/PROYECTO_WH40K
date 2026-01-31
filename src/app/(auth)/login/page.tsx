'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, AlertTriangle, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import BootSequence from '@/components/auth/BootSequence'
import Turnstile from '@/components/auth/Turnstile'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

// Stagger animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const { signInWithEmail, signInWithGoogle, signInWithDiscord } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [showBoot, setShowBoot] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    // Verify Turnstile if token exists
    if (turnstileToken) {
      try {
        const verifyRes = await fetch('/api/verify-turnstile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: turnstileToken }),
        })
        const verifyData = await verifyRes.json()
        if (!verifyData.success) {
          setError('Verificación de seguridad fallida. Inténtalo de nuevo.')
          setIsLoading(false)
          return
        }
      } catch {
        setError('Error al verificar. Inténtalo de nuevo.')
        setIsLoading(false)
        return
      }
    }

    const { error } = await signInWithEmail(data.email, data.password)

    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Email o contraseña incorrectos'
          : error.message
      )
      setIsLoading(false)
    } else {
      setShowBoot(true)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'discord') => {
    setIsLoading(true)
    setError(null)

    const signIn = provider === 'google' ? signInWithGoogle : signInWithDiscord
    const { error } = await signIn()

    if (error) {
      setError(error.message)
      setIsLoading(false)
    }
    // OAuth redirects externally — no boot sequence needed here
  }

  return (
    <>
      <AnimatePresence>
        {showBoot && (
          <BootSequence onComplete={() => router.push(redirect)} />
        )}
      </AnimatePresence>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      {/* Card with dramatic border effect */}
      <div className="relative">
        {/* Animated border glow */}
        <motion.div
          className="absolute -inset-[1px] bg-gradient-to-r from-imperial-gold/50 via-blood/30 to-imperial-gold/50 rounded-xl opacity-75"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ backgroundSize: '200% 200%' }}
        />

        {/* Main card */}
        <div className="relative bg-gradient-to-b from-void-light to-void rounded-xl p-8 backdrop-blur-sm">
          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-imperial-gold/50 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-imperial-gold/50 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-imperial-gold/50 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-imperial-gold/50 rounded-br-xl" />

          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold tracking-[0.15em] text-bone mb-2">
              ACCESO AL <span className="text-imperial-gold">IMPERIO</span>
            </h1>
            <p className="text-bone/50 font-body text-sm tracking-wide">
              Identifícate para continuar, guerrero
            </p>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4 bg-blood/10 border border-blood/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-blood flex-shrink-0" />
                  <p className="text-blood text-sm font-body">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <motion.div variants={itemVariants}>
              <label className="block text-xs font-display tracking-wider text-bone/70 mb-2 uppercase">
                Email
              </label>
              <div className="relative">
                <div
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                    focusedField === 'email' ? 'text-imperial-gold' : 'text-bone/40'
                  }`}
                >
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  placeholder="comandante@imperium.gov"
                  className={`w-full bg-void border-2 rounded-lg pl-12 pr-4 py-3.5 font-body text-bone placeholder:text-bone/30 outline-none transition-all duration-300 ${
                    errors.email
                      ? 'border-blood/50 focus:border-blood'
                      : focusedField === 'email'
                      ? 'border-imperial-gold/50 shadow-[0_0_20px_rgba(201,162,39,0.15)]'
                      : 'border-bone/10 hover:border-bone/20'
                  }`}
                  {...register('email')}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-blood text-xs mt-2 font-body"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants}>
              <label className="block text-xs font-display tracking-wider text-bone/70 mb-2 uppercase">
                Contraseña
              </label>
              <div className="relative">
                <div
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                    focusedField === 'password' ? 'text-imperial-gold' : 'text-bone/40'
                  }`}
                >
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className={`w-full bg-void border-2 rounded-lg pl-12 pr-4 py-3.5 font-body text-bone placeholder:text-bone/30 outline-none transition-all duration-300 ${
                    errors.password
                      ? 'border-blood/50 focus:border-blood'
                      : focusedField === 'password'
                      ? 'border-imperial-gold/50 shadow-[0_0_20px_rgba(201,162,39,0.15)]'
                      : 'border-bone/10 hover:border-bone/20'
                  }`}
                  {...register('password')}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-blood text-xs mt-2 font-body"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </motion.div>

            {/* Forgot Password Link */}
            <motion.div variants={itemVariants} className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-bone/50 hover:text-imperial-gold transition-colors font-body"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </motion.div>

            {/* Turnstile Captcha */}
            <motion.div variants={itemVariants}>
              <Turnstile
                onVerify={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
                theme="dark"
                className="my-2"
              />
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={isLoading}
                className="relative w-full group overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Button background with animated gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-imperial-gold via-yellow-500 to-imperial-gold bg-[length:200%_100%] group-hover:animate-shimmer" />

                {/* Button content */}
                <div className="relative px-8 py-4 font-display font-bold tracking-[0.2em] text-void text-sm flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      VERIFICANDO...
                    </>
                  ) : (
                    'ACCEDER'
                  )}
                </div>

                {/* Decorative cut corners */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    clipPath:
                      'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                  }}
                />
              </motion.button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div variants={itemVariants} className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-bone/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-void-light text-bone/40 text-xs font-display tracking-widest uppercase">
                O continúa con
              </span>
            </div>
          </motion.div>

          {/* OAuth Buttons */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
            {/* Google */}
            <motion.button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-bone/10 rounded-lg text-bone hover:bg-white/10 hover:border-bone/20 transition-all disabled:opacity-50 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-body text-sm">Google</span>
            </motion.button>

            {/* Discord */}
            <motion.button
              type="button"
              onClick={() => handleOAuthLogin('discord')}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-[#5865F2]/10 border border-[#5865F2]/30 rounded-lg text-[#5865F2] hover:bg-[#5865F2]/20 hover:border-[#5865F2]/50 transition-all disabled:opacity-50 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <span className="font-body text-sm">Discord</span>
            </motion.button>
          </motion.div>

          {/* Register Link */}
          <motion.p
            variants={itemVariants}
            className="mt-8 text-center text-sm text-bone/50 font-body"
          >
            ¿Nuevo recluta?{' '}
            <Link
              href="/register"
              className="text-imperial-gold hover:text-imperial-gold/80 font-medium transition-colors"
            >
              Únete al Imperio
            </Link>
          </motion.p>
        </div>
      </div>
    </motion.div>
    </>
  )
}

// Loading skeleton with dramatic effect
function LoginSkeleton() {
  return (
    <div className="relative">
      <div className="absolute -inset-[1px] bg-gradient-to-r from-imperial-gold/20 via-blood/10 to-imperial-gold/20 rounded-xl animate-pulse" />
      <div className="relative bg-void-light rounded-xl p-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="h-8 bg-bone/10 rounded w-3/4 mx-auto animate-pulse" />
            <div className="h-4 bg-bone/5 rounded w-1/2 mx-auto animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-14 bg-bone/5 rounded-lg animate-pulse" />
            <div className="h-14 bg-bone/5 rounded-lg animate-pulse" />
            <div className="h-12 bg-imperial-gold/20 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  )
}
