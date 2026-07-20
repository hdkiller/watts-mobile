# Dual Theme Tokens — Tasks

## 1. Token plumbing (spike first)

- [x] 1.1 Define semantic CSS variables (dark + light blocks) in `global.css` and map them to Tailwind colors with alpha support in `tailwind.config.js` (`surface`, `card`, `border`, `border-strong`, `text-primary`, `text-body`, `text-muted`, `tint-error`, `tint-success`)
- [ ] 1.2 Spike: verify variable-backed classes + `/80` alpha variants resolve on iOS and Android dev clients under both appearances; fall back to generated `dark:` variants if broken
- [x] 1.3 Add `Themes.dark` / `Themes.light` maps and a `useThemeColors()` hook in `src/theme/colors.ts`; keep existing `Colors` export as the dark map during migration
- [x] 1.4 Set `userInterfaceStyle: "automatic"` in app.json, status bar to `auto`; rebuild dev client; document the rebuild requirement in the PR description

## 2. Chrome & shared components

- [x] 2.1 Theme navigation chrome: `NativeTabs` colors, Stack `contentStyle`/header colors in `app/_layout.tsx`, `(app)/_layout.tsx`, `(auth)/_layout.tsx` via the active palette
- [x] 2.2 Migrate shared components to tokens: `Button`, `Skeleton`/`ListSkeleton`/`DetailSkeleton`, `OfflineBanner`, `HeroStatTiles`, `SportIcon`, `ErrorFallback`, `AnimatedPressable`
- [x] 2.3 Decide light-mode card elevation (border vs soft shadow) and `text-muted` light value (AA check) — record both in DESIGN.md

## 3. Screen migration (dark stays reference; verify each group in both themes)

- [x] 3.1 Today tab (screen + today feature components: glances, strips, cards, sheets)
- [x] 3.2 Log tab (log screen, daily check-in, recovery event, measurements, nutrition sections)
- [x] 3.3 Coach tab (CoachChat, bubbles, RoomListSheet, AttachSheet)
- [x] 3.4 More/Settings/Athlete/Notifications screens
- [x] 3.5 Activity/planned/upcoming screens and auth screens (login, instance)
- [x] 3.6 JS-color surfaces: charts (`ActivityCharts`, structure profile, PMC/training load), `ActivityMap`, `RefreshControl`/spinner tints, wordmark `tintColor` on login, widget snapshot colors

## 4. Guardrail & verification

- [x] 4.1 Add lint/CI check rejecting `zinc-*` classes and known neutral hex literals under `app/` and `src/` (excluding `src/theme/`); fix stragglers it finds
- [ ] 4.2 Capture screenshot-diff baselines for key screens (Today, Log, Coach, planned detail, activity detail, More) in dark AND light; visual pass for contrast-rule violations
- [ ] 4.3 Runtime appearance-switch test: flip OS appearance with the app foregrounded; verify live re-render incl. status bar and tab chrome
- [x] 4.4 Update DESIGN.md if any token values changed during implementation; run typecheck + vitest
