'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { cn } from '@/lib/utils'
import { eventTypeConfig } from './EventCard'
import type { EventWithOrganizer, EventType } from '@/lib/types/database.types'
import { Expand, Minimize2, X, Calendar, MapPin, Clock, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

interface EventsMapProps {
  events: EventWithOrganizer[]
  center?: [number, number]
  zoom?: number
  className?: string
}

// Get marker color based on event type
function getMarkerColor(eventType: EventType): string {
  const colors: Record<EventType, string> = {
    tournament: '#fbbf24', // amber
    painting_workshop: '#c084fc', // purple
    casual_play: '#60a5fa', // blue
    campaign: '#34d399', // emerald
    release_event: '#f87171', // red
    meetup: '#22d3ee', // cyan
    other: '#a8a29e', // gray
  }
  return colors[eventType] || '#a8a29e'
}

function formatEventDate(startDate: string): string {
  const date = new Date(startDate)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatEventTime(startDate: string): string {
  const date = new Date(startDate)
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

export default function EventsMap({
  events,
  center = [-3.7038, 40.4168], // Madrid default
  zoom = 5,
  className,
}: EventsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<EventWithOrganizer | null>(null)

  const addEventMarkers = useCallback(() => {
    if (!map.current || !events.length) return

    // Wait for style to load
    if (!map.current.isStyleLoaded()) {
      map.current.once('style.load', addEventMarkers)
      return
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    events.forEach((event) => {
      if (!event.latitude || !event.longitude) return

      const color = getMarkerColor(event.event_type)

      // Create wrapper element (fixed size, no transform)
      const el = document.createElement('div')
      el.className = 'event-marker'
      el.style.cssText = `
        width: 32px;
        height: 32px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      `

      // Create visual marker (this will scale on hover)
      const visual = document.createElement('div')
      visual.style.cssText = `
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: ${color};
        border: 3px solid ${event.is_official ? '#c9a227' : 'rgba(255,255,255,0.9)'};
        box-shadow: 0 4px 12px ${color}80, 0 0 20px ${color}40${event.is_official ? ', 0 0 0 2px rgba(201, 162, 39, 0.5)' : ''};
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      `

      // Inner dot
      const inner = document.createElement('div')
      inner.style.cssText = `
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(0,0,0,0.3);
      `
      visual.appendChild(inner)
      el.appendChild(visual)

      // Hover effect on visual element only
      el.addEventListener('mouseenter', () => {
        visual.style.transform = 'scale(1.3)'
        visual.style.boxShadow = `0 6px 20px ${color}90, 0 0 30px ${color}60`
      })
      el.addEventListener('mouseleave', () => {
        visual.style.transform = 'scale(1)'
        visual.style.boxShadow = `0 4px 12px ${color}80, 0 0 20px ${color}40${event.is_official ? ', 0 0 0 2px rgba(201, 162, 39, 0.5)' : ''}`
      })

      // Click handler
      el.addEventListener('click', () => {
        setSelectedEvent(event)
        map.current?.flyTo({
          center: [event.longitude, event.latitude],
          zoom: 12,
          duration: 1000,
        })
      })

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([event.longitude, event.latitude])
        .addTo(map.current!)

      markersRef.current.push(marker)
    })
  }, [events])

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: center,
      zoom: zoom,
      attributionControl: false,
    })

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')

    map.current.on('load', () => {
      addEventMarkers()
    })

    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      map.current?.remove()
      map.current = null
    }
  }, [center, zoom, addEventMarkers])

  useEffect(() => {
    addEventMarkers()
  }, [events, addEventMarkers])

  // Handle expand/collapse
  useEffect(() => {
    if (map.current) {
      setTimeout(() => {
        map.current?.resize()
      }, 300)
    }
  }, [isExpanded])

  const closePopup = () => setSelectedEvent(null)

  return (
    <>
      <div className={cn('relative overflow-hidden', className)}>
        {/* Grimdark overlays */}
        <div className="pointer-events-none absolute inset-0 z-10">
          {/* Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,10,15,0.6)_100%)]" />

          {/* Corner brackets */}
          <div className="absolute left-3 top-3 h-8 w-8 border-l-2 border-t-2 border-amber-500/30" />
          <div className="absolute right-3 top-3 h-8 w-8 border-r-2 border-t-2 border-amber-500/30" />
          <div className="absolute bottom-3 left-3 h-8 w-8 border-b-2 border-l-2 border-amber-500/30" />
          <div className="absolute bottom-3 right-3 h-8 w-8 border-b-2 border-r-2 border-amber-500/30" />

          {/* Scanlines */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(251, 191, 36, 0.1) 2px, rgba(251, 191, 36, 0.1) 4px)',
            }}
          />
        </div>

        {/* Map container */}
        <div ref={mapContainer} className="h-full w-full" />

        {/* Expand button */}
        <button
          onClick={() => setIsExpanded(true)}
          className="absolute bottom-4 right-4 z-20 rounded-lg border border-amber-500/30 bg-void/90 p-2 text-amber-500/80 transition-all hover:border-amber-500/50 hover:text-amber-400"
          title="Expandir mapa"
        >
          <Expand className="h-5 w-5" />
        </button>

        {/* Selected event popup */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-4 right-16 z-20 max-w-sm"
            >
              <div className="rounded-xl border border-amber-500/30 bg-void/95 p-4 backdrop-blur-sm">
                <button
                  onClick={closePopup}
                  className="absolute right-2 top-2 p-1 text-bone/40 transition-colors hover:text-bone"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Event type badge */}
                <div
                  className="mb-2 inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-mono text-xs"
                  style={{
                    background: `${getMarkerColor(selectedEvent.event_type)}20`,
                    color: getMarkerColor(selectedEvent.event_type),
                    border: `1px solid ${getMarkerColor(selectedEvent.event_type)}40`,
                  }}
                >
                  {eventTypeConfig[selectedEvent.event_type].label}
                  {selectedEvent.is_official && (
                    <Shield className="ml-1 h-3 w-3 text-imperial-gold" />
                  )}
                </div>

                <h3 className="mb-2 pr-6 font-display text-sm font-bold text-bone">
                  {selectedEvent.name}
                </h3>

                <div className="mb-3 space-y-1 text-xs text-bone/60">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-amber-500/60" />
                    <span>{formatEventDate(selectedEvent.start_date)}</span>
                    <Clock className="ml-2 h-3.5 w-3.5 text-amber-500/60" />
                    <span>{formatEventTime(selectedEvent.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-amber-500/60" />
                    <span>{selectedEvent.city}</span>
                  </div>
                </div>

                <Link
                  href={`/comunidad/eventos/${selectedEvent.slug}`}
                  className="inline-flex items-center gap-1 font-mono text-xs text-amber-400 transition-colors hover:text-amber-300"
                >
                  Ver detalles →
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fullscreen modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-void"
          >
            {/* Header */}
            <div className="absolute left-0 right-0 top-0 z-10 bg-gradient-to-b from-void to-transparent p-4">
              <div className="mx-auto flex max-w-7xl items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/20 p-2">
                    <MapPin className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-bone">MAPA DE EVENTOS</h2>
                    <p className="font-mono text-xs tracking-wider text-amber-500/60">
                      CHRONUS CARTOGRAPHIA
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsExpanded(false)}
                  className="rounded-lg border border-bone/20 bg-void-light p-2 text-bone/60 transition-all hover:border-bone/40 hover:text-bone"
                >
                  <Minimize2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Fullscreen map */}
            <EventsMapFullscreen
              events={events}
              center={center}
              zoom={zoom}
              selectedEvent={selectedEvent}
              onSelectEvent={setSelectedEvent}
              onClose={closePopup}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Fullscreen map component
