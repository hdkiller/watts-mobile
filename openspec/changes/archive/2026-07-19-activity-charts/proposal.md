## Why

Athletes expect to see how a completed workout unfolded in the companion—not only scores and AI text. Charts are a core field surface; sending every stream visualization to the web undercuts the companion.

## What Changes

- Add completed-workout charts on activity detail: **power/HR over time**, **time-in-zone bars**, and **power curve** when data exists.
- Fetch chart data from `GET /api/workouts/:id/streams` and `GET /api/workouts/:id/power-curve` (Bearer `workout:read`); keep summary/AI on `includeStreams=false` detail.
- Client-downsample stream series for rendering (server already caps at ~2k points).
- Add `react-native-svg` for lightweight charts (requires **dev client rebuild**).
- Update product baseline: charts in-app; map / interval audit / explorer depth still Open web.

## Capabilities

### New Capabilities

- `activity-charts`: Stream, zone, and power-curve charts on completed activity detail.

### Modified Capabilities

- `recent-activity`: Activity summary includes charts when stream/power data is available; Open web is for map/explorer depth, not the only way to see power/HR.

## Impact

- **Mobile:** new chart helpers/components under `src/features/activity/`, activity detail UI, `package.json` (+ lockfile).
- **APIs:** existing `/streams` + `/power-curve` (`workout:read`). No backend changes.
- **Native:** `react-native-svg` — rebuild iOS/Android dev client after pull.
- **Out of scope:** interactive map, interval audit page, full web timeline with all channels, segment selection.
