# Design — Login and Error Polish

## Context

`app/(auth)/login.tsx` unconditionally renders the OAuth redirect URI plus Expo Go CLI registration guidance — needed during development, harmful in a store build. Separately, ~8 screens render raw `Error.message` from `src/api/client.ts` fetch failures; messages like `Network request failed` or JSON parse errors reach end users.

## Goals / Non-Goals

**Goals:**
- Production login screen shows only brand + sign-in + instance selector.
- One shared mapping from thrown errors to human copy, applied at every user-facing error site.

**Non-Goals:**
- No auth-flow, scope, or token changes.
- No retry/backoff behavior changes; only presentation.
- No localization pass (English copy now; Tolgee reuse later per baseline).

## Decisions

1. **Gate, don't delete, the dev block.** Render the redirect-URI/CLI section only when `__DEV__ || isExpoGoRuntime()`. Rationale: the block exists for a real workflow (registering the exp:// URI); gating keeps it where it helps. Alternative (an "Advanced" disclosure in prod) rejected — no production user can act on it.
2. **Map at render, not at throw.** `friendlyError(err, fallback)` lives in `src/api/errors.ts` and is called where errors render, keeping `ApiError` (status, body) intact for logic like `AnalyzeWorkoutError` and Sentry. Alternative (throwing pre-translated messages from `client.ts`) rejected — loses status/body information callers rely on.
3. **Classify by shape, not string.** Priority order: `ApiError` with status (401/403 → session copy; 404 → not-found copy; ≥500 → server copy), `TypeError`/`Network request failed` → connectivity copy, `AbortError`/timeout → timeout copy, else `fallback`. Copy mentions "your Coach Watts instance" because self-hosted URLs are first-class.
4. **Wordmark as local asset.** Static PNG/SVG from brand assets in `assets/`; no remote fetch on an unauthenticated screen.

## Risks / Trade-offs

- [Over-friendly copy hides actionable detail] → Keep the HTTP status in parentheses for 5xx ("Server error (502)"); full error still goes to Sentry.
- [Call-site sweep misses a screen] → Grep gate in review: no `error.message` may reach a `<Text>` outside dev screens.

## Open Questions

- None blocking. Wordmark asset choice follows `docs/store-checklist.md`.
