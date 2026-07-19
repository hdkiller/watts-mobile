## 1. coach-wattz prerequisites

- [x] 1.1 Confirm OAuth scope for Bearer `POST /api/storage/upload` (`chat:write` vs dedicated storage scope) against public scopes / Official Mobile App
- [x] 1.2 Change `server/api/storage/upload.post.ts` to `requireAuth` with chosen scope (keep existing media type/size rules)
- [x] 1.3 Smoke Bearer upload from a token with companion scopes; document in coach-wattz or watts-mobile oauth notes
- [x] 1.4 Verify tool-approval submit API path used by web so mobile can reuse it (document endpoint + payload)

## 2. Session policy and room APIs (mobile)

- [x] 2.1 Extend chat room types with `index` / activity timestamp and `isReadOnly`
- [x] 2.2 Add `createChatRoom()` → `POST /api/chat/rooms` in coach API client
- [x] 2.3 Implement session open helper: 15-minute reuse vs create (web parity constant)
- [x] 2.4 Refactor `useCoachChat` bootstrap to use session policy + optional explicit `roomId` target
- [x] 2.5 Add `selectRoom` / `createRoom` / refresh rooms list in the hook

## 3. Room list UX

- [x] 3.1 Add header controls on Coach (room title tappable / Chats + New)
- [x] 3.2 Build room list sheet/modal (name, preview/time, active indicator)
- [x] 3.3 Wire switch + New chat; handle empty and error states
- [x] 3.4 Disable composer when `isReadOnly` and offer New chat CTA

## 4. Deep links

- [x] 4.1 Pass `roomId` from `/chat/:roomId` through resolver into Coach bootstrap
- [x] 4.2 Update `docs/deep-links.md` (remove “multi-room later”; document targeting)
- [x] 4.3 Cover missing-room fallback (toast + session policy)

## 5. Photo attach and send

- [x] 5.1 Add `expo-image-picker` (or chosen Expo media API) + app.json permission strings
- [x] 5.2 Implement pick/capture → compress → pending attachment UI (max 4 images)
- [x] 5.3 Implement Bearer multipart upload to `/api/storage/upload`
- [x] 5.4 Send `file` parts via `useChat` / transport (support attachment-only send)
- [x] 5.5 Update `mapMessages` to preserve file parts; render images in bubbles
- [x] 5.6 Handle upload/permission failures without breaking text chat

## 6. Tool feedback (nutrition-critical)

- [x] 6.1 Spike: map web pending-approval synthesis onto mobile message parts
- [x] 6.2 Render approve/deny UI for pending tool approvals and submit decisions
- [x] 6.3 Show compact success summaries for nutrition log / hydration tools
- [x] 6.4 Ensure WS/poll paths still surface approvals after send

## 7. Nutrition Log handoff + store docs

- [x] 7.1 Add “Log with photo” on Log nutrition section → navigate Coach + open attach/camera
- [x] 7.2 Update `docs/store-privacy-checklist.md` and privacy copy for camera/photos
- [x] 7.3 Update `docs/open-questions.md` / implementation-plan note for this change
- [x] 7.4 Unit tests for session policy helper and file-part mapping
- [ ] 7.5 Manual device smoke: idle >15m new room; room switch; photo meal log; deep link room
