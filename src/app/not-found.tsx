'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-void px-4">
      <div className="text-center">
        {/* Animated 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="font-display text-[150px] font-black leading-none text-imperial-gold">
            404
          </h1>
          <motion.div
            className="via-blood-red mx-auto h-1 bg-gradient-to-r from-transparent to-transparent"
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
          className="mb-8 space-y-4"
        >
          <h2 className="text-bone-white font-display text-2xl">Página no encontrada</h2>
          <p className="text-silver-grey mx-auto max-w-md">
            El recurso que buscas se ha perdido en el Warp. Quizás el Emperador te guíe de vuelta al
            camino correcto.
          </p>
        </motion.div>

        {/* Action button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative overflow-hidden"
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
              <span className="relative block rounded-lg bg-void px-8 py-3 font-display font-bold tracking-wider text-imperial-gold">
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
          className="text-silver-grey mt-16 text-4xl"
        >
          ☠ ☠ ☠
        </motion.div>
      </div>
    </div>
  )
}
