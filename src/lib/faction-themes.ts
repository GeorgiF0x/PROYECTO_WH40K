// Faction Theme System - Visual identities for each faction

export interface FactionTheme {
  id: string
  name: string
  shortName: string

  // Colors
  colors: {
    primary: string      // Main accent color
    secondary: string    // Secondary accent
    tertiary: string     // Third accent (for gradients)
    background: string   // Dark background tint
    glow: string         // Glow/bloom color
    text: string         // Text on dark backgrounds
  }

  // Visual Effects
  effects: {
    particleType: 'sparks' | 'energy' | 'warp' | 'organic' | 'runes' | 'hologram' | 'flames'
    backgroundPattern: 'grid' | 'circuitry' | 'organic' | 'runes' | 'cogs' | 'hexagons' | 'none'
    glowIntensity: number  // 0-1
    animationStyle: 'aggressive' | 'elegant' | 'mechanical' | 'chaotic' | 'organic' | 'technological'
  }

  // CSS Variables
  cssVars: {
    '--faction-primary': string
    '--faction-secondary': string
    '--faction-tertiary': string
    '--faction-glow': string
    '--faction-bg': string
  }

  // Gradient definitions
  gradients: {
    hero: string
    card: string
    text: string
    border: string
  }

  // Icon/Symbol
  symbol: 'aquila' | 'star-of-chaos' | 'scarab' | 'rune' | 'glyph' | 'tau-symbol' | 'bio-sigil'
}

