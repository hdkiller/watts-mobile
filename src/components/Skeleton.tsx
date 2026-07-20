import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, {
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

/** Wrap a skeleton layout so it crossfades out when real content replaces it. */
export function SkeletonScreen({ children }: { children: ReactNode }) {
  return (
    <Animated.View style={{ flex: 1 }} exiting={FadeOut.duration(200)}>
      {children}
    </Animated.View>
  );
}

/** Pulsing placeholder block; size/shape via className (e.g. "h-4 w-32 rounded-lg"). */
export function Skeleton({ className = '' }: { className?: string }) {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.9, { duration: 700 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={animatedStyle}>
      <View className={`rounded-lg bg-border-strong ${className}`} />
    </Animated.View>
  );
}

/** Generic list-screen skeleton: a column of row-sized blocks. */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <SkeletonScreen>
      <View className="flex-1 bg-surface px-6 pt-4">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="mb-3 h-16 rounded-xl" />
        ))}
      </View>
    </SkeletonScreen>
  );
}

/** Detail-screen skeleton: title, meta line, then content blocks. */
export function DetailSkeleton() {
  return (
    <SkeletonScreen>
      <View className="flex-1 bg-surface px-6 pt-4">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="mt-3 h-4 w-1/2" />
        <Skeleton className="mt-8 h-28 rounded-xl" />
        <Skeleton className="mt-4 h-40 rounded-xl" />
      </View>
    </SkeletonScreen>
  );
}

/** Coach chat open: header + alternating bubbles + composer bar. */
export function CoachChatSkeleton() {
  return (
    <SkeletonScreen>
      <View className="flex-1 bg-surface px-4 pt-3">
        <View className="mb-4 flex-row items-center justify-between px-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-16" />
        </View>
        <View className="flex-1 gap-3 px-1">
          <Skeleton className="h-14 w-[72%] self-start rounded-2xl" />
          <Skeleton className="h-20 w-[78%] self-end rounded-2xl" />
          <Skeleton className="h-16 w-[68%] self-start rounded-2xl" />
          <Skeleton className="h-12 w-[60%] self-end rounded-2xl" />
        </View>
        <View className="mt-3 mb-2 flex-row items-center gap-2 px-1 pb-3">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <Skeleton className="h-11 w-11 rounded-xl" />
        </View>
      </View>
    </SkeletonScreen>
  );
}
