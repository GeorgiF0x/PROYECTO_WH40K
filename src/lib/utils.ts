import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const SUPABASE_STORAGE_HOST = 'yvjflhvbtjjmdwkgqqfs.supabase.co'

/**
 * Adds Supabase image transform params to a storage URL.
 * Returns the original URL unchanged if it's not a Supabase storage URL.
 */
export function optimizeImageUrl(
  url: string | null | undefined,
  width: number,
  quality = 75
): string {
  if (!url) return '/placeholder-miniature.jpg'
  if (!url.includes(SUPABASE_STORAGE_HOST)) return url

  // Replace /object/public/ with /render/image/public/ for transform endpoint
  const transformed = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  )

  const separator = transformed.includes('?') ? '&' : '?'
  return `${transformed}${separator}width=${width}&quality=${quality}`
}

export function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'ahora'
  if (minutes < 60) return `hace ${minutes}m`
  if (hours < 24) return `hace ${hours}h`
  if (days < 7) return `hace ${days}d`
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  })
}
