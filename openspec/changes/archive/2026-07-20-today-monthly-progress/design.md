## Context

Web `MonthlyComparisonCard` fetches `GET /api/stats/monthly-comparison?sport=` and charts current vs last month with metric/sport/view-mode selectors. Mobile has no monthly-comparison client. `workout:read` is already in `COMPANION_SCOPES`.

## Goals / Non-Goals

**Goals:** Today glance + sheet with web-like month-over-month signal; honest empty/error; Open web escape.

**Non-Goals:** Persisting dashboardSettings to user profile; Chart.js; first-viewport placement; Performance Scores.

## Decisions

1. **Placement:** Today, after Training Load glance / week strip cluster — context strip, not hero.
2. **Glance content:** Selected metric (default TSS) current-month-to-date total + delta % vs last month same day; title “Monthly Progress”.
3. **Sheet:** Metric (TSS/Duration/Distance/Elevation/Count), sport (All + sports list), Cumulative vs Daily; simplified dual-series chart (current vs last) using existing SVG/line primitives; footer totals + delta.
4. **Prefs:** Local React state (session) for v1; optional AsyncStorage later — not web dashboardSettings write.
5. **APIs:** `monthly-comparison` + `workouts/sports`; no BFF.
6. **Open web:** Instance `/dashboard` (widget lives there) via `openInstanceWeb`.

## Risks / Trade-offs

- Chart height on small phones → keep sheet chart ~180–220pt, glance chart-free.
- Large sport lists → compact picker / sheet only.

## Migration Plan

1. API client + mappers + trend/delta helpers + tests.
2. Glance + sheet UI; wire Today.
3. Docs / product-baseline.

## Open Questions

- Default metric: **TSS** (matches most athletes’ web default).
