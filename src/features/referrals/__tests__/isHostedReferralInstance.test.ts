import { describe, expect, it } from 'vitest';

import { canUseAthleteReferralShare } from '../isHostedReferralInstance';

describe('canUseAthleteReferralShare', () => {
  it('allows hosted and local loopback', () => {
    expect(canUseAthleteReferralShare('https://coachwatts.com')).toBe(true);
    expect(canUseAthleteReferralShare('https://www.coachwatts.com/')).toBe(true);
    expect(canUseAthleteReferralShare('http://localhost:3099')).toBe(true);
    expect(canUseAthleteReferralShare('http://127.0.0.1:3099')).toBe(true);
    expect(canUseAthleteReferralShare('http://10.0.2.2:3199')).toBe(true);
  });

  it('blocks custom self-hosted instances', () => {
    expect(canUseAthleteReferralShare('https://coach.example.com')).toBe(false);
    expect(canUseAthleteReferralShare(null)).toBe(false);
    expect(canUseAthleteReferralShare('')).toBe(false);
  });
});
