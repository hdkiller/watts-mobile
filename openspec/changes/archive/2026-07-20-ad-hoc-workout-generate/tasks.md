## 1. Backend prerequisite (coach-wattz)

- [x] 1.1 Migrate `POST /api/workouts/generate` from `getServerSession` to `requireAuth` with `workout:write`
- [x] 1.2 Confirm Official Mobile App / REST scopes include `workout:write` for generate; keep 429 quota behavior for `generate_structured_workout`
- [x] 1.3 Decide and implement Bearer completion observation (task status endpoint and/or documented refetch-only contract)

## 2. Mobile API and state

- [x] 2.1 Add `generateAdHocWorkout` API helper + typed request/response
- [x] 2.2 Add TanStack mutation with generating / quota / error states and Today + planned query invalidation
- [x] 2.3 Implement poll/refetch loop until new planned workout appears or timeout

## 3. Form sheet and Today CTA

- [x] 3.1 Build `CreateAdHocWorkoutSheet` (type, duration, intensity, notes) with web defaults and validation
- [x] 3.2 Add secondary Generate Ad-Hoc Workout CTA on Today (recommendation, planned-only, and empty when Bearer-ready)
- [x] 3.3 Hide/disable CTA when endpoint unavailable or generation in flight; show quota + Open web on 429

## 4. Verification

- [x] 4.1 Manual check: generate Ride 60 Endurance, see planned workout on Today; timeout and 429 paths
- [x] 4.2 Unit tests for form defaults/validation and API error mapping
- [x] 4.3 Document any open status-endpoint follow-up in `docs/open-questions.md` if refetch-only ships first
