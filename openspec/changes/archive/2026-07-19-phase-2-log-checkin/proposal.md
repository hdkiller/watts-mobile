## Why

Athletes need a fast mobile check-in (sleep / feel / notes) without opening the web dashboard. Phase 1 Today is in place; Log is the next tab in the daily loop.

## What Changes

- Build the Log tab form: feel/readiness, sleep quality + duration, optional notes and weight
- Persist via `POST /api/wellness` with Bearer `health:write`
- Load today’s wellness/check-in context when available (`health:read`)
- Ensure related check-in answer endpoint supports Bearer (coach-wattz)
- Soft success confirmation and return affordance to Today

## Capabilities

### New Capabilities

- `log-checkin`: Log tab form UI and save flow for wellness check-in

### Modified Capabilities

- _(none)_

## Impact

- **watts-mobile:** Log tab + `src/features/log/`
- **coach-wattz:** `POST /api/checkin/answer` already switched to `requireAuth` + `health:write`; wellness POST already Bearer-capable
- **Out of scope:** Push notifications, offline queue hardening, HealthKit
