'use client'

import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#0a0a12',
          color: '#E8E8F0',
          border: '1px solid rgba(232, 232, 240, 0.1)',
        },
      }}
    />
  )
}
