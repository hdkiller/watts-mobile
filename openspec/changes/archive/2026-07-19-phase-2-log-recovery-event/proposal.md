## Why

Live Coach Watts treats **Log recovery event** (journey events: illness, fatigue, sleep, etc.) as first-class context for recommendations. Mobile Log only ships daily wellness metrics (`POST /api/wellness`), so athletes cannot capture the same field context in-app. APIs are already Bearer-ready — parity should land before push work.

## What Changes

- Add recovery-event create flow matching web: category/type chips, severity, time presets, description
- Show today’s active recovery context (from `GET /api/recovery-context`) on Log (and optional Today CTA)
- Persist via `POST /api/recovery-context/journey` (`health:write`)
- Support edit/delete of the athlete’s own manual journey events (PATCH/DELETE) for parity with web slideover
- Keep wellness check-in as a separate Log job (do not merge into one form)
- Update product baseline so Log = wellness **and** recovery events

## Capabilities

### New Capabilities

- `log-recovery-event`: Create/list/edit/delete recovery (journey) events; active-today context; parity with web event taxonomy

### Modified Capabilities

- `log-checkin`: Clarify Log tab hosts two write jobs — wellness check-in and recovery events — without changing wellness field requirements
- `today-home`: Optional “Log event” affordance that opens the recovery-event flow (must not crowd the morning decision)

## Impact

- **watts-mobile:** Log tab dual surface; `src/features/recovery/` (or under log); optional Today CTA
- **coach-wattz:** No new endpoints required — `GET /api/recovery-context` (`health:read`), `POST/PATCH/DELETE /api/recovery-context/journey*` (`health:write`) already use `requireAuth`
- **Out of scope:** Full Recovery page / timeline, nutrition metabolic charts, imported (read-only) editing, offline queue for events
