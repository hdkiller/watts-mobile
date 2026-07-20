# Distribution tasks — Index

Outstanding and completed work to ship Coach Watts to App Store (then Play). Detail lives in [tasks/](./tasks/) as `{id}-{slug}.md`.

**Status:** `open` → `in-progress` → `blocked` → `done`. Update the row and the task file together. Chronology of progress: [log.md](./log.md).

Hub: [../distribution.md](../distribution.md).

## Apple / App Store Connect

| ID | Task | Area | Priority | Status |
|----|------|------|----------|--------|
| [001](./tasks/001-apple-developer-account.md) | Apple ID + Developer Program enrollment (Watt Mind Kft. Org) | account | high | blocked |
| [002](./tasks/002-app-store-connect-app.md) | Create ASC app record for `com.coachwatts.mobile` | listing | high | open |
| [003](./tasks/003-privacy-and-compliance.md) | App Privacy labels, export compliance, age rating | listing | high | open |
| [004](./tasks/004-listing-metadata-assets.md) | Screenshots, description, keywords, what’s new | listing | high | open |
| [005](./tasks/005-eas-credentials-and-secrets.md) | Link Apple team to EAS; set production secrets | build | high | open |
| [006](./tasks/006-ios-production-build.md) | Production iOS build + upload | build | high | open |
| [007](./tasks/007-testflight-smoke.md) | TestFlight smoke on release binary | qa | high | open |
| [008](./tasks/008-reviewer-demo-account.md) | Seeded demo athlete + App Review notes | review | high | open |
| [009](./tasks/009-submit-for-review.md) | Submit build for App Review | review | high | open |

## In-repo store readiness (cross-check)

These are maintained in [store-checklist.md](../store-checklist.md) / [store-privacy-checklist.md](../store-privacy-checklist.md); listed here so distribution work doesn’t miss them.

| Item | Status |
|------|--------|
| Brand icon + splash assets in repo | done |
| Privacy questionnaire copy in repo | done |
| In-app privacy / terms / support + delete account | done |
| Phone-only (`supportsTablet: false`) | done |
| Device-verify splash/icon on release build | open |
| Paste privacy strings into ASC | open (→ task 003) |
| `EXPO_PUBLIC_SENTRY_DSN` on preview/production EAS | done (→ task 005; Apple credentials still open) |

## Google Play

Can start account verification **while Apple is reviewing**. Shipping priority remains iOS-first unless product flips it.

| ID | Task | Area | Priority | Status |
|----|------|------|----------|--------|
| [010](./tasks/010-google-play-developer-account.md) | Play Console Organization (Watt Mind Kft.) | account | medium | in-progress |
| [011](./tasks/011-play-console-app.md) | Create Play app `com.coachwatts.mobile` | listing | medium | open |
| [012](./tasks/012-play-data-safety-and-content.md) | Data safety, content rating, policies | listing | medium | open |
| [013](./tasks/013-play-listing-assets.md) | Screenshots, feature graphic, description | listing | medium | open |
| [014](./tasks/014-eas-android-credentials.md) | EAS keystore + Play submit service account | build | medium | open |
| [015](./tasks/015-android-production-build.md) | Production AAB → Internal testing | build | medium | open |
| [016](./tasks/016-play-internal-test-smoke.md) | Internal test smoke on release AAB | qa | medium | open |
| [017](./tasks/017-play-production-submit.md) | Promote to production / Play review | review | medium | open |

## Deferred

| Item | Notes |
|------|--------|
| Maestro CI for store smoke | Local footing in [e2e.md](../e2e.md) |
| Separate branded binaries per self-hosted customer | [open-questions.md](../open-questions.md) #4 |
| iPad adaptive layouts | Revisit if tablet demand; v1 is phone-only |
