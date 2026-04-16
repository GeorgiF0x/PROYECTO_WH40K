'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from './button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full ${sizeClasses[size]} overflow-hidden rounded-xl border border-[#C9A227]/15 bg-gradient-to-b from-[#0e0e1a] to-[#060610] shadow-[0_0_60px_rgba(0,0,0,0.8),0_0_30px_rgba(201,162,39,0.08)]`}
          >
            {/* Top accent line */}
            <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/60 to-transparent" />

            {/* Corner accents */}
            <div className="absolute left-2 top-2 h-3 w-3 rounded-tl-sm border-l-2 border-t-2 border-[#C9A227]/25" />
            <div className="absolute right-2 top-2 h-3 w-3 rounded-tr-sm border-r-2 border-t-2 border-[#C9A227]/25" />
            <div className="absolute bottom-2 left-2 h-3 w-3 rounded-bl-sm border-b-2 border-l-2 border-[#C9A227]/25" />
            <div className="absolute bottom-2 right-2 h-3 w-3 rounded-br-sm border-b-2 border-r-2 border-[#C9A227]/25" />

            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#C9A227]/10 p-5">
              <div>
                <h2 className="text-lg font-semibold tracking-wide text-[#E8E8F0]">{title}</h2>
                {description && <p className="mt-1 text-sm text-[#E8E8F0]/40">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-lg text-[#E8E8F0]/30 transition-all duration-200 hover:bg-[#E8E8F0]/5 hover:text-[#E8E8F0]/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto p-5">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 border-t border-[#C9A227]/10 bg-[#030308]/40 px-5 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ══════════════════════════════════════════════════════════════
// CONFIRM DIALOG
// ══════════════════════════════════════════════════════════════

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
  loading?: boolean
  children?: React.ReactNode
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  loading = false,
  children,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Procesando...' : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-[#E8E8F0]/50">{description}</p>
      {children}
    </Modal>
  )
}

// ══════════════════════════════════════════════════════════════
// FORM FIELD
// ══════════════════════════════════════════════════════════════

interface FormFieldProps {
  label: string
  htmlFor?: string
  error?: string
  children: React.ReactNode
  required?: boolean
}

export function FormField({ label, htmlFor, error, children, required }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-[#E8E8F0]/70">
        {label}
        {required && <span className="ml-0.5 text-[#8B0000]">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-[#ff4444]">{error}</p>}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// INPUT
// ══════════════════════════════════════════════════════════════

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full rounded-lg border bg-[#0a0a12]/80 px-3 py-2 text-sm text-[#E8E8F0] transition-all duration-200 placeholder:text-[#E8E8F0]/25 focus:outline-none focus:ring-1 ${
          error
            ? 'border-[#8B0000] focus:border-[#8B0000] focus:ring-[#8B0000]/40'
            : 'border-[#C9A227]/15 hover:border-[#C9A227]/25 focus:border-[#C9A227]/40 focus:ring-[#C9A227]/20'
        } ${className}`}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

// ══════════════════════════════════════════════════════════════
// TEXTAREA
// ══════════════════════════════════════════════════════════════

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full resize-none rounded-lg border bg-[#0a0a12]/80 px-3 py-2 text-sm text-[#E8E8F0] transition-all duration-200 placeholder:text-[#E8E8F0]/25 focus:outline-none focus:ring-1 ${
          error
            ? 'border-[#8B0000] focus:border-[#8B0000] focus:ring-[#8B0000]/40'
            : 'border-[#C9A227]/15 hover:border-[#C9A227]/25 focus:border-[#C9A227]/40 focus:ring-[#C9A227]/20'
        } ${className}`}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

// ══════════════════════════════════════════════════════════════
// SELECT
// ══════════════════════════════════════════════════════════════

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  options: Array<{ value: string; label: string }>
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error, options, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full rounded-lg border bg-[#0a0a12]/80 px-3 py-2 text-sm text-[#E8E8F0] transition-all duration-200 focus:outline-none focus:ring-1 ${
          error
            ? 'border-[#8B0000] focus:border-[#8B0000] focus:ring-[#8B0000]/40'
            : 'border-[#C9A227]/15 hover:border-[#C9A227]/25 focus:border-[#C9A227]/40 focus:ring-[#C9A227]/20'
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }
)
Select.displayName = 'Select'
