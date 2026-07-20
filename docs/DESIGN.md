# Design System — Coach Watts Mobile

UI conventions for this app. Brand tokens originate in coach-wattz `BRANDING.md`; this doc covers how they're applied here. Update it when a convention changes — code should match this doc.

## Principles

1. **Field companion, not dashboard.** One decision per viewport; depth lives on web ("Open in Coach Watts").
2. **Two themes, one system.** Light and dark ship together. Default follows the OS (`userInterfaceStyle: "automatic"`); Settings → Appearance lets the athlete pick **System / Light / Dark** (persisted on-device via `Appearance.setColorScheme`). Every color in UI code goes through a **semantic token** (surface, card, border, text…) that resolves per theme — never a raw palette value like `bg-zinc-900` or `#09090b` in a component. Dark remains the reference theme (screenshots, design exploration start there); light is derived from the same tokens, not styled ad hoc. Outdoor readability is the point: athletes use this in direct sunlight, where light mode wins. Enforce with `pnpm lint:theme`.
3. **Text is the default, icons are seasoning.** Sport glyphs and status colors aid scanning; avoid decorative icon noise.
4. **Skeletons, not spinners.** Full-screen loads show layout-matching skeletons. Spinners are only for small in-place waits (inline section loads, button loading states).

## Tokens

Source of truth: [`src/theme/colors.ts`](../src/theme/colors.ts) (JS access) and [`tailwind.config.js`](../tailwind.config.js) (className access). Keep them in sync.

Brand/state accents (brand, recovery, modify, danger, zone ramp) are **theme-invariant**. Neutrals are **semantic** and resolve per theme:

| Semantic token | Dark value | Light value | Tailwind | Replaces |
|----------------|-----------|-------------|----------|----------|
| surface | `#09090b` | `#fafafa` | `bg-surface` | `bg-surface-dark`, raw `#09090b` |
| card | zinc-900 `#18181b` (`/80`) | white | `bg-card` | `bg-zinc-900`, `bg-zinc-900/80` |
| border | zinc-800 `#27272a` | zinc-200 `#e4e4e7` | `border-border` | `border-zinc-800` |
| border-strong | zinc-700 `#3f3f46` | zinc-300 `#d4d4d8` | `border-border-strong` | `border-zinc-700` (inputs/buttons) |
| text-primary | white | zinc-950 `#09090b` | `text-text-primary` | `text-white` |
| text-body | zinc-200 `#e4e4e7` | zinc-700 `#3f3f46` | `text-text-body` | `text-zinc-200` |
| text-muted | `#71717a` | zinc-600 `#52525b` | `text-text-muted` | `text-ink-muted` |
| tint-error | red-950 `#450a0a` | red-50 `#fef2f2` | `bg-tint-error` | `bg-red-950/40` |
| tint-success | green-950 `#052e16` | green-50 `#f0fdf4` | `bg-tint-success` | `bg-green-950/40` |

Wired via CSS variables in `global.css` (`:root` light + `prefers-color-scheme: dark`) mapped in `tailwind.config.js` with `<alpha-value>` slots (`bg-card/80`). JS access: `useThemeColors()` / `Themes.dark|light` in `src/theme/colors.ts`. **Contrast rule** applies in both themes: text on brand green is always dark ink (`text-ink`); light `text-muted` is zinc-600 so body-size muted text clears WCAG AA on `#fafafa`.

**Card elevation:** both themes use a hairline `border-border` (no soft shadow). Light stays flat like dark so list density and press targets stay identical; a light-only shadow can be revisited later if cards feel washed out on pure white.

| Token | Value | Tailwind | Use |
|-------|-------|----------|-----|
| brand | `#00DC82` | `text-brand` / `bg-brand` | Accents, links, active states, spinner tint; train hero tone |
| brand action | `#00C16A` | `bg-brand-action` | Primary button fill only |
| brand deep | `#00A155` | `brand-deep` | Chart accent |
| recovery | `#38bdf8` | `text-recovery` / `bg-recovery` | Rest-day hero accent (sky on dark; not violet) |
| modify | `#f59e0b` | `text-modify` / `bg-modify` | Modify hero accent |
| surface | see table | `bg-surface` | Screen background |
| ink | `#09090b` | `text-ink` | Text **on** brand green |
| danger | `#ef4444` | `text-danger` / `text-red-400` | Errors, destructive |
| success | `#22c55e` | `text-success` / `text-green-400` | Success confirmations |

### Zone ramp (Z1→Z7)

Shared by activity zone bars, planned zone rows, and the structure-profile silhouette. Access via `Colors.zones` / `zoneColor(index)` (0-based, clamps to last) or Tailwind `bg-zone-1` … `bg-zone-7`. Unknown intensity uses `Colors.zoneNeutral` / `bg-zone-neutral`.

| Zone | Hex | Tailwind | Note |
|------|-----|----------|------|
| Z1 | `#3b82f6` | `zone-1` | Blue |
| Z2 | `#14b8a6` | `zone-2` | Teal — distinct from brand green |
| Z3 | `#eab308` | `zone-3` | Yellow |
| Z4 | `#f97316` | `zone-4` | Orange |
| Z5 | `#ef4444` | `zone-5` | Red |
| Z6 | `#a855f7` | `zone-6` | Purple |
| Z7 | `#52525b` | `zone-7` | Zinc |

