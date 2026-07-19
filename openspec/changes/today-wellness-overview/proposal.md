## Why

Athletes already tap Recent Wellness tiles on web to open **Wellness Overview** — a day-level explanation with more metrics, trend history, and coaching context. On mobile Today the glance is read-only and mostly inert (Check in → Log only), so the same tap affordance does not explain *why* sleep/HRV/RHR look good or off. Shipping a companion Wellness Overview sheet closes that gap without turning Today into a second check-in form or a full analytics surface.

## What Changes

- Make the Recent Wellness glance on Today **tappable**: opening a **Wellness Overview** bottom sheet / modal (web parity for the explain surface, not a pixel-perfect port).
- In the overview: show the selected wellness day (default latest), a **key metrics grid** beyond the glance’s Sleep/HRV/RHR when values exist (e.g. recovery score, readiness, stress, mood, weight when present), **7-day trend bars** for core biometrics, stale-day labeling, and a short coach/heuristic recommendation when available from the wellness payload.
- Load day detail via existing Bearer APIs (`GET /api/wellness/{date}` for overview + trends; reuse trend series already used by the glance where practical).
- Keep Log as the **write** surface — overview is read-only; offer Check in → Log (and optionally Open web for full wellness day on the instance).
- Supersede the `today-wellness-glance` interaction that expands 7-day bars **inline**: trends live in the overview sheet; the glance stays a compact tile row that opens the sheet.
- Out of scope: AI “Analyze with AI” / regenerate jobs, PATCH editable sliders/custom fields, metric-visibility settings, Garmin attribution chrome, `/api/mobile/today` BFF.

## Capabilities

### New Capabilities

- `wellness-overview`: Read-only Wellness Overview sheet opened from Today’s Recent Wellness glance — day metrics, 7-day trends, stale labeling, and read-only coaching cue; Check in / Open web escapes for writes and deeper web tools.

### Modified Capabilities

- `today-home`: Today’s Recent Wellness glance SHALL open Wellness Overview on tap (instead of only inline expand / Check in), while remaining a thin context strip that does not add a wellness form or first-viewport dashboard sprawl.
- `today-wellness-glance`: Tap-to-expand inline 7-day bars is replaced by tap-to-open Wellness Overview; Check in remains a distinct control.

## Impact

- UI: `RecentWellnessGlance` becomes a pressable entry; new sheet under `src/features/wellness/` (or `today/`); Today composition wiring in `app/(app)/(tabs)/today.tsx`.
- Data: client for `GET /api/wellness/{date|id}` (`health:read`) mapping metrics + `trends` history; may reuse `useRecentWellness` / `GET /api/wellness/trend` for glance tiles.
- Depends on / extends open change `today-wellness-glance` (tiles + dashboard/trend fetchers).
- coach-wattz: no new endpoints if wellness detail + trend remain Bearer-enabled (web `WellnessModal` already uses these).
- Product docs: update open-questions / baseline when this lands (wellness explain on mobile; still not full Profile Settings).
