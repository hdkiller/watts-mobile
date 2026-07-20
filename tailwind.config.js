/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#00DC82',
          action: '#00C16A',
          deep: '#00A155',
        },
        recovery: '#38bdf8',
        modify: '#f59e0b',
        danger: '#ef4444',
        success: '#22c55e',
        /** Dark ink for text on brand green — theme-invariant */
        ink: {
          DEFAULT: '#09090b',
          muted: '#71717a', // legacy alias; prefer text-muted token
        },
        /** Semantic neutrals — CSS variables resolve per OS appearance */
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        border: {
          DEFAULT: 'rgb(var(--color-border) / <alpha-value>)',
          strong: 'rgb(var(--color-border-strong) / <alpha-value>)',
        },
        text: {
          primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
          body: 'rgb(var(--color-text-body) / <alpha-value>)',
          muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
        },
        tint: {
          error: 'rgb(var(--color-tint-error) / <alpha-value>)',
          success: 'rgb(var(--color-tint-success) / <alpha-value>)',
        },
        // Z1→Z7 — keep in sync with Colors.zones in src/theme/colors.ts
        zone: {
          1: '#3b82f6',
          2: '#14b8a6',
          3: '#eab308',
          4: '#f97316',
          5: '#ef4444',
          6: '#a855f7',
          7: '#52525b',
          neutral: '#52525b',
        },
      },
    },
  },
  plugins: [],
};
