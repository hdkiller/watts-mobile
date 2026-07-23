# Distribution progress log

Append-only history. **Newest entries at the top.** Do not edit past entries except for a short `Correction:` line under them.

Format:

```md
## YYYY-MM-DD — short title

- What happened / decided
- Links to tasks or PRs if useful
- Owner (optional)
```

---

## 2026-07-23 — Maestro companion e2e suite + CI smoke gate

- Expanded [e2e.md](../e2e.md) for coach-wattz e2e stack (`:3199` + `POST /api/__e2e/token`), selector convention, companion flows, mutation/`e2e:reset` notes, and manual/sandbox matrix.
- Added Maestro flows under `maestro/flow-*.yaml` (Today/Log/Coach/More open paths, wellness save, recommendation accept when CTA present, scheme deep links).
- Wired [`.github/workflows/e2e-smoke.yml`](../../.github/workflows/e2e-smoke.yml): PR validates flow files; `workflow_dispatch` runs iOS `smoke-unauth` (+ optional `smoke-shell` with secrets).

## 2026-07-23 — Play / tester Google demo Gmail created

- Created Google demo account **`coachwatts.play.review@gmail.com`** for Play review and Google OAuth sign-in by testers (TestFlight ALPHA / Play internal).
- Password locations (not git): Watt Mind password manager, Play Console Sign in details, and ASC TestFlight → Test Information → Beta App Review Sign-In — see [008](./tasks/008-reviewer-demo-account.md).
- ASC Test Information Sign-In + Review Notes saved 2026-07-23 (username `coachwatts.play.review@gmail.com`).
- Still needed: one hosted Google OAuth login to seed the athlete on `https://coachwatts.com`.

## 2026-07-23 — Store marketing captured as distribution tasks

- Confirmed listing/marketing work belongs under distribution (not `docs/issues/`): expanded [004](./tasks/004-listing-metadata-assets.md) + [013](./tasks/013-play-listing-assets.md); added optional [023](./tasks/023-store-page-stellar-polish.md); subscription review marketing stays on [022](./tasks/022-subscription-store-test-review.md).

## 2026-07-23 — Play commerce loose ends + Apple Paid Apps status check

- **Play payout:** Erste HUF bank added on payments profile (HU…4237) — Verification pending (micro-deposit).
- **Play 15% fee:** Account group “Watt Mind Korlátolt Felelősségű Társaság” created (no other ADAs); enrolled for 15% service fee.
- **Play benefits:** Added EN benefits on `coachwatts_supporter` and `coachwatts_pro` (still Draft base plans).
- **Apple check:** Paid Apps Agreement is no longer blocked on entity verify — status **Pending User Info**. Tax forms Active. Banks on file (Revolut EUR + Erste HUF) both Pending User Info. **Add user info** / bank-holder compliance screening still fails with ASC server error after PDF upload — iOS IAP commerce remains blocked until that clears. See [019](./tasks/019-paid-agreements-and-products.md).

## 2026-07-23 — Play RTDN connected + credentials valid

- Upgraded SA IAM to `roles/pubsub.admin` (+ existing `monitoring.viewer`); Pub/Sub API enabled on GCP project `coach-watts`.
- RevenueCat Google developer notifications **Connected** to `projects/coach-watts/topics/Play-Store-Notifications`. Play Monetization setup RTDN enabled (subscriptions/voided/one-time); granted `google-play-developer-notifications@system.gserviceaccount.com` Pub/Sub Publisher on topic; test notification received in RC (**Valid credentials** + Last received timestamp). Still open: Activate Play base plans for license testing. See [018](./tasks/018-revenuecat-project.md).

## 2026-07-23 — RevenueCat Play credentials + Console permissions

- Service-account JSON uploaded in RevenueCat for Play app `app95807dc9bd`. Play Console user `revenuecat-service-account@coach-watts.iam.gserviceaccount.com`: Coach Watts app access + account permissions **View app information (bulk reports)** + **View financial data, orders, and cancellation survey responses** + **Manage orders and subscriptions**.

