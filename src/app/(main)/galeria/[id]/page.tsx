'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { Avatar } from '@/components/ui'
import {
  Heart,
  MessageCircle,
  Share2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Eye,
  Flag,
  Pencil,
  Trash2,
  SendHorizontal,
  X,
  Maximize2,
  Shield,
} from 'lucide-react'
import type { Miniature, Profile } from '@/lib/types/database.types'

const HolographicDisplay = dynamic(
  () => import('@/components/holographic'),
  {
    ssr: false,
    loading: () => <HoloFallback />,
  }
)

function HoloFallback() {
  return (
    <div className="relative aspect-square bg-void rounded-lg overflow-hidden flex items-center justify-center">
      <NecronCorner position="tl" />
      <NecronCorner position="tr" />
      <NecronCorner position="bl" />
      <NecronCorner position="br" />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-gradient-radial from-necron-teal/10 via-transparent to-transparent animate-pulse-glow" />

      {/* Scan line */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="w-full h-px bg-necron-teal/30 animate-scan" />
      </div>

      <p className="text-xs font-body uppercase tracking-[0.2em] text-necron-dark/60 animate-pulse">
        Inicializando escáner...
      </p>
    </div>
  )
}

// Necron angular circuit-trace filigree corner — geometric, cold, technological
function NecronCorner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const posClass = { tl: 'top-0 left-0', tr: 'top-0 right-0', bl: 'bottom-0 left-0', br: 'bottom-0 right-0' }[position]
  const flip = { tl: undefined, tr: 'scaleX(-1)', bl: 'scaleY(-1)', br: 'scale(-1)' }[position]

  return (
    <svg
      viewBox="0 0 60 60"
      className={`absolute w-14 h-14 text-necron-teal pointer-events-none ${posClass}`}
      style={flip ? { transform: flip } : undefined}
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
    >
      {/* Main angular L-arm — sharp 90° Necron geometry */}
      <path d="M0 60 V14 H6 V6 H14 V0 H60" strokeWidth="1.5" opacity="0.45" />
      {/* Inner parallel trace — circuit doubling */}
      <path d="M6 52 V20 H12 V12 H20 V6 H52" strokeWidth="0.75" opacity="0.18" />
      {/* T-junction node at elbow */}
      <path d="M14 20 H20 V14" strokeWidth="1" opacity="0.3" />
      {/* Circuit node — square, not circle */}
      <rect x="11" y="11" width="4" height="4" fill="currentColor" opacity="0.3" stroke="none" />
      {/* Arm accent nodes */}
      <rect x="36" y="1" width="2.5" height="2.5" fill="currentColor" opacity="0.2" stroke="none" />
      <rect x="1" y="36" width="2.5" height="2.5" fill="currentColor" opacity="0.2" stroke="none" />
      {/* Gauss energy dot at terminus */}
      <rect x="52" y="1" width="2" height="2" fill="currentColor" opacity="0.15" stroke="none" />
    </svg>
  )
}

// Gauss data grid — network of nodes with faint connections (Necron tech)
const GRID_NODES = Array.from({ length: 28 }, (_, i) => ({
  left: `${(i * 7.9 + 11.3) % 96 + 2}%`,
  top: `${(i * 12.3 + 7.1) % 96 + 2}%`,
  size: i % 6 === 0 ? 2.5 : i % 3 === 0 ? 1.5 : 1,
  opacity: i % 6 === 0 ? 0.25 : i % 3 === 0 ? 0.15 : 0.08,
  pulse: i % 5 === 0,
  pulseDur: 3 + (i % 4) * 1.2,
  pulseDelay: (i % 5) * 0.7,
}))

function GaussGrid() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {GRID_NODES.map((n, i) =>
        n.pulse ? (
          <motion.div
            key={i}
            className="absolute bg-necron-teal"
            style={{ left: n.left, top: n.top, width: n.size, height: n.size }}
            animate={{ opacity: [n.opacity * 0.4, n.opacity * 1.8, n.opacity * 0.4] }}
            transition={{ duration: n.pulseDur, repeat: Infinity, delay: n.pulseDelay, ease: 'easeInOut' }}
          />
        ) : (
          <div
            key={i}
            className="absolute bg-necron-teal"
            style={{ left: n.left, top: n.top, width: n.size, height: n.size, opacity: n.opacity }}
          />
        )
      )}
    </div>
  )
}

