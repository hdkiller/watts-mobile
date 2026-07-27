# Design — account menu IA

## Organising rule

Three surfaces, three jobs:

| Surface | Job | Test for "does this row belong here?" |
|---------|-----|----------------------------------------|
| Athlete (Today greeting name / More card) | Who I am | Describes the athlete's body, state, or target |
| More | Where I can go | A destination, not a setting |
| Settings | How the app behaves | Changes behaviour and has a stored value |

Consequences: nothing configurable lives outside Settings; nothing browsable lives inside
Settings; every destination has exactly one canonical menu home. Contextual shortcuts
(Today glances, Plan → Upcoming, Athlete → Goals teaser) stay — they are entry points, not
menu entries, and they are conditional on data existing, which is why the More hubs remain
the guaranteed path.

## Section order

More leads with **Your training** because those are the highest-frequency destinations and
the ones the tabs surface only conditionally. **Account** follows with Settings first (most
tapped), then Notifications, Subscription, Invite. Help and About are reference material.
Sign out is a lone card with no section header — it is an action, not a category.

Settings orders by how often a preference is touched during setup vs. daily use: Data
sources (activation-critical) → Preferences → Coaching → Account.

## Live subtitles

Menu rows read as state rather than a table of contents. `src/features/account/menuDetails.ts`
holds the pure mappers (`subscriptionRowDetail`, `inviteRowDetail`, `notificationsRowDetail`,
`shortDateLabel`) so the copy is unit-testable without mounting a screen, matching the
existing `connectedAppsHubDetail` pattern.

`subscriptionRowDetail` collapses a multi-entitlement summary to one line by priority:
collision → free-tier upsell → urgent billing status → renewal/end date → bare tier. Dates
use a fixed month table rather than `toLocaleDateString` so the string is deterministic in
tests and stays short enough for a one-line subtitle.

## Invite placement

Referral is a growth action, not a profile attribute, so it leaves the Athlete screen. It
keeps the `more-invite-friends` testID and the existing `canUseAthleteReferralShare` gate, so
custom self-hosted instances still see no referral surface anywhere. The subtitle switches
from describing the mechanism ("QR & link so others can join") to the outcome, and upgrades
to attribution count once `stats.attributedCount` is non-zero — the count is already fetched
by `useMyReferral` and was previously only visible inside the invite screen.

## Sign out vs. delete account

Sign out stays on More (platform convention: the bottom of the profile/more screen) and
delete account stays at the bottom of Settings → Account next to Export. They are
deliberately not adjacent: co-locating a routine action with an irreversible one invites
mis-taps. Both remain reachable in two taps from the tab bar, which keeps the App Store
account-deletion discoverability requirement satisfied.

## Rejected alternatives

- **Moving Goals / Events / Activity history under the Plan and Log tabs.** The right
  long-term home, but it is a navigation change with deep-link and back-stack implications;
  this change is limited to grouping and wording so it can ship on its own.
- **Dropping the More training hubs entirely** in favour of the Today glances. Rejected:
  those glances are conditional on data, so a new athlete would have no path at all.
- **A single merged Account screen.** Rejected: More is a tab root and Settings is a pushed
  stack screen; merging them would put 25+ rows on a tab root.