## 2026-07-23 — RevenueCat Play app + product mapping

- Added RevenueCat Play Store app **Coach Watts (Play Store)** (`app95807dc9bd`) for package `com.coachwatts.app`.
- Created RC products `coachwatts_supporter:monthly|annual` and `coachwatts_pro:monthly|annual`; attached to entitlements `supporter`/`pro` and `default` packages (`$rc_monthly`, `$rc_annual`, `pro_monthly`, `pro_annual`).
- Local `.env`: `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` + Play identifiers appended to product ID lists (gitignored).

## 2026-07-23 — Play Internal AAB + Google subscription catalog (draft)

- Uploaded release-signed AAB `0.1.1` / `versionCode` 1 to Internal testing; release **1 (0.1.1)** published (“Available to internal testers”). Track inactive until testers are added. Upload keystore wired via gitignored `credentials/android/` + plugin `withAndroidReleaseSigning` (task 014).
- Create subscription unlocked. Draft Google catalog: **`coachwatts_supporter`** (`monthly` $8.99 / `annual` $89.99) and **`coachwatts_pro`** (`monthly` $14.99 / `annual` $119.99 — Play rounded from $119.00). Left inactive until 020/021. Still open: benefits copy, Activate for license testers, RevenueCat Google app mapping, payout bank / 15% fee. See [015](./tasks/015-android-production-build.md), [019](./tasks/019-paid-agreements-and-products.md).

## 2026-07-23 — Play payments profile linked; subscriptions blocked on APK

- Linked existing Watt Mind Kft. Google payments profile (`3878-8777-9292`, Organization profile for Play) to developer `7883910200930974301`; filled public merchant details (coachwatts.com / support@coachwatts.com / CoachWatts).
- Subscriptions page now loads for Coach Watts but **Create subscription** stays locked until an APK/AAB is uploaded (“Upload a new APK”).
- Still open: payout bank method, 15% service-fee account group, Play products → RevenueCat Google app. See [019](./tasks/019-paid-agreements-and-products.md).

## 2026-07-23 — RevenueCat V2 secret + MCP / local API env

- Created RC secret API key **Cursor MCP / local API** (V2; customer + project-config read/write). Stored only in gitignored `.env` as `REVENUECAT_API_V2_SECRET_KEY` with `REVENUECAT_PROJECT_ID=12d4d797`.
- Wired RevenueCat Cloud MCP (`https://mcp.revenuecat.ai/mcp`) in Cursor user config; project [`.cursor/mcp.json`](../../.cursor/mcp.json) uses `${env:REVENUECAT_API_V2_SECRET_KEY}`.
- Also set local public Test Store key + Supporter/Pro product ID lists in `.env`; placeholders in `.env.example`. REST API v2 smoke (`GET …/apps`) OK.
- Documented in [018](./tasks/018-revenuecat-project.md). Production webhook secrets remain coach-wattz-only.

## 2026-07-22 — RevenueCat App Store app + catalog mapping

- Added RC App Store app **Coach Watts (App Store)** (`app17fce11c8d`) for bundle `com.coachwatts.app` with valid In-App Purchase key (`376Y9C7VR2`); project `12d4d797`.
- Created four App Store products matching ASC IDs; entitlements `supporter` / `pro`; updated current offering `default` with packages `$rc_monthly`, `$rc_annual`, `pro_monthly`, `pro_annual`.
- Public iOS SDK key set in local `.env` (`EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`). Non-secret IDs recorded in [018](./tasks/018-revenuecat-project.md).
- Still open on 018: Watt Mind owner/plan/restore policy, Google app, Stripe, ASC Server Notification URL paste, optional ASC API key for import.
  - **Correction (2026-07-23):** Apple catalog mapping + local V2/MCP secrets are done; remaining 018 items unchanged.