// Floating gauss embers — small energy particles
const EMBER_SEEDS = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: `${(i * 14 + 7) % 88 + 6}%`,
  top: `${(i * 19 + 12) % 78 + 11}%`,
  drift: (i % 2 === 0 ? -1 : 1) * (16 + (i % 3) * 10),
  dur: 5 + (i % 4) * 1.8,
  delay: i * 0.6,
  size: i % 3 === 0 ? 1.5 : 1,
}))

function GaussEmbers() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {EMBER_SEEDS.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-necron/50"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
          animate={{
            y: [0, p.drift, 0],
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// Triarch Ankh SVG icon — reusable
function TriarchAnkh({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size * 1.33} viewBox="0 0 24 32" fill="none" className={className}>
      <ellipse cx="12" cy="9" rx="6" ry="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="12" y1="17" x2="12" y2="30" stroke="currentColor" strokeWidth="1.5" />
      <line x1="6" y1="22" x2="18" y2="22" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  )
}

// Section divider with Necron glyphs
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-necron-teal/15" />
      <div className="flex items-center gap-2">
        <div className="w-1 h-1 bg-necron-teal/30" />
        <span className="text-xs font-body uppercase tracking-[0.2em] text-necron-dark/50">
          {label}
        </span>
        <div className="w-1 h-1 bg-necron-teal/30" />
      </div>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-necron-teal/15" />
    </div>
  )
}

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: Profile
}

