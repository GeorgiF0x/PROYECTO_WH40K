'use client'

import { useRef, useState, useCallback, type ReactNode } from 'react'
import Link from 'next/link'
import * as Popover from '@radix-ui/react-popover'
import { Eye } from 'lucide-react'
import { GothicCorners } from './WikiDecorations'

/* ─── Types ─────────────────────────────────────────── */

interface WikiPreviewData {
  title: string
  excerpt: string | null
  hero_image: string | null
  category: { name: string } | null
  views_count: number
  faction_id: string
}

interface WikiLinkPreviewProps {
  href: string
  factionId: string
  slug: string
  factionColor?: string
  children: ReactNode
}

/* ─── Component ─────────────────────────────────────── */

export function WikiLinkPreview({
  href,
  factionId,
  slug,
  factionColor = '#C9A227',
  children,
}: WikiLinkPreviewProps) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<WikiPreviewData | null>(null)
  const [loading, setLoading] = useState(false)
  const [errored, setErrored] = useState(false)
  const cache = useRef<Map<string, WikiPreviewData>>(new Map())
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cacheKey = `${factionId}--${slug}`

  const fetchPreview = useCallback(async () => {
    if (cache.current.has(cacheKey)) {
      setData(cache.current.get(cacheKey)!)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/wiki/${cacheKey}`)
      if (!res.ok) throw new Error('not found')
      const json = await res.json()
      const fallbackImage = Array.isArray(json.gallery_images) ? json.gallery_images[0] : null
      const preview: WikiPreviewData = {
        title: json.title,
        excerpt: json.excerpt,
        hero_image: json.hero_image || fallbackImage,
        category: json.category,
        views_count: json.views_count ?? 0,
        faction_id: json.faction_id,
      }
      cache.current.set(cacheKey, preview)
      setData(preview)
    } catch {
      setErrored(true)
    } finally {
      setLoading(false)
    }
  }, [cacheKey])

  const handleEnter = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    openTimer.current = setTimeout(() => {
      setOpen(true)
      if (!data && !errored) fetchPreview()
    }, 200)
  }, [data, errored, fetchPreview])

  const handleLeave = useCallback(() => {
    if (openTimer.current) {
      clearTimeout(openTimer.current)
      openTimer.current = null
    }
    closeTimer.current = setTimeout(() => setOpen(false), 250)
  }, [])

  // If fetch errored, just render a normal link
  if (errored) {
    return (
      <Link
        href={href}
        className="underline decoration-dotted underline-offset-2 hover:decoration-solid transition-all"
        style={{ color: factionColor }}
      >
        {children}
      </Link>
    )
  }

  return (
    <Popover.Root open={open}>
      <Popover.Trigger asChild>
        <Link
          href={href}
          className="underline decoration-dotted underline-offset-2 hover:decoration-solid transition-all"
          style={{ color: factionColor }}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          {children}
        </Link>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="top"
          sideOffset={8}
          align="center"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          className="z-50 w-80 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div
            className="relative overflow-hidden rounded-xl bg-void-950"
            style={{
              border: `1px solid ${factionColor}25`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 20px ${factionColor}15`,
            }}
          >
            <GothicCorners className={`text-[${factionColor}]/30`} size={12} />

            {/* Thumbnail */}
            {loading ? (
              <div className="h-36 w-full animate-pulse bg-void-800" />
            ) : data?.hero_image ? (
              <div className="relative h-36 w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.hero_image}
                  alt={data.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-transparent to-transparent" />
              </div>
            ) : (
              <div className="h-20 w-full bg-void-900" />
            )}

            {/* Content */}
            <div className="px-3.5 pb-3 pt-2 space-y-1.5">
              {loading ? (
                <>
                  <div className="h-4 w-3/4 animate-pulse rounded bg-void-800" />
                  <div className="h-3 w-full animate-pulse rounded bg-void-800" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-void-800" />
                </>
              ) : data ? (
                <>
                  <h4 className="font-display text-sm font-bold text-white leading-tight line-clamp-1">
                    {data.title}
                  </h4>

                  {data.excerpt && (
                    <p className="font-body text-xs text-bone/55 leading-relaxed line-clamp-2">
                      {data.excerpt}
                    </p>
                  )}

                  {/* Meta row */}
                  <div className="flex items-center gap-2 pt-0.5">
                    {data.category && (
                      <span
                        className="inline-block rounded-full px-2 py-0.5 text-[10px] font-mono font-medium"
                        style={{
                          background: `${factionColor}15`,
                          color: factionColor,
                          border: `1px solid ${factionColor}30`,
                        }}
                      >
                        {data.category.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[10px] font-mono text-bone/40">
                      <Eye className="h-2.5 w-2.5" />
                      {data.views_count.toLocaleString()}
                    </span>
                  </div>
                </>
              ) : null}
            </div>

            {/* Bottom glow line */}
            <div
              className="h-px w-full"
              style={{
                background: `linear-gradient(90deg, transparent, ${factionColor}50, transparent)`,
              }}
            />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
