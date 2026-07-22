# 006 — iOS production build + upload (local Xcode)

**Area:** build · **Priority:** high · **Status:** open

**Depends on:** [002](./002-app-store-connect-app.md), [005](./005-eas-credentials-and-secrets.md)

## Preference

Build and upload **on a Mac**: `expo prebuild` → Xcode **Archive** → App Store Connect (Organizer or Transporter). Do **not** use `eas build -p ios` / `eas submit -p ios` for the TestFlight / App Store path.

`ios/` is gitignored — regenerate with prebuild before each release archive when native config changed (or after a clean).

## Goal

Produce a signed App Store IPA and get it into App Store Connect / TestFlight.

## Steps

1. [ ] Bump user-facing version if needed (`pnpm release:patch` / etc., or ensure `app.json` `version` matches what ASC expects — currently `0.1.1`).
2. [ ] Bump iOS **build number** for every new upload (ASC rejects reuse). Set `expo.ios.buildNumber` in `app.json` (string, e.g. `"2"`) before prebuild, **or** bump **Current Project Version** in Xcode after prebuild. Prefer tracking the next build number in [log.md](../log.md).
3. [ ] Confirm production `.env` (no `EXPO_PUBLIC_E2E_*`) — see [005](./005-eas-credentials-and-secrets.md).
4. [ ] Generate native project:
   ```bash
   npx expo prebuild -p ios --clean
   ```
5. [ ] Open the workspace in Xcode (`ios/*.xcworkspace`), select team **Watt Mind Kft.** (`42K8S6866N`) for the app + `com.coachwatts.app.todaywidget`, Automatic Signing.
6. [ ] Destination: **Any iOS Device (arm64)**. Product → **Archive**.
7. [ ] Organizer → **Distribute App** → App Store Connect → Upload  
   (or export IPA and upload with **Transporter**).
8. [ ] Wait for ASC processing; confirm the build appears under TestFlight.
9. [ ] Log marketing version + build number (and optional archive date) in [log.md](../log.md) — no EAS URL required.

## Verify after binary lands

- [ ] Cold start: Coach Watts splash (not Expo chevron) — [../../store-checklist.md](../../store-checklist.md)
- [ ] Home screen icon branded

## Done when

- A production build is available in TestFlight for internal testers.
