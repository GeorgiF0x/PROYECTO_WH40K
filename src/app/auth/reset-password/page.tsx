'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/lib/hooks/useAuth'
import { Lock, CheckCircle2, AlertCircle, Eye, EyeOff, Shield, Loader2 } from 'lucide-react'

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Requiere una mayúscula')
      .regex(/[0-9]/, 'Requiere un número'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
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

// Password strength indicator
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ caracteres', valid: password.length >= 8 },
    { label: 'Mayúscula', valid: /[A-Z]/.test(password) },
    { label: 'Número', valid: /[0-9]/.test(password) },
  ]

  return (
    <div className="mt-2 flex gap-3">
      {checks.map((check, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              check.valid ? 'bg-green-400' : 'bg-bone/20'
            }`}
          />
          <span
            className={`font-body text-xs transition-colors ${
              check.valid ? 'text-green-400' : 'text-bone/40'
            }`}
          >
            {check.label}
          </span>
        </div>
      ))}
    </div>
  )
}

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { updatePassword } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  // Check if we have an error from the URL (e.g., expired link)
  useEffect(() => {
    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (errorParam) {
      setError(errorDescription || 'El enlace ha expirado o es inválido')
    }
  }, [searchParams])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const password = watch('password', '')

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)
    setError(null)

    const { error } = await updatePassword(data.password)

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      setSuccess(true)
      setIsLoading(false)
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  }

  // Success state
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-green-500/50 via-imperial-gold/30 to-green-500/50" />
        <div className="relative rounded-xl bg-gradient-to-b from-void-light to-void p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-green-500/30 bg-green-500/20"
          >
            <CheckCircle2 className="h-10 w-10 text-green-400" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="mb-3 font-display text-2xl font-bold tracking-wider text-bone">
              CONTRASEÑA <span className="text-green-400">ACTUALIZADA</span>
            </h2>
            <p className="mx-auto mb-8 max-w-sm font-body text-bone/60">
              Tu contraseña ha sido cambiada exitosamente. Serás redirigido al login...
            </p>

            <div className="flex items-center justify-center gap-2 text-bone/40">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Redirigiendo...</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      {/* Card with animated border */}
      <div className="relative">
        <motion.div
          className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-imperial-gold/50 via-blood/30 to-imperial-gold/50 opacity-75"
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

        <div className="relative rounded-xl bg-gradient-to-b from-void-light to-void p-8 backdrop-blur-sm">
          {/* Corner accents */}
          <div className="absolute left-0 top-0 h-8 w-8 rounded-tl-xl border-l-2 border-t-2 border-imperial-gold/50" />
          <div className="absolute right-0 top-0 h-8 w-8 rounded-tr-xl border-r-2 border-t-2 border-imperial-gold/50" />
          <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-xl border-b-2 border-l-2 border-imperial-gold/50" />
          <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-xl border-b-2 border-r-2 border-imperial-gold/50" />

          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8 text-center">
            <motion.div
              className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-imperial-gold/30 bg-gradient-to-br from-imperial-gold/20 to-yellow-600/10"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(201, 162, 39, 0.2)',
                  '0 0 40px rgba(201, 162, 39, 0.4)',
                  '0 0 20px rgba(201, 162, 39, 0.2)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Shield className="h-8 w-8 text-imperial-gold" />
            </motion.div>
            <h1 className="mb-2 font-display text-2xl font-bold tracking-[0.15em] text-bone">
              NUEVA <span className="text-imperial-gold">CONTRASEÑA</span>
            </h1>
            <p className="font-body text-sm tracking-wide text-bone/50">
              Introduce tu nueva contraseña segura
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
                <div className="flex items-center gap-3 rounded-lg border border-blood/30 bg-blood/10 p-4">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-blood" />
                  <p className="font-body text-sm text-blood">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* New Password Field */}
            <motion.div variants={itemVariants}>
              <label className="mb-2 block font-display text-xs uppercase tracking-wider text-bone/70">
                Nueva Contraseña
              </label>
              <div className="relative">
                <div
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                    focusedField === 'password' ? 'text-imperial-gold' : 'text-bone/40'
                  }`}
                >
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  className={`w-full rounded-lg border-2 bg-void py-3.5 pl-12 pr-12 font-body text-bone outline-none transition-all duration-300 placeholder:text-bone/30 ${
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
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-bone/40 transition-colors hover:text-bone/60"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <PasswordStrength password={password} />
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 font-body text-xs text-blood"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div variants={itemVariants}>
              <label className="mb-2 block font-display text-xs uppercase tracking-wider text-bone/70">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <div
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                    focusedField === 'confirmPassword' ? 'text-imperial-gold' : 'text-bone/40'
                  }`}
                >
                  <Shield className="h-5 w-5" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  className={`w-full rounded-lg border-2 bg-void py-3.5 pl-12 pr-12 font-body text-bone outline-none transition-all duration-300 placeholder:text-bone/30 ${
                    errors.confirmPassword
                      ? 'border-blood/50 focus:border-blood'
                      : focusedField === 'confirmPassword'
                        ? 'border-imperial-gold/50 shadow-[0_0_20px_rgba(201,162,39,0.15)]'
                        : 'border-bone/10 hover:border-bone/20'
                  }`}
                  {...register('confirmPassword')}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-bone/40 transition-colors hover:text-bone/60"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 font-body text-xs text-blood"
                >
                  {errors.confirmPassword.message}
                </motion.p>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants} className="pt-2">
              <motion.button
                type="submit"
                disabled={isLoading}
                className="group relative w-full overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="group-hover:animate-shimmer absolute inset-0 bg-gradient-to-r from-imperial-gold via-yellow-500 to-imperial-gold bg-[length:200%_100%]" />
                <div className="relative flex items-center justify-center gap-3 px-8 py-4 font-display text-sm font-bold tracking-[0.2em] text-void">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      ACTUALIZANDO...
                    </>
                  ) : (
                    'GUARDAR CONTRASEÑA'
                  )}
                </div>
              </motion.button>
            </motion.div>
          </form>

          {/* Back to Login */}
          <motion.p
            variants={itemVariants}
            className="mt-8 text-center font-body text-sm text-bone/50"
          >
            <Link
              href="/login"
              className="font-medium text-imperial-gold transition-colors hover:text-imperial-gold/80"
            >
              Volver al Login
            </Link>
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}

// Loading skeleton
function ResetPasswordSkeleton() {
  return (
    <div className="relative">
      <div className="absolute -inset-[1px] animate-pulse rounded-xl bg-gradient-to-r from-imperial-gold/20 via-blood/10 to-imperial-gold/20" />
      <div className="relative rounded-xl bg-void-light p-8">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <div className="mx-auto h-16 w-16 animate-pulse rounded-full bg-bone/10" />
            <div className="mx-auto h-8 w-3/4 animate-pulse rounded bg-bone/10" />
            <div className="mx-auto h-4 w-1/2 animate-pulse rounded bg-bone/5" />
          </div>
          <div className="space-y-4">
            <div className="h-14 animate-pulse rounded-lg bg-bone/5" />
            <div className="h-14 animate-pulse rounded-lg bg-bone/5" />
            <div className="h-12 animate-pulse rounded bg-imperial-gold/20" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-void p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<ResetPasswordSkeleton />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
