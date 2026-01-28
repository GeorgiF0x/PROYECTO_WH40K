'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Loader2, Maximize2, Minimize2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Store, StoreType } from '@/lib/types/database.types'

interface CommunityMapProps {
  stores: Pick<Store, 'id' | 'name' | 'slug' | 'latitude' | 'longitude' | 'city' | 'store_type' | 'avg_rating' | 'review_count'>[]
  onStoreClick?: (slug: string) => void
  className?: string
  interactive?: boolean
  center?: [number, number]
  zoom?: number
  showExpandButton?: boolean
}

// Store type configuration for markers
const storeTypeConfig: Record<StoreType, { color: string; label: string; glow: string }> = {
  specialist: { color: '#C9A227', label: 'Especialista', glow: 'rgba(201, 162, 39, 0.6)' },
  comics_games: { color: '#60A5FA', label: 'Comics/Juegos', glow: 'rgba(96, 165, 250, 0.6)' },
  general_hobby: { color: '#A78BFA', label: 'Hobby General', glow: 'rgba(167, 139, 250, 0.6)' },
  online_only: { color: '#34D399', label: 'Solo Online', glow: 'rgba(52, 211, 153, 0.6)' },
}

// Create a stellar/waypoint marker element
function createStoreMarker(store: Pick<Store, 'store_type' | 'name' | 'avg_rating' | 'review_count'>, size: number = 24): HTMLDivElement {
  const config = storeTypeConfig[store.store_type] || storeTypeConfig.specialist

  // Outer wrapper (fixed, for positioning)
  const wrapper = document.createElement('div')
  wrapper.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  `

  // Ping/radar effect (outer glow that pulses)
  const ping = document.createElement('div')
  ping.className = 'store-marker-ping'
  ping.style.cssText = `
    position: absolute;
    width: ${size * 2}px;
    height: ${size * 2}px;
    border: 1px solid ${config.color};
    transform: rotate(45deg);
    opacity: 0;
    animation: storePing 3s ease-out infinite;
  `

  // Diamond marker shape
  const diamond = document.createElement('div')
  diamond.className = 'store-marker-diamond'
  diamond.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    background: linear-gradient(135deg, ${config.color} 0%, ${config.color}cc 50%, ${config.color}99 100%);
    transform: rotate(45deg);
    border: 2px solid rgba(255, 255, 255, 0.8);
    box-shadow:
      0 0 10px ${config.glow},
      0 0 20px ${config.glow},
      inset 0 0 6px rgba(255, 255, 255, 0.3);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  `

  // Inner crosshair/reticle
  const reticle = document.createElement('div')
  reticle.style.cssText = `
    width: 6px;
    height: 6px;
    background: rgba(255, 255, 255, 0.9);
    transform: rotate(-45deg);
    box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
  `
  diamond.appendChild(reticle)

  wrapper.appendChild(ping)
  wrapper.appendChild(diamond)

  // Hover effects
  wrapper.addEventListener('mouseenter', () => {
    diamond.style.transform = 'rotate(45deg) scale(1.2)'
    diamond.style.boxShadow = `
      0 0 15px ${config.glow},
      0 0 30px ${config.glow},
      inset 0 0 8px rgba(255, 255, 255, 0.4)
    `
  })
  wrapper.addEventListener('mouseleave', () => {
    diamond.style.transform = 'rotate(45deg) scale(1)'
    diamond.style.boxShadow = `
      0 0 10px ${config.glow},
      0 0 20px ${config.glow},
      inset 0 0 6px rgba(255, 255, 255, 0.3)
    `
  })

  return wrapper
}

