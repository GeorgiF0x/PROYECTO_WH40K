'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MapPin, Search, Loader2, X } from 'lucide-react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface LocationResult {
  address: string
  city: string
  province: string
  postal_code: string
  latitude: number
  longitude: number
}

interface LocationPickerProps {
  value?: LocationResult | null
  onChange: (location: LocationResult) => void
}

interface GeocodingFeature {
  place_name: string
  center: [number, number]
  context?: Array<{
    id: string
    text: string
    short_code?: string
  }>
  text: string
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodingFeature[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const marker = useRef<mapboxgl.Marker | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Initialize mini-map
  useEffect(() => {
    if (!mapContainer.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) return

    mapboxgl.accessToken = token

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: value ? [value.longitude, value.latitude] : [-3.7038, 40.4168],
      zoom: value ? 14 : 5,
      interactive: true,
      attributionControl: false,
    })

    if (value) {
      marker.current = new mapboxgl.Marker({ color: '#C9A227', draggable: true })
        .setLngLat([value.longitude, value.latitude])
        .addTo(map.current)

      marker.current.on('dragend', () => {
        const lngLat = marker.current!.getLngLat()
        reverseGeocode(lngLat.lng, lngLat.lat)
      })
    }

    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat
      setMarkerPosition(lng, lat)
      reverseGeocode(lng, lat)
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  const setMarkerPosition = useCallback((lng: number, lat: number) => {
    if (!map.current) return

    if (marker.current) {
      marker.current.setLngLat([lng, lat])
    } else {
      marker.current = new mapboxgl.Marker({ color: '#C9A227', draggable: true })
        .setLngLat([lng, lat])
        .addTo(map.current)

      marker.current.on('dragend', () => {
        const lngLat = marker.current!.getLngLat()
        reverseGeocode(lngLat.lng, lngLat.lat)
      })
    }

    map.current.easeTo({ center: [lng, lat], zoom: 14 })
  }, [])

  const reverseGeocode = useCallback(async (lng: number, lat: number) => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) return

    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?country=ES&language=es&access_token=${token}`
      )
      const data = await res.json()
      const feature = data.features?.[0] as GeocodingFeature | undefined
      if (feature) {
        const location = parseFeature(feature, lng, lat)
        onChange(location)
        setQuery(feature.place_name)
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err)
    }
  }, [onChange])

  const searchAddress = useCallback(async (searchQuery: string) => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token || !searchQuery.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?country=ES&language=es&limit=5&access_token=${token}`
      )
      const data = await res.json()
      setResults(data.features || [])
      setShowResults(true)
    } catch (err) {
      console.error('Geocoding error:', err)
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      searchAddress(val)
    }, 400)
  }

  const handleSelectResult = (feature: GeocodingFeature) => {
    const [lng, lat] = feature.center
    const location = parseFeature(feature, lng, lat)
    onChange(location)
    setQuery(feature.place_name)
    setShowResults(false)
    setMarkerPosition(lng, lat)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-bone/40" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="Buscar direccion..."
          className="w-full pl-11 pr-10 py-3 bg-void border border-bone/10 rounded-xl font-body text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50 transition-colors"
        />
        {isSearching && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-imperial-gold animate-spin" />
        )}
        {query && !isSearching && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-bone/40 hover:text-bone/60"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Results dropdown */}
        {showResults && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-void-light border border-bone/10 rounded-xl overflow-hidden z-50 shadow-xl">
            {results.map((feature, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectResult(feature)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-imperial-gold/10 transition-colors border-b border-bone/5 last:border-0"
              >
                <MapPin className="w-4 h-4 text-imperial-gold mt-0.5 flex-shrink-0" />
                <span className="text-sm font-body text-bone/70 line-clamp-2">
                  {feature.place_name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mini map */}
      <div
        ref={mapContainer}
        className="w-full h-[200px] rounded-xl border border-bone/10 overflow-hidden"
      />

      {/* Selected location info */}
      {value && (
        <div className="flex items-center gap-2 px-3 py-2 bg-imperial-gold/10 border border-imperial-gold/20 rounded-lg">
          <MapPin className="w-4 h-4 text-imperial-gold flex-shrink-0" />
          <span className="text-sm font-body text-bone/70 truncate">
            {value.address} - {value.city}
            {value.province ? `, ${value.province}` : ''}
          </span>
        </div>
      )}

      <p className="text-xs text-bone/40 font-body">
        Busca la direccion o haz clic en el mapa para seleccionar la ubicacion. Puedes arrastrar el marcador para ajustar.
      </p>
    </div>
  )
}

function parseFeature(feature: GeocodingFeature, lng: number, lat: number): LocationResult {
  const context = feature.context || []
  let city = ''
  let province = ''
  let postalCode = ''

  for (const ctx of context) {
    if (ctx.id.startsWith('place')) city = ctx.text
    if (ctx.id.startsWith('region')) province = ctx.text
    if (ctx.id.startsWith('postcode')) postalCode = ctx.text
  }

  if (!city) city = feature.text

  return {
    address: feature.place_name,
    city,
    province,
    postal_code: postalCode,
    latitude: lat,
    longitude: lng,
  }
}