## 2026-07-22 — Apple subscription group + four draft products

- ASC group **Coach Watts** (`22257011`) with draft products (Prepare for Submission), EN localizations, all-country availability, USD base prices matching web list:
  - `coachwatts_pro_monthly` (`6793680130`) — $14.99 / 1 month
  - `coachwatts_pro_annual` (`6793680902`) — $119.00 / 1 year
  - `coachwatts_supporter_monthly` (`6793681933`) — $8.99 / 1 month
  - `coachwatts_supporter_annual` (`6793682172`) — $89.99 / 1 year
- Group EN display name set to **Coach Watts**. IDs recorded in [019](./tasks/019-paid-agreements-and-products.md).
- Still open: Paid Apps agreement (legal entity verifying), tax/banking, service-level reorder (Pro both level 1, Supporter both level 2), review screenshot, Google products, RevenueCat mapping (018).

## 2026-07-22 — Android Play builds: local Gradle preferred (not EAS)

- **Decision:** Play Internal / production AABs are built locally with `expo prebuild -p android` → upload-keystore signing → `./gradlew bundleRelease` → Play Console upload. Do not use `eas build -p android` / `eas submit -p android` as the default path.
- Updated [014](./tasks/014-eas-android-credentials.md) and [015](./tasks/015-android-production-build.md); hub notes in [distribution.md](../distribution.md).
- `versionCode` is manual (`expo.android.versionCode` / Gradle), logged here per upload. GitHub sideload APKs should prefer `--local` / `--apk` over cloud EAS.

## 2026-07-22 — iOS store builds: local Xcode preferred (not EAS)

- **Decision:** TestFlight / App Store iOS binaries are built on a Mac with `expo prebuild` → Xcode Archive → Organizer/Transporter. Do not use `eas build -p ios` / `eas submit -p ios` as the default path.
- Updated [005](./tasks/005-eas-credentials-and-secrets.md) (signing + local production env) and [006](./tasks/006-ios-production-build.md) (Archive upload steps); hub notes in [distribution.md](../distribution.md).
- iOS build numbers are manual (`ios.buildNumber` / Xcode Current Project Version), logged here per upload.

## 2026-07-22 — RevenueCat backend and native acquisition foundation implemented

- Added provider-neutral subscription persistence, canonical projection/backfill, scoped summary/reconcile APIs, authenticated idempotent RevenueCat webhook ingestion, Stripe tracking, audit diagnostics, and the operations runbook in `coach-wattz` ([task 020](./tasks/020-subscription-backend.md)).
- Added the default-off hosted-only RevenueCat identity/offering adapter and Settings → Subscription & Billing purchase, restore, status, collision, and provider-management experience ([task 021](./tasks/021-native-subscription-experience.md)). No private keys were added; real public SDK keys/product mappings remain external configuration.
- Validation: mobile and backend typechecks passed; Prisma client generation passed; Android debug native build passed with `react-native-purchases`. iOS RevenueCat pods compiled, but the final existing widget/app link remains blocked by Xcode rejecting direct `SwiftUICore` linkage. Test files were added but not run pending explicit approval.

## 2026-07-22 — RevenueCat account created; hosted store subscriptions proposed

- RevenueCat selected to normalize Apple App Store / Google Play subscription commerce; account created. Durable Watt Mind project ownership, plan, restore behavior, non-secret IDs, and store connections remain [task 018](./tasks/018-revenuecat-project.md).
- Native acquisition is **hosted `https://coachwatts.com` only**. Coach Watts server entitlements remain authoritative; existing Stripe subscribers retain mobile access and must not be prompted into duplicate store subscriptions.
- Added distribution tasks [018–022](./tasks.md) for RevenueCat, paid agreements/products, backend reconciliation, native UX, and lifecycle review.
- Created OpenSpec `store-subscriptions-revenuecat` with proposal, design, capability specs, and implementation tasks.

