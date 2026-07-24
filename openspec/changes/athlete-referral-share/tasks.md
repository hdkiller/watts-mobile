## 1. Backend (coach-wattz)

- [x] 1.1 Prisma `referralCode`, `referredByUserId`, `Referral` + migration
- [x] 1.2 `GET /api/referrals/me`, `POST .../regenerate`, `POST /api/referrals/claim`
- [x] 1.3 `/join` via cookie middleware + auth-event / client claim attribution
- [x] 1.4 Web Share modal uses referral `shareUrl`; acquisition `via` analytics

## 2. Mobile (watts-mobile)

- [x] 2.1 Referrals API client + hosted/local gate + Vitest
- [x] 2.2 More → Invite friends screen (QR, copy, Share)
- [x] 2.3 Athlete profile bottom → Invite friends (Today name opens Athlete directly)
- [x] 2.4 Maestro scenario + e2e inventory + product-baseline note
- [x] 2.5 OpenSpec change artifacts

## 3. Verification

- [ ] 3.1 Apply coach-wattz migration on target DB
- [ ] 3.2 Rebuild mobile binary for `expo-clipboard` if needed
- [ ] 3.3 Smoke: A share → B signup → `Referral` ATTRIBUTED
