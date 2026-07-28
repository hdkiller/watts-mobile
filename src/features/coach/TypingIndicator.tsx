import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useReduceMotion } from '@/src/hooks/useReduceMotion';
import { useThemeColors } from '@/src/theme/useThemeColors';

/** Stagger between dots so the three read as a travelling wave, not a single pulse. */
const DOT_DELAYS_MS = [0, 160, 320];
const HALF_CYCLE_MS = 400;
const LIFT_PX = -4;
const REST_OPACITY = 0.35;

function Dot({
  delayMs,
  color,
  reduceMotion = false,
}: {
  delayMs: number;
  color: string;
  reduceMotion?: boolean;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = 0.5;
      return;
    }
    progress.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(1, { duration: HALF_CYCLE_MS, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
          withTiming(0, { duration: HALF_CYCLE_MS, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
        ),
        -1,
      ),
    );
  }, [delayMs, progress, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: REST_OPACITY + progress.value * (1 - REST_OPACITY),
    transform: [{ translateY: progress.value * LIFT_PX }],
  }));

  return (
    <Animated.View
      style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }, animatedStyle]}
    />
  );
}

/** Three bouncing dots shown while the coach response is still streaming. */
export function TypingIndicator() {
  const theme = useThemeColors();
  const reduceMotion = useReduceMotion();

  return (
    <View className="flex-row items-center gap-1" accessibilityLabel="Coach is typing">
      {DOT_DELAYS_MS.map((delayMs) => (
        <Dot key={delayMs} delayMs={delayMs} color={theme.textMuted} reduceMotion={reduceMotion} />
      ))}
    </View>
  );
}
