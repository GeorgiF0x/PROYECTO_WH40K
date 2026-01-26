'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Search, X } from 'lucide-react'

interface Faction {
  id: string
  name: string
  slug: string
  primary_color: string | null
  secondary_color: string | null
}

interface FactionSelectorProps {
  selectedFactions: string[]
  onChange: (factions: string[]) => void
  maxSelections?: number
}

// Category tabs with icons
export const CATEGORIES = [
  { id: 'all', label: 'Todas', icon: null },
  { id: 'marines', label: 'Marines', icon: '/icons/Imperium/Adeptus Astartes [Imperium, Space Marines].svg' },
  { id: 'chaos', label: 'Caos', icon: '/icons/Chaos/chaos-star-01.svg' },
  { id: 'imperium', label: 'Imperium', icon: '/icons/Imperium/Adeptus Terra [Imperium].svg' },
  { id: 'aeldari', label: 'Aeldari', icon: '/icons/Xenos/Aeldari/Aeldari [Eldar, Eye of Asuryan, Gods].svg' },
  { id: 'tyranids', label: 'Tiránidos', icon: '/icons/Xenos/Tyranid/Tyranids [Hive Mind, Hive Fleets].svg' },
  { id: 'orks', label: 'Orkos', icon: '/icons/Xenos/Orks/Orks [Orkoids].svg' },
  { id: 'necrons', label: 'Necrones', icon: '/icons/Xenos/Necrons/Necrons [Yngir, Necrontyr].svg' },
  { id: 'tau', label: "T'au", icon: '/icons/Xenos/Tau/tau.svg' },
]

// Mapping slugs to categories
export const SLUG_TO_CATEGORY: Record<string, string> = {
  // Marines
  'ultramarines': 'marines', 'blood-angels': 'marines', 'dark-angels': 'marines',
  'space-wolves': 'marines', 'imperial-fists': 'marines', 'salamanders': 'marines',
  'raven-guard': 'marines', 'iron-hands': 'marines', 'white-scars': 'marines',
  'black-templars': 'marines', 'crimson-fists': 'marines', 'flesh-tearers': 'marines',
  'deathwatch': 'marines', 'blood-ravens': 'marines', 'lamenters': 'marines',
  'minotaurs': 'marines', 'space-marines': 'marines', 'grey-knights': 'marines',
  // Chaos
  'black-legion': 'chaos', 'word-bearers': 'chaos', 'iron-warriors': 'chaos',
  'night-lords': 'chaos', 'alpha-legion': 'chaos', 'emperors-children': 'chaos',
  'sons-of-horus': 'chaos', 'chaos-space-marines': 'chaos', 'death-guard': 'chaos',
  'thousand-sons': 'chaos', 'world-eaters': 'chaos', 'chaos-daemons': 'chaos',
  'khorne-daemons': 'chaos', 'nurgle-daemons': 'chaos', 'tzeentch-daemons': 'chaos',
  'slaanesh-daemons': 'chaos', 'chaos-knights': 'chaos',
  // Imperium
  'adeptus-mechanicus': 'imperium', 'adeptus-custodes': 'imperium',
  'imperial-knights': 'imperium', 'astra-militarum': 'imperium',
  'adepta-sororitas': 'imperium', 'agents-imperium': 'imperium',
  'cadian': 'imperium', 'catachan': 'imperium', 'death-korps': 'imperium',
  'tallarn': 'imperium', 'vostroyan': 'imperium', 'mordian': 'imperium',
  'armageddon': 'imperium', 'valhallan': 'imperium', 'martyred-lady': 'imperium',
  'bloody-rose': 'imperium', 'ebon-chalice': 'imperium', 'argent-shroud': 'imperium',
  'sacred-rose': 'imperium', 'valorous-heart': 'imperium',
  // Aeldari
  'aeldari': 'aeldari', 'drukhari': 'aeldari', 'ulthwe': 'aeldari',
  'saim-hann': 'aeldari', 'biel-tan': 'aeldari', 'alaitoc': 'aeldari',
  'iyanden': 'aeldari', 'harlequins': 'aeldari', 'ynnari': 'aeldari', 'corsairs': 'aeldari',
  // Tyranids
  'tyranids': 'tyranids', 'leviathan': 'tyranids', 'kraken': 'tyranids',
  'behemoth': 'tyranids', 'jormungandr': 'tyranids', 'hydra': 'tyranids',
  'gorgon': 'tyranids', 'genestealer-cults': 'tyranids',
  // Orks
  'orks': 'orks', 'goffs': 'orks', 'evil-sunz': 'orks', 'bad-moons': 'orks',
  'deathskulls': 'orks', 'blood-axes': 'orks', 'snakebites': 'orks', 'freebooterz': 'orks',
  // Necrons
  'necrons': 'necrons', 'sautekh': 'necrons', 'nihilakh': 'necrons',
  'mephrit': 'necrons', 'novokh': 'necrons', 'nephrekh': 'necrons', 'szarekhan': 'necrons',
  // Tau
  'tau-empire': 'tau', 'tau-sept': 'tau', 'viorla-sept': 'tau',
  'sacea-sept': 'tau', 'farsight-enclaves': 'tau', 'borkan-sept': 'tau', 'dalyth-sept': 'tau',
}

