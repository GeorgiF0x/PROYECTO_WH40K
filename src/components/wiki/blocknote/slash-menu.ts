import type { BlockNoteEditor } from '@blocknote/core'
import {
  filterSuggestionItems,
  insertOrUpdateBlockForSlashMenu,
} from '@blocknote/core/extensions'
import { getDefaultReactSlashMenuItems } from '@blocknote/react'
import type { WikiSchema } from './schema'

type WikiEditor = BlockNoteEditor<
  WikiSchema['blockSchema'],
  WikiSchema['inlineContentSchema'],
  WikiSchema['styleSchema']
>

function insertBlock(editor: WikiEditor, block: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insertOrUpdateBlockForSlashMenu(editor as any, block as any)
}

function getCustomSlashMenuItems(editor: WikiEditor) {
  return [
    {
      title: 'Bloque de Lore',
      subtext: 'Seccion de lore con encabezado decorado — /lore',
      group: 'Bloques Imperiales',
      onItemClick: () => {
        insertBlock(editor, {
          type: 'loreBlock',
          props: { title: 'Lore', icon: 'book' },
        })
      },
      aliases: ['lore', 'historia'],
    },
    {
      title: 'Bloque de Cita',
      subtext: 'Cita con atribucion de autor — /cita',
      group: 'Bloques Imperiales',
      onItemClick: () => {
        insertBlock(editor, {
          type: 'quoteBlock',
          props: { text: '', author: '', source: '' },
        })
      },
      aliases: ['cita', 'quote'],
    },
    {
      title: 'Alerta: Herejia',
      subtext: 'Advertencia de contenido hereje — /herejia',
      group: 'Alertas',
      onItemClick: () => {
        insertBlock(editor, {
          type: 'alertBlock',
          props: { alertType: 'heresy' },
        })
      },
      aliases: ['heresy', 'herejia'],
    },
    {
      title: 'Alerta: Peligro',
      subtext: 'Aviso de peligro — /peligro',
      group: 'Alertas',
      onItemClick: () => {
        insertBlock(editor, {
          type: 'alertBlock',
          props: { alertType: 'danger' },
        })
      },
      aliases: ['danger', 'peligro'],
    },
    {
      title: 'Alerta: Info',
      subtext: 'Nota informativa — /info',
      group: 'Alertas',
      onItemClick: () => {
        insertBlock(editor, {
          type: 'alertBlock',
          props: { alertType: 'info' },
        })
      },
      aliases: ['info', 'nota'],
    },
    {
      title: 'Alerta: Decreto Imperial',
      subtext: 'Decreto del Emperador — /imperial',
      group: 'Alertas',
      onItemClick: () => {
        insertBlock(editor, {
          type: 'alertBlock',
          props: { alertType: 'imperial' },
        })
      },
      aliases: ['imperial', 'decreto'],
    },
  ]
}

export function getWikiSlashMenuItems(editor: WikiEditor) {
  return [
    ...getDefaultReactSlashMenuItems(editor),
    ...getCustomSlashMenuItems(editor),
  ]
}

export function filterWikiSlashMenuItems(editor: WikiEditor, query: string) {
  return filterSuggestionItems(getWikiSlashMenuItems(editor), query)
}
