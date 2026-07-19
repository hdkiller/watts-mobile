## Context

Completed workout AI analysis is persisted on the Workout row (`aiAnalysisJson`, scores, `aiAnalysisStatus`). There is no separate GET-analysis endpoint. Analyze and regenerate share `POST /api/workouts/:id/analyze` (async Trigger job) and require `workout:write`.

Mobile already fetches detail with `includeStreams=false` but drops analysis fields. Product baseline previously sent “deep analysis” to web; that is revised so the AI write-up is first-class on mobile.

## Goals / Non-Goals

**Goals:**

- Map and render cached AI analysis on activity detail.
- Show honest status while analyzing; poll/refetch after Analyze/Regenerate.
- Enable analyze/regenerate with `workout:write` in the companion scope string.
- Keep the section thumb-friendly: scores + summary + compact sections/recs — not the full web analysis dashboard.

**Non-Goals:**

- Stream charts, power curve, map, intervals audit.
- Plan-adherence analyze (session-only API).
- analysisFacts / analysisFactsV2 panels.
- Publish summary to Intervals.

## Decisions

1. **Single GET remains the source of truth**
   - Extend `WorkoutSummaryApi` / `mapWorkoutSummary` to extract analysis view model.
   - Prefer `aiAnalysisJson`; fall back to `aiAnalysis` markdown string when JSON absent but status COMPLETED.

2. **View model for UI**
   - `analysis: null | { status, overallScore, scores[], executiveSummary, sections[], recommendations[], strengths[], weaknesses[], analyzedAt, markdownFallback }`
   - Cap sections to 6, recommendations to 5, strength/weakness bullets to 5 each for mobile density.
   - Score chips: overall + technical / effort / pacing / execution when present (top-level workout columns preferred over nested JSON scores).

3. **Analyze mutation + polling**
   - `POST /api/workouts/:id/analyze` then invalidate detail query.
   - While status is PENDING/PROCESSING, `refetchInterval` ~3s on the detail query (stop on COMPLETED/FAILED/QUOTA_EXCEEDED or unmount).
   - Same CTA label: Analyze when not completed; Regenerate when completed.

4. **Scope: add `workout:write`**
   - Update `COMPANION_SCOPES` + oauth-setup docs.
   - If analyze returns 403, show clear copy: sign out / sign in again to grant analysis permission (or Open web).

5. **Product docs**
   - Update `docs/product-baseline.md` so completed-workout AI analysis is in-app; charts/streams remain web escape.

## Risks / Trade-offs

- **[Risk] Existing tokens lack `workout:write`** → Mitigation: read path works; mutate path explains re-consent; Open web still works.
- **[Risk] Large `aiAnalysisJson` payload** → Mitigation: still one GET; map/truncate in client; streams remain off.
- **[Risk] Polling battery** → Mitigation: poll only while analyzing and screen mounted; 3s interval.
- **[Risk] Quota 429 / QUOTA_EXCEEDED** → Mitigation: honest banner + Open web.

## Migration Plan

- Client + scope string only. Users re-consent on next login if IdP requires incremental consent.
- Rollback: revert mapper/UI/scope; cached analysis still on server.

## Open Questions

- None blocking. Charts/streams remain a separate follow-up change.
