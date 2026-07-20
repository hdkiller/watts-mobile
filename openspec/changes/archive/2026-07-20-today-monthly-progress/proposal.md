## Why

Web dashboard’s **Monthly Progress** widget (`MonthlyComparisonCard`) lets athletes compare this month vs last month (TSS / duration / distance / elevation / count) with a chart and delta %. Mobile Today has only a 7-day week glance — no month-over-month progress — so the field companion misses a core dashboard signal athletes already rely on.

## What Changes

- Add a **Monthly Progress** glance on Today (below Training Load / week glances; not in the first-viewport decision composition).
- Compose existing Bearer APIs: `GET /api/stats/monthly-comparison?sport=` (`workout:read`) and sport list via `GET /api/workouts/sports` when needed.
- Compact glance: current metric total + delta % vs last month (same day-of-month comparison as web footer); tap opens a sheet with metric/sport/view-mode controls and a simplified current-vs-last-month chart.
- Keep web settings chrome (dashboardSettings persistence, gear modal extras) on web; mobile may keep selectors local for the session or soft-persist on device — not a second Profile Settings surface.
- Open web escape to dashboard (or analytics) for full dashboard widget chrome.
- Honest empty / error / 403 states; do not block Today’s recommendation CTAs.

## Capabilities

### New Capabilities

- `monthly-progress`: Today Monthly Progress glance + sheet (metric/sport/view mode, chart, footer delta), backed by monthly-comparison + sports list APIs.

### Modified Capabilities

- `today-home`: Today composition MAY include Monthly Progress as a thin context glance below primary decision CTAs (with Training Load / Coming up / Recently), not as a first-viewport dashboard card.

## Impact

- **watts-mobile:** new feature under `src/features/performance/` or `src/features/stats/`; Today wiring; chart via existing SVG/simple series (no Chart.js).
- **coach-wattz:** none if monthly-comparison + workouts/sports remain Bearer with `workout:read` (already on Official Mobile App).
- **Out of scope:** full dashboard Settings modal, Performance Scores card, analytics explorer, new `/api/mobile/*` BFF.
