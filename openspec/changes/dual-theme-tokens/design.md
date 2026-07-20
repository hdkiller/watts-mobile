# Dual Theme Tokens — Design

## Context

The app ships dark-only: `userInterfaceStyle: "dark"` in app.json, and ~60 screen/component files style neutrals with raw Tailwind palette classes (`bg-zinc-900`, `border-zinc-800`, `text-white`) or hex literals (`#09090b`, `#27272a`). Brand/state accents already flow through `src/theme/colors.ts` + `tailwind.config.js` tokens. [docs/DESIGN.md](../../../docs/DESIGN.md) now mandates dual themes via semantic tokens (its Tokens section carries the canonical dark/light value table). NativeWind v4 is the styling layer; some surfaces take JS color values instead of classes (charts, `ActivityMap`, `RefreshControl` tints, navigation/tab-bar options, skeleton shimmer, the iOS widget).

## Goals / Non-Goals

**Goals:**
- Semantic neutral tokens resolving per OS appearance, usable from both className and JS.
- Full migration of existing screens; guardrail so new code can't regress to raw neutrals.
- Both themes visually verified (screenshot-diff baselines per theme for key screens).

**Non-Goals:**
- Re-design of any screen — this is a recolor, layouts untouched.
- Widget/watch surfaces beyond passing correct colors to the existing Today widget snapshot.
- Web (`+html.tsx`) polish beyond not breaking.

## Decisions

1. **CSS variables + NativeWind, not `dark:` class doubling.** Define semantic tokens as CSS variables in `global.css` under `:root` (light) and a dark block, map them in `tailwind.config.js` (`surface`, `card`, `border`, `border-strong`, `text-primary`, `text-body`, `text-muted`, `tint-error`, `tint-success`). Components write `bg-card border-border` once and both themes work. *Alternative rejected:* sprinkling `dark:` variants per call site — doubles every className, and the existing code would need the light value written everywhere (the exact maintenance burden tokens avoid).
2. **JS access via `useThemeColors()` hook + static `Themes.dark/.light` maps** in `src/theme/colors.ts`, keyed by the same token names; `useColorScheme()` picks the active map. Non-React call sites (widget sync) receive the resolved palette as an argument. *Alternative rejected:* runtime-mutating the existing `Colors` object — breaks referential transparency and memoized styles.
3. **OS-follow via `userInterfaceStyle: "automatic"`** by default; Settings → Appearance can override with Light/Dark via `Appearance.setColorScheme` (System clears the override). Status bar `style="auto"`; navigation/tab theming (`NativeTabs` colors, Stack `contentStyle`/header colors) read from the active palette.
4. **Semantic opacity variants** (`card/80` etc.) come from Tailwind's `<alpha-value>` slot on the variable-backed colors, so existing `bg-zinc-900/80` translucency patterns translate 1:1.
5. **Guardrail:** an ESLint restriction (or CI grep script) flagging `zinc-\d` classes and the known hex literals in `app/` + `src/` outside `theme/`, enabled once migration completes.
6. **Migration order:** tokens + chrome first (proves the plumbing), then shared components (`Button`, `Skeleton`, `OfflineBanner`, `HeroStatTiles`, `AnimatedPressable`), then screens grouped by tab, charts/map last (JS colors).

## Risks / Trade-offs

- [Light palette reads flat/washed] → dark stays reference; light values reviewed on device against DESIGN.md contrast rule (AA for muted text) before screen migration starts.
- [Missed hardcoded color ships a dark artifact on light background] → guardrail lint + per-theme screenshot pass over the key screens; grep inventory checked into tasks.
- [Charts/zone ramp legibility differs on light] → zone ramp is theme-invariant by decision; verify Z3 yellow and `zone-neutral` gray against light surfaces, adjust only `zoneNeutral` if needed.
- [NativeWind CSS-variable theming edge cases on native] → spike task validates variables + alpha slots on iOS/Android dev clients before mass migration; fallback is `dark:` variants generated from the same token table (mechanical, uglier, same semantics).
- [`userInterfaceStyle` change requires native rebuild] → called out in tasks; Metro-only testing will not flip themes.

## Migration Plan

Land in one change but commit-phased (tokens → components → screens per tab → chrome/charts → lint guardrail) so any screen-level regression bisects cleanly. Rollback = revert `userInterfaceStyle` to `"dark"`; token classes resolve to dark values and the app is exactly as before.

## Open Questions

- Exact light hex for `card` shadow/elevation treatment (dark uses borders; light may want a soft shadow) — decide during the shared-components phase.
- Whether `text-muted` `#71717a` passes AA on `#fafafa` for small text (it's borderline); may darken to zinc-600 for light.
