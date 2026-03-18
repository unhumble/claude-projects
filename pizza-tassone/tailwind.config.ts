import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red:          '#E8001D',
          'red-dark':   '#B8001A',
          'red-light':  '#FF1A35',
          orange:       '#FF6B35',
          'orange-light':'#FF8A5B',
        },
        bg: {
          primary:   '#0D0D0D',
          secondary: '#1A1A1A',
          tertiary:  '#252525',
          card:      '#1E1E1E',
          warm:      '#1A0A00',
        },
        text: {
          warm:  '#F5F0E8',
          muted: '#A89880',
          faint: '#6B5E52',
        },
        border: {
          DEFAULT: '#2E2E2E',
          warm:    '#3D2A1A',
          bright:  '#444444',
        },
      },
      fontFamily: {
        display: ['Georgia', 'Times New Roman', 'serif'],
        body:    ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        'bounce-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':       { transform: 'scale(1.25)' },
        },
        'slide-in-right': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(232, 0, 29, 0.4)' },
          '50%':       { boxShadow: '0 0 0 12px rgba(232, 0, 29, 0)' },
        },
      },
      animation: {
        'bounce-scale':   'bounce-scale 0.4s ease-in-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-up':       'slide-up 0.4s ease-out',
        'fade-in':        'fade-in 0.3s ease-out',
        'pulse-glow':     'pulse-glow 2s ease-in-out infinite',
      },
      boxShadow: {
        card:        '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover':'0 8px 32px rgba(0, 0, 0, 0.6)',
        'glow-red':  '0 0 20px rgba(232, 0, 29, 0.3)',
        'inner-top': 'inset 0 2px 4px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
