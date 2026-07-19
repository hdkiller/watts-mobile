## ADDED Requirements

### Requirement: Daily Coach Check-In entry on Today
The Today tab SHALL offer Daily Coach Check-In when today’s AI questionnaire is incomplete, as a distinct action from Accept / Rest / Analyze Readiness and from Active Recovery Context wellness navigation. When the Bearer check-in APIs are unavailable, Today MUST NOT show a fake Daily Coach Check-In CTA.

#### Scenario: Incomplete shows coach check-in
- **WHEN** today’s AI Daily Coach Check-In is incomplete and Bearer check-in APIs are available
- **THEN** Today shows Daily Coach Check-In as a clear action

#### Scenario: Unavailable API
- **WHEN** generate or answer check-in endpoints are not Bearer-capable for the client
- **THEN** Today does not show a decorative Daily Coach Check-In button that cannot complete

## MODIFIED Requirements

### Requirement: Active recovery context on Today
The Today tab SHALL show a named **Active Recovery Context** band with a clear header and short helper that Coach Watts uses this context when generating today’s guidance. The band SHALL include compact chips for recovery-context items active today when any exist, an honest empty state when none exist, and secondary actions: Log event (recovery-event create), wellness Check in (Log tab wellness form, without duplicating the wellness form on Today), and a quiet History affordance (Log recovery section and/or existing web escape patterns). Wellness Check in MUST remain distinct from Daily Coach Check-In (AI questionnaire).

#### Scenario: Active chips visible
- **WHEN** one or more recovery-context items are active for the local today
- **THEN** Today shows the named band with compact chips for those items that open the item detail/edit flow when tapped

#### Scenario: Empty recovery context
- **WHEN** no recovery-context items are active for today
- **THEN** the named band still renders with an empty-state message and secondary Log event / wellness Check in actions

#### Scenario: Wellness check in from Today
- **WHEN** the user taps wellness Check in on the Active Recovery Context band
- **THEN** the app navigates to the Log tab (wellness section when supported) and MUST NOT render a second wellness form on Today and MUST NOT open the AI Daily Coach Check-In questionnaire

#### Scenario: Primary CTAs remain primary
- **WHEN** Today renders with a recommendation
- **THEN** Accept (and later Modify / Rest) remain the primary decision actions above Coming up / Recently glances; Active Recovery Context actions stay secondary
