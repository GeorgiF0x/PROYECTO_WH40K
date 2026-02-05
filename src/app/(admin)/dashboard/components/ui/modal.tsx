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
            className={`relative w-full ${sizeClasses[size]} bg-gradient-to-b from-[#0e0e1a] to-[#060610] border border-[#C9A227]/15 rounded-xl shadow-[0_0_60px_rgba(0,0,0,0.8),0_0_30px_rgba(201,162,39,0.08)] overflow-hidden`}
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/60 to-transparent" />

            {/* Corner accents */}
            <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-[#C9A227]/25 rounded-tl-sm" />
            <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-[#C9A227]/25 rounded-tr-sm" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-[#C9A227]/25 rounded-bl-sm" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-[#C9A227]/25 rounded-br-sm" />

            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-[#C9A227]/10">
              <div>
                <h2 className="text-lg font-semibold text-[#E8E8F0] tracking-wide">{title}</h2>
                {description && (
                  <p className="text-sm text-[#E8E8F0]/40 mt-1">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-[#E8E8F0]/30 hover:text-[#E8E8F0]/70 hover:bg-[#E8E8F0]/5 transition-all duration-200 -mr-1 -mt-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 max-h-[60vh] overflow-y-auto">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#C9A227]/10 bg-[#030308]/40">
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

export function FormField({
  label,
  htmlFor,
  error,
  children,
  required,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-[#E8E8F0]/70"
      >
        {label}
        {required && <span className="text-[#8B0000] ml-0.5">*</span>}
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
        className={`w-full px-3 py-2 bg-[#0a0a12]/80 border rounded-lg text-sm text-[#E8E8F0] placeholder:text-[#E8E8F0]/25 focus:outline-none focus:ring-1 transition-all duration-200 ${
          error
            ? 'border-[#8B0000] focus:border-[#8B0000] focus:ring-[#8B0000]/40'
            : 'border-[#C9A227]/15 focus:border-[#C9A227]/40 focus:ring-[#C9A227]/20 hover:border-[#C9A227]/25'
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

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full px-3 py-2 bg-[#0a0a12]/80 border rounded-lg text-sm text-[#E8E8F0] placeholder:text-[#E8E8F0]/25 focus:outline-none focus:ring-1 transition-all duration-200 resize-none ${
          error
            ? 'border-[#8B0000] focus:border-[#8B0000] focus:ring-[#8B0000]/40'
            : 'border-[#C9A227]/15 focus:border-[#C9A227]/40 focus:ring-[#C9A227]/20 hover:border-[#C9A227]/25'
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
        className={`w-full px-3 py-2 bg-[#0a0a12]/80 border rounded-lg text-sm text-[#E8E8F0] focus:outline-none focus:ring-1 transition-all duration-200 ${
          error
            ? 'border-[#8B0000] focus:border-[#8B0000] focus:ring-[#8B0000]/40'
            : 'border-[#C9A227]/15 focus:border-[#C9A227]/40 focus:ring-[#C9A227]/20 hover:border-[#C9A227]/25'
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
