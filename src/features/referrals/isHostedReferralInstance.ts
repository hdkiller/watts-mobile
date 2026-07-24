/**
 * Athlete referral share is hosted acquisition only (plus local loopback for
 * Maestro / dev against a local coach-wattz). Custom self-hosted instances hide it.
 */
export function canUseAthleteReferralShare(instanceUrl: string | null | undefined): boolean {
  if (!instanceUrl?.trim()) return false;
  try {
    const host = new URL(instanceUrl).hostname.toLowerCase();
    if (host === 'coachwatts.com' || host === 'www.coachwatts.com') return true;
    if (host === 'localhost' || host === '127.0.0.1') return true;
    return false;
  } catch {
    return false;
  }
}
