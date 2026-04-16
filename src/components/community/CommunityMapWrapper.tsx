'use client'

import { useRef, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import type { Store } from '@/lib/types/database.types'

const CommunityMap = dynamic(() => import('./CommunityMap'), {
  ssr: false,
  loading: () => <MapPlaceholder />,
})

function MapPlaceholder() {
  return (
    <div className="flex h-full min-h-[400px] w-full animate-pulse items-center justify-center rounded-xl border border-bone/10 bg-void-light">
      <Loader2 className="h-8 w-8 animate-spin text-imperial-gold/40" />
    </div>
  )
}

interface CommunityMapWrapperProps {
  stores: Pick<
    Store,
    | 'id'
    | 'name'
    | 'slug'
    | 'latitude'
    | 'longitude'
    | 'city'
    | 'store_type'
    | 'avg_rating'
    | 'review_count'
  >[]
  className?: string
  center?: [number, number]
  zoom?: number
  interactive?: boolean
}

export default function CommunityMapWrapper(props: CommunityMapWrapperProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={props.className} style={{ minHeight: 400 }}>
      {visible ? <CommunityMap {...props} /> : <MapPlaceholder />}
    </div>
  )
}
