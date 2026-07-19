## Context

`coach-chat-sessions-and-media` shipped rooms, photos, and nutrition-focused approvals/summaries. Bubbles still use plain `Text`; `nutritionToolSummaries` only maps a small nutrition allowlist. Web chat non-goals from that change (full tool-card / markdown / edit-regenerate parity) still stand as non-goals for complete parity — this change takes the next thin slice: readable coach text + broader tool outcome cards.

## Goals / Non-Goals

**Goals:**
- Markdown-lite assistant rendering
- Tool outcome cards for recovery/wellness + generic fallback
- Clear failed/denied states
- Keep approve/deny path working

**Non-Goals:**
- Full web tool-card / memory panel / edit-regenerate / reply-to / share
- Voice, video, TTS
- Room rename/delete/search
- New coach-wattz endpoints (unless spike finds a Bearer gap)

## Decisions

1. **Markdown-lite, not full GFM HTML**  
   Use a small RN markdown renderer (or constrained subset) for assistant text only. Disable raw HTML. Links → `Linking` / Open web.  
   *Alternative:* ship full GFM — rejected (size, XSS footguns, list styling churn).

2. **Generalize summarizer API**  
   Evolve `nutritionToolSummaries` into `toolOutcomeSummaries` (or parallel helpers) with curated maps for nutrition, recovery, wellness + humanized generic fallback. Keep unit tests as the contract.  
   *Alternative:* render raw tool JSON — rejected for athletes.

3. **Failure/deny is first-class**  
   Parse tool part states for error/denied; show one-line cards. Do not auto-retry.

4. **No side panel “what Coach did”**  
   Optional: if multiple tools finish in one message, stack compact cards under the bubble (already natural). No separate activity drawer.

5. **Dependency**  
   Prefer a maintained RN markdown lib already compatible with Expo SDK in use; if none fits lightly, implement a minimal subset (bold/links/lists) without a heavy editor stack. Rebuild only if a native module is required (prefer pure JS).

6. **coach-wattz**  
   Spike tool names against web AI tools list; document mapping in oauth/chat notes. Backend change only if approvals/results missing on Bearer WS path (regression, not feature).

## Risks / Trade-offs

- **[Risk] Markdown breaks layout / huge messages** → Mitigation: constrain styles; truncate extreme lists visually if needed.
- **[Risk] Tool name drift** → Mitigation: generic fallback + tests for known tools; don’t require perfect catalog.
- **[Risk] Link phishing** → Mitigation: only http(s); show URL host when possible.

## Migration Plan

1. Spike tool part shapes + choose markdown approach.
2. Ship rich text rendering behind assistant bubbles.
3. Expand tool outcome summarizers + failure/deny UI.
4. Update docs; archive when smoke passes.

## Open Questions

- Exact markdown library vs hand-rolled subset.
- Full curated list of recovery/wellness tool names from coach-wattz.
- Whether user messages ever need markdown (default no).
