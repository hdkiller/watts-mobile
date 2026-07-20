# analyze-readiness Specification

## Purpose
TBD - created by archiving change analyze-readiness-generate. Update Purpose after archive.
## Requirements
### Requirement: Trigger Analyze Readiness from Today
When there is no usable recommendation for today (and the product empty/no-recommendation path applies), the Today surface SHALL offer an Analyze Readiness action that calls `POST /api/recommendations/today` with Bearer auth and the confirmed recommendation scope.

#### Scenario: Start generate
- **WHEN** the user taps Analyze Readiness and the API accepts the request
- **THEN** the app enters a generating state and does not invent a recommendation client-side

#### Scenario: Endpoint unavailable
- **WHEN** the generate endpoint is not Bearer-capable or returns unauthorized for the client
- **THEN** the app MUST NOT show a fake generate CTA and MAY keep Open web / Retry only

### Requirement: Generating, quota, and failure states
While generation is in flight, Today SHALL show an honest generating state. On quota exceeded (e.g. 429) or hard failure, Today SHALL show clear copy and allow Retry and/or Open web. The system MUST NOT spin forever without a timeout or leave path.

#### Scenario: Generating
- **WHEN** generate has started successfully
- **THEN** the user sees a generating/progress state until a recommendation appears, status reports idle with no recommendation, timeout, or error

#### Scenario: Quota exceeded
- **WHEN** the generate API returns quota exceeded
- **THEN** the user sees an honest quota message and can open web or dismiss/retry later

#### Scenario: Failure
- **WHEN** generate fails or status indicates failure after start
- **THEN** the user sees an error state with Retry and Open web

### Requirement: Refresh into recommendation hero
When generation completes with a recommendation, Today SHALL refetch or otherwise load `GET /api/recommendations/today` and present the normal recommendation hero and primary CTAs (Accept / Modify / Rest per existing recommendation-actions).

#### Scenario: Recommendation ready
- **WHEN** today’s recommendation becomes available after generate
- **THEN** Today shows the recommendation decision surface instead of the empty generate CTA

### Requirement: Status polling without a new BFF
The client SHALL determine in-flight vs complete using `GET /api/recommendations/status` (when Bearer-available) and/or refetching `GET /api/recommendations/today`, without inventing a mobile-only aggregate endpoint.

#### Scenario: Poll while running
- **WHEN** generate returns a job id or status reports running
- **THEN** the client periodically checks status or refetches today until terminal or timeout

### Requirement: Shared in-flight generation lock
While Analyze Readiness or Refine or Refresh generation is in flight, Today SHALL treat generation as a single shared busy state so the user cannot start a second generate/refine job from another CTA.

#### Scenario: Refine blocked while analyzing
- **WHEN** Analyze Readiness is generating
- **THEN** Refine submit is disabled or ignored until the job finishes or times out

#### Scenario: Analyze blocked while refining
- **WHEN** Refine or Refresh is generating
- **THEN** Analyze Readiness is not startable until the job finishes or times out

