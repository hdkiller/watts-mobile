## 1. API + job monitoring

- [x] 1.1 Confirm Bearer contracts for initialize, activate, generate-block, generate-ai-week, generate-structure
- [x] 1.2 Extract/extend plans API helpers + typed models for draft/active/job states
- [x] 1.3 Build reusable job poller (timeout, retry, cancel-on-unmount) with unit tests

## 2. Shared generator module

- [x] 2.1 Create shared generator UI flow (inputs → working → preview → activate)
- [x] 2.2 Refactor `app/(activation)/plan.tsx` to host the shared module
- [x] 2.3 Wire Plan → Training Create CTA to the shared module with Plan exit navigation
- [x] 2.4 Provisional copy when data is thin

## 3. Post-activate generation

- [x] 3.1 Trigger/monitor block or week workout generation from Plan Training
- [x] 3.2 Generate structure action on workouts missing structure (+ batch week if API supports)
- [x] 3.3 Optional AI-week instruction sheet for regenerate-week
- [x] 3.4 In-progress / failure UI on Plan Training; invalidate queries on completion

## 4. QA

- [x] 4.1 Unit tests for generator mappers + poller
- [x] 4.2 Update Maestro activation plan flow + Plan create smoke testIDs
- [x] 4.3 Manual: activation path unchanged exit; Plan create → active shell; structure generate; failure/retry
