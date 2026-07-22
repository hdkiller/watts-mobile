## Why

coach-wattz now persists and enforces mobile push preferences (`GET/PUT /api/mobile/devices/preferences`, send-time gates). The app already calls those endpoints but still treats SecureStore as a soft source of truth, defaults `SYNC_COMPLETED` to on (server policy-off defaults it off), and still shows a Sync Status toggle that should not promise OS pushes. Athletes need Settings toggles to match what the server will actually send.

## What Changes

- Treat server preferences as authoritative when the prefs API is available; keep SecureStore as cache/offline fallback only.
- Align client defaults with server: `SYNC_COMPLETED` default **false**; hide or permanently disable the Sync Status toggle (policy-off / issue 367).
- Surface clear save failures when PUT fails (do not silently claim success from local-only write).
- Optionally include current prefs on `POST /api/mobile/devices` registration for first-device consistency.
- Copy: Settings describes account-level push prefs (all devices), not “this device only,” once server-backed.
- Non-goals: wiring new Expo senders (366), email prefs UI, changing channel matrix policy.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `push-registration`: Prefs sync via documented GET/PUT; registration MAY send preferences; offline/404 fallback remains honest.
- `settings-hub`: Notification preferences screen reflects server-backed toggles; Sync Status not offered as an active OS-push control.

## Impact

- **Mobile:** `src/features/notifications/api.ts`, Settings `notifications.tsx`, defaults/types/tests.
- **coach-wattz:** Already shipped 364/365 (+ mobile-safe inbox paths). No further backend required for this change.
- **Policy:** `~/Develop/watts-marketing/knowledge/push/channel-matrix-pu-001.md`
