## Context

Web Today uses **Analyze Readiness** → `POST /api/recommendations/today` (session) to trigger `recommend-today-activity`, then polls status / refetches GET. Mobile GET today is already Bearer (`recommendation:read`); POST and status remain session-only. Empty Today explicitly forbids a fake CTA until generate is real.

REST scopes include `recommendation:read` only — no `recommendation:write`. Accept already uses read-scoped Bearer mutations; generate should follow the same pattern unless coach-wattz introduces a write scope.

## Goals / Non-Goals

**Goals:**
- Real Analyze Readiness on empty Today
- Honest generating / quota / error UX
- Refresh into existing recommendation hero + Accept/Rest

**Non-Goals:**
- AI Daily Coach Check-In questionnaire
- Auto-analyze settings / supporter automation UI
- `/api/recommendations/generate` (score-trend job)
- Inventing Modify alternatives on-device
- New `/api/mobile/today` BFF

## Decisions

1. **Endpoint: `POST /api/recommendations/today`**  
   Matches web Analyze Readiness.  
   *Alternative:* `generate.post.ts` — different job (`generate-recommendations`); wrong product.

2. **Scope: `recommendation:read` for generate (preferred)**  
   Align with accept; avoid IdP scope expansion. Document clearly.  
   *Alternative:* add `recommendation:write` — cleaner semantics, more coach-wattz + re-consent cost.

3. **CTA placement: empty / no-recommendation only (not planned-only hero)**  
   Planned-only hero keeps complete/skip/detail; generate is for “nothing to decide.” Optionally offer secondary regenerate later — out of scope unless product asks.  
   *Alternative:* always show regenerate beside Accept — noisy; defer.

4. **Polling: status + refetch today**  
   Prefer `GET /api/recommendations/status?jobId=` when Bearer-ready; always refetch today on interval/completion. Cap duration (e.g. ~60–90s) then show timeout + Retry. Mirror activity-analysis polling style.

5. **No feedback form in v1 of this change**  
   One-tap generate; web’s optional `userFeedback` refine deferred.  
   *Alternative:* inline note field — skip for morning speed.

6. **Quota: surface 429 copy, do not retry-loop**  
   Same honesty as workout analyze quota.

## Risks / Trade-offs

- **[Risk] Long AI jobs on poor networks** → Mitigation: timeout, keep last empty state, Offline banner separate.
- **[Risk] Double-submit** → Mitigation: disable CTA while generating; server placeholder already exists.
- **[Risk] Status stays session-only longer than POST** → Mitigation: refetch-only fallback on GET today until status is Bearer.

## Migration Plan

1. coach-wattz: Bearer on POST today + status; confirm scope; Official Mobile App.
2. Mobile: mutation + poll helpers; wire empty-state CTA.
3. Update today-home spec language / product-baseline.
4. Rollback: hide CTA; empty state returns to Open web / Retry only.

## Open Questions

- Final scope choice (`recommendation:read` vs new write).
- Whether planned-only hero ever offers “Generate recommendation” as secondary.
- Exact timeout and poll interval (match web store if practical).
