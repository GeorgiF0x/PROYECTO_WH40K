'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-4">
      <div className="text-center">
        {/* Animated 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-[150px] font-display font-black text-imperial-gold leading-none">
            404
          </h1>
          <motion.div
            className="h-1 bg-gradient-to-r from-transparent via-blood-red to-transparent mx-auto"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4 mb-8"
        >
          <h2 className="text-2xl font-display text-bone-white">
            Página no encontrada
          </h2>
          <p className="text-silver-grey max-w-md mx-auto">
            El recurso que buscas se ha perdido en el Warp.
            Quizás el Emperador te guíe de vuelta al camino correcto.
          </p>
        </motion.div>

        {/* Action button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group overflow-hidden"
            >
              {/* Animated border */}
              <motion.div
                className="absolute -inset-[2px] rounded-lg"
                style={{
                  background: 'linear-gradient(90deg, #C9A227, #8B0000, #C9A227)',
                  backgroundSize: '200% 100%',
                }}
                animate={{
                  backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              <span className="relative block px-8 py-3 bg-void rounded-lg font-display font-bold tracking-wider text-imperial-gold">
                VOLVER AL INICIO
              </span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Decorative skulls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-4xl text-silver-grey"
        >
          ☠ ☠ ☠
        </motion.div>
      </div>
    </div>
  )
}
