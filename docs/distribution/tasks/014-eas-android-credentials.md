# 014 — EAS Android credentials & Play submit setup

**Area:** build · **Priority:** medium · **Status:** open

**Depends on:** [010](./010-google-play-developer-account.md), [005](./005-eas-credentials-and-secrets.md) (shared Sentry secrets)

## Goal

EAS can sign Android production AABs and optionally submit to Play Console.

## Steps

1. [ ] `eas credentials -p android` (or first production Android build): create/upload keystore managed by EAS (prefer EAS-managed unless company policy requires a local keystore in the password manager).
2. [ ] Confirm production env has `EXPO_PUBLIC_SENTRY_DSN` (same as iOS — task 005).
3. [ ] Confirm no `EXPO_PUBLIC_E2E_*` on production Android builds ([../../e2e.md](../../e2e.md)).
4. [ ] For `eas submit -p android`: create a Play Console **service account** with access to the Coach Watts app; download JSON key → store as EAS secret / local path outside git (never commit).
5. [ ] Optional: set `android.config.googleMaps.apiKey` (or EAS secret) if release map tiles are blank ([../../native-modules.md](../../native-modules.md)).
6. [ ] After first upload: copy **App signing** + **upload** cert SHA-256 into coach-wattz `assetlinks.json` for `https://coachwatts.com/go/*` ([../../deep-links.md](../../deep-links.md)).

## Done when

- Android signing credentials exist in EAS; Play submit path documented; assetlinks fingerprints noted when available.
