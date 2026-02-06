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
          className="relative my-8 rounded-xl overflow-hidden"
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
            <Icon className="w-5 h-5" style={{ color: factionColor }} />
            <input
              className="font-display text-base font-bold uppercase tracking-wider bg-transparent border-none outline-none flex-1"
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
              className="font-body text-bone/85 leading-relaxed prose-sm inline-content"
              ref={props.contentRef}
            />
          </div>

          {/* Corner decorations */}
          <div
            className="absolute top-0 right-0 w-16 h-16 opacity-10 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, ${factionColor} 0%, transparent 50%)`,
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-16 h-16 opacity-10 pointer-events-none"
            style={{
              background: `linear-gradient(-45deg, ${factionColor} 0%, transparent 50%)`,
            }}
          />
        </div>
      )
    },
  }
)
