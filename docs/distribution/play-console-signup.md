# Play Console signup walkthrough (Watt Mind Kft.)

Guided path for **Organization** enrollment. Task tracker: [tasks/010-google-play-developer-account.md](./tasks/010-google-play-developer-account.md).  
Official refs: [Account type](https://support.google.com/googleplay/android-developer/answer/13634885) · [Required information](https://support.google.com/googleplay/android-developer/answer/13628312).

## Before you click “Get started”

Gather these (use **exact** legal spelling of **Watt Mind Kft.** everywhere — payments profile, D‑U‑N‑S, and Play must match):

| Item | For Watt Mind |
|------|----------------|
| Google account that will **own** Play Console | Prefer Workspace: `deploy@watt-mind.com` (same family as Apple Account Holder). Not personal Gmail as owner. |
| D‑U‑N‑S (9 digits) | Required for Organization. Reuse the one from Apple enrollment if it’s for Watt Mind Kft.; else request free via [Dun & Bradstreet](https://www.dnb.com/duns-number/lookup.html) / Google’s D‑U‑N‑S helper in the flow. |
| Organization website | `https://watt-mind.com` and/or `https://coachwatts.com` (site you control; Google may ask you to verify ownership later). |
| Organization phone | Real company number (may match public registry / D‑U‑N‑S). |
| Organization address | Legal registered address of the Kft. |
| Contact email / phone (Google → you) | Monitored company contacts, e.g. `deploy@watt-mind.com` + your mobile. |
| Developer email / phone (shown on Play) | Public-facing, e.g. `support@coachwatts.com` + company phone — **not** a random personal Gmail. |
| Payment method | Card/bank that can pay the one-time Play registration fee (~USD $25; currency varies by country). |
| 2-Step Verification | Enabled on the owner Google account before/during signup. |

**Do not** choose Personal. You cannot convert Personal → Organization later without creating a new account and transferring apps.

## Step-by-step

### 1. Sign in as the owner account

1. Open an incognito/private window (avoids mixing with personal Google sessions).
2. Sign in as `deploy@watt-mind.com` (or your chosen Workspace owner).
3. Go to [play.google.com/console/signup](https://play.google.com/console/signup).

### 2. Account type → Organization

1. When asked personal vs organization, choose **Organization** / business.
2. Developer name (public store brand): **Coach Watts** or **Watt Mind** — this can differ from the legal name and is changeable later. Product brand on store is usually **Coach Watts**.

### 3. Link / create Google payments profile (Organization)

1. Create or select an **organization** payments profile.
2. Enter **D‑U‑N‑S**, legal name **Watt Mind Kft.**, address, phone — must match Dun & Bradstreet.
3. Pay the registration fee when prompted.
4. Complete any OTP / identity checks Google shows for the payments profile.

Mismatch between D‑U‑N‑S legal name/address and payments profile is the #1 rejection cause. Copy from the same company extract you used for Apple.

### 4. Developer account contact + public developer info

Fill and verify via OTP:

| Field | Suggested |
|-------|-----------|
| Contact name | Your legal name (authorized rep) |
| Contact email | `deploy@watt-mind.com` (Google emails here; not shown on store) |
| Contact phone | Your mobile |
| Developer email (public) | `support@coachwatts.com` or `hello@watt-mind.com` |
| Developer phone (public) | Company phone |
| Organization website | `https://watt-mind.com` |

### 5. Finish signup + verification queue

1. Accept Play Developer Distribution Agreement.
2. Land in Play Console. Complete any **identity verification** / document upload banners (company registry extract, proof of address, authorized representative ID — whatever Google requests).
3. Watch `deploy@` (and spam) for “we need more info” or approval mail.
4. Turn on 2-Step Verification if not already (Play will nag / eventually restrict without it).

### 6. After the org account is usable

1. Invite `hdkiller@gmail.com` (or Workspace user) as **Admin** — Settings → Users and permissions.
2. Prepend outcome + owner email (no passwords) to [log.md](./log.md).
3. Mark [task 010](./tasks/010-google-play-developer-account.md) done; continue [011](./tasks/011-play-console-app.md) (create app `com.coachwatts.app`).

**Status (2026-07-21):** Watt Mind Kft. Organization account **approved**. Developer ID `7883910200930974301` — [app list](https://play.google.com/console/u/1/developers/7883910200930974301/app-list). Task [010](./tasks/010-google-play-developer-account.md) done; next is [011](./tasks/011-play-console-app.md).

## If you’re stuck

| Symptom | What to do |
|---------|------------|
| No D‑U‑N‑S yet | Pause signup; request D‑U‑N‑S first (can take days–weeks). Reuse Apple’s if already assigned to Watt Mind Kft. |
| Name/address mismatch | Fix D&B or payments profile so they match exactly; don’t invent a “marketing” legal name. |
| Already have a Personal Play account on Gmail | Leave it; create a **new** Organization account on `deploy@`. Don’t publish Coach Watts on the personal one. |
| Website verification | Be ready to prove you control watt-mind.com / coachwatts.com (DNS or Search Console) if asked. |

## Out of scope for this walkthrough

Creating the app, Data safety, AAB upload — tasks [011](./tasks/011-play-console-app.md)–[017](./tasks/017-play-production-submit.md).
