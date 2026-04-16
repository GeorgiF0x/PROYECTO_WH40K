'use client'

import { useState, useRef } from 'react'
import { Cpu, Upload, Link as LinkIcon, X, Loader2, ImagePlus } from 'lucide-react'
import { compressImage } from '@/lib/utils/compressImage'
import { cn } from '@/lib/utils'

interface WikiGalleryProps {
  images: string[]
  onChange: (images: string[]) => void
  factionId?: string
  factionColor?: string
  maxImages?: number
}

export function WikiGallery({
  images,
  onChange,
  factionId,
  factionColor = '#C9A227',
  maxImages = 5,
}: WikiGalleryProps) {
  const [tab, setTab] = useState<'upload' | 'url'>('upload')
  const [urlInput, setUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const isFull = images.length >= maxImages

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index))
  }

  async function handleFileUpload(file: File) {
    if (isFull) return
    setError(null)
    setUploading(true)

    try {
      const compressed = await compressImage(file)
      const formData = new FormData()
      formData.append('file', compressed)
      if (factionId) formData.append('faction_id', factionId)

      const res = await fetch('/api/wiki/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al subir la imagen')
      }

      const data = await res.json()
      onChange([...images, data.url])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function handleAddUrl() {
    if (isFull || !urlInput.trim()) return
    setError(null)

    const url = urlInput.trim()
    if (!url.startsWith('http')) {
      setError('La URL debe empezar con http:// o https://')
      return
    }

    onChange([...images, url])
    setUrlInput('')
  }

  return (
    <div
      className="overflow-hidden rounded-lg"
      style={{
        background: '#0a0a12',
        border: `1px solid ${factionColor}30`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 border-b px-4 py-3"
        style={{
          background: `linear-gradient(180deg, ${factionColor}10 0%, transparent 100%)`,
          borderColor: `${factionColor}20`,
        }}
      >
        <Cpu className="h-4 w-4" style={{ color: factionColor }} />
        <span className="font-display text-sm font-bold uppercase tracking-wider text-bone/90">
          Biblioteca de Imagenes
        </span>
        <span className="ml-auto font-body text-xs text-bone/40">
          {images.length}/{maxImages}
        </span>
      </div>

      <div className="space-y-4 p-4">
        {/* Image grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((url, i) => (
              <div
                key={`${url}-${i}`}
                className="group relative aspect-video overflow-hidden rounded-lg border"
                style={{ borderColor: `${factionColor}20` }}
              >
                <img
                  src={url}
                  alt={`Imagen ${i + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = ''
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-1.5 top-1.5 rounded-full border border-bone/20 bg-void/80 p-1 text-bone/70 opacity-0 transition-colors hover:border-blood/40 hover:text-blood-light group-hover:opacity-100"
                  title="Eliminar imagen"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-void/80 to-transparent px-2 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="block truncate font-body text-[10px] text-bone/60">
                    {url.split('/').pop()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {images.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-bone/30">
            <ImagePlus className="mb-2 h-8 w-8" />
            <span className="font-body text-sm">Sin imagenes</span>
          </div>
        )}

        {/* Add image section */}
        {!isFull && (
          <div className="space-y-3">
            <div
              className="h-px"
              style={{
                background: `linear-gradient(90deg, transparent, ${factionColor}30, transparent)`,
              }}
            />

            {/* Tabs */}
            <div className="flex gap-1 rounded-lg bg-void-light p-1">
              <button
                type="button"
                onClick={() => setTab('upload')}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded py-1.5 font-body text-xs transition-colors',
                  tab === 'upload' ? 'bg-void text-bone' : 'text-bone/50 hover:text-bone/70'
                )}
              >
                <Upload className="h-3.5 w-3.5" />
                Subir archivo
              </button>
              <button
                type="button"
                onClick={() => setTab('url')}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded py-1.5 font-body text-xs transition-colors',
                  tab === 'url' ? 'bg-void text-bone' : 'text-bone/50 hover:text-bone/70'
                )}
              >
                <LinkIcon className="h-3.5 w-3.5" />
                URL
              </button>
            </div>

            {/* Upload tab */}
            {tab === 'upload' && (
              <div className="flex items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-dashed py-2.5 font-body text-sm transition-colors hover:bg-bone/5 disabled:opacity-50"
                  style={{ borderColor: `${factionColor}30`, color: `${factionColor}` }}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Seleccionar imagen
                    </>
                  )}
                </button>
              </div>
            )}

            {/* URL tab */}
            {tab === 'url' && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                  placeholder="https://..."
                  className="flex-1 rounded-lg border border-bone/10 bg-void-light px-3 py-2 font-body text-sm text-bone placeholder:text-bone/30 focus:outline-none focus:ring-1"
                  style={{ focusRingColor: factionColor } as React.CSSProperties}
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  disabled={!urlInput.trim()}
                  className="rounded-lg px-4 py-2 font-body text-sm font-semibold transition-colors disabled:opacity-40"
                  style={{
                    background: factionColor,
                    color: '#0a0a12',
                  }}
                >
                  Anadir
                </button>
              </div>
            )}
          </div>
        )}

        {/* Full indicator */}
        {isFull && (
          <p className="text-center font-body text-xs text-bone/40">
            Limite de {maxImages} imagenes alcanzado
          </p>
        )}

        {/* Error */}
        {error && <p className="font-body text-xs text-blood-light">{error}</p>}
      </div>
    </div>
  )
}
