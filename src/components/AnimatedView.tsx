import { cssInterop } from 'nativewind';
import Animated from 'react-native-reanimated';

/**
 * `Animated.View` that understands `className`.
 *
 * NativeWind only auto-registers core RN components, so a bare
 * `<Animated.View className="...">` silently drops every class. Use this
 * whenever a node needs both Tailwind classes and entering/exiting/layout
 * animations.
 */
export const AnimatedView = cssInterop(Animated.View, { className: 'style' });
