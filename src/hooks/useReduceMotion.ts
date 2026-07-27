import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** True when the OS asks to minimize non-essential motion. */
export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return reduceMotion;
}

/**
 * Guard value transition for Reduce Motion settings.
 * Returns `reducedValue` when `reduceMotion` is true, otherwise `normalValue`.
 */
export function reduceMotionGuard<T>(normalValue: T, reducedValue: T, reduceMotion: boolean): T {
  return reduceMotion ? reducedValue : normalValue;
}

/**
 * Return animation duration clamped or zeroed when Reduce Motion is active.
 * Useful for timing transitions that should be instantaneous or minimal.
 */
export function reduceMotionDuration(
  normalDuration: number,
  reduceMotion: boolean,
  staticDuration = 0,
): number {
  return reduceMotion ? staticDuration : normalDuration;
}

/**
 * Return transform scale factor guarded against excessive motion.
 * Returns `staticScale` (default 1) when reduceMotion is active.
 */
export function reduceMotionScale(
  normalScale: number,
  reduceMotion: boolean,
  staticScale = 1,
): number {
  return reduceMotion ? staticScale : normalScale;
}
