# account-more Delta — App Chrome Essentials

## ADDED Requirements

### Requirement: About and legal on More
The More tab SHALL display the app version and native build number, and SHALL provide Privacy policy and Terms links plus a Support contact action when their destination URLs are configured. Legal links SHALL open in the system browser; rows with unconfigured URLs MUST NOT render as dead links.

#### Scenario: Version visible
- **WHEN** the authenticated user opens More
- **THEN** the app version and build number are visible (e.g. "v0.1.0 (12)")

#### Scenario: Legal links open
- **WHEN** the user taps Privacy policy or Terms
- **THEN** the corresponding canonical page opens in the system browser

#### Scenario: Unconfigured link hidden
- **WHEN** a legal or support URL is not configured
- **THEN** that row is omitted rather than rendered as a non-functional link
