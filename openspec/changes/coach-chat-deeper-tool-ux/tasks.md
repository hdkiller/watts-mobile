## 1. Spike and dependencies

- [ ] 1.1 Inventory coach-wattz tool names for recovery/wellness (and confirm nutrition set still matches)
- [ ] 1.2 Choose markdown-lite approach (library vs minimal custom) compatible with current Expo SDK; prefer JS-only
- [ ] 1.3 Confirm tool result / failure part shapes on Bearer WS + poll paths (document gaps only if found)

## 2. Rich messages

- [ ] 2.1 Add markdown-lite renderer for assistant text (emphasis, lists, links; no HTML execution)
- [ ] 2.2 Wire renderer into Coach bubbles; keep user text plain; preserve images
- [ ] 2.3 Link handling via system browser / existing open-web helpers

## 3. Broader tool feedback

- [ ] 3.1 Generalize nutrition summarizer into multi-domain tool outcome helpers (+ generic fallback)
- [ ] 3.2 Render recovery/wellness success cards; keep nutrition cards
- [ ] 3.3 Render failed tool and denied-approval states with honest copy
- [ ] 3.4 Ensure approve/deny path still works after renderer changes

## 4. Verify

- [ ] 4.1 Unit tests for tool outcome mapping (nutrition, recovery/wellness, generic, failure)
- [ ] 4.2 Manual smoke: markdown reply; photo meal approval; one non-nutrition tool confirmation
- [ ] 4.3 Update docs note that companion chat is markdown + multi-tool feedback (not nutrition-only)
