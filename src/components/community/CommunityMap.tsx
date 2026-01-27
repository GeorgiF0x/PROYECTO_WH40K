'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Loader2 } from 'lucide-react'
import type { Store } from '@/lib/types/database.types'

interface CommunityMapProps {
  stores: Pick<Store, 'id' | 'name' | 'slug' | 'latitude' | 'longitude' | 'city' | 'store_type' | 'avg_rating' | 'review_count'>[]
  onStoreClick?: (slug: string) => void
  className?: string
  interactive?: boolean
  center?: [number, number]
  zoom?: number
}

export default function CommunityMap({
  stores,
  onStoreClick,
  className = '',
  interactive = true,
  center = [-3.7038, 40.4168],
  zoom = 5.5,
}: CommunityMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  const storeTypeColors: Record<string, string> = {
    specialist: '#C9A227',
    comics_games: '#60A5FA',
    general_hobby: '#A78BFA',
    online_only: '#34D399',
  }

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
          color: storeTypeColors[store.store_type] || '#C9A227',
        },
      })),
    }

    // Remove existing source/layers if they exist
    if (map.current.getSource('stores')) {
      map.current.removeLayer('store-clusters')
      map.current.removeLayer('cluster-count')
      map.current.removeLayer('unclustered-stores')
      map.current.removeSource('stores')
    }

    map.current.addSource('stores', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    })

    // Cluster circles
    map.current.addLayer({
      id: 'store-clusters',
      type: 'circle',
      source: 'stores',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#C9A227',
        'circle-opacity': 0.8,
        'circle-radius': ['step', ['get', 'point_count'], 20, 5, 30, 10, 40],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#C9A227',
        'circle-stroke-opacity': 0.3,
      },
    })

    // Cluster count text
    map.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'stores',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 14,
      },
      paint: {
        'text-color': '#0a0a0f',
      },
    })

    // Individual store markers
    map.current.addLayer({
      id: 'unclustered-stores',
      type: 'circle',
      source: 'stores',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': ['get', 'color'],
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-opacity': 0.4,
      },
    })

    // Click on cluster to zoom in
    map.current.on('click', 'store-clusters', (e) => {
      const features = map.current!.queryRenderedFeatures(e.point, {
        layers: ['store-clusters'],
      })
      const clusterId = features[0]?.properties?.cluster_id
      const source = map.current!.getSource('stores') as mapboxgl.GeoJSONSource
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

    // Click on individual store
    map.current.on('click', 'unclustered-stores', (e) => {
      const feature = e.features?.[0]
      if (!feature || feature.geometry.type !== 'Point') return

      const props = feature.properties!
      const coords = feature.geometry.coordinates.slice() as [number, number]

      new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: true,
        className: 'store-popup',
        maxWidth: '260px',
      })
        .setLngLat(coords)
        .setHTML(`
          <div style="font-family: system-ui; padding: 4px;">
            <h3 style="font-weight: 700; font-size: 14px; color: #e8e0cc; margin: 0 0 4px;">${props.name}</h3>
            <p style="font-size: 12px; color: #e8e0cc99; margin: 0 0 6px;">${props.city}</p>
            ${Number(props.review_count) > 0 ? `<p style="font-size: 12px; color: #C9A227; margin: 0 0 6px;">★ ${Number(props.avg_rating).toFixed(1)} (${props.review_count})</p>` : ''}
            <a href="/comunidad/tiendas/${props.slug}" style="font-size: 12px; color: #C9A227; text-decoration: underline;">Ver detalle</a>
          </div>
        `)
        .addTo(map.current!)

      if (onStoreClick) {
        onStoreClick(props.slug)
      }
    })

    // Cursor changes
    map.current.on('mouseenter', 'unclustered-stores', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer'
    })
    map.current.on('mouseleave', 'unclustered-stores', () => {
      if (map.current) map.current.getCanvas().style.cursor = ''
    })
    map.current.on('mouseenter', 'store-clusters', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer'
    })
    map.current.on('mouseleave', 'store-clusters', () => {
      if (map.current) map.current.getCanvas().style.cursor = ''
    })
  }, [stores, onStoreClick])

  useEffect(() => {
    initMap()
    return () => {
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

  return (
    <div className={`relative rounded-xl overflow-hidden border border-bone/10 ${className}`}>
      <div ref={mapContainer} className="w-full h-full min-h-[400px]" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-void">
          <Loader2 className="w-8 h-8 text-imperial-gold animate-spin" />
        </div>
      )}
      {/* Custom popup styles */}
      <style jsx global>{`
        .store-popup .mapboxgl-popup-content {
          background: #1a1a2e;
          border: 1px solid rgba(232, 224, 204, 0.1);
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }
        .store-popup .mapboxgl-popup-tip {
          border-top-color: #1a1a2e;
        }
        .store-popup .mapboxgl-popup-close-button {
          color: #e8e0cc99;
          font-size: 18px;
          padding: 2px 6px;
        }
        .store-popup .mapboxgl-popup-close-button:hover {
          color: #C9A227;
          background: transparent;
        }
      `}</style>
    </div>
  )
}
