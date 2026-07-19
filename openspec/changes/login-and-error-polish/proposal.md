# Login and Error Polish

## Why

Two store-readiness blockers from the UX review (docs/issues/018.md, docs/issues/001.md): the login screen exposes developer plumbing (OAuth redirect URI, a `pnpm cw:cli` command) to every user, and screens across the app surface raw `error.message` strings from the fetch layer instead of human copy. Both make a store build look broken or unfinished.

## What Changes

- Login screen hides the redirect-URI / CLI registration block unless running in dev (`__DEV__`) or Expo Go; production users see a clean sign-in screen with the Coach Watts wordmark.
- New `friendlyError` mapping in the API layer translates common failure classes (offline, timeout, 401/403, 5xx, unreachable instance) into human copy; raw messages go to Sentry only.
- All screens currently rendering `error instanceof Error ? error.message : …` (Today, activity list/detail, upcoming, notifications, log, planned detail) switch to the friendly copy.

No navigation, auth-flow, or API-contract changes. No coach-wattz backend dependency.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `oauth-pkce`: login screen presentation requirement — developer registration details (redirect URI, CLI instructions) SHALL only render in dev runtimes; production shows brand wordmark and sign-in controls only.
- `api-client`: error surfacing requirement — user-facing query/mutation errors SHALL be mapped to friendly copy by failure class, with raw errors reserved for Sentry.

## Impact

- `app/(auth)/login.tsx` — gate dev block, add wordmark asset.
- New `src/api/errors.ts` (+ tests) — `friendlyError(err, fallback)`.
- Error call sites: `app/(app)/(tabs)/today.tsx`, `app/(app)/(tabs)/log.tsx`, `app/(app)/activity/index.tsx`, `app/(app)/activity/[id].tsx`, `app/(app)/upcoming/index.tsx`, `app/(app)/planned/[id].tsx`, `app/(app)/notifications.tsx`, coach chat error states.
- No new dependencies; wordmark comes from existing brand assets (see `docs/store-checklist.md`).
