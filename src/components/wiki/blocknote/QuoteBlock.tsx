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
          className="relative my-8 p-6 rounded-xl"
          style={{
            background: `linear-gradient(135deg, color-mix(in srgb, ${factionColor} 9%, transparent) 0%, transparent 100%)`,
            border: `1px solid color-mix(in srgb, ${factionColor} 19%, transparent)`,
          }}
        >
          <QuoteIcon
            className="absolute top-3 left-3 w-6 h-6 opacity-30"
            style={{ color: factionColor }}
          />
          <QuoteIcon
            className="absolute bottom-3 right-3 w-6 h-6 opacity-30 rotate-180"
            style={{ color: factionColor }}
          />

          <div className="pl-6 space-y-3">
            <textarea
              className="font-body text-lg italic text-bone/90 leading-relaxed bg-transparent border-none outline-none w-full resize-none"
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
                className="font-body font-semibold bg-transparent border-none outline-none flex-1 text-sm"
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
                className="font-body text-bone/50 bg-transparent border-none outline-none flex-1 text-sm"
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
