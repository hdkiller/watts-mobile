## Why

Athletes need a gym-friendly way to invite friends onto Coach Watts. Web already had a marketing share QR without person-to-person attribution; we need durable Athlete A→B tracking so rewards can be enabled later, plus a native surface to show the QR quickly.

## What Changes

- Add coach-wattz athlete referral codes, `Referral` rows, and signup attribution via `via=` + cookie
- Expose `GET/POST /api/referrals/*` for minting/sharing/claiming (track-only; no rewards yet)
- Update web Share Coach Watts modal to encode the personal referral URL
- Add More → Invite friends on mobile (QR, copy, native Share) for hosted/local instances
- Maestro coverage for the invite surface

## Capabilities

### New Capabilities

- `athlete-referral-share`: Stable per-athlete referral share link/QR with A→B attribution on new account create; mobile More invite surface; no reward grant in this change

### Modified Capabilities

- `account-more`: More tab gains Invite friends entry (hosted/local) into the share surface

## Impact

- **coach-wattz**: Prisma `User.referralCode` / `referredByUserId`, `Referral` model, auth `createUser`/`linkAccount` attribution, `/join` via cookie middleware, Share modal
- **watts-mobile**: `src/features/referrals/*`, More `invite` screen, `react-native-qrcode-svg`, `expo-clipboard` (rebuild native binary for clipboard)
- Distinct from coaching invites (`/join/{CODE}` coach↔athlete / team)