export const factionThemes: Record<string, FactionTheme> = {
  imperium: {
    id: 'imperium',
    name: 'Imperium of Man',
    shortName: 'Imperium',
    colors: {
      primary: '#C9A227',      // Imperial Gold
      secondary: '#8B0000',    // Blood Red
      tertiary: '#D4AF37',     // Bright Gold
      background: '#0D0A05',   // Dark warm void
      glow: '#FFD700',         // Pure Gold glow
      text: '#F5E6C8',         // Parchment
    },
    effects: {
      particleType: 'sparks',
      backgroundPattern: 'cogs',
      glowIntensity: 0.7,
      animationStyle: 'aggressive',
    },
    cssVars: {
      '--faction-primary': '#C9A227',
      '--faction-secondary': '#8B0000',
      '--faction-tertiary': '#D4AF37',
      '--faction-glow': '#FFD700',
      '--faction-bg': '#0D0A05',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #C9A227 0%, #8B0000 50%, #D4AF37 100%)',
      card: 'linear-gradient(180deg, rgba(201,162,39,0.1) 0%, rgba(139,0,0,0.05) 100%)',
      text: 'linear-gradient(90deg, #C9A227 0%, #FFD700 50%, #C9A227 100%)',
      border: 'linear-gradient(90deg, #C9A227, #8B0000, #C9A227)',
    },
    symbol: 'aquila',
  },

  chaos: {
    id: 'chaos',
    name: 'Chaos Space Marines',
    shortName: 'Chaos',
    colors: {
      primary: '#DC143C',      // Crimson
      secondary: '#6B1C5F',    // Warp Purple
      tertiary: '#FF4500',     // Daemon Orange
      background: '#0A0508',   // Dark blood void
      glow: '#FF0040',         // Neon red glow
      text: '#FFE4E1',         // Pale flesh
    },
    effects: {
      particleType: 'flames',
      backgroundPattern: 'runes',
      glowIntensity: 0.9,
      animationStyle: 'chaotic',
    },
    cssVars: {
      '--faction-primary': '#DC143C',
      '--faction-secondary': '#6B1C5F',
      '--faction-tertiary': '#FF4500',
      '--faction-glow': '#FF0040',
      '--faction-bg': '#0A0508',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #DC143C 0%, #6B1C5F 50%, #FF4500 100%)',
      card: 'linear-gradient(180deg, rgba(220,20,60,0.15) 0%, rgba(107,28,95,0.1) 100%)',
      text: 'linear-gradient(90deg, #DC143C 0%, #FF4500 50%, #DC143C 100%)',
      border: 'linear-gradient(90deg, #DC143C, #6B1C5F, #DC143C)',
    },
    symbol: 'star-of-chaos',
  },

  necrons: {
    id: 'necrons',
    name: 'Necrons',
    shortName: 'Necrons',
    colors: {
      primary: '#00FF87',      // Gauss Green
      secondary: '#0D9B8A',    // Teal
      tertiary: '#00FFFF',     // Cyan
      background: '#020A08',   // Dark void green
      glow: '#00FF87',         // Gauss glow
      text: '#E0FFF4',         // Pale green-white
    },
    effects: {
      particleType: 'energy',
      backgroundPattern: 'circuitry',
      glowIntensity: 0.85,
      animationStyle: 'mechanical',
    },
    cssVars: {
      '--faction-primary': '#00FF87',
      '--faction-secondary': '#0D9B8A',
      '--faction-tertiary': '#00FFFF',
      '--faction-glow': '#00FF87',
      '--faction-bg': '#020A08',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #00FF87 0%, #0D9B8A 50%, #00FFFF 100%)',
      card: 'linear-gradient(180deg, rgba(0,255,135,0.1) 0%, rgba(13,155,138,0.05) 100%)',
      text: 'linear-gradient(90deg, #00FF87 0%, #00FFFF 50%, #00FF87 100%)',
      border: 'linear-gradient(90deg, #00FF87, #0D9B8A, #00FF87)',
    },
    symbol: 'scarab',
  },

  aeldari: {
    id: 'aeldari',
    name: 'Aeldari',
    shortName: 'Aeldari',
    colors: {
      primary: '#4169E1',      // Royal Blue
      secondary: '#E6E6FA',    // Lavender White
      tertiary: '#9370DB',     // Medium Purple
      background: '#050510',   // Deep space blue
      glow: '#87CEEB',         // Sky blue glow
      text: '#F0F8FF',         // Alice blue
    },
    effects: {
      particleType: 'runes',
      backgroundPattern: 'hexagons',
      glowIntensity: 0.6,
      animationStyle: 'elegant',
    },
    cssVars: {
      '--faction-primary': '#4169E1',
      '--faction-secondary': '#E6E6FA',
      '--faction-tertiary': '#9370DB',
      '--faction-glow': '#87CEEB',
      '--faction-bg': '#050510',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #4169E1 0%, #9370DB 50%, #E6E6FA 100%)',
      card: 'linear-gradient(180deg, rgba(65,105,225,0.1) 0%, rgba(147,112,219,0.05) 100%)',
      text: 'linear-gradient(90deg, #4169E1 0%, #E6E6FA 50%, #4169E1 100%)',
      border: 'linear-gradient(90deg, #4169E1, #9370DB, #4169E1)',
    },
    symbol: 'rune',
  },

  orks: {
    id: 'orks',
    name: 'Orks',
    shortName: 'Orks',
    colors: {
      primary: '#228B22',      // Forest Green
      secondary: '#FF8C00',    // Dark Orange
      tertiary: '#FFD700',     // Gold (teef!)
      background: '#080A05',   // Murky green-brown
      glow: '#32CD32',         // Lime green glow
      text: '#FFFACD',         // Lemon chiffon
    },
    effects: {
      particleType: 'sparks',
      backgroundPattern: 'none',
      glowIntensity: 0.75,
      animationStyle: 'aggressive',
    },
    cssVars: {
      '--faction-primary': '#228B22',
      '--faction-secondary': '#FF8C00',
      '--faction-tertiary': '#FFD700',
      '--faction-glow': '#32CD32',
      '--faction-bg': '#080A05',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #228B22 0%, #FF8C00 50%, #FFD700 100%)',
      card: 'linear-gradient(180deg, rgba(34,139,34,0.15) 0%, rgba(255,140,0,0.1) 100%)',
      text: 'linear-gradient(90deg, #228B22 0%, #FFD700 50%, #228B22 100%)',
      border: 'linear-gradient(90deg, #228B22, #FF8C00, #228B22)',
    },
    symbol: 'glyph',
  },

  tau: {
    id: 'tau',
    name: "T'au Empire",
    shortName: "T'au",
    colors: {
      primary: '#00CED1',      // Dark Turquoise
      secondary: '#F5F5F5',    // White Smoke
      tertiary: '#FF6347',     // Tomato (for accents)
      background: '#030810',   // Deep blue void
      glow: '#00FFFF',         // Cyan glow
      text: '#E0FFFF',         // Light cyan
    },
    effects: {
      particleType: 'hologram',
      backgroundPattern: 'grid',
      glowIntensity: 0.65,
      animationStyle: 'technological',
    },
    cssVars: {
      '--faction-primary': '#00CED1',
      '--faction-secondary': '#F5F5F5',
      '--faction-tertiary': '#FF6347',
      '--faction-glow': '#00FFFF',
      '--faction-bg': '#030810',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #00CED1 0%, #F5F5F5 50%, #FF6347 100%)',
      card: 'linear-gradient(180deg, rgba(0,206,209,0.1) 0%, rgba(245,245,245,0.05) 100%)',
      text: 'linear-gradient(90deg, #00CED1 0%, #F5F5F5 50%, #00CED1 100%)',
      border: 'linear-gradient(90deg, #00CED1, #F5F5F5, #00CED1)',
    },
    symbol: 'tau-symbol',
  },

  tyranids: {
    id: 'tyranids',
    name: 'Tyranids',
    shortName: 'Tyranids',
    colors: {
      primary: '#8B008B',      // Dark Magenta
      secondary: '#FF1493',    // Deep Pink
      tertiary: '#4B0082',     // Indigo
      background: '#080308',   // Dark organic purple
      glow: '#FF00FF',         // Magenta glow
      text: '#FFE4FF',         // Pale pink
    },
    effects: {
      particleType: 'organic',
      backgroundPattern: 'organic',
      glowIntensity: 0.8,
      animationStyle: 'organic',
    },
    cssVars: {
      '--faction-primary': '#8B008B',
      '--faction-secondary': '#FF1493',
      '--faction-tertiary': '#4B0082',
      '--faction-glow': '#FF00FF',
      '--faction-bg': '#080308',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #8B008B 0%, #FF1493 50%, #4B0082 100%)',
      card: 'linear-gradient(180deg, rgba(139,0,139,0.15) 0%, rgba(255,20,147,0.1) 100%)',
      text: 'linear-gradient(90deg, #8B008B 0%, #FF1493 50%, #8B008B 100%)',
      border: 'linear-gradient(90deg, #8B008B, #FF1493, #8B008B)',
    },
    symbol: 'bio-sigil',
  },
}

export const getFactionTheme = (id: string): FactionTheme | undefined => {
  return factionThemes[id]
}

// CSS class generator for faction themes
export const getFactionClasses = (factionId: string) => {
  const theme = factionThemes[factionId]
  if (!theme) return {}

  return {
    primary: `text-[${theme.colors.primary}]`,
    primaryBg: `bg-[${theme.colors.primary}]`,
    glow: `shadow-[0_0_30px_${theme.colors.glow}40]`,
    border: `border-[${theme.colors.primary}]`,
  }
}
