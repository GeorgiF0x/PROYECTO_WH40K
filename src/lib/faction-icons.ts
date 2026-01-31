// Mapeo de iconos SVG para cada facción
// Los archivos están en /public/icons/

export interface FactionIconConfig {
  id: string
  name: string
  // Path relativo desde /public/icons/
  iconPath: string
  // Path alternativo (versión oscura si existe)
  iconPathDark?: string
}

export const factionIcons: Record<string, FactionIconConfig> = {
  imperium: {
    id: 'imperium',
    name: 'Imperium of Man',
    iconPath: '/icons/Imperium/Adeptus Astartes [Imperium, Space Marines].svg',
  },
  chaos: {
    id: 'chaos',
    name: 'Chaos Space Marines',
    iconPath: '/icons/Chaos/chaos-star-01.svg',
  },
  necrons: {
    id: 'necrons',
    name: 'Necrons',
    iconPath: '/icons/Xenos/Necrons/Necrons [Yngir, Necrontyr].svg',
    iconPathDark: '/icons/Xenos/Necrons/Necrons Dark [Yngir, Necrontyr].svg',
  },
  aeldari: {
    id: 'aeldari',
    name: 'Aeldari',
    iconPath: '/icons/Xenos/Aeldari/Aeldari [Eldar, Eye of Asuryan, Gods].svg',
  },
  orks: {
    id: 'orks',
    name: 'Orks',
    iconPath: '/icons/Xenos/Orks/Orks [Orkoids].svg',
  },
  tau: {
    id: 'tau',
    name: "T'au Empire",
    iconPath: '/icons/Xenos/Tau/tau.svg',
  },
  tyranids: {
    id: 'tyranids',
    name: 'Tyranids',
    iconPath: '/icons/Xenos/Tyranid/Tyranids [Hive Mind, Hive Fleets].svg',
  },
}

export const getFactionIcon = (factionId: string): FactionIconConfig | undefined => {
  return factionIcons[factionId]
}

// Iconos adicionales útiles para la UI
export const generalIcons = {
  // Roles de batalla
  troops: '/icons/General/Troops [Battlefield Role].svg',
  elites: '/icons/General/Elites [Battlefield Role].svg',
  heavySupport: '/icons/General/Heavy Support [Battlefield Role].svg',
  fastAttack: '/icons/General/Fast Attack [Battlefield Role].svg',
  hq: '/icons/General/HQ [Battlefield Role].svg',
  lordOfWar: '/icons/General/Lord of War [Battlefield Role].svg',
  dedicatedTransport: '/icons/General/Dedicated Transport [Battlefield Role].svg',

  // Stats
  movement: '/icons/General/Movement.svg',
  weaponSkill: '/icons/General/WeaponSkill.svg',
  ballisticSkill: '/icons/General/BallisticSkill.svg',
  strength: '/icons/General/Strength.svg',
  toughness: '/icons/General/Toughness.svg',
  wounds: '/icons/General/Wounds.svg',
  attacks: '/icons/General/Attacks.svg',
  leadership: '/icons/General/Leadership.svg',
  save: '/icons/General/Save.svg',
}
