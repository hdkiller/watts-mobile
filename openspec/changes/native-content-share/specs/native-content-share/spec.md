## ADDED Requirements

### Requirement: Mint public share link for field content
The system SHALL mint a public share URL for a completed workout or planned workout by calling Bearer `POST /api/share/generate` with `resourceType` `WORKOUT` or `PLANNED_WORKOUT` and the resource id. The client MUST NOT invent a second token scheme or share a private deep-link-only URL as the primary growth destination.

#### Scenario: Workout mint succeeds
- **WHEN** the athlete shares a completed activity and the API returns `{ url }`
- **THEN** the client uses that public `/share/workouts/{token}` URL as the share base

#### Scenario: Planned mint succeeds
- **WHEN** the athlete shares a planned workout and the API returns `{ url }`
- **THEN** the client uses that public `/share/planned-workout/{token}` URL as the share base

#### Scenario: Mint failure surfaces honestly
- **WHEN** `POST /api/share/generate` fails
- **THEN** the client does not open an empty Share sheet and shows an honest error

### Requirement: Attribute content shares with referral via
Before opening the system Share sheet, the client SHALL append the sharer’s athlete referral code as `via` plus UTM parameters that identify in-app content share (`utm_source=in_app_share`, `utm_medium=mobile_content_share`, `utm_campaign=athlete_referral`, and `utm_content` of `workout` or `planned_workout`). Referral code MUST come from the existing referrals API (`GET /api/referrals/me` or equivalent already used by Invite friends).

#### Scenario: Attributed workout URL
- **WHEN** referral code is available and the athlete shares a workout
- **THEN** the shared URL includes `via={CODE}`, `utm_medium=mobile_content_share`, and `utm_content=workout`

#### Scenario: Attributed planned URL
- **WHEN** referral code is available and the athlete shares a planned workout
- **THEN** the shared URL includes `via={CODE}`, `utm_medium=mobile_content_share`, and `utm_content=planned_workout`

#### Scenario: Share continues if referral unavailable
- **WHEN** referral code cannot be loaded but share mint succeeds
- **THEN** the client still opens the Share sheet with the unattributed public URL

### Requirement: System Share sheet presents the public URL
The system SHALL present the OS Share sheet with the attributed (or unattributed fallback) public share URL so recipients can open the web preview. Recipients MUST land on the public share page, not a private app-only deep link, as the primary shared destination.

#### Scenario: Share sheet opens
- **WHEN** mint (and optional attribution) succeeds
- **THEN** the OS Share sheet opens with the public share URL

### Requirement: Server preserves attribution from share landings
On the hosted web instance, when a recipient opens a public share URL that carries `via`, the system SHALL persist referral attribution through Get Started / Join so a subsequent signup can attribute Athlete A→B. Bare `/join` CTAs from share chrome MUST NOT drop an available `via`.

#### Scenario: via on share path sets cookie or Join forwards via
- **WHEN** a recipient opens `/share/workouts/{token}?via={CODE}` (or planned equivalent) and continues to Get Started / Join
- **THEN** the referral `via` is available for signup attribution (cookie and/or `/join?via=` forwarding)

### Requirement: Baseline documents native content share
Product baseline docs SHALL state that attributed public share for activity and planned workouts is a native companion capability, while plan templates / catalog and Intervals publish remain web leftovers.

#### Scenario: Baseline split is documented
- **WHEN** this change is implemented
- **THEN** `docs/product-baseline.md` no longer classifies all “share” as web-only
