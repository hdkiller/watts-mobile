# 015 — Android production AAB + upload (local Gradle)

**Area:** build · **Priority:** medium · **Status:** in-progress

**Depends on:** [011](./011-play-console-app.md), [014](./014-eas-android-credentials.md)

## Preference

Build the Play AAB **locally**: `expo prebuild -p android` → configure upload signing → `./gradlew bundleRelease` → upload in Play Console. Do **not** use `eas build -p android` / `eas submit -p android` for the Internal / production path.

Sideload GitHub APKs: prefer `pnpm release:android:github -- --local` or `-- --apk path/to/app.apk` over cloud EAS ([../../distribution.md](../../distribution.md)#version-releases-release-it).

## Goal

Produce a signed Play AAB and land it on an internal/closed testing track.

## Steps

1. [ ] Bump user-facing version if needed (`pnpm release:patch` / etc.; `app.json` `version` is currently `0.1.1`).
2. [ ] Bump Android **versionCode** for every new Play upload (Play rejects reuse). Set `expo.android.versionCode` in `app.json` (integer) before prebuild, **or** bump `versionCode` in Gradle after prebuild. Log the next code in [log.md](../log.md).
3. [ ] Confirm production `.env` (Sentry + Maps; no `EXPO_PUBLIC_E2E_*`) — see [014](./014-eas-android-credentials.md).
4. [ ] Generate native project:
   ```bash
   npx expo prebuild -p android --clean
   ```
5. [ ] Wire upload-keystore signing (Android Studio signed bundle, or gitignored `keystore.properties` / signingConfigs) — [014](./014-eas-android-credentials.md).
6. [ ] Build the release AAB:
   ```bash
   cd android && ./gradlew bundleRelease
   ```
   Artifact: `android/app/build/outputs/bundle/release/app-release.aab` (path may vary slightly by Expo template).
7. [ ] Play Console → Coach Watts → **Internal testing** → create/update release → upload AAB → roll out to internal testers.
8. [ ] Log `versionName` + `versionCode` (and optional AAB path/date) in [log.md](../log.md) — no EAS URL required.
9. [ ] Verify adaptive icon + splash on a physical device ([../../store-checklist.md](../../store-checklist.md)); notification accent `#00DC82` after notifications plugin rebuild.

## Done when

- AAB is on Internal testing and installable by testers.
