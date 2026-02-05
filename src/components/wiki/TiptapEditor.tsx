'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { useCallback, useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Palette,
  X,
  Upload,
  Globe,
  Loader2,
  Crosshair,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { compressImage } from '@/lib/utils/compressImage'
import type { TiptapContent } from '@/lib/supabase/wiki.types'

interface TiptapEditorProps {
  content?: TiptapContent
  onChange?: (content: TiptapContent) => void
  placeholder?: string
  factionColor?: string
  factionId?: string
  editable?: boolean
  className?: string
}

export interface TiptapEditorRef {
  getContent: () => TiptapContent
  setContent: (content: TiptapContent) => void
  clearContent: () => void
}

export const TiptapEditor = forwardRef<TiptapEditorRef, TiptapEditorProps>(({
  content,
  onChange,
  placeholder = 'Comienza a escribir...',
  factionColor = '#C9A227',
  factionId,
  editable = true,
  className,
}, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'wiki-image rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'wiki-link',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextStyle,
      Color,
    ],
    content: content || {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    },
    editable,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getJSON() as TiptapContent)
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  })

  useImperativeHandle(ref, () => ({
    getContent: () => editor?.getJSON() as TiptapContent,
    setContent: (newContent: TiptapContent) => {
      editor?.commands.setContent(newContent)
    },
    clearContent: () => {
      editor?.commands.clearContent()
    },
  }))

  useEffect(() => {
    if (editor && content && JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
      editor.commands.setContent(content)
    }
  }, [editor, content])

  // ── Modal states ──
  const [imageModal, setImageModal] = useState(false)
  const [linkModal, setLinkModal] = useState(false)

  const openImageModal = useCallback(() => setImageModal(true), [])
  const openLinkModal = useCallback(() => setLinkModal(true), [])

  function handleInsertImage(url: string) {
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
    setImageModal(false)
  }

  function handleInsertLink(url: string) {
    if (!editor) return
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
    setLinkModal(false)
  }

  const [showColorPicker, setShowColorPicker] = useState(false)
  const colorPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false)
      }
    }
    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showColorPicker])

  const GRIMDARK_COLORS = [
    { hex: '#C9A227', label: 'Imperial Gold' },
    { hex: '#0D9B8A', label: 'Necron Teal' },
    { hex: '#8B0000', label: 'Blood Red' },
    { hex: '#E8E8F0', label: 'Bone' },
    { hex: '#FFFFFF', label: 'White' },
    { hex: '#F59E0B', label: 'Amber' },
    { hex: '#6B1C5F', label: 'Warp Purple' },
    { hex: '#22C55E', label: 'Warpstone Green' },
    { hex: '#06B6D4', label: 'Cyan' },
    { hex: '#EF4444', label: 'Red' },
  ]

  if (!editor) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-void-light rounded-lg border border-bone/10">
        <div className="animate-pulse text-bone/50">Cargando editor...</div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'wiki-editor rounded-lg overflow-hidden',
        className
      )}
      style={{
        background: '#0a0a12',
        border: `1px solid ${factionColor}30`,
      }}
    >
      {/* Toolbar */}
      {editable && (
        <div
          className="flex flex-wrap items-center gap-1 p-2 border-b"
          style={{
            background: `linear-gradient(180deg, ${factionColor}10 0%, transparent 100%)`,
            borderColor: `${factionColor}20`,
          }}
        >
          {/* History */}
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Deshacer"
            >
              <Undo className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Rehacer"
            >
              <Redo className="w-4 h-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarDivider />

          {/* Text formatting */}
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              title="Negrita"
              factionColor={factionColor}
            >
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              title="Cursiva"
              factionColor={factionColor}
            >
              <Italic className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive('strike')}
              title="Tachado"
              factionColor={factionColor}
            >
              <Strikethrough className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              active={editor.isActive('code')}
              title="Codigo"
              factionColor={factionColor}
            >
              <Code className="w-4 h-4" />
            </ToolbarButton>

            {/* Color picker */}
            <div className="relative" ref={colorPickerRef}>
              <ToolbarButton
                onClick={() => setShowColorPicker(!showColorPicker)}
                active={showColorPicker}
                title="Color de texto"
                factionColor={factionColor}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <Palette className="w-4 h-4" />
                  <div
                    className="w-3.5 h-0.5 rounded-full"
                    style={{
                      background: editor.getAttributes('textStyle').color || 'currentColor',
                    }}
                  />
                </div>
              </ToolbarButton>

              {showColorPicker && (
                <div className="absolute top-full left-0 mt-1 z-50 bg-void border border-imperial-gold/20 rounded-lg p-2 shadow-xl">
                  <div className="grid grid-cols-5 gap-1.5">
                    {GRIMDARK_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        title={c.label}
                        onClick={() => {
                          editor.chain().focus().setColor(c.hex).run()
                          setShowColorPicker(false)
                        }}
                        className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                        style={{
                          background: c.hex,
                          borderColor: editor.getAttributes('textStyle').color === c.hex
                            ? '#fff'
                            : 'rgba(232,232,240,0.2)',
                        }}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().unsetColor().run()
                      setShowColorPicker(false)
                    }}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs text-bone/60 hover:text-bone py-1 rounded transition-colors hover:bg-bone/10"
                  >
                    <X className="w-3 h-3" />
                    Quitar color
                  </button>
                </div>
              )}
            </div>
          </ToolbarGroup>

          <ToolbarDivider />

          {/* Headings */}
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive('heading', { level: 1 })}
              title="Titulo 1"
              factionColor={factionColor}
            >
              <Heading1 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
              title="Titulo 2"
              factionColor={factionColor}
            >
              <Heading2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive('heading', { level: 3 })}
              title="Titulo 3"
              factionColor={factionColor}
            >
              <Heading3 className="w-4 h-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarDivider />

          {/* Lists */}
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
              title="Lista"
              factionColor={factionColor}
            >
              <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
              title="Lista numerada"
              factionColor={factionColor}
            >
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarDivider />

          {/* Blocks */}
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
              title="Cita"
              factionColor={factionColor}
            >
              <Quote className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Separador"
              factionColor={factionColor}
            >
              <Minus className="w-4 h-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarDivider />

          {/* Media & Links */}
          <ToolbarGroup>
            <ToolbarButton
              onClick={openLinkModal}
              active={editor.isActive('link')}
              title="Enlace"
              factionColor={factionColor}
            >
              <LinkIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={openImageModal}
              title="Imagen"
              factionColor={factionColor}
            >
              <ImageIcon className="w-4 h-4" />
            </ToolbarButton>
          </ToolbarGroup>
        </div>
      )}

      {/* Editor content */}
      <EditorContent
        editor={editor}
        className="wiki-editor-content"
      />

      {/* ── Image Modal ── */}
      <EditorMediaModal
        isOpen={imageModal}
        onClose={() => setImageModal(false)}
        onConfirm={handleInsertImage}
        factionColor={factionColor}
        factionId={factionId}
        type="image"
      />

      {/* ── Link Modal ── */}
      <EditorLinkModal
        isOpen={linkModal}
        onClose={() => setLinkModal(false)}
        onConfirm={handleInsertLink}
        factionColor={factionColor}
        initialUrl={editor.getAttributes('link').href || ''}
      />

      {/* Custom styles */}
      <style jsx global>{`
        .wiki-editor-content .ProseMirror {
          min-height: 300px;
          padding: 1rem;
          color: rgba(232, 232, 240, 0.85);
          font-family: var(--font-body), Rajdhani, sans-serif;
        }

        .wiki-editor-content .ProseMirror p {
          margin-bottom: 1rem;
          line-height: 1.7;
        }

        .wiki-editor-content .ProseMirror h1,
        .wiki-editor-content .ProseMirror h2,
        .wiki-editor-content .ProseMirror h3 {
          font-family: var(--font-display), Orbitron, sans-serif;
          font-weight: 700;
          color: white;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .wiki-editor-content .ProseMirror h1 {
          font-size: 2rem;
          color: ${factionColor};
        }

        .wiki-editor-content .ProseMirror h2 {
          font-size: 1.5rem;
          color: ${factionColor};
        }

        .wiki-editor-content .ProseMirror h3 {
          font-size: 1.25rem;
        }

        .wiki-editor-content .ProseMirror blockquote {
          border-left: 4px solid ${factionColor};
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: rgba(232, 232, 240, 0.7);
        }

        .wiki-editor-content .ProseMirror ul,
        .wiki-editor-content .ProseMirror ol {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .wiki-editor-content .ProseMirror li {
          margin-bottom: 0.5rem;
        }

        .wiki-editor-content .ProseMirror code {
          background: ${factionColor}20;
          color: ${factionColor};
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875rem;
        }

        .wiki-editor-content .ProseMirror pre {
          background: #030308;
          border: 1px solid ${factionColor}30;
          border-radius: 0.5rem;
          padding: 1rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }

        .wiki-editor-content .ProseMirror pre code {
          background: none;
          color: rgba(232, 232, 240, 0.9);
          padding: 0;
        }

        .wiki-editor-content .ProseMirror hr {
          border: none;
          height: 1px;
          background: linear-gradient(90deg, transparent, ${factionColor}40, transparent);
          margin: 2rem 0;
        }

        .wiki-editor-content .ProseMirror a {
          color: ${factionColor};
          text-decoration: underline;
        }

        .wiki-editor-content .ProseMirror img {
          max-width: 100%;
          border-radius: 0.5rem;
          border: 1px solid ${factionColor}30;
        }

        .wiki-editor-content .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgba(232, 232, 240, 0.3);
          pointer-events: none;
          height: 0;
        }

        .wiki-editor-content .ProseMirror:focus {
          outline: none;
        }
      `}</style>
    </div>
  )
})

