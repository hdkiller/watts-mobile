## Why

Athletes need timely awareness when a recommendation or analysis is ready, and an in-app inbox that deep-links into useful surfaces — not a dead list. Auth, Today, and Log are in place; push + notifications complete Phase 2.

## What Changes

- In-app notifications inbox (list + mark one / mark all read)
- Expo push permission + token acquisition
- Register device with coach-wattz (`POST /api/mobile/devices`)
- Handle first push event types with deep-link stubs (full routing in `phase-3-deep-links`)
- Unread badge affordance on More (or inbox entry)
- **coach-wattz:** Bearer auth on `GET/PATCH /api/notifications*`; ship `POST /api/mobile/devices` + push send hooks for initial event types

## Capabilities

### New Capabilities

- `notifications-inbox`: List notifications, mark read, empty/loading/error states
- `push-registration`: Expo push token, permission UX, device registration with the instance
- `push-handling`: Receive push payloads and route (or stub-route) to Today / detail / chat

### Modified Capabilities

- _(none)_

## Impact

- **watts-mobile:** More → Notifications stack; Expo Notifications wiring; `src/features/notifications/`
- **coach-wattz (required):** Notifications routes currently session-cookie-only — need `requireAuth` for Bearer; new device registration + Expo push send path
- **Out of scope:** Soft offline check-in queue hardening, Coach chat UI, universal links host association, E2E