function EventsMapFullscreen({
  events,
  center,
  zoom,
  selectedEvent,
  onSelectEvent,
  onClose,
}: {
  events: EventWithOrganizer[]
  center: [number, number]
  zoom: number
  selectedEvent: EventWithOrganizer | null
  onSelectEvent: (event: EventWithOrganizer | null) => void
  onClose: () => void
}) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  const addEventMarkers = useCallback(() => {
    if (!map.current || !events.length) return

    if (!map.current.isStyleLoaded()) {
      map.current.once('style.load', addEventMarkers)
      return
    }

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    events.forEach((event) => {
      if (!event.latitude || !event.longitude) return

      const color = getMarkerColor(event.event_type)

      // Create wrapper element (fixed size, no transform)
      const el = document.createElement('div')
      el.style.cssText = `
        width: 40px;
        height: 40px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      `

      // Create visual marker (this will scale on hover)
      const visual = document.createElement('div')
      visual.style.cssText = `
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${color};
        border: 3px solid ${event.is_official ? '#c9a227' : 'rgba(255,255,255,0.9)'};
        box-shadow: 0 4px 12px ${color}80, 0 0 20px ${color}40${event.is_official ? ', 0 0 0 2px rgba(201, 162, 39, 0.5)' : ''};
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      `

      const inner = document.createElement('div')
      inner.style.cssText = `
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(0,0,0,0.3);
      `
      visual.appendChild(inner)
      el.appendChild(visual)

      el.addEventListener('mouseenter', () => {
        visual.style.transform = 'scale(1.3)'
        visual.style.boxShadow = `0 6px 20px ${color}90, 0 0 30px ${color}60`
      })
      el.addEventListener('mouseleave', () => {
        visual.style.transform = 'scale(1)'
        visual.style.boxShadow = `0 4px 12px ${color}80, 0 0 20px ${color}40${event.is_official ? ', 0 0 0 2px rgba(201, 162, 39, 0.5)' : ''}`
      })

      el.addEventListener('click', () => {
        onSelectEvent(event)
        map.current?.flyTo({
          center: [event.longitude, event.latitude],
          zoom: 13,
          duration: 1000,
        })
      })

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([event.longitude, event.latitude])
        .addTo(map.current!)

      markersRef.current.push(marker)
    })
  }, [events, onSelectEvent])

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: center,
      zoom: zoom,
      attributionControl: false,
    })

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right')

    map.current.on('load', addEventMarkers)

    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      map.current?.remove()
      map.current = null
    }
  }, [center, zoom, addEventMarkers])

  return (
    <div className="h-full w-full pt-16">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Popup */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-4 top-24 z-20 w-80"
          >
            <div className="rounded-xl border border-amber-500/30 bg-void/95 p-5 backdrop-blur-sm">
              <button
                onClick={onClose}
                className="absolute right-3 top-3 p-1 text-bone/40 transition-colors hover:text-bone"
              >
                <X className="h-4 w-4" />
              </button>

              <div
                className="mb-3 inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-mono text-xs"
                style={{
                  background: `${getMarkerColor(selectedEvent.event_type)}20`,
                  color: getMarkerColor(selectedEvent.event_type),
                  border: `1px solid ${getMarkerColor(selectedEvent.event_type)}40`,
                }}
              >
                {eventTypeConfig[selectedEvent.event_type].label}
                {selectedEvent.is_official && (
                  <Shield className="ml-1 h-3 w-3 text-imperial-gold" />
                )}
              </div>

              <h3 className="mb-3 pr-6 font-display font-bold text-bone">{selectedEvent.name}</h3>

              {selectedEvent.description && (
                <p className="mb-4 line-clamp-3 text-sm text-bone/60">
                  {selectedEvent.description}
                </p>
              )}

              <div className="mb-4 space-y-2 text-sm text-bone/60">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-amber-500/60" />
                  <span>{formatEventDate(selectedEvent.start_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500/60" />
                  <span>{formatEventTime(selectedEvent.start_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-500/60" />
                  <span>{selectedEvent.venue_name || selectedEvent.city}</span>
                </div>
              </div>

              <Link
                href={`/comunidad/eventos/${selectedEvent.slug}`}
                className="inline-flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/20 px-4 py-2 font-mono text-sm text-amber-400 transition-colors hover:bg-amber-500/30"
              >
                Ver detalles completos →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
