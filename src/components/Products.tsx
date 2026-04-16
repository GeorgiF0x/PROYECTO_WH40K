'use client'

import { motion } from 'framer-motion'
import ProductCard from './ProductCard'
import { featuredProducts } from '@/lib/data'

export default function Products() {
  return (
    <section id="productos" className="relative px-6 py-24">
      {/* Background */}
      <div className="grid-pattern absolute inset-0 opacity-20" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <motion.span
              className="mb-4 inline-block bg-imperial-gold/10 px-3 py-1 font-body text-sm font-semibold tracking-wider text-imperial-gold"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              CATÁLOGO
            </motion.span>
            <h2 className="font-display text-4xl font-black text-white md:text-5xl">
              Productos <span className="text-gradient">Destacados</span>
            </h2>
            <p className="mt-4 max-w-xl font-body text-lg text-bone/60">
              Las mejores miniaturas de todas las facciones. Desde el Imperium hasta las hordas del
              Caos.
            </p>
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="btn-outline mt-6 font-body md:mt-0"
          >
            Ver Todo
          </motion.button>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product, index) => (
            <ProductCard key={product.id} {...product} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
