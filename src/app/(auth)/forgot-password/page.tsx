'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/lib/hooks/useAuth'
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle, Shield, Sparkles } from 'lucide-react'

const forgotPasswordSchema = z.object({
  email: z.string().email('Introduce un email válido'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

// Staggered animation variants
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
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

// Success animation component
function SuccessAnimation() {
  return (
    <motion.div
      className="relative w-24 h-24 mx-auto"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-green-500/30"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.2, opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* Inner glow */}
      <motion.div
        className="absolute inset-2 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20"
        animate={{
          boxShadow: [
            '0 0 20px rgba(34, 197, 94, 0.3)',
            '0 0 40px rgba(34, 197, 94, 0.5)',
            '0 0 20px rgba(34, 197, 94, 0.3)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Icon container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <Mail className="w-10 h-10 text-green-400" />
        </motion.div>
      </div>

      {/* Sparkles */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
          }}
          initial={{ scale: 0, x: '-50%', y: '-50%' }}
          animate={{
            scale: [0, 1, 0],
            x: ['-50%', `${-50 + (i % 2 === 0 ? 60 : -60)}%`],
            y: ['-50%', `${-50 + (i < 2 ? -60 : 60)}%`],
          }}
          transition={{
            duration: 0.8,
            delay: 0.4 + i * 0.1,
            ease: 'easeOut',
          }}
        >
          <Sparkles className="w-4 h-4 text-imperial-gold" />
        </motion.div>
      ))}
    </motion.div>
  )
}

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const emailValue = watch('email')

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setError(null)

    const { error } = await resetPassword(data.email)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    setIsLoading(false)
  }

  return (
    <div className="relative">
      {/* Animated gradient border */}
      <motion.div
        className="absolute -inset-[1px] rounded-2xl opacity-60"
        style={{
          background: 'linear-gradient(135deg, #C9A227 0%, transparent 50%, #C9A227 100%)',
          backgroundSize: '200% 200%',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />

      {/* Main card */}
      <motion.div
        className="relative bg-void-light/95 backdrop-blur-xl rounded-2xl p-8 border border-bone/5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-imperial-gold/40 rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-imperial-gold/40 rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-imperial-gold/40 rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-imperial-gold/40 rounded-br-2xl" />

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-4"
            >
              <SuccessAnimation />

              <motion.h2
                className="text-2xl font-display font-bold text-bone mt-6 mb-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Email Enviado
              </motion.h2>

              <motion.p
                className="text-bone/60 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Link href="/login">
                  <motion.button
                    className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border border-imperial-gold/50 text-imperial-gold font-body font-semibold tracking-wide transition-all duration-300 rounded-lg hover:bg-imperial-gold/10"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al Login
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="form">
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
                <h1 className="text-2xl font-display font-bold tracking-wide">
                  <span className="text-bone">Recupera tu </span>
                  <span className="text-gradient">Cuenta</span>
                </h1>
                <p className="text-bone/50 text-sm mt-2 font-body">
                  Te enviaremos instrucciones por email
                </p>
              </motion.div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Info Box */}
              <motion.div variants={itemVariants} className="mb-6">
                <div className="flex items-start gap-3 p-4 bg-imperial-gold/5 border border-imperial-gold/20 rounded-lg">
                  <Mail className="w-5 h-5 text-imperial-gold flex-shrink-0 mt-0.5" />
                  <p className="text-bone/70 text-sm leading-relaxed">
                    Introduce el email asociado a tu cuenta y te enviaremos un enlace seguro para restablecer tu contraseña.
                  </p>
                </div>
              </motion.div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Field */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-bone/80 mb-2 font-body">
                    Email
                  </label>
                  <div className="relative">
                    <motion.div
                      className="absolute -inset-[1px] rounded-lg opacity-0"
                      style={{
                        background: 'linear-gradient(135deg, #C9A227, #FFD700)',
                      }}
                      animate={{
                        opacity: focusedField === 'email' ? 0.5 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                    />
                    <div className="relative flex items-center">
                      <motion.div
                        className="absolute left-4 z-10"
                        animate={{
                          color: focusedField === 'email' ? '#C9A227' : 'rgba(232, 232, 240, 0.4)',
                        }}
                      >
                        <Mail className="w-5 h-5" />
                      </motion.div>
                      <input
                        type="email"
                        placeholder="tu@email.com"
                        className={`w-full pl-12 pr-4 py-4 bg-void border rounded-lg font-body text-bone placeholder:text-bone/30 focus:outline-none transition-all duration-300 ${
                          errors.email
                            ? 'border-red-500/50'
                            : focusedField === 'email'
                            ? 'border-imperial-gold/50'
                            : 'border-bone/10'
                        }`}
                        {...register('email')}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </div>
                  </div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-400 text-sm mt-2 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {errors.email.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                  <motion.button
                    type="submit"
                    disabled={isLoading || !emailValue}
                    className="relative w-full py-4 bg-gradient-to-r from-imperial-gold via-yellow-500 to-imperial-gold text-void font-display font-bold tracking-wider uppercase text-sm overflow-hidden rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundSize: '200% 100%',
                    }}
                    whileHover={!isLoading && emailValue ? { scale: 1.02, backgroundPosition: '100% 0' } : {}}
                    whileTap={!isLoading && emailValue ? { scale: 0.98 } : {}}
                    animate={!isLoading && emailValue ? {
                      boxShadow: [
                        '0 4px 20px rgba(201, 162, 39, 0.3)',
                        '0 4px 40px rgba(201, 162, 39, 0.5)',
                        '0 4px 20px rgba(201, 162, 39, 0.3)',
                      ],
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      style={{ backgroundSize: '200% 100%' }}
                      animate={!isLoading && emailValue ? { backgroundPosition: ['200% 0', '-200% 0'] } : {}}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />

                    <span className="relative flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <motion.div
                            className="w-5 h-5 border-2 border-void/30 border-t-void rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Enviar Enlace
                        </>
                      )}
                    </span>
                  </motion.button>
                </motion.div>
              </form>

              {/* Back to Login */}
              <motion.div variants={itemVariants} className="mt-8 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-bone/50 hover:text-imperial-gold text-sm font-body transition-colors duration-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al login
                </Link>
              </motion.div>

              {/* Security Note */}
              <motion.div variants={itemVariants} className="mt-6 pt-6 border-t border-bone/5">
                <div className="flex items-center justify-center gap-2 text-xs text-bone/30">
                  <CheckCircle className="w-3 h-3" />
                  <span>Conexión segura y encriptada</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
