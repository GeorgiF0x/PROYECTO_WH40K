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
    .select(
      `
      *,
      organizer:organizer_id(id, username, display_name, avatar_url, creator_status),
      store:store_id(id, name, slug)
    `
    )
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
    <div className="min-h-screen pb-16 pt-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-8 h-64 animate-pulse rounded-2xl bg-void-light" />
        <div className="mb-4 h-8 w-2/3 animate-pulse rounded bg-void-light" />
        <div className="mb-8 h-4 w-1/3 animate-pulse rounded bg-void-light/50" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-4 md:col-span-2">
            <div className="h-32 animate-pulse rounded-xl bg-void-light" />
            <div className="h-48 animate-pulse rounded-xl bg-void-light" />
          </div>
          <div className="h-64 animate-pulse rounded-xl bg-void-light" />
        </div>
      </div>
    </div>
  )
}