// Icon mapping for specific factions
export const FACTION_ICONS: Record<string, string> = {
  // ========== SPACE MARINES - Legiones fundadoras ==========
  'ultramarines': '/icons/Imperium/Ultramarines [Imperium, Adeptus Astartes, Space Marines, Legion].svg',
  'blood-angels': '/icons/Imperium/Blood Angels [Imperium, Adeptus Astartes, Space Marines, Legion].svg',
  'dark-angels': '/icons/Imperium/Dark Angels [Imperium, Adeptus Astartes, Space Marines, Legion].svg',
  'space-wolves': '/icons/Imperium/Space Wolves [Imperium, Adeptus Astartes, Space Marines, Legion].svg',
  'imperial-fists': '/icons/Imperium/Imperial Fists [Imperium, Adeptus Astartes, Space Marines, Legion].svg',
  'salamanders': '/icons/Imperium/Salamanders [Imperium, Adeptus Astartes, Space Marines, Legion].svg',
  'raven-guard': '/icons/Imperium/Raven Guard [Imperium, Adeptus Astartes, Space Marines, Legion].svg',
  'iron-hands': '/icons/Imperium/Iron Hands [Imperium, Adeptus Astartes, Space Marines, Legion].svg',
  'white-scars': '/icons/Imperium/White Scars [Imperium, Adeptus Astartes, Space Marines, Legion].svg',
  // Capítulos sucesores con icono propio
  'black-templars': '/icons/Imperium/Black Templars [Imperium, Adeptus Astartes, Space Marines, Imperial Fists, Chapter].svg',
  'grey-knights': '/icons/Imperium/Grey Knights [Imperium, Inquisition, Ordo Malleus, Adeptus Astartes, Space Marines, Chapter].svg',
  'deathwatch': '/icons/Imperium/Deathwatch [Imperium, Inquisition, Ordo Xenos, Adeptus Astartes, Space Marines, Chapter].svg',
  'blood-ravens': '/icons/Imperium/Blood Ravens [Imperium, Adeptus Astartes, Space Marines, Chapter].svg',
  'flesh-tearers': '/icons/Imperium/Flesh Tearers [Imperium, Adeptus Astartes, Space Marines, Blood Angels, Chapter].svg',
  'lamenters': '/icons/Imperium/Lamenters [Imperium, Adeptus Astartes, Space Marines, Blood Angels, Chapter].svg',
  'minotaurs': '/icons/Imperium/Minotaurs [Imperium, Adeptus Astartes, Space Marines, High Lords of Terra, Chapter].svg',
  'space-marines': '/icons/Imperium/Adeptus Astartes [Imperium, Space Marines].svg',
  // Capítulos sin icono propio -> usan icono genérico de Marines
  'crimson-fists': '/icons/Imperium/Imperial Fists [Imperium, Adeptus Astartes, Space Marines, Legion].svg',

  // ========== IMPERIUM ==========
  'adeptus-custodes': '/icons/Imperium/Adeptus Custodes [Imperium, Talons of the Emperor].svg',
  'adeptus-mechanicus': '/icons/Imperium/Adeptus Mechanicus [Imperium].svg',
  'adepta-sororitas': '/icons/Imperium/Adepta Sororitas [Imperium, Adeptus Ministorum, Ecclesiarchy, Inquisition, Ordo Hereticus, Sisters of Battle, Battle Sisters].svg',
  'astra-militarum': '/icons/Imperium/Astra Militarum [Imperium, Imperial Guard].svg',
  'imperial-knights': '/icons/Imperium/Imperial Knights [Imperium, Questor Imperialis, Questoris Knights].svg',
  'agents-imperium': '/icons/Imperium/Adeptus Terra [Imperium].svg',
  // Órdenes de Sororitas con icono propio
  'martyred-lady': '/icons/Imperium/Order of Our Martyred Lady [Imperium, Adeptus Ministorum, Ecclesiarchy, Adepta Sororitas , Sisters of Battle, Battle Sisters, Order].svg',
  'bloody-rose': '/icons/Imperium/Order of the Bloody Rose [Imperium, Adeptus Ministorum, Ecclesiarchy, Adepta Sororitas , Sisters of Battle, Battle Sisters, Order].svg',
  'ebon-chalice': '/icons/Imperium/Order of the Ebon Chalice [Imperium, Adeptus Ministorum, Ecclesiarchy, Adepta Sororitas , Sisters of Battle, Battle Sisters, Order].svg',
  'argent-shroud': '/icons/Imperium/Order of the Argent Shroud [Imperium, Adeptus Ministorum, Ecclesiarchy, Adepta Sororitas , Sisters of Battle, Battle Sisters, Order].svg',
  'valorous-heart': '/icons/Imperium/Order of the Valorous Heart [Imperium, Adeptus Ministorum, Ecclesiarchy, Adepta Sororitas , Sisters of Battle, Battle Sisters, Order].svg',
  // Sacred Rose no tiene icono -> usa Sororitas genérico
  'sacred-rose': '/icons/Imperium/Adepta Sororitas [Imperium, Adeptus Ministorum, Ecclesiarchy, Inquisition, Ordo Hereticus, Sisters of Battle, Battle Sisters].svg',
  // Regimientos de la Guardia Imperial -> usan Astra Militarum
  'cadian': '/icons/Imperium/Astra Militarum [Imperium, Imperial Guard].svg',
  'catachan': '/icons/Imperium/Astra Militarum [Imperium, Imperial Guard].svg',
  'death-korps': '/icons/Imperium/Astra Militarum [Imperium, Imperial Guard].svg',
  'tallarn': '/icons/Imperium/Astra Militarum [Imperium, Imperial Guard].svg',
  'vostroyan': '/icons/Imperium/Astra Militarum [Imperium, Imperial Guard].svg',
  'mordian': '/icons/Imperium/Astra Militarum [Imperium, Imperial Guard].svg',
  'armageddon': '/icons/Imperium/Astra Militarum [Imperium, Imperial Guard].svg',
  'valhallan': '/icons/Imperium/Astra Militarum [Imperium, Imperial Guard].svg',

  // ========== CHAOS ==========
  'black-legion': '/icons/Chaos/Black Legion [Chaos, Heretic Astartes, Chaos Space Marines, Legion].svg',
  'death-guard': '/icons/Chaos/Death Guard [Chaos, Heretic Astartes, Chaos Space Marines, Legion, Nurgle].svg',
  'thousand-sons': '/icons/Chaos/Thousand Sons [Chaos, Heretic Astartes, Chaos Space Marines, Legion, Tzeentch].svg',
  'world-eaters': '/icons/Chaos/World Eaters [Chaos, Heretic Astartes, Chaos Space Marines, Legion, Khorne].svg',
  'alpha-legion': '/icons/Chaos/Alpha Legion [Chaos, Heretic Astartes, Chaos Space Marines, Legion].svg',
  'iron-warriors': '/icons/Chaos/Iron Warriors [Chaos, Heretic Astartes, Chaos Space Marines, Legion].svg',
  'night-lords': '/icons/Chaos/Night Lords [Chaos, Heretic Astartes, Chaos Space Marines, Legion].svg',
  'word-bearers': '/icons/Chaos/Word Bearers [Chaos, Heretic Astartes, Chaos Space Marines, Legion].svg',
  'emperors-children': '/icons/Chaos/Emperor_s Children [Chaos, Heretic Astartes, Chaos Space Marines, Legion, Slaanesh].svg',
  'sons-of-horus': '/icons/Chaos/Sons of Horus [Chaos, Heretic Astartes, Chaos Space Marines, Legion].svg',
  'chaos-space-marines': '/icons/Chaos/Heretic Astartes [Chaos, Chaos Space Marines].svg',
  'chaos-knights': '/icons/Chaos/Questor Traitoris [Chaos, Dark Mechanicum, Chaos Knights, Renegade Knights].svg',
  'chaos-daemons': '/icons/Chaos/Chaos Daemons [Chaos].svg',
  'khorne-daemons': '/icons/Chaos/Khorne [Chaos, Chaos Daemons, Gods].svg',
  'nurgle-daemons': '/icons/Chaos/Nurgle [Chaos, Chaos Daemons, Gods].svg',
  'tzeentch-daemons': '/icons/Chaos/Tzeentch [Chaos, Chaos Daemons, Gods].svg',
  'slaanesh-daemons': '/icons/Chaos/Slaanesh [Chaos, Chaos Daemons, Gods].svg',

  // ========== AELDARI ==========
  'aeldari': '/icons/Xenos/Aeldari/Aeldari [Eldar, Eye of Asuryan, Gods].svg',
  'drukhari': '/icons/Xenos/Aeldari/Drukhari 1 [Aeldari, Dark Eldar].svg',
  'harlequins': '/icons/Xenos/Aeldari/Harlequins [Aeldari, Eldar, Rillietann].svg',
  'ynnari': '/icons/Xenos/Aeldari/Ynnari [Aeldari, Eldar].svg',
  // Craftworlds con icono propio
  'ulthwe': '/icons/Xenos/Aeldari/Ulthwe [Aeldari, Eldar, Asuryani, Craftworlds].svg',
  'saim-hann': '/icons/Xenos/Aeldari/Saim-Hann [Aeldari, Eldar, Asuryani, Craftworlds].svg',
  'biel-tan': '/icons/Xenos/Aeldari/Biel-Tan [Aeldari, Eldar, Asuryani, Craftworlds].svg',
  'alaitoc': '/icons/Xenos/Aeldari/Alaitoc [Aeldari, Eldar, Asuryani, Craftworlds].svg',
  'iyanden': '/icons/Xenos/Aeldari/Iyanden [Aeldari, Eldar, Asuryani, Craftworlds].svg',
  // Corsairs no tiene icono -> usa Aeldari genérico
  'corsairs': '/icons/Xenos/Aeldari/Aeldari [Eldar, Eye of Asuryan, Gods].svg',

  // ========== TYRANIDS ==========
  'tyranids': '/icons/Xenos/Tyranid/Tyranids [Hive Mind, Hive Fleets].svg',
  'genestealer-cults': '/icons/Xenos/Genestealer Cult/Genestealer Cults [Hive Mind, Tyranids, Genestealers].svg',
  // Hive Fleets no tienen iconos propios (son orgánicos sin heráldica) -> usan Tyranids
  'leviathan': '/icons/Xenos/Tyranid/Tyranids [Hive Mind, Hive Fleets].svg',
  'kraken': '/icons/Xenos/Tyranid/Tyranids [Hive Mind, Hive Fleets].svg',
  'behemoth': '/icons/Xenos/Tyranid/Tyranids [Hive Mind, Hive Fleets].svg',
  'jormungandr': '/icons/Xenos/Tyranid/Tyranids [Hive Mind, Hive Fleets].svg',
  'hydra': '/icons/Xenos/Tyranid/Tyranids [Hive Mind, Hive Fleets].svg',
  'gorgon': '/icons/Xenos/Tyranid/Tyranids [Hive Mind, Hive Fleets].svg',

  // ========== ORKS ==========
  'orks': '/icons/Xenos/Orks/Orks [Orkoids].svg',
  // Clanes con icono propio
  'goffs': '/icons/Xenos/Orks/Goffs [Orkoids, Orks, Clan].svg',
  'evil-sunz': '/icons/Xenos/Orks/Evil Sunz [Orkoids, Orks, Clan].svg',
  'bad-moons': '/icons/Xenos/Orks/Bad Moons [Orkoids, Orks, Clan].svg',
  'deathskulls': '/icons/Xenos/Orks/Deathskulls [Orkoids, Orks, Clan].svg',
  'blood-axes': '/icons/Xenos/Orks/Blood Axes [Orkoids, Orks, Clan] - Copy.svg',
  'snakebites': '/icons/Xenos/Orks/Snakebites [Orkoids, Orks, Clan].svg',
  // Freebooterz no tiene icono -> usa Orks genérico
  'freebooterz': '/icons/Xenos/Orks/Orks [Orkoids].svg',

  // ========== NECRONS ==========
  'necrons': '/icons/Xenos/Necrons/Necrons [Yngir, Necrontyr].svg',
  // Dinastías con icono propio
  'sautekh': '/icons/Xenos/Necrons/Sautekh [Yngir, Necrontyr, Necrons, Dynasty].svg',
  'nihilakh': '/icons/Xenos/Necrons/Nihilakh [Yngir, Necrontyr, Necrons, Dynasty].svg',
  'mephrit': '/icons/Xenos/Necrons/Mephrit [Yngir, Necrontyr, Necrons, Dynasty].svg',
  'novokh': '/icons/Xenos/Necrons/Novokh [Yngir, Necrontyr, Necrons, Dynasty].svg',
  'nephrekh': '/icons/Xenos/Necrons/Nephrekh [Yngir, Necrontyr, Necrons, Dynasty].svg',
  'szarekhan': '/icons/Xenos/Necrons/Szarekhan [Yngir, Necrontyr, Necrons, Dynasty].svg',

  // ========== T'AU ==========
  'tau-empire': '/icons/Xenos/Tau/tau.svg',
  // Septs con icono propio
  'tau-sept': '/icons/Xenos/Tau/T_au [T_au_va, Greater Good, T_au Empire, Sept].svg',
  'viorla-sept': '/icons/Xenos/Tau/Viorla [T_au_va, Greater Good, T_au Empire, Sept].svg',
  'sacea-sept': '/icons/Xenos/Tau/Sacea [T_au_va, Greater Good, T_au Empire, Sept].svg',
  'farsight-enclaves': '/icons/Xenos/Tau/Farsight Enclaves [T_au_va, Greater Good, T_au, Renegades].svg',
  'borkan-sept': '/icons/Xenos/Tau/Borkan [T_au_va, Greater Good, T_au Empire, Sept].svg',
  'dalyth-sept': '/icons/Xenos/Tau/dalyth.svg',
}

