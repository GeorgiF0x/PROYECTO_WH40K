'use client'

import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="mb-1.5 block text-sm font-medium text-bone">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full rounded-md border bg-void px-4 py-2.5 text-bone placeholder-bone/50',
            'focus:ring-gold/50 focus:border-gold focus:outline-none focus:ring-2',
            'min-h-[100px] resize-y transition-colors duration-200',
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

Textarea.displayName = 'Textarea'

export { Textarea }
