## MODIFIED Requirements

### Requirement: Activation wizard route gate
When the athlete is authenticated but not soft-activated (missing consent, primary goal, activated plan, or first insight per server flags), the app SHALL route them into the activation wizard stack and MUST NOT present the five-tab shell as the primary experience.

#### Scenario: Incomplete soft activation
- **WHEN** soft activation is incomplete
- **THEN** navigation enters the activation wizard at the current server step

#### Scenario: Resume after kill
- **WHEN** the user force-quits mid-wizard and relaunches with a valid session
- **THEN** the app resumes the wizard at the server-derived current step

#### Scenario: Soft-activated enters tabs
- **WHEN** soft activation is complete
- **THEN** the user can access Today, Plan, Log, Coach, and More
