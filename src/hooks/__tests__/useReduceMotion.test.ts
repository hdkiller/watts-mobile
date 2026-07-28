import { describe, expect, it } from 'vitest';

import {
  reduceMotionDuration,
  reduceMotionGuard,
  reduceMotionScale,
} from '@/src/hooks/useReduceMotion';

describe('useReduceMotion helpers', () => {
  describe('reduceMotionGuard', () => {
    it('returns normal value when reduceMotion is false', () => {
      expect(reduceMotionGuard(100, 0, false)).toBe(100);
      expect(reduceMotionGuard('animated', 'static', false)).toBe('animated');
    });

    it('returns reduced value when reduceMotion is true', () => {
      expect(reduceMotionGuard(100, 0, true)).toBe(0);
      expect(reduceMotionGuard('animated', 'static', true)).toBe('static');
    });
  });

  describe('reduceMotionDuration', () => {
    it('returns normal duration when reduceMotion is false', () => {
      expect(reduceMotionDuration(300, false)).toBe(300);
    });

    it('returns zero or fallback duration when reduceMotion is true', () => {
      expect(reduceMotionDuration(300, true)).toBe(0);
      expect(reduceMotionDuration(300, true, 50)).toBe(50);
    });
  });

  describe('reduceMotionScale', () => {
    it('returns normal scale when reduceMotion is false', () => {
      expect(reduceMotionScale(0.95, false)).toBe(0.95);
    });

    it('returns static scale (1 or custom) when reduceMotion is true', () => {
      expect(reduceMotionScale(0.95, true)).toBe(1);
      expect(reduceMotionScale(0.95, true, 0.98)).toBe(0.98);
    });
  });
});