export function FactionSelector({
  selectedFactions,
  onChange,
  maxSelections = 3,
}: FactionSelectorProps) {
  const [factions, setFactions] = useState<Faction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const supabase = createClient()

  useEffect(() => {
    fetchFactions()
  }, [])

  const fetchFactions = async () => {
    const { data, error } = await supabase
      .from('tags')
      .select('id, name, slug, primary_color, secondary_color')
      .eq('category', 'faction')
      .order('name')

    if (!error && data) {
      setFactions(data)
    }
    setIsLoading(false)
  }

  const filteredFactions = useMemo(() => {
    let filtered = factions

    if (activeCategory !== 'all') {
      filtered = filtered.filter((f) => SLUG_TO_CATEGORY[f.slug] === activeCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((f) =>
        f.name.toLowerCase().includes(query) ||
        f.slug.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [factions, activeCategory, searchQuery])

  const toggleFaction = (factionId: string) => {
    if (selectedFactions.includes(factionId)) {
      onChange(selectedFactions.filter((id) => id !== factionId))
    } else if (selectedFactions.length < maxSelections) {
      onChange([...selectedFactions, factionId])
    }
  }

  const selectedFactionDetails = useMemo(() => {
    return selectedFactions
      .map((id) => factions.find((f) => f.id === id))
      .filter(Boolean) as Faction[]
  }, [selectedFactions, factions])

  if (isLoading) {
    return (
      <div className="h-[320px] flex items-center justify-center">
        <motion.div
          className="w-6 h-6 border-2 border-bone/20 border-t-imperial-gold rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Selected factions with colors */}
      <motion.div
        layout
        className="flex flex-wrap gap-2 min-h-[40px]"
      >
        <AnimatePresence mode="popLayout">
          {selectedFactionDetails.map((faction, index) => (
            <motion.button
              key={faction.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => toggleFaction(faction.id)}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border"
              style={{
                background: `linear-gradient(135deg, ${faction.primary_color}30, ${faction.secondary_color}20)`,
                borderColor: `${faction.primary_color}60`,
              }}
            >
              {/* Faction icon or color swatch */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden"
                style={{ background: faction.primary_color || '#666' }}
              >
                {FACTION_ICONS[faction.slug] ? (
                  <Image
                    src={FACTION_ICONS[faction.slug]}
                    alt={faction.name}
                    width={16}
                    height={16}
                    className="invert"
                  />
                ) : (
                  <span className="text-[10px] font-bold text-white">
                    {index + 1}
                  </span>
                )}
              </div>
              <span className="text-xs font-body text-bone">{faction.name}</span>
              <X className="w-3 h-3 text-bone/50 hover:text-bone" />
            </motion.button>
          ))}
        </AnimatePresence>

        {selectedFactions.length === 0 && (
          <span className="text-xs text-bone/40 font-body self-center">
            Selecciona hasta {maxSelections} facciones
          </span>
        )}
      </motion.div>

      {/* Preview gradient */}
      <motion.div
        layout
        animate={{
          height: selectedFactions.length > 0 ? 40 : 0,
          opacity: selectedFactions.length > 0 ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="rounded-xl overflow-hidden relative"
        style={{
          background: generateGradient(selectedFactionDetails),
        }}
      >
        {selectedFactions.length > 0 && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </motion.div>

      {/* Category tabs - horizontal scroll */}
      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-imperial-gold text-void'
                : 'bg-void border border-bone/10 text-bone/60 hover:border-bone/30 hover:text-bone'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {cat.icon && (
              <div className="w-4 h-4 relative">
                <Image
                  src={cat.icon}
                  alt={cat.label}
                  fill
                  className={activeCategory === cat.id ? '' : 'opacity-60 invert'}
                />
              </div>
            )}
            {cat.label}
          </motion.button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bone/40" />
        <input
          type="text"
          placeholder="Buscar facción..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-void border border-bone/10 rounded-lg font-body text-sm text-bone placeholder:text-bone/30 focus:outline-none focus:border-imperial-gold/50"
        />
      </div>

      {/* Faction grid */}
      <div className="h-[180px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-bone/20">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {filteredFactions.map((faction) => {
            const isSelected = selectedFactions.includes(faction.id)
            const canSelect = selectedFactions.length < maxSelections || isSelected
            const iconPath = FACTION_ICONS[faction.slug]

            return (
              <motion.button
                key={faction.id}
                onClick={() => canSelect && toggleFaction(faction.id)}
                disabled={!canSelect}
                className={`relative p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-imperial-gold'
                    : canSelect
                    ? 'border-bone/10 hover:border-bone/30'
                    : 'border-bone/5 opacity-40 cursor-not-allowed'
                }`}
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg, ${faction.primary_color}20, ${faction.secondary_color}10)`
                    : 'rgba(26,26,46,0.5)',
                }}
                whileHover={canSelect ? { scale: 1.02 } : {}}
                whileTap={canSelect ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center gap-2">
                  {/* Icon or color swatch */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${faction.primary_color || '#666'}, ${faction.secondary_color || '#333'})`,
                    }}
                  >
                    {iconPath ? (
                      <Image
                        src={iconPath}
                        alt={faction.name}
                        width={20}
                        height={20}
                        className="invert"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-white/30" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-body font-medium truncate ${
                      isSelected ? 'text-imperial-gold' : 'text-bone/80'
                    }`}>
                      {faction.name}
                    </p>
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-imperial-gold flex items-center justify-center text-void text-[10px] font-bold shrink-0"
                    >
                      {selectedFactions.indexOf(faction.id) + 1}
                    </motion.div>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>

        {filteredFactions.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center py-8">
            <p className="text-bone/50 font-body text-sm">No se encontraron facciones</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setActiveCategory('all')
              }}
              className="text-imperial-gold text-xs mt-2 hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Generate gradient from selected factions
function generateGradient(factions: Faction[]): string {
  if (factions.length === 0) {
    return 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
  }

  if (factions.length === 1) {
    return `linear-gradient(135deg, ${factions[0].primary_color}90 0%, rgba(26,26,46,1) 50%, ${factions[0].secondary_color}60 100%)`
  }

  if (factions.length === 2) {
    return `linear-gradient(135deg, ${factions[0].primary_color}90 0%, rgba(26,26,46,1) 40%, ${factions[1].primary_color}60 100%)`
  }

  return `linear-gradient(135deg, ${factions[0].primary_color}90 0%, ${factions[1].primary_color}50 50%, ${factions[2].primary_color}60 100%)`
}

export { generateGradient }
export type { Faction }
