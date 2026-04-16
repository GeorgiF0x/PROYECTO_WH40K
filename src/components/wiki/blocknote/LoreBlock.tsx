import { createReactBlockSpec } from '@blocknote/react'
import { BookOpen, Scroll } from 'lucide-react'

export const LoreBlock = createReactBlockSpec(
  {
    type: 'loreBlock' as const,
    propSchema: {
      title: { default: 'Lore' },
      icon: { default: 'book' as const, values: ['book', 'scroll'] as const },
    },
    content: 'inline',
  },
  {
    render: (props) => {
      const iconType = props.block.props.icon
      const Icon = iconType === 'scroll' ? Scroll : BookOpen
      const factionColor = 'var(--bn-faction-color, #C9A227)'

      return (
        <div
          className="relative my-8 overflow-hidden rounded-xl"
          style={{
            background: `linear-gradient(180deg, color-mix(in srgb, ${factionColor} 6%, transparent) 0%, transparent 100%)`,
            border: `1px solid color-mix(in srgb, ${factionColor} 15%, transparent)`,
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-5 py-3"
            style={{
              background: `color-mix(in srgb, ${factionColor} 8%, transparent)`,
              borderBottom: `1px solid color-mix(in srgb, ${factionColor} 12%, transparent)`,
            }}
          >
            <Icon className="h-5 w-5" style={{ color: factionColor }} />
            <input
              className="flex-1 border-none bg-transparent font-display text-base font-bold uppercase tracking-wider outline-none"
              style={{ color: factionColor }}
              value={props.block.props.title}
              onChange={(e) => {
                props.editor.updateBlock(props.block, {
                  props: { title: e.target.value },
                })
              }}
              placeholder="Lore"
            />
          </div>

          {/* Content */}
          <div className="p-5">
            <div
              className="prose-sm inline-content font-body leading-relaxed text-bone/85"
              ref={props.contentRef}
            />
          </div>

          {/* Corner decorations */}
          <div
            className="pointer-events-none absolute right-0 top-0 h-16 w-16 opacity-10"
            style={{
              background: `linear-gradient(135deg, ${factionColor} 0%, transparent 50%)`,
            }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 h-16 w-16 opacity-10"
            style={{
              background: `linear-gradient(-45deg, ${factionColor} 0%, transparent 50%)`,
            }}
          />
        </div>
      )
    },
  }
)
