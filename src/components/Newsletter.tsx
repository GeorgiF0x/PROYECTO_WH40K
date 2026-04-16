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
    <section className="relative px-6 py-24">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-void via-void-light/20 to-void" />

      <motion.div
        className="relative mx-auto max-w-4xl"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="glass rounded-2xl p-8 text-center md:p-12">
          {/* Icon */}
          <motion.div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-imperial-gold/10"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-imperial-gold"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          </motion.div>

          {/* Content */}
          <h2 className="mb-4 font-display text-3xl font-black text-white md:text-4xl">
            Únete a la <span className="text-gradient">Cruzada</span>
          </h2>
          <p className="mx-auto mb-8 max-w-xl font-body text-lg text-bone/60">
            Recibe noticias de lanzamientos, ofertas exclusivas y contenido sobre el hobby
            directamente en tu correo.
          </p>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="flex-1 rounded-lg border border-white/10 bg-void px-5 py-4 font-body text-white transition-colors placeholder:text-bone/40 focus:border-imperial-gold/50 focus:outline-none"
              required
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-lg bg-imperial-gold px-8 py-4 font-body font-semibold tracking-wide text-void transition-colors hover:bg-yellow-500"
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
          <div className="mt-8 flex items-center justify-center gap-6 font-body text-sm text-bone/40">
            <span className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Sin spam
            </span>
            <span className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Cancela cuando quieras
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
