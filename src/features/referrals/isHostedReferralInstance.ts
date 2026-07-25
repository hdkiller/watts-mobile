/**
 * Athlete referral share is hosted acquisition only (plus local loopback for
 * Maestro / dev against a local coach-wattz). Custom self-hosted instances hide it.
 */
export function canUseAthleteReferralShare(instanceUrl: string | null | undefined): boolean {
  if (!instanceUrl?.trim()) return false;
  try {
    const host = new URL(instanceUrl).hostname.toLowerCase();
    if (host === 'coachwatts.com' || host === 'www.coachwatts.com') return true;
    // Loopback + Android emulator alias for host machine (Maestro on AVD).
    if (host === 'localhost' || host === '127.0.0.1' || host === '10.0.2.2') return true;
    return false;
  } catch {
    return false;
  }
}