TiptapEditor.displayName = 'TiptapEditor'

/* ═══════════════════════════════════════════════════════════════════════════
   EDITOR MEDIA MODAL — Image insert (upload + URL)
   ═══════════════════════════════════════════════════════════════════════════ */

function EditorMediaModal({
  isOpen,
  onClose,
  onConfirm,
  factionColor,
  factionId,
  type,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: (url: string) => void
  factionColor: string
  factionId?: string
  type: 'image'
}) {
  const [tab, setTab] = useState<'upload' | 'url'>('upload')
  const [urlInput, setUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setUrlInput('')
      setError(null)
      setPreview(null)
      setUploading(false)
    }
  }, [isOpen])

  async function handleFileUpload(file: File) {
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
      setPreview(data.url)
      onConfirm(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function handleUrlSubmit() {
    const url = urlInput.trim()
    if (!url) return
    if (!url.startsWith('http')) {
      setError('La URL debe empezar con http:// o https://')
      return
    }
    onConfirm(url)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-void/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-void-light border border-bone/15 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Glow line */}
            <div
              className="h-[2px]"
              style={{ background: `linear-gradient(to right, transparent, ${factionColor}, transparent)` }}
            />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-bone/10">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4" style={{ color: `${factionColor}80` }} />
                <span className="text-[10px] font-mono tracking-[0.3em] uppercase" style={{ color: `${factionColor}80` }}>
                  INSERTAR IMAGEN
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-bone/40 hover:text-bone transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Tabs */}
              <div className="flex gap-1 p-1 rounded-lg bg-void/60">
                <button
                  type="button"
                  onClick={() => { setTab('upload'); setError(null) }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all',
                    tab === 'upload'
                      ? 'text-void shadow-sm'
                      : 'text-bone/50 hover:text-bone/70'
                  )}
                  style={tab === 'upload' ? { background: factionColor } : undefined}
                >
                  <Upload className="w-4 h-4" />
                  Subir archivo
                </button>
                <button
                  type="button"
                  onClick={() => { setTab('url'); setError(null) }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all',
                    tab === 'url'
                      ? 'text-void shadow-sm'
                      : 'text-bone/50 hover:text-bone/70'
                  )}
                  style={tab === 'url' ? { background: factionColor } : undefined}
                >
                  <Globe className="w-4 h-4" />
                  URL externa
                </button>
              </div>

              {/* Upload tab */}
              {tab === 'upload' && (
                <div>
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
                    className="w-full flex flex-col items-center justify-center gap-3 py-8 rounded-lg border-2 border-dashed transition-all hover:bg-bone/5 disabled:opacity-50"
                    style={{ borderColor: `${factionColor}40`, color: factionColor }}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-sm font-mono">Subiendo imagen...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8" />
                        <span className="text-sm font-mono">Click para seleccionar imagen</span>
                        <span className="text-xs text-bone/40">JPG, PNG, WebP, GIF (max 5MB)</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* URL tab */}
              {tab === 'url' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="w-full px-4 py-3 rounded-lg bg-void border border-bone/10 text-bone text-sm font-body placeholder:text-bone/30 focus:outline-none focus:ring-2"
                    style={{ ['--tw-ring-color' as string]: factionColor }}
                    autoFocus
                  />

                  {/* URL preview */}
                  {urlInput.startsWith('http') && (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-bone/10 bg-void">
                      <img
                        src={urlInput}
                        alt="Preview"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleUrlSubmit}
                    disabled={!urlInput.trim()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-30"
                    style={{
                      background: `linear-gradient(to right, ${factionColor}CC, ${factionColor}99)`,
                      color: '#0a0a12',
                    }}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Insertar imagen
                  </button>
                </div>
              )}

              {/* Error */}
              {error && (
                <p className="text-xs text-blood-light font-mono px-1">{error}</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   EDITOR LINK MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

function EditorLinkModal({
  isOpen,
  onClose,
  onConfirm,
  factionColor,
  initialUrl,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: (url: string) => void
  factionColor: string
  initialUrl: string
}) {
  const [urlInput, setUrlInput] = useState(initialUrl)

  useEffect(() => {
    if (isOpen) setUrlInput(initialUrl)
  }, [isOpen, initialUrl])

  function handleSubmit() {
    onConfirm(urlInput.trim())
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-void/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-sm bg-void-light border border-bone/15 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Glow line */}
            <div
              className="h-[2px]"
              style={{ background: `linear-gradient(to right, transparent, ${factionColor}, transparent)` }}
            />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-bone/10">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" style={{ color: `${factionColor}80` }} />
                <span className="text-[10px] font-mono tracking-[0.3em] uppercase" style={{ color: `${factionColor}80` }}>
                  INSERTAR ENLACE
                </span>
              </div>
              <button type="button" onClick={onClose} className="p-1 text-bone/40 hover:text-bone transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-lg bg-void border border-bone/10 text-bone text-sm font-body placeholder:text-bone/30 focus:outline-none focus:ring-2"
                style={{ ['--tw-ring-color' as string]: factionColor }}
                autoFocus
              />

              <div className="flex gap-2">
                {initialUrl && (
                  <button
                    type="button"
                    onClick={() => onConfirm('')}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-blood/30 text-blood/80 hover:bg-blood/10 hover:text-blood-light transition-all"
                  >
                    Quitar enlace
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    background: `linear-gradient(to right, ${factionColor}CC, ${factionColor}99)`,
                    color: '#0a0a12',
                  }}
                >
                  <LinkIcon className="w-4 h-4" />
                  {initialUrl ? 'Actualizar' : 'Insertar'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   TOOLBAR COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center">{children}</div>
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-bone/20 mx-2" />
}

interface ToolbarButtonProps {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title?: string
  factionColor?: string
  children: React.ReactNode
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  factionColor = '#C9A227',
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-2 rounded transition-all',
        active
          ? 'text-void'
          : 'text-bone/70 hover:text-bone hover:bg-bone/10',
        disabled && 'opacity-30 cursor-not-allowed'
      )}
      style={active ? { background: factionColor } : undefined}
    >
      {children}
    </button>
  )
}

export default TiptapEditor
