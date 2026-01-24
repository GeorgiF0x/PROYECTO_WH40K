'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setEmail('')
      }, 3000)
    }
  }

  return (
    <section className="relative py-24 px-6">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-void via-void-light/20 to-void" />

      <motion.div
        className="relative max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="glass rounded-2xl p-8 md:p-12 text-center">
          {/* Icon */}
          <motion.div
            className="w-16 h-16 mx-auto mb-6 rounded-full bg-imperial-gold/10 flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-imperial-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </motion.div>

          {/* Content */}
          <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-4">
            Únete a la <span className="text-gradient">Cruzada</span>
          </h2>
          <p className="font-body text-lg text-bone/60 mb-8 max-w-xl mx-auto">
            Recibe noticias de lanzamientos, ofertas exclusivas y contenido sobre el hobby directamente en tu correo.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="flex-1 px-5 py-4 bg-void border border-white/10 rounded-lg text-white font-body placeholder:text-bone/40 focus:outline-none focus:border-imperial-gold/50 transition-colors"
              required
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-imperial-gold text-void font-body font-semibold tracking-wide rounded-lg hover:bg-yellow-500 transition-colors"
              disabled={submitted}
            >
              {submitted ? '¡Enviado!' : 'Suscribirse'}
            </motion.button>
          </form>

          {submitted && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 font-body text-sm text-imperial-gold"
            >
              ¡Bienvenido a la cruzada! Revisa tu correo.
            </motion.p>
          )}

          {/* Trust badges */}
          <div className="mt-8 flex items-center justify-center gap-6 text-bone/40 font-body text-sm">
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Sin spam
            </span>
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Cancela cuando quieras
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