## 2026-07-21 — Widget BID → `com.coachwatts.app.todaywidget`

- `com.coachwatts.app.widgets` still “not available” on Watt Mind (held elsewhere); `com.wattmind.*` fails ValidateEmbeddedBinary (must prefix parent).
- Widget → **`com.coachwatts.app.todaywidget`** (`app.json` + `project.pbxproj`). App Group stays **`group.com.wattmind.coachwatts`**.
- In Xcode → ExpoWidgetsTarget → Signing: refresh / Try Again so Automatic Signing registers the new App ID.

## 2026-07-21 — Widget BID reverted to parent prefix (ValidateEmbeddedBinary)

- Xcode error: embedded binary BID must be prefixed by parent app — `com.wattmind.coachwatts.widgets` is invalid under `com.coachwatts.app`.
- Correction: widget → **`com.coachwatts.app.widgets`** again (`app.json` + `project.pbxproj`). App Group stays **`group.com.wattmind.coachwatts`**.
- Superseded: `.widgets` unavailable → see `todaywidget` entry above.

## 2026-07-21 — Play Sign in details: Google demo Gmail

- Updated Play Console Sign in details (“Reviewer demo athlete”) with Google OAuth demo email **`coachwatts.play.review@gmail.com`** + OAuth instructions. Password in password manager only (not git).
- Console: “Change saved. Send for review in Publishing overview.”
- Still needed: seed that Google identity as an athlete on `https://coachwatts.com` → [008](./tasks/008-reviewer-demo-account.md).

## 2026-07-21 — Widget bundle ID changed for Watt Mind signing

- Xcode: `ExpoWidgetsTarget` — `com.coachwatts.app.widgets` “not available” on Watt Mind (same class of issue as the old App Group).
- Updated `app.json` `expo-widgets` `bundleIdentifier` → **`com.wattmind.coachwatts.widgets`** (keeps `group.com.wattmind.coachwatts`).
- Next: `npx expo prebuild --platform ios --clean`, then Xcode should auto-register the new widget App ID with automatic signing.

## 2026-07-21 — App Group ID changed for Watt Mind signing

- Xcode signing failed: `group.com.coachwatts.app` “not available” on team `42K8S6866N` (likely held by a personal/free team).
- Registered **`group.com.wattmind.coachwatts`** on Watt Mind; updated `app.json` `expo-widgets` `groupIdentifier` + docs.
- After portal App ID App Groups assignment: `npx expo prebuild --platform ios --clean`, then Xcode Signing refresh / Archive.

## 2026-07-21 — Docs: marketing ASC screenshot handoff

- Expanded [004](./tasks/004-listing-metadata-assets.md): eng listing text is done; **marketing** owns iPhone screenshots on ASC version **0.1.1** (0/10 today), after TestFlight build.
- Optional ASC marketing surfaces called out (App Previews, Custom Product Pages, PPO, Nominations) — not blocking first submit.
- Hub green-light + sequencing updated for SIWA review path (no Google demo).

## 2026-07-21 — Play Data safety submitted

- Finished step 4 usage/handling for all selected types; Preview → **Save**.
- Console: “Change saved. Send for review in Publishing overview.”
- Shared only Crash logs + Diagnostics (Sentry); rest collected, not shared. Delete URL `https://coachwatts.com/settings/danger`.
- Task [012](./tasks/012-play-data-safety-and-content.md) → **done**. Still open for Play: listing assets [013](./tasks/013-play-listing-assets.md); seed Play Google demo athlete → [008](./tasks/008-reviewer-demo-account.md).

## 2026-07-21 — App Review: SIWA only (no Google demo)

