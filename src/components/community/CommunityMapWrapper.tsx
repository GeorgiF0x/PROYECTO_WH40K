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
    <div className="w-full h-full min-h-[400px] bg-void-light rounded-xl animate-pulse border border-bone/10 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-imperial-gold/40 animate-spin" />
    </div>
  )
}

interface CommunityMapWrapperProps {
  stores: Pick<Store, 'id' | 'name' | 'slug' | 'latitude' | 'longitude' | 'city' | 'store_type' | 'avg_rating' | 'review_count'>[]
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
