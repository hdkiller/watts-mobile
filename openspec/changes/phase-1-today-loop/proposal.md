## Why

Phase 0 auth is unblocked. Athletes still land on an empty Today tab — the companion’s core job (see today’s recommendation and decide accept / modify / rest) is not shipped yet.

## What Changes

- Build the Today screen: recommendation hero, planned workout summary, recovery strip, primary CTAs
- Compose today data from existing coach-wattz endpoints (until `/api/mobile/today` exists)
- Wire recommendation actions (accept / rest-skip) once Bearer-capable
- Add planned workout detail stack screen
- Empty / loading / error states for the morning path
- **coach-wattz dependency:** migrate recommendation accept/dismiss (and related mutations) from session-cookie-only to `requireAuth` + Bearer scopes so the public mobile client can call them

## Capabilities

### New Capabilities

- `today-home`: Today tab composition UI and morning decision CTAs
- `today-data`: Client mappers + TanStack Query for recommendation / planned workout / recovery strip
- `recommendation-actions`: Accept / rest-skip / navigate-to-modify flows from Today

### Modified Capabilities

- _(none in archived specs — Phase 0 not yet archived into `openspec/specs/`)_

## Impact

- **watts-mobile:** Today tab + detail route; API helpers under `src/features/today/`
- **coach-wattz (required):** Bearer auth on recommendation mutation routes (`accept`, dismiss/patch); optional later `GET /api/mobile/today` aggregate
- **Out of scope:** Log check-in, chat, push, analytics explorer, plan architect
