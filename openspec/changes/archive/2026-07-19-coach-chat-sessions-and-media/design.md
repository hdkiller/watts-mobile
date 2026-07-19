## Context

Phase 3 shipped a single-room Coach tab: load `GET /api/chat/rooms`, always use `rooms[0]`, text-only `useChat` + Bearer WebSocket. Web (`chat.vue`) instead:

1. Opens last room if `lastMessageAt` (exposed as `index`) is within **15 minutes**, else `POST /api/chat/rooms`
2. Keeps a room sidebar (list / new / select / rename / delete)
3. Attaches photos/videos via `POST /api/storage/upload` then AI SDK `file` parts
4. Renders tool results and approval cards (nutrition logging depends on this)

Mobile nutrition quick-log on Log is form-based only. Meal-from-photo is an implicit multimodal path on the server (no separate OCR API): attach image → model → `log_nutrition_meal` tools.

**Blocker for photos:** `/api/storage/upload` is session-cookie only today; chat message POST already accepts Bearer + file parts.

## Goals / Non-Goals

**Goals:**

- Web-parity **session open policy** (15-minute reuse vs new room)
- Room **list + switch + new chat** UX sufficient for field use
- Honor **`/chat/:roomId`** deep links
- **Photo** capture/library → upload → send/render in Coach (nutrition primary use case)
- Minimal **tool feedback / approval** so nutrition logs from chat are visible and confirmable
- coach-wattz Bearer upload path + store privacy updates for camera/photos

**Non-Goals:**

- Voice / TTS / video attach (follow-up; same session-only API class)
- Full web tool-card / markdown / edit-regenerate / reply-to / share / memory panel parity
- Room rename / delete / search (list + new is enough for v1.x)
- Dedicated meal OCR API or barcode scanner on Log
- Coaching team inbox

## Decisions

1. **Session open policy mirrors web**  
   Constant `CHAT_SESSION_REUSE_MS = 15 * 60 * 1000`. On Coach mount with no target `roomId`: if rooms empty → create; else if `now - rooms[0].index > threshold` → create; else select `rooms[0]`.  
   *Alternative considered:* Always reuse last room (current mobile) — rejected; stale context hurts coaching and nutrition.  
   *Alternative:* Use Telegram’s 6h — rejected; match web athlete UX unless product later unifies channels.

2. **Explicit room target wins**  
   Deep link `/chat/:roomId`, in-app “open room X”, or Log “continue this chat” bypasses the 15-minute rule and selects that room (404 → toast + session policy fallback).

3. **IA: keep Coach tab + rooms sheet**  
   Primary surface stays the tab thread. Header: tappable title / “Chats” opens a sheet/modal with room list + New chat. Avoid a full stack rewrite in this change; optionally pass `roomId` via search params or feature state for deep links.  
   *Alternative:* Expo Router `/coach/[roomId]` stack — better long-term; defer if sheet + state is faster for first ship. Prefer stack if deep-link wiring is cleaner during implement.

4. **Remember last-opened locally**  
   Persist last `roomId` in MMKV/SecureStore for warm resumes within the same app session when deep link absent — but cold Coach open still applies 15-minute policy against **server** `index` (web parity), not local-only recency.

5. **Photos only (not video) in v1 of this change**  
   Camera + library via `expo-image-picker`; resize/compress client-side before upload (web normalizes images). Max count align with web (≤ 4). Video deferred.

6. **Upload path: Bearer on existing storage API**  
   coach-wattz: switch `upload.post.ts` from `getServerSession` to `requireAuth` with an appropriate write scope (prefer existing profile/storage pattern if any; else `chat:write` for chat-originated uploads, or a dedicated `storage:write` if IdP already has it — **confirm against coach-wattz scopes before implementing**). Mobile uploads multipart with Bearer, receives public URL, then sends `{ type: 'file', url, mediaType, filename }` parts via `useChat` / transport body.

7. **Message mapping keeps file parts**  
   Update `mapMessages` to preserve `file` parts; render images in bubbles. Text remains primary for assistant; non-image files can show a simple attachment chip.

8. **Tool feedback: approvals + short result summaries**  
   Port the minimum from web: synthesize/display `tool-approval-request` parts; allow approve/deny against the same API web uses; show a compact summary when nutrition tools succeed (`log_nutrition_meal`, hydration). Do not port every domain card.  
   Without this, photo meal logging “works” server-side but athletes cannot confirm deletes/sensitive tools or see that food was logged.

9. **Seeding**  
   Re-apply today/recovery seed on **first send from an empty newly created/selected empty room** (same as phase-3 behavior, but now triggered after auto-new-chat).

10. **Log → Coach photo handoff**  
    Nutrition section gains “Log with photo” → navigate Coach, ensure session policy (or force new if last room has unrelated long history — default: use session policy), open camera/attach sheet. Composer may stay empty; photo alone is enough to send.

11. **Read-only rooms**  
    If selected room `isReadOnly`, disable composer/attach and show a short explanation + “New chat” CTA.

## Risks / Trade-offs

- [Upload auth scope choice] → Align with coach-wattz public scopes / Official Mobile App consent; document in `docs/oauth-setup.md` if a new scope is required  
- [15-minute auto-create floods room list] → Same as web; room list mitigates; later prune/archive is web’s problem too  
- [Large HEIC uploads] → Client compress to JPEG/WebP; respect server 15MB image limit  
- [Tool approval protocol drift] → Mirror web’s approval submission path; add a focused spike task if mobile AI SDK parts differ  
- [Store review photo permission] → Purpose string must say Coach chat / nutrition logging, not broad photo access  
- [Permission denial] → Graceful fallback to library-only or text nutrition quick-log on Log  

## Migration Plan

1. Land coach-wattz Bearer upload (and scope) first or in parallel; mobile feature-flags attach until API is live  
2. Ship sessions (list + 15-min policy + deep link) even if media waits on backend  
3. Ship media + tool feedback once upload works  
4. Update `docs/deep-links.md`, `docs/store-privacy-checklist.md`, `docs/open-questions.md`  
5. Rollback: sessions can ship alone; media can hide attach button if upload 401s

## Open Questions

- Exact OAuth scope for `POST /api/storage/upload` under Bearer (`chat:write` vs dedicated storage scope)  
- Sheet vs `/coach/[roomId]` route for v1 of this change (implementer picks based on deep-link ergonomics; both meet specs if room targeting works)  
- Whether COACH_MESSAGE push payloads should include `roomId` (nice-to-have; out of band if server doesn’t send it yet)
