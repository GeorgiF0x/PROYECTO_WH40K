'use client'

import dynamic from 'next/dynamic'
import { forwardRef } from 'react'
import type { WikiContent } from '@/lib/supabase/wiki.types'

interface BlockNoteEditorProps {
  content?: WikiContent
  onChange?: (content: WikiContent) => void
  placeholder?: string
  factionColor?: string
  factionId?: string
  editable?: boolean
  className?: string
}

export interface WikiEditorRef {
  getContent: () => WikiContent
  setContent: (content: WikiContent) => void
  clearContent: () => void
}

const BlockNoteEditorLazy = dynamic(
  () => import('./BlockNoteEditorInner').then(mod => mod.BlockNoteEditorInner),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[300px] p-4 flex items-center justify-center text-bone/30 font-mono text-sm">
        Cargando editor...
      </div>
    ),
  }
)

export const BlockNoteEditor = forwardRef<WikiEditorRef, BlockNoteEditorProps>(
  function BlockNoteEditor(props, ref) {
    return <BlockNoteEditorLazy {...props} forwardedRef={ref} />
  }
)
