'use client'

import dynamic from 'next/dynamic'
import { MapPin, Loader2 } from 'lucide-react'
import type { EventWithOrganizer } from '@/lib/types/database.types'

const EventsMap = dynamic(() => import('./EventsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-void-light rounded-xl animate-pulse border border-amber-500/20 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-amber-500/40 animate-spin" />
    </div>
  ),
})

interface EventsMapWrapperProps {
  events: EventWithOrganizer[]
  className?: string
  center?: [number, number]
  zoom?: number
}

export default function EventsMapWrapper(props: EventsMapWrapperProps) {
  return <EventsMap {...props} />
}
