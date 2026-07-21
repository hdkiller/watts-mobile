## 1. Foundations

- [x] 1.1 Create `src/features/health/` module skeleton (types, readers, mapper, orchestrator, ledger, uploaders) without wiring UI yet
- [x] 1.2 Add sync preferences persisted per account/instance: master Sync to Coach Watts (default OFF) and Sync workouts sub-toggle (default ON when master first enabled); clear on sign-out
- [x] 1.3 Implement sync ledger store (statuses, timestamps, errors, retention cap, sign-out clear) with unit-testable pure helpers
- [x] 1.4 Confirm coach-wattz wellness `lastSource` / provenance behavior; file backend follow-up if mobile cannot stamp `healthkit` / `health_connect`

## 2. Platform readers (wellness)

- [x] 2.1 Extend Health Connect reader beyond prefill: sleep(+stages), RHR, HRV, weight, body fat, SpO₂, respiration, VO₂ max, calories for lookback window
- [x] 2.2 Extend HealthKit reader with the same metric set; map HRV to `hrv` vs `hrvSdnn` correctly
- [x] 2.3 Reuse/share sleep interval merge-dedupe from Log prefill; add shared DTO → `WellnessUploadPayload` mapper with `rawJson` provenance
- [x] 2.4 Expand health auth permission requests to cover the v1 sync metric set (and workouts in §5) when enabling sync

## 3. Wellness sync pipeline

- [x] 3.1 Implement wellness uploader calling existing `POST /api/wellness` (`health:write`) and updating ledger per date
- [x] 3.2 Implement orchestrator single-flight sync pass (due dates since watermark / lookback) that always pushes mapped days
- [x] 3.3 Hook foreground / AppState active trigger when sync enabled + authenticated
- [x] 3.4 Add background task registration (expo-background-fetch / task-manager or platform equivalent); unregister on disable; document native rebuild in `docs/native-modules.md` notes if plugins change
- [x] 3.5 Keep Log prefill behavior working when sync is off or on (prefill must not imply upload)

## 4. Settings UI + history

- [x] 4.1 Upgrade Health Sync screen: Sync to Coach Watts master toggle, nested Sync workouts sub-toggle (default ON when master first enabled), disclosure copy, last successful sync time, entry to Sync history
- [x] 4.2 Build Sync history screen: newest-first list, status badges, filters (All / Failed / Needs sync), empty state
- [x] 4.3 Wire per-item Retry and global Sync now to orchestrator; reflect `syncing` / terminal statuses live
- [x] 4.4 Update `settings-hub` navigation routes for history under Health Sync

## 5. Workout sync

- [x] 5.1 Implement platform workout session readers (lookback default 14 days) and ledger seeding (`needs_sync`)
- [x] 5.2 Implement Coach Watts presence match against `GET /api/workouts` (start time ± tolerance + sport/duration when available)
- [x] 5.3 Implement minimal FIT builder from session summary (+ optional streams if readily available) and `POST /api/workouts/upload-fit` uploader with metadata provenance
- [x] 5.4 Integrate workouts into orchestrator + history rows (retry / needs_sync / synced with `remoteWorkoutId`)
- [x] 5.5 Persist Sync workouts preference; gate workout discovery/upload on master + sub-toggle; keep wellness sync when workouts sub-toggle is off

## 6. Privacy, docs, verification

- [x] 6.1 Update `docs/store-privacy-checklist.md` Health Sync section for opt-in upload (not prefill-only)
- [x] 6.2 Update product baseline / implementation-plan checklist item for HealthKit / Health Connect ingest
- [x] 6.3 Ensure Sentry/analytics never log metric values; only status/kind counts
- [ ] 6.4 Manual verify Android: enable sync → wellness appears on instance → fail network → Retry from history succeeds
- [ ] 6.5 Manual verify iOS parity for wellness + history
- [ ] 6.6 Manual verify workout: on-device session → needs_sync → upload → synced; already-on-server session does not duplicate
- [ ] 6.7 Rebuild dev clients after native module/plugin changes and smoke Health Sync settings
