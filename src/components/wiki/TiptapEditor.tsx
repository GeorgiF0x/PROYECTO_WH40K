'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { useCallback, useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TiptapContent } from '@/lib/supabase/wiki.types'

interface TiptapEditorProps {
  content?: TiptapContent
  onChange?: (content: TiptapContent) => void
  placeholder?: string
  factionColor?: string
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

  const addImage = useCallback(() => {
    const url = window.prompt('URL de la imagen:')
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const setLink = useCallback(() => {
    if (!editor) return

    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL del enlace:', previousUrl)

    if (url === null) return

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

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
              onClick={setLink}
              active={editor.isActive('link')}
              title="Enlace"
              factionColor={factionColor}
            >
              <LinkIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={addImage}
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

// Toolbar Components
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
