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
        ink: {
          DEFAULT: '#09090b',
          muted: '#71717a',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#09090b',
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
