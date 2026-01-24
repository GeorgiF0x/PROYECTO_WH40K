'use client'

import { motion } from 'framer-motion'
import ProductCard from './ProductCard'
import { featuredProducts } from '@/lib/data'

export default function Products() {
  return (
    <section id="productos" className="relative py-24 px-6">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <motion.span
              className="inline-block px-3 py-1 bg-imperial-gold/10 text-imperial-gold font-body text-sm font-semibold tracking-wider mb-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              CATÁLOGO
            </motion.span>
            <h2 className="font-display text-4xl md:text-5xl font-black text-white">
              Productos <span className="text-gradient">Destacados</span>
            </h2>
            <p className="font-body text-lg text-bone/60 mt-4 max-w-xl">
              Las mejores miniaturas de todas las facciones. Desde el Imperium hasta las hordas del Caos.
            </p>
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-6 md:mt-0 btn-outline font-body"
          >
            Ver Todo
          </motion.button>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product, index) => (
            <ProductCard key={product.id} {...product} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
