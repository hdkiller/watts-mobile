## 1. Native maps dependency

- [ ] 1.1 Add Expo-compatible `react-native-maps` (or chosen maps package) and wire `app.json` / config plugin as required for iOS + Android
- [ ] 1.2 Document the dependency and rebuild requirement in `docs/native-modules.md`; note Android Google Maps API key needs if applicable
- [ ] 1.3 Rebuild the iOS/Android dev client so the native module links

## 2. Data: coordinates and polyline

- [ ] 2.1 Extend workout summary/list API types to include optional `summaryPolyline`
- [ ] 2.2 Extend streams chart types/mapper to expose usable `latlng` (skip null gaps for drawing; preserve index alignment if needed later)
- [ ] 2.3 Add Google-encoded polyline decode helper + unit tests
- [ ] 2.4 Add `resolveActivityRouteCoordinates` (prefer `latlng`, else decoded `summaryPolyline`) with unit tests and display decimation (e.g. ≤500 points)

## 3. Activity map UI

- [ ] 3.1 Build `ActivityMap` component: MapView, route polyline, green start / red end markers, fit-to-bounds on load, fixed height section
- [ ] 3.2 Integrate map into `app/(app)/activity/[id].tsx` with loading skeleton and omit-when-no-GPS behavior
- [ ] 3.3 Reuse the existing activity streams query/cache (no duplicate streams fetch solely for the map)
- [ ] 3.4 Update Open web CTA copy so it no longer implies the route map is web-only (explorer/deeper analysis)

## 4. Docs and product decision

- [ ] 4.1 Update `docs/product-baseline.md` so lite in-app route map is in-scope; explorer/GPX/interval audit remain Open web
- [ ] 4.2 Record the decision in `docs/open-questions.md` (reverse prior “map → open web” for lite map only)

## 5. Verification

- [ ] 5.1 Unit tests for polyline decode + coordinate resolver pass (`pnpm test`)
- [ ] 5.2 Typecheck passes (`npx tsc --noEmit`)
- [ ] 5.3 Manual: outdoor workout with GPS shows map + start/end + fit bounds; indoor/no-GPS omits map; Open web still reaches workout on instance
