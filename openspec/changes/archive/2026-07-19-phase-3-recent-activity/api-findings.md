# API findings (coach-wattz) — phase-3-recent-activity

Confirmed 2026-07-19 against local coach-wattz sources.

## 1.1 Workout list — sync / analysis status

`GET /api/workouts` — Bearer `workout:read` via `requireAuth`.

Relevant select fields for mobile rows:

| Field | Notes |
|-------|--------|
| `aiAnalysisStatus` | Present. Values used in codebase: `NOT_STARTED`, `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED` |
| `streams` | Present as `{ id }` only (payload optimization). Useful as “has data” hint, not a sync state machine |
| `tss`, `trainingLoad`, `overallScore` | Present when computed |
| `syncStatus` | **Not** on Workout list select / OpenAPI Workout schema |

**Mobile mapping:** drive row status from `aiAnalysisStatus`; if absent/unknown use neutral “Uploaded”. Do not invent sync progress bars.

## 1.2 Planned list + detail auth

| Endpoint | Auth | Query / notes |
|----------|------|----------------|
| `GET /api/planned-workouts` | Bearer `workout:read` | `startDate`, `endDate`, `limit`, `independentOnly` |
| `GET /api/planned-workouts/:id` | **Was session-only** (`getServerSession`) | Returns full Prisma row via `plannedWorkoutRepository.getById` |
| `GET /api/workouts/planned/:id` | Also session-only (richer includes) | Web UI path; not required for mobile lite |

**Fix applied in coach-wattz:** `planned-workouts/[id].get.ts` switched to `requireAuth(..., ['workout:read'])` + `getEffectiveUserId` (small Bearer parity with list). No large rewrite.

## 1.3 Planned structure fields

Detail payload includes `structuredWorkout` (Json). Compact summary can use:

- `structuredWorkout.steps[]` — step `name` / `type`, `durationSeconds` (or `duration`), optional intensity targets (`power`, `heartRate`, `pace`, `rpe`)
- Nested reps blocks may appear; flatten one level for lite UI

**No secondary endpoint required** for v1 glance (`intervals-preview` is web-only depth). If `structuredWorkout` is null/empty, show description + Open web only.
