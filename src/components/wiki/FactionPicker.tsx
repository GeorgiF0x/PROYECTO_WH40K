'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ChevronRight, Check } from 'lucide-react'
import { factions } from '@/lib/data'
import { subFactionIcons, type SubFactionIcon } from '@/lib/subfaction-icons'

interface FactionPickerProps {
  factionId: string
  subFaction: string
  onFactionChange: (id: string) => void
  onSubFactionChange: (name: string) => void
  factionColor?: string
}

/** SVG icon paths for the 7 main factions */
const FACTION_MAIN_ICONS: Record<string, string> = {
  imperium: '/icons/Imperium/Adeptus Terra [Imperium].svg',
  chaos: '/icons/Chaos/chaos-star-01.svg',
  necrons: '/icons/Xenos/Necrons/Necrons [Yngir, Necrontyr].svg',
  aeldari: '/icons/Xenos/Aeldari/Aeldari [Eldar, Eye of Asuryan, Gods].svg',
  orks: '/icons/Xenos/Orks/Orks [Orkoids].svg',
  tau: '/icons/Xenos/Tau/tau.svg',
  tyranids: '/icons/Xenos/Tyranid/Tyranids [Hive Mind, Hive Fleets].svg',
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

        {/* Faction grid with icons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-2">
          {factions.map(f => {
            const isSelected = factionId === f.id
            const isHovered = hoveredFaction === f.id
            const iconPath = FACTION_MAIN_ICONS[f.id]
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
                className="relative flex flex-col items-center gap-2 rounded-xl border transition-all duration-300 py-3 px-2"
                style={{
                  background: isSelected
                    ? `linear-gradient(180deg, ${f.color}25 0%, ${f.color}08 100%)`
                    : isHovered
                      ? `${f.color}08`
                      : 'rgba(232,232,240,0.02)',
                  borderColor: isSelected
                    ? `${f.color}90`
                    : isHovered
                      ? `${f.color}40`
                      : 'rgba(232,232,240,0.06)',
                  boxShadow: isSelected
                    ? `0 0 24px ${f.color}30, inset 0 0 20px ${f.color}08`
                    : 'none',
                }}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                {/* Selected check badge */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center z-10"
                    style={{ background: f.color }}
                  >
                    <Check className="w-3 h-3 text-void" />
                  </motion.div>
                )}

                {/* Icon container */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300"
                  style={{
                    background: isSelected
                      ? `linear-gradient(135deg, ${f.color}, ${f.color}90)`
                      : isHovered
                        ? `${f.color}20`
                        : 'rgba(232,232,240,0.05)',
                    boxShadow: isSelected
                      ? `0 0 16px ${f.color}50`
                      : 'none',
                  }}
                >
                  {iconPath ? (
                    <Image
                      src={iconPath}
                      alt={f.shortName}
                      width={24}
                      height={24}
                      className="transition-all duration-300"
                      style={{
                        filter: isSelected
                          ? 'invert(1) brightness(2)'
                          : isHovered
                            ? `invert(1) brightness(1.5)`
                            : 'invert(0.6) brightness(0.8)',
                      }}
                    />
                  ) : (
                    <Shield
                      className="w-5 h-5 transition-colors duration-300"
                      style={{ color: isSelected ? '#fff' : `${f.color}60` }}
                    />
                  )}
                </div>

                {/* Faction name */}
                <span
                  className="text-[11px] font-medium leading-tight text-center transition-colors duration-300"
                  style={{
                    color: isSelected ? f.color : isHovered ? f.color : 'rgba(232,232,240,0.5)',
                  }}
                >
                  {f.shortName}
                </span>

                {/* Bottom glow bar on selected */}
                {isSelected && (
                  <motion.div
                    layoutId="faction-indicator"
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                    style={{ background: f.color }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
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
      className="group relative flex items-center gap-2.5 rounded-lg border transition-all duration-200 text-left overflow-hidden"
      style={{
        padding: featured ? '10px 12px' : '8px 10px',
        background: isSelected
          ? `linear-gradient(135deg, ${color}20 0%, ${color}08 100%)`
          : 'rgba(232,232,240,0.02)',
        borderColor: isSelected ? `${color}70` : 'rgba(232,232,240,0.06)',
        boxShadow: isSelected ? `0 0 16px ${color}25, inset 0 0 12px ${color}08` : 'none',
      }}
      whileHover={{
        scale: 1.02,
        borderColor: `${color}40`,
        backgroundColor: `${color}08`,
      }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Selected left accent bar */}
      {isSelected && (
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full"
          style={{ background: color }}
        />
      )}

      {/* SVG icon */}
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-md transition-all duration-200"
        style={{
          width: featured ? 36 : 28,
          height: featured ? 36 : 28,
          background: isSelected ? `${color}25` : 'transparent',
        }}
      >
        <img
          src={sf.icon}
          alt={sf.name}
          className="w-full h-full object-contain transition-all duration-200"
          style={{
            filter: isSelected
              ? `brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(0deg) drop-shadow(0 0 6px ${color}40)`
              : 'brightness(0) invert(0.6)',
          }}
        />
      </div>

      {/* Name */}
      <span
        className="text-xs font-medium leading-tight truncate transition-colors duration-200"
        style={{
          color: isSelected ? color : 'rgba(232,232,240,0.6)',
          fontSize: featured ? '0.8125rem' : '0.75rem',
        }}
      >
        {sf.name}
      </span>

      {/* Selected check */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="ml-auto flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
          style={{ background: color }}
        >
          <Check className="w-2.5 h-2.5 text-void" />
        </motion.div>
      )}

      {/* Featured star */}
      {featured && !isSelected && (
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