Neutral surfaces use semantic tokens: cards `bg-card(/80)` with `border-border`, input/button borders `border-border-strong`, hairline row dividers `border-border/80`.

**Contrast rule:** text on brand green is always dark (`text-ink`), never white / `text-text-primary`.

## Type scale

- Screen title / greeting: `text-2xl font-semibold text-text-primary`
- Card/hero title: `text-2xl` (hero) or `text-lg` (compact) `font-semibold text-text-primary`
- Section header: `text-xs font-semibold uppercase tracking-widest text-text-muted` (e.g. "Coming up")
- Card label (kicker): `text-xs uppercase tracking-wide text-text-muted`
- Body / prose: `text-base leading-6 text-text-body`
- Row title: `text-base font-medium text-text-primary`
- Metadata line: `text-sm text-text-muted`, values joined with `' · '` (date · type · duration · TSS)

## Layout

- Screen padding: `px-6`, `pt-4`, bottom `pb-10`–`pb-12` on scroll content.
- Section spacing: `mt-8` between major sections, `mt-6` between blocks inside a flow.
- Cards: `rounded-xl` (hero cards `rounded-2xl`), `p-4`–`p-5`.
- List rows: either bordered cards (`mb-3 rounded-xl border`) for dedicated list screens, or hairline-divided rows (`border-b py-3`) for embedded teasers.

## Shared components — use these, don't hand-roll

All in [`src/components/`](../src/components):

- **`Button`** — the only way to render a full-width action button. Variants: `primary` (brand-action fill, dark label), `secondary` (border-strong outline), `danger` (border-strong fill, red label). Handles loading spinner, disabled dimming (`opacity-50`), press feedback, and accessibility props. Pass margins via `className`.
- **`SportIcon`** — circular sport glyph derived from the workout `type` string. Sizes in use: 18 (detail/hero), 14 (list rows), 13 (Today teasers). SF Symbols on iOS, emoji fallback elsewhere. Add new sport mappings there, not inline.
- **`Skeleton` / `ListSkeleton` / `DetailSkeleton`** — loading placeholders. New screens get a skeleton that roughly matches their loaded layout.

Inline text links (Retry, See all, Check in…): `text-sm font-semibold text-brand` on a Pressable with **`hitSlop={8}`** — every tappable target must reach ~44pt.

## States

- **Loading:** skeleton (see above). Warm-cache Today target is < ~2s.
- **Error:** red tinted card (`border-danger/40 bg-tint-error`, `text-red-400`) with an inline brand-colored Retry link. Prefer friendly copy over raw API messages.
- **Empty:** honest one-liner in `text-text-muted` ("Waiting for sync…", "No upcoming planned workouts.") plus the relevant action. Never a blank screen.
- **Success/confirm:** green (`text-green-400`) inline text or state change; keep it near the triggering control.

## Haptic Feedback Map

Map haptic interactions uniformly across all screens. Use the helpers from `src/lib/haptics.ts`:

- **`hapticLight()`**: Chip selection (e.g. Log check-in options), segment selectors, +/- steppers, custom list item row presses, tab swaps.
- **`hapticSuccess()`**: Successful API actions, log submissions, accepted recommendations, successfully sent chat messages.
- **`hapticError()`**: Blocked form validation, API failures, authentication failure.

## Keyboard & Input Accessibility

To avoid keyboards layout overlap or blocking inputs:

- **Tab screens:** Use `useKeyboardOverlap` hook to adjust bottom padding dynamically on iOS (standard `KeyboardAvoidingView` behaves incorrectly inside bottom tab systems).
- **Dismiss interactions:** Wrap inputs/forms in a root dismissing `Pressable` that calls `Keyboard.dismiss()` to ensure taps on empty space hide the keyboard.
- **Standard screens:** Use standard `KeyboardAvoidingView` or `KeyboardAwareScrollView` for standalone screens (like Login or Athlete Profile).

## Standardized Press Animations

- Prefer **`AnimatedPressable`** (spring-scale + opacity press animation) over raw `Pressable` with `active:opacity-80` classes.
- Ensure all tappable surfaces (links, chips, triggers) have **`hitSlop={8}`** or higher, targeting a minimum touch dimension of **44pt**.

## Accessibility

- Primary CTAs go through `Button` (roles/labels/state included).
- Custom icon-only Pressables need `accessibilityRole="button"` + `accessibilityLabel`.
- Don't disable font scaling; layouts must tolerate larger text.

## Don'ts

- No raw neutral palette values in components (`bg-zinc-900`, `#09090b`, `text-white`) — semantic tokens only, so both themes stay correct.
- No white text on brand green.
- No new one-off button styles — extend `Button` with a variant instead.
- No full-screen `ActivityIndicator` for initial loads.
- No CTL grids, calendar heatmaps, or dashboard clones (see [product-baseline.md](./product-baseline.md)).
