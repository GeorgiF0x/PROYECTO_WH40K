import { createReactBlockSpec } from '@blocknote/react'
import { Quote as QuoteIcon } from 'lucide-react'

export const QuoteBlock = createReactBlockSpec(
  {
    type: 'quoteBlock' as const,
    propSchema: {
      text: { default: '' },
      author: { default: '' },
      source: { default: '' },
    },
    content: 'none',
  },
  {
    render: (props) => {
      const factionColor = 'var(--bn-faction-color, #C9A227)'

      return (
        <div
          className="relative my-8 rounded-xl p-6"
          style={{
            background: `linear-gradient(135deg, color-mix(in srgb, ${factionColor} 9%, transparent) 0%, transparent 100%)`,
            border: `1px solid color-mix(in srgb, ${factionColor} 19%, transparent)`,
          }}
        >
          <QuoteIcon
            className="absolute left-3 top-3 h-6 w-6 opacity-30"
            style={{ color: factionColor }}
          />
          <QuoteIcon
            className="absolute bottom-3 right-3 h-6 w-6 rotate-180 opacity-30"
            style={{ color: factionColor }}
          />

          <div className="space-y-3 pl-6">
            <textarea
              className="w-full resize-none border-none bg-transparent font-body text-lg italic leading-relaxed text-bone/90 outline-none"
              value={props.block.props.text}
              onChange={(e) => {
                props.editor.updateBlock(props.block, {
                  props: { text: e.target.value },
                })
              }}
              placeholder="Escribe la cita..."
              rows={2}
            />

            <div className="flex items-center gap-3">
              <input
                className="flex-1 border-none bg-transparent font-body text-sm font-semibold outline-none"
                style={{ color: factionColor }}
                value={props.block.props.author}
                onChange={(e) => {
                  props.editor.updateBlock(props.block, {
                    props: { author: e.target.value },
                  })
                }}
                placeholder="Autor"
              />
              <span className="text-bone/30">-</span>
              <input
                className="flex-1 border-none bg-transparent font-body text-sm text-bone/50 outline-none"
                value={props.block.props.source}
                onChange={(e) => {
                  props.editor.updateBlock(props.block, {
                    props: { source: e.target.value },
                  })
                }}
                placeholder="Fuente"
              />
            </div>
          </div>
        </div>
      )
    },
  }
)
