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
        ink: {
          DEFAULT: '#09090b',
          muted: '#71717a',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#09090b',
        },
      },
    },
  },
  plugins: [],
};
