'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface LoadMoreButtonProps {
  cursor: string
  searchParams: Record<string, string | undefined>
}

export default function LoadMoreButton({ cursor, searchParams }: LoadMoreButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleLoadMore = () => {
    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    params.set('cursor', cursor)

    startTransition(() => {
      router.push(`/mercado?${params.toString()}`, { scroll: false })
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="flex justify-center mt-12"
    >
      <motion.button
        onClick={handleLoadMore}
        disabled={isPending}
        className="relative px-8 py-4 bg-transparent border border-imperial-gold/50 text-imperial-gold font-display font-semibold tracking-wider uppercase text-sm rounded-lg overflow-hidden group disabled:opacity-50"
        whileHover={{ scale: isPending ? 1 : 1.02 }}
        whileTap={{ scale: isPending ? 1 : 0.98 }}
      >
        <motion.div
          className="absolute inset-0 bg-imperial-gold/10"
          initial={{ x: '-100%' }}
          whileHover={{ x: 0 }}
          transition={{ duration: 0.3 }}
        />
        <span className="relative flex items-center gap-2">
          {isPending ? (
            <>
              <motion.div
                className="w-4 h-4 border-2 border-imperial-gold/30 border-t-imperial-gold rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              Cargando...
            </>
          ) : (
            'Cargar más'
          )}
        </span>
      </motion.button>
    </motion.div>
  )
}
