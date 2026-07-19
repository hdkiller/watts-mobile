## Why

Mobile planned and past workout detail screens already ship the documented lite contract (meta + structure steps / description + Open web), but athletes still open the web app for a few field-useful numbers the Bearer APIs already return. Enriching those screens with summary metrics and light planned cues reduces unnecessary web escapes without porting charts, analysis, or authoring.

## What Changes

- Enrich **past activity summary** with read-only lite metrics when present on `GET /api/workouts/:id?includeStreams=false`: distance, average power, normalized power, average HR, elevation gain, and intensity factor (`intensity`).
- Enrich **planned workout detail** with read-only intensity (`workIntensity`), completion/sync status badges when present, short coach instructions from `structuredWorkout.coachInstructions` when available, and a compact zone summary from `structuredWorkout.zoneProfileSnapshot` when available.
- Keep **Open in Coach Watts** as the escape hatch for AI analysis, charts/streams/maps, structure editing, publish/export, and fueling logistics.
- No new backend endpoints; map existing Prisma/Bearer field names only. Do not invent aliases or fetch the cookie-only `/api/workouts/planned/:id` aggregate.

## Capabilities

### New Capabilities

<!-- none — this extends existing detail surfaces -->

### Modified Capabilities

- `recent-activity`: Lite activity summary gains optional summary metrics (distance / power / HR / elevation / IF) while remaining streams-off and mutation-free.
- `upcoming-planned`: Planned detail gains optional intensity, status badges, coach instructions, and compact zone summary when Bearer payload provides them.

## Impact

- **Mobile code:** `src/features/activity/types.ts`, `mapActivity.ts`, `app/(app)/activity/[id].tsx`, `app/(app)/planned/[id].tsx` (+ small format helpers / tests if present).
- **APIs (read-only, existing):** `GET /api/workouts/:id?includeStreams=false`, `GET /api/planned-workouts/:id` (`workout:read`).
- **Backend:** No coach-wattz changes required for v1 of this enrichment; fields already on Workout / PlannedWorkout rows and nested `structuredWorkout` JSON.
- **Out of scope:** Mission/week context (web aggregate only), structure edit/publish/export, AI analysis, charts/streams/maps, complete/skip mutations on detail.
