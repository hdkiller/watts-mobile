# Play Internal testing — releases & testers

How Coach Watts Android preview builds reach people via **Google Play Internal testing** (not sideload, not EAS). iOS equivalent: TestFlight.

| Item | Value |
|------|--------|
| Package | `com.coachwatts.app` |
| Play app | [Coach Watts dashboard](https://play.google.com/console/u/0/developers/7883910200930974301/app/4976128188579826786/app-dashboard) |
| Internal testing | Console → Coach Watts → **Test and release** → **Internal testing** |
| Upload automation | `pnpm release:android:internal -- --upload-internal` ([../distribution.md](../distribution.md)#version-releases-release-it) |
| Sign-in for human testers / review | Google demo `coachwatts.play.review@gmail.com` — [tasks/008-reviewer-demo-account.md](./tasks/008-reviewer-demo-account.md) |

## How the process works

```text
bump versionCode
    → pnpm release:android:internal -- --version-code N [--upload-internal]
    → signed AAB on Internal track (rolled out)
    → testers already on the email list get an update from Play
    → (later) promote Internal → Production in Console — task 017
```

| Track | Who | Review? | Our use |
|-------|-----|---------|---------|
| **Internal testing** | Up to ~100 email-listed Google accounts | No Google review for the build | Default “preview” channel |
| Closed / Open testing | Wider / public opt-in | Usually reviewed | Optional before prod |
| **Production** | Everyone on Play | Full review | Real ship — [tasks/017-play-production-submit.md](./tasks/017-play-production-submit.md) |

Same package and upload keystore for every track. EAS `preview` APKs are a **different** path (GitHub sideload only).

### Build + upload (eng)

1. Production `.env` (Sentry + Maps; **no** truthy `EXPO_PUBLIC_E2E_*`).
2. New `expo.android.versionCode` every Play upload (Play rejects reuse).
3. Local (or Mac Mini) release:

   ```bash
   # Build + upload + roll out Internal
   pnpm release:android:internal -- --version-code <n> --upload-internal

   # Or upload an existing AAB
   pnpm release:android:internal -- --upload-internal --aab dist/android-internal/foo.aab

   # Draft only (no rollout to testers yet)
   pnpm release:android:internal -- --upload-internal --aab dist/android-internal/foo.aab --draft
   ```

4. Needs gitignored `credentials/android/keystore.properties` + `play-service-account.json` (SA `play-internal-uploader@coach-watts.iam.gserviceaccount.com` with **Release apps to testing tracks**).
5. Prepend `versionName` / `versionCode` to [log.md](./log.md).
6. Smoke on a device — [tasks/016-play-internal-test-smoke.md](./tasks/016-play-internal-test-smoke.md).

Promote to **Production** stays **manual** in Play Console (do not auto-promote from the script).

## Adding a new Internal tester

Testers install from the **Play Store** after opting in. They must use a **Google account** that is on the Internal tester list.

### 1. Add their email in Play Console

1. Open [Coach Watts → Internal testing](https://play.google.com/console/u/0/developers/7883910200930974301/app/4976128188579826786/tracks/internal-testing) (or **Test and release** → **Internal testing**).
2. Open the **Testers** tab (not only Releases).
3. Under email lists:
   - Create or select a list (e.g. `watt-mind-internal`), **or**
   - Use a Google Group the team already manages.
4. Add the tester’s Gmail / Workspace address → **Save**.
5. Copy the **opt-in / join** link shown on that page (share privately — not in git).

Caps: Internal testing allows on the order of **100** testers per app.

### 2. What you send the tester

- The **opt-in link** from Internal testing → Testers.
- Reminder: they must be signed into Play / Chrome with the **same Google account** you listed.
- Optional: demo sign-in notes if they use the shared Google review account ([008](./tasks/008-reviewer-demo-account.md)) — password only via password manager / Console, never git.

### 3. What the tester does

1. Open the opt-in link on an Android device (or desktop, then continue on device).
2. Accept becoming an internal tester for Coach Watts.
3. Open / install **Coach Watts** from the Play Store (Internal track). First install can take a few minutes after opt-in.
4. Updates arrive automatically when you roll out a new Internal release with a higher `versionCode`.

If the track looks “inactive” or they only see a draft app: usually **no emails on the list**, they haven’t accepted the opt-in link, or they’re signed into a different Google account on the device.

### 4. Removing a tester

Internal testing → Testers → remove email from the list (or remove from the Google Group). They lose access to Internal updates; uninstall/reinstall from the public store only applies once the app is in Production.

## License testers (IAP / subscriptions)

For paid products without real charges during Internal/Closed testing:

1. Play Console → **Settings** (or **Monetize** setup) → **License testing**.
2. Add the same Google accounts (or a dedicated list).
3. License response: typically **RESPOND_NORMALLY** for realistic purchase flows.

Product activation and RevenueCat mapping: [tasks/019-paid-agreements-and-products.md](./tasks/019-paid-agreements-and-products.md), [tasks/022-subscription-store-test-review.md](./tasks/022-subscription-store-test-review.md).

## Checklist when onboarding someone new

- [ ] Email added to Internal tester list (or Google Group)
- [ ] Opt-in link sent
- [ ] They accepted opt-in with that Google account
- [ ] They can install/update Coach Watts from Play
- [ ] Sign-in path clear (their Coach Watts account, or demo Google [008](./tasks/008-reviewer-demo-account.md))
- [ ] If testing purchases: also on **License testing** list

## Related

| Doc | Role |
|-----|------|
| [../distribution.md](../distribution.md) | Hub, identifiers, `release:android:internal` |
| [tasks/014-eas-android-credentials.md](./tasks/014-eas-android-credentials.md) | Keystore + Play upload SA |
| [tasks/015-android-production-build.md](./tasks/015-android-production-build.md) | Build/upload task |
| [tasks/016-play-internal-test-smoke.md](./tasks/016-play-internal-test-smoke.md) | Device smoke after install |
| [tasks/017-play-production-submit.md](./tasks/017-play-production-submit.md) | Promote Internal → Production |
