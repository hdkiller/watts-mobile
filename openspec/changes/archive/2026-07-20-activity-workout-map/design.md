## Context

Web embeds `UiWorkoutMap` (Leaflet + CARTO tiles) on workout detail and offers a deeper `/workouts/:id/map` explorer. GPS comes from `streams.latlng` (`GET /api/workouts/:id/streams`, downsampled ~2000 points) with Google-encoded `summaryPolyline` as a compact fallback.

Mobile activity detail already loads summary (`includeStreams=false`) plus chart queries against the same `/streams` endpoint — but mappers drop `latlng` / metric streams unused by charts. Product baseline currently says “map / explorer → open web.” This change reverses that for a **lite in-app map** only.

## Goals / Non-Goals

**Goals:**

- Show an interactive route map on completed activity detail when GPS coordinates exist.
- Prefer `streams.latlng`; fallback to decoded `summaryPolyline` from summary/list payload.
- Fit bounds, pan/zoom, green start + red end markers (web parity for the embedded map).
- Honest omit/empty when there is no route (indoor/trainer).
- Keep Open web for explorer depth (scrub sync, climbs/intervals/zones chrome, GPX).
- Rebuild the dev client after adding the native maps dependency.

**Non-Goals:**

- Porting the full map analysis page (`/workouts/:id/map`).
- Chart↔map scrub sync, lap split markers, zone/interval highlight chrome.
- GPX export, privacy-zone blur, offline tile packs.
- Planned-workout maps.
- Analytics explorer / MapRenderer surfaces.

## Decisions

1. **Reuse existing `/streams` query for coordinates**
   - Extend `mapActivityStreamCharts` (or a sibling mapper) to expose `latlng: [lat, lng][]` (skip null gaps for drawing; preserve indices if coloring is added).
   - Do **not** add a third network call when charts already fetch streams.
   - Summary fetch stays `includeStreams=false`.

2. **`summaryPolyline` fallback**
   - Add optional `summaryPolyline` on summary (and optionally list) types from existing API fields.
   - Decode with a small Google-encoded-polyline helper (same algorithm as `@googlemaps/polyline-codec` / web preview).
   - Use polyline only when `latlng` is empty/missing.

3. **Native maps via `react-native-maps` (Expo)**
   - Platform defaults: Apple Maps (iOS) / Google Maps (Android) — native gestures and performance beat a Leaflet WebView.
   - Tile/style parity with web CARTO is **not** required; brand the route stroke with Coach Watts primary, not basemap theming.
   - Alternatives considered: (a) SVG silhouette only — too far from “map like web”; (b) WebView + Leaflet — heavy, poor gestures; (c) MapLibre/OSM — closer tile parity, more setup than needed for companion v1.

4. **UI placement**
   - Map block on `activity/[id]` above or below summary metrics / near charts — one section with fixed height (~220–280pt), not a separate stack route.
   - Loading: skeleton while streams (or polyline) resolving; omit section entirely when resolved with no coordinates.
   - Update Open web CTA copy from “map & more” to explorer-oriented language (e.g. “Open for deeper map analysis”).

5. **Metric color modes (phased)**
   - **v1 ship:** solid route + start/end + fit bounds.
   - **Same change if cheap:** Route / Elevation / HR / Pace segment coloring when those series exist on the already-loaded streams payload (web modes), with a compact mode control. Skip if it balloons scope — track as follow-up task rather than blocking.

6. **List route silhouette (optional)**
   - Non-interactive SVG from `summaryPolyline` on recent list rows is nice-to-have; ship after detail map unless trivial.

7. **Docs / product decision**
   - Update `docs/product-baseline.md` and `docs/open-questions.md`: lite in-app map is in; explorer remains Open web.

## Risks / Trade-offs

- **[Native rebuild required]** → Document in tasks + `docs/native-modules.md`; Metro alone will not link maps.
- **[Android Google Maps API key]** → Confirm Expo/`app.json` config for Google Maps; fail gracefully with polyline-only/SVG if maps provider misconfigured during dev.
- **[Large latlng arrays]** → API already downsamples ~2000; further decimate for polyline drawing (e.g. ≤500) like web colored segments.
- **[Product scope creep toward explorer]** → Spec explicitly forbids scrub sync / climbs UI; Open web remains the escape.
- **[Prior “map → open web” docs]** → Update baseline so QA/product don’t treat in-app map as a regression.

## Migration Plan

1. Add maps dependency + config; rebuild iOS/Android dev clients.
2. Extend types/mappers/hooks; render map on activity detail.
3. Update Open web copy + product docs.
4. Rollback: remove map section + dependency (charts/summary unchanged).

## Open Questions

- Prefer `react-native-maps` platform tiles vs MapLibre + OSM/CARTO for closer web visual match? Default: platform maps unless brand insists on OSM.
- Ship metric color modes in the first PR or immediately after solid-route MVP?
- Include list-row SVG silhouette in this change or a follow-up?
