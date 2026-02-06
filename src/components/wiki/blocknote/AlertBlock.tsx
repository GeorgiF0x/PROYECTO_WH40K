import { createReactBlockSpec } from '@blocknote/react'
import { AlertTriangle, Skull, Info, ShieldAlert } from 'lucide-react'

const alertConfig = {
  heresy: {
    icon: Skull,
    color: '#DC143C',
    bgColor: 'rgba(220, 20, 60, 0.1)',
    defaultTitle: 'Advertencia de Herejia',
  },
  danger: {
    icon: AlertTriangle,
    color: '#FF6B35',
    bgColor: 'rgba(255, 107, 53, 0.1)',
    defaultTitle: 'Peligro',
  },
  info: {
    icon: Info,
    color: '#00D4AA',
    bgColor: 'rgba(0, 212, 170, 0.1)',
    defaultTitle: 'Informacion',
  },
  imperial: {
    icon: ShieldAlert,
    color: '#C9A227',
    bgColor: 'rgba(201, 162, 39, 0.1)',
    defaultTitle: 'Decreto Imperial',
  },
} as const

export const AlertBlock = createReactBlockSpec(
  {
    type: 'alertBlock' as const,
    propSchema: {
      alertType: { default: 'info' as const, values: ['heresy', 'danger', 'info', 'imperial'] as const },
      title: { default: '' },
    },
    content: 'inline',
  },
  {
    render: (props) => {
      const alertType = props.block.props.alertType as keyof typeof alertConfig
      const config = alertConfig[alertType] || alertConfig.info
      const Icon = config.icon
      const displayTitle = props.block.props.title || config.defaultTitle

      return (
        <div
          className="my-6 p-4 rounded-lg"
          style={{
            background: config.bgColor,
            borderLeft: `4px solid ${config.color}`,
          }}
        >
          <div className="flex items-start gap-3">
            <Icon
              className="w-5 h-5 mt-0.5 flex-shrink-0"
              style={{ color: config.color }}
            />
            <div className="flex-1 min-w-0">
              <input
                className="font-display text-sm font-bold uppercase tracking-wider mb-2 bg-transparent border-none outline-none w-full"
                style={{ color: config.color }}
                value={displayTitle}
                onChange={(e) => {
                  props.editor.updateBlock(props.block, {
                    props: { title: e.target.value },
                  })
                }}
                placeholder={config.defaultTitle}
              />
              <div
                className="font-body text-sm text-bone/80 leading-relaxed inline-content"
                ref={props.contentRef}
              />
            </div>
          </div>
        </div>
      )
    },
  }
)
