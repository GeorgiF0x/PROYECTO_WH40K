'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Play, ExternalLink, Youtube, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoInfo {
  title: string
  thumbnail: string
  url: string
}

interface YouTubeVideoCardProps {
  videoUrl: string
  index?: number
}

// Administratum corner SVG - matches the profile design
function AdministratumCorner({ position, color = 'rgba(239,68,68,0.5)' }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'; color?: string }) {
  const flip = {
    'top-left': '',
    'top-right': 'scaleX(-1)',
    'bottom-left': 'scaleY(-1)',
    'bottom-right': 'scale(-1)',
  }[position]

  const posClass = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
  }[position]

  return (
    <div className={`absolute ${posClass} w-[40px] h-[40px] pointer-events-none z-20`} style={{ transform: flip }}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M0 40 V12 L6 6 L12 0 H40" stroke={color} strokeWidth="1.5" fill="none" />
        <path d="M3 40 V14 L8 8 L14 3 H40" stroke={color.replace(/[\d.]+\)$/, '0.25)')} strokeWidth="0.8" fill="none" />
        <line x1="6" y1="2" x2="6" y2="10" stroke={color.replace(/[\d.]+\)$/, '0.35)')} strokeWidth="0.8" />
        <line x1="2" y1="6" x2="10" y2="6" stroke={color.replace(/[\d.]+\)$/, '0.35)')} strokeWidth="0.8" />
        <rect x="18" y="-1" width="3" height="3" transform="rotate(45 19.5 0.5)" fill={color.replace(/[\d.]+\)$/, '0.4)')} />
        <rect x="-1" y="18" width="3" height="3" transform="rotate(45 0.5 19.5)" fill={color.replace(/[\d.]+\)$/, '0.4)')} />
      </svg>
    </div>
  )
}

