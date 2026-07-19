## ADDED Requirements

### Requirement: Wellness check-in is not Daily Coach Check-In
The Log tab wellness form SHALL remain the athlete-reported wellness path (`POST /api/wellness`) and MUST NOT host or replace the AI Daily Coach Check-In questionnaire (`/api/checkin/*`). Product copy MAY refer to Log as wellness check-in to reduce confusion with Daily Coach Check-In on Today.

#### Scenario: Log stays wellness
- **WHEN** the authenticated user opens Log
- **THEN** they see the wellness form (and recovery jobs) and do not complete the AI Daily Coach Check-In questionnaire there
