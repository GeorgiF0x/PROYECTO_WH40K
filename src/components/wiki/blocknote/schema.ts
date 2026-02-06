import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core'
import { AlertBlock } from './AlertBlock'
import { LoreBlock } from './LoreBlock'
import { QuoteBlock } from './QuoteBlock'

export const wikiSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    alertBlock: AlertBlock(),
    loreBlock: LoreBlock(),
    quoteBlock: QuoteBlock(),
  },
})

export type WikiSchema = typeof wikiSchema
