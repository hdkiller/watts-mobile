import { Stack } from 'expo-router';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

import { SportsSection } from '@/src/features/sports/SportsSection';
import { Colors } from '@/src/theme/colors';

export default function SportsSettingsScreen() {
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
        style={{ flex: 1, backgroundColor: Colors.background }}
      >
        <ScrollView
          className="flex-1 bg-surface-dark"
          contentContainerClassName="px-6 pb-12 pt-4"
        >
          <Text className="text-2xl font-semibold text-white">Sports</Text>
          <Text className="mt-2 text-sm text-ink-muted">
            Lite per-sport thresholds for the field. Full Sport Settings stay on the web.
          </Text>
          <SportsSection />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
