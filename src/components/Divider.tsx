'use client'

import { motion } from 'framer-motion'

interface DividerProps {
  icon?: string
}

export default function Divider({ icon = '⚔' }: DividerProps) {
  return (
    <div className="relative w-full h-20 flex items-center justify-center overflow-hidden">
      {/* Line */}
      <motion.div
        className="absolute w-[40%] h-px bg-gradient-to-r from-transparent via-imperial-bronze to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      />

      {/* Icon */}
      <motion.div
        className="relative z-10 w-16 h-16 flex items-center justify-center text-2xl text-imperial-gold bg-void px-4"
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
