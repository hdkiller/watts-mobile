# Dual Theme Tokens — Proposal

## Why

The app is hardcoded dark-only (`userInterfaceStyle: "dark"`, raw `zinc-*`/hex classes in every component), but the product is a field companion used outdoors where a light theme is objectively more readable in direct sunlight. Retro-fitting a second theme later gets more expensive with every screen shipped; the decision (July 2026 UX review) is to build light alongside dark from now on, via semantic tokens, per the updated [docs/DESIGN.md](../../../docs/DESIGN.md).

## What Changes

- Introduce **semantic neutral tokens** (surface, card, border, border-strong, text-primary, text-body, text-muted, plus error/success tint pairs) with dark and light values; brand/state accents (brand, recovery, modify, danger, zone ramp) stay theme-invariant.
- Wire theme resolution to the **OS appearance**: `userInterfaceStyle` → `"automatic"`, NativeWind dark-variant (or CSS variables) drives class resolution, `src/theme/colors.ts` gains a theme-aware accessor for JS-side color access (charts, maps, native props).
- **Migrate all screens and components** off raw neutral classes (`bg-zinc-900`, `text-white`, `#09090b`, …) to semantic tokens. Dark remains the reference theme; light is derived, never styled ad hoc.
- Update chrome that lives outside components: splash/background colors, navigation/tab-bar theming, skeletons, `OfflineBanner`, status-bar style, widget snapshot colors.
- Contrast rule holds in both themes (dark ink on brand green; AA for muted text on light surfaces).
- Settings → Appearance offers System / Light / Dark (default System); preference is stored on-device and applied via `Appearance.setColorScheme`.

## Capabilities

### New Capabilities
- `theme-tokens`: semantic color token system with dark/light values, exposed via Tailwind classes and a JS accessor, following OS appearance.

### Modified Capabilities
<!-- none — existing specs describe behavior, not palette; no requirement-level changes to prior capabilities -->

## Impact

- **Broad but mechanical UI touch**: every file under `app/` and `src/components`/`src/features/**/*.tsx` that uses neutral classes (~60 files); `tailwind.config.js`, `global.css`, `src/theme/colors.ts`, `app.json` (`userInterfaceStyle`, splash), `widgets/TodaySessionWidget`.
- **No coach-wattz backend dependency** — purely client-side. Brand values continue to originate from coach-wattz `BRANDING.md`.
- **Testing surface**: screenshot-diff baselines double (dark + light per key screen); DESIGN.md token table is the acceptance reference.
- Respects v1 non-goals: no settings UI added beyond OS-follow behavior.
