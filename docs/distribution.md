# App Store / Play distribution

Hub for shipping Coach Watts to **App Store** and (later) **Play Console**. Product chrome and privacy copy live in the store checklists; this tree tracks **who owns what**, **outstanding work**, and a durable **progress log**.

## Identifiers

| Item | Value |
|------|--------|
| iOS bundle id | `com.coachwatts.app` |
| Android package | `com.coachwatts.app` |
| Widget extension | `com.coachwatts.app.widgets` |
| App Group | `group.com.coachwatts.app` |
| Apple Team ID | `42K8S6866N` (Watt Mind Kft.) |
| Expo slug / EAS project | `coach-watts-app` / `3fad7b8c-dc45-4616-8d77-d48f44d161b2` |
| Expo owner | `hdkillers-team` |
| Hosted instance | `https://coachwatts.com` |
| Production OAuth client | `1c2dbf4d-51b8-4902-85e6-e4f2f48c70d9` |
| OAuth redirect | `coachwatts://oauth/callback` |
| Privacy / terms | `https://coachwatts.com/privacy` · `https://coachwatts.com/terms` |
| Support | `mailto:support@coachwatts.com` |
| Play Console developer ID | `7883910200930974301` |
| Play app ID | `4976128188579826786` (Coach Watts) |

## Doc map

| Doc | Role |
|-----|------|
| **This file** | Overview, identifiers, green-light summary, maintenance rules |
| [distribution/tasks.md](./distribution/tasks.md) | Outstanding / done task index |
| [distribution/tasks/](./distribution/tasks/) | Per-task detail (status, steps, blockers) |
| [distribution/log.md](./distribution/log.md) | Append-only history of decisions and progress |
| [distribution/play-console-signup.md](./distribution/play-console-signup.md) | Step-by-step Google Play Organization signup |
| [store-checklist.md](./store-checklist.md) | Brand chrome, About links, Sentry env |
| [store-privacy-checklist.md](./store-privacy-checklist.md) | App Privacy / Data safety paste-ready copy |
| [oauth-setup.md](./oauth-setup.md) | Official Mobile App client + redirects |
| [e2e.md](./e2e.md) | Never enable e2e auth on store / preview EAS profiles |
| [native-modules.md](./native-modules.md) | Rebuild after native / plugin changes; Android `minSdk` 26 |
| [deep-links.md](./deep-links.md) | AASA / associated domains for review |
| [../.release-it.json](../.release-it.json) | release-it: bump, CHANGELOG, git tag, GitHub Release notes |

## Enrollment (Watt Mind Kft.)

Same legal entity for **both** stores. Account enrollments are independent and can run in parallel.

### Apple (iOS)

| Field | Value |
|-------|--------|
| Program | Apple Developer Program — **Organization** |
| Account Holder | `deploy@watt-mind.com` |
| Team ID | `42K8S6866N` |
| Personal day-to-day | `hdkiller@gmail.com` (Admin; invitation accepted) |
| Bundle ID | `com.coachwatts.app` |
| ASC Apple ID | `6793247809` |
| SKU | `coach-watts-app` |
| Status | [001](./distribution/tasks/001-apple-developer-account.md)–[003](./distribution/tasks/003-privacy-and-compliance.md) done; [004](./distribution/tasks/004-listing-metadata-assets.md) listing **text** done — **marketing screenshots** still open; next eng: [005](./distribution/tasks/005-eas-credentials-and-secrets.md) → build → TestFlight |

### Google Play (Android)

