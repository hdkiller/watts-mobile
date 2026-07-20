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
