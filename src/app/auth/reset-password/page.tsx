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
    <div className="flex gap-3 mt-2">
      {checks.map((check, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              check.valid ? 'bg-green-400' : 'bg-bone/20'
            }`}
          />
          <span
            className={`text-xs font-body transition-colors ${
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
        <div className="absolute -inset-[1px] bg-gradient-to-r from-green-500/50 via-imperial-gold/30 to-green-500/50 rounded-xl" />
        <div className="relative bg-gradient-to-b from-void-light to-void rounded-xl p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center"
          >
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-display text-2xl font-bold tracking-wider text-bone mb-3">
              CONTRASEÑA <span className="text-green-400">ACTUALIZADA</span>
            </h2>
            <p className="text-bone/60 font-body mb-8 max-w-sm mx-auto">
              Tu contraseña ha sido cambiada exitosamente. Serás redirigido al login...
            </p>

            <div className="flex items-center justify-center gap-2 text-bone/40">
              <Loader2 className="w-4 h-4 animate-spin" />
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

        <div className="relative bg-gradient-to-b from-void-light to-void rounded-xl p-8 backdrop-blur-sm">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-imperial-gold/50 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-imperial-gold/50 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-imperial-gold/50 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-imperial-gold/50 rounded-br-xl" />

          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-imperial-gold/20 to-yellow-600/10 border border-imperial-gold/30 mb-4"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(201, 162, 39, 0.2)',
                  '0 0 40px rgba(201, 162, 39, 0.4)',
                  '0 0 20px rgba(201, 162, 39, 0.2)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Shield className="w-8 h-8 text-imperial-gold" />
            </motion.div>
            <h1 className="font-display text-2xl font-bold tracking-[0.15em] text-bone mb-2">
              NUEVA <span className="text-imperial-gold">CONTRASEÑA</span>
            </h1>
            <p className="text-bone/50 font-body text-sm tracking-wide">
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
                <div className="flex items-center gap-3 p-4 bg-blood/10 border border-blood/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blood flex-shrink-0" />
                  <p className="text-blood text-sm font-body">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* New Password Field */}
            <motion.div variants={itemVariants}>
              <label className="block text-xs font-display tracking-wider text-bone/70 mb-2 uppercase">
                Nueva Contraseña
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
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  className={`w-full bg-void border-2 rounded-lg pl-12 pr-12 py-3.5 font-body text-bone placeholder:text-bone/30 outline-none transition-all duration-300 ${
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-bone/40 hover:text-bone/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <PasswordStrength password={password} />
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

            {/* Confirm Password Field */}
            <motion.div variants={itemVariants}>
              <label className="block text-xs font-display tracking-wider text-bone/70 mb-2 uppercase">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <div
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                    focusedField === 'confirmPassword' ? 'text-imperial-gold' : 'text-bone/40'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  className={`w-full bg-void border-2 rounded-lg pl-12 pr-12 py-3.5 font-body text-bone placeholder:text-bone/30 outline-none transition-all duration-300 ${
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-bone/40 hover:text-bone/60 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-blood text-xs mt-2 font-body"
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
                className="relative w-full group overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-imperial-gold via-yellow-500 to-imperial-gold bg-[length:200%_100%] group-hover:animate-shimmer" />
                <div className="relative px-8 py-4 font-display font-bold tracking-[0.2em] text-void text-sm flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
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
            className="mt-8 text-center text-sm text-bone/50 font-body"
          >
            <Link
              href="/login"
              className="text-imperial-gold hover:text-imperial-gold/80 font-medium transition-colors"
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
      <div className="absolute -inset-[1px] bg-gradient-to-r from-imperial-gold/20 via-blood/10 to-imperial-gold/20 rounded-xl animate-pulse" />
      <div className="relative bg-void-light rounded-xl p-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="h-16 w-16 bg-bone/10 rounded-full mx-auto animate-pulse" />
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

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-void">
      <div className="w-full max-w-md">
        <Suspense fallback={<ResetPasswordSkeleton />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