| Field | Value |
|-------|--------|
| Account | Play Console — **Organization** (Watt Mind Kft.) |
| Developer ID | `7883910200930974301` |
| Console | [App list](https://play.google.com/console/u/1/developers/7883910200930974301/app-list) |
| Admin identity | Prefer Workspace / Google account on `watt-mind.com` (e.g. `deploy@` or Play-specific admin) |
| Personal day-to-day | Invite personal Gmail/Workspace user as admin if not already |
| Status | App **created** (Draft). [010](./distribution/tasks/010-google-play-developer-account.md)–[011](./distribution/tasks/011-play-console-app.md) done. Next: finish App content → [012](./distribution/tasks/012-play-data-safety-and-content.md) + listing → [013](./distribution/tasks/013-play-listing-assets.md) |
| Package | `com.coachwatts.app` |
| Play app ID | `4976128188579826786` |
| Dashboard | [Coach Watts](https://play.google.com/console/u/0/developers/7883910200930974301/app/4976128188579826786/app-dashboard) |

## Sequencing

| Track | Priority | Why |
|-------|----------|-----|
| **iOS / App Store** | First store candidate | Membership paid for Org Account Holder; finish 001 then TestFlight path 002–009 |
| **Android / Play** | Parallel account setup OK; ship after or alongside iOS | Tasks 010–017; internal testing can start before iOS is approved |

Shared work (do once): production OAuth (+ hosted SIWA), privacy copy, Sentry EAS secrets, branded assets, delete-account path.  
App Review sign-in: **Sign in with Apple** with a reviewer Apple ID — no dedicated Google demo ([008](./distribution/tasks/008-reviewer-demo-account.md)).  
**Marketing (ASC):** upload iPhone screenshots on version **0.1.1** after TestFlight — see [004](./distribution/tasks/004-listing-metadata-assets.md).

## Version releases (release-it)

Same stack as coach-wattz (`release-it` + conventional-changelog), without the web changelog CLI hooks.

| Kind | Source of truth |
|------|-----------------|
| User-facing (`0.1.0`) | `package.json` → synced to `app.json` / Expo `version` via `scripts/sync-expo-version.mjs` |
| Store build # (`versionCode` / `buildNumber`) | EAS remote (`cli.appVersionSource: remote` + `autoIncrement` on **preview** / **production**) |

```bash
# Clean working tree required
pnpm release:patch          # or release:minor / release:major / release
# → bump, CHANGELOG.md, commit, tag vX.Y.Z, GitHub Release notes

pnpm release:android:github              # EAS cloud preview APK → vX.Y.Z
pnpm release:android:github -- --local   # build APK on this machine (Android SDK)
pnpm release:android:github -- --apk path/to/app.apk
pnpm release:android:github -- --dry-run
pnpm release:android:github -- --skip-build   # reuse latest finished cloud APK
```

| EAS profile | Use |
|-------------|-----|
| `development` | Dev client (Metro) |
| `preview` | Internal APK (`android.buildType: apk`); GitHub sideload / testers |
| `production` | Store AAB/IPA → TestFlight / Play Internal |
| `e2e` | Fixture auth only — never for testers or stores |

Do **not** set `EXPO_PUBLIC_E2E_*` on preview/production. Android sideload/GitHub builds need API **26+** (`expo-build-properties` in `app.json`).

## Green light — iOS (Submit for Review)

1. Apple Developer Program active + ASC app for `com.coachwatts.app`
2. App Privacy labels + privacy policy URL from [store-privacy-checklist.md](./store-privacy-checklist.md)
3. Hosted IdP **Sign in with Apple** live on `coachwatts.com` (Guideline 4.8)
4. Production EAS secrets (`EXPO_PUBLIC_SENTRY_DSN`); no `EXPO_PUBLIC_E2E_*`
5. `eas build -p ios --profile production` → TestFlight smoke (incl. SIWA path)
6. **Marketing:** iPhone screenshots uploaded on ASC **0.1.1** ([004](./distribution/tasks/004-listing-metadata-assets.md)); description with **no medical claims**
7. App Review notes + SIWA instructions ([008](./distribution/tasks/008-reviewer-demo-account.md)); empty first-run risk → [issues/056.md](./issues/056.md)
8. Branded splash/icon on release build

## Green light — Play (production)

1. Play Console Organization verified for Watt Mind Kft. + app `com.coachwatts.app`
2. Data safety + content rating + privacy policy URL from [store-privacy-checklist.md](./store-privacy-checklist.md)
3. Same production EAS secrets; Android keystore via EAS; Play service account for submit
4. `eas build -p android --profile production` → Internal testing smoke
5. Listing (icon, feature graphic, screenshots, description) — no medical claims
6. Promote to production; after first signing, update [deep-links.md](./deep-links.md) **assetlinks** SHA-256 fingerprints

Track detail in [distribution/tasks.md](./distribution/tasks.md).

## How to maintain

1. **Tasks** — When work starts or finishes, update the row in `tasks.md` **and** the matching `tasks/{id}-*.md` status together.
2. **Log** — When a decision lands, an enrollment completes, a build ships to TestFlight / Play internal, or review feedback arrives, **prepend** a dated entry to [distribution/log.md](./distribution/log.md). Do not rewrite old entries; add a correction note if needed.
3. **Secrets** — Never commit Apple/Google passwords, Play service-account JSON, review demo passwords, or real Sentry DSNs. Reference EAS secret names and “stored in password manager / Console” only.
4. **Store checklists** — Keep chrome/privacy copy in `store-checklist.md` / `store-privacy-checklist.md`; link from tasks instead of duplicating long tables.

## Related open product questions

- Hosted vs self-hosted distribution binary strategy — [open-questions.md](./open-questions.md) #4
- First-run / reviewer empty-state risk — [issues/056.md](./issues/056.md)
- Phone-only v1 (`supportsTablet: false`) — [issues/055.md](./issues/055.md) (done)
