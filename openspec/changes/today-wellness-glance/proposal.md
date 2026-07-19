## Why

Today’s Sleep / HRV / Feel tiles only appear when a recommendation’s AI `analysisJson` includes recovery context — they are not real biometric wellness, and RHR is missing entirely. Athletes already get a clearer “Recent Wellness” glance on web (Sleep, HRV, RHR + trend %). Surfacing that same read-only glance on the Today tab makes morning readiness honest even when there is no recommendation yet, without turning Today into a second check-in form.

## What Changes

- Add a **Recent Wellness** glance on the Today tab: **Sleep, HRV, RHR only**, each with value + unit and trend % vs trailing ~7-day average when history exists.
- **Expand/collapse 7-day bars inline** on the glance (collapsed by default); separate **Check in** control → Log tab.
- Empty state copy: **“No recent wellness · Check in”** (section still shown).
- Source data from existing Bearer APIs (`GET /api/profile/dashboard` + `GET /api/wellness/trend`), not recommendation `analysisJson`.
- **Remove** the AI-derived Sleep/HRV/Feel biometric strip; glance loads independently of recommendation.
- Keep Log as the write surface — no second wellness form on Today.
- Out of scope: full Wellness Overview modal, Recovery % / Readiness / Body Fat / SpO2 / BP, metric-visibility settings, `/api/mobile/today` BFF.

## Capabilities

### New Capabilities

- `today-wellness-glance`: Read-only Recent Wellness tiles (Sleep/HRV/RHR) with trend %, inline-expandable 7-day bars, and “No recent wellness · Check in” empty state on Today.

### Modified Capabilities

- `today-home`: Today composition SHALL include the Recent Wellness glance as a thin context strip (placement relative to recommendation / Active Recovery Context / CTAs), without adding a wellness form or dashboard stat sprawl.

## Impact

- UI: `app/(app)/(tabs)/today.tsx` and a new glance component under `src/features/today/` (or `src/features/wellness/`).
- Data: new fetchers/hooks for `GET /api/profile/dashboard` (`profile:read`) and `GET /api/wellness/trend` (`health:read`); port `calculateTrend` semantics from web `useTrend.ts`.
- Scopes: mobile OAuth client must already request `profile:read` and `health:read` (verify; Log already uses wellness write which implies `health:*`).
- Existing AI recovery strip (`mapRecoveryStrip` / `RecoveryMetricTile`) needs a clear coexistence or replacement rule so athletes don’t see two conflicting Sleep/HRV stories.
- No new native modules; charts can reuse `react-native-svg` / View bars like web’s CSS bars.
- coach-wattz: no new endpoints required if dashboard + trend remain Bearer-enabled (confirm; both already use `requireAuth`).
