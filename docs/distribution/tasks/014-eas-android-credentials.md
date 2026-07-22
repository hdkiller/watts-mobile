# 014 — Android signing & production env (local)

**Area:** build · **Priority:** medium · **Status:** open

**Depends on:** [010](./010-google-play-developer-account.md), [005](./005-eas-credentials-and-secrets.md) (shared local Sentry / Maps env)

## Preference

**Play / Internal testing AABs are built on this machine** (`expo prebuild` → Gradle `bundleRelease` → Play Console upload). Do **not** use EAS cloud (`eas build` / `eas submit`) for Android store binaries unless explicitly chosen later as a fallback.

`android/` is gitignored — regenerate with prebuild before release bundles when native config changed.

## Goal

A Watt Mind **upload keystore** exists outside git, local production env is set, and Play can accept manually uploaded AABs.

## Steps

1. [ ] Create an **upload keystore** for `com.coachwatts.app` (one-time). Keep the `.jks` / `.keystore` + passwords in the company password manager — **never commit**.
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore coach-watts-upload.keystore \
     -alias coach-watts -keyalg RSA -keysize 2048 -validity 10000
   ```
2. [ ] After first Play upload: confirm Play App Signing is enabled (Google holds the app-signing key; you keep the upload key). Copy **App signing** + **upload** cert SHA-256 into coach-wattz `assetlinks.json` for `https://coachwatts.com/go/*` ([../../deep-links.md](../../deep-links.md)).
3. [ ] Confirm local `.env` for store builds has:
   - `EXPO_PUBLIC_SENTRY_DSN`
   - `GOOGLE_MAPS_API_KEY` **and** `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` (required for Android maps — [../../native-modules.md](../../native-modules.md))
   - Hosted OAuth fallbacks via `app.json` `extra` (or explicit `EXPO_PUBLIC_*`)
   - **No** `EXPO_PUBLIC_E2E_*` ([../../e2e.md](../../e2e.md))
4. [ ] Document how signing is wired after prebuild (pick one; keep paths out of git):
   - **Android Studio:** Build → Generate Signed Bundle / APK (select the upload keystore), or
   - **Gradle:** gitignored `android/keystore.properties` (or equivalent) pointed at the upload keystore and referenced from the app `build.gradle` signingConfigs after prebuild
5. [ ] Optional: Play Console API service account JSON for automation later — store outside git. Not required for manual Internal testing uploads.
6. [ ] Document secret *names* (not values) in [log.md](../log.md) when the local release env + keystore location are confirmed.

## Done when

- Upload keystore is in the password manager; local `.env` has Sentry + Maps keys and no e2e flags; signing path for `bundleRelease` is known.
