## 1. Curated allowlists and copy

- [x] 1.1 Add `RECOMMENDATION_TOOL_NAMES`, `PLANNED_TOOL_NAMES`, and `ACTIVITY_TOOL_NAMES` sets in `src/features/coach/types.ts`; extend nutrition coverage with `get_nutrition_log` and `get_daily_fueling_status`
- [x] 1.2 Extend `curatedSuccessCopy` / `outcomeMessage` in `mapMessages.ts` with athlete-facing one-liners for the new curated tools (keep generic humanize fallback for everything else)
- [x] 1.3 Add/update unit tests in `mapMessages.test.ts` for recommendation, planned, activity, and nutrition-read success copy plus a non-curated generic case

## 2. Domain buckets

- [x] 2.1 Add `resolveToolDomain(toolName)` mapping to `nutrition | wellness | planning | workouts | other` (recommendations + planned → `planning`)
- [x] 2.2 Plumb `domain` onto `ToolOutcomeSummary` (and any new in-progress type) so UI can tint without re-deriving names
- [x] 2.3 Cover domain resolution with unit tests for each bucket including `other`

## 3. In-progress tool chips

- [x] 3.1 Implement `toolInProgressSummaries(message)` for non-terminal tool parts; dedupe by `toolCallId`; exclude ids that already have a terminal outcome
- [x] 3.2 Render muted in-progress chips in `CoachChat.tsx` (domain tint/icon + humanized running label)
- [x] 3.3 Unit-test in-progress extraction for `call` / `input-streaming` and clearance when status becomes terminal

## 4. Outcome and approval UI polish

- [x] 4.1 Update `ToolOutcomeCard` (or shared chip shell) to use domain tint/icon while preserving success / failure / denied status colors
- [x] 4.2 Polish approval cards: `humanizeToolName` title; optional one-line preview from `args.title` | `args.name` | `args.date`
- [x] 4.3 Add tests for approval preview helper (present vs missing common args)

## 5. Docs and smoke

- [x] 5.1 Align `docs/product-baseline.md` coach-chat bullet with broader curated tool feedback (still not full web card parity)
- [x] 5.2 Manual smoke: nutrition write/read, recommendation or planned approve path, recent-workout question, generic tool fallback, in-progress → terminal transition
