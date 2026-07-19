## 1. Brand assets

- [x] 1.1 Add Coach Watts icon + splash assets
- [x] 1.2 Wire assets in app config for iOS/Android
- [ ] 1.3 Verify launch branding on device build
  - Steps: build a dev client or preview (`eas build -p ios --profile development` / `npx expo run:ios`), cold-start the app, confirm Coach Watts shield splash on `#09090b` (not Expo chevron), and confirm home-screen / adaptive icon matches `assets/images/icon.png`.

## 2. Account / More polish

- [x] 2.1 Flesh More tab: instance URL, notifications entry, open web, sign out
- [x] 2.2 Notification prefs entry (OS settings and/or web)
- [x] 2.3 Ensure app-shell More is no longer a bare placeholder

## 3. Store metadata + observability

- [x] 3.1 Add privacy/health questionnaire strings checklist in docs
- [x] 3.2 Wire Sentry for release via env/EAS (no secrets in git)
- [x] 3.3 English-first i18n footing or key extraction pass where cheap

## 4. Verify

- [x] 4.1 Typecheck
- [x] 4.2 Store checklist reviewed (icons, privacy, Sentry) — see `docs/store-checklist.md` (device splash + Console paste remain manual)
- [x] 4.3 Update implementation-plan Phase 3 polish checkboxes (E2E remains deferred)