- Decision: **no dedicated Google demo account**. Reviewers use **Sign in with Apple** with a reviewer Apple ID.
- ASC 0.1.1: notes updated; Sign-In placeholders `Sign in with Apple` / `Use reviewer Apple ID (no password demo)` (not Coach Watts credentials).
- Still needed: hosted SIWA live + TestFlight smoke. New SIWA accounts may hit empty first-run → [056](../issues/056.md) / [008](./tasks/008-reviewer-demo-account.md).
- Correction (same day): ASC still SIWA-only; **Play** now has a dedicated Google demo Gmail (see entry above).

## 2026-07-21 — ASC App Review notes refreshed for SIWA

- Version **0.1.1** App Review Notes updated: OAuth PKCE + system browser, **Sign in with Apple** or Google, `coachwatts://oauth/callback`, Guideline 4.8 callout.
- Superseded for credentials: see “SIWA only (no Google demo)” entry above.
- Hosted IdP SIWA deploy treated as ongoing.

## 2026-07-21 — Sign in with Apple: Apple Developer console complete

- App ID `com.coachwatts.app`: Sign In with Apple enabled.
- Services ID **`com.coachwatts.web`**: primary App ID `com.coachwatts.app`; domain `coachwatts.com`; return URL `https://coachwatts.com/api/auth/callback/apple`.
- Key **Coach Watts Sign in with Apple** — Key ID **`4T63PU845X`**, Team **`42K8S6866N`**; `.p8` downloaded once (password manager / local only — never git).
- Still needed: set `APPLE_*` on **hosted** coach-wattz deploy, ship Auth.js Apple code, smoke SIWA + Google, then ASC notes / demo account → [008](./tasks/008-reviewer-demo-account.md).

## 2026-07-21 — Play App content mostly filled; Data safety mid-form

- Store settings: category **Health & Fitness**; contacts `support@coachwatts.com` / `+36302858822` / `https://coachwatts.com`.
- App content saved: Sign in details (placeholder demo — replace via [008](./tasks/008-reviewer-demo-account.md)); Target audience **18+**; Health (activity/nutrition/sleep, not medical device); IARC content rating (**ESRB Everyone** / PEGI 3).
- Data safety: encryption + OAuth/username account creation + delete URL `https://coachwatts.com/settings/danger` + data types selected. **Still open:** per-type usage/handling (step 4) + Preview/submit (step 5).
- Console left on Data safety step 4. Store listing → [013](./tasks/013-play-listing-assets.md).

## 2026-07-21 — Play app created + App content started

- Created **Coach Watts** in Play Console (Draft): package **`com.coachwatts.app`**, Play app ID **`4976128188579826786`**, en-US, App, Free. Play App Signing + automatic protection accepted.
- Dashboard: https://play.google.com/console/u/0/developers/7883910200930974301/app/4976128188579826786/app-dashboard
- Saved App content: privacy policy `https://coachwatts.com/privacy`; Ads = No; Government = No; Financial features = none; Advertising ID = No.
- Still open (App content): Sign in details, Content rating, Target audience, Data safety, Health. Also category/contacts + store listing assets.
- Task [011](./tasks/011-play-console-app.md) → `done`; [012](./tasks/012-play-data-safety-and-content.md) → `in-progress`.

## 2026-07-21 — Sign in with Apple (Guideline 4.8) implementation started

- OpenSpec `sign-in-with-apple`: Auth.js Apple provider + `/oauth/login` / `/login` / `/join` UI in **coach-wattz** (gated on Apple env secrets). Mobile PKCE unchanged.
- Ops still needed: Apple Services ID + key on Watt Mind team; deploy secrets (`APPLE_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`); smoke SIWA then refresh ASC notes / demo Google account → [008](./tasks/008-reviewer-demo-account.md).
- Operator doc: coach-wattz `docs/developer/sign-in-with-apple.md`.

## 2026-07-21 — ASC version aligned to 0.1.1

- App Store Connect iOS version string set to **`0.1.1`** (was `1.0`) to match repo `package.json` / `app.json`. First production IPA should use the same short version; later bumps via release-it + a new ASC version row.

