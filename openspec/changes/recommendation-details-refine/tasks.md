## 1. Data mapping

- [x] 1.1 Extend `ActivityRecommendationApi` / detail types for `key_factors`, `planned_workout` originals, and full `suggested_modifications` (duration/TSS/title/description)
- [x] 1.2 Add `mapRecommendationDetail` (or extend `mapTodayPayload`) and unit tests for Why?, factors, original plan, suggested changes
- [x] 1.3 Confirm live `GET /api/recommendations/today` includes those fields; note any coach-wattz gap

## 2. Detail sheet

- [x] 2.1 Build `RecommendationDetailSheet` mirroring web sections (badge, confidence %, Why?, Recovery Context from Active Recovery, Key Factors, Original Plan, Suggested Changes)
- [x] 2.2 Wire Accept Changes to existing accept mutation; close/refresh on success
- [x] 2.3 Add View Details secondary CTA on Today when a recommendation exists

## 3. Refine or Refresh sheet

- [x] 3.1 Build `RefineRecommendationSheet` with optional feedback, web copy (title/description/placeholder), and Refine Plan vs Refresh Data button label
- [x] 3.2 Submit via existing `generateTodayRecommendation(userFeedback?)`; empty → no feedback field
- [x] 3.3 Reuse Analyze Readiness generating / poll / timeout / 429 UX; share single in-flight lock
- [x] 3.4 Add Refine secondary CTA on Today when a recommendation exists

## 4. Polish and verification

- [x] 4.1 Disable View Details / Refine / Accept / Analyze while generate is in flight
- [x] 4.2 Manual check: rest-day detail, modify+accept from sheet, empty refresh, feedback refine, quota path
- [x] 4.3 Update `docs/open-questions.md` only if a decision lands (deep link → detail sheet, check-in summary in detail)
