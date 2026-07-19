## Context

Past and planned detail screens are intentionally lite: meta fields, optional structure steps / description, and Open web. A gap analysis showed athletes still bounce to web for a handful of summary numbers that Bearer APIs already return without streams or the cookie-only planned aggregate.

Existing endpoints:

- `GET /api/workouts/:id?includeStreams=false` — full Prisma Workout row; streams null; summary columns present (`distanceMeters`, `averageWatts`, `normalizedPower`, `averageHr`, `elevationGain`, `intensity`).
- `GET /api/planned-workouts/:id` — Prisma PlannedWorkout row; `workIntensity`, `completionStatus`, `syncStatus`, `structuredWorkout` (may include `coachInstructions` string and `zoneProfileSnapshot`).

## Goals / Non-Goals

**Goals:**

- Surface field-useful summary metrics on past activity detail when present.
- Surface planned intensity, status badges, short coach instructions, and a compact zone summary when present.
- Map only real API field names; omit sections entirely when data is absent (no invented zeros).
- Keep screens read-only; retain Open web for depth.

**Non-Goals:**

- Charts, streams, maps, AI analysis, plan adherence UI.
- Structure editing, publish/export, schedule/TSS mutations.
- Mission/week context (requires web-only `/api/workouts/planned/:id`).
- Fueling logistics / NutritionPrepCard.
- Complete/skip on detail (stays Today when APIs land).
- Backend changes.

## Decisions

1. **Use Prisma/Bearer field names; format in the mapper**
   - Past: `distanceMeters` → km/mi-agnostic compact distance (prefer km with 1 decimal when ≥ 1000 m, else meters); `averageWatts` / `normalizedPower` → rounded W; `averageHr` → bpm; `elevationGain` → m; `intensity` → `IF 0.xx` when 0–2-ish.
   - Planned: `workIntensity` → same IF formatting; do not expect `intensityFactor`.
   - Alternative rejected: inventing mobile aliases (`avgPower`) that diverge from OpenAPI.

2. **Metrics as a simple labeled grid, not a dashboard**
   - Past detail: one “Summary” row/grid of present metrics only (2-column text pairs).
   - Omit the whole section if every metric is null.
   - Alternative rejected: porting web hero + secondary metric HUD.

3. **Coach instructions = string only, capped**
   - Read `structuredWorkout.coachInstructions` when it is a non-empty string.
   - Show under a “Coach cues” heading; truncate display at ~400 chars with ellipsis (full text still available on web).
   - Ignore non-string / empty values. Do not fetch top-level `coachInstructions` (not on Prisma row).

4. **Zones = compact named list, not charts**
   - Prefer `structuredWorkout.zoneProfileSnapshot` channels that have ranges.
   - Show at most one primary channel (power → HR → pace) with up to 8 named ranges (`name` or `Z1`… fallback) and min–max labels with units (W / bpm / pace).
   - If snapshot absent or empty ranges → omit section.
   - Alternative rejected: zone distribution charts or live `sportSettings` from web aggregate.

5. **Status badges from existing typed fields**
   - Map `completionStatus` / `syncStatus` to short human labels when non-empty; omit when null/default noise if both absent.
   - Do not invent sync progress.

6. **Tests in `mapActivity.test.ts`**
   - Cover metric mapping, IF formatting edge cases, coachInstructions extraction, zone snapshot compact mapping, and “all null → empty section data”.

## Risks / Trade-offs

- **[Risk] Unit preference (km vs mi)** → Mitigation: start with metric formatting consistent with companion density; locale-aware imperial can follow later without API changes.
- **[Risk] `intensity` / `workIntensity` scale ambiguity** → Mitigation: only format when finite and in a sensible IF band (e.g. 0.1–2.0); otherwise omit.
- **[Risk] Zone snapshot present but unnamed / huge** → Mitigation: cap to 8 ranges; synthetic Z1… labels; omit empty channels.
- **[Risk] Payload bloat curiosity** → Mitigation: still call `includeStreams=false`; no extra requests.

## Migration Plan

- Ship client-only. No migrations.
- Rollback = revert mapper + screen UI; APIs unchanged.

## Open Questions

- None blocking. Imperial distance/elevation preference can be a follow-up if athletes request it.
