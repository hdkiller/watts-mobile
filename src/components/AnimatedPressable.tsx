import { cssInterop } from 'nativewind';
import type { ComponentProps } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const ReanimatedPressable = Animated.createAnimatedComponent(Pressable);

type AnimatedPressableProps = PressableProps & {
  className?: string;
  entering?: ComponentProps<typeof Animated.View>['entering'];
  exiting?: ComponentProps<typeof Animated.View>['exiting'];
  layout?: ComponentProps<typeof Animated.View>['layout'];
};

/** Pressable with spring scale + opacity press feedback; use instead of `active:opacity-*`. */
function AnimatedPressableBase({
  style,
  onPressIn,
  onPressOut,
  ...rest
}: AnimatedPressableProps) {
  const pressed = useSharedValue(0);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.03 }],
    opacity: 1 - pressed.value * 0.15,
  }));

  return (
    <ReanimatedPressable
      {...rest}
      style={[pressStyle, style]}
      onPressIn={(e) => {
        pressed.value = withTiming(1, { duration: 90 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        pressed.value = withSpring(0, { damping: 20, stiffness: 300 });
        onPressOut?.(e);
      }}
    />
  );
}

export const AnimatedPressable = cssInterop(AnimatedPressableBase, {
  className: 'style',
});
