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
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className={`relative w-full ${sizeClasses[size]} bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl`}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-zinc-800">
              <div>
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                {description && (
                  <p className="text-sm text-zinc-400 mt-0.5">{description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 -mr-2 -mt-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-5 max-h-[60vh] overflow-y-auto">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 p-5 border-t border-zinc-800">
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
      <p className="text-sm text-zinc-400">{description}</p>
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
        className="block text-sm font-medium text-zinc-300"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
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
        className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 transition-colors ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-zinc-700 focus:border-zinc-600 focus:ring-zinc-600'
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
        className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 transition-colors resize-none ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-zinc-700 focus:border-zinc-600 focus:ring-zinc-600'
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
        className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-sm text-white focus:outline-none focus:ring-1 transition-colors ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-zinc-700 focus:border-zinc-600 focus:ring-zinc-600'
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
