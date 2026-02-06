'use client'

import { useImperativeHandle, useCallback, useMemo, type Ref } from 'react'
import { useCreateBlockNote, SuggestionMenuController } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import { filterSuggestionItems } from '@blocknote/core/extensions'

import '@blocknote/core/style.css'
import '@blocknote/mantine/style.css'
import './blocknote/theme.css'

import { wikiSchema } from './blocknote/schema'
import { getWikiSlashMenuItems } from './blocknote/slash-menu'
import { compressImage } from '@/lib/utils/compressImage'
import type { WikiContent } from '@/lib/supabase/wiki.types'
import type { WikiEditorRef } from './BlockNoteEditor'

interface BlockNoteEditorInnerProps {
  content?: WikiContent
  onChange?: (content: WikiContent) => void
  placeholder?: string
  factionColor?: string
  factionId?: string
  editable?: boolean
  className?: string
  forwardedRef?: Ref<WikiEditorRef>
}

async function uploadFile(file: File, factionId?: string): Promise<string> {
  const compressed = await compressImage(file)
  const formData = new FormData()
  formData.append('file', compressed)
  if (factionId) formData.append('faction_id', factionId)

  const res = await fetch('/api/wiki/upload', { method: 'POST', body: formData })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || 'Error al subir imagen')
  }
  const data = await res.json()
  return data.url
}

export function BlockNoteEditorInner({
  content,
  onChange,
  placeholder = 'Escribe / para ver comandos...',
  factionColor = '#C9A227',
  factionId,
  editable = true,
  className,
  forwardedRef,
}: BlockNoteEditorInnerProps) {
  const initialContent = useMemo(() => {
    if (!content) return undefined
    if (content.type === 'blocknote' && Array.isArray(content.blocks)) {
      return content.blocks
    }
    return undefined
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const editor = useCreateBlockNote(
    {
      schema: wikiSchema,
      initialContent: initialContent as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      uploadFile: (file: File) => uploadFile(file, factionId),
      placeholders: {
        default: placeholder,
      },
    },
    [factionId]
  )

  useImperativeHandle(
    forwardedRef,
    () => ({
      getContent: (): WikiContent => {
        const blocks = editor.document
        return { type: 'blocknote', blocks: blocks as unknown[] }
      },
      setContent: (newContent: WikiContent) => {
        if (newContent.type === 'blocknote' && Array.isArray(newContent.blocks)) {
          editor.replaceBlocks(editor.document, newContent.blocks as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        }
      },
      clearContent: () => {
        editor.replaceBlocks(editor.document, [
          { type: 'paragraph' as const },
        ] as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      },
    }),
    [editor]
  )

  const handleChange = useCallback(() => {
    if (onChange) {
      const blocks = editor.document
      onChange({ type: 'blocknote', blocks: blocks as unknown[] })
    }
  }, [editor, onChange])

  const slashMenuItems = useCallback(
    async (query: string) =>
      filterSuggestionItems(getWikiSlashMenuItems(editor as any), query), // eslint-disable-line @typescript-eslint/no-explicit-any
    [editor]
  )

  return (
    <div
      className={className}
      style={
        { '--bn-faction-color': factionColor } as React.CSSProperties
      }
    >
      <BlockNoteView
        editor={editor}
        editable={editable}
        onChange={handleChange}
        theme="dark"
        slashMenu={false}
      >
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={slashMenuItems}
        />
      </BlockNoteView>
    </div>
  )
}
