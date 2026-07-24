## ADDED Requirements

### Requirement: Invite friends entry on More

On hosted Coach Watts and local loopback instances, the More tab SHALL expose an Invite friends entry that opens the athlete referral share surface. Custom self-hosted instances SHALL omit the entry.

#### Scenario: Hosted athlete sees Invite friends

- **WHEN** the authenticated user opens More against `coachwatts.com` (or local loopback)
- **THEN** an Invite friends row is available and navigates to the invite share screen

#### Scenario: Custom instance hides Invite friends

- **WHEN** the authenticated user opens More against a custom self-hosted instance host
- **THEN** the Invite friends row is not shown