// Extract video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function YouTubeVideoCard({ videoUrl, index = 0 }: YouTubeVideoCardProps) {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const videoId = extractVideoId(videoUrl)

    if (!videoId) {
      setError(true)
      setLoading(false)
      return
    }

    const thumbnail = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`

    fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`)
      .then(res => res.json())
      .then(data => {
        setVideoInfo({
          title: data.title || 'Video de YouTube',
          thumbnail,
          url: videoUrl
        })
        setLoading(false)
      })
      .catch(() => {
        setVideoInfo({
          title: 'Video de YouTube',
          thumbnail,
          url: videoUrl
        })
        setLoading(false)
      })
  }, [videoUrl])

  if (loading) {
    return (
      <div className="aspect-video rounded-xl bg-void-light/50 border border-red-500/20 flex items-center justify-center relative overflow-hidden">
        <AdministratumCorner position="top-left" color="rgba(239,68,68,0.3)" />
        <AdministratumCorner position="top-right" color="rgba(239,68,68,0.3)" />
        <AdministratumCorner position="bottom-left" color="rgba(239,68,68,0.3)" />
        <AdministratumCorner position="bottom-right" color="rgba(239,68,68,0.3)" />
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.05), transparent)',
          }}
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-8 h-8 text-red-500/50" />
        </motion.div>
      </div>
    )
  }

  if (error || !videoInfo) {
    return (
      <div className="aspect-video rounded-xl bg-void-light/50 border border-red-500/20 flex flex-col items-center justify-center gap-2 text-bone/50 relative overflow-hidden">
        <AdministratumCorner position="top-left" color="rgba(239,68,68,0.3)" />
        <AdministratumCorner position="top-right" color="rgba(239,68,68,0.3)" />
        <AlertCircle className="w-8 h-8 text-red-500/50" />
        <span className="text-xs font-mono">TRANSMISION INTERRUMPIDA</span>
      </div>
    )
  }

  return (
    <motion.a
      href={videoInfo.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
      className="group relative block overflow-hidden rounded-xl"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Main card with Administratum styling */}
      <motion.div
        className="relative border border-red-500/30 rounded-xl overflow-hidden bg-void-light/50 backdrop-blur-sm"
        whileHover={{
          boxShadow: '0 0 30px rgba(239,68,68,0.2)',
          borderColor: 'rgba(239,68,68,0.5)',
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Administratum corners */}
        <AdministratumCorner position="top-left" color="rgba(239,68,68,0.5)" />
        <AdministratumCorner position="top-right" color="rgba(239,68,68,0.5)" />
        <AdministratumCorner position="bottom-left" color="rgba(239,68,68,0.4)" />
        <AdministratumCorner position="bottom-right" color="rgba(239,68,68,0.4)" />

        {/* Thumbnail section */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={videoInfo.thumbnail}
            alt={videoInfo.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-all duration-700 group-hover:scale-110"
          />

          {/* Scanlines overlay */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
            }}
          />

          {/* Ledger lines - Administratum style */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-px bg-red-500"
                style={{ top: `${(i + 1) * 15}%` }}
              />
            ))}
          </div>

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent opacity-80" />
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(239,68,68,0.08) 100%)',
            }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="relative"
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {/* Pulsing outer ring */}
              <motion.div
                className="absolute -inset-4 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 70%)',
                }}
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Main button */}
              <motion.div
                className="relative w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
                  boxShadow: '0 0 25px rgba(239,68,68,0.5), inset 0 2px 0 rgba(255,255,255,0.2)',
                }}
                whileHover={{
                  boxShadow: '0 0 40px rgba(239,68,68,0.7)',
                }}
              >
                <div
                  className="absolute inset-1 rounded-full opacity-20"
                  style={{ background: 'linear-gradient(135deg, white 0%, transparent 50%)' }}
                />
                <Play className="w-6 h-6 text-white ml-1 relative z-10" fill="white" />
              </motion.div>
            </motion.div>
          </div>

          {/* VOX-CAST badge */}
          <motion.div
            className="absolute top-3 left-10"
            animate={{ y: isHovered ? 0 : -2 }}
          >
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded backdrop-blur-md"
              style={{
                background: 'linear-gradient(135deg, rgba(239,68,68,0.9), rgba(185,28,28,0.9))',
                boxShadow: '0 2px 10px rgba(239,68,68,0.4)',
              }}
            >
              <Youtube className="w-3.5 h-3.5 text-white" />
              <span className="text-[10px] text-white font-bold tracking-wider">VOX-CAST</span>
            </div>
          </motion.div>

          {/* External link */}
          <motion.div
            className="absolute top-3 right-10"
            animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-1.5 rounded bg-void/70 backdrop-blur-sm border border-red-500/30">
              <ExternalLink className="w-3.5 h-3.5 text-red-400" />
            </div>
          </motion.div>
        </div>

        {/* Title section - Parchment style */}
        <div
          className="relative p-3"
          style={{
            background: 'linear-gradient(180deg, rgba(20,18,15,0.95), rgba(15,13,10,0.98))',
          }}
        >
          {/* Subtle texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(239,68,68,0.5) 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />

          {/* Title */}
          <motion.h4
            className="relative text-sm font-medium text-bone/90 line-clamp-2 leading-snug group-hover:text-red-300 transition-colors"
            animate={{ x: isHovered ? 2 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {videoInfo.title}
          </motion.h4>

          {/* Progress line */}
          <motion.div
            className="absolute bottom-0 left-0 h-0.5"
            style={{
              background: 'linear-gradient(90deg, #ef4444, #dc2626)',
            }}
            initial={{ width: '0%' }}
            animate={{ width: isHovered ? '100%' : '0%' }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(239,68,68,0.08) 50%, transparent 60%)',
          }}
          animate={{ x: isHovered ? ['0%', '200%'] : '0%' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </motion.div>
    </motion.a>
  )
}

// Grid component
interface YouTubeVideoGridProps {
  videoUrls: string[]
  maxVideos?: number
}

export function YouTubeVideoGrid({ videoUrls, maxVideos = 3 }: YouTubeVideoGridProps) {
  const videosToShow = videoUrls.slice(0, maxVideos)

  if (videosToShow.length === 0) return null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <motion.div
          className="relative"
          animate={{
            filter: [
              'drop-shadow(0 0 4px rgba(239,68,68,0.4))',
              'drop-shadow(0 0 10px rgba(239,68,68,0.7))',
              'drop-shadow(0 0 4px rgba(239,68,68,0.4))',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              boxShadow: '0 4px 15px rgba(239,68,68,0.3)',
            }}
          >
            <Youtube className="w-4 h-4 text-white" />
          </div>
        </motion.div>
        <div>
          <h3 className="font-display font-bold text-bone text-sm tracking-wide">TRANSMISIONES VOX</h3>
          <p className="text-[10px] text-bone/40 font-mono tracking-wider">CONTENIDO EN VIDEO</p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-[10px] font-mono text-red-400/70 tracking-widest">ACTIVO</span>
        </div>
      </div>

      {/* Grid */}
      <div className={cn(
        'grid gap-4',
        videosToShow.length === 1 ? 'grid-cols-1' :
        videosToShow.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      )}>
        {videosToShow.map((url, index) => (
          <YouTubeVideoCard key={`${url}-${index}`} videoUrl={url} index={index} />
        ))}
      </div>
    </div>
  )
}
