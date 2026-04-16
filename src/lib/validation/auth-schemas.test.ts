import { describe, it, expect } from 'vitest'
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  getPasswordChecks,
} from './auth-schemas'

describe('loginSchema', () => {
  it('accepts a valid email + password', () => {
    expect(
      loginSchema.safeParse({ email: 'comandante@imperium.gov', password: 'secret123' }).success
    ).toBe(true)
  })

  it('rejects an invalid email format', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret123' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Email inválido')
    }
  })

  it('rejects passwords shorter than 6 chars', () => {
    const result = loginSchema.safeParse({ email: 'a@b.co', password: '12345' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Mínimo 6 caracteres')
    }
  })

  it('accepts a 6-character password (boundary)', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co', password: '123456' }).success).toBe(true)
  })

  it('rejects missing email', () => {
    expect(loginSchema.safeParse({ password: '123456' }).success).toBe(false)
  })

  it('rejects missing password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co' }).success).toBe(false)
  })
})

describe('registerSchema', () => {
  const valid = {
    email: 'recluta@imperium.gov',
    password: 'StrongPass1',
    confirmPassword: 'StrongPass1',
  }

  it('accepts a fully valid payload', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects passwords without an uppercase letter', () => {
    const result = registerSchema.safeParse({ ...valid, password: 'lowercase1', confirmPassword: 'lowercase1' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((i) => i.message)).toContain('Requiere una mayúscula')
    }
  })

  it('rejects passwords without a number', () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: 'NoNumbersHere',
      confirmPassword: 'NoNumbersHere',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((i) => i.message)).toContain('Requiere un número')
    }
  })

  it('rejects passwords shorter than 8 chars', () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: 'Ab1',
      confirmPassword: 'Ab1',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((i) => i.message)).toContain('Mínimo 8 caracteres')
    }
  })

  it('reports MULTIPLE password issues at once (length + uppercase + number)', () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Mínimo 8 caracteres')
      expect(messages).toContain('Requiere una mayúscula')
      expect(messages).toContain('Requiere un número')
    }
  })

  it('rejects when confirmPassword does not match password', () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: 'DifferentPass1' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const mismatch = result.error.issues.find((i) => i.path.join('.') === 'confirmPassword')
      expect(mismatch?.message).toBe('Las contraseñas no coinciden')
    }
  })

  it('rejects an invalid email even when password is strong', () => {
    expect(
      registerSchema.safeParse({ ...valid, email: 'not-email' }).success
    ).toBe(false)
  })

  it('accepts an 8-char password at boundary', () => {
    expect(
      registerSchema.safeParse({
        ...valid,
        password: 'Abcdefg1',
        confirmPassword: 'Abcdefg1',
      }).success
    ).toBe(true)
  })
})

describe('forgotPasswordSchema', () => {
  it('accepts a valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'lost@imperium.gov' }).success).toBe(true)
  })

  it('rejects an invalid email with the localized message', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'lost-at-the-warp' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Introduce un email válido')
    }
  })

  it('rejects missing email field', () => {
    expect(forgotPasswordSchema.safeParse({}).success).toBe(false)
  })
})

describe('getPasswordChecks', () => {
  it('returns 3 checks regardless of input', () => {
    expect(getPasswordChecks('').length).toBe(3)
    expect(getPasswordChecks('whatever').length).toBe(3)
  })

  it('marks all checks as invalid for an empty password', () => {
    const checks = getPasswordChecks('')
    expect(checks.every((c) => !c.valid)).toBe(true)
  })

  it('marks all 3 checks valid for a fully strong password', () => {
    const checks = getPasswordChecks('StrongPass1')
    expect(checks.every((c) => c.valid)).toBe(true)
  })

  it('marks length valid but uppercase + number invalid for "abcdefgh"', () => {
    const [length, upper, num] = getPasswordChecks('abcdefgh')
    expect(length.valid).toBe(true)
    expect(upper.valid).toBe(false)
    expect(num.valid).toBe(false)
  })

  it('marks number valid but length + uppercase invalid for "ab1"', () => {
    const [length, upper, num] = getPasswordChecks('ab1')
    expect(length.valid).toBe(false)
    expect(upper.valid).toBe(false)
    expect(num.valid).toBe(true)
  })

  it('marks uppercase valid but length + number invalid for "Abc"', () => {
    const [length, upper, num] = getPasswordChecks('Abc')
    expect(length.valid).toBe(false)
    expect(upper.valid).toBe(true)
    expect(num.valid).toBe(false)
  })

  it('uses the expected Spanish labels', () => {
    const labels = getPasswordChecks('').map((c) => c.label)
    expect(labels).toEqual(['8+ caracteres', 'Mayúscula', 'Número'])
  })
})
