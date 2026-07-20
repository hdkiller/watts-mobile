## ADDED Requirements

### Requirement: Open web uses session handoff helper
The More tab Open web action SHALL use the shared instance Open web helper that mints an app→web handoff before opening the browser, with bare-URL fallback on mint failure. External About links (privacy, terms, support) MUST NOT use handoff.

#### Scenario: More Open web hands off
- **WHEN** the authenticated user chooses Open web on More
- **THEN** the app opens a handoff consume URL for the instance home (or bare instance URL if mint fails)

#### Scenario: About links skip handoff
- **WHEN** the user opens Privacy policy, Terms, or Support from More
- **THEN** those URLs open directly without a handoff mint
