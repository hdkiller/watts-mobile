## 1. Auth scope

- [x] 1.1 Add `performance:read` to `COMPANION_SCOPES` and verify coach-wattz public OAuth client allows it
- [x] 1.2 Document re-auth expectation for existing sessions; handle PMC 403 with quiet unavailable / re-auth cue

## 2. API client and mapping

- [x] 2.1 Add types + fetcher for `GET /api/performance/pmc?days=` (series + summary: CTL/ATL/TSB, formStatus/color/description, avgTSS)
- [x] 2.2 Unit tests for summary mapping and form-status presentation helpers
- [x] 2.3 TanStack Query hook with `days` in the query key; glance + sheet share cache when period matches

## 3. Today glance UI

- [x] 3.1 Build compact Training Load & Form glance (Fitness / Fatigue / Form + status); no chart on the tab
- [x] 3.2 Wire onto Today below primary CTAs near other context glances; do not block recommendation hero
- [x] 3.3 Loading/error/403: omit or quiet unavailable; never invent CTL/ATL/TSB

## 4. Training Load & Form sheet

- [x] 4.1 Build sheet (`Modal` pageSheet): summary cards (CTL/ATL/TSB, optional Avg TSS), short CTL/ATL/TSB blurb
- [x] 4.2 Period selector (30 / 60 / 90); default 90; refetch on change
- [x] 4.3 Simplified PMC line chart (CTL/ATL/TSB) via existing SVG/path approach — no Chart.js
- [x] 4.4 Open web → `{instance}/performance`
- [x] 4.5 Tap glance → open sheet

## 5. Docs and verification

- [x] 5.1 Update `docs/product-baseline.md` / `docs/open-questions.md` for load/form lite on Today (chart in sheet; no first-viewport CTL grid)
- [x] 5.2 Manual QA: glance values, form colors, period switch, empty/no-fitness athlete, 403 missing scope, Open web, first-viewport still decision-first
- [x] 5.3 Confirm no recovery-context overlay dependency for v1
