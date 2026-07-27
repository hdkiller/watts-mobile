## ADDED Requirements

### Requirement: More section grouping

The More tab SHALL group its rows as Your training (Activity history, Upcoming workouts,
Events, Goals), Account (Settings, Notifications, Subscription, Invite a friend), Help
(Help center, Contact support, Open on the web), About (legal links), and a standalone Sign
out row. Section headings SHALL use athlete-facing language; internal vocabulary such as
"Hub" or "Session" SHALL NOT be used as a heading.

#### Scenario: Training hubs are grouped away from account rows

- **WHEN** the authenticated user opens More
- **THEN** Activity history, Upcoming workouts, Events, and Goals appear under a single
  training heading, separate from Settings, Notifications, Subscription, and Invite

#### Scenario: Sign out is not a section

- **WHEN** the authenticated user scrolls to the end of More
- **THEN** Sign out appears as a standalone destructive row above the version label, with no
  section heading of its own

### Requirement: Subscription entry on More

The More tab SHALL expose a Subscription row that opens the subscription screen, with a
subtitle reflecting current entitlement state (tier plus renewal date, end date, action-required
warning, or collision notice). Settings SHALL keep a Subscription row with the same subtitle.

#### Scenario: Paid athlete sees renewal state

- **WHEN** an athlete with an auto-renewing entitlement opens More
- **THEN** the Subscription row shows the tier and its renewal date

#### Scenario: Free athlete sees an upgrade prompt

- **WHEN** an athlete on the free tier opens More
- **THEN** the Subscription row invites them to see what a paid tier unlocks

### Requirement: Menu rows carry live state

More rows that have a knowable status SHALL show it as the row subtitle: unread count for
Notifications, entitlement state for Subscription, and referral attribution count for Invite
a friend once at least one friend has joined.

#### Scenario: Referral count replaces the generic pitch

- **WHEN** the athlete's referral has attributed at least one signup
- **THEN** the Invite a friend subtitle reports how many friends joined

### Requirement: External destinations are marked

Rows on More and Settings that leave the app for a browser SHALL be marked with an
external-link affordance rather than the standard chevron.

#### Scenario: Web hand-off is signposted

- **WHEN** the user views Help center, Contact support, Open on the web, Manage account on
  the web, or Export my data
- **THEN** each row shows an external-link glyph instead of a chevron

### Requirement: Settings scope is configuration only

Settings SHALL group rows as Data sources, Preferences, Coaching, and Account, and SHALL NOT
host browsable content lists. The health source row SHALL name the platform integration the
athlete recognises (Apple Health on iOS, Health Connect on Android). Account-lifecycle rows
(subscription, server, web account management, export, delete) SHALL live in a single Account
section.

#### Scenario: Health row names the platform

- **WHEN** the user opens Settings on iOS
- **THEN** the data-source row is labelled Apple Health, and on Android it is labelled Health
  Connect

#### Scenario: Account lifecycle is one section

- **WHEN** the user scrolls to the end of Settings
- **THEN** Subscription, Server, Manage account on the web, Export my data, and Delete account
  appear under one Account heading, with Delete account presented destructively

### Requirement: Device-scoped preferences are labelled

Settings SHALL NOT describe the whole screen as device-local. Preferences stored per device
SHALL be individually marked, and the screen intro SHALL state that unmarked preferences
follow the account.

#### Scenario: Only device-local rows are tagged

- **WHEN** the user opens Settings
- **THEN** Appearance and the default log view carry a "This device" tag and the remaining
  preference rows do not

### Requirement: Athlete screen owns the threshold hand-off

The Athlete screen SHALL expose Sports & thresholds and a web profile-management entry as
visible rows, not only as inline text inside the collapsed metrics editor.

#### Scenario: Sports is reachable without expanding metrics

- **WHEN** the user opens Athlete from the Today greeting name
- **THEN** a Sports & thresholds row is reachable by scrolling, without expanding Edit metrics

## MODIFIED Requirements

### Requirement: Athlete profile entry labeling

The More tab SHALL provide an entry to the Athlete destination whose label or subtitle
indicates profile / AI overview access (not metrics-only), while still reaching the same
Athlete screen that includes metric editing. The subtitle SHALL name the profile's actual
contents rather than a clinical synonym such as "biometrics".

#### Scenario: More entry wording

- **WHEN** the authenticated user opens More
- **THEN** an Athlete (or Athlete profile) row is available that navigates to `/(app)/athlete`

#### Scenario: Not metrics-only implication

- **WHEN** the Athlete profile overview is implemented
- **THEN** More does not label the entry in a way that implies only a metrics form with no
  profile summary

### Requirement: Notification prefs entry

The More tab SHALL provide an entry point for notification preferences via Settings
(Settings → Notifications). The More tab's own Notifications row SHALL open the inbox. Inbox
and preferences SHALL be distinguishable from their placement, not by prefixing both labels
with "Notification".

#### Scenario: Prefs entry visible

- **WHEN** the user opens More
- **THEN** a path to notification preferences is available via Settings, and the More
  Notifications row opens the inbox

### Requirement: Instance URL visible

The More or Settings surface SHALL display the active instance base URL so self-hosted users
can confirm where they are signed in. The row SHALL be labelled in athlete-facing language
(Server) rather than internal vocabulary (Instance).

#### Scenario: Self-hosted instance shown

- **WHEN** the user signed in against a non-default instance
- **THEN** that instance URL is visible on Settings → Server

### Requirement: Invite friends entry on More and Athlete

On hosted Coach Watts and local loopback instances, the More tab SHALL expose a single
Invite a friend entry that opens the athlete referral share surface. The Athlete profile
screen SHALL NOT duplicate it. Custom self-hosted instances SHALL omit the entry. Tapping the
Today greeting name SHALL open Athlete directly (not an intermediate picker sheet).

#### Scenario: Hosted athlete sees Invite a friend on More

- **WHEN** the authenticated user opens More against `coachwatts.com` (or local loopback)
- **THEN** an Invite a friend row is available under Account and navigates to the invite share
  screen

#### Scenario: Athlete screen has no invite row

- **WHEN** the authenticated user opens Athlete on any instance
- **THEN** no invite entry is shown on that screen

#### Scenario: Custom instance hides Invite a friend

- **WHEN** the authenticated user opens More against a custom self-hosted instance host
- **THEN** the Invite a friend row is not shown

## REMOVED Requirements

### Requirement: Discoverability of sport settings

**Reason**: Superseded by "Athlete screen owns the threshold hand-off", which replaces the
inline helper sentence with a real navigation row.

**Migration**: The Athlete metrics helper text now states that per-sport thresholds live under
the Sports & thresholds row on the same screen; Settings keeps its own Sports & thresholds row.
