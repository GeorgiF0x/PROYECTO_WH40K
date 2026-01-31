// =============================================================================
// SUB-FACTION ICONS CONFIGURATION
// =============================================================================
// Maps each main faction to their sub-faction icons for particle effects

export interface SubFactionIcon {
  name: string
  icon: string
  featured?: boolean // For larger/more prominent display
}

export const subFactionIcons: Record<string, SubFactionIcon[]> = {
  imperium: [
    { name: 'Adepta Sororitas', icon: '/icons/Imperium/Adepta Sororitas [Imperium, Adeptus Ministorum, Ecclesiarchy, Inquisition, Ordo Hereticus, Sisters of Battle, Battle Sisters].svg', featured: true },
    { name: 'Adeptus Custodes', icon: '/icons/Imperium/Adeptus Custodes [Imperium, Talons of the Emperor].svg', featured: true },
    { name: 'Adeptus Mechanicus', icon: '/icons/Imperium/Adeptus Mechanicus [Imperium].svg', featured: true },
    { name: 'Inquisition', icon: '/icons/Imperium/Inquisition 1 [Imperium].svg', featured: true },
    { name: 'Astra Militarum', icon: '/icons/Imperium/Astra Militarum [Imperium, Imperial Guard].svg' },
    { name: 'Ultramarines', icon: '/icons/Imperium/Ultramarines [Imperium, Adeptus Astartes, Space Marines, Legion].svg' },
    { name: 'Blood Angels', icon: '/icons/Imperium/Blood Angels [Imperium, Adeptus Astartes, Space Marines, Legion].svg' },
    { name: 'Dark Angels', icon: '/icons/Imperium/Dark Angels [Imperium, Adeptus Astartes, Space Marines, Legion].svg' },
    { name: 'Space Wolves', icon: '/icons/Imperium/Space Wolves [Imperium, Adeptus Astartes, Space Marines, Legion].svg' },
    { name: 'Imperial Fists', icon: '/icons/Imperium/Imperial Fists [Imperium, Adeptus Astartes, Space Marines, Legion].svg' },
    { name: 'Grey Knights', icon: '/icons/Imperium/Grey Knights [Imperium, Inquisition, Ordo Malleus, Adeptus Astartes, Space Marines, Chapter].svg' },
    { name: 'Black Templars', icon: '/icons/Imperium/Black Templars [Imperium, Adeptus Astartes, Space Marines, Imperial Fists, Chapter].svg' },
  ],

  chaos: [
    { name: 'Khorne', icon: '/icons/Chaos/Khorne [Chaos, Chaos Daemons, Gods].svg', featured: true },
    { name: 'Nurgle', icon: '/icons/Chaos/Nurgle [Chaos, Chaos Daemons, Gods].svg', featured: true },
    { name: 'Slaanesh', icon: '/icons/Chaos/Slaanesh [Chaos, Chaos Daemons, Gods].svg', featured: true },
    { name: 'Tzeentch', icon: '/icons/Chaos/Tzeentch [Chaos, Chaos Daemons, Gods].svg', featured: true },
    { name: 'Black Legion', icon: '/icons/Chaos/Black Legion [Chaos, Heretic Astartes, Chaos Space Marines, Legion].svg' },
    { name: 'Death Guard', icon: '/icons/Chaos/Death Guard [Chaos, Heretic Astartes, Chaos Space Marines, Legion, Nurgle].svg' },
    { name: "Emperor's Children", icon: '/icons/Chaos/Emperor_s Children [Chaos, Heretic Astartes, Chaos Space Marines, Legion, Slaanesh].svg' },
    { name: 'Thousand Sons', icon: '/icons/Chaos/Thousand Sons [Chaos, Heretic Astartes, Chaos Space Marines, Legion, Tzeentch].svg' },
    { name: 'World Eaters', icon: '/icons/Chaos/World Eaters [Chaos, Heretic Astartes, Chaos Space Marines, Legion, Khorne].svg' },
    { name: 'Iron Warriors', icon: '/icons/Chaos/Iron Warriors [Chaos, Heretic Astartes, Chaos Space Marines, Legion].svg' },
    { name: 'Night Lords', icon: '/icons/Chaos/Night Lords [Chaos, Heretic Astartes, Chaos Space Marines, Legion].svg' },
    { name: 'Word Bearers', icon: '/icons/Chaos/Word Bearers [Chaos, Heretic Astartes, Chaos Space Marines, Legion].svg' },
  ],

  necrons: [
    { name: 'Sautekh', icon: '/icons/Xenos/Necrons/Sautekh [Yngir, Necrontyr, Necrons, Dynasty].svg', featured: true },
    { name: 'Mephrit', icon: '/icons/Xenos/Necrons/Mephrit [Yngir, Necrontyr, Necrons, Dynasty].svg', featured: true },
    { name: 'Nephrekh', icon: '/icons/Xenos/Necrons/Nephrekh [Yngir, Necrontyr, Necrons, Dynasty].svg' },
    { name: 'Nihilakh', icon: '/icons/Xenos/Necrons/Nihilakh [Yngir, Necrontyr, Necrons, Dynasty].svg' },
    { name: 'Novokh', icon: '/icons/Xenos/Necrons/Novokh [Yngir, Necrontyr, Necrons, Dynasty].svg' },
    { name: 'Szarekhan', icon: '/icons/Xenos/Necrons/Szarekhan [Yngir, Necrontyr, Necrons, Dynasty].svg', featured: true },
    { name: "C'tan", icon: '/icons/Xenos/Necrons/C_tan [Yngir, Star Gods].svg', featured: true },
  ],

  aeldari: [
    { name: 'Ulthwé', icon: '/icons/Xenos/Aeldari/Ulthwe [Aeldari, Eldar, Asuryani, Craftworlds].svg', featured: true },
    { name: 'Biel-Tan', icon: '/icons/Xenos/Aeldari/Biel-Tan [Aeldari, Eldar, Asuryani, Craftworlds].svg', featured: true },
    { name: 'Saim-Hann', icon: '/icons/Xenos/Aeldari/Saim-Hann [Aeldari, Eldar, Asuryani, Craftworlds].svg' },
    { name: 'Iyanden', icon: '/icons/Xenos/Aeldari/Iyanden [Aeldari, Eldar, Asuryani, Craftworlds].svg' },
    { name: 'Alaitoc', icon: '/icons/Xenos/Aeldari/Alaitoc [Aeldari, Eldar, Asuryani, Craftworlds].svg' },
    { name: 'Harlequins', icon: '/icons/Xenos/Aeldari/Harlequins [Aeldari, Eldar, Rillietann].svg', featured: true },
    { name: 'Drukhari', icon: '/icons/Xenos/Aeldari/Drukhari 1 [Aeldari, Dark Eldar].svg', featured: true },
    { name: 'Ynnari', icon: '/icons/Xenos/Aeldari/Ynnari [Aeldari, Eldar].svg' },
    { name: 'Avatar of Khaine', icon: '/icons/Xenos/Aeldari/Avatar of Khaine [Aeldari, Eldar, Gods].svg' },
    { name: 'Dire Avengers', icon: '/icons/Xenos/Aeldari/Dire Avengers [Aeldari, Eldar, Asuryani, Craftworlds, Aspect Warriors].svg' },
  ],

  orks: [
    { name: 'Goffs', icon: '/icons/Xenos/Orks/Goffs [Orkoids, Orks, Clan].svg', featured: true },
    { name: 'Evil Sunz', icon: '/icons/Xenos/Orks/Evil Sunz [Orkoids, Orks, Clan].svg', featured: true },
    { name: 'Bad Moons', icon: '/icons/Xenos/Orks/Bad Moons [Orkoids, Orks, Clan].svg' },
    { name: 'Deathskulls', icon: '/icons/Xenos/Orks/Deathskulls [Orkoids, Orks, Clan].svg' },
    { name: 'Snakebites', icon: '/icons/Xenos/Orks/Snakebites [Orkoids, Orks, Clan].svg' },
    { name: 'Gorkamorka', icon: '/icons/Xenos/Orks/Gorkamorka [Orkoids, Orks, Gork, Mork, Gods].svg', featured: true },
    { name: 'Gretchin', icon: '/icons/Xenos/Orks/Gretchin [Orkoids, Grotz].svg' },
    { name: 'Squigs', icon: '/icons/Xenos/Orks/Squigs [Orkoids].svg' },
  ],

  tau: [
    { name: "T'au Sept", icon: "/icons/Xenos/Tau/T_au [T_au_va, Greater Good, T_au Empire, Sept].svg", featured: true },
    { name: 'Farsight Enclaves', icon: "/icons/Xenos/Tau/Farsight Enclaves [T_au_va, Greater Good, T_au, Renegades].svg", featured: true },
    { name: "Vior'la", icon: "/icons/Xenos/Tau/Viorla [T_au_va, Greater Good, T_au Empire, Sept].svg" },
    { name: "Sa'cea", icon: "/icons/Xenos/Tau/Sacea [T_au_va, Greater Good, T_au Empire, Sept].svg" },
    { name: "Bork'an", icon: "/icons/Xenos/Tau/Borkan [T_au_va, Greater Good, T_au Empire, Sept].svg" },
    { name: 'Fire Caste', icon: "/icons/Xenos/Tau/Fire Caste [T_au_va, Greater Good, T_au Empire, Caste].svg", featured: true },
    { name: 'Earth Caste', icon: "/icons/Xenos/Tau/Earth Caste [T_au_va, Greater Good, T_au Empire, Caste].svg" },
    { name: 'Air Caste', icon: "/icons/Xenos/Tau/Air Caste [T_au_va, Greater Good, T_au Empire, Caste].svg" },
    { name: 'Kroot', icon: "/icons/Xenos/Tau/Kroot [T_au_va, Greater Good, T_au Empire, Auxillaries].svg" },
  ],

  tyranids: [
    // Only one Tyranid icon available - use it multiple times with the main symbol
    { name: 'Hive Mind', icon: '/icons/Xenos/Tyranid/Tyranids [Hive Mind, Hive Fleets].svg', featured: true },
    { name: 'Leviathan', icon: '/icons/Xenos/Tyranid/Tyranids [Hive Mind, Hive Fleets].svg', featured: true },
    { name: 'Kraken', icon: '/icons/Xenos/Tyranid/Tyranids [Hive Mind, Hive Fleets].svg' },
    { name: 'Behemoth', icon: '/icons/Xenos/Tyranid/Tyranids [Hive Mind, Hive Fleets].svg' },
  ],
}

// Get sub-faction icons for a faction, with fallback
export function getSubFactionIcons(factionId: string): SubFactionIcon[] {
  return subFactionIcons[factionId] || []
}

// Get only featured sub-factions
export function getFeaturedSubFactions(factionId: string): SubFactionIcon[] {
  return getSubFactionIcons(factionId).filter(sf => sf.featured)
}
