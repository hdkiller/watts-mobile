## 1. coach-wattz prerequisites

- [x] 1.1 Migrate `POST /api/checkin/answer` from session to `requireAuth` + `health:write` (preserve question-merge + ownership checks)
- [x] 1.2 Smoke Bearer today → generate → answer against local IdP with Official Mobile App token; note 429 quota path for `daily_checkin`

## 2. Mobile data layer

- [x] 2.1 Add check-in API helpers: `GET /api/checkin/today`, `POST /api/checkin/generate`, `POST /api/checkin/answer`
- [x] 2.2 Add TanStack query for today check-in + `isCompleted` helper (all questions answered)
- [x] 2.3 Wire generate mutation + poll/refetch loop with timeout; invalidate on completion
- [x] 2.4 Wire answer mutation; invalidate today check-in + recovery context queries on success
- [x] 2.5 Unit tests for completion rule, poll terminal conditions, quota/error mapping

## 3. Check-in UI

- [x] 3.1 Add sheet/stack route for Daily Coach Check-In (YES/NO chips, optional notes, Save)
- [x] 3.2 Generating / quota / failure / timeout states with Retry + Open web
- [x] 3.3 Prefill answers when today already has partial/complete questions

## 4. Today integration

- [x] 4.1 Show Daily Coach Check-In CTA on Today when incomplete and Bearer APIs available
- [x] 4.2 Hide incomplete CTA when completed; keep Accept / Rest / Analyze Readiness distinct
- [x] 4.3 Keep Active Recovery Context “Check in” as Log wellness; clarify copy if needed to avoid collision

## 5. Docs and verify

- [x] 5.1 Update product-baseline / open-questions for Daily Coach Check-In vs wellness Log
- [x] 5.2 Typecheck / lint; manual smoke Today → generate → answer → CTA hides
