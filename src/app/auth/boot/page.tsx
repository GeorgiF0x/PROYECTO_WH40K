'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import BootSequence from '@/components/auth/BootSequence'

function BootScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'

  return (
    <AnimatePresence>
      <BootSequence onComplete={() => router.push(next)} />
    </AnimatePresence>
  )
}

export default function BootPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-[100] bg-void" />
      }
    >
      <BootScreen />
    </Suspense>
  )
}
