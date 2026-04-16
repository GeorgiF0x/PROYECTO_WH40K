import { z } from 'zod'

// ── Login ────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// ── Register ─────────────────────────────────────────────────

export const registerSchema = z
  .object({
    email: z.email('Email inválido'),
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

export type RegisterFormData = z.infer<typeof registerSchema>

// ── Forgot password ──────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: z.email('Introduce un email válido'),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

// ── Password strength helper (UI feedback) ───────────────────

export interface PasswordCheck {
  label: string
  valid: boolean
}

/**
 * Returns the live password-strength checks shown beside the register form.
 * Kept as a pure function so it can be unit-tested AND reused if we ever
 * surface the same indicator on the password-reset screen.
 */
export function getPasswordChecks(password: string): PasswordCheck[] {
  return [
    { label: '8+ caracteres', valid: password.length >= 8 },
    { label: 'Mayúscula', valid: /[A-Z]/.test(password) },
    { label: 'Número', valid: /[0-9]/.test(password) },
  ]
}
