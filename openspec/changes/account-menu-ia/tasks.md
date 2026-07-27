## 1. Shared mappers

- [x] 1.1 `src/features/account/menuDetails.ts` — subscription / invite / notification row
      subtitles + short date helper
- [x] 1.2 Vitest coverage for every branch (free, renewing, cancelling, urgent, collision,
      missing end date, referral counts, unread counts)

## 2. Athlete screen

- [x] 2.1 Remove the Invite friends row and the referral gate import
- [x] 2.2 Add visible Sports & thresholds + Manage full profile on the web rows
- [x] 2.3 Drop the duplicate "Open Profile Settings" button from the metrics editor and
      re-point the helper sentence at the new row

## 3. More tab

- [x] 3.1 Regroup into Your training / Account / Help / About / Sign out
- [x] 3.2 Promote Subscription; move Invite into Account with the attribution subtitle
- [x] 3.3 Split Help Center & Support into Help center + Contact support (one destination each)
- [x] 3.4 Replace the profile-card refresh button with pull-to-refresh
- [x] 3.5 Mark browser hand-offs with the external-link glyph

## 4. Settings

- [x] 4.1 Regroup into Data sources / Preferences / Coaching / Account
- [x] 4.2 Platform-accurate health label; wording pass on every row
- [x] 4.3 Per-row "This device" tags + corrected intro line
- [x] 4.4 Live Subscription subtitle; destructive Delete account

## 5. Android icon coverage

- [x] 5.1 Map the seven SF Symbols that were falling back to text/emoji on Android
      (`camera.fill`, `barcode.viewfinder`, `magnifyingglass`, `xmark`, `xmark.circle.fill`,
      `bell.slash`, `flame`) plus the two this change introduced (`envelope`, `arrow.up.right`)
- [x] 5.2 Vitest guard asserting every `AppSymbol` `sf` without an `md` override is in SF_TO_MD

## 6. e2e + docs

- [x] 6.1 `today-invite` → `today-athlete` (asserts the Sports row instead of Invite)
- [x] 6.2 Scroll to `more-settings` / `more-invite-friends` now they sit lower on More
- [x] 6.3 `settings-account-deletion` asserts the renamed Subscription row
- [x] 6.4 `docs/e2e.md` testID + flow inventory

## 7. Verification

- [x] 7.1 `pnpm exec tsc --noEmit`, eslint, prettier, `pnpm vitest run`
- [ ] 7.2 Run the Maestro shared suite against a seeded hosted/local instance
- [x] 7.3 Android visual pass on the emulator (More, Settings, Athlete, Today, meal sheet)
- [ ] 7.4 iOS visual pass
