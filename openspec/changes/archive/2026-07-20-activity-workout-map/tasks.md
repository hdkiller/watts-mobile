## 1. Native maps dependency

- [x] 1.1 Add Expo-compatible `react-native-maps` (or chosen maps package) and wire `app.json` / config plugin as required for iOS + Android
- [x] 1.2 Document the dependency and rebuild requirement in `docs/native-modules.md`; note Android Google Maps API key needs if applicable
- [x] 1.3 Rebuild the iOS/Android dev client so the native module links

## 2. Data: coordinates and polyline

- [x] 2.1 Extend workout summary/list API types to include optional `summaryPolyline`
- [x] 2.2 Extend streams chart types/mapper to expose usable `latlng` (skip null gaps for drawing; preserve index alignment if needed later)
- [x] 2.3 Add Google-encoded polyline decode helper + unit tests
- [x] 2.4 Add `resolveActivityRouteCoordinates` (prefer `latlng`, else decoded `summaryPolyline`) with unit tests and display decimation (e.g. ≤500 points)

## 3. Activity map UI

- [x] 3.1 Build `ActivityMap` component: MapView, route polyline, green start / red end markers, fit-to-bounds on load, fixed height section
- [x] 3.2 Integrate map into `app/(app)/activity/[id].tsx` with loading skeleton and omit-when-no-GPS behavior
- [x] 3.3 Reuse the existing activity streams query/cache (no duplicate streams fetch solely for the map)
- [x] 3.4 Update Open web CTA copy so it no longer implies the route map is web-only (explorer/deeper analysis)

## 4. Docs and product decision

- [x] 4.1 Update `docs/product-baseline.md` so lite in-app route map is in-scope; explorer/GPX/interval audit remain Open web
- [x] 4.2 Record the decision in `docs/open-questions.md` (reverse prior “map → open web” for lite map only)

## 5. Verification

- [x] 5.1 Unit tests for polyline decode + coordinate resolver pass (`pnpm test`)
- [x] 5.2 Typecheck passes (`npx tsc --noEmit`)
- [x] 5.3 Manual: outdoor workout with GPS shows map + start/end + fit bounds; indoor/no-GPS omits map; Open web still reaches workout on instance
