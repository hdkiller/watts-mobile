## ADDED Requirements

### Requirement: Athlete referral share link

The system SHALL provide each authenticated athlete a stable opaque referral code and a share URL of the form `{site}/join?via={CODE}` with UTMs `utm_source=in_app_share`, `utm_medium` in `{mobile_qr,web_share,link}`, and `utm_campaign=athlete_referral`.

#### Scenario: First fetch mints a code

- **WHEN** an authenticated athlete calls `GET /api/referrals/me`
- **THEN** the response includes `code`, `shareUrl`, and `stats.attributedCount`, minting `User.referralCode` if absent

#### Scenario: Regenerate rotates the code

- **WHEN** an authenticated athlete calls `POST /api/referrals/me/regenerate`
- **THEN** a new code is assigned and prior codes stop resolving for new attributions

### Requirement: First-touch A→B attribution

On new account creation, the system SHALL attribute the invitee to the referrer identified by a valid `via` code (from cookie and/or claim body) without granting rewards in this change.

#### Scenario: Successful attribution

- **WHEN** a new user completes signup with a pending valid `via` for Athlete A
- **THEN** the system stores `User.referredByUserId = A`, creates a `Referral` row with status `ATTRIBUTED`, and clears the pending cookie

#### Scenario: Guards

- **WHEN** the code is missing, unknown, self-referral, or the invitee already has `referredByUserId`
- **THEN** the system does not overwrite attribution and ignores invalid codes silently

### Requirement: Mobile invite surface

On hosted Coach Watts and local loopback instances, the mobile app SHALL expose More → Invite friends with QR encoding `shareUrl`, copy link/code, and the system share sheet.

#### Scenario: Open invite from More

- **WHEN** the athlete taps Invite friends on a supported instance
- **THEN** the invite screen loads the referral payload and shows a scannable QR for the share URL

#### Scenario: Open invite from Athlete profile

- **WHEN** the athlete opens Athlete (including from the Today greeting name) on a supported instance
- **THEN** Invite friends appears at the bottom of the Athlete screen and opens the same invite share surface

#### Scenario: Hidden on custom self-hosted

- **WHEN** the configured instance host is not coachwatts.com / www / localhost / 127.0.0.1
- **THEN** the Invite friends row is not shown on More or Athlete
