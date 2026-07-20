# App Store / Play distribution

Hub for shipping Coach Watts to **App Store** and (later) **Play Console**. Product chrome and privacy copy live in the store checklists; this tree tracks **who owns what**, **outstanding work**, and a durable **progress log**.

## Identifiers

| Item | Value |
|------|--------|
| iOS bundle id | `com.coachwatts.mobile` |
| Android package | `com.coachwatts.mobile` |
| Widget extension | `com.coachwatts.mobile.widgets` |
| App Group | `group.com.coachwatts.mobile` |
| Expo slug / EAS project | `coach-watts-app` / `3fad7b8c-dc45-4616-8d77-d48f44d161b2` |
| Expo owner | `hdkillers-team` |
| Hosted instance | `https://coachwatts.com` |
| Production OAuth client | `1c2dbf4d-51b8-4902-85e6-e4f2f48c70d9` |
| OAuth redirect | `coachwatts://oauth/callback` |
| Privacy / terms | `https://coachwatts.com/privacy` · `https://coachwatts.com/terms` |
| Support | `mailto:support@coachwatts.com` |

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
| [e2e.md](./e2e.md) | Never enable e2e auth on store EAS profiles |
| [native-modules.md](./native-modules.md) | Rebuild after native / plugin changes |
| [deep-links.md](./deep-links.md) | AASA / associated domains for review |

## Enrollment (Watt Mind Kft.)

Same legal entity for **both** stores. Account enrollments are independent and can run in parallel.

### Apple (iOS)

| Field | Value |
|-------|--------|
| Program | Apple Developer Program — **Organization** |
| Account Holder | `deploy@watt-mind.com` |
| Personal day-to-day | `hdkiller@gmail.com` → invite as Admin after approval |
| Status | Docs uploaded; waiting on Apple review → [task 001](./distribution/tasks/001-apple-developer-account.md) |

### Google Play (Android)

| Field | Value |
|-------|--------|
| Account | Play Console — **Organization** (Watt Mind Kft.) |
| Admin identity | Prefer Workspace / Google account on `watt-mind.com` (e.g. `deploy@` or Play-specific admin) |
| Personal day-to-day | Invite personal Gmail/Workspace user as admin after org setup |
| Status | Fee paid, website verified; **ID verification pending** → [task 010](./distribution/tasks/010-google-play-developer-account.md) |
| Package | `com.coachwatts.mobile` |

Play has its own one-time registration fee and org verification (separate from Apple/D‑U‑N‑S timing).

## Sequencing

| Track | Priority | Why |
|-------|----------|-----|
| **iOS / App Store** | First store candidate | Already mid-enrollment; TestFlight path in tasks 001–009 |
| **Android / Play** | Parallel account setup OK; ship after or alongside iOS | Tasks 010–017; internal testing can start before iOS is approved |

Shared work (do once): production OAuth, privacy copy, Sentry EAS secrets, seeded demo athlete, branded assets, delete-account path.

## Green light — iOS (Submit for Review)

1. Apple Developer Program active + ASC app for `com.coachwatts.mobile`
2. App Privacy labels + privacy policy URL from [store-privacy-checklist.md](./store-privacy-checklist.md)
3. Production EAS secrets (`EXPO_PUBLIC_SENTRY_DSN`); no `EXPO_PUBLIC_E2E_*`
4. `eas build -p ios --profile production` → TestFlight smoke
5. Screenshots + description with **no medical claims**
6. Review notes + **seeded** demo athlete (see issues/056)
7. Branded splash/icon on release build

## Green light — Play (production)

1. Play Console Organization verified for Watt Mind Kft. + app `com.coachwatts.mobile`
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
