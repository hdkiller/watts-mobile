## Why

The three account surfaces (Athlete profile, More, Settings) grew row by row and now
overlap. Invite friends sits on both More and Athlete; "Athlete" / "profile & biometrics" /
"Profile Settings" name the same concept three ways; More mixes an inbox, a referral, help
links, and configuration under one "Account & Hub" heading; two differently-worded support
links point at different destinations; Settings claims to be "Preferences for this device"
while most rows are account-level; and Subscription — the row that gates paid features — is
three taps deep.

## What Changes

- **One home per destination.** Invite moves to More only; the Athlete screen drops its
  referral row and instead owns the profile → thresholds hand-off.
- **More is regrouped** into Your training / Account / Help / About + a standalone Sign out,
  replacing "Account & Hub", "Training & Schedule", and "Account Session".
- **Subscription is promoted** to More → Account with a live status subtitle, mirroring the
  Settings row.
- **Rows carry live state**: subscription tier + renewal date, referral attribution count,
  unread notification count.
- **Settings becomes configuration only** — Data sources / Preferences / Coaching / Account —
  with account-lifecycle rows (web profile, export, delete) folded into Account.
- **Wording pass** across all three surfaces: platform-accurate health label
  (Apple Health / Health Connect), "Server" instead of "Instance", "Sports & thresholds",
  "Coach persona", "Default log view", "Activity history", "Upcoming workouts",
  "Invite a friend".
- **Honest device scoping**: per-row "This device" tags replace the blanket subtitle.
- **Browser hand-offs are marked** with an external-link glyph on both More and Settings.
- The profile card's inline refresh button is replaced by pull-to-refresh on More.

## Capabilities

### Modified Capabilities

- `account-more`: regrouped More sections, single Invite home, Subscription on More,
  Settings scoped to configuration, external-link marking, wording pass
- `athlete-referral-share`: the mobile invite surface is reachable from More only

## Impact

- **watts-mobile**: `app/(app)/athlete.tsx`, `app/(app)/(tabs)/more/index.tsx`,
  `app/(app)/(tabs)/more/settings/index.tsx`, new `src/features/account/menuDetails.ts`
- **Maestro**: `today-invite` → `today-athlete` (Athlete no longer reaches Invite);
  `more-invite` / `more-hubs` / `settings-account-deletion` scroll to their now-lower rows
- **No backend change** — all data comes from existing queries (subscription summary,
  referral, notifications)
