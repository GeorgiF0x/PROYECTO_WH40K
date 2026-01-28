import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import EventDetailClient from './EventDetailClient'
import type { EventWithOrganizer } from '@/lib/types/database.types'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getEvent(slug: string): Promise<EventWithOrganizer | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      organizer:organizer_id(id, username, display_name, avatar_url, creator_status),
      store:store_id(id, name, slug)
    `)
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return null
  }

  return data as unknown as EventWithOrganizer
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const event = await getEvent(slug)

  if (!event) {
    return {
      title: 'Evento no encontrado | Chronus Eventus',
    }
  }

  return {
    title: `${event.name} | Chronus Eventus`,
    description: event.description || `Evento de ${event.event_type} en ${event.city}`,
  }
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params
  const event = await getEvent(slug)

  if (!event) {
    notFound()
  }

  return (
    <Suspense fallback={<EventDetailSkeleton />}>
      <EventDetailClient event={event} />
    </Suspense>
  )
}

function EventDetailSkeleton() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <div className="h-64 bg-void-light rounded-2xl animate-pulse mb-8" />
        <div className="h-8 w-2/3 bg-void-light rounded animate-pulse mb-4" />
        <div className="h-4 w-1/3 bg-void-light/50 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="h-32 bg-void-light rounded-xl animate-pulse" />
            <div className="h-48 bg-void-light rounded-xl animate-pulse" />
          </div>
          <div className="h-64 bg-void-light rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}
