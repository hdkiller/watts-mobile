## Why

v1 store candidate needs brand-complete chrome, privacy strings, and account glue polish — not more product surfaces. Core tabs should already work; this change packages the companion for TestFlight / Play internal tracks.

## What Changes

- App icon, splash, and display name aligned with Coach Watts branding
- Privacy / health data usage strings for store questionnaires
- More tab account glue: instance URL display, notification prefs entry, Open web, sign out
- Lightweight i18n where practical (reuse Tolgee keys / shared copy when available; English-first OK)
- Sentry DSN / release wiring for store builds (no secrets in git)
- **Skip E2E** (Maestro/Detox deferred)

## Capabilities

### New Capabilities

- `store-ready`: Icons, splash, privacy copy checklist, release metadata hooks
- `account-more`: More tab settings/account glue and notification prefs entry points

### Modified Capabilities

- `app-shell`: Ensure More tab hosts account/settings destinations required for store candidate

## Impact

- **watts-mobile:** `app.json` / assets; More screens; env/EAS notes
- **coach-wattz:** None required beyond existing Open web URLs
- **Out of scope:** E2E automation, Phase 4 HealthKit, billing, analytics explorer
