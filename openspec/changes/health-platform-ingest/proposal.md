## Why

Athletes already grant Health Connect / HealthKit access, but the companion only prefills sleep and weight into the Log form — nothing is auto-synced to Coach Watts. That leaves Today’s wellness glance sparse unless the athlete also connects a wearable on web. We need a real, opt-in ingest path (foreground + background) for daily wellness metrics and, in the same capability set, workout activities — with a Settings ledger so athletes can see what was sent, what failed, and retry per item.

## What Changes

- Upgrade Health Sync from “connect + Log prefill” to an **opt-in auto sync** pipeline for Health Connect (Android) and HealthKit (iOS).
- **Two toggles:** master **Sync to Coach Watts** (wellness; default OFF) and nested **Sync workouts** (default ON when master is first enabled; can be turned off independently while wellness stays on).
- Sync **all sensible objective wellness metrics** available from the platform into `POST /api/wellness` (sleep + stages, RHR, HRV, weight, body fat, SpO₂, respiration, VO₂ max, resting/active calories when present). **Do not** invent subjective mood/stress/fatigue from health data.
- **Always push** mapped samples when sync runs — no client-side “skip if Whoop/Garmin already has today.” Merge / source precedence is owned by **coach-wattz** backend.
- Run sync **automatically** on app foreground and via **background** opportunities (platform-appropriate: Health Connect changes / BG fetch / WorkManager-style tasks on Android; Background Delivery / BG App Refresh style hooks on iOS where allowed).
- Add a **Sync history** surface under Settings → Health Sync: per wellness-day and per workout item, show last attempt time, status (`pending` / `synced` / `failed` / `needs_sync`), error summary, and **Retry** / **Sync now**.
- For **workouts**, detect sessions present on-device but not yet confirmed in Coach Watts; upload via `POST /api/workouts/upload-fit` (`workout:write`) with metadata/`rawJson` provenance; track per-session ledger status the same way as wellness.
- Keep existing Log prefill for empty form fields as a convenience; auto sync is independent of tapping Save on the check-in form.
- Update store privacy copy: health data may be uploaded to the athlete’s Coach Watts instance when Health Sync is enabled (not prefill-only).

## Capabilities

### New Capabilities

- `health-platform-sync`: Opt-in Health Connect / HealthKit ingest for daily wellness metrics and workout activities — readers, mapping, orchestrator, foreground + background triggers, Coach Watts upload contracts.
- `health-sync-history`: Local sync ledger and Settings UI — history of sent items, per-item status, retry / force sync, workout presence gap detection.

### Modified Capabilities

- `settings-hub`: Health Sync entry expands beyond connect/status to enable auto sync, last sync summary, and navigation into sync history.
- `store-ready`: Privacy / health data disclosure strings must describe optional upload of health metrics and workouts when Health Sync is enabled.

## Impact

- **Mobile:** new `src/features/health/` (readers, mapper, orchestrator, ledger store, background registration); expand `app/(app)/(tabs)/more/settings/health.tsx` (+ history screen); reuse `@kingstinct/react-native-healthkit` and `react-native-health-connect`; likely `expo-background-fetch` / `expo-task-manager` (or platform equivalents) — **native rebuild** required after adding plugins.
- **APIs (existing coach-wattz):** `POST /api/wellness` (`health:write`), `POST /api/workouts/upload-fit` (`workout:write`), list/read workouts for presence checks (`workout:read`). Client always pushes; **backend** owns conflict/merge with Garmin/Whoop/etc. (may need `lastSource` / provenance follow-up in coach-wattz — tracked as dependency, not blocked for mobile v1 if upsert already accepts writes).
- **Auth scopes:** already request `health:write` + `workout:write`; no new scope expected.
- **Privacy / store:** `docs/store-privacy-checklist.md` and in-app Health Sync copy; App Privacy / Data safety questionnaires.
- **Non-goals for this change:** continuous HR stream upload, writing workouts back into HealthKit/Health Connect, replacing web Connected Apps OAuth, subjective wellness auto-fill, nutrition from health platforms.
