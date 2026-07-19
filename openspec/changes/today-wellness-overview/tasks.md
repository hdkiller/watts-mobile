## 1. API client and mapping

- [x] 1.1 Add types + fetcher for `GET /api/wellness/{date}` (metrics, `trends` histories, AI summary/recommendation fields when present)
- [x] 1.2 Map null-safe key metrics (HRV, Sleep, RHR, recovery, readiness, weight, stress, mood, optional SpO2/BP)
- [x] 1.3 Unit tests for mapper + trend-bar series extraction from wellness `trends`
- [x] 1.4 TanStack Query hook keyed by wellness date; fetch lazily when the sheet opens

## 2. Wellness Overview sheet UI

- [x] 2.1 Build `WellnessOverviewSheet` (`Modal` pageSheet): title, date, stale treatment, loading/error/retry
- [x] 2.2 Key metrics grid (omit nulls) with compact trend % when history exists
- [x] 2.3 7-day bar charts for Sleep / HRV / RHR (+ Recovery when series non-empty); no new chart library
- [x] 2.4 Read-only coach note from AI text or heuristic fallback; no Analyze/Regenerate CTA
- [x] 2.5 Footer: Check in → Log wellness; Open web → instance wellness/fitness (or dashboard focus)

## 3. Wire Recent Wellness glance

- [x] 3.1 Make glance tiles/body pressable → open overview for `latestWellnessDate` / today
- [x] 3.2 Keep Check in as a separate control that does not open the sheet
- [x] 3.3 Skip or remove inline expand/collapse 7-day bars from `today-wellness-glance` tasks/UI
- [x] 3.4 Ensure overview fetch failure does not break Today behind the sheet

## 4. Docs and verification

- [x] 4.1 Record decisions in `docs/open-questions.md` (overview sheet; trends in sheet not inline)
- [x] 4.2 Manual QA: tap tiles, Check in vs open, stale day, partial metrics, empty AI note, offline/error, recommendation absent with wellness present
- [x] 4.3 Confirm `health:read` covers wellness detail for existing companion sessions