export default function CommunityMap({
  stores,
  onStoreClick,
  className = '',
  interactive = true,
  center = [-3.7038, 40.4168],
  zoom = 5.5,
  showExpandButton = true,
}: CommunityMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isFullscreen])

  // Prevent body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isFullscreen])

  // Resize map when fullscreen changes
  useEffect(() => {
    if (map.current) {
      setTimeout(() => {
        map.current?.resize()
      }, 100)
    }
  }, [isFullscreen])

  const markersRef = useRef<mapboxgl.Marker[]>([])

  const initMap = useCallback(() => {
    if (!mapContainer.current || map.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) {
      console.error('[CommunityMap] Missing NEXT_PUBLIC_MAPBOX_TOKEN')
      return
    }

    mapboxgl.accessToken = token

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center,
      zoom,
      interactive,
      attributionControl: false,
    })

    if (interactive) {
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: false,
          showUserHeading: false,
        }),
        'top-right'
      )
    }

    map.current.on('load', () => {
      setMapLoaded(true)
      addStoreMarkers()
    })
  }, [center, zoom, interactive])

  const addStoreMarkers = useCallback(() => {
    if (!map.current || !stores.length) return

    // Wait for style to be fully loaded
    if (!map.current.isStyleLoaded()) {
      map.current.once('style.load', addStoreMarkers)
      return
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Remove existing cluster layers if they exist
    if (map.current.getSource('stores-cluster')) {
      if (map.current.getLayer('store-clusters')) map.current.removeLayer('store-clusters')
      if (map.current.getLayer('cluster-count')) map.current.removeLayer('cluster-count')
      map.current.removeSource('stores-cluster')
    }

    // Add cluster source
    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: stores.map((store) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [store.longitude, store.latitude],
        },
        properties: {
          id: store.id,
          name: store.name,
          slug: store.slug,
          city: store.city,
          store_type: store.store_type,
          avg_rating: store.avg_rating,
          review_count: store.review_count,
        },
      })),
    }

    map.current.addSource('stores-cluster', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 12,
      clusterRadius: 60,
    })

    // Cluster visualization - hexagonal/stellar style
    map.current.addLayer({
      id: 'store-clusters',
      type: 'circle',
      source: 'stores-cluster',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': 'rgba(201, 162, 39, 0.15)',
        'circle-radius': ['step', ['get', 'point_count'], 28, 5, 36, 10, 44],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#C9A227',
        'circle-stroke-opacity': 0.8,
      },
    })

    // Cluster count
    map.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'stores-cluster',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
        'text-size': 14,
      },
      paint: {
        'text-color': '#C9A227',
      },
    })

    // Click on cluster to zoom
    map.current.on('click', 'store-clusters', (e) => {
      const features = map.current!.queryRenderedFeatures(e.point, {
        layers: ['store-clusters'],
      })
      const clusterId = features[0]?.properties?.cluster_id
      const source = map.current!.getSource('stores-cluster') as mapboxgl.GeoJSONSource
      source.getClusterExpansionZoom(clusterId, (err, clusterZoom) => {
        if (err) return
        const geometry = features[0].geometry
        if (geometry.type === 'Point') {
          map.current!.easeTo({
            center: geometry.coordinates as [number, number],
            zoom: clusterZoom ?? undefined,
          })
        }
      })
    })

    map.current.on('mouseenter', 'store-clusters', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer'
    })
    map.current.on('mouseleave', 'store-clusters', () => {
      if (map.current) map.current.getCanvas().style.cursor = ''
    })

    // Add individual markers for unclustered points
    // We need to track when zoom changes to show/hide markers
    const updateMarkers = () => {
      if (!map.current) return

      const zoom = map.current.getZoom()

      // Clear existing HTML markers
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []

      // Only show HTML markers when zoomed in enough (when clusters break apart)
      if (zoom < 8) return

      // Get visible features that are NOT clustered
      const features = map.current.querySourceFeatures('stores-cluster', {
        filter: ['!', ['has', 'point_count']]
      })

      // Track which stores we've already added (to avoid duplicates)
      const addedStores = new Set<string>()

      features.forEach((feature) => {
        const props = feature.properties
        if (!props || addedStores.has(props.id)) return
        addedStores.add(props.id)

        const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number]

        // Create custom marker
        const el = createStoreMarker({
          store_type: props.store_type as StoreType,
          name: props.name,
          avg_rating: props.avg_rating,
          review_count: props.review_count,
        }, 20)

        // Click handler
        el.addEventListener('click', (e) => {
          e.stopPropagation()

          // Create popup
          new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: true,
            className: 'store-popup',
            maxWidth: '280px',
            offset: 15,
          })
            .setLngLat(coords)
            .setHTML(`
              <div class="store-popup-content">
                <div class="store-popup-badge" style="background: ${storeTypeConfig[props.store_type as StoreType]?.color || '#C9A227'}20; border-color: ${storeTypeConfig[props.store_type as StoreType]?.color || '#C9A227'};">
                  ${storeTypeConfig[props.store_type as StoreType]?.label || 'Tienda'}
                </div>
                <h3 class="store-popup-title">${props.name}</h3>
                <p class="store-popup-city">${props.city}</p>
                ${Number(props.review_count) > 0 ? `
                  <div class="store-popup-rating">
                    <span class="star">★</span>
                    <span>${Number(props.avg_rating).toFixed(1)}</span>
                    <span class="count">(${props.review_count})</span>
                  </div>
                ` : ''}
                <a href="/comunidad/tiendas/${props.slug}" class="store-popup-link">
                  <span>Ver puesto comercial</span>
                  <span>→</span>
                </a>
              </div>
            `)
            .addTo(map.current!)

          if (onStoreClick) {
            onStoreClick(props.slug)
          }
        })

        const marker = new mapboxgl.Marker({
          element: el,
          anchor: 'center'
        })
          .setLngLat(coords)
          .addTo(map.current!)

        markersRef.current.push(marker)
      })
    }

    // Initial update
    updateMarkers()

    // Update on zoom/move
    map.current.on('zoomend', updateMarkers)
    map.current.on('moveend', updateMarkers)

  }, [stores, onStoreClick])

  useEffect(() => {
    initMap()
    return () => {
      // Clean up markers
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []
      // Clean up map
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [initMap])

  useEffect(() => {
    if (mapLoaded) {
      addStoreMarkers()
    }
  }, [mapLoaded, addStoreMarkers])

  const mapContent = (
    <>
      {/* Dataslate frame - corner brackets */}
      <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-imperial-gold/50 rounded-tl-lg z-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-imperial-gold/50 rounded-tr-lg z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-imperial-gold/50 rounded-bl-lg z-20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-imperial-gold/50 rounded-br-lg z-20 pointer-events-none" />

      {/* Map container with grimdark filter */}
      <div
        ref={mapContainer}
        className={`w-full h-full ${isFullscreen ? 'min-h-screen' : 'min-h-[400px]'}`}
        style={{
          filter: 'sepia(0.15) saturate(0.85) brightness(0.9) contrast(1.1)',
        }}
      />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(201, 162, 39, 0.5) 2px, rgba(201, 162, 39, 0.5) 4px)',
        }}
      />

      {/* Grid overlay - tactical display */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201, 162, 39, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 162, 39, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Vignette effect */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10, 10, 15, 0.6) 100%)',
        }}
      />

      {/* Top-left label */}
      <div className="absolute top-3 left-10 z-20 pointer-events-none">
        <div className="flex items-center gap-2 px-2 py-1 bg-void/80 border border-imperial-gold/30 rounded">
          <div className="w-1.5 h-1.5 rounded-full bg-imperial-gold animate-pulse" />
          <span className="text-[10px] font-mono text-imperial-gold/80 tracking-wider">CARTOGRAPHIA IMPERIALIS</span>
        </div>
      </div>

      {/* Expand/Collapse button */}
      {showExpandButton && (
        <motion.button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="absolute top-3 right-10 z-20 flex items-center gap-2 px-3 py-1.5 bg-void/90 border border-imperial-gold/40 rounded hover:bg-imperial-gold/20 hover:border-imperial-gold/60 transition-colors group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={isFullscreen ? 'Minimizar mapa (Esc)' : 'Expandir mapa'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-imperial-gold" />
          ) : (
            <Maximize2 className="w-4 h-4 text-imperial-gold" />
          )}
          <span className="text-[10px] font-mono text-imperial-gold/80 tracking-wider group-hover:text-imperial-gold hidden sm:inline">
            {isFullscreen ? 'MINIMIZAR' : 'EXPANDIR'}
          </span>
        </motion.button>
      )}

      {/* Bottom-right coordinates display */}
      <div className="absolute bottom-3 right-10 z-20 pointer-events-none">
        <div className="px-2 py-1 bg-void/80 border border-bone/20 rounded">
          <span className="text-[9px] font-mono text-bone/50 tracking-wider">SEGMENTUM SOLAR • M41</span>
        </div>
      </div>

      {/* Fullscreen close button (only in fullscreen) */}
      {isFullscreen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 z-30 p-2 bg-void/90 border border-blood-red/50 rounded-lg hover:bg-blood-red/20 hover:border-blood-red transition-colors"
          title="Cerrar (Esc)"
        >
          <X className="w-5 h-5 text-blood-red" />
        </motion.button>
      )}

      {/* Store count indicator (fullscreen only) */}
      {isFullscreen && stores.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="flex items-center gap-3 px-4 py-2 bg-void/90 border border-imperial-gold/30 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-imperial-gold animate-pulse" />
            <span className="text-sm font-mono text-imperial-gold">
              {stores.length} {stores.length === 1 ? 'UBICACIÓN DETECTADA' : 'UBICACIONES DETECTADAS'}
            </span>
          </div>
        </motion.div>
      )}

      {/* Loading state */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-void z-30">
          <Loader2 className="w-8 h-8 text-imperial-gold animate-spin mb-3" />
          <span className="text-xs font-mono text-imperial-gold/60 tracking-widest">INICIALIZANDO COGITATOR...</span>
        </div>
      )}

      {/* Custom popup and marker styles */}
      <style jsx global>{`
        /* Marker ping animation */
        @keyframes storePing {
          0% {
            transform: rotate(45deg) scale(0.5);
            opacity: 0.8;
          }
          100% {
            transform: rotate(45deg) scale(1.5);
            opacity: 0;
          }
        }

        /* Store popup styling */
        .store-popup .mapboxgl-popup-content {
          background: linear-gradient(145deg, rgba(20, 20, 35, 0.98), rgba(10, 10, 20, 0.98));
          border: 1px solid rgba(201, 162, 39, 0.4);
          border-radius: 12px;
          padding: 0;
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.6),
            0 0 30px rgba(201, 162, 39, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          overflow: hidden;
        }
        .store-popup .mapboxgl-popup-tip {
          border-top-color: rgba(20, 20, 35, 0.98);
        }
        .store-popup .mapboxgl-popup-close-button {
          color: #C9A227;
          font-size: 20px;
          padding: 4px 8px;
          right: 4px;
          top: 4px;
        }
        .store-popup .mapboxgl-popup-close-button:hover {
          color: #e8e0cc;
          background: rgba(201, 162, 39, 0.2);
          border-radius: 4px;
        }

        /* Popup content styling */
        .store-popup-content {
          padding: 16px;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .store-popup-badge {
          display: inline-block;
          padding: 3px 8px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-radius: 4px;
          border: 1px solid;
          margin-bottom: 8px;
          color: inherit;
        }
        .store-popup-title {
          font-size: 16px;
          font-weight: 700;
          color: #e8e0cc;
          margin: 0 0 4px;
          line-height: 1.3;
        }
        .store-popup-city {
          font-size: 12px;
          color: rgba(232, 224, 204, 0.5);
          margin: 0 0 8px;
        }
        .store-popup-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #C9A227;
          margin-bottom: 12px;
        }
        .store-popup-rating .star {
          font-size: 14px;
        }
        .store-popup-rating .count {
          color: rgba(232, 224, 204, 0.4);
          font-size: 11px;
        }
        .store-popup-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          margin: 0 -16px -16px;
          background: rgba(201, 162, 39, 0.1);
          border-top: 1px solid rgba(201, 162, 39, 0.2);
          color: #C9A227;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
          transition: background 0.2s;
        }
        .store-popup-link:hover {
          background: rgba(201, 162, 39, 0.2);
        }

        /* Mapbox controls styling */
        .mapboxgl-ctrl-group {
          background: rgba(10, 10, 15, 0.9) !important;
          border: 1px solid rgba(201, 162, 39, 0.3) !important;
          border-radius: 8px !important;
        }
        .mapboxgl-ctrl-group button {
          background: transparent !important;
          border-color: rgba(201, 162, 39, 0.2) !important;
        }
        .mapboxgl-ctrl-group button:hover {
          background: rgba(201, 162, 39, 0.2) !important;
        }
        .mapboxgl-ctrl-group button .mapboxgl-ctrl-icon {
          filter: invert(0.8) sepia(0.5) saturate(5) hue-rotate(10deg);
        }
        .mapboxgl-ctrl-attrib {
          background: rgba(10, 10, 15, 0.7) !important;
          font-size: 9px !important;
        }
        .mapboxgl-ctrl-attrib a {
          color: rgba(201, 162, 39, 0.6) !important;
        }
      `}</style>
    </>
  )

  // Fullscreen mode - render as fixed overlay
  if (isFullscreen) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-void"
          style={{ border: '4px solid rgba(201, 162, 39, 0.4)' }}
        >
          {/* Fullscreen header */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-void/95 border-b border-imperial-gold/30 flex items-center justify-between px-4 z-30">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-imperial-gold animate-pulse" />
              <span className="text-sm font-mono text-imperial-gold tracking-wider">MODO TACTICO ACTIVADO</span>
            </div>
            <span className="text-xs font-mono text-bone/40">Pulsa ESC para salir</span>
          </div>

          {/* Map content with padding for header */}
          <div className="absolute inset-0 pt-12">
            <div className="relative w-full h-full overflow-hidden">
              {mapContent}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Normal mode
  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`} style={{ border: '2px solid rgba(201, 162, 39, 0.3)' }}>
      {mapContent}
    </div>
  )
}
