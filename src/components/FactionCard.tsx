'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

interface FactionCardProps {
  id: string
  name: string
  shortName: string
  tagline: string
  description: string
  color: string
  image: string
  index: number
}

export default function FactionCard({
  id,
  name,
  tagline,
  description,
  color,
  image,
  index,
}: FactionCardProps) {
  return (
    <Link href={`/facciones/${id}`}>
      <motion.article
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.2 }}
        whileHover={{ y: -10 }}
        className="group relative h-[500px] rounded-xl overflow-hidden cursor-pointer"
      >
        {/* Background Image */}
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: `linear-gradient(to top, ${color}40 0%, transparent 50%, ${color}10 100%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-transparent" />

        {/* Hover Glow Effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at center, ${color}20 0%, transparent 70%)`,
          }}
        />

        {/* Top Border Accent */}
        <div
          className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ backgroundColor: color }}
        />

        {/* Content */}
        <div className="absolute inset-0 p-8 flex flex-col justify-end">
          {/* Tagline */}
          <motion.span
            className="font-body text-sm font-semibold tracking-wider uppercase mb-2 opacity-70 group-hover:opacity-100 transition-opacity"
            style={{ color }}
          >
            {tagline}
          </motion.span>

          {/* Name */}
          <h3 className="font-display text-3xl md:text-4xl font-black text-white mb-4 group-hover:text-shadow-lg transition-all">
            {name}
          </h3>

          {/* Description */}
          <p className="font-body text-bone/70 leading-relaxed mb-6 line-clamp-3 group-hover:text-bone/90 transition-colors">
            {description}
          </p>

          {/* CTA */}
          <motion.div
            className="flex items-center gap-2 font-body font-semibold tracking-wide"
            style={{ color }}
          >
            <span>Explorar Facción</span>
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:translate-x-2 transition-transform duration-300"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </motion.svg>
          </motion.div>
        </div>
      </motion.article>
    </Link>
  )
}
