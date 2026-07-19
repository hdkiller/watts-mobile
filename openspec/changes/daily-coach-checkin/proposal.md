## Why

On web Today, athletes can run **Do Quick Daily Coach Check-In** — an AI-generated YES/NO questionnaire that feeds recovery context before Analyze Readiness. Mobile Today only deep-links wellness to the Log tab; the AI coach check-in path is still web-only, so the morning companion loop misses a core readiness signal.

## What Changes

- Add a Today entry point for **Daily Coach Check-In** (web copy: “Do Quick Daily Coach Check-In”), shown when today’s AI check-in is incomplete.
- Open a native sheet/screen that: loads today’s check-in (`GET /api/checkin/today`), generates when needed (`POST /api/checkin/generate`), polls until questions are ready, lets the athlete answer YES/NO + optional notes, and saves (`POST /api/checkin/answer`).
- Show honest generating / quota (429) / failure / timeout states; hide or collapse the CTA once all questions for today are answered.
- **coach-wattz:** migrate `POST /api/checkin/answer` from session-cookie to `requireAuth` + `health:write` (generate/today/history/delete already Bearer). Confirm Official Mobile App already has `health:read` / `health:write`.
- Distinguish clearly from Log-tab **wellness** check-in (`POST /api/wellness`) and from **Analyze Readiness** (`analyze-readiness-generate`).

## Capabilities

### New Capabilities

- `daily-coach-checkin`: Today CTA + answer flow for the AI Daily Coach Check-In questionnaire (generate, poll, answer, completion state).

### Modified Capabilities

- `today-home`: Today MAY offer Daily Coach Check-In when incomplete; Active Recovery Context “Check in” remains the Log wellness path (or is labeled distinctly so the two are not confused).
- `log-checkin`: Clarify wellness form is separate from AI Daily Coach Check-In (no requirement to host the questionnaire on Log).

## Impact

- **watts-mobile:** Today CTA, check-in sheet/route under `src/features/checkin/` (or similar), TanStack queries/mutations, docs/baseline.
- **coach-wattz:** Bearer on `POST /api/checkin/answer`; quota errors for `daily_checkin` must remain honest.
- **Out of scope:** Full web modal chrome (recent history browser, delete, remove-question editor, quota paywall upgrade UI), Auto-analyze settings, Analyze Readiness generate (separate change), Log wellness form changes (`quick-checkin-form`).
