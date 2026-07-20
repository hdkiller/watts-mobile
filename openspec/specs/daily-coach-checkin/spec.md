# daily-coach-checkin Specification

## Purpose
TBD - created by archiving change daily-coach-checkin. Update Purpose after archive.
## Requirements
### Requirement: Trigger Daily Coach Check-In from Today
When today’s AI Daily Coach Check-In is incomplete (no check-in, or questions exist without every question answered), the Today surface SHALL offer a Daily Coach Check-In action (web parity label: “Do Quick Daily Coach Check-In” or a shorter equivalent). The action SHALL open a dedicated check-in sheet/screen and MUST NOT invent questions client-side.

#### Scenario: Incomplete check-in shows CTA
- **WHEN** today’s check-in is missing or any question lacks an answer
- **THEN** Today shows the Daily Coach Check-In action

#### Scenario: Completed check-in hides CTA
- **WHEN** today’s check-in has one or more questions and every question has an answer
- **THEN** Today does not show the incomplete-check-in CTA as a primary prompt

#### Scenario: Open check-in flow
- **WHEN** the user taps Daily Coach Check-In
- **THEN** the app opens the check-in sheet/screen (not the Log wellness form)

### Requirement: Load or generate today’s questionnaire
The check-in flow SHALL load `GET /api/checkin/today` with Bearer `health:read`. When no usable completed questionnaire exists, it SHALL call `POST /api/checkin/generate` with Bearer `health:write` (optional `force` on retry). While status is `PENDING` or `PROCESSING`, the client SHALL poll by refetching today until questions are available, failure, or timeout.

#### Scenario: Generate when missing
- **WHEN** today returns null/empty and the user has started the flow
- **THEN** the app triggers generate and enters a generating state

#### Scenario: Poll while pending
- **WHEN** check-in status is pending or processing
- **THEN** the client periodically refetches today until terminal success, failure, or timeout

#### Scenario: Questions ready
- **WHEN** today returns questions with a non-pending status
- **THEN** the app presents YES/NO controls per question and an optional notes field

### Requirement: Save answers via Bearer API
Saving SHALL call `POST /api/checkin/answer` with Bearer `health:write` and body `{ checkinId, answers, userNotes? }` where answers map question ids to `YES` or `NO`. On success, Today SHALL refresh check-in completion state so the incomplete CTA can hide.

#### Scenario: Successful save
- **WHEN** the user saves answers for today’s check-in
- **THEN** the server receives the answer payload and the flow closes or shows success, and Today reflects completion

#### Scenario: Answer endpoint unavailable
- **WHEN** answer is not Bearer-capable
- **THEN** the app MUST NOT present a fake save path that cannot succeed and MAY keep Open web as the escape

### Requirement: Generating, quota, and failure states
While generation is in flight, the check-in flow SHALL show an honest generating state. On quota exceeded (e.g. 429), hard failure, or timeout, the flow SHALL show clear copy and allow Retry and/or Open web. The system MUST NOT spin forever without a timeout or leave path.

#### Scenario: Quota exceeded
- **WHEN** generate returns quota exceeded
- **THEN** the user sees an honest quota message and can open web or dismiss

#### Scenario: Generation failure
- **WHEN** generate fails or today status is FAILED
- **THEN** the user sees an error state with Retry

#### Scenario: Timeout
- **WHEN** polling exceeds the configured timeout without questions
- **THEN** the user sees a timeout state with Retry and/or Open web

### Requirement: Distinct from wellness Log check-in
Daily Coach Check-In SHALL use the `/api/checkin/*` questionnaire APIs and MUST NOT submit through `POST /api/wellness`. The Log wellness form remains a separate job.

#### Scenario: Different persistence path
- **WHEN** the user completes Daily Coach Check-In
- **THEN** answers are saved via `/api/checkin/answer`, not the wellness endpoint

