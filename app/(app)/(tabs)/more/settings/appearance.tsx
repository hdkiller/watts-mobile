import { Stack } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

import { hapticLight } from '@/src/lib/haptics';
import { Colors } from '@/src/theme/colors';
import {
  themePreferenceLabel,
  type ThemePreference,
} from '@/src/theme/themePreference';
import { useThemeColors } from '@/src/theme/useThemeColors';
import { useThemePreference } from '@/src/theme/useThemePreference';

const OPTIONS: {
  value: ThemePreference;
  title: string;
  detail: string;
}[] = [
  {
    value: 'system',
    title: 'System',
    detail: 'Match the device light or dark appearance.',
  },
  {
    value: 'light',
    title: 'Light',
    detail: 'Always use the light theme — better outdoors.',
  },
  {
    value: 'dark',
    title: 'Dark',
    detail: 'Always use the dark theme.',
  },
];

export default function AppearanceSettingsScreen() {
  const theme = useThemeColors();
  const { preference, setPreference } = useThemePreference();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Appearance',
          headerShown: true,
        }}
      />
      <SafeAreaView
        edges={{ bottom: true }}
        style={{ flex: 1, backgroundColor: theme.surface }}
      >
        <ScrollView
          className="flex-1 bg-surface"
          contentContainerClassName="px-6 pb-12 pt-4"
        >
          <Text className="text-2xl font-semibold text-text-primary">Appearance</Text>
          <Text className="mt-2 text-sm text-text-muted">
            Choose how Coach Watts looks on this device. System follows your phone’s setting.
          </Text>

          <View className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
            {OPTIONS.map((option, index) => {
              const selected = preference === option.value;
              const isLast = index === OPTIONS.length - 1;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  className={`px-4 py-4 ${isLast ? '' : 'border-b border-border/80'} active:opacity-80`}
                  onPress={() => {
                    hapticLight();
                    void setPreference(option.value);
                  }}
                >
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="min-w-0 flex-1">
                      <Text className="text-base font-semibold text-text-primary">{option.title}</Text>
                      <Text className="mt-1 text-sm text-text-muted">{option.detail}</Text>
                    </View>
                    <View
                      className="mt-1 h-5 w-5 items-center justify-center rounded-full border"
                      style={{
                        borderColor: selected ? Colors.brand : theme.textMuted,
                        backgroundColor: selected ? Colors.brand : 'transparent',
                      }}
                    >
                      {selected ? <View className="h-2 w-2 rounded-full bg-surface" /> : null}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Text className="mt-4 text-sm text-text-muted">
            Current: {themePreferenceLabel(preference)}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
