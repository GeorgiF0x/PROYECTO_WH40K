'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import {
  ChevronLeft,
  Eye,
  Calendar,
  User,
  Edit3,
  BookOpen,
  Share2,
  ChevronUp,
} from 'lucide-react'
import { Navigation, Footer } from '@/components'
import { getFactionById } from '@/lib/data'
import { getFactionTheme } from '@/lib/faction-themes'
import { FactionEffects, FactionSymbol } from '@/components/faction'
import { WikiRenderer } from '@/components/wiki'
import { Button } from '@/components/ui/Button'
import type { WikiPage } from '@/lib/supabase/wiki.types'

export default function WikiArticlePage() {
  const params = useParams()
  const router = useRouter()
  const factionId = params.id as string
  const slug = params.slug as string
  const faction = getFactionById(factionId)
  const theme = getFactionTheme(factionId)

  const [page, setPage] = useState<WikiPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    loadPage()
  }, [factionId, slug])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  async function loadPage() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/wiki/${factionId}--${slug}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError('Articulo no encontrado')
        } else {
          setError('Error al cargar el articulo')
        }
        return
      }
      const data = await res.json()
      setPage(data)
    } catch (err) {
      console.error('Error loading wiki page:', err)
      setError('Error al cargar el articulo')
    } finally {
      setLoading(false)
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: page?.title,
          url,
        })
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url)
      // Could show a toast here
    }
  }

  if (!faction) {
    return (
      <main className="min-h-screen bg-void flex items-center justify-center">
        <div className="noise-overlay" />
        <div className="text-center">
          <h1 className="font-display text-4xl text-white mb-4">Faccion no encontrada</h1>
          <Link href="/facciones" className="text-imperial-gold hover:underline">
            Volver a facciones
          </Link>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main
        className="relative min-h-screen"
        style={{ background: theme?.cssVars['--faction-bg'] || '#030308' }}
      >
        <div className="noise-overlay" />
        <Navigation />
        <div className="pt-28 pb-16">
          <div className="max-w-4xl mx-auto px-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-48 bg-bone/10 rounded" />
              <div className="h-12 w-3/4 bg-bone/10 rounded" />
              <div className="h-64 bg-bone/10 rounded-xl" />
              <div className="space-y-3">
                <div className="h-4 bg-bone/10 rounded w-full" />
                <div className="h-4 bg-bone/10 rounded w-5/6" />
                <div className="h-4 bg-bone/10 rounded w-4/6" />
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !page) {
    return (
      <main
        className="relative min-h-screen"
        style={{ background: theme?.cssVars['--faction-bg'] || '#030308' }}
      >
        <div className="noise-overlay" />
        <Navigation />
        <div className="pt-28 pb-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <BookOpen
              className="w-16 h-16 mx-auto mb-6 opacity-30"
              style={{ color: faction.color }}
            />
            <h1 className="font-display text-3xl text-white mb-4">{error}</h1>
            <p className="font-body text-bone/60 mb-8">
              El articulo que buscas no existe o ha sido eliminado.
            </p>
            <Link href={`/facciones/${factionId}/wiki`}>
              <Button variant="outline">Volver a la Wiki</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main
      className="relative min-h-screen"
      style={{ background: theme?.cssVars['--faction-bg'] || '#030308' }}
    >
      <div className="noise-overlay" />

      <div className="fixed inset-0 pointer-events-none opacity-15">
        <FactionEffects factionId={faction.id} />
      </div>

      <Navigation />

      {/* Hero */}
      <section className="relative pt-28 pb-12">
        {page.hero_image && (
          <div className="absolute inset-0 h-[50vh]">
            <Image
              src={page.hero_image}
              alt={page.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-void/50 via-void/80 to-void" />
          </div>
        )}

        <div className="relative max-w-4xl mx-auto px-6">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 font-body text-sm text-bone/60 mb-8"
          >
            <Link
              href={`/facciones/${factionId}`}
              className="hover:text-bone transition-colors"
            >
              {faction.shortName}
            </Link>
            <span>/</span>
            <Link
              href={`/facciones/${factionId}/wiki`}
              className="hover:text-bone transition-colors"
            >
              Wiki
            </Link>
            {page.category && (
              <>
                <span>/</span>
                <Link
                  href={`/facciones/${factionId}/wiki?categoria=${page.category.slug}`}
                  className="hover:text-bone transition-colors"
                >
                  {page.category.name}
                </Link>
              </>
            )}
          </motion.nav>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {page.category && (
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-body font-semibold mb-4"
                style={{ background: `${faction.color}30`, color: faction.color }}
              >
                {page.category.name}
              </span>
            )}

            <h1
              className="font-display text-4xl md:text-5xl font-black mb-6"
              style={{ color: faction.color }}
            >
              {page.title}
            </h1>

            {page.excerpt && (
              <p className="font-body text-xl text-bone/70 leading-relaxed mb-8">
                {page.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-bone/50 font-body">
              {page.author && (
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {page.author.display_name || page.author.username}
                </span>
              )}
              {page.published_at && (
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(page.published_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              )}
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {page.views_count} lecturas
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="relative py-12">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            {/* Article content */}
            <div
              className="p-8 rounded-2xl"
              style={{
                background: `linear-gradient(180deg, ${faction.color}08 0%, transparent 100%)`,
                border: `1px solid ${faction.color}15`,
              }}
            >
              <WikiRenderer content={page.content} factionColor={faction.color} />
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <Link href={`/facciones/${factionId}/wiki`}>
                <Button variant="ghost" className="gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  Volver a la Wiki
                </Button>
              </Link>

              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={handleShare} className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Compartir
                </Button>
                <Button variant="outline" className="gap-2" disabled>
                  <Edit3 className="w-4 h-4" />
                  Sugerir edicion
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gallery */}
      {page.gallery_images && page.gallery_images.length > 0 && (
        <section className="relative py-12">
          <div className="max-w-7xl mx-auto px-6">
            <h2
              className="font-display text-2xl font-bold mb-8"
              style={{ color: faction.color }}
            >
              Galeria
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {page.gallery_images.map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="relative aspect-square rounded-lg overflow-hidden"
                  style={{ border: `1px solid ${faction.color}20` }}
                >
                  <Image
                    src={img}
                    alt={`${page.title} - imagen ${i + 1}`}
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-500"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Scroll to top */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 rounded-full shadow-lg z-40"
          style={{ background: faction.color }}
        >
          <ChevronUp className="w-5 h-5 text-void" />
        </motion.button>
      )}

      <Footer />
    </main>
  )
}
