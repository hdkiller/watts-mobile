## Why

Coach already supports sessions, photos, and minimal nutrition tool approvals/summaries, but assistant replies are plain text and non-nutrition tools stay opaque. Field coaching (recovery logs, wellness, planned tweaks) needs clearer tool cards and readable coach formatting without porting the full web chat chrome.

## What Changes

- Render **markdown-lite** in assistant bubbles (bold, lists, links open in-app/browser) so coach explanations are readable on device.
- Expand tool feedback beyond nutrition: compact success/failure cards for recovery, wellness, and other common athlete tools the server already emits; keep approve/deny for pending approvals.
- Improve failed-tool and denied-approval copy so athletes know what happened and can retry in chat or use Log.
- Optional: short “what Coach did” grouping when a turn completes multiple tools (still in-thread, not a side panel).
- No new coach-wattz endpoints expected if message parts / metadata already carry tool results (confirm against web synthesis); document any missing Bearer gaps if found.
- Update product baseline / coach specs: companion chat is markdown + multi-tool feedback, not nutrition-only.

## Capabilities

### New Capabilities

- `coach-chat-rich-messages`: Markdown-lite assistant rendering and safer link handling in Coach bubbles.

### Modified Capabilities

- `coach-chat-tool-feedback`: Broader tool result cards (recovery / wellness / generic) and clearer failure/deny states; nutrition path remains.
- `coach-chat`: Assistant message rendering uses rich-message rules; composer/send contract unchanged.

## Impact

- **watts-mobile:** `CoachChat` bubble rendering, `mapMessages` tool summarizers, optional markdown dependency, unit tests.
- **coach-wattz:** Usually none; spike may reveal tool-part shapes that need documenting only.
- **Out of scope:** Voice/TTS/video, full web tool-card parity, edit/regenerate/reply-to/share, memory panel, room rename/delete/search, coaching team inbox, dedicated meal OCR / barcode on Log.
