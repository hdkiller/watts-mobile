## Context

Coach chat already maps AI SDK tool parts into:

1. Pending approvals (`approval-requested`) → amber approve/deny card  
2. Terminal outcomes (`output-available` / `output-error` / `output-denied`) → compact `ToolOutcomeCard`  
3. Curated success copy for nutrition writes + wellness/recovery (~10 tools); everything else uses `humanizeToolName` generic text  

Non-terminal states (`call`, `input-streaming`, `input-available`, `partial-call`) are currently skipped — athletes only see “Coach is typing…” until the turn finishes. Web chat has domain cards, loading badges, planned-workout/ticket/chart specialty UIs; mobile deliberately stayed thin. This change is package **A**: expand curated copy for companion-critical tools and add shared visual chrome (loading + domain tint + approval polish), still without web rich-card parity.

## Goals / Non-Goals

**Goals:**

- Curated success copy for +12 companion tools (recommendations, planned lite, activity reads, nutrition reads), bringing curated coverage to ~22 / ~65 active tools (~34%).
- Surface in-progress tool chips from non-terminal tool parts while a turn is active.
- Domain buckets (nutrition · wellness · planning · workouts · other) drive tint/icon on chips and outcome cards.
- Approval cards use `humanizeToolName` and an optional one-line arg preview from common keys.
- Keep tests as the contract for allowlists + status mapping.

**Non-Goals:**

- Full web `ChatDomainToolCard` / planned-workout mini chart / ticket preview / `create_chart` viz / raw JSON expand.
- Payload one-liners from tool **output** (package B later).
- Deep-links from outcome cards into planned/activity detail.
- New coach-wattz endpoints or skill-registry changes.
- Tickets, memory tools, nutrition planning/grocery, analysis charts as curated domains.

## Decisions

1. **Allowlist expansion as named sets in `types.ts`**  
   Add `RECOMMENDATION_TOOL_NAMES`, `PLANNED_TOOL_NAMES`, `ACTIVITY_TOOL_NAMES`, and extend nutrition with read tools (either fold into `NUTRITION_TOOL_NAMES` or a sibling set used only for curated copy). Wire all sets through `curatedSuccessCopy` with one-line athlete-facing strings.  
   *Alternative:* single mega-map object — rejected for consistency with existing Set-based pattern and tests.

2. **In-progress extraction mirrors terminal summarizer**  
   Add something like `toolInProgressSummaries(message)` that returns `{ id, toolName, domain, label }` for parts whose resolved status is null but look like active tool calls. Dedupe by `toolCallId`. Render muted chips under the bubble (or under the synthetic typing row) only while the message/turn is still active — clear when parts become terminal (outcome cards replace them).  
   *Alternative:* one global “Working on it…” chip — rejected; per-tool chips are clearer when multiple tools run.

3. **Five domain buckets, not web’s eight**  
   Map tool names → `nutrition | wellness | planning | workouts | other`. Recommendations and planned tools share `planning`. Profile/memory/tickets/analysis/utility → `other`. Domain only affects tint/icon; copy still comes from curated map or generic humanize.  
   *Alternative:* copy web’s full domain taxonomy — rejected as overkill for companion chrome.

4. **Approval polish without payload parsing depth**  
   Title: `Approve ${humanizeToolName(toolName)}?`. Subtitle: first non-empty among `args.title`, `args.name`, `args.date` (stringified/short). No ticket-specific preview.  
   *Alternative:* show full args JSON — rejected for athlete UX.

5. **Reuse existing `ToolOutcomeCard` shell; extend props**  
   Pass `domain` (and optionally `phase: 'pending' | 'success' | 'failure' | 'denied'`) so one component (or a thin sibling `ToolProgressChip`) owns tint/icon. Prefer SF Symbol / emoji glyph pattern already used in `CoachChat.tsx`.  
   *Alternative:* separate card components per domain — rejected; status + domain tokens are enough.

6. **Curated tool list (package A)**  

   | Set | Tools |
   |-----|--------|
   | Existing nutrition writes | `log_nutrition_meal`, `log_hydration_intake`, `patch_nutrition_items`, `delete_nutrition_item`, `delete_hydration` |
   | Nutrition reads (new) | `get_nutrition_log`, `get_daily_fueling_status` |
   | Existing wellness/recovery | `get_wellness_metrics`, `get_wellness_events`, `record_wellness_event`, `update_wellness_event`, `delete_wellness_event` |
   | Recommendations (new) | `recommend_workout`, `get_recommendation_details`, `list_pending_recommendations` |
   | Planned lite (new) | `create_planned_workout`, `update_planned_workout`, `reschedule_planned_workout`, `get_planned_workouts`, `get_planned_workout_details` |
   | Activity reads (new) | `get_recent_workouts`, `search_workouts`, `get_workout_details` |

7. **No backend dependency**  
   Client-only. If a tool name drifts in coach-wattz, generic fallback still works; tests lock the known list.

## Risks / Trade-offs

- **[Risk] Tool name drift vs coach-wattz** → Mitigation: curated sets are best-effort; generic fallback + unit tests; document source as skills registry.
- **[Risk] In-progress chips flicker or duplicate during streaming** → Mitigation: dedupe by `toolCallId`; only show for non-terminal states; hide when terminal summary exists for same id.
- **[Risk] Domain tint noise on every generic tool** → Mitigation: keep `other` visually quiet (neutral border); reserve stronger accents for named buckets.
- **[Risk] Scope creep into rich cards** → Mitigation: explicit non-goals; package B (output one-liners) is a separate change.

## Migration Plan

1. Expand types/allowlists + `curatedSuccessCopy` + tests.  
2. Add in-progress summarizer + UI chips.  
3. Add domain mapping + tint/icon on progress + outcome + approval.  
4. Polish approval title/subtitle.  
5. Smoke: nutrition log, recommend/planned approve path, recent workout Q&A, generic tool still shows fallback.  
6. Archive OpenSpec change when done; update live `coach-chat-tool-feedback` purpose text if still TBD.

Rollback: revert the coach feature files; no data migration.

## Open Questions

- Whether in-progress chips should appear only on the synthetic typing message or also on the streaming assistant message once text starts — default: any message that still has non-terminal tool parts.
- Exact SF Symbol / emoji pairs per domain (decide at implement time to match existing chat glyphs).
