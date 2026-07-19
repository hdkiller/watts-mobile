## Why

Product baseline includes a lite recent-activity surface and (as of the 2026-07-19 direction pass) an **upcoming planned** glance so athletes can see what they did and what’s next without the full web calendar. Today and Log are live; this fills the workouts “glance” gap before store polish.

## What Changes

- Recent activities list (capped) using `GET /api/workouts` with `workout:read`
- Upcoming planned list (capped, next ~7–14 days) using `GET /api/planned-workouts` with date range + limit
- Show title/date, sport/type when available; recent rows show sync/analysis status honestly
- Tap recent → activity summary stack (lite); tap planned → planned detail stack (richer structure summary when payload allows)
- Deep analysis → Open web
- Entry from More: **Recent** and **Upcoming** (same feature package; no calendar heatmap)
- Deepen existing planned detail beyond title/duration/TSS/description when structure fields are available

## Capabilities

### New Capabilities

- `recent-activity`: Lite workout list + summary detail + web escape for deep analysis
- `upcoming-planned`: Capped upcoming planned list from More + navigation to planned detail

### Modified Capabilities

- _(Today teaser for “next up” deferred unless UI budget allows later)_

## Impact

- **watts-mobile:** More → Recent + Upcoming; richer `planned/[id]` + activity summary; `src/features/activity/` (and planned list helpers)
- **coach-wattz:** Workouts list already Bearer-capable; planned list already Bearer `workout:read`; **confirm Bearer + structure fields on** `GET /api/planned-workouts/:id`
- **Out of scope:** Full calendar, plan editing/reschedule, analytics explorer, integration reconnects, E2E