export default function MiniatureDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile, isAuthenticated } = useAuth()
  const [miniature, setMiniature] = useState<(Miniature & { profiles: Profile }) | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [showLightbox, setShowLightbox] = useState(false)
  const [relatedMiniatures, setRelatedMiniatures] = useState<Miniature[]>([])

  const supabase = createClient()
  const miniatureId = typeof params.id === 'string' ? params.id : params.id?.[0]

  useEffect(() => {
    if (miniatureId) {
      fetchMiniature()
      fetchComments()
      fetchRelatedMiniatures()
    }
  }, [miniatureId])

  // Increment view count (fire-and-forget, only if not the owner)
  useEffect(() => {
    if (miniatureId && miniature && user?.id !== miniature.user_id) {
      supabase.rpc('increment_view_count', { p_miniature_id: miniatureId })
    }
  }, [miniatureId, miniature?.user_id])

  // Check if user has liked this miniature
  useEffect(() => {
    if (miniatureId && user?.id) {
      checkIfLiked()
    }
  }, [miniatureId, user?.id])

  const checkIfLiked = async () => {
    if (!user?.id) return
    const { data } = await supabase
      .from('miniature_likes')
      .select('id')
      .eq('miniature_id', miniatureId as string)
      .eq('user_id', user.id)
      .single()

    setIsLiked(!!data)
  }

  const fetchMiniature = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('miniatures')
      .select(`
        *,
        profiles:user_id (*)
      `)
      .eq('id', miniatureId as string)
      .single()

    if (error) {
      console.error('Error fetching miniature:', error)
    } else {
      setMiniature(data)
      setLikesCount((data as unknown as { likes_count?: number }).likes_count || 0)
    }
    setIsLoading(false)
  }

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('miniature_comments')
      .select(`
        *,
        profiles:user_id (*)
      `)
      .eq('miniature_id', miniatureId as string)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setComments(data)
    }
  }

  const fetchRelatedMiniatures = async () => {
    const { data } = await supabase
      .from('miniatures')
      .select('*')
      .neq('id', miniatureId as string)
      .limit(4)

    if (data) {
      setRelatedMiniatures(data)
    }
  }

  const handleLike = async () => {
    if (!isAuthenticated || !user?.id) {
      router.push('/login')
      return
    }

    const wasLiked = isLiked
    setIsLiked(!wasLiked)
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1))

    if (wasLiked) {
      const { error } = await supabase
        .from('miniature_likes')
        .delete()
        .eq('miniature_id', miniatureId as string)
        .eq('user_id', user.id)

      if (error) {
        setIsLiked(true)
        setLikesCount((prev) => prev + 1)
        console.error('Error removing like:', error)
      }
    } else {
      const { error } = await supabase
        .from('miniature_likes')
        .insert({
          miniature_id: miniatureId as string,
          user_id: user.id,
        })

      if (error) {
        setIsLiked(false)
        setLikesCount((prev) => prev - 1)
        console.error('Error adding like:', error)
      }
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !isAuthenticated || !user?.id) return

    setIsSubmittingComment(true)
    const { error } = await supabase.from('miniature_comments').insert({
      miniature_id: miniatureId as string,
      user_id: user.id,
      content: newComment.trim(),
    })

    if (!error) {
      setNewComment('')
      fetchComments()
    }
    setIsSubmittingComment(false)
  }

  const handleDelete = async () => {
    if (!miniature || !user?.id || user.id !== miniature.user_id) return

    const confirmed = confirm('¿Estas seguro de que quieres eliminar esta miniatura? Esta accion no se puede deshacer.')
    if (!confirmed) return

    setIsDeleting(true)

    if (miniature.images?.length) {
      const filePaths = miniature.images.map((url) => {
        const parts = url.split('/miniatures/')
        return parts.length > 1 ? parts[1] : ''
      }).filter(Boolean)

      if (filePaths.length > 0) {
        await supabase.storage.from('miniatures').remove(filePaths)
      }
    }

    const { error } = await supabase
      .from('miniatures')
      .delete()
      .eq('id', miniature.id)

    if (error) {
      console.error('Error deleting miniature:', error)
      setIsDeleting(false)
      return
    }

    router.push('/mi-galeria')
  }

  const nextImage = () => {
    if (miniature?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % miniature.images.length)
    }
  }

  const prevImage = () => {
    if (miniature?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + miniature.images.length) % miniature.images.length)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-void-light rounded-2xl animate-pulse" />
            <div className="space-y-6">
              <div className="h-10 bg-void-light rounded-lg w-3/4 animate-pulse" />
              <div className="h-4 bg-void-light rounded w-full animate-pulse" />
              <div className="h-4 bg-void-light rounded w-2/3 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!miniature) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold text-bone mb-4">
            Miniatura no encontrada
          </h2>
          <Link href="/galeria">
            <motion.button
              className="px-6 py-3 bg-necron-teal text-void font-semibold rounded-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Volver a la galeria
            </motion.button>
          </Link>
        </div>
      </div>
    )
  }

  const images = miniature.images?.length ? miniature.images : [miniature.thumbnail_url || '/placeholder-miniature.jpg']

  return (
    <>
      <div className="min-h-screen pt-24 pb-16 relative">
        {/* === Atmospheric Background — lighter than gallery listing === */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {/* Teal aurora */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(13,155,138,0.06)_0%,transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,212,170,0.04)_0%,transparent_45%)]" />

          {/* Breathing aurora */}
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(13,155,138,0.04)_0%,transparent_50%)]"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Holographic dot grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(0,255,135,0.2) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }}
          />

          {/* Single scan line */}
          <motion.div
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-necron-dark/15 to-transparent"
            style={{ top: '40%' }}
            animate={{ opacity: [0, 0, 0.5, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', times: [0, 0.85, 0.92, 1] }}
          />
        </div>

        {/* Back Button */}
        <div className="relative z-10 px-6 mb-6">
          <div className="max-w-7xl mx-auto">
            <motion.button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-bone/60 hover:text-necron-dark transition-colors"
              whileHover={{ x: -4 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-body">Volver</span>
            </motion.button>
          </div>
        </div>

        <div className="relative z-10 px-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* ── Solemnace Specimen Header ─────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-2"
            >
              <div className="relative bg-void-light/30 backdrop-blur-sm rounded-xl p-5 overflow-hidden">
                {/* Necron angular filigree corners */}
                <NecronCorner position="tl" />
                <NecronCorner position="tr" />
                <NecronCorner position="bl" />
                <NecronCorner position="br" />

                {/* Gauss data grid background */}
                <GaussGrid />

                {/* Teal vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(13,155,138,0.06)_0%,transparent_60%)] pointer-events-none" />

                {/* Floating gauss embers */}
                <GaussEmbers />

                {/* Traveling gauss shimmer along top edge */}
                <motion.div
                  className="absolute top-0 left-0 w-24 h-[2px] bg-gradient-to-r from-transparent via-necron-dark/50 to-transparent pointer-events-none"
                  animate={{ left: ['-10%', '110%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                />

                <div className="relative flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    {/* Pulsing Triarch Ankh */}
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0 bg-necron-teal/20 rounded-lg blur-sm"
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <div className="relative p-2 bg-necron-teal/10 rounded-lg border border-necron-teal/20">
                        <motion.div
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <TriarchAnkh size={18} className="text-necron-dark" />
                        </motion.div>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-mono uppercase tracking-[0.25em] text-necron-dark/70 block">
                        Solemnace <span className="text-necron-teal/30">◆</span> Registro de Espécimen
                      </span>
                      <span className="text-[10px] font-mono text-bone/30 tracking-wider">
                        REF: {miniature.id.slice(0, 8).toUpperCase()} <span className="text-necron-teal/20">◆</span> FECHA REGISTRO: {new Date(miniature.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-bone/40 text-xs font-mono">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      {miniature.view_count ?? 0} inspecciones
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-necron-dark/60" />
                      Catalogado
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Two-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-8 lg:gap-10">
              {/* LEFT: Holographic Display */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                {/* Holo Display with Necron filigree corners */}
                <div className="relative animate-holo-flicker">
                  <NecronCorner position="tl" />
                  <NecronCorner position="tr" />
                  <NecronCorner position="bl" />
                  <NecronCorner position="br" />

                  <div className="aspect-square rounded-lg overflow-hidden bg-void border border-bone/5">
                    <HolographicDisplay
                      imageUrl={images[currentImageIndex]}
                      allImageUrls={images}
                    />
                  </div>

                  {/* Navigation arrows */}
                  {images.length > 1 && (
                    <>
                      <motion.button
                        onClick={prevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-void/80 backdrop-blur-sm rounded-full text-bone border border-bone/10 z-10"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={nextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-void/80 backdrop-blur-sm rounded-full text-bone border border-bone/10 z-10"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    </>
                  )}

                  {/* Image counter */}
                  {images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-void/80 backdrop-blur-sm rounded-full text-xs text-bone/70 border border-bone/10 z-10">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  )}
                </div>

                {/* Thumbnails + Detail button row */}
                <div className="flex items-center gap-3">
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto flex-1">
                      {images.map((img, idx) => (
                        <motion.button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border ${
                            idx === currentImageIndex
                              ? 'border-necron-teal ring-1 ring-necron-teal/30'
                              : 'border-bone/10 opacity-50 hover:opacity-100'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Image src={img} alt="" fill className="object-cover" />
                        </motion.button>
                      ))}
                    </div>
                  )}
                  <motion.button
                    onClick={() => setShowLightbox(true)}
                    className="relative flex items-center gap-2 px-4 py-2.5 border border-necron-teal/30 text-necron-dark rounded-lg text-xs font-body uppercase tracking-wider hover:bg-necron-teal/10 transition-colors flex-shrink-0 overflow-hidden"
                    whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(13,155,138,0.15)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Maximize2 className="w-4 h-4" />
                    Ver detalle
                  </motion.button>
                </div>
              </motion.div>

              {/* RIGHT: Info Panel */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-5"
              >
                {/* DESIGNACION */}
                <div>
                  <span className="text-xs font-body uppercase tracking-[0.2em] text-necron-dark/50 mb-1 block">
                    Designacion
                  </span>
                  <div className="border-l-2 border-necron-teal pl-4">
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-bone">
                      {miniature.title}
                    </h1>
                  </div>
                </div>

                {/* OPERARIO */}
                <div className="border border-bone/10 rounded-lg p-4 bg-void-light/30">
                  <span className="text-xs font-body uppercase tracking-[0.2em] text-necron-dark/50 mb-3 block">
                    Operario
                  </span>
                  <Link href={`/usuarios/${miniature.profiles.username}`}>
                    <motion.div
                      className="flex items-center gap-4 hover:bg-void-light/40 -m-2 p-2 rounded-lg transition-colors group"
                      whileHover={{ scale: 1.01 }}
                    >
                      <Avatar
                        src={miniature.profiles.avatar_url}
                        alt={miniature.profiles.display_name || miniature.profiles.username}
                        fallback={miniature.profiles.username}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold text-bone group-hover:text-necron-dark transition-colors truncate">
                          {miniature.profiles.display_name || miniature.profiles.username}
                        </p>
                        <p className="text-sm text-bone/50">@{miniature.profiles.username}</p>
                      </div>
                      <motion.span
                        className="px-3 py-1.5 bg-necron-teal/10 border border-necron-teal/30 text-necron-dark font-semibold text-xs rounded-md"
                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(13, 155, 138, 0.2)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => e.preventDefault()}
                      >
                        Seguir
                      </motion.span>
                    </motion.div>
                  </Link>
                </div>

                {/* INFORME TACTICO */}
                {miniature.description && (
                  <div className="border border-bone/10 rounded-lg p-4 bg-void-light/30">
                    <span className="text-xs font-body uppercase tracking-[0.2em] text-necron-dark/50 mb-2 block">
                      Informe Tactico
                    </span>
                    <p className="text-bone/70 font-body leading-relaxed text-sm">
                      {miniature.description}
                    </p>
                  </div>
                )}

                {/* Owner actions */}
                {user?.id === miniature.user_id && (
                  <div className="flex items-center gap-2">
                    <Link href={`/mi-galeria/editar/${miniature.id}`} className="flex-1">
                      <motion.button
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-necron-teal/30 text-necron-dark rounded-lg text-sm font-semibold hover:bg-necron-teal/10 transition-colors"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Pencil className="w-4 h-4" />
                        Editar
                      </motion.button>
                    </Link>
                    <motion.button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 border border-red-500/30 text-red-400 rounded-lg text-sm font-semibold hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </motion.button>
                  </div>
                )}

                {/* Actions: Like, Share, Report */}
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                      isLiked
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-void-light border border-bone/10 text-bone hover:border-red-500/30 hover:text-red-400'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-400' : ''}`} />
                    <span>{likesCount}</span>
                  </motion.button>

                  <motion.button
                    className="flex items-center gap-2 px-4 py-2.5 bg-void-light border border-bone/10 text-bone hover:border-bone/30 rounded-lg font-semibold text-sm transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Share2 className="w-4 h-4" />
                    Compartir
                  </motion.button>

                  <motion.button
                    className="p-2.5 bg-void-light border border-bone/10 text-bone/50 hover:text-red-400 hover:border-red-500/30 rounded-lg transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Flag className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* REGISTRO DE COMUNICACIONES — Comments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <SectionDivider label="Registro de Comunicaciones" />
              <div className="border border-bone/10 rounded-lg p-5 bg-void-light/30">
                <h3 className="text-sm font-display font-bold text-bone mb-4 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-necron-dark" />
                  Comentarios ({comments.length})
                </h3>

                {/* Comment Input */}
                {isAuthenticated ? (
                  <div className="flex gap-3 mb-5">
                    <Avatar
                      src={profile?.avatar_url}
                      alt={profile?.display_name || profile?.username || 'Tu avatar'}
                      fallback={profile?.username || user?.email?.charAt(0).toUpperCase()}
                      size="sm"
                    />
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Escribe un comentario..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                        className="w-full px-4 py-2.5 pr-12 bg-void border border-bone/10 rounded-lg text-sm text-bone placeholder:text-bone/30 focus:outline-none focus:border-necron-teal/50"
                      />
                      <motion.button
                        onClick={handleSubmitComment}
                        disabled={!newComment.trim() || isSubmittingComment}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-necron-dark disabled:text-bone/30 disabled:cursor-not-allowed"
                        whileHover={newComment.trim() ? { scale: 1.1 } : {}}
                        whileTap={newComment.trim() ? { scale: 0.9 } : {}}
                      >
                        <SendHorizontal className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <Link href="/login">
                    <div className="p-3 bg-void rounded-lg text-center mb-5 hover:bg-void-light/50 transition-colors cursor-pointer border border-bone/5">
                      <p className="text-bone/60 text-sm">
                        <span className="text-necron-dark">Inicia sesion</span> para comentar
                      </p>
                    </div>
                  </Link>
                )}

                {/* Comments List */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {comments.length === 0 ? (
                    <p className="text-bone/40 text-center py-6 text-sm">
                      Se el primero en comentar
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 p-3 bg-void rounded-lg border border-bone/5"
                      >
                        <Avatar
                          src={comment.profiles.avatar_url}
                          alt={comment.profiles.display_name || comment.profiles.username}
                          fallback={comment.profiles.username}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-bone text-sm truncate">
                              {comment.profiles.display_name || comment.profiles.username}
                            </span>
                            <span className="text-xs text-bone/40 flex-shrink-0">
                              {new Date(comment.created_at).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                          <p className="text-bone/70 text-sm">{comment.content}</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>

            {/* REGISTROS RELACIONADOS */}
            {relatedMiniatures.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <SectionDivider label="Registros Relacionados" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {relatedMiniatures.map((m) => (
                    <Link key={m.id} href={`/galeria/${m.id}`}>
                      <motion.div
                        className="relative aspect-square rounded-lg overflow-hidden group border border-bone/5"
                        whileHover={{ scale: 1.02 }}
                      >
                        <Image
                          src={m.thumbnail_url || m.images?.[0] || '/placeholder-miniature.jpg'}
                          alt={m.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-void/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-3 left-3 right-3">
                            <p className="font-display font-bold text-bone text-xs truncate">
                              {m.title}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </motion.section>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-void/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8"
            onClick={() => setShowLightbox(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setShowLightbox(false)
              if (e.key === 'ArrowLeft') prevImage()
              if (e.key === 'ArrowRight') nextImage()
            }}
            tabIndex={0}
            ref={(el) => el?.focus()}
          >
            {/* Top bar */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-5xl flex items-center justify-between mb-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <TriarchAnkh size={12} className="text-necron-teal/50 flex-shrink-0" />
                <span className="text-xs font-body uppercase tracking-[0.2em] text-necron-dark/50">
                  Solemnace <span className="text-necron-teal/25">◆</span> Visor Prismático
                </span>
                {images.length > 1 && (
                  <span className="text-xs font-body text-bone/40 ml-2">
                    {currentImageIndex + 1} / {images.length}
                  </span>
                )}
              </div>
              <motion.button
                onClick={() => setShowLightbox(false)}
                className="flex items-center gap-2 px-3 py-1.5 border border-bone/10 rounded-md text-bone/60 hover:text-bone hover:border-bone/30 transition-colors text-xs font-body uppercase tracking-wider"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-3.5 h-3.5" />
                Cerrar
              </motion.button>
            </motion.div>

            {/* Image container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-5xl w-full flex-1 min-h-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Necron filigree corners */}
              <NecronCorner position="tl" />
              <NecronCorner position="tr" />
              <NecronCorner position="bl" />
              <NecronCorner position="br" />

              <div className="relative w-full h-full flex items-center justify-center border border-bone/5 rounded-lg bg-void-light/20 overflow-hidden">
                <Image
                  src={images[currentImageIndex]}
                  alt={miniature.title}
                  width={1400}
                  height={1400}
                  className="object-contain max-h-[70vh] w-auto"
                  priority
                />

                {/* Scan line overlay */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                  <div className="w-full h-px bg-necron-teal/30 animate-scan" />
                </div>
              </div>

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <motion.button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-3 bg-void/80 backdrop-blur-sm rounded-full text-bone border border-bone/10"
                    whileHover={{ scale: 1.1, borderColor: 'rgba(13, 155, 138, 0.4)' }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-void/80 backdrop-blur-sm rounded-full text-bone border border-bone/10"
                    whileHover={{ scale: 1.1, borderColor: 'rgba(13, 155, 138, 0.4)' }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </>
              )}
            </motion.div>

            {/* Bottom thumbnails */}
            {images.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex gap-2 mt-4 overflow-x-auto max-w-5xl"
                onClick={(e) => e.stopPropagation()}
              >
                {images.map((img, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0 border transition-all ${
                      idx === currentImageIndex
                        ? 'border-necron-teal ring-1 ring-necron-teal/30 opacity-100'
                        : 'border-bone/10 opacity-40 hover:opacity-80'
                    }`}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </motion.button>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
