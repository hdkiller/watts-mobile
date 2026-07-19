## Context

Web Today (`TrainingRecommendationCard`) shows **Do Quick Daily Coach Check-In** until today’s AI questionnaire is fully answered (`checkinStore.isCompleted`: every question has an answer). Tapping opens `DailyCheckinModal`, which:

1. `GET /api/checkin/today` (`health:read`)
2. If missing → `POST /api/checkin/generate` (`health:write`, quota `daily_checkin`) → Trigger.dev `generate-daily-checkin`
3. Polls every ~3s while `PENDING` / `PROCESSING`
4. Athlete answers YES/NO per question + optional notes
5. `POST /api/checkin/answer` with `{ checkinId, answers, userNotes }`

Mobile already has Log **wellness** check-in (`POST /api/wellness`) and Active Recovery Context “Check in” → Log. Analyze Readiness is a separate change (`analyze-readiness-generate`).

**Backend gap:** `GET/POST generate/today/history/delete/patch` are Bearer; `POST /api/checkin/answer` still uses session cookies — mobile cannot save answers until coach-wattz migrates it to `requireAuth` + `health:write`.

## Goals / Non-Goals

**Goals:**
- Today CTA + native answer flow matching web’s morning job (generate → answer → done)
- Honest generating / quota / failure / timeout UX
- Clear separation from Log wellness and Analyze Readiness
- Bearer-complete check-in answer path on coach-wattz

**Non-Goals:**
- Web modal extras: recent history browser, delete check-in, remove-question editor, quota upgrade paywall
- Auto-analyze readiness settings
- Merging AI check-in into the Log wellness form
- WebSocket task-run events (poll `GET /api/checkin/today` only)
- New `/api/mobile/*` BFF

## Decisions

1. **Surface: Today primary CTA when incomplete**  
   Place a solid “Do Quick Daily Coach Check-In” (or shorter “Daily Coach Check-In”) above / near the decision area when today’s check-in is not complete — same visibility rule as web (`!isCompleted`). Keep Active Recovery Context “Check in” as Log wellness; rename copy if needed (“Wellness check-in” / “Log wellness”) to avoid collision.  
   *Alternative:* Only inside recovery band — too easy to miss vs web’s prominent button.

2. **UI: modal/sheet route, not inline Today form**  
   Expo Router sheet or stack screen (e.g. `/(app)/daily-checkin`) opened from Today. Keeps Today’s first viewport as one decision composition.  
   *Alternative:* Inline accordion on Today — clutters hero; reject for v1.

3. **APIs: reuse web contracts**  
   - Read: `GET /api/checkin/today`  
   - Generate: `POST /api/checkin/generate` body `{ force?: boolean }`  
   - Save: `POST /api/checkin/answer` body `{ checkinId, answers: Record<id, "YES"|"NO">, userNotes? }`  
   Scopes: `health:read` / `health:write` (already on Official Mobile App).

4. **Completion rule: match web**  
   Completed when questions exist and every question has a non-null answer. Incomplete → show CTA; complete → hide CTA (athlete can still open via a quiet “Edit check-in” later if we add it; not required for v1).

5. **Polling: refetch today every ~3s while pending**  
   Cap ~60–90s then offer Retry / Open web. Mirror activity-analysis / Analyze Readiness patterns. No dependency on web’s `useUserRuns` WebSocket.

6. **coach-wattz: Bearer on answer (required)**  
   Switch `POST /api/checkin/answer` to `requireAuth(event, ['health:write'])` + ownership check via authenticated user id. Preserve JSON question merge behavior.  
   *Note:* Phase-2 docs claimed this was done; current coach-wattz still uses session — treat as prerequisite task.

7. **Answer UX: YES/NO chips + optional notes**  
   Thumb-first; optional “Share anything” notes field. Do not require answering every question before save if web allows partial — match web: send only answered ids; completion CTA hide only when all answered (web store rule). Prefer requiring at least one answer or notes before enabling Save if that matches practical web use; otherwise match web’s Save Answers enabling when a check-in id exists.

8. **Quota: surface 429, no retry-loop**  
   Same honesty as Analyze Readiness / workout analyze. Open web for plan upgrade; no in-app paywall.

## Risks / Trade-offs

- **[Risk] Answer endpoint still session-only** → Mitigation: block mobile CTA behind Bearer smoke; ship coach-wattz first or same PR train.
- **[Risk] Naming collision with Log “check-in”** → Mitigation: distinct CTA labels (“Daily Coach Check-In” vs “Wellness” / Log tab).
- **[Risk] Long AI generation on cellular** → Mitigation: timeout, Retry, keep last state; Offline banner separate.
- **[Risk] Double generate** → Mitigation: disable CTA while pending; server idempotency key already exists.
- **[Trade-off] No history/delete on mobile** → Athletes use Open web for mistakes; acceptable for companion scope.

## Migration Plan

1. coach-wattz: Bearer `POST /api/checkin/answer`; smoke with Official Mobile App token.
2. Mobile: feature module + today query for completion + sheet flow.
3. Wire Today CTA; update today-home / product-baseline language.
4. Rollback: hide Today CTA; Log wellness unchanged.

## Open Questions

- Exact mobile CTA string length (“Do Quick Daily Coach Check-In” vs shorter).
- Whether completed state offers “Edit answers” on Today or only via Open web.
- Whether Save requires all questions answered (stricter than web) for clearer completion.
