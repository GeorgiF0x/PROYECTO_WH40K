'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ChevronRight } from 'lucide-react'
import { factions } from '@/lib/data'
import { subFactionIcons, type SubFactionIcon } from '@/lib/subfaction-icons'

interface FactionPickerProps {
  factionId: string
  subFaction: string
  onFactionChange: (id: string) => void
  onSubFactionChange: (name: string) => void
  factionColor?: string
}

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
}

const iconVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
}

export function FactionPicker({
  factionId,
  subFaction,
  onFactionChange,
  onSubFactionChange,
  factionColor,
}: FactionPickerProps) {
  const [hoveredFaction, setHoveredFaction] = useState<string | null>(null)

  const selectedFaction = factions.find(f => f.id === factionId)
  const currentColor = factionColor || selectedFaction?.color || '#C9A227'
  const subFactions = factionId ? (subFactionIcons[factionId] || []) : []
  const featured = subFactions.filter(sf => sf.featured)
  const others = subFactions.filter(sf => !sf.featured)

  return (
    <div className="relative overflow-hidden rounded-xl bg-void-light/40 backdrop-blur-sm border border-bone/10">
      {/* Corner brackets */}
      <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-imperial-gold/30" />
      <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-imperial-gold/30" />
      <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-imperial-gold/30" />
      <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-imperial-gold/30" />

      {/* Glow line top */}
      <div
        className="h-[2px] transition-all duration-500"
        style={{
          background: factionId
            ? `linear-gradient(to right, transparent, ${currentColor}, transparent)`
            : 'linear-gradient(to right, transparent, rgba(201,162,39,0.3), transparent)',
        }}
      />

      <div className="p-5">
        {/* Section label */}
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-3.5 w-3.5 text-imperial-gold/60" />
          <span className="text-[10px] font-mono text-imperial-gold/60 tracking-[0.3em] uppercase">
            FACCION PRINCIPAL
          </span>
        </div>

        {/* Faction buttons */}
        <div className="flex flex-wrap gap-2 mb-2">
          {factions.map(f => {
            const isSelected = factionId === f.id
            const isHovered = hoveredFaction === f.id
            return (
              <motion.button
                key={f.id}
                type="button"
                onClick={() => {
                  onFactionChange(f.id)
                  onSubFactionChange('')
                }}
                onMouseEnter={() => setHoveredFaction(f.id)}
                onMouseLeave={() => setHoveredFaction(null)}
                className="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border"
                style={{
                  background: isSelected
                    ? `${f.color}20`
                    : isHovered
                      ? `${f.color}10`
                      : 'rgba(232,232,240,0.03)',
                  borderColor: isSelected
                    ? `${f.color}80`
                    : isHovered
                      ? `${f.color}40`
                      : 'rgba(232,232,240,0.08)',
                  color: isSelected ? f.color : isHovered ? f.color : 'rgba(232,232,240,0.6)',
                  boxShadow: isSelected ? `0 0 16px ${f.color}30` : 'none',
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {f.shortName}
              </motion.button>
            )
          })}
        </div>

        {/* Subfaction grid */}
        <AnimatePresence mode="wait">
          {factionId && subFactions.length > 0 && (
            <motion.div
              key={factionId}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Separator */}
              <div className="my-4 flex items-center gap-3">
                <div
                  className="flex-1 h-px"
                  style={{
                    background: `linear-gradient(to right, ${currentColor}40, transparent)`,
                  }}
                />
                <div className="flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3" style={{ color: `${currentColor}80` }} />
                  <span className="text-[10px] font-mono tracking-[0.3em] uppercase" style={{ color: `${currentColor}80` }}>
                    SUBFACCION (OPCIONAL)
                  </span>
                </div>
                <div
                  className="flex-1 h-px"
                  style={{
                    background: `linear-gradient(to left, ${currentColor}40, transparent)`,
                  }}
                />
              </div>

              {/* Deselect button */}
              {subFaction && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => onSubFactionChange('')}
                  className="mb-3 text-xs font-mono text-bone/40 hover:text-bone/70 transition-colors"
                >
                  &times; Quitar subfaccion
                </motion.button>
              )}

              {/* Featured subfactions (larger) */}
              {featured.length > 0 && (
                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3"
                  variants={gridVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {featured.map(sf => (
                    <SubFactionButton
                      key={sf.name}
                      sf={sf}
                      isSelected={subFaction === sf.name}
                      color={currentColor}
                      featured
                      onClick={() => onSubFactionChange(subFaction === sf.name ? '' : sf.name)}
                    />
                  ))}
                </motion.div>
              )}

              {/* Other subfactions */}
              {others.length > 0 && (
                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2"
                  variants={gridVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {others.map(sf => (
                    <SubFactionButton
                      key={sf.name}
                      sf={sf}
                      isSelected={subFaction === sf.name}
                      color={currentColor}
                      onClick={() => onSubFactionChange(subFaction === sf.name ? '' : sf.name)}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ── SubFaction Button ── */

function SubFactionButton({
  sf,
  isSelected,
  color,
  featured,
  onClick,
}: {
  sf: SubFactionIcon
  isSelected: boolean
  color: string
  featured?: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      variants={iconVariants}
      onClick={onClick}
      className="group relative flex items-center gap-2.5 rounded-lg border transition-all duration-200 text-left"
      style={{
        padding: featured ? '10px 12px' : '8px 10px',
        background: isSelected ? `${color}15` : 'rgba(232,232,240,0.02)',
        borderColor: isSelected ? `${color}60` : 'rgba(232,232,240,0.06)',
        boxShadow: isSelected ? `0 0 12px ${color}25, inset 0 0 12px ${color}08` : 'none',
      }}
      whileHover={{
        scale: 1.02,
        borderColor: `${color}40`,
        backgroundColor: `${color}08`,
      }}
      whileTap={{ scale: 0.97 }}
    >
      {/* SVG icon */}
      <div
        className="flex-shrink-0 flex items-center justify-center"
        style={{
          width: featured ? 36 : 28,
          height: featured ? 36 : 28,
        }}
      >
        <img
          src={sf.icon}
          alt={sf.name}
          className="w-full h-full object-contain transition-all duration-200"
          style={{
            filter: isSelected
              ? `brightness(0) saturate(100%) drop-shadow(0 0 4px ${color}60)`
              : 'brightness(0) invert(0.85)',
            ...(isSelected ? {} : {}),
          }}
          onLoad={(e) => {
            // Apply color tint when selected via CSS
            if (isSelected) {
              (e.target as HTMLImageElement).style.filter =
                `brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(0deg) drop-shadow(0 0 6px ${color}40)`
            }
          }}
        />
      </div>

      {/* Name */}
      <span
        className="text-xs font-medium leading-tight truncate"
        style={{
          color: isSelected ? color : 'rgba(232,232,240,0.6)',
          fontSize: featured ? '0.8125rem' : '0.75rem',
        }}
      >
        {sf.name}
      </span>

      {/* Featured star */}
      {featured && (
        <span
          className="absolute top-1 right-1.5 text-[8px]"
          style={{ color: `${color}50` }}
        >
          &#9733;
        </span>
      )}
    </motion.button>
  )
}
