## Why

Coach chat is usable for a single sticky thread, but athletes cannot start a fresh session or switch rooms — web already auto-creates a new chat after **15 minutes** of inactivity and keeps a room list. Separately, field use (especially nutrition) needs **photo capture in chat** so Coach can estimate and log meals the way web already does via attachments + nutrition tools. Closing both gaps makes the Coach tab a real companion surface, not a half-port.

## What Changes

- **Session policy (web parity):** On Coach open with no explicit room target, reuse the most recent room if its last activity is ≤ 15 minutes; otherwise create a new room via `POST /api/chat/rooms`
- **Room list / switch / new chat:** Header affordance to browse rooms, select one, and create “New Chat”
- **Deep links:** Honor `/chat/:roomId` (scheme + universal) by opening that room when it exists
- **Photo attachments:** Camera + library pick → upload → send as AI SDK `file` parts on `POST /api/chat/messages` (attachment-only sends allowed, matching web)
- **Render media in thread:** Show image attachments in history (stop stripping non-text parts)
- **Tool feedback (nutrition-critical):** Surface coach tool results / approval prompts so meal logging from photo or NL is confirmable on device
- **coach-wattz:** Bearer-enable storage upload used by chat attachments (today session-only); document any new scope if required
- **Store / privacy:** Update privacy checklist and permission copy for photo library / camera use in Coach
- **Optional Log handoff:** From nutrition quick-log, “Log with photo” opens Coach with camera or attach ready (same room policy)

## Capabilities

### New Capabilities

- `coach-chat-sessions`: Open/create/switch policy, room list UI, last-activity threshold, deep-link room targeting
- `coach-chat-media`: Capture/pick photos, Bearer upload, send/render `file` parts in Coach
- `coach-chat-tool-feedback`: Show tool result summaries and approval actions needed for nutrition (and other) chat tools

### Modified Capabilities

- `coach-chat`: Default room-only behavior replaced by session policy; composer supports attachments; seeding applies to new empty rooms
- `deep-links`: `/chat/:roomId` MUST open the specified room when present
- `store-ready`: Photo/camera usage disclosed for Coach attachments
- `nutrition-quick-log`: Optional entry to Coach photo-log path from Log nutrition section

## Impact

- **watts-mobile:** `src/features/coach/*`, Coach tab routes (possible `/coach` stack + room sheet), `mapMessages`, deep-link resolver, store privacy docs, deps (`expo-image-picker` or equivalent)
- **coach-wattz (required):** Bearer (or mobile-scoped) auth on `POST /api/storage/upload`; confirm chat message file-part contract for mobile; no new nutrition OCR API — photo → LLM → existing `log_nutrition_meal` tools
- **Out of scope this change:** Voice input / TTS, video attach, full web tool-card parity, room rename/delete/share, markdown editor, edit/regenerate, coaching team inbox, barcode OCR on Log form
