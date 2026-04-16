'use client'

import { motion } from 'framer-motion'
import { BookOpen, Gamepad2, Images } from 'lucide-react'
import { getFactionTheme } from '@/lib/faction-themes'

export type FactionTab = 'lore' | 'juego' | 'gallery'

interface FactionTabsProps {
  factionId: string
  activeTab: FactionTab
  onTabChange: (tab: FactionTab) => void
}

const tabs: { id: FactionTab; label: string; icon: React.ReactNode }[] = [
  { id: 'lore', label: 'Trasfondo', icon: <BookOpen className="h-5 w-5" /> },
  { id: 'juego', label: 'Juego', icon: <Gamepad2 className="h-5 w-5" /> },
  { id: 'gallery', label: 'Galeria', icon: <Images className="h-5 w-5" /> },
]

export function FactionTabs({ factionId, activeTab, onTabChange }: FactionTabsProps) {
  const theme = getFactionTheme(factionId)

  return (
    <div className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-lg">
      <div
        className="absolute inset-0"
        style={{
          background: `${theme?.cssVars['--faction-bg'] || '#030308'}95`,
        }}
      />
      <div className="relative mx-auto max-w-7xl px-6">
        <nav className="flex items-center gap-1 md:gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative px-4 py-4 font-body text-sm font-semibold tracking-wide transition-colors md:px-8 md:py-5 md:text-base"
                style={{
                  color: isActive ? theme?.colors.primary : '#E8E8F0',
                }}
              >
                <span className="flex items-center gap-2">
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{
                      background: theme?.gradients.border,
                      backgroundSize: '200% 100%',
                    }}
                    animate={{
                      backgroundPosition: ['0% 50%', '200% 50%'],
                    }}
                    transition={{
                      backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' },
                      layout: { type: 'spring', stiffness: 500, damping: 30 },
                    }}
                  />
                )}

                {/* Hover effect */}
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: `${theme?.colors.primary}10`,
                  }}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: isActive ? 0 : 1 }}
                  transition={{ duration: 0.2 }}
                />
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default FactionTabs
