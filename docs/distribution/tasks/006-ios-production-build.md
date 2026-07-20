# 006 — iOS production build + upload

**Area:** build · **Priority:** high · **Status:** open

**Depends on:** [002](./002-app-store-connect-app.md), [005](./005-eas-credentials-and-secrets.md)

## Goal

Produce a signed App Store IPA and get it into App Store Connect / TestFlight.

## Steps

1. [ ] Bump version / build as needed (`app.json` `version` is currently `0.1.0`; EAS `appVersionSource: remote` — follow Expo remote versioning practice).
2. [ ] Build: `eas build -p ios --profile production`
3. [ ] On success, submit: `eas submit -p ios --profile production` (or upload IPA via Transporter / ASC).
4. [ ] Wait for ASC processing; confirm build appears under TestFlight.
5. [ ] Log build number + EAS build URL in [log.md](../log.md).

## Verify after binary lands

- [ ] Cold start: Coach Watts splash (not Expo chevron) — [../../store-checklist.md](../../store-checklist.md)
- [ ] Home screen icon branded

## Done when

- A production build is available in TestFlight for internal testers.
