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

## 2026-07-21 — Docs: marketing ASC screenshot handoff

- Expanded [004](./tasks/004-listing-metadata-assets.md): eng listing text is done; **marketing** owns iPhone screenshots on ASC version **0.1.1** (0/10 today), after TestFlight build.
- Optional ASC marketing surfaces called out (App Previews, Custom Product Pages, PPO, Nominations) — not blocking first submit.
- Hub green-light + sequencing updated for SIWA review path (no Google demo).

## 2026-07-21 — Play Data safety submitted

- Finished step 4 usage/handling for all selected types; Preview → **Save**.
- Console: “Change saved. Send for review in Publishing overview.”
- Shared only Crash logs + Diagnostics (Sentry); rest collected, not shared. Delete URL `https://coachwatts.com/settings/danger`.
- Task [012](./tasks/012-play-data-safety-and-content.md) → **done**. Still open for Play: listing assets [013](./tasks/013-play-listing-assets.md); real demo creds [008](./tasks/008-reviewer-demo-account.md).

## 2026-07-21 — App Review: SIWA only (no Google demo)

- Decision: **no dedicated Google demo account**. Reviewers use **Sign in with Apple** with a reviewer Apple ID.
- ASC 0.1.1: notes updated; Sign-In placeholders `Sign in with Apple` / `Use reviewer Apple ID (no password demo)` (not Coach Watts credentials).
- Still needed: hosted SIWA live + TestFlight smoke. New SIWA accounts may hit empty first-run → [056](../issues/056.md) / [008](./tasks/008-reviewer-demo-account.md).

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
