'use client'

import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-void-light group-[.toaster]:text-bone group-[.toaster]:border-bone/10 group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-bone/60',
          actionButton:
            'group-[.toast]:bg-gold group-[.toast]:text-void',
          cancelButton:
            'group-[.toast]:bg-bone/10 group-[.toast]:text-bone/70',
          success:
            'group-[.toaster]:border-green-500/20 group-[.toaster]:bg-green-500/10',
          error:
            'group-[.toaster]:border-red-500/20 group-[.toaster]:bg-red-500/10',
          warning:
            'group-[.toaster]:border-amber-500/20 group-[.toaster]:bg-amber-500/10',
          info:
            'group-[.toaster]:border-blue-500/20 group-[.toaster]:bg-blue-500/10',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
