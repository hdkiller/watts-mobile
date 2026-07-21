import { StyleSheet, View } from 'react-native';

import { useThemeColors } from '@/src/theme/useThemeColors';

/**
 * Soft brand wash for auth screens — no new native gradient deps.
 * Keeps first paint non-blank while content settles in.
 */
export function AuthAtmosphere() {
  const theme = useThemeColors();
  const isLight = theme.surface === '#fafafa' || theme.surface === '#ffffff';

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.surface }]} />
      <View
        style={{
          position: 'absolute',
          top: -100,
          right: -80,
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: theme.brand,
          opacity: isLight ? 0.14 : 0.18,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 180,
          left: -120,
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: theme.brandDeep,
          opacity: isLight ? 0.08 : 0.12,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: -40,
          right: 40,
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: theme.brand,
          opacity: isLight ? 0.05 : 0.08,
        }}
      />
    </View>
  );
}
