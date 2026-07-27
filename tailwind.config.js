/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        /**
         * Brand as a FILL (bg-brand / border-brand) — theme-invariant.
         * Safe on both themes because brand fills carry `text-ink` (10.95:1).
         * Brand as a FOREGROUND is theme-aware — see `textColor.brand` below.
         */
        brand: {
          DEFAULT: '#00DC82',
          action: '#00C16A',
          deep: '#00A155',
        },
        recovery: '#38bdf8',
        modify: '#f59e0b',
        danger: '#ef4444',
        success: '#22c55e',
        /** Nutrition macros — keep in sync with Colors.macro* / NutritionAccents */
        macro: {
          calories: '#fb923c',
          carbs: '#fbbf24',
          protein: '#60a5fa',
          fat: '#a78bfa',
        },
        hydration: '#38bdf8',
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
      /**
       * Accents resolve per theme as TEXT; as fills (`bg-*` / `border-*`) they
       * stay the vivid invariant value. Tailwind's `textColor` scale only feeds
       * text utilities, so the two diverge without touching a single call site.
       *
       * The accent palette was designed against dark surfaces: on light #fafafa
       * every accent lands between 1.6:1 and 3.8:1 as text, under the 4.5:1 AA
       * floor. Light mode therefore uses the same hue one step darker.
       * Values + ratios live in global.css; docs/DESIGN.md explains the rule.
       */
      textColor: {
        brand: {
          DEFAULT: 'rgb(var(--color-brand-on-surface) / <alpha-value>)',
          action: '#00C16A',
          deep: '#00A155',
        },
        modify: 'rgb(var(--color-modify-on-surface) / <alpha-value>)',
        recovery: 'rgb(var(--color-recovery-on-surface) / <alpha-value>)',
        hydration: 'rgb(var(--color-hydration-on-surface) / <alpha-value>)',
        danger: 'rgb(var(--color-danger-on-surface) / <alpha-value>)',
        success: 'rgb(var(--color-success-on-surface) / <alpha-value>)',
        macro: {
          calories: 'rgb(var(--color-macro-calories-on-surface) / <alpha-value>)',
          carbs: 'rgb(var(--color-macro-carbs-on-surface) / <alpha-value>)',
          protein: 'rgb(var(--color-macro-protein-on-surface) / <alpha-value>)',
          fat: 'rgb(var(--color-macro-fat-on-surface) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
};
