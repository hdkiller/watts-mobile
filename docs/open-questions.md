# Open Questions

Resolve before or during Phase 0–1. Record decisions in the table at the bottom.

| # | Question | Options / notes | Status |
|---|----------|-----------------|--------|
| 1 | **First-party vs developer OAuth app** | Hard-coded first-party (`isTrusted`) vs registered like third-party apps | Open |
| 2 | **Chat authorization** | Which scope (or first-party exemption) covers mobile chat send/stream? | Open |
| 3 | **Modify recommendation UX** | Inline choices on Today vs dedicated detail screen | Open |
| 4 | **Hosted vs self-hosted distribution** | Single App Store binary + instance picker vs separate branded builds | Open |
| 5 | **Streaming chat** | SSE / WebSocket / polling under mobile networks | Open |
| 6 | **Companion aggregate API** | New `/api/mobile/*` vs document composition of existing endpoints | Open |
| 7 | **App package location** | Expo at repo root (this repo) vs later sync with coach-wattz `clients/mobile` | Lean: **this repo is the app**; coach-wattz keeps API/docs | Proposed |
| 8 | **Expo channel** | Managed Expo vs early dev client (needed for HealthKit in v1.5) | Open — start managed; add dev client when native modules land |

## Decision log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-14 | Companion, not full port | Daily athlete loop; web keeps depth (baseline PR) |
| 2026-07-14 | Expo + TypeScript | Align with Nuxt/TS team; OTA-friendly |
| 2026-07-14 | Four-tab IA: Today / Log / Coach / More | One job per tab |
| 2026-07-14 | OAuth PKCE + Bearer | Existing IdP; cookies are web-only |
| 2026-07-19 | Implementation lives in `watts-mobile` | Separate client repo; coach-wattz remains API/product host |
| 2026-07-19 | Production instance URL is `https://coachwatts.com` | Not `app.coachwatts.com`; wired in `.env.example` / `app.json` extra |
| 2026-07-19 | Compose Today from existing APIs first | `/api/mobile/today` BFF deferred; accept uses Bearer via requireAuth |

When a row above is decided, move it here and update [product-baseline.md](./product-baseline.md) / [implementation-plan.md](./implementation-plan.md) if scope changes.
