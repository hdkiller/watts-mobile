## 1. coach-wattz prerequisites

- [x] 1.1 Decide scope for generate (`recommendation:read` vs new `recommendation:write`) and document on Official Mobile App
- [x] 1.2 Migrate `POST /api/recommendations/today` from session to `requireAuth` + chosen scope (preserve quota behavior)
- [x] 1.3 Migrate `GET /api/recommendations/status` to `requireAuth` + same/compatible scope
- [x] 1.4 Smoke Bearer generate + status against local IdP; note 429 quota path

## 2. Mobile data layer

- [x] 2.1 Add `generateTodayRecommendation()` → `POST /api/recommendations/today`
- [x] 2.2 Add status helper → `GET /api/recommendations/status` (optional jobId)
- [x] 2.3 Wire TanStack mutation + poll/refetch loop with timeout; invalidate today query on completion
- [x] 2.4 Unit tests for poll terminal conditions / error mapping (quota, failure, timeout)

## 3. Today UI

- [x] 3.1 Show Analyze Readiness on empty Today when Bearer generate is available
- [x] 3.2 Generating / quota / failure / timeout states with Retry + Open web
- [x] 3.3 On success, present normal recommendation hero + Accept/Rest (no fake CTA when API unavailable)
- [x] 3.4 Do not add generate as a competing CTA on planned-only hero (unless product later asks)

## 4. Docs and verify

- [x] 4.1 Update product-baseline / open-questions for real Analyze Readiness on mobile
- [x] 4.2 Typecheck / lint; manual smoke empty Today → generate → recommendation appears
