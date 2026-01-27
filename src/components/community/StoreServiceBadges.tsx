import {
  Swords,
  Paintbrush,
  Trophy,
  Palette,
  Globe,
  RefreshCw,
  Dice5,
  BookOpen,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const STORE_SERVICES: Record<string, { label: string; icon: LucideIcon }> = {
  gaming_tables: { label: 'Mesas de juego', icon: Swords },
  painting_workshops: { label: 'Talleres de pintura', icon: Paintbrush },
  tournaments: { label: 'Torneos', icon: Trophy },
  painting_service: { label: 'Servicio de pintura', icon: Palette },
  online_sales: { label: 'Venta online', icon: Globe },
  secondhand: { label: 'Segunda mano', icon: RefreshCw },
  board_games: { label: 'Juegos de mesa', icon: Dice5 },
  rpg: { label: 'Juegos de rol', icon: BookOpen },
}

interface StoreServiceBadgesProps {
  services: string[]
  compact?: boolean
}

export default function StoreServiceBadges({ services, compact = false }: StoreServiceBadgesProps) {
  if (!services || services.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {services.map((key) => {
        const service = STORE_SERVICES[key]
        if (!service) return null
        const Icon = service.icon
        return (
          <span
            key={key}
            className={`inline-flex items-center gap-1.5 rounded-lg border border-imperial-gold/20 bg-imperial-gold/5 text-imperial-gold/80 ${
              compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1.5 text-sm'
            }`}
          >
            <Icon className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
            {!compact && <span className="font-body">{service.label}</span>}
          </span>
        )
      })}
    </div>
  )
}

export { STORE_SERVICES }
