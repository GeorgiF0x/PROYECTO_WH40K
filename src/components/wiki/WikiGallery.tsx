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
      className="rounded-lg overflow-hidden"
      style={{
        background: '#0a0a12',
        border: `1px solid ${factionColor}30`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{
          background: `linear-gradient(180deg, ${factionColor}10 0%, transparent 100%)`,
          borderColor: `${factionColor}20`,
        }}
      >
        <Cpu className="w-4 h-4" style={{ color: factionColor }} />
        <span className="font-display text-sm font-bold text-bone/90 uppercase tracking-wider">
          Biblioteca de Imagenes
        </span>
        <span className="ml-auto text-xs text-bone/40 font-body">
          {images.length}/{maxImages}
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Image grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((url, i) => (
              <div
                key={`${url}-${i}`}
                className="group relative aspect-video rounded-lg overflow-hidden border"
                style={{ borderColor: `${factionColor}20` }}
              >
                <img
                  src={url}
                  alt={`Imagen ${i + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = ''
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-void/80 border border-bone/20 text-bone/70 hover:text-blood-light hover:border-blood/40 transition-colors opacity-0 group-hover:opacity-100"
                  title="Eliminar imagen"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-void/80 to-transparent px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-bone/60 font-body truncate block">
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
            <ImagePlus className="w-8 h-8 mb-2" />
            <span className="text-sm font-body">Sin imagenes</span>
          </div>
        )}

        {/* Add image section */}
        {!isFull && (
          <div className="space-y-3">
            <div
              className="h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${factionColor}30, transparent)` }}
            />

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-lg bg-void-light">
              <button
                type="button"
                onClick={() => setTab('upload')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-body transition-colors',
                  tab === 'upload'
                    ? 'bg-void text-bone'
                    : 'text-bone/50 hover:text-bone/70'
                )}
              >
                <Upload className="w-3.5 h-3.5" />
                Subir archivo
              </button>
              <button
                type="button"
                onClick={() => setTab('url')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-body transition-colors',
                  tab === 'url'
                    ? 'bg-void text-bone'
                    : 'text-bone/50 hover:text-bone/70'
                )}
              >
                <LinkIcon className="w-3.5 h-3.5" />
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
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed text-sm font-body transition-colors hover:bg-bone/5 disabled:opacity-50"
                  style={{ borderColor: `${factionColor}30`, color: `${factionColor}` }}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
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
                  className="flex-1 px-3 py-2 rounded-lg bg-void-light border border-bone/10 text-bone text-sm font-body placeholder:text-bone/30 focus:outline-none focus:ring-1"
                  style={{ focusRingColor: factionColor } as React.CSSProperties}
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  disabled={!urlInput.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-body font-semibold transition-colors disabled:opacity-40"
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
          <p className="text-xs text-bone/40 font-body text-center">
            Limite de {maxImages} imagenes alcanzado
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="text-xs text-blood-light font-body">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
