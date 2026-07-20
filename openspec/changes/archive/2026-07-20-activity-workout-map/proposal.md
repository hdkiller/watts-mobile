## Why

Completed workouts on web show an interactive route map (Leaflet + GPS polyline, start/end, optional metric coloring). The companion already has activity detail with metrics, AI analysis, and charts, but still pushes athletes to Open web for the route — so outdoor rides/runs feel incomplete in the field. Bringing a lightweight in-app map onto activity detail closes that gap without porting the full map explorer.

## What Changes

- Add an **interactive workout map** on completed activity detail (`/(app)/activity/[id]`), modeled on web’s embedded `UiWorkoutMap` (not the full `/workouts/:id/map` analysis page).
- Load GPS from existing Bearer APIs: prefer `streams.latlng` via `GET /api/workouts/:id/streams`; fallback to decoding `summaryPolyline` from workout summary when full latlng is absent.
- Show route polyline, green start / red end markers, fit-to-route, and pan/zoom when coordinates exist; omit the map (or show a quiet empty affordance) for indoor/trainer workouts with no GPS.
- Optionally support web-parity **metric color modes** (Route / Elevation / HR / Pace) when aligned stream series exist — keep controls compact for mobile.
- Keep **Open web** for map explorer depth (lap/interval/climb scrub sync, zone highlights, GPX export, full analysis layout).
- Optionally show a non-interactive **route silhouette** on recent-activity list rows when `summaryPolyline` is present (web `UiWorkoutRoutePreview` parity) — nice-to-have, not required for v1 of this change.
- Update product/docs language that currently says “map → open web” so in-app lite map is an explicit companion capability.
- **No BREAKING** API changes expected; reuse `workout:read` endpoints already used by activity charts.

## Capabilities

### New Capabilities

- `activity-workout-map`: Interactive GPS route map on completed activity detail (polyline, start/end, fit bounds, honest no-GPS state), backed by workout streams / summary polyline; explorer depth remains Open web.

### Modified Capabilities

- `recent-activity`: Activity summary no longer treats maps as Open-web-only; in-app lite map is allowed, while map explorer / GPX / interval audit depth still escape to web.

## Impact

- UI: `app/(app)/activity/[id].tsx` plus new map component(s) under `src/features/activity/` (e.g. `ActivityMap.tsx`).
- Data: extend activity types/mappers to read `latlng` (and optionally altitude/velocity/HR for coloring) from streams; optionally `summaryPolyline` on list/summary payloads; decode Google-encoded polyline when needed.
- Dependencies: native maps module (likely `react-native-maps` / Expo Maps) + tile/attribution strategy aligned with web (OSM/CARTO or Apple/Google platform defaults) — **requires a native rebuild** per `docs/native-modules.md`.
- APIs (coach-wattz): `GET /api/workouts/:id/streams` (`latlng`, optional metric streams), `GET /api/workouts/:id` / list (`summaryPolyline`); no new backend endpoint if these remain Bearer-enabled with `workout:read`.
- Docs: `docs/product-baseline.md` (and open-questions if the prior “map → open web” decision is reversed for lite maps).
- Out of scope: full map analysis page, chart↔map scrub sync, climb/interval/zone highlight chrome, GPX export, privacy-zone blurring, offline tile packs, planned-workout maps.
