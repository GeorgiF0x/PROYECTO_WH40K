import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: '#030308',
          light: '#0a0a12',
          dark: '#000003',
        },
        blood: {
          DEFAULT: '#8B0000',
          light: '#DC143C',
          dark: '#5C0000',
        },
        imperial: {
          gold: '#C9A227',
          bronze: '#8B7355',
          copper: '#B87333',
        },
        bone: {
          DEFAULT: '#E8E8F0',
          dark: '#C4C4D0',
        },
        warp: {
          DEFAULT: '#6B1C5F',
          light: '#8B2A7B',
        },
        necron: {
          DEFAULT: '#00FF87',
          dark: '#00D4AA',
        },
        steel: '#2A2A35',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Orbitron', 'sans-serif'],
        body: ['var(--font-body)', 'Rajdhani', 'sans-serif'],
        accent: ['var(--font-accent)', 'Exo 2', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'scan': 'scan 8s linear infinite',
        'gradient': 'gradient 8s ease infinite',
        'fadeIn': 'fadeIn 0.5s ease-out forwards',
        'spin-slow': 'spin 20s linear infinite',
        'holo-flicker': 'holoFlicker 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        holoFlicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.97' },
          '76%': { opacity: '0.95' },
          '77%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}

export default config
