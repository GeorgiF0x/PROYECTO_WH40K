'use client'

import { motion } from 'framer-motion'

interface DividerProps {
  icon?: string
}

export default function Divider({ icon = '⚔' }: DividerProps) {
  return (
    <div className="relative flex h-20 w-full items-center justify-center overflow-hidden">
      {/* Line */}
      <motion.div
        className="absolute h-px w-[40%] bg-gradient-to-r from-transparent via-imperial-bronze to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      />

      {/* Icon */}
      <motion.div
        className="relative z-10 flex h-16 w-16 items-center justify-center bg-void px-4 text-2xl text-imperial-gold"
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
        whileHover={{
          scale: 1.2,
          rotate: 360,
          textShadow: '0 0 20px rgba(201, 162, 39, 0.8)',
        }}
      >
        {icon}
      </motion.div>
    </div>
  )
}
