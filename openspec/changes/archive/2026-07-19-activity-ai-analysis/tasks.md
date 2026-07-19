## 1. Auth + docs

- [x] 1.1 Add `workout:write` to `COMPANION_SCOPES` and oauth-setup scope list
- [x] 1.2 Update product-baseline so completed-workout AI analysis is in-app

## 2. Mapping + API

- [x] 2.1 Extend types and `mapWorkoutSummary` for scores + `aiAnalysisJson` / markdown fallback
- [x] 2.2 Add `POST /api/workouts/:id/analyze` client helper
- [x] 2.3 Unit tests for analysis mapping (present, absent, fallback, caps)

## 3. Activity detail UI

- [x] 3.1 Render AI analysis section (scores, summary, sections, recs, strengths/weaknesses)
- [x] 3.2 Wire Analyze/Regenerate mutation + polling while analyzing
- [x] 3.3 Handle 403 / quota / failed states with honest copy + Open web

## 4. Verify

- [x] 4.1 Run mapper unit tests
- [x] 4.2 Lint touched files
