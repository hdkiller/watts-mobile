import { describe, expect, it } from 'vitest';

import {
  getFatigueHelp,
  getMoodLabel,
  getSorenessHelp,
  getStressLabel,
  normalizeStressScore,
} from '../wellnessLabels';

describe('wellnessLabels', () => {
  it('maps mood bands', () => {
    expect(getMoodLabel(9)).toBe('Great');
    expect(getMoodLabel(6)).toBe('Good');
    expect(getMoodLabel(4)).toBe('OK');
    expect(getMoodLabel(2)).toBe('Grumpy');
  });

  it('normalizes 0–100 stress before labeling', () => {
    expect(normalizeStressScore(80)).toBe(8);
    expect(getStressLabel(80)).toBe('Extreme');
    expect(getStressLabel(5)).toBe('Average');
  });

  it('uses web fatigue/soreness help copy', () => {
    expect(getFatigueHelp(8)).toBe('Feeling very tired');
    expect(getFatigueHelp(5)).toBe('Normal fatigue');
    expect(getSorenessHelp(8)).toBe('Significant muscle pain');
    expect(getSorenessHelp(5)).toBe('Normal recovery');
  });
});
