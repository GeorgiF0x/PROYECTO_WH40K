import { Clock } from 'lucide-react'
import type { Json } from '@/lib/types/database.types'

interface DayHours {
  open: string
  close: string
}

type OpeningHours = Record<string, DayHours>

const DAY_LABELS: Record<string, string> = {
  mon: 'Lunes',
  tue: 'Martes',
  wed: 'Miércoles',
  thu: 'Jueves',
  fri: 'Viernes',
  sat: 'Sábado',
  sun: 'Domingo',
}

const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

function getCurrentDay(): string {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  return days[new Date().getDay()]
}

interface StoreHoursProps {
  hours: Json
  compact?: boolean
}

export default function StoreHours({ hours, compact = false }: StoreHoursProps) {
  const openingHours = hours as unknown as OpeningHours
  if (!openingHours || Object.keys(openingHours).length === 0) return null

  const today = getCurrentDay()

  if (compact) {
    const todayHours = openingHours[today]
    return (
      <div className="flex items-center gap-1.5 text-sm">
        <Clock className="w-4 h-4 text-imperial-gold/60" />
        {todayHours ? (
          <span className="font-body text-bone/70">
            Hoy: {todayHours.open} - {todayHours.close}
          </span>
        ) : (
          <span className="font-body text-bone/40">Hoy: Cerrado</span>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-imperial-gold" />
        <h3 className="font-display font-semibold text-bone">Horario</h3>
      </div>
      {DAY_ORDER.map((day) => {
        const dayHours = openingHours[day]
        const isToday = day === today
        return (
          <div
            key={day}
            className={`flex items-center justify-between py-1.5 px-3 rounded-lg ${
              isToday ? 'bg-imperial-gold/10 border border-imperial-gold/20' : ''
            }`}
          >
            <span className={`text-sm font-body ${isToday ? 'text-imperial-gold font-semibold' : 'text-bone/60'}`}>
              {DAY_LABELS[day]}
            </span>
            {dayHours ? (
              <span className={`text-sm font-body ${isToday ? 'text-imperial-gold' : 'text-bone/80'}`}>
                {dayHours.open} - {dayHours.close}
              </span>
            ) : (
              <span className="text-sm font-body text-bone/30">Cerrado</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
