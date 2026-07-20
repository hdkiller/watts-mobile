## Why

When there is no recommendation and no planned workout, Today can only Retry or Open web — athletes cannot trigger **Analyze Readiness** in the companion even though web already does via `POST /api/recommendations/today`. The empty state explicitly forbade a fake CTA until a real Bearer generate path exists; that is the next gap.

## What Changes

- Add a real **Analyze Readiness** (generate today’s recommendation) action on Today’s empty / no-recommendation states, wired to `POST /api/recommendations/today`.
- Show honest generating / quota / failure states; poll or refetch until a recommendation appears (reuse web’s status patterns via `GET /api/recommendations/status` and/or refetch `GET /api/recommendations/today`).
- Optional short feedback field only if product wants parity with web refine — default is one-tap generate without a form.
- **coach-wattz:** migrate `POST /api/recommendations/today` and `GET /api/recommendations/status` from session-cookie-only to `requireAuth` + scopes. REST today has `recommendation:read` only (no `recommendation:write`); prefer authorizing generate under `recommendation:read` (same as accept) **or** add `recommendation:write` to `REST_OAUTH_SCOPES` + Official Mobile App — decide in design and document.
- Update `today-home` / product baseline so empty Today may offer a real generate CTA; keep Open web for deep refine / automation settings.
- Do **not** port the AI Daily Coach Check-In questionnaire or full web Analyze Readiness chrome.

## Capabilities

### New Capabilities

- `analyze-readiness`: Trigger daily activity-recommendation generation from Today, with generating/quota/error UX and refresh into the existing recommendation hero.

### Modified Capabilities

- `today-home`: Empty / no-recommendation states MAY show Analyze Readiness when the Bearer generate API is available; MUST still avoid fake CTAs if the endpoint is unavailable.
- `today-data`: Client helpers for generate + status/poll alongside existing today recommendation query.
- `recommendation-actions`: Clarify generate is a separate mutation from Accept / Rest (does not replace them).
- `oauth-pkce`: Only if a new write scope is added; otherwise no scope delta beyond documenting `recommendation:read` for generate.

## Impact

- **watts-mobile:** Today empty/hero CTAs, `src/features/today/` generate mutation + polling, docs.
- **coach-wattz:** Bearer on generate + status; quota errors must remain honest (429).
- **Out of scope:** Auto-analyze settings UI, score-explanation chain UI, Modify alternative invention, full check-in questionnaire, `/api/recommendations/generate` (score-trend job — different product surface).
