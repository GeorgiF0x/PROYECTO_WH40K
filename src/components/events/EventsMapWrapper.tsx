'use client'

import dynamic from 'next/dynamic'
import { MapPin, Loader2 } from 'lucide-react'
import type { EventWithOrganizer } from '@/lib/types/database.types'

const EventsMap = dynamic(() => import('./EventsMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[400px] w-full animate-pulse items-center justify-center rounded-xl border border-amber-500/20 bg-void-light">
      <Loader2 className="h-8 w-8 animate-spin text-amber-500/40" />
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
