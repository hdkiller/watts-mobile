# Design System — Coach Watts Mobile

UI conventions for this app. Brand tokens originate in coach-wattz `BRANDING.md`; this doc covers how they're applied here. Update it when a convention changes — code should match this doc.

## Principles

1. **Field companion, not dashboard.** One decision per viewport; depth lives on web ("Open in Coach Watts").
2. **Dark-first.** Single dark theme for now (`#09090b` background). No light-mode styling until it's a deliberate project.
3. **Text is the default, icons are seasoning.** Sport glyphs and status colors aid scanning; avoid decorative icon noise.
4. **Skeletons, not spinners.** Full-screen loads show layout-matching skeletons. Spinners are only for small in-place waits (inline section loads, button loading states).

## Tokens

Source of truth: [`src/theme/colors.ts`](../src/theme/colors.ts) (JS access) and [`tailwind.config.js`](../tailwind.config.js) (className access). Keep them in sync.

| Token | Value | Tailwind | Use |
|-------|-------|----------|-----|
| brand | `#00DC82` | `text-brand` / `bg-brand` | Accents, links, active states, spinner tint; train hero tone |
| brand action | `#00C16A` | `bg-brand-action` | Primary button fill only |
| brand deep | `#00A155` | `brand-deep` | Chart accent |
| recovery | `#38bdf8` | `text-recovery` / `bg-recovery` | Rest-day hero accent (sky on dark; not violet) |
| modify | `#f59e0b` | `text-modify` / `bg-modify` | Modify hero accent |
| background | `#09090b` | `bg-surface-dark` | Screen background |
| ink | `#09090b` | `text-ink` | Text **on** brand green |
| ink muted | `#71717a` | `text-ink-muted` | Secondary text, labels, metadata |
| danger | `#ef4444` | `text-red-400` etc. | Errors, destructive |

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

Neutral surfaces use zinc: cards `bg-zinc-900(/80)` with `border-zinc-800`, input/button borders `border-zinc-700`, hairline row dividers `border-zinc-800/80`.

**Contrast rule:** text on brand green is always dark (`text-ink`), never white.

## Type scale

- Screen title / greeting: `text-2xl font-semibold text-white`
- Card/hero title: `text-2xl` (hero) or `text-lg` (compact) `font-semibold text-white`
- Section header: `text-xs font-semibold uppercase tracking-widest text-ink-muted` (e.g. "Coming up")
- Card label (kicker): `text-xs uppercase tracking-wide text-ink-muted`
- Body / prose: `text-base leading-6 text-zinc-200`
- Row title: `text-base font-medium text-white`
- Metadata line: `text-sm text-ink-muted`, values joined with `' · '` (date · type · duration · TSS)

## Layout

- Screen padding: `px-6`, `pt-4`, bottom `pb-10`–`pb-12` on scroll content.
- Section spacing: `mt-8` between major sections, `mt-6` between blocks inside a flow.
- Cards: `rounded-xl` (hero cards `rounded-2xl`), `p-4`–`p-5`.
- List rows: either bordered cards (`mb-3 rounded-xl border`) for dedicated list screens, or hairline-divided rows (`border-b py-3`) for embedded teasers.

## Shared components — use these, don't hand-roll

All in [`src/components/`](../src/components):

- **`Button`** — the only way to render a full-width action button. Variants: `primary` (brand-action fill, dark label), `secondary` (zinc outline), `danger` (zinc fill, red label). Handles loading spinner, disabled dimming (`opacity-50`), press feedback, and accessibility props. Pass margins via `className`.
- **`SportIcon`** — circular sport glyph derived from the workout `type` string. Sizes in use: 18 (detail/hero), 14 (list rows), 13 (Today teasers). SF Symbols on iOS, emoji fallback elsewhere. Add new sport mappings there, not inline.
- **`Skeleton` / `ListSkeleton` / `DetailSkeleton`** — loading placeholders. New screens get a skeleton that roughly matches their loaded layout.

Inline text links (Retry, See all, Check in…): `text-sm font-semibold text-brand` on a Pressable with **`hitSlop={8}`** — every tappable target must reach ~44pt.

## States

- **Loading:** skeleton (see above). Warm-cache Today target is < ~2s.
- **Error:** red tinted card (`border-red-900/50 bg-red-950/40`, `text-red-300`) with an inline brand-colored Retry link. Prefer friendly copy over raw API messages.
- **Empty:** honest one-liner in `text-ink-muted` ("Waiting for sync…", "No upcoming planned workouts.") plus the relevant action. Never a blank screen.
- **Success/confirm:** green (`text-green-400`) inline text or state change; keep it near the triggering control.

## Accessibility

- Primary CTAs go through `Button` (roles/labels/state included).
- Custom icon-only Pressables need `accessibilityRole="button"` + `accessibilityLabel`.
- Don't disable font scaling; layouts must tolerate larger text.

## Don'ts

- No white text on brand green.
- No new one-off button styles — extend `Button` with a variant instead.
- No full-screen `ActivityIndicator` for initial loads.
- No CTL grids, calendar heatmaps, or dashboard clones (see [product-baseline.md](./product-baseline.md)).
