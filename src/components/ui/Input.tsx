'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = 'text', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-bone">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            'w-full rounded-md border bg-void px-4 py-2.5 text-bone placeholder-bone/50',
            'focus:ring-gold/50 focus:border-gold focus:outline-none focus:ring-2',
            'transition-colors duration-200',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
              : 'border-bone/20 hover:border-bone/40',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
        {helperText && !error && <p className="mt-1.5 text-sm text-bone/60">{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
