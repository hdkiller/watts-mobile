import { Text, View } from 'react-native';

export default function CoachScreen() {
  return (
    <View className="flex-1 bg-surface-dark px-6 pt-4">
      <Text className="text-2xl font-semibold text-white">Coach</Text>
      <Text className="mt-2 text-base text-ink-muted">
        Phase 3 will seed chat with today’s plan and recovery context.
      </Text>
    </View>
  );
}
