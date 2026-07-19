## Context

Planned detail already loads `GET /api/planned-workouts/:id` and maps `structuredWorkout` for endurance structure (`steps` / `intervals`), coach cues, and zone snapshots. Strength sessions on coach-wattz use a different canonical shape:

```
structuredWorkout
  blocks[]                  // canonical strength
    type / title / notes
    steps[]                 // exercises
      name, setRows[], …
  exercises[]               // flattened legacy/compat view
  coachInstructions
  zoneProfileSnapshot?      // often HR for strength
```

`normalizeStructuredStrengthWorkout` in coach-wattz prefers `blocks` and may strip top-level interval `steps`. Mobile `mapPlannedStructure` ignores `blocks` / `exercises`, so gym sessions show empty structure even when the payload is rich.

## Goals / Non-Goals

**Goals:**

- Show a compact, honest exercise list for strength planned workouts in the companion.
- Prefer canonical `blocks`; fall back to legacy `exercises` when blocks are absent.
- Keep endurance mapping and zone/coach-cue behavior intact.
- Hide the interval intensity silhouette when the structure is strength-shaped.

**Non-Goals:**

- Strength editor, set logging, video player, or exercise-library browsing.
- New API endpoints or coach-wattz schema changes.
- Full set-by-set tables (per-row load variance) — compact summaries are enough for the field companion.
- Changing Today’s one-line `structureSummary` beyond optional later follow-up.

## Decisions

### 1. Map strength into the existing `structureSteps` list

**Choice:** Extend `mapPlannedStructure` (or a private helper it calls) to emit `PlannedStructureStep[]` from `blocks` / `exercises`, reusing the detail list UI.

**Why:** Avoid a parallel type/UI path for v1. Name stays the exercise name; put prescription text in `intensityLabel` (e.g. `3×5 · 80kg · 90s rest`); leave `durationSec` null unless a duration prescription is present.

**Alternatives considered:**

- New `strengthExercises` field + dedicated UI — clearer types, more surface area; defer unless compact reuse proves awkward.
- Only read flattened `exercises` — simpler, but loses block titles/grouping when present.

### 2. Prefer `blocks`, then `exercises`, then endurance `steps`/`intervals`

**Choice:** Detection order:

1. Non-empty `blocks` → flatten block steps (optionally prefix/insert block title rows when helpful).
2. Else non-empty `exercises` → map flat exercises.
3. Else existing `steps` / `intervals` flatten.

**Why:** Matches coach-wattz canonicalization. Prevents double-counting when both `blocks` and legacy `exercises` exist (normalization often supplies both).

### 3. Compact prescription string from `setRows`

**Choice:** Summarize like the web helper: set count from `setRows.length` (or `sets`), reps/value from unique `value`s, load from unique `loadValue`s, rest from `defaultRest` or first `restOverride`. Join non-empty parts with ` · `.

**Why:** Athletes need “what do I do?” not a spreadsheet. Divergent set loads become comma-joined values rather than inventing a single load.

### 4. No `StructureProfile` for strength

**Choice:** Treat structure as strength-shaped when mapped from `blocks`/`exercises` (flag on detail, or infer: no positive `durationSec` on ≥2 steps). Do not render the silhouette.

**Why:** Profile semantics are duration×intensity for intervals; strength rows lack that shape.

### 5. Block titles as optional section cues

**Choice:** When a block has a non-empty `title` (or typed warmup/cooldown), emit a lightweight list row with the title and no prescription, then its exercises — or prefix exercise names only if titles are noisy. Prefer distinct title rows for warmup / main / cooldown clarity.

**Why:** Matches how athletes scan the web strength plan without porting the full block UI.

## Risks / Trade-offs

- **[Risk] Divergent or incomplete strength JSON from older sessions** → Mitigation: tolerate missing `setRows` (show name only); never invent sets/reps; keep Open web CTA.
- **[Risk] Crowded list for large circuits** → Mitigation: keep existing 24-step cap; Open web for full depth.
- **[Risk] Overloading `intensityLabel` for non-intensity text** → Mitigation: acceptable for lite companion; rename/extend type later if a second strength surface needs structured fields.
- **[Trade-off] No interactive check-off / logging** → Acceptable; Log tab and web remain the places for completion workflows.

## Migration Plan

- Ship client-only mapping + UI; no data migration.
- Rollback = revert mobile change; API unchanged.

## Open Questions

- Should Today’s Coming up / planned card `structureSummary` say `N exercises` for strength instead of only counting interval steps? (Nice-to-have; not required for this change.)
- Per-side reps (`reps_per_side`) display: append `/side` when `prescriptionMode` says so (yes — mirror web flatten helper).
