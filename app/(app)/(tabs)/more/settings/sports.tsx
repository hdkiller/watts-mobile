import { Stack } from 'expo-router';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

import { SportsSection } from '@/src/features/sports/SportsSection';
import { useThemeColors } from '@/src/theme/useThemeColors';

export default function SportsSettingsScreen() {
  const theme = useThemeColors();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Sports',
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
          <Text className="text-sm text-text-muted">
            Lite per-sport thresholds for the field. Full Sport Settings stay on the web.
          </Text>
          <SportsSection />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