## 2026-07-21 — DSA trader compliance Active

- **Digital Services Act** compliance **Active** (27 EU countries/regions) for Watt Mind Kft. Trader contact: `+36 302858822` / `deploy@watt-mind.com` (D‑U‑N‑S address). Email verification completed in ASC by Account Holder.
- **App Review Information** already saved on 1.0: Laszlo Racz / `deploy@watt-mind.com` / `+36302858822` + reviewer notes. Demo credentials still open → [008](./tasks/008-reviewer-demo-account.md).
- Next: [005](./tasks/005-eas-credentials-and-secrets.md), screenshots after build, Play app create [011](./tasks/011-play-console-app.md).

## 2026-07-21 — App Review contact + DSA email verify in flight

- **App Review Information** persisted on 1.0 (`appStoreReviewDetails` `8d6ee52e-522a-4596-9804-f1fc1323789a`): Laszlo Racz / `deploy@watt-mind.com` / `+36302858822`; reviewer notes (OAuth PKCE, hosted instance, optional permissions, delete-account path, not a medical device). Demo sign-in credentials still open → [008](./tasks/008-reviewer-demo-account.md).
- **DSA trader:** declared trader; D‑U‑N‑S address; phone `+36 302858822` + email `deploy@watt-mind.com` submitted. Waiting on **6-digit email verification code** to `deploy@watt-mind.com` (phone verify may follow).
- Next: finish DSA verify → [005](./tasks/005-eas-credentials-and-secrets.md) / screenshots after build.

Correction: DSA completed → **Active**; see newer entry above.

## 2026-07-21 — Play Console Organization approved

