## Why

Coach chat already shows approve/deny and compact terminal outcome cards, but only ~10 tools have curated copy (nutrition writes + wellness/recovery). Most companion-critical tools (recommendations, planned sessions, recent activity, nutrition reads) fall through to generic “Coach updated …” text, and tools mid-flight stay invisible after “Coach is typing…”. Athletes need clearer in-thread feedback without porting full web tool cards.

## What Changes

- Expand curated success copy from nutrition/wellness-only to a thin companion set (+12 tools): recommendations, planned workout lite, activity reads, nutrition reads.
- Show **in-progress** tool chips while a turn is running (non-terminal tool parts), not only final success/fail/denied cards.
- Polish approval cards: title-cased humanized tool name; optional one-line preview from common args (`date`, `title`, `name`).
- Add light **domain tint/icon** buckets (nutrition · wellness · planning · workouts · other) on outcome and in-progress chips — shared chrome, not per-tool rich cards.
- Keep generic humanized fallback for all other tools; do **not** add planned-workout mini charts, ticket cards, `create_chart` viz, raw JSON expand, or memory side panels.

## Capabilities

### New Capabilities

_None — extends existing coach tool feedback._

### Modified Capabilities

- `coach-chat-tool-feedback`: Broaden curated outcome requirements beyond nutrition; add in-progress tool visibility, approval presentation polish, and domain-bucket visual chrome for compact chips/cards.

## Impact

- **Mobile UI/logic:** `src/features/coach/types.ts` (allowlists), `mapMessages.ts` (curated copy, in-progress extraction, approval preview helpers), `CoachChat.tsx` (chip/card chrome, approval polish). Tests in `mapMessages.test.ts`.
- **Specs/docs:** Update `openspec/specs/coach-chat-tool-feedback` via this change’s delta; optional note in `docs/product-baseline.md` coach-chat bullet if wording still says “nutrition, recovery/wellness, generic” only.
- **Backend:** None expected — same AI SDK tool part shapes and approval protocol as today. Tool names must stay aligned with coach-wattz skill registry (`server/utils/chat/skills.ts`); no new endpoints.
- **Non-goals preserved:** Full web tool-card parity, charts, tickets, nutrition planning/grocery, edit/regenerate, memory panel.
