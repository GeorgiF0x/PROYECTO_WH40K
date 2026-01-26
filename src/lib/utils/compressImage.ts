/**
 * Client-side image compression using Canvas API.
 * Resizes and converts images to JPEG/WebP before uploading to Supabase Storage.
 * Reduces file sizes from ~2-5MB to ~100-400KB with no visible quality loss.
 */

interface CompressOptions {
  /** Max width or height in pixels */
  maxSize?: number
  /** JPEG/WebP quality 0-1 */
  quality?: number
  /** Output format */
  format?: 'image/jpeg' | 'image/webp'
}

const DEFAULTS: Required<CompressOptions> = {
  maxSize: 1200,
  quality: 0.82,
  format: 'image/webp',
}

const AVATAR_DEFAULTS: Required<CompressOptions> = {
  maxSize: 512,
  quality: 0.85,
  format: 'image/webp',
}

/**
 * Compress an image file using Canvas API.
 * Returns a new File with reduced size.
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const opts = { ...DEFAULTS, ...options }

  // Skip compression for small files (<100KB) or non-images
  if (file.size < 100 * 1024 || !file.type.startsWith('image/')) {
    return file
  }

  // Skip GIFs (they lose animation)
  if (file.type === 'image/gif') {
    return file
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      try {
        const { width, height } = calculateDimensions(
          img.naturalWidth,
          img.naturalHeight,
          opts.maxSize
        )

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(file) // Fallback: return original
          return
        }

        // High-quality resampling
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              // If compressed is larger (rare), use original
              resolve(file)
              return
            }

            const ext = opts.format === 'image/webp' ? 'webp' : 'jpg'
            const name = file.name.replace(/\.[^.]+$/, `.${ext}`)
            const compressed = new File([blob], name, { type: opts.format })
            resolve(compressed)
          },
          opts.format,
          opts.quality
        )
      } catch {
        resolve(file) // Fallback: return original
      }
    }
    img.onerror = () => resolve(file) // Fallback: return original

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Compress an avatar image (smaller max size, slightly higher quality).
 */
export async function compressAvatar(file: File): Promise<File> {
  return compressImage(file, AVATAR_DEFAULTS)
}

/**
 * Compress multiple images in parallel.
 */
export async function compressImages(
  files: File[],
  options: CompressOptions = {}
): Promise<File[]> {
  return Promise.all(files.map((f) => compressImage(f, options)))
}

/**
 * Calculate new dimensions maintaining aspect ratio.
 */
function calculateDimensions(
  width: number,
  height: number,
  maxSize: number
): { width: number; height: number } {
  if (width <= maxSize && height <= maxSize) {
    return { width, height }
  }

  const ratio = width / height

  if (width > height) {
    return { width: maxSize, height: Math.round(maxSize / ratio) }
  } else {
    return { width: Math.round(maxSize * ratio), height: maxSize }
  }
}