- Google Play Developer account for **Watt Mind Kft.** (Organization) is **verified and usable**.
- **Developer ID:** `7883910200930974301` — [app list](https://play.google.com/console/u/1/developers/7883910200930974301/app-list).
- Fee paid + website verified earlier (2026-07-20); ID / org verification cleared.
- Task [010](./tasks/010-google-play-developer-account.md) → `done`.
- Optional follow-up: confirm Admin invite for day-to-day (`hdkiller@gmail.com` / Workspace) under Users and permissions.
- Next: [011](./tasks/011-play-console-app.md) — create app **Coach Watts** / package `com.coachwatts.app`.

## 2026-07-21 — ASC configured (privacy + listing text)

- **App Privacy** published for Apple ID `6793247809`: 11 data types, linked to identity, not used for tracking; Crash/Performance include Analytics; policy URL `https://coachwatts.com/privacy`.
- **1.0 Prepare for Submission:** description, promotional text, keywords, support/marketing URLs (`https://coachwatts.com`), copyright Watt Mind Kft., manual release. Screenshots still empty (need TestFlight/production build).
- **App Review Information:** contact Laszlo Racz / `support@coachwatts.com`; reviewer notes saved (OAuth PKCE, hosted instance, optional permissions, not a medical device). Phone + demo credentials still open → [008](./tasks/008-reviewer-demo-account.md).
- **Pricing:** Free, all regions. **Free Apps Agreement** active. Paid Apps Agreement still “New” (not required for free app).
- **Export compliance:** `ITSAppUsesNonExemptEncryption: false` added to `app.json` `ios.infoPlist`.
- **DSA (Business):** started as **trader**; D‑U‑N‑S address on file. Blocked on **public company phone** (+ email `support@coachwatts.com`) to finish verification. App Accessibility showcase left undeclared.
- Tasks: [003](./tasks/003-privacy-and-compliance.md) → `done`; [004](./tasks/004-listing-metadata-assets.md) → `in-progress` (screenshots). Next: DSA phone, [005](./tasks/005-eas-credentials-and-secrets.md), screenshots after build.

Correction: App Review contact updated to `deploy@watt-mind.com` + phone; DSA phone/email submitted — see newer entry above.

## 2026-07-21 — ASC App Information + age rating

- ASC Apple ID **`6793247809`**, SKU `coach-watts-app`, bundle `com.coachwatts.app`.
- Saved: subtitle **AI endurance coach**, category **Health & Fitness**, content rights (third-party with rights), age rating **9+**, not a regulated medical device, privacy policy URL `https://coachwatts.com/privacy`.
- Task [003](./tasks/003-privacy-and-compliance.md) → `in-progress`. Still open: App Privacy nutrition labels (**Get Started**), export compliance on build.
- Next: finish nutrition labels → [005](./tasks/005-eas-credentials-and-secrets.md) / [004](./tasks/004-listing-metadata-assets.md).

## 2026-07-21 — ASC app created

- App Store Connect app created for **Coach Watts** / bundle ID `com.coachwatts.app` (Watt Mind team).
- Task [002](./tasks/002-app-store-connect-app.md) → `done`.
- Next: [003](./tasks/003-privacy-and-compliance.md) (privacy labels) and/or [005](./tasks/005-eas-credentials-and-secrets.md) (link Apple team to EAS) in parallel with [004](./tasks/004-listing-metadata-assets.md).

## 2026-07-21 — Bundle ID → `com.coachwatts.app`

- `com.coachwatts.mobile` could not be registered on Watt Mind team (`42K8S6866N`); not visible under personal or Org Identifiers (likely stuck on a free Xcode team).
- **Decision:** ship with **`com.coachwatts.app`** (iOS + Android). Widget `com.coachwatts.app.widgets`; App Group `group.com.coachwatts.app`. AASA: `42K8S6866N.com.coachwatts.app`.
- Updated `app.json`, Maestro, distribution / deep-links docs.
- Next: register App ID + capabilities on Watt Mind → [002](./tasks/002-app-store-connect-app.md).

## 2026-07-21 — Apple Admin invite accepted

- `hdkiller@gmail.com` accepted Admin invite on Watt Mind Kft. team (Account Holder remains `deploy@watt-mind.com`).
- Task [001](./tasks/001-apple-developer-account.md) → `done`.
- Next: [002](./tasks/002-app-store-connect-app.md) — create ASC app for `com.coachwatts.mobile`.
- Correction: bundle id later changed to `com.coachwatts.app` (see entry above).

## 2026-07-21 — Apple Team ID recorded

- Membership active for **Watt Mind Korlatolt Felelossegu Tarsasag** (Account Holder: `deploy@watt-mind.com`).
- **Team ID:** `42K8S6866N` (AASA appID: `42K8S6866N.com.coachwatts.mobile`).
- Next on [001](./tasks/001-apple-developer-account.md): invite `hdkiller@gmail.com` as Admin → then [002](./tasks/002-app-store-connect-app.md).
- Correction: AASA appID is now `42K8S6866N.com.coachwatts.app`.

## 2026-07-21 — Apple Developer membership paid

- Paid Apple Developer Program membership for Watt Mind Kft. Organization; Account Holder `deploy@watt-mind.com`.
- Order confirmation / activation info emailed to that address; order **`W1458543323`**.
- Task [001](./tasks/001-apple-developer-account.md) → `in-progress` (was `blocked` on entity review).
- Next: confirm membership active in Apple Developer → record Team ID → invite `hdkiller@gmail.com` as Admin → [002](./tasks/002-app-store-connect-app.md).

## 2026-07-20 — release-it + Android GitHub sideload

- Added release-it (same pattern as coach-wattz): `pnpm release` / `release:patch|minor|major` → bump `package.json` + sync `app.json`, `CHANGELOG.md`, tag `vX.Y.Z`, GitHub Release notes.
- EAS `preview` / `production` use `autoIncrement` with remote app version source; `preview` builds APK for sideload.
- `pnpm release:android:github` builds/downloads preview APK and attaches it to `v<version>` (or creates the release).
- Android `minSdkVersion` raised to **26** via `expo-build-properties` (Health Connect requirement).
- Docs: [distribution.md](../distribution.md)#version-releases-release-it.

## 2026-07-20 — Play Console: fee paid, website verified

- Organization Play Console signup in progress for Watt Mind Kft.
- Registration fee paid; organization website verified in Play Console.
- **Still open:** personal/org **ID verification** (planned later today).
- Task [010](./tasks/010-google-play-developer-account.md) → `in-progress`. After ID clears: invite Admin → [011](./tasks/011-play-console-app.md).

## 2026-07-20 — Play Console signup walkthrough added

- Added [play-console-signup.md](./play-console-signup.md) for Watt Mind Kft. Organization enrollment.
- Guiding signup live; task [010](./tasks/010-google-play-developer-account.md) still `open` until signup is started.

## 2026-07-20 — Sentry project + EAS DSN

- Created Sentry org **watt-mind** / project **coach-watts-app** (EU ingest).
- Set EAS project env `EXPO_PUBLIC_SENTRY_DSN` (sensitive) on development, preview, and production. Local `.env` also set (gitignored).
- SDK already initialized via `src/sentry.ts` — no wizard needed. OTLP ingest URL is unused (RN SDK uses DSN).
- Task [005](./tasks/005-eas-credentials-and-secrets.md) Sentry step done; Apple credential linking still open.

## 2026-07-20 — Play Store track added (tasks 010–017)

- Documented Google Play path under Watt Mind Kft. Organization (parallel to Apple).
- Package: `com.coachwatts.mobile`. Prefer company Google/`watt-mind.com` admin identity; invite personal account after.
- Sequencing: iOS remains first ship candidate; Play **account** verification can start now while Apple reviews docs.
- Shared with iOS: privacy copy, Sentry secrets, demo athlete, OAuth, delete-account path. Play-specific: Data safety, feature graphic, AAB, assetlinks SHA-256 after signing.

## 2026-07-20 — Org enrollment submitted; waiting on Apple

- Registration + supporting documents uploaded for Watt Mind Kft. Organization enrollment (Account Holder: `deploy@watt-mind.com`).
- Apple status message: “We’ll review the details you provided and contact you soon.”
- Task [001](./tasks/001-apple-developer-account.md) → `blocked` (external: Apple verification).
- Next after approval: finish membership/agreements if needed → record Team ID → invite `hdkiller@gmail.com` as Admin → start [002](./tasks/002-app-store-connect-app.md).

## 2026-07-20 — Enroll as Watt Mind Kft. (Organization)

- Legal entity confirmed: **Watt Mind Kft.** (`watt-mind.com`).
- **Decision:** Apple Developer Program as **Organization**, not Individual.
- Account Holder: create a **new** Apple ID on planned mailbox **`deploy@watt-mind.com`**. Do **not** use personal `hdkiller@gmail.com` as Account Holder.
- After enrollment: invite `hdkiller@gmail.com` as Admin/Developer for day-to-day access.
- Task [001](./tasks/001-apple-developer-account.md) → `in-progress`. Next: D‑U‑N‑S + company-email Apple ID + enroll.

## 2026-07-20 — Distribution docs tree created

- Added hub [docs/distribution.md](../distribution.md), task index, per-task stubs, and this log.
- Captured App Store submission prerequisites discussed in-session (ASC, privacy labels, EAS production build, TestFlight, seeded reviewer demo, no medical claims).
- **Decision:** Prefer Organization Apple Developer enrollment with a dedicated company-email Apple ID (not personal day-to-day iCloud). Individual enrollment only if entity/D‑U‑N‑S not ready and TestFlight is urgent.
- Bundle id confirmed: `com.coachwatts.mobile`. Phone-only listing already decided (`supportsTablet: false`, issues/055).
- Outstanding work indexed in [tasks.md](./tasks.md) (001–009 open).
- Correction: bundle id later changed to `com.coachwatts.app` (2026-07-21).
